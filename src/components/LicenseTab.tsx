import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLicense } from '@/contexts/LicenseContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, CheckCircle, XCircle, Clock } from 'lucide-react';

export const LicenseTab = () => {
  const { license, refreshLicense } = useLicense();
  const [licenseKey, setLicenseKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleValidateLicense = async () => {
    if (!licenseKey.trim()) {
      toast.error('Veuillez entrer une clé de licence');
      return;
    }

    setIsValidating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Vous devez être connecté');
        return;
      }

      const { data, error } = await supabase.functions.invoke('verify-user-license', {
        body: { licenseKey: licenseKey.trim() },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error validating license:', error);
        toast.error('Erreur lors de la validation de la licence');
        return;
      }

      if (data.valid) {
        toast.success('Licence activée avec succès!');
        setLicenseKey('');
        await refreshLicense();
      } else {
        toast.error(data.message || 'Licence invalide');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la validation de la licence');
    } finally {
      setIsValidating(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'premium':
        return 'bg-gradient-to-r from-amber-500 to-yellow-500';
      case 'pro':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'standard':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      default:
        return 'bg-muted';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Statut de la licence
          </CardTitle>
          <CardDescription>
            Gérez votre licence pour accéder à toutes les fonctionnalités
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {license ? (
            <div className="space-y-4">
              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700 dark:text-green-300">
                  Votre licence est active et valide
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div>
                    <p className="text-sm text-muted-foreground">Type de licence</p>
                    <Badge className={`${getLevelColor(license.license_level)} text-white mt-1`}>
                      {license.license_level.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div>
                    <p className="text-sm text-muted-foreground">Clé de licence</p>
                    <p className="font-mono mt-1">{license.license_key}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Date d'expiration
                    </p>
                    <p className="mt-1">{formatDate(license.expires_at)}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  Voulez-vous activer une nouvelle licence ?
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Entrez votre nouvelle clé de licence"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    disabled={isValidating}
                  />
                  <Button
                    onClick={handleValidateLicense}
                    disabled={isValidating}
                  >
                    {isValidating ? 'Validation...' : 'Mettre à jour'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert className="border-orange-500/50 bg-orange-500/10">
                <XCircle className="h-4 w-4 text-orange-500" />
                <AlertDescription className="text-orange-700 dark:text-orange-300">
                  Aucune licence active. Activez une licence pour accéder à toutes les fonctionnalités.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <label className="text-sm font-medium">Clé de licence</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Entrez votre clé de licence"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    disabled={isValidating}
                  />
                  <Button
                    onClick={handleValidateLicense}
                    disabled={isValidating}
                  >
                    {isValidating ? 'Validation...' : 'Activer'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Format: MEDIA-PLUS-XXXX-YYYY-ZZZZ
                </p>
              </div>

              <div className="pt-4 border-t space-y-3">
                <h4 className="font-semibold text-sm">Fonctionnalités sans licence :</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Accès limité à la bibliothèque</li>
                  <li>Impossible de diffuser du contenu</li>
                  <li>Pas d'accès aux flux en direct</li>
                </ul>
                
                <h4 className="font-semibold text-sm pt-2">Avec une licence active :</h4>
                <ul className="text-sm space-y-1 list-disc list-inside text-green-600 dark:text-green-400">
                  <li>Accès complet à toutes les fonctionnalités</li>
                  <li>Diffusion de contenus télévisés</li>
                  <li>Gestion des flux en direct</li>
                  <li>Bibliothèque média illimitée</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};