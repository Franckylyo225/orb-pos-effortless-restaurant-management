import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useReports, getPresetRanges, DateRange } from "@/hooks/useReports";
import { useRestaurant } from "@/hooks/useRestaurant";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  CalendarIcon,
  Download,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Receipt,
  Percent,
  CreditCard,
  Loader2,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DateRange as CalendarDateRange } from "react-day-picker";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function Reports() {
  const presetRanges = getPresetRanges();
  const [dateRange, setDateRange] = useState<DateRange>(presetRanges[2].range); // 7 derniers jours
  const [selectedPreset, setSelectedPreset] = useState("7 derniers jours");
  const [calendarRange, setCalendarRange] = useState<CalendarDateRange | undefined>({
    from: presetRanges[2].range.from,
    to: presetRanges[2].range.to,
  });
  const [isCustomRange, setIsCustomRange] = useState(false);
  const { restaurant } = useRestaurant();
  const { loading, revenueStats, paymentMethods, productSales, dailySales, weeklyComparison } = useReports(dateRange);

  const handlePresetChange = (value: string) => {
    if (value === "custom") {
      setIsCustomRange(true);
      setSelectedPreset("Personnalisé");
      return;
    }
    setIsCustomRange(false);
    setSelectedPreset(value);
    const preset = presetRanges.find((p) => p.label === value);
    if (preset) {
      setDateRange(preset.range);
      setCalendarRange({ from: preset.range.from, to: preset.range.to });
    }
  };

  const handleCalendarSelect = (range: CalendarDateRange | undefined) => {
    setCalendarRange(range);
    if (range?.from && range?.to) {
      setDateRange({ from: range.from, to: range.to });
      setSelectedPreset("Personnalisé");
      setIsCustomRange(true);
    }
  };

  const exportToCSV = () => {
    const headers = ["Produit", "Quantité", "Chiffre d'affaires", "Coût", "Profit", "Marge %"];
    const rows = productSales.map((p) => [
      p.name,
      p.quantity,
      p.revenue,
      p.costPrice,
      p.profit,
      p.margin,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rapport-${format(dateRange.from, "yyyy-MM-dd")}-${format(dateRange.to, "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rapport - ${restaurant?.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            h1 { color: #1a1a1a; border-bottom: 2px solid #e5e5e5; padding-bottom: 10px; }
            h2 { color: #4a4a4a; margin-top: 30px; }
            .period { color: #666; font-size: 14px; margin-bottom: 30px; }
            .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
            .stat-box { background: #f9f9f9; padding: 20px; border-radius: 8px; }
            .stat-value { font-size: 24px; font-weight: bold; color: #1a1a1a; }
            .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e5e5; }
            th { background: #f5f5f5; font-weight: 600; }
            .text-right { text-align: right; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <h1>Rapport de ventes - ${restaurant?.name || "Restaurant"}</h1>
          <p class="period">Période: ${format(dateRange.from, "dd MMMM yyyy", { locale: fr })} - ${format(dateRange.to, "dd MMMM yyyy", { locale: fr })}</p>
          
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-value">${revenueStats.totalRevenue.toLocaleString()} CFA</div>
              <div class="stat-label">Chiffre d'affaires total</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${revenueStats.totalOrders}</div>
              <div class="stat-label">Commandes</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${revenueStats.averageTicket.toLocaleString()} CFA</div>
              <div class="stat-label">Ticket moyen</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${revenueStats.totalTax.toLocaleString()} CFA</div>
              <div class="stat-label">TVA collectée</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${revenueStats.totalDiscount.toLocaleString()} CFA</div>
              <div class="stat-label">Remises accordées</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${revenueStats.netRevenue.toLocaleString()} CFA</div>
              <div class="stat-label">Revenu net (HT)</div>
            </div>
          </div>

          <h2>Répartition par mode de paiement</h2>
          <table>
            <thead>
              <tr>
                <th>Mode de paiement</th>
                <th class="text-right">Transactions</th>
                <th class="text-right">Montant</th>
                <th class="text-right">%</th>
              </tr>
            </thead>
            <tbody>
              ${paymentMethods.map((m) => `
                <tr>
                  <td>${m.label}</td>
                  <td class="text-right">${m.count}</td>
                  <td class="text-right">${m.total.toLocaleString()} CFA</td>
                  <td class="text-right">${m.percentage}%</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <h2>Ventes par produit</h2>
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th class="text-right">Qté</th>
                <th class="text-right">CA</th>
                <th class="text-right">Coût</th>
                <th class="text-right">Profit</th>
                <th class="text-right">Marge</th>
              </tr>
            </thead>
            <tbody>
              ${productSales.slice(0, 20).map((p) => `
                <tr>
                  <td>${p.name}</td>
                  <td class="text-right">${p.quantity}</td>
                  <td class="text-right">${p.revenue.toLocaleString()} CFA</td>
                  <td class="text-right">${p.costPrice.toLocaleString()} CFA</td>
                  <td class="text-right">${p.profit.toLocaleString()} CFA</td>
                  <td class="text-right">${p.margin}%</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <p style="margin-top: 40px; color: #999; font-size: 12px;">
            Généré le ${format(new Date(), "dd/MM/yyyy à HH:mm", { locale: fr })}
          </p>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
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
            <h1 className="font-display text-2xl md:text-3xl font-bold">Rapports</h1>
            <p className="text-muted-foreground mt-1">
              Analysez les performances de {restaurant?.name || "votre restaurant"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedPreset} onValueChange={handlePresetChange}>
              <SelectTrigger className="w-[180px]">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                {presetRanges.map((preset) => (
                  <SelectItem key={preset.label} value={preset.label}>
                    {preset.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Personnalisé...</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal min-w-[260px]",
                    !calendarRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {calendarRange?.from ? (
                    calendarRange.to ? (
                      <>
                        {format(calendarRange.from, "dd MMM yyyy", { locale: fr })} -{" "}
                        {format(calendarRange.to, "dd MMM yyyy", { locale: fr })}
                      </>
                    ) : (
                      format(calendarRange.from, "dd MMM yyyy", { locale: fr })
                    )
                  ) : (
                    <span>Choisir une période</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={calendarRange?.from}
                  selected={calendarRange}
                  onSelect={handleCalendarSelect}
                  numberOfMonths={2}
                  locale={fr}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" onClick={exportToPDF}>
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            icon={DollarSign}
            label="Chiffre d'affaires"
            value={`${revenueStats.totalRevenue.toLocaleString()} CFA`}
          />
          <StatCard
            icon={ShoppingCart}
            label="Commandes"
            value={revenueStats.totalOrders.toString()}
          />
          <StatCard
            icon={TrendingUp}
            label="Ticket moyen"
            value={`${revenueStats.averageTicket.toLocaleString()} CFA`}
          />
          <StatCard
            icon={Receipt}
            label="TVA collectée"
            value={`${revenueStats.totalTax.toLocaleString()} CFA`}
          />
          <StatCard
            icon={Percent}
            label="Remises"
            value={`${revenueStats.totalDiscount.toLocaleString()} CFA`}
          />
          <StatCard
            icon={CreditCard}
            label="Net (HT)"
            value={`${revenueStats.netRevenue.toLocaleString()} CFA`}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Sales Chart */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border/50 shadow-soft p-6">
            <h2 className="font-display font-semibold text-lg mb-4">Évolution des ventes</h2>
            <div className="h-[300px]">
              {dailySales.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailySales}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => format(new Date(value), "dd/MM")}
                      className="text-muted-foreground text-xs"
                    />
                    <YAxis
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                      className="text-muted-foreground text-xs"
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{format(new Date(label), "dd MMMM yyyy", { locale: fr })}</p>
                            <p className="text-primary font-semibold">
                              {payload[0].value?.toLocaleString()} CFA
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {payload[1]?.value} commandes
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Aucune donnée pour cette période
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods Pie Chart */}
          <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-6">
            <h2 className="font-display font-semibold text-lg mb-4">Modes de paiement</h2>
            <div className="h-[300px]">
              {paymentMethods.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethods}
                      dataKey="total"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {paymentMethods.map((_, index) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{data.label}</p>
                            <p className="text-primary font-semibold">
                              {data.total.toLocaleString()} CFA
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {data.count} transactions ({data.percentage}%)
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Legend
                      formatter={(value) => <span className="text-sm">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Aucun paiement
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Comparison Chart */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-semibold text-lg">Comparaison hebdomadaire</h2>
              <p className="text-sm text-muted-foreground">
                Semaine actuelle vs semaine précédente
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-muted-foreground">Cette semaine</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--chart-2))" }} />
                <span className="text-muted-foreground">Semaine précédente</span>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            {weeklyComparison.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyComparison} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="dayName"
                    className="text-muted-foreground text-xs"
                  />
                  <YAxis
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    className="text-muted-foreground text-xs"
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-medium mb-2">{label}</p>
                          <div className="space-y-1">
                            <p className="text-primary font-semibold flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-primary" />
                              Cette semaine: {payload[0]?.value?.toLocaleString()} CFA
                            </p>
                            <p className="text-muted-foreground flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(var(--chart-2))" }} />
                              Semaine précédente: {payload[1]?.value?.toLocaleString()} CFA
                            </p>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="currentWeek" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Cette semaine" />
                  <Bar dataKey="previousWeek" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Semaine précédente" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>

        {/* Product Sales Table */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-soft overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="font-display font-semibold text-lg">Ventes par produit</h2>
            <p className="text-sm text-muted-foreground">
              Analyse détaillée avec marges et profits
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Produit</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Qté vendue</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Chiffre d'affaires</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Coût de revient</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Profit</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Marge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {productSales.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Aucune vente pour cette période
                    </td>
                  </tr>
                ) : (
                  productSales.map((product, index) => (
                    <tr key={index} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium">{product.name}</td>
                      <td className="p-4 text-right">{product.quantity}</td>
                      <td className="p-4 text-right">{product.revenue.toLocaleString()} CFA</td>
                      <td className="p-4 text-right text-muted-foreground">
                        {product.costPrice.toLocaleString()} CFA
                      </td>
                      <td className="p-4 text-right font-medium text-primary">
                        {product.profit.toLocaleString()} CFA
                      </td>
                      <td className="p-4 text-right">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.margin >= 50
                              ? "bg-success/20 text-success"
                              : product.margin >= 30
                              ? "bg-warning/20 text-warning"
                              : "bg-destructive/20 text-destructive"
                          }`}
                        >
                          {product.margin}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-soft p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-xs text-muted-foreground truncate">{label}</span>
      </div>
      <p className="text-lg font-bold truncate">{value}</p>
    </div>
  );
}
