/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { TestStepNode, TestStatus, UnitType } from '../types';
import { 
  X, 
  Settings2, 
  Database, 
  ShieldCheck, 
  History, 
  Code2, 
  Globe, 
  Key, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  Plus, 
  Layers, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Search,
  SlidersHorizontal,
  ExternalLink,
  Copy,
  Download,
  Filter,
  FileText,
  UserCheck,
  Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PropertyPanelProps {
  node: TestStepNode | null;
  nodes?: TestStepNode[];
  onSelectNode?: (nodeId: string) => void;
  onClose?: () => void;
  onUpdateNode: (nodeId: string, data: any) => void;
}

type TabType = 'properties' | 'payload' | 'auth' | 'assertions' | 'audit';

interface AuditRecord {
  id: string;
  traceId: string;
  nodeId: string;
  nodeTarget: string;
  nodeType: UnitType;
  timestamp: string;
  duration: number;
  status: TestStatus;
  httpStatus: number;
  role: string;
  operator: string;
  trigger: string;
  summary: string;
  assertionsPassed: number;
  assertionsTotal: number;
  requestBody?: string;
  responseBody?: string;
}

const MOCK_AUDIT_RECORDS: AuditRecord[] = [
  {
    id: 'aud-001',
    traceId: 'tr-9481-2a',
    nodeId: 'node-1',
    nodeTarget: '/api/v1/prescriptions',
    nodeType: 'http',
    timestamp: '2026-09-18 13:05:42',
    duration: 142,
    status: 'passed',
    httpStatus: 200,
    role: 'Physician (Doctor)',
    operator: 'Dr. John Doe (ID: 9021)',
    trigger: '手动运行 (Manual Run)',
    summary: '处方下发成功，返回 prescription_id: RX-8801',
    assertionsPassed: 3,
    assertionsTotal: 3,
    requestBody: '{\n  "patient_id": "PT-90214",\n  "prescription_code": "RX-8801",\n  "dosage": "50mg"\n}',
    responseBody: '{\n  "code": 200,\n  "status": "success",\n  "data": {\n    "prescription_id": "RX-8801",\n    "created_at": "2026-09-18T13:05:42Z"\n  }\n}'
  },
  {
    id: 'aud-002',
    traceId: 'tr-9480-1f',
    nodeId: 'node-2',
    nodeTarget: 'SELECT * FROM prescriptions',
    nodeType: 'sql',
    timestamp: '2026-09-18 13:02:18',
    duration: 48,
    status: 'passed',
    httpStatus: 200,
    role: 'Physician (Doctor)',
    operator: 'Dr. John Doe (ID: 9021)',
    trigger: '用例流测试 (Scenario Run)',
    summary: '查询处方状态完成，命中记录 1 条',
    assertionsPassed: 2,
    assertionsTotal: 2,
    requestBody: 'SELECT * FROM prescriptions WHERE id = "RX-8801";',
    responseBody: '[\n  {\n    "id": "RX-8801",\n    "patient_id": "PT-90214",\n    "status": "ACTIVE"\n  }\n]'
  },
  {
    id: 'aud-003',
    traceId: 'tr-9479-8c',
    nodeId: 'node-1',
    nodeTarget: '/api/v1/prescriptions',
    nodeType: 'http',
    timestamp: '2026-09-18 12:45:10',
    duration: 135,
    status: 'passed',
    httpStatus: 200,
    role: 'Medical Staff (Nurse)',
    operator: 'Nurse Sarah (ID: 4410)',
    trigger: 'CI 流水线 (CI Pipeline)',
    summary: '回归验证用例执行正常',
    assertionsPassed: 3,
    assertionsTotal: 3,
    requestBody: '{\n  "patient_id": "PT-88120",\n  "dosage": "20mg"\n}',
    responseBody: '{\n  "code": 200,\n  "data": { "prescription_id": "RX-8799" }\n}'
  },
  {
    id: 'aud-004',
    traceId: 'tr-9478-4b',
    nodeId: 'node-3',
    nodeTarget: 'QuickJS Assertion Sandbox',
    nodeType: 'js',
    timestamp: '2026-09-18 11:30:22',
    duration: 12,
    status: 'passed',
    httpStatus: 200,
    role: 'System Admin',
    operator: 'Security Bot (ID: 0001)',
    trigger: '定时巡检 (Cron Job)',
    summary: '沙箱上下文变量校验通过 (token_valid == true)',
    assertionsPassed: 1,
    assertionsTotal: 1,
    requestBody: 'return ctx.vars.authToken !== undefined;',
    responseBody: '{\n  "success": true,\n  "result": true\n}'
  },
  {
    id: 'aud-005',
    traceId: 'tr-9477-7e',
    nodeId: 'node-1',
    nodeTarget: '/api/v1/prescriptions',
    nodeType: 'http',
    timestamp: '2026-09-18 10:15:05',
    duration: 520,
    status: 'failed',
    httpStatus: 504,
    role: 'Physician (Doctor)',
    operator: 'Dr. John Doe (ID: 9021)',
    trigger: '压力测试 (Stress Test)',
    summary: '网关超时 (Gateway Timeout > 500ms 断言违规)',
    assertionsPassed: 1,
    assertionsTotal: 3,
    requestBody: '{\n  "patient_id": "PT-OVERLOAD",\n  "batch_count": 500\n}',
    responseBody: '{\n  "error": "Gateway Timeout",\n  "code": 504,\n  "latency": 520\n}'
  },
  {
    id: 'aud-006',
    traceId: 'tr-9476-3d',
    nodeId: 'node-1',
    nodeTarget: '/api/v1/prescriptions',
    nodeType: 'http',
    timestamp: '2026-09-17 17:20:41',
    duration: 154,
    status: 'passed',
    httpStatus: 200,
    role: 'Physician (Doctor)',
    operator: 'Dr. John Doe (ID: 9021)',
    trigger: '手动运行 (Manual Run)',
    summary: '基线版本接口对比测试通过',
    assertionsPassed: 3,
    assertionsTotal: 3,
    requestBody: '{\n  "patient_id": "PT-90001"\n}',
    responseBody: '{\n  "code": 200,\n  "data": { "prescription_id": "RX-8750" }\n}'
  }
];

export function PropertyPanel({ 
  node, 
  nodes = [], 
  onSelectNode, 
  onClose, 
  onUpdateNode 
}: PropertyPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('properties');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleToggleExpanded = (next?: boolean) => {
    const nextVal = typeof next === 'boolean' ? next : !isExpanded;
    setIsExpanded(nextVal);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 250);
  };

  // Audit tab filters
  const [auditSearch, setAuditSearch] = useState('');
  const [auditStatusFilter, setAuditStatusFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [auditNodeFilter, setAuditNodeFilter] = useState<'all' | 'current'>('all');
  const [selectedAuditRecord, setSelectedAuditRecord] = useState<AuditRecord | null>(null);
  const [copiedTraceId, setCopiedTraceId] = useState<string | null>(null);

  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'properties', label: 'Node Properties', icon: <Settings2 size={13} /> },
    { id: 'payload', label: 'Payload', icon: <Code2 size={13} /> },
    { id: 'auth', label: 'Auth', icon: <Key size={13} /> },
    { id: 'assertions', label: 'Safety', icon: <ShieldCheck size={13} />, badge: '3' },
    { id: 'audit', label: 'Audit Records', icon: <History size={13} />, badge: '6' },
  ];

  const handleDataChange = (field: string, value: any) => {
    if (!node) return;
    onUpdateNode(node.id, { ...node.data, [field]: value });
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1800);
  };

  const handleCopyTrace = (traceId: string) => {
    navigator.clipboard?.writeText(traceId);
    setCopiedTraceId(traceId);
    setTimeout(() => setCopiedTraceId(null), 1500);
  };

  // Filtered audit records
  const filteredAuditRecords = useMemo(() => {
    return MOCK_AUDIT_RECORDS.filter((rec) => {
      if (auditStatusFilter !== 'all' && rec.status !== auditStatusFilter) return false;
      if (auditNodeFilter === 'current' && node && rec.nodeId !== node.id) return false;
      if (auditSearch.trim()) {
        const q = auditSearch.toLowerCase();
        return (
          rec.nodeTarget.toLowerCase().includes(q) ||
          rec.traceId.toLowerCase().includes(q) ||
          rec.operator.toLowerCase().includes(q) ||
          rec.summary.toLowerCase().includes(q) ||
          String(rec.httpStatus).includes(q)
        );
      }
      return true;
    });
  }, [auditStatusFilter, auditNodeFilter, auditSearch, node]);

  // If no node is selected, render a minimal empty bar
  if (!node) {
    return (
      <div className="w-full bg-white border-t border-gray-200 shadow-sm shrink-0 z-10">
        <div className="h-11 px-4 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={13} className="text-gray-400" />
              No Node Selected
            </span>
            <span className="text-xs text-gray-400">Click a node on the canvas to inspect and edit its properties.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border-t border-gray-200 shadow-lg shrink-0 flex flex-col z-10 transition-all duration-200">
      {/* Fixed Tab Header Bar */}
      <div className="h-11 px-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/80 select-none">
        {/* Tabs - starts directly from the left for maximum width */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto py-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (!isExpanded) handleToggleExpanded(true);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id && isExpanded
                  ? 'bg-blue-50 text-blue-600 border border-blue-200/80 shadow-2xs font-bold' 
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/80 border border-transparent'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === tab.id && isExpanded
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Right: Actions & Collapse Controls */}
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <button 
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all shadow-sm active:scale-95 ${
              isSaved 
                ? 'bg-green-600 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100'
            }`}
          >
            {isSaved ? <Check size={13} /> : <CheckCircle2 size={13} />}
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <div className="h-4 w-[1px] bg-gray-200 mx-1" />

          <button 
            onClick={() => handleToggleExpanded()}
            className="p-1.5 hover:bg-gray-200/80 rounded-md text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1 text-xs font-medium"
            title={isExpanded ? 'Collapse panel' : 'Expand panel'}
          >
            {isExpanded ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
            <span className="text-[11px]">{isExpanded ? 'Collapse' : 'Expand'}</span>
          </button>

          {onClose && (
            <button 
              onClick={onClose} 
              className="p-1.5 hover:bg-gray-200/80 rounded-md text-gray-400 hover:text-gray-700 transition-colors"
              title="Close panel"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Tab Content Body (Expanded) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="h-72 overflow-y-auto p-4 bg-white">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.1 }}
                  className="h-full"
                >
                  {/* TAB 1: NODE PROPERTIES */}
                  {activeTab === 'properties' && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
                      {/* Col 1: Unit Type & ID */}
                      <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-100 flex flex-col justify-between">
                        <PropertyField label="Unit Type & Protocol">
                          <div className="grid grid-cols-3 gap-1.5 mt-2">
                            {(['http', 'sql', 'js'] as UnitType[]).map((t) => (
                              <button
                                key={t}
                                onClick={() => handleDataChange('type', t)}
                                className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                                  node.data.type === t 
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                              >
                                <UnitIcon type={t} size={15} />
                                <span>{t}</span>
                              </button>
                            ))}
                          </div>
                        </PropertyField>

                        <div className="space-y-1 mt-3">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Node ID</label>
                          <div className="text-xs font-mono font-semibold text-gray-700 bg-white px-2.5 py-1.5 rounded border border-gray-200 flex items-center justify-between">
                            <span>{node.id}</span>
                            <span className="text-[10px] text-gray-400 font-sans">Read-only</span>
                          </div>
                        </div>
                      </div>

                      {/* Col 2: Display Name & Target Route */}
                      <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-100 flex flex-col justify-between">
                        <div className="space-y-3">
                          <PropertyField label="Target Route / Name">
                            <input 
                              type="text" 
                              value={node.data.target} 
                              onChange={(e) => handleDataChange('target', e.target.value)}
                              className="w-full text-xs font-semibold bg-white border border-gray-200 rounded-lg p-2.5 mt-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none transition-all text-gray-800"
                              placeholder="e.g. /api/v1/prescriptions"
                            />
                          </PropertyField>

                          <PropertyField label="Tags">
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-semibold border border-blue-200/60">P0-Core</span>
                              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-semibold border border-purple-200/60">Prescription</span>
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-semibold border border-emerald-200/60">Audited</span>
                            </div>
                          </PropertyField>
                        </div>

                        <div className="text-[10px] text-gray-400 mt-2">
                          Identifies the step in execution, DAG canvas, and audit logs.
                        </div>
                      </div>

                      {/* Col 3: Responsible Role & Permissions */}
                      <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-100 flex flex-col justify-between">
                        <PropertyField label="Responsible Role">
                          <select 
                            value={node.data.roleId} 
                            onChange={(e) => handleDataChange('roleId', e.target.value)}
                            className="w-full text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-lg p-2.5 mt-1.5 outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option value="doctor">Physician / Doctor</option>
                            <option value="nurse">Medical Staff / Nurse</option>
                            <option value="admin">System Admin</option>
                          </select>
                        </PropertyField>

                        <div className="space-y-1.5 mt-2 p-2 bg-white rounded-lg border border-gray-200/70">
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-700">
                            <UserCheck size={13} className="text-blue-500" />
                            <span>Role Permission Mapping:</span>
                          </div>
                          <p className="text-[10px] text-gray-500 leading-normal">
                            Auto-injects OAuth Bearer token and audit authorization for this role.
                          </p>
                        </div>
                      </div>

                      {/* Col 4: Execution Status & Policy */}
                      <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-100 flex flex-col justify-between">
                        <div>
                          <PropertyField label="Execution Status & Latency">
                            <div className="flex items-center gap-2 mt-1.5">
                              <StatusBadge status={node.data.status} />
                              <span className="text-[11px] text-gray-600 font-mono font-bold flex items-center gap-1">
                                <Timer size={12} className="text-gray-400" />
                                142ms
                              </span>
                            </div>
                          </PropertyField>

                          <div className="grid grid-cols-2 gap-2 mt-3">
                            <div className="bg-white p-2 rounded border border-gray-200">
                              <span className="text-[9px] font-bold text-gray-400 uppercase block">Timeout</span>
                              <span className="text-xs font-bold text-gray-800">5000ms</span>
                            </div>
                            <div className="bg-white p-2 rounded border border-gray-200">
                              <span className="text-[9px] font-bold text-gray-400 uppercase block">Retries</span>
                              <span className="text-xs font-bold text-gray-800">3 Max</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                          <Clock size={11} />
                          <span>Last run: {new Date().toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: PAYLOAD */}
                  {activeTab === 'payload' && (
                    <div className="h-full">
                      {node.data.type === 'http' && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full">
                          <div className="md:col-span-4 space-y-3">
                            <PropertyField label="HTTP Method & Path">
                              <div className="flex gap-2 mt-1">
                                <select className="w-24 text-xs font-bold bg-blue-50 border border-blue-200 text-blue-700 rounded-lg p-2 outline-none">
                                  <option>POST</option>
                                  <option>GET</option>
                                  <option>PUT</option>
                                  <option>DELETE</option>
                                </select>
                                <input 
                                  type="text" 
                                  defaultValue={node.data.target || '/api/v1/resource'}
                                  placeholder="/api/v1/..."
                                  className="flex-1 text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg p-2 outline-none focus:border-blue-500 focus:bg-white"
                                />
                              </div>
                            </PropertyField>

                            <PropertyField label="Request Headers">
                              <div className="space-y-1.5 text-xs font-mono">
                                <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100 text-[11px]">
                                  <span className="text-gray-500">Content-Type</span>
                                  <span className="text-gray-800 font-semibold">application/json</span>
                                </div>
                                <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100 text-[11px]">
                                  <span className="text-gray-500">Authorization</span>
                                  <span className="text-blue-600 font-semibold truncate max-w-[140px]">Bearer ${`{token}`}</span>
                                </div>
                              </div>
                            </PropertyField>
                          </div>

                          <div className="md:col-span-8 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Request Body (JSON)</span>
                              <button className="text-[10px] font-bold text-blue-600 hover:underline">Format JSON</button>
                            </div>
                            <textarea 
                              className="flex-1 w-full text-xs font-mono bg-gray-900 text-green-400 p-3 rounded-xl outline-none border border-gray-800 resize-none leading-relaxed"
                              defaultValue={JSON.stringify({
                                patient_id: "PT-90214",
                                prescription_code: "RX-8801",
                                dosage: "50mg",
                                frequency: "BID",
                                notes: "Take with food"
                              }, null, 2)}
                            />
                          </div>
                        </div>
                      )}

                      {node.data.type === 'sql' && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full">
                          <div className="md:col-span-4 space-y-3">
                            <PropertyField label="Target Data Source">
                              <select className="w-full text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-2 outline-none mt-1">
                                <option>PostgreSQL (HIS_Core_DB)</option>
                                <option>MySQL (Audit_Cluster)</option>
                                <option>Redis (Session_Cache)</option>
                              </select>
                            </PropertyField>
                            <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl text-[11px] text-purple-800 space-y-1">
                              <span className="font-bold block">Parameterized SQL Injection Defense</span>
                              <p className="text-purple-600 text-[10px]">Reference predecessor step context: <code className="bg-purple-100 px-1 rounded">${`{input.id}`}</code></p>
                            </div>
                          </div>
                          <div className="md:col-span-8 flex flex-col h-full">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Parameterized SQL Statement</span>
                            <textarea 
                              className="flex-1 w-full text-xs font-mono bg-gray-900 text-blue-300 p-3 rounded-xl outline-none border border-gray-800 resize-none leading-relaxed"
                              defaultValue={`SELECT id, patient_id, status, created_at \nFROM prescriptions \nWHERE status = 'ACTIVE' AND physician_id = \${role.doctor.id}\nORDER BY created_at DESC LIMIT 10;`}
                            />
                          </div>
                        </div>
                      )}

                      {node.data.type === 'js' && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full">
                          <div className="md:col-span-4 space-y-3">
                            <PropertyField label="QuickJS Sandbox Runtime">
                              <div className="p-3 bg-yellow-50/50 border border-yellow-200/60 rounded-xl text-[11px] text-yellow-900 space-y-1.5 mt-1">
                                <span className="font-bold flex items-center gap-1">
                                  <Code2 size={13} className="text-yellow-600" />
                                  Available Global Objects:
                                </span>
                                <ul className="text-[10px] text-yellow-800 space-y-0.5 list-disc list-inside">
                                  <li><code>ctx.prev</code>: Previous node execution response</li>
                                  <li><code>ctx.vars</code>: Global scenario environment vars</li>
                                  <li><code>ctx.assert(bool, msg)</code>: Custom assertion check</li>
                                </ul>
                              </div>
                            </PropertyField>
                          </div>
                          <div className="md:col-span-8 flex flex-col h-full">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Sandbox Logic (QuickJS)</span>
                            <textarea 
                              className="flex-1 w-full text-xs font-mono bg-[#1e1e1e] text-yellow-200 p-3 rounded-xl outline-none border border-gray-800 resize-none leading-relaxed"
                              defaultValue={`// Extract token from previous response and inject into scenario variables\nconst resp = ctx.prev.data;\nif (resp && resp.token) {\n  ctx.vars.authToken = resp.token;\n  return { success: true, tokenExpiresIn: 3600 };\n}\nthrow new Error("Missing token in previous response");`}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: AUTH */}
                  {activeTab === 'auth' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                      <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-100 flex flex-col justify-between">
                        <PropertyField label="Auth Method">
                          <select className="w-full text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-lg p-2.5 mt-2 outline-none focus:border-blue-500 cursor-pointer">
                            <option value="bearer">Bearer Token (JWT)</option>
                            <option value="basic">Basic Auth (Credentials)</option>
                            <option value="apikey">API Key (X-API-Key Header)</option>
                            <option value="cookie">Cookie / Session State</option>
                            <option value="oauth2">OAuth 2.0 (Trusted Flow)</option>
                            <option value="none">No Auth (Public Endpoint)</option>
                          </select>
                        </PropertyField>
                        <div className="text-[10px] text-gray-400 mt-2">
                          Automatically resolves or injects active authentication credentials.
                        </div>
                      </div>

                      <div className="bg-blue-50/40 p-3.5 rounded-xl border border-blue-100 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Active Role Binding</span>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[9px] font-bold uppercase">Dynamic</span>
                          </div>
                          <div className="flex items-center gap-3 p-2.5 bg-white border border-blue-100 rounded-lg shadow-2xs">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">JD</div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-gray-800 truncate">John Doe (Physician)</div>
                              <div className="text-[9px] text-gray-400 truncate">Role: doctor • Permissions: write:prescription</div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 text-[10px] font-mono text-gray-600 bg-white/80 p-1.5 rounded border border-blue-100 flex items-center gap-1">
                          <Key size={11} className="text-blue-500 shrink-0" />
                          <span className="truncate">${`{role.doctor.token}`}</span>
                        </div>
                      </div>

                      <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-100 space-y-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Security Policies</span>
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 font-medium">
                          <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" defaultChecked />
                          <span>Auto-refresh token and retry on 401</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 font-medium">
                          <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" defaultChecked />
                          <span>Strictly verify response SSL certificate</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 font-medium">
                          <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                          <span>Record full auth handshake trace logs</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: ASSERTIONS (SAFETY) */}
                  {activeTab === 'assertions' && (
                    <div className="space-y-3 h-full flex flex-col">
                      <div className="flex items-center justify-between shrink-0">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Safety Rules</span>
                        <button className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 px-2.5 py-1 rounded-md transition-all border border-blue-200">
                          <Plus size={12} />
                          <span>Add Assertion Rule</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1 overflow-y-auto">
                        <AssertionRuleCard 
                          rule="response.status == 200" 
                          description="Verify HTTP response status code is success" 
                          type="success" 
                          status="passed"
                        />
                        <AssertionRuleCard 
                          rule="ctx.prescription_id != null" 
                          description="Response body must contain unique prescription code" 
                          type="success" 
                          status="passed"
                        />
                        <AssertionRuleCard 
                          rule="response.duration < 500" 
                          description="End-to-end latency must remain below 500ms" 
                          type="success" 
                          status="passed"
                        />
                        <AssertionRuleCard 
                          rule="response.status >= 500" 
                          description="Catch server internal errors and critical crashes" 
                          type="failure" 
                          status="idle"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 5: 执行审计记录 (AUDIT RECORDS - LIST VIEW) */}
                  {activeTab === 'audit' && (
                    <div className="h-full flex flex-col space-y-2.5">
                      {/* Filter & Toolbar Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 shrink-0 bg-gray-50/80 p-2 rounded-xl border border-gray-200/70">
                        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                          <div className="relative flex-1 max-w-xs">
                            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                              type="text"
                              value={auditSearch}
                              onChange={(e) => setAuditSearch(e.target.value)}
                              placeholder="Search records (node / trace ID / status / operator)..."
                              className="w-full pl-8 pr-3 py-1 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 text-gray-800"
                            />
                            {auditSearch && (
                              <button 
                                onClick={() => setAuditSearch('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>

                          {/* Status Filter */}
                          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 text-[11px]">
                            <button
                              onClick={() => setAuditStatusFilter('all')}
                              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                                auditStatusFilter === 'all' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-500 hover:text-gray-800'
                              }`}
                            >
                              All ({MOCK_AUDIT_RECORDS.length})
                            </button>
                            <button
                              onClick={() => setAuditStatusFilter('passed')}
                              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                                auditStatusFilter === 'passed' ? 'bg-green-50 text-green-700 font-bold' : 'text-gray-500 hover:text-gray-800'
                              }`}
                            >
                              Passed
                            </button>
                            <button
                              onClick={() => setAuditStatusFilter('failed')}
                              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                                auditStatusFilter === 'failed' ? 'bg-red-50 text-red-700 font-bold' : 'text-gray-500 hover:text-gray-800'
                              }`}
                            >
                              Failed
                            </button>
                          </div>

                          {/* Scope Filter */}
                          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 text-[11px]">
                            <button
                              onClick={() => setAuditNodeFilter('all')}
                              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                                auditNodeFilter === 'all' ? 'bg-gray-100 text-gray-800 font-bold' : 'text-gray-500 hover:text-gray-800'
                              }`}
                            >
                              All Nodes
                            </button>
                            <button
                              onClick={() => setAuditNodeFilter('current')}
                              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                                auditNodeFilter === 'current' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-500 hover:text-gray-800'
                              }`}
                            >
                              Current Node ({node.id})
                            </button>
                          </div>
                        </div>

                        {/* Summary Stats Badges */}
                        <div className="flex items-center gap-3 text-[11px] text-gray-500">
                          <span>Pass Rate: <strong className="text-green-600 font-bold">83.3%</strong></span>
                          <span>Avg Latency: <strong className="text-gray-800 font-bold">168ms</strong></span>
                          <span className="text-gray-400">Showing {filteredAuditRecords.length} records</span>
                        </div>
                      </div>

                      {/* Audit Records List / Table */}
                      <div className="flex-1 overflow-y-auto border border-gray-200 rounded-xl overflow-hidden shadow-2xs bg-white">
                        {filteredAuditRecords.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-gray-400 py-8">
                            <History size={32} className="opacity-20 mb-2" />
                            <p className="text-xs">No matching audit records found</p>
                          </div>
                        ) : (
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-gray-50/90 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-xs">
                                <th className="py-2.5 px-3">Status</th>
                                <th className="py-2.5 px-3">Timestamp</th>
                                <th className="py-2.5 px-3">Target & Step</th>
                                <th className="py-2.5 px-3">Role & Operator</th>
                                <th className="py-2.5 px-3">HTTP</th>
                                <th className="py-2.5 px-3">Latency</th>
                                <th className="py-2.5 px-3">Assertions</th>
                                <th className="py-2.5 px-3">Trace ID</th>
                                <th className="py-2.5 px-3 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs">
                              {filteredAuditRecords.map((rec) => {
                                const isSelected = selectedAuditRecord?.id === rec.id;
                                return (
                                  <React.Fragment key={rec.id}>
                                    <tr 
                                      onClick={() => setSelectedAuditRecord(isSelected ? null : rec)}
                                      className={`hover:bg-blue-50/40 cursor-pointer transition-colors ${
                                        isSelected ? 'bg-blue-50/60' : ''
                                      }`}
                                    >
                                      {/* Status */}
                                      <td className="py-2.5 px-3">
                                        <StatusBadge status={rec.status} />
                                      </td>

                                      {/* Timestamp & Trigger */}
                                      <td className="py-2.5 px-3 font-mono text-[11px] text-gray-600">
                                        <div className="font-semibold text-gray-800">{rec.timestamp.split(' ')[1]}</div>
                                        <div className="text-[10px] text-gray-400">{rec.trigger}</div>
                                      </td>

                                      {/* Target Node */}
                                      <td className="py-2.5 px-3">
                                        <div className="flex items-center gap-1.5">
                                          <UnitIcon type={rec.nodeType} size={13} />
                                          <span className="font-semibold text-gray-800 font-mono text-[11px] truncate max-w-[180px]">
                                            {rec.nodeTarget}
                                          </span>
                                        </div>
                                        <span className="text-[10px] text-gray-400">{rec.summary}</span>
                                      </td>

                                      {/* Role / Operator */}
                                      <td className="py-2.5 px-3 text-gray-700 text-[11px]">
                                        <div className="font-semibold">{rec.role}</div>
                                        <div className="text-[10px] text-gray-400">{rec.operator}</div>
                                      </td>

                                      {/* HTTP / Exec Status */}
                                      <td className="py-2.5 px-3">
                                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                                          rec.httpStatus === 200 
                                            ? 'bg-green-50 text-green-700 border border-green-200' 
                                            : 'bg-red-50 text-red-700 border border-red-200'
                                        }`}>
                                          {rec.httpStatus}
                                        </span>
                                      </td>

                                      {/* Latency */}
                                      <td className="py-2.5 px-3 font-mono text-[11px] font-bold">
                                        <span className={rec.duration > 300 ? 'text-orange-600' : 'text-gray-700'}>
                                          {rec.duration}ms
                                        </span>
                                      </td>

                                      {/* Assertions */}
                                      <td className="py-2.5 px-3 text-[11px]">
                                        <span className={`font-semibold ${
                                          rec.assertionsPassed === rec.assertionsTotal ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                          {rec.assertionsPassed}/{rec.assertionsTotal} Passed
                                        </span>
                                      </td>

                                      {/* Trace ID */}
                                      <td className="py-2.5 px-3 font-mono text-[11px] text-gray-500">
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopyTrace(rec.traceId);
                                          }}
                                          className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                                          title="Copy Trace ID"
                                        >
                                          <span>{rec.traceId}</span>
                                          {copiedTraceId === rec.traceId ? (
                                            <Check size={11} className="text-green-600" />
                                          ) : (
                                            <Copy size={11} className="opacity-50 hover:opacity-100" />
                                          )}
                                        </button>
                                      </td>

                                      {/* Actions */}
                                      <td className="py-2.5 px-3 text-right">
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedAuditRecord(isSelected ? null : rec);
                                          }}
                                          className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                                        >
                                          {isSelected ? 'Collapse' : 'Inspect'}
                                        </button>
                                      </td>
                                    </tr>

                                    {/* Expanded Detail Inspection Row */}
                                    {isSelected && (
                                      <tr>
                                        <td colSpan={9} className="p-3 bg-gray-50/90 border-b border-gray-200">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                            {/* Request Snapshot */}
                                            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs">
                                              <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-gray-100">
                                                <span className="font-bold text-gray-700 flex items-center gap-1">
                                                  <FileText size={12} className="text-blue-600" />
                                                  Request Payload Snapshot
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-mono">{rec.nodeType.toUpperCase()}</span>
                                              </div>
                                              <pre className="p-2 bg-gray-900 text-gray-200 rounded font-mono text-[11px] overflow-x-auto max-h-32">
                                                {rec.requestBody || '// No request body'}
                                              </pre>
                                            </div>

                                            {/* Response Snapshot */}
                                            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs">
                                              <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-gray-100">
                                                <span className="font-bold text-gray-700 flex items-center gap-1">
                                                  <FileText size={12} className="text-green-600" />
                                                  Response Body Snapshot
                                                </span>
                                                <span className="text-[10px] font-bold text-green-600">HTTP {rec.httpStatus}</span>
                                              </div>
                                              <pre className="p-2 bg-gray-900 text-green-400 rounded font-mono text-[11px] overflow-x-auto max-h-32">
                                                {rec.responseBody || '// No response data'}
                                              </pre>
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PropertyField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">{label}</label>
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
    passed: 'bg-green-50 text-green-700 border-green-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
    running: 'bg-blue-50 text-blue-700 border-blue-200',
    idle: 'bg-gray-50 text-gray-500 border-gray-200',
    skipped: 'bg-gray-50 text-gray-400 border-gray-100',
    waiting: 'bg-orange-50 text-orange-700 border-orange-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${styles[status]}`}>
      {status}
    </span>
  );
}

function AssertionRuleCard({ 
  rule, 
  description, 
  type, 
  status 
}: { 
  rule: string; 
  description: string; 
  type: 'success' | 'failure';
  status: 'passed' | 'failed' | 'idle';
}) {
  return (
    <div className={`p-3 rounded-xl border flex flex-col justify-between ${
      type === 'success' ? 'bg-green-50/40 border-green-100' : 'bg-red-50/40 border-red-100'
    }`}>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <code className="text-xs font-mono font-bold text-gray-800 truncate">{rule}</code>
          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
            status === 'passed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {status}
          </span>
        </div>
        <p className="text-[11px] text-gray-500">{description}</p>
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100/60 text-[10px]">
        <span className="font-semibold text-gray-400 uppercase">{type === 'success' ? '期望达标' : '违规阻断'}</span>
        <button className="text-gray-400 hover:text-blue-600 font-medium">编辑</button>
      </div>
    </div>
  );
}
