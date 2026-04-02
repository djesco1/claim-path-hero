import { useMemo } from 'react';
import { AppLayout } from '@/components/layout';
import { useClaims } from '@/hooks/useClaims';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, ResponsiveContainer } from 'recharts';
import { statusConfig, claimTypes } from '@/constants';
import { formatCurrency, cn } from '@/lib/utils';
import { format, subMonths, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const STATUS_COLORS: Record<string, string> = {
  draft: '#94a3b8',
  in_progress: '#3b82f6',
  sent: '#f59e0b',
  resolved: '#10b981',
  closed: '#6b7280',
};

export default function Analytics() {
  const { data: claims, isLoading } = useClaims();

  const { statusData, typeData, timelineData, stats } = useMemo(() => {
    if (!claims?.length) return { statusData: [], typeData: [], timelineData: [], stats: null };

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
      }))
      .sort((a, b) => b.count - a.count);

    // Timeline (last 6 months)
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      months.push(format(startOfMonth(subMonths(new Date(), i)), 'yyyy-MM'));
    }
    const timelineData = months.map(m => ({
      month: format(new Date(m + '-01'), 'MMM yy', { locale: es }),
      count: claims.filter(c => c.created_at.startsWith(m)).length,
    }));

    // Stats
    const resolvedCount = claims.filter(c => c.status === 'resolved').length;
    const totalAmount = claims.reduce((sum, c) => sum + (c.amount_involved || 0), 0);
    const mostCommonType = typeData[0]?.name || '-';
    const successRate = claims.length > 0 ? Math.round((resolvedCount / claims.length) * 100) : 0;

    return {
      statusData,
      typeData,
      timelineData,
      stats: { totalAmount, mostCommonType, successRate, resolvedCount },
    };
  }, [claims]);

  if (isLoading) return <AppLayout><div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div></AppLayout>;

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
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Estadísticas</h1>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">Tipo más común</p>
            <p className="text-lg font-bold text-foreground">{stats?.mostCommonType}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">Tasa de éxito</p>
            <p className="text-lg font-bold text-success">{stats?.successRate}%</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total reclamado</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(stats?.totalAmount || 0)}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">Resueltas</p>
            <p className="text-lg font-bold text-primary">{stats?.resolvedCount}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Status donut */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-4">Por estado</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width={250} height={250}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2}>
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-4">
              {statusData.map(s => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-xs text-muted-foreground">{s.name} ({s.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Type bar */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-4">Por tipo</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={typeData} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(243, 75%, 59%)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Actividad (últimos 6 meses)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="hsl(243, 75%, 59%)" strokeWidth={2} dot={{ r: 4, fill: 'hsl(243, 75%, 59%)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AppLayout>
  );
}
