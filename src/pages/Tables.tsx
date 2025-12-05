import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Users,
  Trash2,
  Loader2,
  Clock,
  Utensils,
  ArrowRight,
} from "lucide-react";
import { useOrders, Table } from "@/hooks/useOrders";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const statusColors: Record<Table["status"], { bg: string; border: string; text: string; label: string }> = {
  free: { bg: "bg-success/10", border: "border-success", text: "text-success", label: "Libre" },
  occupied: { bg: "bg-primary/10", border: "border-primary", text: "text-primary", label: "Occupée" },
  reserved: { bg: "bg-warning/10", border: "border-warning", text: "text-warning", label: "Réservée" },
  cleaning: { bg: "bg-muted", border: "border-muted-foreground/30", text: "text-muted-foreground", label: "Nettoyage" },
};

export default function Tables() {
  const { tables, activeOrders, loading, addTable, updateTableStatus, deleteTable } = useOrders();
  const [showAddTable, setShowAddTable] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [filter, setFilter] = useState<"all" | Table["status"]>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTable, setNewTable] = useState({
    name: "",
    capacity: "4",
    shape: "square",
  });

  const handleAddTable = async () => {
    if (!newTable.name) return;

    setIsSubmitting(true);
    await addTable({
      name: newTable.name,
      capacity: parseInt(newTable.capacity),
      shape: newTable.shape,
    });

    setNewTable({ name: "", capacity: "4", shape: "square" });
    setShowAddTable(false);
    setIsSubmitting(false);
  };

  const getTableOrder = (tableId: string) => {
    return activeOrders.find((order) => order.table_id === tableId);
  };

  const filteredTables = tables.filter(
    (table) => filter === "all" || table.status === filter
  );

  const stats = {
    free: tables.filter((t) => t.status === "free").length,
    occupied: tables.filter((t) => t.status === "occupied").length,
    reserved: tables.filter((t) => t.status === "reserved").length,
    cleaning: tables.filter((t) => t.status === "cleaning").length,
  };

  const handleStatusChange = async (tableId: string, status: Table["status"]) => {
    await updateTableStatus(tableId, status);
    setSelectedTable(null);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Plan de salle</h1>
            <p className="text-muted-foreground mt-1">
              {tables.length} tables • {stats.occupied} occupées
            </p>
          </div>
          <Dialog open={showAddTable} onOpenChange={setShowAddTable}>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Plus size={20} className="mr-2" />
                Ajouter une table
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvelle table</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Nom de la table *</Label>
                  <Input
                    placeholder="Ex: Table 1, Terrasse A..."
                    value={newTable.name}
                    onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Capacité</Label>
                    <Select
                      value={newTable.capacity}
                      onValueChange={(value) => setNewTable({ ...newTable, capacity: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2, 4, 6, 8, 10, 12].map((num) => (
                          <SelectItem key={num} value={String(num)}>
                            {num} personnes
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Forme</Label>
                    <Select
                      value={newTable.shape}
                      onValueChange={(value) => setNewTable({ ...newTable, shape: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="square">Carrée</SelectItem>
                        <SelectItem value="circle">Ronde</SelectItem>
                        <SelectItem value="rectangle">Rectangle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="w-full" onClick={handleAddTable} disabled={isSubmitting || !newTable.name}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Ajouter
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(Object.keys(statusColors) as Array<Table["status"]>).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(filter === status ? "all" : status)}
              className={cn(
                "p-4 rounded-xl border-2 transition-all",
                filter === status
                  ? `${statusColors[status].bg} ${statusColors[status].border} ${statusColors[status].text}`
                  : "border-border hover:border-primary/30"
              )}
            >
              <p className="text-2xl font-bold">{stats[status]}</p>
              <p className="text-sm">{statusColors[status].label}</p>
            </button>
          ))}
        </div>

        {/* Empty State */}
        {tables.length === 0 && (
          <div className="text-center py-16 bg-muted/30 rounded-2xl">
            <p className="text-4xl mb-4">🪑</p>
            <h3 className="font-semibold text-lg mb-2">Aucune table</h3>
            <p className="text-muted-foreground mb-4">Ajoutez des tables pour gérer votre salle</p>
            <Button variant="hero" onClick={() => setShowAddTable(true)}>
              <Plus size={20} className="mr-2" />
              Ajouter une table
            </Button>
          </div>
        )}

        {/* Tables Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredTables.map((table) => {
            const config = statusColors[table.status];
            const order = getTableOrder(table.id);

            return (
              <button
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className={cn(
                  "table-cell p-4 border-2 rounded-xl transition-all hover:shadow-medium",
                  config.bg,
                  config.border,
                  table.shape === "circle" && "rounded-full aspect-square"
                )}
              >
                <span className="text-lg font-bold">{table.name}</span>
                <div className="flex items-center gap-1 text-xs opacity-80">
                  <Users size={12} />
                  {table.capacity}
                </div>
                {table.status === "occupied" && order && (
                  <>
                    <p className="text-sm font-bold mt-2">
                      {Number(order.total).toLocaleString()} CFA
                    </p>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Table Detail Modal */}
        {selectedTable && (
          <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl shadow-large w-full max-w-sm animate-scale-in">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-xl">{selectedTable.name}</h2>
                  <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users size={16} />
                      {selectedTable.capacity} places
                    </span>
                    <span className={cn("px-2 py-1 rounded-full text-xs", statusColors[selectedTable.status].bg, statusColors[selectedTable.status].text)}>
                      {statusColors[selectedTable.status].label}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={async () => {
                    await deleteTable(selectedTable.id);
                    setSelectedTable(null);
                  }}
                >
                  <Trash2 size={18} />
                </Button>
              </div>

              <div className="p-6 space-y-4">
                {selectedTable.status === "occupied" && getTableOrder(selectedTable.id) && (
                  <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                    <p className="text-sm text-muted-foreground">Commande en cours</p>
                    <p className="text-2xl font-bold text-primary">
                      {Number(getTableOrder(selectedTable.id)?.total).toLocaleString()} CFA
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Changer le statut</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => handleStatusChange(selectedTable.id, "free")}
                    >
                      <div className="w-3 h-3 rounded-full bg-success mr-2" />
                      Libre
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => handleStatusChange(selectedTable.id, "occupied")}
                    >
                      <div className="w-3 h-3 rounded-full bg-primary mr-2" />
                      Occupée
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => handleStatusChange(selectedTable.id, "reserved")}
                    >
                      <div className="w-3 h-3 rounded-full bg-warning mr-2" />
                      Réservée
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => handleStatusChange(selectedTable.id, "cleaning")}
                    >
                      <div className="w-3 h-3 rounded-full bg-muted-foreground mr-2" />
                      Nettoyage
                    </Button>
                  </div>
                </div>

                {selectedTable.status === "free" && (
                  <Button variant="hero" className="w-full" asChild>
                    <Link to={`/dashboard/pos`}>
                      <Utensils size={18} className="mr-2" />
                      Nouvelle commande
                      <ArrowRight size={16} className="ml-2" />
                    </Link>
                  </Button>
                )}
              </div>

              <div className="p-4 border-t border-border">
                <Button variant="ghost" className="w-full" onClick={() => setSelectedTable(null)}>
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
