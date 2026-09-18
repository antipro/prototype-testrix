/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Terminal, ChevronUp, ChevronDown, Trash2, Download } from 'lucide-react';
import { LogEntry } from '../types';
import { useState } from 'react';

interface LogPanelProps {
  logs: LogEntry[];
  onClear: () => void;
}

export function LogPanel({ logs, onClear }: LogPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`bg-gray-900 text-gray-300 border-t border-gray-700 transition-all duration-300 flex flex-col ${isExpanded ? 'h-64' : 'h-10'}`}>
      <div 
        className="h-10 px-4 flex items-center justify-between cursor-pointer border-b border-gray-800"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-wider">Console Output</span>
          <span className="ml-2 px-1.5 py-0.5 bg-gray-800 rounded text-[10px] text-gray-500">{logs.length} entries</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
             <button 
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="p-1 hover:text-white transition-colors"
              title="Clear Logs"
            >
              <Trash2 size={14} />
            </button>
            <button 
              className="p-1 hover:text-white transition-colors"
              title="Export Logs"
            >
              <Download size={14} />
            </button>
          </div>
          {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>
      </div>

      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-2 font-mono text-[12px] leading-relaxed">
          {logs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-600 italic">
              No logs to display. Start a test to see output.
            </div>
          ) : (
            <div className="space-y-0.5">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-4 hover:bg-gray-800/50 px-2 py-0.5 rounded">
                  <span className="text-gray-500 shrink-0">
                    {log.timestamp.toLocaleTimeString([], { hour12: false })}
                  </span>
                  <span className={`uppercase font-bold shrink-0 w-16 ${
                    log.level === 'error' ? 'text-red-400' : 
                    log.level === 'success' ? 'text-green-400' : 
                    log.level === 'warn' ? 'text-yellow-400' : 
                    'text-blue-400'
                  }`}>
                    [{log.level}]
                  </span>
                  <span className={log.level === 'error' ? 'text-red-200' : 'text-gray-300'}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
