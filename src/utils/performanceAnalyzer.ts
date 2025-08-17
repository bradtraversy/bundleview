import {
  PerformanceData,
  LoadTimeEstimate,
  CriticalPath,
  BundleModule,
  BundleData,
} from '../types';

export class PerformanceAnalyzer {
  private bundleData: BundleData;

  constructor(bundleData: BundleData) {
    this.bundleData = bundleData;
  }

  public analyze(): PerformanceData {
    const loadTimeEstimates = this.calculateLoadTimeEstimates();
    const criticalPath = this.analyzeCriticalPath();
    const performanceScore = this.calculatePerformanceScore();
    const recommendations = this.generateRecommendations();

    return {
      metrics: null, // Will be populated when Lighthouse integration is added
      loadTimeEstimates,
      criticalPath,
      performanceScore,
      recommendations,
    };
  }

  private calculateLoadTimeEstimates(): LoadTimeEstimate {
    const totalSize = this.bundleData.totalSize;

    // Calculate load times based on network speeds (in seconds)
    // Formula: (bundle size in bits) / (network speed in bits per second)
    return {
      fast3G: (totalSize * 8) / (1.6 * 1024 * 1024), // 1.6 Mbps
      slow3G: (totalSize * 8) / (780 * 1024), // 780 Kbps
      fast4G: (totalSize * 8) / (9 * 1024 * 1024), // 9 Mbps
      wifi: (totalSize * 8) / (30 * 1024 * 1024), // 30 Mbps
    };
  }

  private analyzeCriticalPath(): CriticalPath {
    const modules = this.bundleData.modules;
    const totalSize = this.bundleData.totalSize;

    // Identify potentially blocking modules (large modules that might block rendering)
    const blockingModules = modules
      .filter((module) => module.size > totalSize * 0.1) // Modules > 10% of total bundle
      .sort((a, b) => b.size - a.size)
      .slice(0, 5); // Top 5 blocking modules

    // Estimate total blocking time based on module sizes and complexity
    const totalBlockingTime = blockingModules.reduce((total, module) => {
      // Rough estimate: larger modules take longer to parse/execute
      const parseTime = (module.size / 1024) * 0.1; // 0.1ms per KB
      return total + parseTime;
    }, 0);

    const optimizationOpportunities =
      this.generateOptimizationOpportunities(blockingModules);

    return {
      blockingModules,
      totalBlockingTime,
      optimizationOpportunities,
    };
  }

  private generateOptimizationOpportunities(
    blockingModules: BundleModule[]
  ): string[] {
    const opportunities: string[] = [];
    const totalSize = this.bundleData.totalSize;

    // Analyze bundle composition
    const jsModules = this.bundleData.modules.filter((m) => m.type === 'js');
    const cssModules = this.bundleData.modules.filter((m) => m.type === 'css');
    const externalModules = this.bundleData.modules.filter((m) => m.isExternal);

    // Large bundle warnings
    if (totalSize > 500 * 1024) {
      // > 500KB
      opportunities.push('Bundle size exceeds 500KB - consider code splitting');
    }
    if (totalSize > 1024 * 1024) {
      // > 1MB
      opportunities.push(
        'Bundle size exceeds 1MB - implement aggressive code splitting'
      );
    }

    // Module type analysis
    if (jsModules.length > 100) {
      opportunities.push('High module count - consider bundling strategies');
    }
    if (cssModules.length > 10) {
      opportunities.push('Multiple CSS files - consider CSS bundling');
    }

    // External dependencies
    if (externalModules.length > 20) {
      opportunities.push('Many external dependencies - review necessity');
    }

    // Large individual modules
    blockingModules.forEach((module) => {
      if (module.size > totalSize * 0.2) {
        // > 20% of bundle
        opportunities.push(
          `Large module "${module.name}" - consider splitting`
        );
      }
    });

    // Code splitting opportunities
    if (this.bundleData.chunks.length === 1) {
      opportunities.push('Single chunk detected - implement code splitting');
    }

    return opportunities;
  }

  private calculatePerformanceScore(): number {
    const totalSize = this.bundleData.totalSize;
    const totalGzipSize = this.bundleData.totalGzipSize;
    const modules = this.bundleData.modules;

    let score = 100;

    // Bundle size penalties
    if (totalSize > 1024 * 1024) {
      // > 1MB
      score -= 30;
    } else if (totalSize > 500 * 1024) {
      // > 500KB
      score -= 20;
    } else if (totalSize > 250 * 1024) {
      // > 250KB
      score -= 10;
    }

    // Compression efficiency
    if (totalGzipSize && totalSize > 0) {
      const compressionRatio = totalGzipSize / totalSize;
      if (compressionRatio > 0.4) {
        // Poor compression
        score -= 15;
      } else if (compressionRatio > 0.3) {
        // Good compression
        score -= 5;
      }
    }

    // Module count penalties
    if (modules.length > 200) {
      score -= 15;
    } else if (modules.length > 100) {
      score -= 10;
    } else if (modules.length > 50) {
      score -= 5;
    }

    // External dependency penalties
    const externalModules = modules.filter((m) => m.isExternal);
    if (externalModules.length > 30) {
      score -= 10;
    } else if (externalModules.length > 20) {
      score -= 5;
    }

    // Code splitting bonus
    if (this.bundleData.chunks.length > 1) {
      score += 10;
    }

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const totalSize = this.bundleData.totalSize;
    const modules = this.bundleData.modules;

    // Size-based recommendations
    if (totalSize > 1024 * 1024) {
      recommendations.push(
        'Implement aggressive code splitting to reduce bundle size'
      );
      recommendations.push('Consider lazy loading for non-critical components');
    } else if (totalSize > 500 * 1024) {
      recommendations.push('Implement code splitting for better performance');
      recommendations.push('Review and remove unused dependencies');
    }

    // Module-based recommendations
    if (modules.length > 100) {
      recommendations.push('Consolidate small modules to reduce HTTP requests');
      recommendations.push('Use tree shaking to eliminate dead code');
    }

    // External dependency recommendations
    const externalModules = modules.filter((m) => m.isExternal);
    if (externalModules.length > 20) {
      recommendations.push('Audit external dependencies for necessity');
      recommendations.push(
        'Consider bundling frequently used external libraries'
      );
    }

    // Code splitting recommendations
    if (this.bundleData.chunks.length === 1) {
      recommendations.push(
        'Split vendor and application code into separate chunks'
      );
      recommendations.push('Implement route-based code splitting');
    }

    // Performance monitoring
    recommendations.push('Monitor Core Web Vitals in production');
    recommendations.push('Set up performance budgets for bundle size');

    return recommendations;
  }
}
