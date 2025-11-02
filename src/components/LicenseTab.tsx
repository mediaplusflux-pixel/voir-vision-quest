import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Check, X } from "lucide-react";

const LICENSE_STORAGE_KEY = 'media_plus_license';

interface License {
  license_key: string;
  license_level: string;
  expires_at: string;
  is_active: boolean;
  validated_at?: string;
}

const LicenseTab = () => {
  const [licenseKey, setLicenseKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [license, setLicense] = useState<License | null>(() => {
    const stored = localStorage.getItem(LICENSE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const { toast } = useToast();

  const handleValidateLicense = async () => {
    if (!licenseKey.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une clé de licence",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);

    try {
      const { data, error } = await supabase.functions.invoke('verify-user-license', {
        body: { license_key: licenseKey },
      });

      if (error) throw error;

      if (data.valid) {
        const licenseData: License = {
          license_key: licenseKey,
          license_level: data.license_level,
          expires_at: data.expires_at,
          is_active: true,
          validated_at: new Date().toISOString(),
        };

        // Stocker dans localStorage
        localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(licenseData));
        setLicense(licenseData);

        toast({
          title: "Licence activée",
          description: `Votre licence ${data.license_level} a été activée avec succès`,
        });

        setLicenseKey("");
      } else {
        toast({
          title: "Licence invalide",
          description: data.message || "Cette clé de licence n'est pas valide",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('License validation error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de vérifier la licence",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveLicense = () => {
    localStorage.removeItem(LICENSE_STORAGE_KEY);
    setLicense(null);
    toast({
      title: "Licence retirée",
      description: "La licence a été retirée de cet appareil",
    });
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'premium':
        return 'bg-yellow-500';
      case 'pro':
        return 'bg-blue-500';
      case 'standard':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isExpired = license ? new Date(license.expires_at) < new Date() : false;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Licence</CardTitle>
        <CardDescription>
          Gérez votre clé de licence pour accéder aux fonctionnalités du site
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {license && !isExpired ? (
          <div className="space-y-4">
            <Alert className="bg-green-500/10 border-green-500">
              <Check className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-500">
                Licence active - Vous avez accès à toutes les fonctionnalités
              </AlertDescription>
            </Alert>

            <div className="space-y-3 p-4 border rounded-lg bg-card">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Niveau</span>
                <Badge className={getLevelColor(license.license_level)}>
                  {license.license_level}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Clé</span>
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {license.license_key}
                </code>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Expire le</span>
                <span className="text-sm">{formatDate(license.expires_at)}</span>
              </div>

              {license.validated_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Validée le</span>
                  <span className="text-sm">{formatDate(license.validated_at)}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Mettre à jour la licence</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Nouvelle clé de licence"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  disabled={isValidating}
                />
                <Button onClick={handleValidateLicense} disabled={isValidating}>
                  {isValidating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Validation...
                    </>
                  ) : (
                    "Mettre à jour"
                  )}
                </Button>
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleRemoveLicense}
                className="w-full mt-2"
              >
                Retirer la licence
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {isExpired && (
              <Alert variant="destructive">
                <X className="h-4 w-4" />
                <AlertDescription>
                  Votre licence a expiré. Veuillez entrer une nouvelle clé.
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <AlertDescription>
                Vous consultez le site en mode gratuit. Entrez une clé de licence pour débloquer toutes les fonctionnalités.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <p className="text-sm font-medium">Entrer une clé de licence</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Votre clé de licence"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  disabled={isValidating}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleValidateLicense();
                    }
                  }}
                />
                <Button onClick={handleValidateLicense} disabled={isValidating}>
                  {isValidating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Validation...
                    </>
                  ) : (
                    "Valider"
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
              <p className="text-sm font-medium">Avec une licence, vous pouvez :</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Gérer vos chaînes de diffusion
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Uploader des médias dans la bibliothèque
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Configurer la grille de programmes
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Diffuser vers des émetteurs TNT
                </li>
              </ul>

              <p className="text-sm font-medium mt-4">Sans licence :</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-500" />
                  Visualiser l'antenne en direct
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-500" />
                  Consulter les informations publiques
                </li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LicenseTab;
