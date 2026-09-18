/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState } from 'react';
import { 
  ReactFlow, 
  ReactFlowProvider,
  useReactFlow,
  Background, 
  Controls, 
  MiniMap, 
  addEdge, 
  Connection, 
  Edge,
  Node,
  Panel,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Project, Folder, Scenario, TestCase, TestStepNode } from '../types';
import { StepNode } from './StepNode';
import { PropertyPanel } from './PropertyPanel';
import { Plus, Settings2, Play, Square, Circle, Layers, PlayCircle, Share2, Save } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface EditorProps {
  scenario: Scenario | null;
  parentFolder: Folder | null;
  selectedTestCase: TestCase | null;
  viewMode: 'scenario' | 'testcase';
  isRunning: boolean;
  onUpdateNodes: (nodes: TestStepNode[]) => void;
  onUpdateEdges: (edges: Edge[]) => void;
  onRun: () => void;
  onStop: () => void;
}

const nodeTypes = {
  step: StepNode,
};

function FlowCenterController({ scenarioId, viewMode }: { scenarioId: string; viewMode: 'scenario' | 'testcase' }) {
  const { fitView } = useReactFlow();

  React.useEffect(() => {
    // Re-center horizontally and vertically (上下和左右居中)
    const center = () => {
      fitView({
        padding: 0.3,
        minZoom: 0.7,
        maxZoom: 1.0,
        duration: 250,
      });
    };

    // Staggered calls ensure centering after bottom panel and canvas layout stabilize
    center();
    const t1 = setTimeout(center, 60);
    const t2 = setTimeout(center, 250);
    const t3 = setTimeout(center, 500);

    const handleResize = () => {
      fitView({ padding: 0.3, duration: 150 });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', handleResize);
    };
  }, [scenarioId, viewMode, fitView]);

  return null;
}

export function Editor({ 
  scenario,
  parentFolder,
  selectedTestCase,
  viewMode,
  isRunning, 
  onUpdateNodes, 
  onUpdateEdges,
  onRun,
  onStop,
}: EditorProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  React.useEffect(() => {
    if (scenario && scenario.nodes.length > 0) {
      if (!selectedNodeId || !scenario.nodes.some(n => n.id === selectedNodeId)) {
        setSelectedNodeId(scenario.nodes[0].id);
      }
    }
  }, [scenario?.id]);

  const selectedNode = scenario?.nodes.find(n => n.id === selectedNodeId) || null;

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (!scenario || viewMode === 'testcase') return;
      onUpdateNodes(applyNodeChanges(changes, scenario.nodes) as TestStepNode[]);
    },
    [scenario, onUpdateNodes, viewMode]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (!scenario || viewMode === 'testcase') return;
      onUpdateEdges(applyEdgeChanges(changes, scenario.edges));
    },
    [scenario, onUpdateEdges, viewMode]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      if (!scenario || viewMode === 'testcase') return;
      onUpdateEdges(addEdge(params, scenario.edges));
    },
    [scenario, onUpdateEdges, viewMode]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const handleUpdateNodeData = useCallback((nodeId: string, newData: any) => {
    if (!scenario) return;
    onUpdateNodes(scenario.nodes.map(n => n.id === nodeId ? { ...n, data: newData } : n));
  }, [scenario, onUpdateNodes]);

  if (!scenario) {
    return (
      <div className="flex-1 flex justify-center items-center bg-[#fcfdfe] text-gray-300">
        <div className="text-center animate-in fade-in duration-700">
          <Layers size={64} className="mx-auto mb-6 opacity-10" />
          <h3 className="text-lg font-bold text-gray-400">Design Your Workflow</h3>
          <p className="text-xs max-w-xs mx-auto mt-2 leading-relaxed">Select a scenario from the sidebar or import an OpenAPI spec to begin orchestrating your test flows.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white relative overflow-hidden">
      <div className="h-14 border-b border-gray-100 bg-white/90 backdrop-blur-md z-10 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-widest">Scenario</span>
              <h1 className="text-sm font-bold text-gray-800">{scenario.name}</h1>
            </div>
            {selectedTestCase && (
               <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded uppercase tracking-widest">TestCase</span>
                <span className="text-xs font-bold text-gray-600">{selectedTestCase.name}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {viewMode === 'testcase' && (
              <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
                <button 
                  onClick={isRunning ? onStop : onRun}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-tight transition-all ${
                    isRunning 
                      ? 'bg-red-500 text-white shadow-md' 
                      : 'hover:bg-white hover:shadow-sm text-gray-600'
                  }`}
                >
                  {isRunning ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                  {isRunning ? 'Stop' : 'Run Test'}
                </button>
              </div>
            )}
            
            {viewMode === 'scenario' && (
              <>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95">
                  <Share2 size={14} />
                  <span>Share</span>
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95">
                  <Save size={14} />
                  <span>Save</span>
                </button>
                <div className="h-6 w-[1px] bg-gray-200 mx-1" />
                <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95">
                  <Plus size={14} />
                  <span>Add Step</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 relative min-h-0">
          <ReactFlowProvider>
            <ReactFlow
              key={scenario.id}
              nodes={scenario.nodes}
              edges={scenario.edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={() => setSelectedNodeId(null)}
              nodeTypes={nodeTypes}
              nodesDraggable={false}
              fitView
              fitViewOptions={{
                padding: 0.35,
                minZoom: 0.65,
                maxZoom: 1.0,
                includeHiddenNodes: false
              }}
              className="bg-gray-50"
            >
              <FlowCenterController scenarioId={scenario.id} viewMode={viewMode} />
              <Background gap={20} color="#e5e7eb" />
              <Controls 
                className="bg-white border-gray-200 shadow-lg rounded-lg overflow-hidden" 
                showInteractive={false}
              />
            
            <AnimatePresence>
              {parentFolder && parentFolder.variables && parentFolder.variables.length > 0 && (
                <Panel position="bottom-right" className="mb-4 mr-4">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/90 backdrop-blur shadow-lg border border-gray-100 rounded-xl p-3 min-w-[180px]"
                  >
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-blue-600 uppercase tracking-widest mb-2 border-b border-gray-50 pb-1.5">
                      <Settings2 size={10} />
                      Inherited Context
                    </div>
                    <div className="space-y-1">
                      {parentFolder.variables.map((v, i) => (
                        <div key={`var-${v.key}-${i}`} className="flex justify-between items-center bg-blue-50/50 px-2 py-1 rounded border border-blue-100/30">
                          <span className="text-[8px] font-bold text-blue-800 uppercase">{v.key}</span>
                          <span className="text-[9px] font-mono text-blue-600">{v.value}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </Panel>
              )}

              {selectedTestCase && (
                <Panel position="top-right" className="mr-4 mt-4">
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-white/90 backdrop-blur-md border border-gray-200 p-4 rounded-xl shadow-2xl w-64"
                  >
                    <div className="flex items-center gap-2 mb-3 border-b border-gray-100 pb-2">
                      <PlayCircle size={14} className="text-green-500" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Test Parameters</span>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(selectedTestCase.inputs).map(([key, val], idx) => (
                        <div key={`input-${key}-${idx}`}>
                          <label className="text-[9px] font-bold text-gray-400 uppercase">{key}</label>
                          <div className="text-xs font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-100">{String(val)}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </Panel>
              )}
            </AnimatePresence>

            {viewMode === 'testcase' && (
              <Panel position="bottom-center" className="mb-4">
                 <div className="bg-white/90 backdrop-blur-md border border-gray-200 px-4 py-2 rounded-full shadow-xl flex items-center gap-4">
                    <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-[10px] font-bold text-gray-600 uppercase">Passed: {scenario.nodes.filter(n => n.data.status === 'passed').length}</span>
                    </div>
                    <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-[10px] font-bold text-gray-600 uppercase">Failed: {scenario.nodes.filter(n => n.data.status === 'failed').length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-[10px] font-bold text-gray-600 uppercase">Running: {scenario.nodes.filter(n => n.data.status === 'running').length}</span>
                    </div>
                 </div>
              </Panel>
            )}
          </ReactFlow>
        </ReactFlowProvider>
      </div>

        {viewMode === 'scenario' && (
          <PropertyPanel 
            node={selectedNode} 
            nodes={scenario.nodes}
            viewMode={viewMode}
            onSelectNode={(id) => setSelectedNodeId(id)}
            onClose={() => setSelectedNodeId(null)}
            onUpdateNode={handleUpdateNodeData}
          />
        )}
      </div>
    );
  }

