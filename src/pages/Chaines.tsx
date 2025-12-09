import { useState } from "react";
import { Play, Copy, Radio, Users, Clock, Activity, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import ChannelCard from "@/components/ChannelCard";
import CreateChannelDialog from "@/components/CreateChannelDialog";
import { useChannels, type Channel } from "@/hooks/useChannels";
import { useChannelBroadcast } from "@/hooks/useChannelBroadcast";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Chaines = () => {
  const { channels, isLoading: channelsLoading, createChannel, deleteChannel, updateChannel } = useChannels();
  const { broadcast, isLoading, startBroadcast, stopBroadcast } = useChannelBroadcast();
  const { toast } = useToast();
  const [channelToDelete, setChannelToDelete] = useState<string | null>(null);

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

  const handleDeleteChannel = async () => {
    if (channelToDelete) {
      await deleteChannel(channelToDelete);
      setChannelToDelete(null);
    }
  };

  const handleEditChannel = (channel: Channel) => {
    // For now, just show a toast - could implement a full edit dialog later
    toast({
      title: "Modification",
      description: "Fonctionnalité de modification à venir",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-foreground text-3xl font-bold">Chaînes</h1>
            <p className="text-muted-foreground mt-1">Gérez vos chaînes et leurs liens de diffusion</p>
          </div>
          <div className="flex items-center gap-3">
            <CreateChannelDialog onCreate={createChannel} />
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Chaînes</CardTitle>
              <Tv className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{channels.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Total configurées</p>
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

        {/* Channels List */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Tv className="h-5 w-5" />
            Mes chaînes
          </h2>
          
          {channelsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : channels.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Tv className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune chaîne</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Créez votre première chaîne pour générer des liens de diffusion
                </p>
                <CreateChannelDialog onCreate={createChannel} />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {channels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  onDelete={(id) => setChannelToDelete(id)}
                  onEdit={handleEditChannel}
                />
              ))}
            </div>
          )}
        </div>

        {/* Legacy Output Links Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Diffusion en direct
            </CardTitle>
            <CardDescription>
              Démarrez une diffusion pour générer les liens de lecture
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
              <Label>URL IP HTTP (.m3u8)</Label>
              <div className="flex gap-2">
                <Input
                  value={broadcast?.ipHttpUrl || 'Démarrez la diffusion pour obtenir le lien'}
                  readOnly
                  className="font-mono text-sm bg-muted"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => broadcast?.ipHttpUrl && copyToClipboard(broadcast.ipHttpUrl, 'Lien IP HTTP')}
                  disabled={!broadcast?.ipHttpUrl}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!channelToDelete} onOpenChange={() => setChannelToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette chaîne ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les liens de sortie RTMP et HLS seront également supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteChannel} className="bg-destructive hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Chaines;
