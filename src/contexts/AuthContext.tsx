import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  user: User | null;
  session: Session | null;
  validateKey: (key: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setUserId(session?.user?.id ?? null);
        setIsAuthenticated(!!session);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setUserId(session?.user?.id ?? null);
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getMachineId = () => {
    let machineId = localStorage.getItem('machine_id');
    if (!machineId) {
      machineId = crypto.randomUUID();
      localStorage.setItem('machine_id', machineId);
    }
    return machineId;
  };

  const validateKey = async (key: string): Promise<{ success: boolean; message: string }> => {
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
        setIsAuthenticated(true);
        return { success: true, message: data.message };
      }

      return { success: false, message: data?.message || 'Clé invalide' };
    } catch (error) {
      console.error('Validation error:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('activation_key_id');
    localStorage.removeItem('activation_expires_at');
    setIsAuthenticated(false);
    setUserId(null);
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, userId, user, session, validateKey, logout }}>
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
