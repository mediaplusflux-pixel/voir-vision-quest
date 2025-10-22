import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  validateKey: (key: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Check if already authenticated
    const keyId = localStorage.getItem('activation_key_id');
    const expiresAt = localStorage.getItem('activation_expires_at');
    
    if (keyId && expiresAt) {
      const expires = new Date(expiresAt);
      if (expires > new Date()) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('activation_key_id');
        localStorage.removeItem('activation_expires_at');
      }
    }
    
    setIsLoading(false);
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
      
      // Import Supabase dynamically to avoid initialization errors
      const { supabase } = await import('@/integrations/supabase/client');
      
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

  const logout = () => {
    localStorage.removeItem('activation_key_id');
    localStorage.removeItem('activation_expires_at');
    setIsAuthenticated(false);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, userId, validateKey, logout }}>
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
