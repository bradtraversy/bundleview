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

export type TabType = 'treemap' | 'insights' | 'files';
