import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Copy, Plus } from "lucide-react";

const Admin = () => {
  const [duration, setDuration] = useState("3");
  const [generatedKey, setGeneratedKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateKey = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.rpc('generate_activation_key', {
        duration_months: parseInt(duration)
      });

      if (error) throw error;

      setGeneratedKey(data);
      toast({
        title: "Clé générée",
        description: "La clé d'activation a été créée avec succès",
      });
    } catch (error) {
      console.error('Error generating key:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la clé",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedKey);
    toast({
      title: "Copié",
      description: "La clé a été copiée dans le presse-papier",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Administration</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Générer une clé d'activation</CardTitle>
              <CardDescription>
                Créez une nouvelle clé d'activation pour un utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Durée de validité</label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 mois</SelectItem>
                    <SelectItem value="6">6 mois</SelectItem>
                    <SelectItem value="12">12 mois</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={generateKey} 
                disabled={isGenerating}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isGenerating ? "Génération..." : "Générer la clé"}
              </Button>

              {generatedKey && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Clé générée</label>
                  <div className="flex gap-2">
                    <Input
                      value={generatedKey}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyToClipboard}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
              <CardDescription>
                Vue d'ensemble des clés d'activation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span className="text-sm font-medium">Clés actives</span>
                  <span className="text-2xl font-bold text-primary">-</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span className="text-sm font-medium">Clés expirées</span>
                  <span className="text-2xl font-bold text-muted-foreground">-</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span className="text-sm font-medium">Total utilisations</span>
                  <span className="text-2xl font-bold">-</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;