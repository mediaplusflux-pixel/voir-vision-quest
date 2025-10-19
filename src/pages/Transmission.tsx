import { Radio, Signal, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import Header from "@/components/Header";

const Transmission = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-foreground text-3xl font-bold">Transmission TNT</h1>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-foreground font-bold">Signal actif</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration principale */}
          <Card className="bg-card border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Radio className="w-6 h-6 text-primary" />
              <h2 className="text-foreground text-xl font-bold">Configuration TNT</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="frequency">Fréquence (MHz)</Label>
                <Input 
                  id="frequency"
                  type="number"
                  placeholder="474" 
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="channel">Numéro de canal</Label>
                <Input 
                  id="channel"
                  type="number"
                  placeholder="21" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bandwidth">Bande passante</Label>
                <select 
                  id="bandwidth"
                  className="w-full p-2 rounded-md bg-background border border-border text-foreground"
                >
                  <option>8 MHz</option>
                  <option>7 MHz</option>
                  <option>6 MHz</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="modulation">Modulation</Label>
                <select 
                  id="modulation"
                  className="w-full p-2 rounded-md bg-background border border-border text-foreground"
                >
                  <option>64-QAM</option>
                  <option>16-QAM</option>
                  <option>QPSK</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Puissance d'émission: 80%</Label>
                <Slider defaultValue={[80]} max={100} step={1} />
              </div>

              <div className="flex items-center justify-between pt-4">
                <Label htmlFor="auto-power">Ajustement auto. de la puissance</Label>
                <Switch id="auto-power" defaultChecked />
              </div>
            </div>

            <Button className="w-full mt-6">
              Appliquer les paramètres
            </Button>
          </Card>

          {/* Monitoring */}
          <Card className="bg-card border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Signal className="w-6 h-6 text-primary" />
              <h2 className="text-foreground text-xl font-bold">Monitoring du signal</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Qualité du signal</span>
                  <span className="text-foreground font-bold">92%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-[92%] bg-green-500"></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Intensité du signal</span>
                  <span className="text-foreground font-bold">-45 dBm</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-[85%] bg-blue-500"></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taux d'erreur</span>
                  <span className="text-foreground font-bold">0.02%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-[2%] bg-yellow-500"></div>
                </div>
              </div>

              <Card className="bg-muted/50 border-border p-4 mt-6">
                <h3 className="text-foreground font-bold mb-3">Statistiques</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Temps de transmission</span>
                    <span className="text-foreground font-mono">03:24:15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Débit moyen</span>
                    <span className="text-foreground font-mono">19.2 Mbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paquets transmis</span>
                    <span className="text-foreground font-mono">2,458,921</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paquets perdus</span>
                    <span className="text-foreground font-mono">142</span>
                  </div>
                </div>
              </Card>
            </div>
          </Card>

          {/* Configuration avancée */}
          <Card className="bg-card border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-primary" />
              <h2 className="text-foreground text-xl font-bold">Paramètres avancés</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="fec">Correction d'erreur (FEC)</Label>
                <Switch id="fec" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="guard">Intervalle de garde</Label>
                <Switch id="guard" defaultChecked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guard-interval">Durée intervalle de garde</Label>
                <select 
                  id="guard-interval"
                  className="w-full p-2 rounded-md bg-background border border-border text-foreground"
                >
                  <option>1/32</option>
                  <option>1/16</option>
                  <option>1/8</option>
                  <option>1/4</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="pilot">Signaux pilotes</Label>
                <Switch id="pilot" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="monitoring">Monitoring continu</Label>
                <Switch id="monitoring" defaultChecked />
              </div>
            </div>
          </Card>

          {/* Journal des événements */}
          <Card className="bg-card border-border p-6">
            <h2 className="text-foreground text-xl font-bold mb-4">Journal des événements</h2>
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {[
                { time: "14:35:21", type: "info", message: "Signal verrouillé sur canal 21" },
                { time: "14:32:18", type: "success", message: "Transmission démarrée avec succès" },
                { time: "14:30:05", type: "warning", message: "Ajustement automatique de la puissance" },
                { time: "14:28:42", type: "info", message: "Configuration chargée: TNT_Config_01" },
                { time: "14:25:33", type: "success", message: "Modulateur initialisé" },
              ].map((event, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2 rounded hover:bg-muted/50">
                  <span className="text-muted-foreground text-xs font-mono">{event.time}</span>
                  <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                    event.type === 'success' ? 'bg-green-500' : 
                    event.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <span className="text-sm text-foreground">{event.message}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Transmission;
