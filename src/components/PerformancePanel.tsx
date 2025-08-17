import React from 'react';
import { PerformanceData } from '../types';

interface PerformancePanelProps {
  performanceData: PerformanceData;
  bundleSize: number;
}

const PerformancePanel: React.FC<PerformancePanelProps> = ({
  performanceData,
}) => {
  const formatTime = (seconds: number): string => {
    if (seconds < 1) {
      return `${Math.round(seconds * 1000)}ms`;
    }
    return `${seconds.toFixed(2)}s`;
  };

  const getPerformanceColor = (score: number): string => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPerformanceLabel = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Needs Improvement';
    return 'Poor';
  };

  return (
    <div className='space-y-6'>
      {/* Performance Score */}
      <div className='bg-gray-800 rounded-lg p-6'>
        <h3 className='text-xl font-semibold text-white mb-4'>
          Performance Score
        </h3>
        <div className='flex items-center space-x-4'>
          <div
            className={`text-4xl font-bold ${getPerformanceColor(
              performanceData.performanceScore
            )}`}
          >
            {performanceData.performanceScore}
          </div>
          <div>
            <div className='text-white font-medium'>
              {getPerformanceLabel(performanceData.performanceScore)}
            </div>
            <div className='text-gray-400 text-sm'>
              Based on bundle size and optimization
            </div>
          </div>
        </div>
      </div>

      {/* Load Time Estimates */}
      <div className='bg-gray-800 rounded-lg p-6'>
        <h3 className='text-xl font-semibold text-white mb-4'>
          Load Time Estimates
        </h3>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-blue-400'>
              {formatTime(performanceData.loadTimeEstimates.fast3G)}
            </div>
            <div className='text-gray-400 text-sm'>Fast 3G</div>
            <div className='text-gray-500 text-xs'>1.6 Mbps</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-yellow-400'>
              {formatTime(performanceData.loadTimeEstimates.slow3G)}
            </div>
            <div className='text-gray-400 text-sm'>Slow 3G</div>
            <div className='text-gray-500 text-xs'>780 Kbps</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-green-400'>
              {formatTime(performanceData.loadTimeEstimates.fast4G)}
            </div>
            <div className='text-gray-400 text-sm'>Fast 4G</div>
            <div className='text-gray-500 text-xs'>9 Mbps</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-purple-400'>
              {formatTime(performanceData.loadTimeEstimates.wifi)}
            </div>
            <div className='text-gray-400 text-sm'>WiFi</div>
            <div className='text-gray-500 text-xs'>30 Mbps</div>
          </div>
        </div>
      </div>

      {/* Critical Path Analysis */}
      <div className='bg-gray-800 rounded-lg p-6'>
        <h3 className='text-xl font-semibold text-white mb-4'>
          Critical Path Analysis
        </h3>
        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <span className='text-gray-300'>Total Blocking Time</span>
            <span className='text-xl font-semibold text-red-400'>
              {formatTime(performanceData.criticalPath.totalBlockingTime)}
            </span>
          </div>

          {performanceData.criticalPath.blockingModules.length > 0 && (
            <div>
              <h4 className='text-white font-medium mb-2'>Blocking Modules</h4>
              <div className='space-y-2'>
                {performanceData.criticalPath.blockingModules
                  .slice(0, 5)
                  .map((module) => (
                    <div
                      key={module.id}
                      className='flex justify-between items-center bg-gray-700 rounded px-3 py-2'
                    >
                      <span className='text-gray-300 text-sm truncate'>
                        {module.name}
                      </span>
                      <span className='text-gray-400 text-sm'>
                        {(module.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {performanceData.criticalPath.optimizationOpportunities.length >
            0 && (
            <div>
              <h4 className='text-white font-medium mb-2'>
                Optimization Opportunities
              </h4>
              <ul className='space-y-2'>
                {performanceData.criticalPath.optimizationOpportunities.map(
                  (opportunity, index) => (
                    <li
                      key={index}
                      className='text-gray-300 text-sm flex items-start space-x-2'
                    >
                      <span className='text-blue-400 mt-1'>•</span>
                      <span>{opportunity}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Performance Recommendations */}
      {performanceData.recommendations.length > 0 && (
        <div className='bg-gray-800 rounded-lg p-6'>
          <h3 className='text-xl font-semibold text-white mb-4'>
            Performance Recommendations
          </h3>
          <div className='space-y-3'>
            {performanceData.recommendations.map((recommendation, index) => (
              <div
                key={index}
                className='flex items-start space-x-3 p-3 bg-gray-700 rounded'
              >
                <span className='text-blue-400 text-lg'>💡</span>
                <span className='text-gray-300 text-sm'>{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformancePanel;
