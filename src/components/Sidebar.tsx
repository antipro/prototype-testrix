/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Folder, 
  FileText, 
  Plus, 
  Search, 
  ChevronRight, 
  ChevronDown,
  LayoutGrid,
  Box,
  PlayCircle
} from 'lucide-react';
import { Project, Scenario, TestCase } from '../types';
import React, { useState } from 'react';

interface SidebarProps {
  projects: Project[];
  selectedProjectId: string | null;
  selectedFolderId: string | null;
  selectedScenarioId: string | null;
  selectedTestCaseId: string | null;
  onSelectProject: (id: string) => void;
  onSelectFolder: (id: string) => void;
  onSelectScenario: (id: string) => void;
  onSelectTestCase: (id: string) => void;
  onAdd: () => void;
}

export function Sidebar({ 
  projects, 
  selectedProjectId,
  selectedFolderId,
  selectedScenarioId, 
  selectedTestCaseId, 
  onSelectProject,
  onSelectFolder,
  onSelectScenario, 
  onSelectTestCase, 
  onAdd 
}: SidebarProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'p1': true,
    'f1': true,
  });

  const toggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-72 bg-[#f8f9fa] border-r border-gray-200 flex flex-col h-full select-none">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Project Explorer</h2>
          <button 
            onClick={onAdd}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Plus size={14} className="text-gray-500" />
          </button>
        </div>
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search assets..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 space-y-1">
        {projects.map(project => (
          <div key={project.id} className="px-2">
            <button 
              onClick={() => onSelectProject(project.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 text-[11px] font-bold rounded-md transition-all ${
                selectedProjectId === project.id 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div onClick={(e) => toggle(project.id, e)}>
                {expanded[project.id] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </div>
              <LayoutGrid size={14} className={selectedProjectId === project.id ? 'text-blue-600' : 'text-blue-400'} />
              <span className="uppercase tracking-wider">{project.name}</span>
            </button>
            
            {expanded[project.id] && (
              <div className="mt-1 space-y-1 ml-2 border-l border-gray-200 pl-2">
                {project.folders.map(folder => (
                  <div key={folder.id}>
                    <button 
                      onClick={() => onSelectFolder(folder.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1 text-[11px] font-bold rounded-md transition-all ${
                        selectedFolderId === folder.id 
                          ? 'bg-gray-200 text-gray-900' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div onClick={(e) => toggle(folder.id, e)}>
                        {expanded[folder.id] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      </div>
                      <Folder size={14} className={selectedFolderId === folder.id ? 'text-gray-600' : 'text-gray-400'} />
                      <span>{folder.name}</span>
                    </button>

                    {expanded[folder.id] && (
                      <div className="mt-0.5 space-y-0.5 ml-2 border-l border-gray-100 pl-2">
                        {folder.scenarios.map(scenario => (
                          <div key={scenario.id}>
                            <button
                              onClick={() => onSelectScenario(scenario.id)}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 text-[11px] rounded-md transition-all group ${
                                selectedScenarioId === scenario.id && !selectedTestCaseId
                                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100' 
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              <Box size={14} className={selectedScenarioId === scenario.id ? 'text-blue-500' : 'text-gray-400'} />
                              <span className="truncate">{scenario.name}</span>
                            </button>

                            {selectedScenarioId === scenario.id && (
                              <div className="mt-0.5 space-y-0.5 ml-4 border-l border-gray-100 pl-2">
                                {scenario.testCases.map(tc => (
                                  <button
                                    key={tc.id}
                                    onClick={() => onSelectTestCase(tc.id)}
                                    className={`w-full flex items-center gap-2 px-2 py-1 text-[10px] rounded-md transition-all ${
                                      selectedTestCaseId === tc.id 
                                        ? 'bg-green-50 text-green-700 font-bold border border-green-100' 
                                        : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                                  >
                                    <PlayCircle size={12} className={selectedTestCaseId === tc.id ? 'text-green-500' : 'text-gray-300'} />
                                    <span className="truncate">{tc.name}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
