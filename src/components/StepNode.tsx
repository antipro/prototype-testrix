/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Handle, Position, NodeProps } from '@xyflow/react';
import { TestStepNode, UnitType } from '../types';
import { Globe, Database, Code2, Clock, CheckCircle2, XCircle, MoreVertical, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

export function StepNode({ data }: NodeProps<TestStepNode>) {
  const getIcon = () => {
    switch (data.type) {
      case 'http': return <Globe size={14} className="text-blue-500" />;
      case 'sql': return <Database size={14} className="text-purple-500" />;
      case 'js': return <Code2 size={14} className="text-yellow-500" />;
      default: return <Clock size={14} className="text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (data.status) {
      case 'passed': return 'border-green-500';
      case 'failed': return 'border-red-500';
      case 'running': return 'border-blue-500';
      case 'skipped': return 'border-gray-200 opacity-60';
      case 'waiting': return 'border-orange-400';
      default: return 'border-gray-200';
    }
  };

  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`min-w-[220px] bg-white border-2 rounded-xl shadow-md overflow-hidden transition-all ${getStatusColor()}`}
    >
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-gray-300 border-2 border-white" />
      
      <div className="px-3 py-2 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{data.type}</span>
        </div>
        <div className="flex items-center gap-1.5">
           {data.roleId && (
             <div className="px-1.5 py-0.5 rounded bg-gray-200 text-[8px] font-bold text-gray-600 uppercase">
               {data.roleId}
             </div>
           )}
           <MoreVertical size={12} className="text-gray-300" />
        </div>
      </div>

      <div className="p-4">
        <div className="text-xs font-bold text-gray-800 truncate mb-1 leading-tight">
          {data.target || 'Unnamed Step'}
        </div>
        <div className="flex items-center gap-2 mt-2">
          {data.status === 'passed' && <CheckCircle2 size={12} className="text-green-500" />}
          {data.status === 'failed' && <ShieldAlert size={12} className="text-red-500" />}
          {data.status === 'running' && (
             <motion.div 
               animate={{ rotate: 360 }} 
               transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
               className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full"
             />
          )}
          <span className={`text-[10px] font-bold uppercase tracking-tight ${
            data.status === 'passed' ? 'text-green-600' :
            data.status === 'failed' ? 'text-red-600' :
            data.status === 'running' ? 'text-blue-600' :
            'text-gray-400'
          }`}>
            {data.status}
          </span>
          {data.duration && <span className="text-[10px] text-gray-300 ml-auto font-medium">{data.duration}ms</span>}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-gray-300 border-2 border-white" />
    </motion.div>
  );
}
