import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Users, Clock, Utensils, ArrowRight } from "lucide-react";

interface Table {
  id: number;
  name: string;
  seats: number;
  status: "free" | "occupied" | "waiting" | "cleaning";
  server?: string;
  orderTotal?: number;
  time?: string;
}

const initialTables: Table[] = [
  { id: 1, name: "Table 1", seats: 2, status: "free" },
  { id: 2, name: "Table 2", seats: 2, status: "occupied", server: "Marie", orderTotal: 24500, time: "45 min" },
  { id: 3, name: "Table 3", seats: 4, status: "occupied", server: "Kofi", orderTotal: 54200, time: "1h 20" },
  { id: 4, name: "Table 4", seats: 4, status: "free" },
  { id: 5, name: "Table 5", seats: 6, status: "waiting", server: "Awa" },
  { id: 6, name: "Table 6", seats: 6, status: "occupied", server: "Marie", orderTotal: 32500, time: "30 min" },
  { id: 7, name: "Table 7", seats: 8, status: "cleaning" },
  { id: 8, name: "Table 8", seats: 8, status: "free" },
  { id: 9, name: "Comptoir 1", seats: 1, status: "occupied", server: "Kofi", orderTotal: 8500, time: "15 min" },
  { id: 10, name: "Comptoir 2", seats: 1, status: "free" },
  { id: 11, name: "Terrasse 1", seats: 4, status: "occupied", server: "Awa", orderTotal: 45000, time: "55 min" },
  { id: 12, name: "Terrasse 2", seats: 4, status: "free" },
];

const statusConfig = {
  free: {
    label: "Libre",
    color: "bg-success/20 border-success text-success",
    bgColor: "bg-success/10",
  },
  occupied: {
    label: "Occupée",
    color: "bg-primary/20 border-primary text-primary",
    bgColor: "bg-primary/10",
  },
  waiting: {
    label: "En attente",
    color: "bg-warning/20 border-warning text-warning",
    bgColor: "bg-warning/10",
  },
  cleaning: {
    label: "Nettoyage",
    color: "bg-muted border-muted-foreground/30 text-muted-foreground",
    bgColor: "bg-muted",
  },
};

export default function Tables() {
  const [tables, setTables] = useState(initialTables);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [filter, setFilter] = useState<"all" | Table["status"]>("all");

  const filteredTables = tables.filter(
    (table) => filter === "all" || table.status === filter
  );

  const stats = {
    free: tables.filter((t) => t.status === "free").length,
    occupied: tables.filter((t) => t.status === "occupied").length,
    waiting: tables.filter((t) => t.status === "waiting").length,
    cleaning: tables.filter((t) => t.status === "cleaning").length,
  };

  const updateTableStatus = (id: number, status: Table["status"]) => {
    setTables((prev) =>
      prev.map((table) => (table.id === id ? { ...table, status } : table))
    );
    setSelectedTable(null);
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              Plan de salle
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos tables en temps réel
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(filter === status ? "all" : status)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  filter === status
                    ? statusConfig[status].color
                    : "border-border hover:border-primary/30"
                }`}
              >
                <p className="text-2xl font-bold">{stats[status]}</p>
                <p className="text-sm">{statusConfig[status].label}</p>
              </button>
            )
          )}
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredTables.map((table) => {
            const config = statusConfig[table.status];
            return (
              <button
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className={`table-cell p-4 border-2 ${config.color} ${config.bgColor}`}
              >
                <span className="text-lg font-bold">{table.name}</span>
                <div className="flex items-center gap-1 text-xs opacity-80">
                  <Users size={12} />
                  {table.seats}
                </div>
                {table.status === "occupied" && (
                  <>
                    <p className="text-xs font-medium mt-1">{table.server}</p>
                    <p className="text-sm font-bold">
                      {table.orderTotal?.toLocaleString()} CFA
                    </p>
                    <div className="flex items-center gap-1 text-xs">
                      <Clock size={10} />
                      {table.time}
                    </div>
                  </>
                )}
                {table.status === "waiting" && (
                  <p className="text-xs font-medium mt-1">{table.server}</p>
                )}
              </button>
            );
          })}
        </div>

        {/* Table Detail Modal */}
        {selectedTable && (
          <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl shadow-large w-full max-w-sm animate-scale-in">
              <div className="p-6 border-b border-border">
                <h2 className="font-display font-bold text-xl">
                  {selectedTable.name}
                </h2>
                <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users size={16} />
                    {selectedTable.seats} places
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      statusConfig[selectedTable.status].color
                    }`}
                  >
                    {statusConfig[selectedTable.status].label}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {selectedTable.status === "occupied" && (
                  <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                    <p className="text-sm text-muted-foreground">Serveur</p>
                    <p className="font-medium">{selectedTable.server}</p>
                    <p className="text-sm text-muted-foreground mt-3">Total commande</p>
                    <p className="text-2xl font-bold text-primary">
                      {selectedTable.orderTotal?.toLocaleString()} CFA
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Temps: {selectedTable.time}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Changer le statut
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => updateTableStatus(selectedTable.id, "free")}
                    >
                      <div className="w-3 h-3 rounded-full bg-success mr-2" />
                      Libre
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => updateTableStatus(selectedTable.id, "occupied")}
                    >
                      <div className="w-3 h-3 rounded-full bg-primary mr-2" />
                      Occupée
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => updateTableStatus(selectedTable.id, "waiting")}
                    >
                      <div className="w-3 h-3 rounded-full bg-warning mr-2" />
                      En attente
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => updateTableStatus(selectedTable.id, "cleaning")}
                    >
                      <div className="w-3 h-3 rounded-full bg-muted-foreground mr-2" />
                      Nettoyage
                    </Button>
                  </div>
                </div>

                {selectedTable.status === "occupied" && (
                  <Button variant="hero" className="w-full" asChild>
                    <a href={`/dashboard/pos?table=${selectedTable.id}`}>
                      <Utensils size={18} className="mr-2" />
                      Voir commande
                      <ArrowRight size={16} className="ml-2" />
                    </a>
                  </Button>
                )}
              </div>

              <div className="p-4 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setSelectedTable(null)}
                >
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
