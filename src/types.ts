/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Node, Edge } from '@xyflow/react';

export type TestStatus = 'idle' | 'running' | 'passed' | 'failed' | 'skipped' | 'waiting';

export type UnitType = 'http' | 'sql' | 'js' | 'manual' | 'mock';

export interface HttpPayload {
  method: string;
  path: string;
  headers: Record<string, string>;
  body: string;
}

export interface SqlPayload {
  dataSourceId: string;
  query: string;
}

export interface JsPayload {
  code: string;
}

export interface TestStepData extends Record<string, unknown> {
  type: UnitType;
  action: string;
  target: string;
  value: string;
  status: TestStatus;
  roleId?: string;
  duration?: number;
  payload?: HttpPayload | SqlPayload | JsPayload;
}

export type TestStepNode = Node<TestStepData>;

export interface Role {
  id: string;
  name: string;
  type: 'doctor' | 'nurse' | 'admin' | 'guest';
  authType: 'bearer' | 'basic' | 'cookie';
}

export interface Environment {
  id: string;
  name: string;
  baseUrl: string;
  variables: Record<string, string>;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'postgres' | 'mysql' | 'mongodb' | 'redis';
  connectionString: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  nodes: TestStepNode[];
  edges: Edge[];
  testCases: TestCase[];
}

export interface TestCase {
  id: string;
  scenarioId: string;
  name: string;
  description: string;
  inputs: Record<string, any>;
  status: TestStatus;
  lastRun?: Date;
}

export interface Folder {
  id: string;
  name: string;
  variables?: { key: string; value: string }[];
  scenarios: Scenario[];
}

export interface Project {
  id: string;
  name: string;
  contextFolders: string[];
  folders: Folder[];
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  unitId?: string;
}

export interface AppState {
  testCases: TestCase[];
  selectedTestCaseId: string | null;
  logs: LogEntry[];
  isRecording: boolean;
  isRunning: boolean;
}
