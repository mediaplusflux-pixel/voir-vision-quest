import { Plus, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import Header from "@/components/Header";

const Chaines = () => {
  const channels = [
    { id: 1, name: "CONFÉRENCE", status: "live", output: "RTMP" },
    { id: 2, name: "INTRO", status: "offline", output: "iframe" },
  ];

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
          {channels.map((channel) => (
            <Card key={channel.id} className="bg-card border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-foreground text-2xl font-bold">{channel.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${channel.status === 'live' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                    <span className="text-muted-foreground text-sm">{channel.status === 'live' ? 'EN DIRECT' : 'Hors ligne'}</span>
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

              <Tabs defaultValue="rtmp" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="rtmp" className="flex-1">RTMP</TabsTrigger>
                  <TabsTrigger value="iframe" className="flex-1">iframe</TabsTrigger>
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
              </Tabs>

              <div className="flex gap-2 mt-6">
                <Button className="flex-1">
                  {channel.status === 'live' ? 'Arrêter' : 'Démarrer'} la diffusion
                </Button>
                <Button variant="secondary" className="flex-1">
                  Tester la sortie
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chaines;
