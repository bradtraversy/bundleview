import { OptimizationInsight } from '../types';

export interface JavaScriptAnalysis {
  fileType: 'vanilla' | 'bundle' | 'module' | 'unknown';
  confidence: number; // 0-100 confidence in the file type detection
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

export class JavaScriptAnalyzer {
  private content: string = '';
  private lines: string[] = [];
  private analysis: JavaScriptAnalysis;

  constructor() {
    this.analysis = this.createEmptyAnalysis();
  }

  public analyzeFile(content: string): JavaScriptAnalysis {
    this.content = content;
    this.lines = content.split('\n');

    // Reset analysis
    this.analysis = this.createEmptyAnalysis();

    // Perform comprehensive analysis
    this.detectFileType();
    this.analyzeFunctions();
    this.analyzeClasses();
    this.analyzeImports();
    this.analyzeExports();
    this.detectLibraries();
    this.calculateMetrics();
    this.generateInsights();

    return this.analysis;
  }

  private createEmptyAnalysis(): JavaScriptAnalysis {
    return {
      fileType: 'unknown',
      confidence: 0,
      functions: [],
      classes: [],
      imports: [],
      exports: [],
      dependencies: [],
      libraries: [],
      codeMetrics: {
        totalLines: 0,
        codeLines: 0,
        commentLines: 0,
        emptyLines: 0,
        functionCount: 0,
        classCount: 0,
        importCount: 0,
        exportCount: 0,
        averageFunctionSize: 0,
        averageClassSize: 0,
        cyclomaticComplexity: 0,
      },
      optimizationOpportunities: [],
      insights: [],
    };
  }

  private detectFileType(): void {
    const indicators = {
      webpack: this.detectWebpackIndicators(),
      bundle: this.detectBundleIndicators(),
      module: this.detectModuleIndicators(),
      vanilla: this.detectVanillaIndicators(),
    };

    // Calculate confidence scores
    const scores = {
      webpack: indicators.webpack * 0.4,
      bundle: indicators.bundle * 0.3,
      module: indicators.module * 0.2,
      vanilla: indicators.vanilla * 0.1,
    };

    // Determine file type based on highest score
    const maxScore = Math.max(...Object.values(scores));
    const fileType = Object.keys(scores).find(
      (key) => scores[key as keyof typeof scores] === maxScore
    ) as keyof typeof scores;

    this.analysis.fileType = fileType === 'webpack' ? 'bundle' : fileType;
    this.analysis.confidence = Math.round(maxScore * 100);
  }

  private detectWebpackIndicators(): number {
    const patterns = [
      /webpack_require/g,
      /__webpack_require__/g,
      /webpackJsonp/g,
      /webpackChunk/g,
      /__webpack_modules__/g,
    ];

    return patterns.reduce((score, pattern) => {
      const matches = this.content.match(pattern);
      return score + (matches ? matches.length * 0.2 : 0);
    }, 0);
  }

  private detectBundleIndicators(): number {
    const patterns = [
      /\(function\s*\(/g,
      /UMD|AMD|CommonJS/g,
      /define\s*\(/g,
      /module\.exports/g,
    ];

    return patterns.reduce((score, pattern) => {
      const matches = this.content.match(pattern);
      return score + (matches ? matches.length * 0.15 : 0);
    }, 0);
  }

  private detectModuleIndicators(): number {
    const patterns = [/import\s+/g, /export\s+/g, /from\s+['"`]/g];

    return patterns.reduce((score, pattern) => {
      const matches = this.content.match(pattern);
      return score + (matches ? matches.length * 0.1 : 0);
    }, 0);
  }

  private detectVanillaIndicators(): number {
    const patterns = [
      /function\s+\w+\s*\(/g,
      /const\s+\w+\s*=/g,
      /let\s+\w+\s*=/g,
      /var\s+\w+\s*=/g,
      /class\s+\w+/g,
    ];

    return patterns.reduce((score, pattern) => {
      const matches = this.content.match(pattern);
      return score + (matches ? matches.length * 0.05 : 0);
    }, 0);
  }

  private analyzeFunctions(): void {
    // Function declarations
    const functionRegex = /function\s+(\w+)\s*\(([^)]*)\)/g;
    let match;
    while ((match = functionRegex.exec(this.content)) !== null) {
      const functionName = match[1];
      const parameters = match[2]
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p);
      const lineStart = this.getLineNumber(match.index);
      const lineEnd = this.getLineEnd(lineStart);
      const size = this.calculateFunctionSize(lineStart, lineEnd);

      this.analysis.functions.push({
        name: functionName,
        type: 'function',
        lineStart,
        lineEnd,
        size,
        complexity: this.calculateComplexity(lineStart, lineEnd),
        parameters,
      });
    }

    // Arrow functions
    const arrowFunctionRegex = /const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>/g;
    while ((match = arrowFunctionRegex.exec(this.content)) !== null) {
      const functionName = match[1];
      const parameters = match[2]
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p);
      const lineStart = this.getLineNumber(match.index);
      const lineEnd = this.getLineEnd(lineStart);
      const size = this.calculateFunctionSize(lineStart, lineEnd);

      this.analysis.functions.push({
        name: functionName,
        type: 'arrow',
        lineStart,
        lineEnd,
        size,
        complexity: this.calculateComplexity(lineStart, lineEnd),
        parameters,
      });
    }

    // Async functions
    const asyncFunctionRegex = /async\s+function\s+(\w+)\s*\(([^)]*)\)/g;
    while ((match = asyncFunctionRegex.exec(this.content)) !== null) {
      const functionName = match[1];
      const parameters = match[2]
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p);
      const lineStart = this.getLineNumber(match.index);
      const lineEnd = this.getLineEnd(lineStart);
      const size = this.calculateFunctionSize(lineStart, lineEnd);

      this.analysis.functions.push({
        name: functionName,
        type: 'async',
        lineStart,
        lineEnd,
        size,
        complexity: this.calculateComplexity(lineStart, lineEnd),
        parameters,
      });
    }
  }

  private analyzeClasses(): void {
    const classRegex =
      /class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^{]+))?\s*{/g;
    let match;

    while ((match = classRegex.exec(this.content)) !== null) {
      const className = match[1];
      const extendsClass = match[2];
      const implementsInterfaces = match[3]
        ? match[3].split(',').map((i) => i.trim())
        : [];
      const lineStart = this.getLineNumber(match.index);
      const lineEnd = this.getLineEnd(lineStart);
      const size = this.calculateFunctionSize(lineStart, lineEnd);

      // Extract methods and properties
      const classContent = this.lines.slice(lineStart - 1, lineEnd);
      const methods = this.extractClassMethods(classContent);
      const properties = this.extractClassProperties(classContent);

      this.analysis.classes.push({
        name: className,
        lineStart,
        lineEnd,
        size,
        methods,
        properties,
        extends: extendsClass,
        implements: implementsInterfaces,
      });
    }
  }

  private analyzeImports(): void {
    // ES6 imports
    const importRegex = /import\s+(?:{([^}]+)}\s+from\s+)?['"`]([^'"`]+)['"`]/g;
    let match;

    while ((match = importRegex.exec(this.content)) !== null) {
      const items = match[1]
        ? match[1].split(',').map((i) => i.trim())
        : ['default'];
      const source = match[2];
      const line = this.getLineNumber(match.index);

      this.analysis.imports.push({
        source,
        type: 'es6',
        items,
        line,
      });

      this.analysis.dependencies.push(source);
    }

    // CommonJS requires
    const requireRegex = /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    while ((match = requireRegex.exec(this.content)) !== null) {
      const source = match[1];
      const line = this.getLineNumber(match.index);

      this.analysis.imports.push({
        source,
        type: 'commonjs',
        items: ['default'],
        line,
      });

      this.analysis.dependencies.push(source);
    }

    // Dynamic imports
    const dynamicImportRegex = /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    while ((match = dynamicImportRegex.exec(this.content)) !== null) {
      const source = match[1];
      const line = this.getLineNumber(match.index);

      this.analysis.imports.push({
        source,
        type: 'dynamic',
        items: ['dynamic'],
        line,
      });

      this.analysis.dependencies.push(source);
    }
  }

  private analyzeExports(): void {
    // Named exports
    const namedExportRegex =
      /export\s+(?:const|let|var|function|class)\s+(\w+)/g;
    let match;

    while ((match = namedExportRegex.exec(this.content)) !== null) {
      const item = match[1];
      const line = this.getLineNumber(match.index);

      this.analysis.exports.push({
        type: 'named',
        items: [item],
        line,
      });
    }

    // Default exports
    const defaultExportRegex = /export\s+default\s+(\w+)/g;
    while ((match = defaultExportRegex.exec(this.content)) !== null) {
      const item = match[1];
      const line = this.getLineNumber(match.index);

      this.analysis.exports.push({
        type: 'default',
        items: [item],
        line,
      });
    }

    // Export all
    const exportAllRegex = /export\s+\*\s+from\s+['"`]([^'"`]+)['"`]/g;
    while ((match = exportAllRegex.exec(this.content)) !== null) {
      const source = match[1];
      const line = this.getLineNumber(match.index);

      this.analysis.exports.push({
        type: 'all',
        items: [source],
        line,
      });
    }
  }

  private detectLibraries(): void {
    const libraryPatterns = [
      { name: 'jQuery', patterns: [/\$\(/g, /jQuery\(/g], confidence: 0.9 },
      {
        name: 'Lodash',
        patterns: [/_\.[a-zA-Z]+/g, /lodash/g],
        confidence: 0.8,
      },
      {
        name: 'Moment.js',
        patterns: [/moment\(/g, /moment\./g],
        confidence: 0.9,
      },
      { name: 'Axios', patterns: [/axios\./g, /axios\(/g], confidence: 0.8 },
      {
        name: 'React',
        patterns: [/React\./g, /useState/g, /useEffect/g],
        confidence: 0.9,
      },
      {
        name: 'Vue',
        patterns: [/Vue\./g, /createApp/g, /ref\(/g],
        confidence: 0.9,
      },
      {
        name: 'Angular',
        patterns: [/angular\./g, /@Component/g, /@Injectable/g],
        confidence: 0.9,
      },
      {
        name: 'Express',
        patterns: [/express\(/g, /app\./g, /router\./g],
        confidence: 0.8,
      },
      {
        name: 'Node.js',
        patterns: [/require\(/g, /module\.exports/g, /process\./g],
        confidence: 0.7,
      },
    ];

    libraryPatterns.forEach((library) => {
      let usageCount = 0;
      library.patterns.forEach((pattern) => {
        const matches = this.content.match(pattern);
        if (matches) {
          usageCount += matches.length;
        }
      });

      if (usageCount > 0) {
        this.analysis.libraries.push({
          name: library.name,
          confidence: library.confidence,
          patterns: library.patterns.map((p) => p.source),
          usageCount,
        });
      }
    });
  }

  private calculateMetrics(): void {
    this.analysis.codeMetrics = {
      totalLines: this.lines.length,
      codeLines: this.lines.filter(
        (line) =>
          line.trim() &&
          !line.trim().startsWith('//') &&
          !line.trim().startsWith('/*')
      ).length,
      commentLines: this.lines.filter(
        (line) => line.trim().startsWith('//') || line.trim().startsWith('/*')
      ).length,
      emptyLines: this.lines.filter((line) => !line.trim()).length,
      functionCount: this.analysis.functions.length,
      classCount: this.analysis.classes.length,
      importCount: this.analysis.imports.length,
      exportCount: this.analysis.exports.length,
      averageFunctionSize:
        this.analysis.functions.length > 0
          ? Math.round(
              this.analysis.functions.reduce((sum, f) => sum + f.size, 0) /
                this.analysis.functions.length
            )
          : 0,
      averageClassSize:
        this.analysis.classes.length > 0
          ? Math.round(
              this.analysis.classes.reduce((sum, c) => sum + c.size, 0) /
                this.analysis.classes.length
            )
          : 0,
      cyclomaticComplexity: this.calculateOverallComplexity(),
    };
  }

  private generateInsights(): void {
    this.analysis.optimizationOpportunities = [];
    this.analysis.insights = [];

    // Function size insights
    const largeFunctions = this.analysis.functions.filter((f) => f.size > 50);
    if (largeFunctions.length > 0) {
      this.analysis.optimizationOpportunities.push(
        `${largeFunctions.length} large functions detected. Consider breaking them down for better maintainability.`
      );
    }

    // Class insights
    if (this.analysis.classes.length > 0) {
      const largeClasses = this.analysis.classes.filter((c) => c.size > 100);
      if (largeClasses.length > 0) {
        this.analysis.optimizationOpportunities.push(
          `${largeClasses.length} large classes detected. Consider splitting into smaller, focused classes.`
        );
      }
    }

    // Import insights
    if (this.analysis.imports.length > 10) {
      this.analysis.optimizationOpportunities.push(
        'High number of imports detected. Consider bundling or using barrel exports.'
      );
    }

    // Library insights
    this.analysis.libraries.forEach((library) => {
      if (library.usageCount > 20) {
        this.analysis.optimizationOpportunities.push(
          `Heavy usage of ${library.name} detected. Consider code splitting or lazy loading.`
        );
      }
    });

    // Code quality insights
    if (this.analysis.codeMetrics.cyclomaticComplexity > 10) {
      this.analysis.optimizationOpportunities.push(
        'High cyclomatic complexity detected. Consider simplifying control flow.'
      );
    }
  }

  // Helper methods
  private getLineNumber(index: number): number {
    return this.content.substring(0, index).split('\n').length;
  }

  private getLineEnd(startLine: number): number {
    // Simple heuristic: look for closing brace or end of file
    for (let i = startLine; i < this.lines.length; i++) {
      if (this.lines[i].includes('}') && this.lines[i].trim() === '}') {
        return i + 1;
      }
    }
    return this.lines.length;
  }

  private calculateFunctionSize(startLine: number, endLine: number): number {
    return this.lines.slice(startLine - 1, endLine).join('\n').length;
  }

  private calculateComplexity(startLine: number, endLine: number): number {
    const functionContent = this.lines.slice(startLine - 1, endLine).join('\n');
    let complexity = 1; // Base complexity

    // Count control flow statements
    const patterns = [
      /if\s*\(/g,
      /else\s*if\s*\(/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /switch\s*\(/g,
      /\?\s*[^:]+:/g,
    ];
    patterns.forEach((pattern) => {
      const matches = functionContent.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  private calculateOverallComplexity(): number {
    return this.analysis.functions.reduce(
      (total, f) => total + f.complexity,
      0
    );
  }

  private extractClassMethods(classContent: string[]): string[] {
    const methods: string[] = [];
    const methodPatterns = [
      /(\w+)\s*\([^)]*\)\s*{/g,
      /(\w+)\s*=\s*\([^)]*\)\s*=>/g,
      /async\s+(\w+)\s*\([^)]*\)/g,
    ];

    classContent.forEach((line) => {
      methodPatterns.forEach((pattern) => {
        const match = line.match(pattern);
        if (match) {
          methods.push(match[1]);
        }
      });
    });

    return methods;
  }

  private extractClassProperties(classContent: string[]): string[] {
    const properties: string[] = [];
    const propertyPatterns = [
      /(\w+)\s*[:=]/g,
      /get\s+(\w+)\s*\(\)/g,
      /set\s+(\w+)\s*\(/g,
    ];

    classContent.forEach((line) => {
      propertyPatterns.forEach((pattern) => {
        const match = line.match(pattern);
        if (match) {
          properties.push(match[1]);
        }
      });
    });

    return properties;
  }
}
