import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  user: User | null;
  session: Session | null;
  validateKey: (key: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Prevent double initialization
    if (initialized) return;

    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get the initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          setIsLoading(false);
          setInitialized(true);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        if (mounted) {
          setIsLoading(false);
          setInitialized(true);
        }
      }
    };

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        // Only update if mounted and after initial load
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          // If we receive an auth event and still loading, mark as done
          if (isLoading) {
            setIsLoading(false);
            setInitialized(true);
          }
        }
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialized, isLoading]);

  const getMachineId = useCallback(() => {
    let machineId = localStorage.getItem('machine_id');
    if (!machineId) {
      machineId = crypto.randomUUID();
      localStorage.setItem('machine_id', machineId);
    }
    return machineId;
  }, []);

  const validateKey = useCallback(async (key: string): Promise<{ success: boolean; message: string }> => {
    try {
      const machineId = getMachineId();
      
      const { data, error } = await supabase.functions.invoke('validate-activation-key', {
        body: { key, machineId, ipAddress: '' }
      });

      if (error) {
        console.error('Supabase error:', error);
        return { success: false, message: 'Erreur de validation' };
      }

      if (data?.valid) {
        localStorage.setItem('activation_key_id', data.keyId);
        localStorage.setItem('activation_expires_at', data.expiresAt);
        return { success: true, message: data.message };
      }

      return { success: false, message: data?.message || 'Clé invalide' };
    } catch (error) {
      console.error('Validation error:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }, [getMachineId]);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('activation_key_id');
      localStorage.removeItem('activation_expires_at');
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  // Derive isAuthenticated from session
  const isAuthenticated = !!session?.user;
  const userId = session?.user?.id ?? null;

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      userId, 
      user, 
      session, 
      validateKey, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
