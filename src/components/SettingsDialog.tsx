/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Database, ShieldCheck, Globe, Code2, Users, Plus, Trash2, Cpu, Key, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Role, DataSource, Environment } from '../types';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  aiConfigs: {provider: string, model: string, apiKey: string}[];
  onUpdateAiConfigs: (configs: {provider: string, model: string, apiKey: string}[]) => void;
}

type SettingsTab = 'roles' | 'datasources' | 'environments' | 'ai';

const AI_PROVIDERS = [
  { id: 'gemini', name: 'Google Gemini', models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'] },
  { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
  { id: 'anthropic', name: 'Anthropic', models: ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku'] }
];

export function SettingsDialog({ isOpen, onClose, aiConfigs, onUpdateAiConfigs }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('roles');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden h-[600px]"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#f8f9fa]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Users size={18} />
            </div>
            <h2 className="text-lg font-bold text-gray-800 tracking-tight">Project Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-48 border-r border-gray-100 bg-gray-50/50 p-3 space-y-1">
            <TabButton 
              active={activeTab === 'roles'} 
              onClick={() => setActiveTab('roles')}
              icon={<ShieldCheck size={16} />}
              label="Config & Roles"
            />
            <TabButton 
              active={activeTab === 'datasources'} 
              onClick={() => setActiveTab('datasources')}
              icon={<Database size={16} />}
              label="Data Sources"
            />
            <TabButton 
              active={activeTab === 'environments'} 
              onClick={() => setActiveTab('environments')}
              icon={<Globe size={16} />}
              label="Environments"
            />
            <div className="pt-2 mt-2 border-t border-gray-200">
              <TabButton 
                active={activeTab === 'ai'} 
                onClick={() => setActiveTab('ai')}
                icon={<Cpu size={16} />}
                label="AI Providers"
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                {activeTab === 'roles' && <RolesSettings />}
                {activeTab === 'datasources' && <DataSourceSettings />}
                {activeTab === 'environments' && <EnvironmentSettings />}
                {activeTab === 'ai' && <AiProviderSettings configs={aiConfigs} onUpdate={onUpdateAiConfigs} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function AiProviderSettings({ configs, onUpdate }: { configs: {provider: string, model: string, apiKey: string}[], onUpdate: (c: any[]) => void }) {
  const [selectedProvider, setSelectedProvider] = useState(AI_PROVIDERS[0]);
  const [selectedModel, setSelectedModel] = useState(AI_PROVIDERS[0].models[0]);
  const [apiKey, setApiKey] = useState('');

  const handleAdd = () => {
    if (apiKey) {
      onUpdate([...configs, { provider: selectedProvider.name, model: selectedModel, apiKey }]);
      setApiKey('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">AI LLM Providers</h3>
        <p className="text-xs text-gray-500 mt-1">Configure API keys for external Large Language Models used in test generation.</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Provider</label>
            <select 
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500"
              onChange={(e) => {
                const p = AI_PROVIDERS.find(ap => ap.id === e.target.value)!;
                setSelectedProvider(p);
                setSelectedModel(p.models[0]);
              }}
            >
              {AI_PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Model</label>
            <select 
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {selectedProvider.models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">API Key</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="password"
                placeholder="Paste your API key here..."
                className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:border-blue-500 font-mono"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <button 
              onClick={handleAdd}
              className="px-4 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Active Configurations</h4>
        {configs.map((c, i) => (
          <div key={i} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl hover:border-blue-200 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                <Cpu size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-800">{c.provider}</div>
                <div className="text-[10px] text-gray-400 font-medium">{c.model} • {c.apiKey.slice(0, 4)}••••••••</div>
              </div>
            </div>
            <button 
              onClick={() => onUpdate(configs.filter((_, idx) => idx !== i))}
              className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {configs.length === 0 && (
          <div className="text-center py-8 bg-gray-50/50 rounded-xl border border-dashed border-gray-100">
            <p className="text-xs text-gray-400 font-medium italic">No AI keys configured yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-lg transition-all ${
        active 
          ? 'bg-white text-blue-600 shadow-sm border border-blue-50' 
          : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function RolesSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Active Roles</h3>
          <p className="text-xs text-gray-500 mt-1">Manage user identities and session contexts for cross-role testing.</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-bold hover:bg-blue-700 transition-all">
          <Plus size={14} /> Add Role
        </button>
      </div>

      <div className="space-y-2">
        <RoleCard name="Physician (Doctor)" type="doctor" auth="Bearer Token" />
        <RoleCard name="Medical Staff (Nurse)" type="nurse" auth="Cookie Session" />
        <RoleCard name="System Admin" type="admin" auth="Basic Auth" />
      </div>
    </div>
  );
}

function RoleCard({ name, type, auth }: { name: string; type: string; auth: string }) {
  return (
    <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/30 flex items-center justify-between group hover:border-blue-200 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-lg border border-gray-100 flex items-center justify-center text-blue-500 shadow-sm">
          <ShieldCheck size={20} />
        </div>
        <div>
          <div className="text-sm font-bold text-gray-800">{name}</div>
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
            <span>Type: {type}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <span>Auth: {auth}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
          <Code2 size={16} />
        </button>
        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

function DataSourceSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">External Data Sources</h3>
          <p className="text-xs text-gray-500 mt-1">Configure databases for SQL unit execution and state validation.</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-bold hover:bg-blue-700 transition-all">
          <Plus size={14} /> Add Source
        </button>
      </div>

      <div className="p-8 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-center">
        <Database size={40} className="text-gray-200 mb-4" />
        <p className="text-sm font-bold text-gray-400">No data sources connected yet.</p>
        <button className="text-xs font-bold text-blue-600 mt-2 hover:underline">Connect to PostgreSQL</button>
      </div>
    </div>
  );
}

function EnvironmentSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Environments</h3>
          <p className="text-xs text-gray-500 mt-1">Define base URLs and variables for different deployment stages.</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-bold hover:bg-blue-700 transition-all">
          <Plus size={14} /> New Environment
        </button>
      </div>

      <div className="space-y-3">
        <div className="p-4 border border-blue-200 rounded-xl bg-blue-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white rounded-lg border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                <Globe size={20} />
             </div>
             <div>
                <div className="text-sm font-bold text-blue-800 italic">staging-v1</div>
                <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-0.5">https://api.staging.testrix.io</div>
             </div>
          </div>
          <div className="px-2 py-1 rounded bg-blue-600 text-[9px] font-bold text-white uppercase tracking-wider">Default</div>
        </div>
      </div>
    </div>
  );
}
