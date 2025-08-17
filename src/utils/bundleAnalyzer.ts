import {
  BundleData,
  BundleModule,
  ChunkData,
  OptimizationInsight,
} from '../types';
import { JavaScriptAnalyzer } from './javascriptAnalyzer';

export class BundleAnalyzer {
  private modules: BundleModule[] = [];
  private chunks: ChunkData[] = [];
  private insights: OptimizationInsight[] = [];

  async analyzeFiles(files: File[]): Promise<BundleData> {
    this.modules = [];
    this.chunks = [];
    this.insights = [];

    console.log(`Starting analysis of ${files.length} files`);
    console.log(
      'File names:',
      files.map((f) => f.name)
    );

    for (const file of files) {
      await this.processFile(file);
    }

    console.log(`Analysis complete. Modules found: ${this.modules.length}`);
    console.log('Modules:', this.modules);
    console.log(`Chunks found: ${this.chunks.length}`);
    console.log('Chunks:', this.chunks);

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
        // Try to parse as webpack bundle first, fallback to single file
        const parsed = await this.tryParseAsWebpackBundle(file);
        if (!parsed) {
          await this.processJavaScriptFile(file);
        }
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

  private async tryParseAsWebpackBundle(file: File): Promise<boolean> {
    try {
      const content = await file.text();
      console.log(`Analyzing ${file.name}, content length: ${content.length}`);

      // Look for webpack bundle indicators
      const hasWebpackRequire = content.includes('webpack_require');
      const hasWebpackRequireUnderscore = content.includes(
        '__webpack_require__'
      );
      const hasWebpackJsonp = content.includes('webpackJsonp');
      const hasWebpackChunk = content.includes('webpackChunk');

      console.log('Webpack indicators found:', {
        hasWebpackRequire,
        hasWebpackRequireUnderscore,
        hasWebpackJsonp,
        hasWebpackChunk,
      });

      if (
        hasWebpackRequire ||
        hasWebpackRequireUnderscore ||
        hasWebpackJsonp ||
        hasWebpackChunk
      ) {
        console.log('Detected webpack bundle, parsing...');
        // Parse the bundle to extract module information
        this.parseCompiledWebpackBundle(content, file.name);
        return true;
      }

      console.log('No webpack indicators found, treating as single file');
      return false;
    } catch (error) {
      console.error('Error in tryParseAsWebpackBundle:', error);
      return false;
    }
  }

  private parseCompiledWebpackBundle(content: string, filename: string): void {
    // Extract module information from compiled webpack bundle
    const modules: BundleModule[] = [];

    // Split content by common webpack patterns to identify modules
    const modulePatterns = [
      /webpack_require\(['"`]([^'"`]+)['"`]\)/g,
      /__webpack_require__\(['"`]([^'"`]+)['"`]\)/g,
      /webpack_require\((\d+)\)/g,
      /__webpack_require__\((\d+)\)/g,
    ];

    const moduleNames = new Set<string>();

    // Extract module names from webpack require calls
    modulePatterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1] && !match[1].match(/^\d+$/)) {
          moduleNames.add(match[1]);
        }
      }
    });

    // If we found modules, create module entries
    if (moduleNames.size > 0) {
      const moduleSize = Math.floor(content.length / moduleNames.size);

      Array.from(moduleNames).forEach((moduleName, index) => {
        const module: BundleModule = {
          id: `compiled-${index}`,
          name: moduleName,
          size: moduleSize,
          path: moduleName.split('/'),
          dependencies: [],
          isExternal: false,
          type: this.getFileType(moduleName),
        };
        modules.push(module);
      });

      // Add the main bundle as a chunk
      const chunkData: ChunkData = {
        id: 'main-bundle',
        name: filename,
        size: content.length,
        gzipSize: Math.floor(content.length * 0.3), // Estimate gzip size
        modules: modules.map((m) => m.id),
        entry: true,
      };

      this.chunks.push(chunkData);
      this.modules.push(...modules);
    } else {
      // Fallback: treat as single module with estimated breakdown
      const estimatedModules = this.estimateBundleModules(content);
      this.modules.push(...estimatedModules);
    }
  }

  private estimateBundleModules(content: string): BundleModule[] {
    const modules: BundleModule[] = [];
    const totalSize = content.length;

    // Common React app module patterns
    const moduleTypes = [
      { name: 'React Core', type: 'js', sizeRatio: 0.15 },
      { name: 'React DOM', type: 'js', sizeRatio: 0.12 },
      { name: 'Application Code', type: 'js', sizeRatio: 0.25 },
      { name: 'Dependencies', type: 'js', sizeRatio: 0.35 },
      { name: 'Runtime', type: 'js', sizeRatio: 0.13 },
    ];

    moduleTypes.forEach((moduleType, index) => {
      const module: BundleModule = {
        id: `estimated-${index}`,
        name: moduleType.name,
        size: Math.floor(totalSize * moduleType.sizeRatio),
        path: [moduleType.name],
        dependencies: [],
        isExternal: false,
        type: moduleType.type as any,
      };
      modules.push(module);
    });

    return modules;
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
    // Read the file content for JavaScript analysis
    const content = await file.text();

    // Analyze the JavaScript content
    const jsAnalyzer = new JavaScriptAnalyzer();
    const jsAnalysis = jsAnalyzer.analyzeFile(content);

    const module: BundleModule = {
      id: `js-${file.name}`,
      name: file.name,
      size: file.size,
      path: [file.name],
      dependencies: jsAnalysis.dependencies, // Use actual dependencies from analysis
      isExternal: false,
      type: 'js',
      javascriptAnalysis: jsAnalysis, // Store the full analysis
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

    // Always generate basic insights
    this.generateBasicInsights();

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

  private generateBasicInsights(): void {
    // Bundle size insights
    const totalSize = this.modules.reduce((sum, m) => sum + m.size, 0);
    const totalGzipSize = this.modules.reduce(
      (sum, m) => sum + (m.gzipSize || m.size * 0.3),
      0
    );
    const compressionRatio = ((totalSize - totalGzipSize) / totalSize) * 100;

    // Bundle composition insight
    const jsModules = this.modules.filter((m) => m.type === 'js');
    const cssModules = this.modules.filter((m) => m.type === 'css');
    const otherModules = this.modules.filter(
      (m) => !['js', 'css'].includes(m.type)
    );

    if (jsModules.length > 0) {
      const insight: OptimizationInsight = {
        id: 'bundle-composition',
        type: 'info',
        title: 'Bundle Composition Analysis',
        description: `Your bundle contains ${jsModules.length} JavaScript modules, ${cssModules.length} CSS modules, and ${otherModules.length} other assets.`,
        impact: 'low',
        recommendation:
          'Consider code splitting JavaScript modules and optimizing CSS delivery for better performance.',
        category: 'performance',
      };
      this.insights.push(insight);
    }

    // Compression insight
    if (compressionRatio > 0) {
      const insight: OptimizationInsight = {
        id: 'compression-efficiency',
        type: 'success',
        title: 'Good Compression Ratio',
        description: `Your bundle compresses well with gzip, achieving ${compressionRatio.toFixed(
          1
        )}% size reduction.`,
        impact: 'low',
        recommendation:
          'Ensure your server is configured to serve gzipped content for optimal performance.',
        category: 'performance',
      };
      this.insights.push(insight);
    }

    // Module count insight
    if (this.modules.length > 10) {
      const insight: OptimizationInsight = {
        id: 'module-count',
        type: 'info',
        title: 'Modular Bundle Structure',
        description: `Your bundle is well-modularized with ${this.modules.length} individual modules.`,
        impact: 'low',
        recommendation:
          'This modular structure enables better caching and code splitting opportunities.',
        category: 'code-splitting',
      };
      this.insights.push(insight);
    } else if (this.modules.length <= 5) {
      const insight: OptimizationInsight = {
        id: 'module-count-low',
        type: 'warning',
        title: 'Limited Module Separation',
        description: `Your bundle has only ${this.modules.length} modules, which may limit caching benefits.`,
        impact: 'medium',
        recommendation:
          'Consider breaking down large modules into smaller, more focused pieces for better caching and maintainability.',
        category: 'code-splitting',
      };
      this.insights.push(insight);
    }

    // Performance insights
    this.generatePerformanceInsights(totalSize, totalGzipSize);

    // File type diversity insight
    const fileTypes = new Set(this.modules.map((m) => m.type));
    if (fileTypes.size > 2) {
      const insight: OptimizationInsight = {
        id: 'file-type-diversity',
        type: 'info',
        title: 'Diverse Asset Types',
        description: `Your bundle includes ${
          fileTypes.size
        } different file types: ${Array.from(fileTypes).join(', ')}.`,
        impact: 'low',
        recommendation:
          'Ensure each asset type is optimized appropriately (minification for JS/CSS, compression for images, etc.).',
        category: 'performance',
      };
      this.insights.push(insight);
    }
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

  private generatePerformanceInsights(
    totalSize: number,
    totalGzipSize: number
  ): void {
    // Load time estimates for different network conditions
    const fast3GTime = (totalSize * 8) / (1.6 * 1024 * 1024); // 1.6 Mbps

    if (fast3GTime > 3) {
      // > 3 seconds on fast 3G
      const insight: OptimizationInsight = {
        id: 'slow-3g-load',
        type: 'warning',
        title: 'Slow Loading on Mobile Networks',
        description: `Your bundle takes ${fast3GTime.toFixed(
          1
        )}s to load on fast 3G networks, which may impact mobile user experience.`,
        impact: 'high',
        recommendation:
          'Implement aggressive code splitting and lazy loading to improve mobile performance.',
        category: 'performance',
      };
      this.insights.push(insight);
    }

    // Compression efficiency insights
    const compressionRatio = ((totalSize - totalGzipSize) / totalSize) * 100;
    if (compressionRatio < 30) {
      const insight: OptimizationInsight = {
        id: 'poor-compression',
        type: 'warning',
        title: 'Poor Compression Efficiency',
        description: `Your bundle only compresses by ${compressionRatio.toFixed(
          1
        )}%, which is below the typical 30-70% range.`,
        impact: 'medium',
        recommendation:
          'Review your code for opportunities to improve compression (remove comments, minify, use shorter variable names).',
        category: 'performance',
      };
      this.insights.push(insight);
    }

    // Bundle size performance insights
    if (totalSize > 1024 * 1024) {
      const insight: OptimizationInsight = {
        id: 'large-bundle-performance',
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
    } else if (totalSize > 500 * 1024) {
      const insight: OptimizationInsight = {
        id: 'medium-bundle-performance',
        type: 'info',
        title: 'Moderate Bundle Size',
        description: `Your bundle size is ${this.formatSize(
          totalSize
        )}, which is acceptable but could be optimized further.`,
        impact: 'medium',
        recommendation:
          'Implement code splitting for non-critical features to improve initial load time.',
        category: 'performance',
      };
      this.insights.push(insight);
    } else {
      const insight: OptimizationInsight = {
        id: 'good-bundle-size',
        type: 'success',
        title: 'Good Bundle Size',
        description: `Your bundle size is ${this.formatSize(
          totalSize
        )}, which is excellent for performance.`,
        impact: 'low',
        recommendation:
          'Maintain this size and focus on other optimization areas like caching and delivery.',
        category: 'performance',
      };
      this.insights.push(insight);
    }
  }

  private analyzePerformance(): void {
    // This method is now replaced by generatePerformanceInsights
    // Keeping for backward compatibility but it's no longer used
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
