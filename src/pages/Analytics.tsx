import { useMemo } from 'react';
import { AppLayout } from '@/components/layout';
import { useClaims } from '@/hooks/useClaims';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid, ResponsiveContainer, Area, AreaChart,
  ScatterChart, Scatter, ZAxis, Legend,
} from 'recharts';
import { statusConfig, claimTypes } from '@/constants';
import { formatCurrency, cn } from '@/lib/utils';
import { format, subMonths, startOfMonth, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart3, TrendingUp, Clock, DollarSign, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const STATUS_COLORS: Record<string, string> = {
  draft: '#94a3b8',
  in_progress: '#3b82f6',
  sent: '#f59e0b',
  resolved: '#10b981',
  closed: '#6b7280',
};

const TYPE_COLORS: Record<string, string> = {
  landlord_deposit: '#0EA5E9',
  wrongful_termination: '#F59E0B',
  insurance_denial: '#8B5CF6',
  public_entity: '#EF4444',
  service_refund: '#10B981',
  other: '#6B7280',
};

function KPICard({ label, value, subtitle, icon: Icon, color, trend }: {
  label: string;
  value: string;
  subtitle?: string;
  icon: typeof TrendingUp;
  color: string;
  trend?: 'up' | 'down' | null;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {trend === 'up' && <ArrowUpRight className="h-3 w-3 text-emerald-500" />}
              {trend === 'down' && <ArrowDownRight className="h-3 w-3 text-amber-500" />}
              {subtitle}
            </p>
          )}
        </div>
        <div className={cn('rounded-xl p-2.5', color)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border bg-card p-6', className)}>
      <h3 className="font-semibold text-foreground mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function Analytics() {
  const { data: claims, isLoading } = useClaims();

  const { statusData, typeData, timelineData, scatterData, stats } = useMemo(() => {
    if (!claims?.length) return { statusData: [], typeData: [], timelineData: [], scatterData: [], stats: null };

    // Status donut
    const statusCounts: Record<string, number> = {};
    claims.forEach(c => { statusCounts[c.status] = (statusCounts[c.status] || 0) + 1; });
    const statusData = Object.entries(statusCounts).map(([status, count]) => ({
      name: statusConfig[status as keyof typeof statusConfig]?.label || status,
      value: count,
      color: STATUS_COLORS[status] || '#6b7280',
    }));

    // Type bar
    const typeCounts: Record<string, number> = {};
    claims.forEach(c => { typeCounts[c.claim_type] = (typeCounts[c.claim_type] || 0) + 1; });
    const typeData = Object.entries(typeCounts)
      .map(([type, count]) => ({
        name: claimTypes.find(ct => ct.value === type)?.label || type,
        count,
        color: TYPE_COLORS[type] || '#6B7280',
        pct: Math.round((count / claims.length) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    // Timeline (last 6 months)
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      months.push(format(startOfMonth(subMonths(new Date(), i)), 'yyyy-MM'));
    }
    const timelineData = months.map(m => ({
      month: format(new Date(m + '-01'), 'MMM yy', { locale: es }),
      creadas: claims.filter(c => c.created_at.startsWith(m)).length,
      resueltas: claims.filter(c => c.status === 'resolved' && c.updated_at.startsWith(m)).length,
    }));

    // Scatter: amount vs days
    const scatterData = claims
      .filter(c => c.amount_involved)
      .map(c => ({
        days: differenceInDays(new Date(), new Date(c.created_at)),
        amount: c.amount_involved || 0,
        title: c.title,
        status: c.status,
        color: STATUS_COLORS[c.status] || '#6b7280',
      }));

    // Stats
    const resolvedCount = claims.filter(c => c.status === 'resolved').length;
    const totalAmount = claims.reduce((sum, c) => sum + (c.amount_involved || 0), 0);
    const activeCount = claims.filter(c => c.status === 'in_progress' || c.status === 'sent').length;

    const resolvedClaims = claims.filter(c => c.status === 'resolved');
    const avgDays = resolvedClaims.length > 0
      ? Math.round(resolvedClaims.reduce((sum, c) => sum + differenceInDays(new Date(c.updated_at), new Date(c.created_at)), 0) / resolvedClaims.length)
      : null;

    const successRate = claims.length > 0 ? Math.round((resolvedCount / claims.length) * 100) : 0;

    return {
      statusData,
      typeData,
      timelineData,
      scatterData,
      stats: { totalAmount, activeCount, successRate, resolvedCount, avgDays, total: claims.length },
    };
  }, [claims]);

  if (isLoading) return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    </AppLayout>
  );

  if (!claims || claims.length < 2) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
          <EmptyState
            icon={BarChart3}
            title="Necesitas al menos 2 reclamaciones"
            description="Crea más reclamaciones para ver tus estadísticas."
            action={<Button asChild><Link to="/claims/new">Nueva reclamación</Link></Button>}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Estadísticas</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Tasa de éxito"
            value={`${stats?.successRate}%`}
            subtitle={stats?.successRate && stats.successRate >= 73 ? 'Por encima del promedio' : 'Promedio plataforma: 73%'}
            icon={TrendingUp}
            color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            trend={stats?.successRate && stats.successRate >= 73 ? 'up' : 'down'}
          />
          <KPICard
            label="Tiempo promedio"
            value={stats?.avgDays != null ? `${stats.avgDays}d` : 'N/A'}
            subtitle="De resolución"
            icon={Clock}
            color="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          />
          <KPICard
            label="Total reclamado"
            value={formatCurrency(stats?.totalAmount || 0)}
            subtitle={`${stats?.total} reclamaciones`}
            icon={DollarSign}
            color="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          />
          <KPICard
            label="Activas"
            value={String(stats?.activeCount || 0)}
            subtitle="En proceso o enviadas"
            icon={Zap}
            color="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          <ChartCard title="Por estado">
            <div className="flex items-center justify-center">
              <ResponsiveContainer width={250} height={250}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={2} strokeWidth={0}>
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [v, 'Reclamaciones']} />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="fill-foreground text-2xl font-bold">
                    {stats?.total}
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {statusData.map(s => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-xs text-muted-foreground">{s.name} ({s.value})</span>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Por tipo">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={typeData} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number, _: string, props: any) => [`${v} (${props.payload.pct}%)`, 'Reclamaciones']} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {typeData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Activity area chart */}
        <ChartCard title="Actividad (últimos 6 meses)">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="colorCreadas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(243, 75%, 59%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(243, 75%, 59%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorResueltas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="creadas" name="Creadas" stroke="hsl(243, 75%, 59%)" fillOpacity={1} fill="url(#colorCreadas)" strokeWidth={2} />
              <Area type="monotone" dataKey="resueltas" name="Resueltas" stroke="#10b981" fillOpacity={1} fill="url(#colorResueltas)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Scatter chart */}
        {scatterData.length > 0 && (
          <ChartCard title="Monto vs tiempo activo">
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ bottom: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                <XAxis type="number" dataKey="days" name="Días" unit="d" tick={{ fontSize: 12 }} />
                <YAxis type="number" dataKey="amount" name="Monto" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                <ZAxis range={[60, 200]} />
                <Tooltip
                  formatter={(value: number, name: string) =>
                    name === 'Monto' ? [formatCurrency(value), name] : [value, name]
                  }
                  labelFormatter={() => ''}
                />
                <Scatter data={scatterData} name="Reclamaciones">
                  {scatterData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Claims table */}
        <ChartCard title="Detalle de reclamaciones">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Título</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Tipo</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Estado</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Monto</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Días</th>
                </tr>
              </thead>
              <tbody>
                {claims?.slice(0, 20).map(c => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => window.location.href = `/claims/${c.id}`}>
                    <td className="py-2.5 px-3 font-medium text-foreground truncate max-w-[200px]">{c.title || 'Sin título'}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{claimTypes.find(ct => ct.value === c.claim_type)?.label}</td>
                    <td className="py-2.5 px-3">
                      <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', statusConfig[c.status]?.color)}>
                        {statusConfig[c.status]?.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">{c.amount_involved ? formatCurrency(c.amount_involved) : '-'}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{differenceInDays(new Date(), new Date(c.created_at))}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </AppLayout>
  );
}
