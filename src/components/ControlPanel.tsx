/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Square, Circle, Settings, Layout, Share2, Save, Terminal, Plus, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface ControlPanelProps {
  onOpenSettings: () => void;
  onOpenAiAssistant: () => void;
}

export function ControlPanel({ onOpenSettings, onOpenAiAssistant }: ControlPanelProps) {
  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-10 shadow-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 mr-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">T</div>
          <span className="font-bold text-gray-800 tracking-tight">Testrix <span className="text-blue-600">Studio</span></span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={onOpenAiAssistant}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95 group"
          title="输入大模型文本 (Prompt)"
        >
          <Sparkles size={14} className="text-blue-200 group-hover:rotate-12 transition-transform" />
          <span>Prompt</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md">
          <span className="text-xs text-gray-500 font-medium">Environment:</span>
          <select className="text-xs font-bold text-gray-700 bg-transparent border-none focus:ring-0 p-0 cursor-pointer">
            <option>QA Staging</option>
            <option>Local Chrome</option>
            <option>Production (Read-only)</option>
          </select>
        </div>

        <div className="flex items-center gap-1 border-l border-gray-200 pl-4">
          <IconButton icon={<Settings size={18} />} label="Settings" onClick={onOpenSettings} />
        </div>
      </div>
    </div>
  );
}

function IconButton({ icon, label, onClick, primary }: { icon: React.ReactNode, label: string, onClick?: () => void, primary?: boolean }) {
  return (
    <button 
      onClick={onClick} 
      className={`p-2 rounded-md transition-all group relative ${
        primary 
          ? 'text-white bg-blue-600 hover:bg-blue-700 shadow-sm' 
          : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
      }`}
    >
      {icon}
      <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
        {label}
      </span>
    </button>
  );
}
