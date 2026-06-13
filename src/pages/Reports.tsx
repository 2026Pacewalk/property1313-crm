import { motion } from 'framer-motion';
import { Users, CheckCircle, TrendingUp, Clock, Download, Star } from 'lucide-react';
import { useDataStore } from '@/stores/dataStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const COLORS = ['#FBBD08', '#3B82F6', '#22C55E', '#FF6B35', '#8B5CF6', '#EF4444', '#06B6D4', '#9CA3AF'];

export default function Reports() {
  const { leads, activityData, sourceBreakdown, conversionFunnel, teamPerformance } = useDataStore();

  const totalLeads = leads.length;
  const convertedLeads = leads.filter(l => l.status === 'converted').length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0';
  const activeFollowups = leads.filter(l => l.status === 'warm' || l.status === 'hot').length;

  const kpis = [
    { label: 'Total Leads', value: totalLeads.toLocaleString(), icon: Users, color: 'bg-p13-yellow/15 text-p13-yellow', trend: '' },
    { label: 'Converted', value: String(convertedLeads), icon: CheckCircle, color: 'bg-green-100 text-green-500', trend: '' },
    { label: 'Conversion Rate', value: `${conversionRate}%`, icon: TrendingUp, color: 'bg-blue-100 text-blue-500', trend: '' },
    { label: 'Active Leads', value: String(activeFollowups), icon: Clock, color: 'bg-orange-100 text-orange-500', trend: '' },
  ];

  return (
    <div className="page-container pt-4 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-h1-mobile md:text-h1-desktop font-semibold">Reports & Analytics</h1>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-lg text-xs font-medium hover:bg-muted/50">
          <Download size={14} /> Export
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl p-4 shadow-xs border border-border">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${kpi.color}`}>
              <kpi.icon size={18} />
            </div>
            <p className="text-xl font-bold mt-2">{kpi.value}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {kpi.trend && <span className={`text-[11px] font-medium ${kpi.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{kpi.trend}</span>}
              <span className="text-[11px] text-muted-foreground">{kpi.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lead Trends Chart */}
      <div className="bg-card rounded-xl p-4 shadow-xs border border-border mb-4">
        <h3 className="text-sm font-semibold mb-1">Lead Trends</h3>
        <p className="text-xs text-muted-foreground mb-3">Last 7 days</p>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEEEEE" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #EEEEEE', fontSize: 12 }} />
              <Area type="monotone" dataKey="newLeads" stroke="#FBBD08" fill="#FBBD08" fillOpacity={0.15} strokeWidth={2} />
              <Area type="monotone" dataKey="converted" stroke="#22C55E" fill="#22C55E" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Source Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-card rounded-xl p-4 shadow-xs border border-border">
          <h3 className="text-sm font-semibold mb-3">Lead Sources</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#EEEEEE" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="source" type="category" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={60} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #EEEEEE', fontSize: 12 }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {sourceBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-xs border border-border">
          <h3 className="text-sm font-semibold mb-3">Source Distribution</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sourceBreakdown} dataKey="count" nameKey="source" cx="50%" cy="50%" outerRadius={70} innerRadius={40}
                  label={({ percent }: { percent: number }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {sourceBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #EEEEEE', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-card rounded-xl p-4 shadow-xs border border-border mb-4">
        <h3 className="text-sm font-semibold mb-3">Conversion Funnel</h3>
        <div className="space-y-1.5">
          {conversionFunnel.map((stage, i) => (
            <div key={stage.stage} className="flex items-center gap-3">
              <div className="w-28 text-right flex-shrink-0">
                <p className="text-xs font-medium">{stage.stage}</p>
              </div>
              <div className="flex-1 h-7 bg-muted rounded-md overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${stage.percentage}%` }} transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="h-full rounded-md flex items-center px-2"
                  style={{ backgroundColor: `rgba(251, 189, 8, ${1 - i * 0.12})` }}>
                  <span className="text-[11px] font-bold text-p13-black">{stage.count}</span>
                </motion.div>
              </div>
              <span className="text-[11px] text-muted-foreground w-12">{stage.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Team Performance */}
      <div className="bg-card rounded-xl p-4 shadow-xs border border-border">
        <h3 className="text-sm font-semibold mb-3">Team Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-border">
                {['Agent', 'Leads', 'Follow-ups', 'Visits', 'Conversions', 'Rate'].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold text-muted-foreground py-2 px-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teamPerformance.map((member, i) => (
                <tr key={member.userId} className={`border-b border-border/50 hover:bg-muted/50 ${i === 0 ? 'bg-p13-yellow/5' : ''}`}>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      {i === 0 && <Star size={12} className="text-p13-yellow" />}
                      <span className="text-sm font-medium">{member.name}</span>
                    </div>
                  </td>
                  <td className="text-sm py-2.5 px-2">{member.leadsAssigned}</td>
                  <td className="text-sm py-2.5 px-2">{member.followupsDone}</td>
                  <td className="text-sm py-2.5 px-2">{member.visitsScheduled}</td>
                  <td className="text-sm py-2.5 px-2 font-semibold">{member.conversions}</td>
                  <td className="text-sm py-2.5 px-2 font-semibold text-green-600">{member.conversionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
