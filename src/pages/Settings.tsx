import React, { useState } from 'react';
import { PageHeader } from '../layouts/PageHeader';
import { Tabs } from '../components/ui/Tabs';
import { Badge } from '../components/ui/Badge';
import { motion } from 'framer-motion';

const edgeNodes = [
  { id: 'EN-01', name: 'Junction Controller J-1', status: 'online', lastPing: '2s ago' },
  { id: 'EN-02', name: 'Junction Controller J-2', status: 'online', lastPing: '5s ago' },
  { id: 'EN-03', name: 'Junction Controller J-3', status: 'offline', lastPing: '12m ago' },
  { id: 'EN-04', name: 'Junction Controller J-4', status: 'online', lastPing: '1s ago' },
  { id: 'EN-05', name: 'Junction Controller J-5', status: 'online', lastPing: '3s ago' },
  { id: 'EN-06', name: 'Junction Controller J-6', status: 'online', lastPing: '8s ago' },
  { id: 'EN-07', name: 'Junction Controller J-7', status: 'offline', lastPing: '25m ago' },
  { id: 'EN-08', name: 'Junction Controller J-8', status: 'online', lastPing: '2s ago' },
];

const Settings: React.FC = () => {
  const [tab, setTab] = useState('Roles & Access');
  const [congestionSensitivity, setCongestionSensitivity] = useState(72);
  const [overrideThreshold, setOverrideThreshold] = useState(85);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader title="Settings" />
      <Tabs
        tabs={['Roles & Access', 'AI Thresholds', 'Edge Node Status']}
        activeTab={tab}
        onChange={setTab}
        className="max-w-lg mb-6"
      />

      {tab === 'Roles & Access' && (
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 shadow-sm max-w-2xl">
          <h3 className="text-sm font-display font-semibold text-text-primary mb-4">User Roles</h3>
          <div className="space-y-3">
            {[
              { name: 'Harsh Patel', role: 'Admin', email: 'harsh@urbanhive.io' },
              { name: 'Priya Sharma', role: 'Operator', email: 'priya@urbanhive.io' },
              { name: 'Rahul Verma', role: 'Viewer', email: 'rahul@urbanhive.io' },
            ].map((user) => (
              <div key={user.email} className="flex items-center justify-between p-3 bg-bg-surface-alt rounded-lg">
                <div>
                  <div className="text-sm font-medium text-text-primary">{user.name}</div>
                  <div className="text-xs text-text-tertiary">{user.email}</div>
                </div>
                <Badge variant={user.role === 'Admin' ? 'primary' : user.role === 'Operator' ? 'blue' : 'neutral'}>
                  {user.role}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'AI Thresholds' && (
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 shadow-sm max-w-2xl">
          <h3 className="text-sm font-display font-semibold text-text-primary mb-6">AI Configuration</h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-text-primary font-medium">Congestion Prediction Sensitivity</label>
                <span className="text-sm font-mono font-semibold text-accent-primary">{congestionSensitivity}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={congestionSensitivity}
                onChange={(e) => setCongestionSensitivity(Number(e.target.value))}
                className="w-full h-2 bg-bg-surface-alt rounded-full appearance-none cursor-pointer accent-accent-primary"
              />
              <div className="flex justify-between text-[10px] text-text-tertiary font-mono mt-1">
                <span>Low</span><span>Medium</span><span>High</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-text-primary font-medium">Auto-Override Confidence Threshold</label>
                <span className="text-sm font-mono font-semibold text-accent-primary">{overrideThreshold}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={100}
                value={overrideThreshold}
                onChange={(e) => setOverrideThreshold(Number(e.target.value))}
                className="w-full h-2 bg-bg-surface-alt rounded-full appearance-none cursor-pointer accent-accent-primary"
              />
              <div className="flex justify-between text-[10px] text-text-tertiary font-mono mt-1">
                <span>50%</span><span>75%</span><span>100%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'Edge Node Status' && (
        <div className="bg-bg-surface border border-border-subtle rounded-xl shadow-sm overflow-hidden max-w-2xl">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle bg-bg-surface-alt">
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-text-tertiary">Node ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-text-tertiary">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-text-tertiary">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-text-tertiary">Last Ping</th>
              </tr>
            </thead>
            <tbody>
              {edgeNodes.map((node) => (
                <tr key={node.id} className="border-b border-border-subtle last:border-0 hover:bg-bg-surface-alt transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-text-primary">{node.id}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{node.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant={node.status === 'online' ? 'green' : 'red'} dot>{node.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-text-tertiary">{node.lastPing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default Settings;
