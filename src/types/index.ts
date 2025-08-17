export interface BundleModule {
  id: string;
  name: string;
  size: number;
  gzipSize?: number;
  path: string[];
  dependencies: string[];
  isExternal: boolean;
  type: 'js' | 'css' | 'json' | 'map' | 'other';
  chunk?: string;
  javascriptAnalysis?: JavaScriptAnalysis; // Add JavaScript analysis data
}

export interface TreemapNode {
  name: string;
  size: number;
  module: BundleModule | null;
  children?: TreemapNode[];
}

export interface ChunkData {
  id: string;
  name: string;
  size: number;
  gzipSize: number;
  modules: string[];
  entry: boolean;
}

export interface OptimizationInsight {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  recommendation: string;
  estimatedSavings?: number;
  category:
    | 'dependency'
    | 'code-splitting'
    | 'tree-shaking'
    | 'duplicates'
    | 'performance';
}

export interface BundleData {
  totalSize: number;
  totalGzipSize: number;
  modules: BundleModule[];
  chunks: ChunkData[];
  insights: OptimizationInsight[];
  metadata: {
    analyzedAt: string;
    fileCount: number;
    fileTypes: string[];
  };
}

export interface FileUploadProps {
  onFileUpload: (files: File[]) => Promise<void>;
  isAnalyzing: boolean;
}

export interface BundleAnalysisProps {
  bundleData: BundleData;
  onReset: () => void;
}

export interface TreemapProps {
  data: BundleModule[];
  onModuleClick: (module: BundleModule) => void;
}

export interface InsightsPanelProps {
  insights: OptimizationInsight[];
}

export interface StatisticsPanelProps {
  bundleData: BundleData;
}

export interface FileExplorerProps {
  modules: BundleModule[];
  onModuleSelect: (module: BundleModule) => void;
}

export type TabType =
  | 'insights'
  | 'performance'
  | 'javascript'
  | 'treemap'
  | 'files';

export interface PerformanceMetrics {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  totalBlockingTime: number;
  cumulativeLayoutShift: number;
  speedIndex: number;
  performanceScore: number;
}

export interface LoadTimeEstimate {
  fast3G: number; // 1.6 Mbps
  slow3G: number; // 780 Kbps
  fast4G: number; // 9 Mbps
  wifi: number; // 30 Mbps
}

export interface CriticalPath {
  blockingModules: BundleModule[];
  totalBlockingTime: number;
  optimizationOpportunities: string[];
}

export interface PerformanceImpact {
  beforeSize: number;
  afterSize: number;
  performanceChange: number;
  recommendations: string[];
}

export interface PerformanceData {
  metrics: PerformanceMetrics | null;
  loadTimeEstimates: LoadTimeEstimate;
  criticalPath: CriticalPath;
  performanceScore: number;
  recommendations: string[];
}

// JavaScript File Analysis Types
export interface JavaScriptAnalysis {
  fileType: 'vanilla' | 'bundle' | 'module' | 'unknown';
  confidence: number;
  functions: FunctionInfo[];
  classes: ClassInfo[];
  imports: ImportInfo[];
  exports: ExportInfo[];
  dependencies: string[];
  libraries: LibraryUsage[];
  codeMetrics: CodeMetrics;
  optimizationOpportunities: string[];
  insights: OptimizationInsight[];
}

export interface FunctionInfo {
  name: string;
  type: 'function' | 'arrow' | 'method' | 'async';
  lineStart: number;
  lineEnd: number;
  size: number;
  complexity: number;
  parameters: string[];
}

export interface ClassInfo {
  name: string;
  lineStart: number;
  lineEnd: number;
  size: number;
  methods: string[];
  properties: string[];
  extends?: string;
  implements?: string[];
}

export interface ImportInfo {
  source: string;
  type: 'es6' | 'commonjs' | 'dynamic';
  items: string[];
  line: number;
}

export interface ExportInfo {
  type: 'named' | 'default' | 'all';
  items: string[];
  line: number;
}

export interface LibraryUsage {
  name: string;
  confidence: number;
  patterns: string[];
  usageCount: number;
}

export interface CodeMetrics {
  totalLines: number;
  codeLines: number;
  commentLines: number;
  emptyLines: number;
  functionCount: number;
  classCount: number;
  importCount: number;
  exportCount: number;
  averageFunctionSize: number;
  averageClassSize: number;
  cyclomaticComplexity: number;
}
