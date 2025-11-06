import { Plus, Trash2, Settings, Copy, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import { useChannelBroadcast } from "@/hooks/useChannelBroadcast";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

const Chaines = () => {
  const { broadcasts, isLoading, startBroadcast, stopBroadcast, getStatus, configureTransmission } = useChannelBroadcast();
  const { toast } = useToast();
  const [transmissionConfig, setTransmissionConfig] = useState<Record<string, { protocol: string; url: string }>>({});

  const channels = [
    { id: "zeedboda", name: "ZEEDBODA" },
  ];

  useEffect(() => {
    // Poll status for all channels
    const interval = setInterval(() => {
      channels.forEach(channel => {
        getStatus(channel.id);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: `${label} copié dans le presse-papier`,
    });
  };

  const handleTransmission = async (channelId: string) => {
    const config = transmissionConfig[channelId];
    if (!config?.protocol || !config?.url) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs de transmission",
        variant: "destructive",
      });
      return;
    }
    await configureTransmission(channelId, config.protocol, config.url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-foreground text-3xl font-bold">Gestion des Chaînes</h1>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle Chaîne
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {channels.map((channel) => {
            const broadcast = broadcasts[channel.id];
            const isLive = broadcast?.status === 'live';
            const isStarting = broadcast?.status === 'starting';
            const isStopping = broadcast?.status === 'stopping';

            return (
              <Card key={channel.id} className="bg-card border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-foreground text-2xl font-bold">{channel.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                      <span className="text-muted-foreground text-sm">
                        {isLive ? 'EN DIRECT' : isStarting ? 'Démarrage...' : isStopping ? 'Arrêt...' : 'Hors ligne'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="icon">
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" size="icon">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Broadcast Links Section */}
                {isLive && broadcast && (
                  <Card className="bg-background/50 border-primary/20 p-4 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Radio className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-semibold">Liens de diffusion</h3>
                    </div>
                    <div className="space-y-3">
                      {broadcast.hlsUrl && (
                        <div className="space-y-1">
                          <Label className="text-xs">URL HLS (.m3u8)</Label>
                          <div className="flex gap-2">
                            <Input
                              value={broadcast.hlsUrl}
                              readOnly
                              className="font-mono text-xs"
                            />
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => copyToClipboard(broadcast.hlsUrl!, 'Lien HLS')}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                      {broadcast.iframeUrl && (
                        <div className="space-y-1">
                          <Label className="text-xs">Code iframe</Label>
                          <div className="flex gap-2">
                            <Input
                              value={`<iframe src="${broadcast.iframeUrl}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`}
                              readOnly
                              className="font-mono text-xs"
                            />
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => copyToClipboard(`<iframe src="${broadcast.iframeUrl}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`, 'Code iframe')}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                <Tabs defaultValue="rtmp" className="w-full">
                  <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="rtmp">RTMP</TabsTrigger>
                    <TabsTrigger value="iframe">iframe</TabsTrigger>
                    <TabsTrigger value="transmission">TNT</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="rtmp" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor={`rtmp-url-${channel.id}`}>URL du serveur RTMP</Label>
                      <Input 
                        id={`rtmp-url-${channel.id}`}
                        placeholder="rtmp://a.rtmp.youtube.com/live2" 
                        className="font-mono text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`stream-key-${channel.id}`}>Clé de diffusion</Label>
                      <Input 
                        id={`stream-key-${channel.id}`}
                        type="password"
                        placeholder="xxxx-xxxx-xxxx-xxxx" 
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Label htmlFor={`auto-start-${channel.id}`}>Démarrage automatique</Label>
                      <Switch id={`auto-start-${channel.id}`} />
                    </div>

                    <div className="pt-2 space-y-2">
                      <div className="text-sm text-muted-foreground">Plateformes rapides:</div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">YouTube</Button>
                        <Button variant="outline" size="sm" className="flex-1">Twitch</Button>
                        <Button variant="outline" size="sm" className="flex-1">Facebook</Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="iframe" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor={`iframe-url-${channel.id}`}>URL iframe</Label>
                      <Input 
                        id={`iframe-url-${channel.id}`}
                        placeholder="https://youtube.com/embed/..." 
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`iframe-width-${channel.id}`}>Dimensions</Label>
                      <div className="flex gap-2">
                        <Input 
                          id={`iframe-width-${channel.id}`}
                          placeholder="1920" 
                          className="flex-1"
                        />
                        <span className="flex items-center text-muted-foreground">×</span>
                        <Input 
                          placeholder="1080" 
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Label htmlFor={`allow-fullscreen-${channel.id}`}>Plein écran autorisé</Label>
                      <Switch id={`allow-fullscreen-${channel.id}`} defaultChecked />
                    </div>
                  </TabsContent>

                  <TabsContent value="transmission" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Protocole de transmission</Label>
                      <Select
                        value={transmissionConfig[channel.id]?.protocol || ''}
                        onValueChange={(value) => setTransmissionConfig(prev => ({
                          ...prev,
                          [channel.id]: { ...prev[channel.id], protocol: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un protocole" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ip">Diffusion IP (HTTP)</SelectItem>
                          <SelectItem value="udp">UDP</SelectItem>
                          <SelectItem value="rtmp">RTMP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`transmission-url-${channel.id}`}>URL de destination</Label>
                      <Input 
                        id={`transmission-url-${channel.id}`}
                        placeholder={
                          transmissionConfig[channel.id]?.protocol === 'ip' ? 'http://192.168.1.100:8080' :
                          transmissionConfig[channel.id]?.protocol === 'udp' ? 'udp://192.168.1.100:1234' :
                          transmissionConfig[channel.id]?.protocol === 'rtmp' ? 'rtmp://tnt.example.com/live/key' :
                          'Sélectionnez d\'abord un protocole'
                        }
                        className="font-mono text-sm"
                        value={transmissionConfig[channel.id]?.url || ''}
                        onChange={(e) => setTransmissionConfig(prev => ({
                          ...prev,
                          [channel.id]: { ...prev[channel.id], url: e.target.value }
                        }))}
                      />
                    </div>

                    <Button 
                      onClick={() => handleTransmission(channel.id)}
                      className="w-full"
                      disabled={!transmissionConfig[channel.id]?.protocol || !transmissionConfig[channel.id]?.url || isLoading}
                    >
                      Configurer la transmission TNT
                    </Button>

                    <div className="pt-2 space-y-2 text-sm text-muted-foreground">
                      <p>ℹ️ Exemples d'URL :</p>
                      <ul className="list-disc list-inside space-y-1 pl-2">
                        <li>IP: http://192.168.1.100:8080</li>
                        <li>UDP: udp://192.168.1.100:1234</li>
                        <li>RTMP: rtmp://tnt.example.com/live/key</li>
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2 mt-6">
                  <Button 
                    className="flex-1"
                    onClick={() => isLive ? stopBroadcast(channel.id) : startBroadcast(channel.id, 'playlist')}
                    disabled={isLoading || isStarting || isStopping}
                  >
                    {isStarting ? 'Démarrage...' : isStopping ? 'Arrêt...' : isLive ? 'Arrêter' : 'Démarrer'} la diffusion
                  </Button>
                  <Button variant="secondary" className="flex-1" disabled={!isLive}>
                    Tester la sortie
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Chaines;
