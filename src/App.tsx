/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useMemo } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { LogPanel } from './components/LogPanel';
import { SettingsDialog } from './components/SettingsDialog';
import { Project, Folder, Scenario, TestCase, TestStepNode, LogEntry } from './types';
import { Edge } from '@xyflow/react';
import { Settings, Folder as FolderIcon, LayoutGrid, Info, Share2, Save } from 'lucide-react';

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Hospital Management',
    folders: [
      {
        id: 'f1',
        name: 'Prescriptions',
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

function ProjectSettings({ project }: { project: Project | null }) {
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>
    </div>
  );
}

function FolderSettings({ folder }: { folder: Folder | null }) {
  if (!folder) return null;
  return (
    <div className="flex-1 bg-white p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-8 border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-50 rounded-xl">
              <FolderIcon className="text-gray-600" size={32} />
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
            <p className="text-sm text-blue-800">
              Settings defined here will be automatically applied to all Scenarios within this folder.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="text-sm font-bold mb-4">Shared Setup Hook</h3>
            <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded-md font-mono">
              {`// Automatically runs before each scenario\nasync function setup() {\n  await context.login('qa-user');\n  await context.clearCache();\n}`}
            </pre>
          </div>
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
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [isRecording, setIsRecording] = useState(false);
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
    if (!selectedProject) return null;
    return selectedProject.folders.find(f => f.id === selectedFolderId) || null;
  }, [selectedProject, selectedFolderId]);

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

  const addLog = useCallback((message: string, level: LogEntry['level'] = 'info') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(7),
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

  const handleRecord = useCallback(() => {
    setIsRecording(prev => !prev);
    if (!isRecording) {
      addLog('Recording started. Nodes will be generated automatically.', 'info');
    } else {
      addLog('Recording stopped. Workflow generated.', 'success');
    }
  }, [isRecording, addLog]);

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

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-gray-900 font-sans overflow-hidden">
      <ControlPanel onOpenSettings={() => setIsSettingsOpen(true)} />
      
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
          onAdd={() => addLog('New asset creation initialized.', 'info')}
        />
        
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {viewMode === 'project' && (
              <ProjectSettings project={selectedProject} />
            )}
            {viewMode === 'folder' && (
              <FolderSettings folder={selectedFolder} />
            )}
            {(viewMode === 'scenario' || viewMode === 'testcase') && (
              <Editor 
                scenario={selectedScenario} 
                selectedTestCase={selectedTestCase}
                viewMode={viewMode}
                isRunning={isRunning}
                isRecording={isRecording}
                onUpdateNodes={handleUpdateNodes}
                onUpdateEdges={handleUpdateEdges}
                onRun={handleRunTest}
                onStop={handleStopTest}
                onRecord={handleRecord}
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
      />

      <footer className="h-6 bg-blue-600 text-white flex items-center justify-between px-3 text-[10px] uppercase tracking-wider font-semibold shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span>Testrix Runner Active</span>
          </div>
          <span>Deterministic Orchestration Mode</span>
        </div>
        <div className="flex items-center gap-4">
          <span>v1.2.0-stable</span>
        </div>
      </footer>
    </div>
  );
}


