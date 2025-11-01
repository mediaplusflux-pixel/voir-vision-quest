import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface License {
  id: string;
  license_key: string;
  license_level: string;
  expires_at: string;
  is_active: boolean;
}

interface LicenseContextType {
  license: License | null;
  isLoading: boolean;
  hasValidLicense: boolean;
  refreshLicense: () => Promise<void>;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export const LicenseProvider = ({ children }: { children: ReactNode }) => {
  const [license, setLicense] = useState<License | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkLicense = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLicense(null);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_licenses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching license:', error);
      }

      // Check if license is expired
      if (data) {
        const expiresAt = new Date(data.expires_at);
        const now = new Date();
        
        if (expiresAt < now) {
          // License expired, deactivate it
          await supabase
            .from('user_licenses')
            .update({ is_active: false })
            .eq('id', data.id);
          setLicense(null);
        } else {
          setLicense(data);
        }
      } else {
        setLicense(null);
      }
    } catch (error) {
      console.error('Error checking license:', error);
      setLicense(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkLicense();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkLicense();
    });

    return () => subscription.unsubscribe();
  }, []);

  const hasValidLicense = license !== null && license.is_active;

  const refreshLicense = async () => {
    setIsLoading(true);
    await checkLicense();
  };

  return (
    <LicenseContext.Provider value={{ license, isLoading, hasValidLicense, refreshLicense }}>
      {children}
    </LicenseContext.Provider>
  );
};

export const useLicense = () => {
  const context = useContext(LicenseContext);
  if (context === undefined) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }
  return context;
};