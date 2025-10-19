import { Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";

const Grille = () => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

  const programs = [
    { day: 0, hour: 8, duration: 2, title: "Matinale", color: "bg-blue-500" },
    { day: 0, hour: 12, duration: 1, title: "Journal", color: "bg-red-500" },
    { day: 1, hour: 20, duration: 2, title: "Soirée spéciale", color: "bg-purple-500" },
    { day: 2, hour: 14, duration: 3, title: "Conférence", color: "bg-green-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-foreground text-3xl font-bold">Grille de Programmes</h1>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Ajouter un programme
          </Button>
        </div>

        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
              <div className="grid grid-cols-8 border-b border-border">
                <div className="p-4 border-r border-border bg-muted">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                {days.map((day) => (
                  <div key={day} className="p-4 border-r border-border bg-muted last:border-r-0">
                    <div className="text-foreground font-bold text-center">{day}</div>
                  </div>
                ))}
              </div>

              <div className="relative">
                {hours.map((hour) => (
                  <div key={hour} className="grid grid-cols-8 border-b border-border hover:bg-muted/50">
                    <div className="p-4 border-r border-border text-muted-foreground text-sm font-mono">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    {days.map((_, dayIndex) => (
                      <div key={dayIndex} className="p-2 border-r border-border last:border-r-0 min-h-[60px] relative">
                        {programs
                          .filter(p => p.day === dayIndex && p.hour === hour)
                          .map((program, idx) => (
                            <div
                              key={idx}
                              className={`${program.color} rounded p-2 text-white text-xs cursor-pointer hover:opacity-80 transition-opacity`}
                              style={{ height: `${program.duration * 60}px` }}
                            >
                              <div className="font-bold">{program.title}</div>
                              <div className="text-xs opacity-90">{program.duration}h</div>
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-6 flex gap-4">
          <Card className="bg-card border-border p-4 flex-1">
            <h3 className="text-foreground font-bold mb-2">Légende</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm text-muted-foreground">Magazine</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-muted-foreground">Journal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span className="text-sm text-muted-foreground">Soirée</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-muted-foreground">Conférence</span>
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border p-4 flex-1">
            <h3 className="text-foreground font-bold mb-2">Actions rapides</h3>
            <div className="space-y-2">
              <Button variant="secondary" size="sm" className="w-full">Dupliquer la semaine</Button>
              <Button variant="secondary" size="sm" className="w-full">Exporter la grille</Button>
              <Button variant="secondary" size="sm" className="w-full">Importer une grille</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Grille;
