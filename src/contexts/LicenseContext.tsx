import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface License {
  license_key: string;
  license_level: string;
  expires_at: string;
  is_active: boolean;
  validated_at?: string;
}

interface LicenseContextType {
  license: License | null;
  isLoading: boolean;
  hasValidLicense: boolean;
  refreshLicense: () => Promise<void>;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);
const LICENSE_STORAGE_KEY = 'media_plus_license';

export const LicenseProvider = ({ children }: { children: ReactNode }) => {
  const [license, setLicense] = useState<License | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkLicense = async () => {
    try {
      // Récupérer la licence depuis localStorage
      const storedLicense = localStorage.getItem(LICENSE_STORAGE_KEY);
      
      if (!storedLicense) {
        setLicense(null);
        setIsLoading(false);
        return;
      }

      const licenseData: License = JSON.parse(storedLicense);

      // Vérifier si la licence est expirée
      const expiresAt = new Date(licenseData.expires_at);
      const now = new Date();
      
      if (expiresAt < now) {
        // Licence expirée
        localStorage.removeItem(LICENSE_STORAGE_KEY);
        setLicense(null);
      } else {
        setLicense(licenseData);
      }
    } catch (error) {
      console.error('Error checking license:', error);
      setLicense(null);
      localStorage.removeItem(LICENSE_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkLicense();
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