import {
  BundleData,
  BundleModule,
  ChunkData,
  OptimizationInsight,
} from '../types';

export class BundleAnalyzer {
  private modules: BundleModule[] = [];
  private chunks: ChunkData[] = [];
  private insights: OptimizationInsight[] = [];

  async analyzeFiles(files: File[]): Promise<BundleData> {
    this.modules = [];
    this.chunks = [];
    this.insights = [];

    for (const file of files) {
      await this.processFile(file);
    }

    this.generateInsights();

    return {
      totalSize: this.modules.reduce((sum, m) => sum + m.size, 0),
      totalGzipSize: this.modules.reduce(
        (sum, m) => sum + (m.gzipSize || m.size * 0.3),
        0
      ),
      modules: this.modules,
      chunks: this.chunks,
      insights: this.insights,
      metadata: {
        analyzedAt: new Date().toISOString(),
        fileCount: files.length,
        fileTypes: files.map((f) => f.name.split('.').pop() || 'unknown'),
      },
    };
  }

  private async processFile(file: File): Promise<void> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    try {
      if (extension === 'json') {
        await this.processWebpackBundle(file);
      } else if (extension === 'map') {
        await this.processSourceMap(file);
      } else if (extension === 'js') {
        await this.processJavaScriptFile(file);
      }
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
    }
  }

  private async processWebpackBundle(file: File): Promise<void> {
    const content = await file.text();
    const data = JSON.parse(content);

    if (data.modules) {
      // Webpack bundle analyzer format
      this.processWebpackModules(data.modules);
    } else if (data.chunks) {
      // Alternative webpack format
      this.processWebpackChunks(data.chunks);
    }
  }

  private async processSourceMap(file: File): Promise<void> {
    const content = await file.text();
    const data = JSON.parse(content);

    if (data.sources) {
      // Process source map to extract file information
      data.sources.forEach((source: string, index: number) => {
        const module: BundleModule = {
          id: `sourcemap-${index}`,
          name: source,
          size: this.estimateSourceSize(source),
          path: source.split('/'),
          dependencies: [],
          isExternal: false,
          type: this.getFileType(source),
        };
        this.modules.push(module);
      });
    }
  }

  private async processJavaScriptFile(file: File): Promise<void> {
    const module: BundleModule = {
      id: `js-${file.name}`,
      name: file.name,
      size: file.size,
      path: [file.name],
      dependencies: [],
      isExternal: false,
      type: 'js',
    };
    this.modules.push(module);
  }

  private processWebpackModules(webpackModules: any[]): void {
    webpackModules.forEach((webpackModule, index) => {
      const module: BundleModule = {
        id: webpackModule.id || `module-${index}`,
        name:
          webpackModule.name || webpackModule.identifier || `Module ${index}`,
        size: webpackModule.size || 0,
        gzipSize: webpackModule.gzipSize,
        path: this.parseModulePath(
          webpackModule.name || webpackModule.identifier
        ),
        dependencies: webpackModule.dependencies || [],
        isExternal: webpackModule.external || false,
        type: this.getFileType(webpackModule.name || webpackModule.identifier),
      };
      this.modules.push(module);
    });
  }

  private processWebpackChunks(webpackChunks: any[]): void {
    webpackChunks.forEach((chunk, index) => {
      const chunkData: ChunkData = {
        id: chunk.id || `chunk-${index}`,
        name: chunk.name || `Chunk ${index}`,
        size: chunk.size || 0,
        gzipSize: chunk.gzipSize || chunk.size * 0.3,
        modules: chunk.modules || [],
        entry: chunk.entry || false,
      };
      this.chunks.push(chunkData);
    });
  }

  private parseModulePath(moduleName: string): string[] {
    if (!moduleName) return ['unknown'];

    // Handle different module name formats
    if (moduleName.includes('node_modules')) {
      const parts = moduleName.split('node_modules/');
      if (parts.length > 1) {
        return ['node_modules', ...parts[1].split('/')];
      }
    }

    return moduleName.split('/');
  }

  private getFileType(
    filename: string
  ): 'js' | 'css' | 'json' | 'map' | 'other' {
    if (!filename) return 'other';

    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return 'js';
      case 'css':
      case 'scss':
      case 'sass':
      case 'less':
        return 'css';
      case 'json':
        return 'json';
      case 'map':
        return 'map';
      default:
        return 'other';
    }
  }

  private estimateSourceSize(source: string): number {
    // Rough estimation based on source length
    return source.length * 2; // Assume 2 bytes per character
  }

  private generateInsights(): void {
    this.insights = [];

    // Large dependency warnings
    this.analyzeLargeDependencies();

    // Code splitting opportunities
    this.analyzeCodeSplittingOpportunities();

    // Tree shaking potential
    this.analyzeTreeShakingPotential();

    // Duplicate detection
    this.analyzeDuplicates();

    // Performance insights
    this.analyzePerformance();
  }

  private analyzeLargeDependencies(): void {
    const largeModules = this.modules
      .filter((m) => m.size > 100 * 1024) // > 100KB
      .sort((a, b) => b.size - a.size);

    largeModules.forEach((module) => {
      const insight: OptimizationInsight = {
        id: `large-dep-${module.id}`,
        type: 'warning',
        title: 'Large Dependency Detected',
        description: `The module "${module.name}" is ${this.formatSize(
          module.size
        )} in size, which may impact bundle performance.`,
        impact: module.size > 500 * 1024 ? 'high' : 'medium',
        recommendation: this.getLargeDependencyRecommendation(module),
        estimatedSavings: module.size * 0.3, // Assume 30% potential savings
        category: 'dependency',
      };
      this.insights.push(insight);
    });
  }

  private analyzeCodeSplittingOpportunities(): void {
    const largeChunks = this.chunks
      .filter((c) => c.size > 200 * 1024) // > 200KB
      .sort((a, b) => b.size - a.size);

    largeChunks.forEach((chunk) => {
      const insight: OptimizationInsight = {
        id: `code-split-${chunk.id}`,
        type: 'info',
        title: 'Code Splitting Opportunity',
        description: `The chunk "${chunk.name}" is ${this.formatSize(
          chunk.size
        )} and could benefit from code splitting.`,
        impact: 'medium',
        recommendation:
          'Consider implementing dynamic imports or route-based code splitting to reduce initial bundle size.',
        estimatedSavings: chunk.size * 0.4, // Assume 40% potential savings
        category: 'code-splitting',
      };
      this.insights.push(insight);
    });
  }

  private analyzeTreeShakingPotential(): void {
    const jsModules = this.modules.filter((m) => m.type === 'js');

    if (jsModules.length > 50) {
      const insight: OptimizationInsight = {
        id: 'tree-shaking',
        type: 'info',
        title: 'Tree Shaking Potential',
        description: `Your bundle contains ${jsModules.length} JavaScript modules. Tree shaking could help eliminate unused code.`,
        impact: 'medium',
        recommendation:
          'Ensure your bundler is configured for tree shaking and use ES6 modules consistently.',
        category: 'tree-shaking',
      };
      this.insights.push(insight);
    }
  }

  private analyzeDuplicates(): void {
    const moduleNames = this.modules.map((m) => m.name);
    const duplicates = moduleNames.filter(
      (name, index) => moduleNames.indexOf(name) !== index
    );

    if (duplicates.length > 0) {
      const insight: OptimizationInsight = {
        id: 'duplicates',
        type: 'warning',
        title: 'Duplicate Modules Detected',
        description: `Found ${duplicates.length} duplicate module names, which may indicate redundant dependencies.`,
        impact: 'medium',
        recommendation:
          'Check for duplicate package installations and consider using bundle analyzer plugins to identify duplicates.',
        category: 'duplicates',
      };
      this.insights.push(insight);
    }
  }

  private analyzePerformance(): void {
    const totalSize = this.modules.reduce((sum, m) => sum + m.size, 0);

    if (totalSize > 1024 * 1024) {
      // > 1MB
      const insight: OptimizationInsight = {
        id: 'performance',
        type: 'warning',
        title: 'Large Bundle Size',
        description: `Your total bundle size is ${this.formatSize(
          totalSize
        )}, which may impact loading performance.`,
        impact: 'high',
        recommendation:
          'Consider implementing code splitting, lazy loading, and analyzing dependencies for optimization opportunities.',
        category: 'performance',
      };
      this.insights.push(insight);
    }
  }

  private getLargeDependencyRecommendation(module: BundleModule): string {
    const name = module.name.toLowerCase();

    if (name.includes('moment')) {
      return 'Consider replacing moment.js with dayjs or date-fns for smaller bundle size.';
    }

    if (name.includes('lodash')) {
      return 'Use lodash-es or import specific functions instead of the full library.';
    }

    if (name.includes('jquery')) {
      return 'Consider using native DOM APIs or lighter alternatives like zepto.js.';
    }

    return 'Analyze if this dependency is necessary or if there are lighter alternatives available.';
  }

  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const bundleAnalyzer = new BundleAnalyzer();
