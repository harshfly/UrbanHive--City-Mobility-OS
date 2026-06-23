import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../layouts/PageHeader';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';
import { Select } from '../components/ui/Select';
import { fetchJunctions } from '../api/junctions.api';
import { Junction } from '../types';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const TrafficNetwork: React.FC = () => {
  const [junctions, setJunctions] = useState<Junction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [zoneFilter, setZoneFilter] = useState('All');
  const [sortCol, setSortCol] = useState<string>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    fetchJunctions().then((data) => {
      if (active) {
        setJunctions(data);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  const zones = ['All', ...Array.from(new Set(junctions.map((j) => j.zone)))];
  const statusMap: Record<string, string> = { green: 'Flowing', amber: 'Predicted', red: 'Critical' };

  let filtered = junctions;
  if (statusFilter !== 'All') {
    const statusKey = Object.entries(statusMap).find(([, v]) => v === statusFilter)?.[0];
    filtered = filtered.filter((j) => j.status === statusKey);
  }
  if (zoneFilter !== 'All') {
    filtered = filtered.filter((j) => j.zone === zoneFilter);
  }

  // Sort
  filtered = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortCol === 'name') cmp = a.name.localeCompare(b.name);
    else if (sortCol === 'zone') cmp = a.zone.localeCompare(b.zone);
    else if (sortCol === 'wait') cmp = a.avgWaitSeconds - b.avgWaitSeconds;
    else if (sortCol === 'overrides') cmp = a.aiOverridesToday - b.aiOverridesToday;
    else if (sortCol === 'status') cmp = a.status.localeCompare(b.status);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const statusBadge = (status: string) => {
    const variant = status === 'green' ? 'green' : status === 'amber' ? 'amber' : 'red';
    return <Badge variant={variant} dot>{statusMap[status] || status}</Badge>;
  };

  // Dynamic Chart Data Calculations
  const flowingCount = filtered.filter(j => j.status === 'green').length;
  const predictedCount = filtered.filter(j => j.status === 'amber').length;
  const criticalCount = filtered.filter(j => j.status === 'red').length;
  const totalCount = filtered.length;

  const donutData = totalCount > 0 ? [
    { name: 'Flowing Status', value: flowingCount, fill: '#34C759' },
    { name: 'Predicted Queue', value: predictedCount, fill: '#FF9500' },
    { name: 'Critical Delay', value: criticalCount, fill: '#FF3B30' },
  ].filter(d => d.value > 0) : [];

  const zoneStats = Array.from(new Set(filtered.map(j => j.zone))).map(zone => {
    const junctionsInZone = filtered.filter(j => j.zone === zone);
    const avgWait = Math.round(junctionsInZone.reduce((acc, j) => acc + j.avgWaitSeconds, 0) / junctionsInZone.length);
    const fill = avgWait > 45 ? '#FF3B30' : avgWait > 30 ? '#FF9500' : '#34C759';
    return { name: zone, value: avgWait, fill };
  }).sort((a, b) => b.value - a.value);

  if (loading) {
    return (
      <div>
        <PageHeader title="Traffic Network" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-bg-surface-alt rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader title="Traffic Network" />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Select
          value={zoneFilter}
          options={zones.map((z) => ({ label: z, value: z }))}
          onChange={setZoneFilter}
        />
        <Tabs
          tabs={['All', 'Flowing', 'Predicted', 'Critical']}
          activeTab={statusFilter}
          onChange={setStatusFilter}
          className="max-w-sm"
        />
      </div>

      {/* Circular Network Analytics (Moved above table for visual hierarchy) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Card 1: Network Status Split Donut */}
        <div className="bg-bg-surface border border-border-subtle rounded-3xl p-6 shadow-sm flex flex-col h-[280px]">
          <div>
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-1">Filtered Network Status Split</h3>
            <p className="text-xs text-text-secondary">Proportion of filtered junctions by signal efficiency level.</p>
          </div>

          <div className="flex-1 flex items-center justify-center relative mt-4">
            {donutData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                      animationDuration={400}
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: '1px solid #E5E5EA', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[9px] uppercase tracking-wider text-text-tertiary font-bold">Total</span>
                  <span className="text-xl font-mono font-bold text-text-primary leading-none mt-0.5">{totalCount}</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">No Data Available</span>
                <span className="text-[10px] text-text-tertiary mt-1 max-w-[200px] leading-relaxed">
                  No junctions match the selected filters.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Zone Average Wait Times Bar Chart */}
        <div className="bg-bg-surface border border-border-subtle rounded-3xl p-6 shadow-sm flex flex-col h-[280px]">
          <div>
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-1">Zone Average Wait Times</h3>
            <p className="text-xs text-text-secondary">Average wait times for filtered junctions across zones.</p>
          </div>

          <div className="flex-1 mt-4">
            {zoneStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneStats} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F7" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#8E8E93', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 'dataMax + 10']} tick={{ fontSize: 9, fill: '#8E8E93', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: '1px solid #E5E5EA', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={36} animationDuration={400}>
                    {zoneStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">No Data Available</span>
                <span className="text-[10px] text-text-tertiary mt-1 max-w-[200px] leading-relaxed">
                  No junctions match the selected filters to compute wait times.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-bg-surface border border-border-subtle rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-canvas/50">
              {[
                { key: 'name', label: 'Junction' },
                { key: 'zone', label: 'Zone' },
                { key: 'status', label: 'Status' },
                { key: 'wait', label: 'Avg Wait' },
                { key: 'overrides', label: 'AI Overrides' },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="text-left px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-text-secondary cursor-pointer hover:text-text-primary transition-colors select-none"
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortCol === col.key && (
                      <span className="text-[9px] text-accent-primary">{sortDir === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((j) => (
              <tr
                key={j.id}
                onClick={() => navigate(`/traffic/${j.id}`)}
                className="border-b border-border-subtle last:border-0 hover:bg-bg-canvas/40 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4 text-xs font-bold text-text-primary group-hover:text-accent-primary transition-colors">{j.name}</td>
                <td className="px-6 py-4 text-xs text-text-secondary font-medium">{j.zone}</td>
                <td className="px-6 py-4">{statusBadge(j.status)}</td>
                <td className="px-6 py-4 text-xs font-mono font-bold text-text-primary">{j.avgWaitSeconds}s</td>
                <td className="px-6 py-4 text-xs font-mono font-bold text-text-primary">{j.aiOverridesToday}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-text-tertiary text-sm font-medium">No junctions match the selected filters.</div>
        )}
      </div>

    </motion.div>
  );
};

export default TrafficNetwork;
