import { Play, Copy, Radio, Users, Clock, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import { useChannelBroadcast } from "@/hooks/useChannelBroadcast";
import { useToast } from "@/hooks/use-toast";

const Chaines = () => {
  const { broadcast, isLoading, startBroadcast, stopBroadcast } = useChannelBroadcast();
  const { toast } = useToast();

  const isLive = broadcast?.status === 'live';
  const isStarting = broadcast?.status === 'starting';
  const isStopping = broadcast?.status === 'stopping';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: `${label} copié dans le presse-papier`,
    });
  };

  const handleBroadcastToggle = () => {
    if (isLive) {
      stopBroadcast();
    } else {
      startBroadcast();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-foreground text-3xl font-bold">Tableau de bord</h1>
            <p className="text-muted-foreground mt-1">Statistiques et diffusion de votre chaîne</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isLive ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'}`}>
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
              <span className="text-sm font-medium">{isLive ? 'EN DIRECT' : 'Hors ligne'}</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Statut</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLive ? 'Actif' : isStarting ? 'Démarrage...' : isStopping ? 'Arrêt...' : 'Inactif'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isLive ? 'Diffusion en cours' : 'En attente de diffusion'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Spectateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{broadcast?.viewers || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Connectés actuellement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Durée</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{broadcast?.duration || '00:00:00'}</div>
              <p className="text-xs text-muted-foreground mt-1">Temps de diffusion</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Bitrate</CardTitle>
              <Radio className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{broadcast?.bitrate || '0'} kbps</div>
              <p className="text-xs text-muted-foreground mt-1">Débit actuel</p>
            </CardContent>
          </Card>
        </div>

        {/* Output Links Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Liens de sortie
            </CardTitle>
            <CardDescription>
              Copiez ces liens pour partager votre diffusion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>URL HLS (.m3u8)</Label>
              <div className="flex gap-2">
                <Input
                  value={broadcast?.hlsUrl || 'Démarrez la diffusion pour obtenir le lien'}
                  readOnly
                  className="font-mono text-sm bg-muted"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => broadcast?.hlsUrl && copyToClipboard(broadcast.hlsUrl, 'Lien HLS')}
                  disabled={!broadcast?.hlsUrl}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>URL du lecteur</Label>
              <div className="flex gap-2">
                <Input
                  value={broadcast?.playerUrl || 'Démarrez la diffusion pour obtenir le lien'}
                  readOnly
                  className="font-mono text-sm bg-muted"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => broadcast?.playerUrl && copyToClipboard(broadcast.playerUrl, 'URL du lecteur')}
                  disabled={!broadcast?.playerUrl}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Code iframe</Label>
              <div className="flex gap-2">
                <Input
                  value={broadcast?.iframeCode || 'Démarrez la diffusion pour obtenir le code'}
                  readOnly
                  className="font-mono text-sm bg-muted"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => broadcast?.iframeCode && copyToClipboard(broadcast.iframeCode, 'Code iframe')}
                  disabled={!broadcast?.iframeCode}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Start/Stop Broadcast Button */}
            <div className="pt-4 border-t">
              <Button 
                size="lg"
                className={`w-full gap-2 ${isLive ? 'bg-destructive hover:bg-destructive/90' : ''}`}
                onClick={handleBroadcastToggle}
                disabled={isLoading || isStarting || isStopping}
              >
                <Play className={`w-5 h-5 ${isLive ? 'hidden' : ''}`} />
                {isStarting ? 'Démarrage en cours...' : isStopping ? 'Arrêt en cours...' : isLive ? 'Arrêter la diffusion' : 'Démarrer la diffusion'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chaines;