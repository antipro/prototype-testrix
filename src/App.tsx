/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { LogPanel } from './components/LogPanel';
import { SettingsDialog } from './components/SettingsDialog';
import { AIPrompt } from './components/AIPrompt';
import { Project, Folder, Scenario, TestCase, TestStepNode, LogEntry } from './types';
import { Edge } from '@xyflow/react';
import { Settings, Folder as FolderIcon, LayoutGrid, Info, Share2, Save, Code2, Trash2, Plus } from 'lucide-react';

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Hospital Management',
    contextFolders: [
      '/src',
      '/tests',
      '/config',
      '/docs'
    ],
    folders: [
      {
        id: 'f1',
        name: '/Prescriptions',
        variables: [
          { key: 'API_VERSION', value: 'v1' },
          { key: 'RETRY_LIMIT', value: '3' }
        ],
        scenarios: [
          {
            id: 's1',
            name: 'Prescription Lifecycle',
            description: 'End-to-end workflow from physician creation to nurse fulfillment',
            nodes: [
              { 
                id: 'step1', 
                type: 'step', 
                position: { x: 50, y: 150 }, 
                data: { 
                  type: 'http',
                  action: 'POST', 
                  target: 'Create Prescription', 
                  value: '', 
                  status: 'idle',
                  roleId: 'doctor',
                  payload: {
                    method: 'POST',
                    path: '/api/v1/prescriptions',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ patientId: 'P123', drugCode: 'ASP-100' }, null, 2)
                  }
                } 
              },
              { 
                id: 'step2', 
                type: 'step', 
                position: { x: 350, y: 150 }, 
                data: { 
                  type: 'sql',
                  action: 'QUERY', 
                  target: 'Verify Stock', 
                  value: '', 
                  status: 'idle',
                  roleId: 'admin',
                  payload: {
                    dataSourceId: 'main-db',
                    query: 'SELECT stock FROM inventory WHERE item_id = \'ASP-100\''
                  }
                } 
              },
              { 
                id: 'step3', 
                type: 'step', 
                position: { x: 650, y: 150 }, 
                data: { 
                  type: 'js',
                  action: 'TRANSFORM', 
                  target: 'Calculate Dosage', 
                  value: '', 
                  status: 'idle',
                  roleId: 'nurse',
                  payload: {
                    code: 'return { dosage: ctx.weight * 0.5 };'
                  }
                } 
              },
              { 
                id: 'step4', 
                type: 'step', 
                position: { x: 950, y: 150 }, 
                data: { 
                  type: 'http',
                  action: 'PUT', 
                  target: 'Confirm Fulfillment', 
                  value: '', 
                  status: 'idle',
                  roleId: 'nurse',
                  payload: {
                    method: 'PUT',
                    path: '/api/v1/prescriptions/${ctx.prescription_id}/fulfill',
                    headers: { 'Authorization': 'Bearer ${role.nurse.token}' },
                    body: '{}'
                  }
                } 
              },
            ],
            edges: [
              { id: 'e1-2', source: 'step1', target: 'step2', animated: true },
              { id: 'e2-3', source: 'step2', target: 'step3', animated: true },
              { id: 'e3-4', source: 'step3', target: 'step4', animated: true },
            ],
            testCases: [
              {
                id: 'tc1',
                scenarioId: 's1',
                name: 'Normal Case - Aspirin',
                description: 'Standard flow with positive stock',
                inputs: { drug: 'Aspirin', patientId: 'P123' },
                status: 'idle'
              },
              {
                id: 'tc2',
                scenarioId: 's1',
                name: 'Error Case - Out of Stock',
                description: 'Flow expecting inventory failure',
                inputs: { drug: 'N/A', patientId: 'P999' },
                status: 'failed'
              }
            ]
          }
        ]
      }
    ]
  }
];

const INITIAL_LOGS: LogEntry[] = [
  { id: 'l1', timestamp: new Date(), level: 'info', message: 'Testrix Engine initialized.' },
  { id: 'l2', timestamp: new Date(), level: 'info', message: 'Ready for deterministic orchestration.' },
];

function ProjectSettings({ project, onUpdateProject }: { project: Project | null, onUpdateProject: (id: string, updates: Partial<Project>) => void }) {
  if (!project) return null;
  return (
    <div className="flex-1 bg-white p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-8 border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <LayoutGrid className="text-blue-600" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-sm text-gray-500">Project Configuration & Environment Settings</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-bold transition-all active:scale-95">
              <Share2 size={18} />
              <span>Share</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-100 active:scale-95">
              <Save size={18} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <SettingsCard icon={<Settings size={18} />} title="Global Variables">
            <div className="space-y-2">
              <div className="flex justify-between text-xs p-2 bg-gray-50 rounded border">
                <span className="font-mono text-gray-500">BASE_URL</span>
                <span className="font-bold">https://api.hospital.qa</span>
              </div>
              <div className="flex justify-between text-xs p-2 bg-gray-50 rounded border">
                <span className="font-mono text-gray-500">RETRY_COUNT</span>
                <span className="font-bold">3</span>
              </div>
            </div>
          </SettingsCard>

          <SettingsCard icon={<Info size={18} />} title="Project Info">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Project ID</label>
                <div className="text-sm font-medium">{project.id}</div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Created</label>
                <div className="text-sm font-medium">Oct 12, 2024</div>
              </div>
            </div>
          </SettingsCard>
        </div>

        <SettingsCard icon={<FolderIcon size={18} />} title="Project Folders">
            <div className="space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="e.g. /src/services"
                  className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.currentTarget;
                      if (input.value.trim()) {
                        onUpdateProject(project.id, { 
                          contextFolders: [...project.contextFolders, input.value.trim()] 
                        });
                        input.value = '';
                      }
                    }
                  }}
                />
                <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus size={16} />
                </button>
              </div>

              <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {project.contextFolders.map((folderPath, index) => (
                  <div key={`ctx-${folderPath}-${index}`} className="flex items-center justify-between group p-2 hover:bg-gray-50 rounded-md border border-transparent hover:border-gray-100 transition-all">
                    <div className="flex items-center gap-2">
                      <FolderIcon size={14} className="text-blue-500" />
                      <span className="text-xs text-gray-600 font-bold">{folderPath}</span>
                    </div>
                    <button 
                      onClick={() => {
                        const newFolders = [...project.contextFolders];
                        newFolders.splice(index, 1);
                        onUpdateProject(project.id, { contextFolders: newFolders });
                      }}
                      className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                 <p className="text-[10px] text-gray-400 leading-relaxed italic">
                   Note: These directories are indexed to provide architectural context for the AI Orchestration agent.
                 </p>
              </div>
            </div>
          </SettingsCard>
      </div>
    </div>
  );
}

function FolderSettings({ folder, onUpdateFolder }: { folder: Folder | null, onUpdateFolder: (id: string, updates: Partial<Folder>) => void }) {
  if (!folder) return null;
  return (
    <div className="flex-1 bg-white p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-8 border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <FolderIcon className="text-blue-600" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{folder.name}</h1>
              <p className="text-sm text-gray-500">Folder-level Common Properties & Inheritance</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-100 active:scale-95">
            <Save size={18} />
            <span>Save Folder</span>
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6">
          <div className="flex gap-3">
            <Info className="text-blue-600 shrink-0" size={20} />
            <p className="text-sm text-blue-800 font-medium">
              Variables defined here are automatically inherited by all Scenarios within this directory.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <SettingsCard icon={<Settings size={18} />} title="Folder Variables">
            <div className="space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Variable Name"
                  className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-colors"
                  id="folder-var-key"
                />
                <input 
                  type="text"
                  placeholder="Value"
                  className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-colors"
                  id="folder-var-val"
                />
                <button 
                  onClick={() => {
                    const keyInput = document.getElementById('folder-var-key') as HTMLInputElement;
                    const valInput = document.getElementById('folder-var-val') as HTMLInputElement;
                    if (keyInput.value && valInput.value) {
                      const newVars = [...(folder.variables || []), { key: keyInput.value, value: valInput.value }];
                      onUpdateFolder(folder.id, { variables: newVars });
                      keyInput.value = '';
                      valInput.value = '';
                    }
                  }}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="space-y-2">
                {(folder.variables || []).map((v, i) => (
                  <div key={`var-${v.key}-${i}`} className="flex justify-between items-center text-xs p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-gray-400 uppercase tracking-wider">{v.key}</span>
                      <span className="text-gray-600 font-mono">{v.value}</span>
                    </div>
                    <button 
                      onClick={() => {
                        const newVars = (folder.variables || []).filter((_, idx) => idx !== i);
                        onUpdateFolder(folder.id, { variables: newVars });
                      }}
                      className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {(!folder.variables || folder.variables.length === 0) && (
                  <p className="text-center py-4 text-gray-400 text-[10px] italic">No folder-level variables defined.</p>
                )}
              </div>
            </div>
          </SettingsCard>

          <SettingsCard icon={<LayoutGrid size={18} />} title="Contained Scenarios">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {folder.scenarios.map((s, sIdx) => (
                <div key={`scen-${s.id}-${sIdx}`} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group">
                  <div className="text-xs font-bold text-gray-900 group-hover:text-blue-600 mb-1">{s.name}</div>
                  <div className="text-[10px] text-gray-400 line-clamp-1 font-medium">{s.description}</div>
                </div>
              ))}
            </div>
          </SettingsCard>
        </div>
      </div>
    </div>
  );
}

function SettingsCard({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-4 text-gray-700">
        {icon}
        <h3 className="font-bold text-sm uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function App() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(INITIAL_PROJECTS[0].id);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState<string | null>(null);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [isRunning, setIsRunning] = useState(false);

  const viewMode = useMemo(() => {
    if (selectedTestCaseId) return 'testcase';
    if (selectedScenarioId) return 'scenario';
    if (selectedFolderId) return 'folder';
    if (selectedProjectId) return 'project';
    return 'none';
  }, [selectedTestCaseId, selectedScenarioId, selectedFolderId, selectedProjectId]);

  const selectedProject = useMemo(() => 
    projects.find(p => p.id === selectedProjectId) || null
  , [projects, selectedProjectId]);

  const selectedFolder = useMemo(() => {
    if (selectedFolderId) {
      for (const p of projects) {
        const folder = p.folders.find(f => f.id === selectedFolderId);
        if (folder) return folder;
      }
    }
    return null;
  }, [projects, selectedFolderId]);

  const selectedScenario = useMemo(() => {
    if (!selectedScenarioId) return null;
    for (const p of projects) {
      for (const f of p.folders) {
        const s = f.scenarios.find(s => s.id === selectedScenarioId);
        if (s) return s;
      }
    }
    return null;
  }, [projects, selectedScenarioId]);

  const selectedTestCase = useMemo(() => {
    if (!selectedTestCaseId) return null;
    for (const p of projects) {
      for (const f of p.folders) {
        for (const s of f.scenarios) {
          const tc = s.testCases.find(tc => tc.id === selectedTestCaseId);
          if (tc) return tc;
        }
      }
    }
    return null;
  }, [projects, selectedTestCaseId]);

  const [aiConfigs, setAiConfigs] = useState<{provider: string, model: string, apiKey: string}[]>(() => {
    const saved = localStorage.getItem('testrix_ai_configs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('testrix_ai_configs', JSON.stringify(aiConfigs));
  }, [aiConfigs]);

  const addLog = useCallback((message: string, level: LogEntry['level'] = 'info') => {
    const newLog: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: new Date(),
      level,
      message
    };
    setLogs(prev => [newLog, ...prev]);
  }, []);

  const handleRunTest = useCallback(() => {
    if (!selectedScenario) return;
    setIsRunning(true);
    addLog(`Executing ${selectedTestCase ? `Test Case: ${selectedTestCase.name}` : `Scenario: ${selectedScenario.name}`}`, 'info');
    
    // Simulate execution
    setTimeout(() => {
      setIsRunning(false);
      addLog(`Execution completed: ${selectedScenario.name}`, 'success');
    }, 3000);
  }, [selectedScenario, selectedTestCase, addLog]);

  const handleStopTest = useCallback(() => {
    setIsRunning(false);
    addLog('Execution aborted.', 'warn');
  }, [addLog]);

  const handleAiSubmit = useCallback((prompt: string, options?: { model: string; systemPrompt?: string }) => {
    const modelTag = options?.model ? `[${options.model}] ` : '';
    addLog(`${modelTag}大模型 Prompt 执行中: "${prompt.length > 60 ? prompt.slice(0, 60) + '...' : prompt}"`, 'info');
    setTimeout(() => {
      addLog(`${modelTag}大模型文本处理完成: 已根据提示词生成测试策略与建议。`, 'success');
    }, 1200);
  }, [addLog]);

  const handleUpdateNodes = useCallback((newNodes: TestStepNode[]) => {
    setProjects(prev => prev.map(p => ({
      ...p,
      folders: p.folders.map(f => ({
        ...f,
        scenarios: f.scenarios.map(s => 
          s.id === selectedScenarioId ? { ...s, nodes: newNodes } : s
        )
      }))
    })));
  }, [selectedScenarioId]);

  const handleUpdateEdges = useCallback((newEdges: Edge[]) => {
    setProjects(prev => prev.map(p => ({
      ...p,
      folders: p.folders.map(f => ({
        ...f,
        scenarios: f.scenarios.map(s => 
          s.id === selectedScenarioId ? { ...s, edges: newEdges } : s
        )
      }))
    })));
  }, [selectedScenarioId]);

  const handleUpdateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const handleUpdateFolder = useCallback((id: string, updates: Partial<Folder>) => {
    setProjects(prev => prev.map(project => ({
      ...project,
      folders: project.folders.map(f => f.id === id ? { ...f, ...updates } : f)
    })));
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-gray-900 font-sans overflow-hidden">
      <ControlPanel 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          projects={projects}
          selectedProjectId={selectedProjectId}
          selectedFolderId={selectedFolderId}
          selectedScenarioId={selectedScenarioId}
          selectedTestCaseId={selectedTestCaseId}
          onSelectProject={(id) => {
            setSelectedProjectId(id);
            setSelectedFolderId(null);
            setSelectedScenarioId(null);
            setSelectedTestCaseId(null);
          }}
          onSelectFolder={(id) => {
            setSelectedFolderId(id);
            setSelectedScenarioId(null);
            setSelectedTestCaseId(null);
            setSelectedProjectId(null); // Deselect project view
          }}
          onSelectScenario={(id) => {
            setSelectedScenarioId(id);
            setSelectedTestCaseId(null);
            setSelectedFolderId(null);
            setSelectedProjectId(null);
          }}
          onSelectTestCase={(id) => {
            setSelectedTestCaseId(id);
            // Also find and set parent scenario ID so the DAG is visible
            for (const p of projects) {
              for (const f of p.folders) {
                for (const s of f.scenarios) {
                  if (s.testCases.some(tc => tc.id === id)) {
                    setSelectedScenarioId(s.id);
                    break;
                  }
                }
              }
            }
            setSelectedFolderId(null);
            setSelectedProjectId(null);
          }}
        />
        
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {viewMode === 'project' && (
              <ProjectSettings project={selectedProject} onUpdateProject={handleUpdateProject} />
            )}
            {viewMode === 'folder' && (
              <FolderSettings folder={selectedFolder} onUpdateFolder={handleUpdateFolder} />
            )}
            {(viewMode === 'scenario' || viewMode === 'testcase') && (
              <Editor 
                scenario={selectedScenario} 
                parentFolder={projects.flatMap(p => p.folders).find(f => f.scenarios.some(s => s.id === selectedScenarioId)) || null}
                selectedTestCase={selectedTestCase}
                viewMode={viewMode}
                isRunning={isRunning}
                onUpdateNodes={handleUpdateNodes}
                onUpdateEdges={handleUpdateEdges}
                onRun={handleRunTest}
                onStop={handleStopTest}
              />
            )}
            
            {viewMode === 'testcase' && (
              <LogPanel 
                logs={logs}
                onClear={() => setLogs([])}
              />
            )}
          </div>
        </main>
      </div>

      <SettingsDialog 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        aiConfigs={aiConfigs}
        onUpdateAiConfigs={setAiConfigs}
      />

      <AIPrompt 
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        onSubmit={handleAiSubmit}
        currentContext={
          selectedScenario ? `场景: ${selectedScenario.name}` :
          selectedFolder ? `目录: ${selectedFolder.name}` :
          selectedProject ? `工程: ${selectedProject.name}` :
          '项目全局'
        }
        aiConfigs={aiConfigs}
      />
    </div>
  );
}


