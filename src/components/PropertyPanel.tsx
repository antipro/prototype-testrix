/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TestStepNode, TestStatus, UnitType } from '../types';
import { X, Settings2, Database, ShieldCheck, History, Code2, Globe, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PropertyPanelProps {
  node: TestStepNode | null;
  onClose: () => void;
  onUpdateNode: (nodeId: string, data: any) => void;
}

type TabType = 'general' | 'payload' | 'auth' | 'assertions' | 'history';

export function PropertyPanel({ node, onClose, onUpdateNode }: PropertyPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('general');

  if (!node) return null;

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General', icon: <Settings2 size={14} /> },
    { id: 'payload', label: 'Payload', icon: <Code2 size={14} /> },
    { id: 'auth', label: 'Auth', icon: <Key size={14} /> },
    { id: 'assertions', label: 'Safety', icon: <ShieldCheck size={14} /> },
    { id: 'history', label: 'History', icon: <History size={14} /> },
  ];

  const handleDataChange = (field: string, value: any) => {
    onUpdateNode(node.id, { ...node.data, [field]: value });
  };

  const handlePayloadChange = (field: string, value: any) => {
    onUpdateNode(node.id, { 
      ...node.data, 
      payload: { ...((node.data.payload as any) || {}), [field]: value } 
    });
  };

  return (
    <motion.div 
      initial={{ x: 400 }}
      animate={{ x: 0 }}
      exit={{ x: 400 }}
      className="w-[420px] bg-white border-l border-gray-200 shadow-2xl z-20 flex flex-col overflow-hidden"
    >
      <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between bg-[#f8f9fa]">
        <div className="flex items-center gap-3">
          <UnitIcon type={node.data.type} />
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Step Properties</span>
            <span className="text-sm font-bold text-gray-800 tracking-tight">{node.id}</span>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-md text-gray-400 transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex border-b border-gray-100 px-2 bg-white">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === tab.id 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.1 }}
            className="space-y-6"
          >
            {activeTab === 'general' && (
              <div className="space-y-5">
                <PropertyField label="Unit Type">
                  <div className="grid grid-cols-3 gap-2">
                    {(['http', 'sql', 'js'] as UnitType[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => handleDataChange('type', t)}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-md border text-[10px] font-bold uppercase transition-all ${
                          node.data.type === t 
                            ? 'bg-blue-50 border-blue-200 text-blue-600' 
                            : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                        }`}
                      >
                         <UnitIcon type={t} size={16} />
                         {t}
                      </button>
                    ))}
                  </div>
                </PropertyField>

                <PropertyField label="Display Name">
                  <input 
                    type="text"
                    value={node.data.target} 
                    onChange={(e) => handleDataChange('target', e.target.value)}
                    className="w-full text-sm font-semibold bg-gray-50 border border-gray-200 rounded-md p-2 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  />
                </PropertyField>

                <PropertyField label="Responsible Role">
                  <select 
                    value={node.data.roleId} 
                    onChange={(e) => handleDataChange('roleId', e.target.value)}
                    className="w-full text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-md p-2 outline-none"
                  >
                    <option value="doctor">Physician (Doctor)</option>
                    <option value="nurse">Medical Staff (Nurse)</option>
                    <option value="admin">System Admin</option>
                  </select>
                </PropertyField>

                <PropertyField label="Execution Status">
                   <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md border border-gray-100">
                     <StatusBadge status={node.data.status} />
                     <span className="text-[10px] text-gray-400 font-medium">Last updated: {new Date().toLocaleTimeString()}</span>
                   </div>
                </PropertyField>
              </div>
            )}

            {activeTab === 'payload' && (
              <div className="space-y-5">
                {node.data.type === 'http' && (
                  <>
                    <PropertyField label="Method & Path">
                      <div className="flex gap-2">
                        <select className="w-24 text-xs font-bold bg-blue-50 border border-blue-100 text-blue-700 rounded-md p-2">
                          <option>POST</option>
                          <option>GET</option>
                          <option>PUT</option>
                          <option>DELETE</option>
                        </select>
                        <input 
                          type="text" 
                          placeholder="/api/v1/..."
                          className="flex-1 text-xs font-mono bg-gray-50 border border-gray-200 rounded-md p-2"
                        />
                      </div>
                    </PropertyField>
                    <PropertyField label="Request Body (JSON)">
                      <textarea 
                        className="w-full h-40 text-xs font-mono bg-gray-900 text-green-400 p-3 rounded-md outline-none border border-gray-800"
                        placeholder="{}"
                      />
                    </PropertyField>
                  </>
                )}

                {node.data.type === 'sql' && (
                  <PropertyField label="Parameterized SQL Query">
                    <textarea 
                      className="w-full h-60 text-xs font-mono bg-gray-900 text-blue-300 p-3 rounded-md outline-none border border-gray-800"
                      placeholder="SELECT * FROM table WHERE id = ${input.id}"
                    />
                  </PropertyField>
                )}

                {node.data.type === 'js' && (
                  <PropertyField label="QuickJS Logic">
                    <textarea 
                      className="w-full h-60 text-xs font-mono bg-[#1e1e1e] text-yellow-200 p-3 rounded-md outline-none border border-gray-800"
                      placeholder="return { result: ctx.prev + 1 };"
                    />
                  </PropertyField>
                )}
              </div>
            )}

            {activeTab === 'assertions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Rules</span>
                  <button className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-all">+ Add Rule</button>
                </div>
                <div className="space-y-2">
                  <AssertionRule rule="response.status == 200" type="success" />
                  <AssertionRule rule="ctx.prescription_id != null" type="success" />
                  <AssertionRule rule="response.status >= 500" type="failure" />
                </div>
              </div>
            )}

            {activeTab === 'auth' && (
              <div className="space-y-6">
                <PropertyField label="Authentication Method">
                  <select className="w-full text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-md p-2 outline-none">
                    <option value="none">No Authentication</option>
                    <option value="bearer">Bearer Token (JWT)</option>
                    <option value="basic">Basic Auth (Username/Password)</option>
                    <option value="apikey">API Key (X-API-Key)</option>
                    <option value="cookie">Cookie-based Auth</option>
                    <option value="oauth2">OAuth 2.0 (Flow-based)</option>
                  </select>
                </PropertyField>

                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Active Identity</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[9px] font-bold uppercase">Dynamic</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white border border-blue-100 rounded-lg shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">JD</div>
                      <div className="flex-1">
                        <div className="text-[11px] font-bold text-gray-800">John Doe (Physician)</div>
                        <div className="text-[9px] text-gray-400 font-medium">Role: doctor • Permissions: write:prescription</div>
                      </div>
                      <button className="text-[10px] font-bold text-blue-600 hover:underline">Change</button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Context Injection</label>
                      <div className="flex items-center gap-2 text-[11px] text-gray-600 font-mono bg-gray-50/50 p-2 rounded border border-gray-100">
                        <Key size={12} />
                        <span>${`{role.doctor.token}`}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2">Advance Auth Settings</h4>
                  <div className="space-y-2">
                     <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" defaultChecked />
                        <span className="text-[11px] text-gray-600 font-medium">Auto-refresh token on 401</span>
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                        <span className="text-[11px] text-gray-600 font-medium">Strict SSL verification</span>
                     </label>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-gray-100 bg-white flex gap-3">
        <button className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-[0.98]">
          Commit Changes
        </button>
        <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all">
          Discard
        </button>
      </div>
    </motion.div>
  );
}

function PropertyField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

function UnitIcon({ type, size = 14 }: { type: UnitType; size?: number }) {
  switch (type) {
    case 'http': return <Globe size={size} className="text-blue-500" />;
    case 'sql': return <Database size={size} className="text-purple-500" />;
    case 'js': return <Code2 size={size} className="text-yellow-500" />;
    default: return <Settings2 size={size} className="text-gray-500" />;
  }
}

function StatusBadge({ status }: { status: TestStatus }) {
  const styles = {
    passed: 'bg-green-100 text-green-700 border-green-200',
    failed: 'bg-red-100 text-red-700 border-red-200',
    running: 'bg-blue-100 text-blue-700 border-blue-200',
    idle: 'bg-gray-100 text-gray-500 border-gray-200',
    skipped: 'bg-gray-50 text-gray-400 border-gray-100',
    waiting: 'bg-orange-100 text-orange-700 border-orange-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${styles[status]}`}>
      {status}
    </span>
  );
}

function AssertionRule({ rule, type }: { rule: string; type: 'success' | 'failure' }) {
  return (
    <div className={`p-2 border rounded-md flex items-center justify-between ${
      type === 'success' ? 'bg-green-50/50 border-green-100 text-green-700' : 'bg-red-50/50 border-red-100 text-red-700'
    }`}>
      <code className="text-[11px] font-mono font-medium truncate">{rule}</code>
      <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">{type}</span>
    </div>
  );
}

function HistoryItem({ date, status, duration }: { date: string; status: TestStatus; duration: number }) {
  return (
    <div className="p-3 border border-gray-100 rounded-lg flex items-center justify-between text-[11px] bg-white hover:border-blue-200 transition-colors cursor-pointer group shadow-sm shadow-gray-50">
      <div className="flex flex-col gap-0.5">
        <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors">{date}</span>
        <span className="text-[10px] text-gray-400 font-medium tracking-tight">Latency: {duration}ms</span>
      </div>
      <StatusBadge status={status} />
    </div>
  );
}
