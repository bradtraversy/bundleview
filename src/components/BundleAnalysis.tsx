import { useState, useEffect } from 'react';
import {
  BundleAnalysisProps,
  BundleModule,
  TabType,
  PerformanceData,
} from '../types';
import Treemap from './Treemap';
import InsightsPanel from './InsightsPanel';
import FileExplorer from './FileExplorer';
import StatisticsPanel from './StatisticsPanel';
import PerformancePanel from './PerformancePanel';
import { PerformanceAnalyzer } from '../utils/performanceAnalyzer';

const BundleAnalysis = ({ bundleData, onReset }: BundleAnalysisProps) => {
  const [selectedModule, setSelectedModule] = useState<BundleModule | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<TabType>('insights');
  const [performanceData, setPerformanceData] =
    useState<PerformanceData | null>(null);

  // Analyze performance when bundle data changes
  useEffect(() => {
    if (bundleData) {
      const analyzer = new PerformanceAnalyzer(bundleData);
      const analysis = analyzer.analyze();
      setPerformanceData(analysis);
    }
  }, [bundleData]);

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const compressionRatio = (
    ((bundleData.totalSize - bundleData.totalGzipSize) / bundleData.totalSize) *
    100
  ).toFixed(1);

  return (
    <div className='space-y-6'>
      {/* Header with summary */}
      <div className='card'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h2 className='text-2xl font-bold text-white mb-2'>
              Bundle Analysis Results
            </h2>
            <p className='text-gray-400'>
              Analyzed {bundleData.metadata.fileCount} files on{' '}
              {new Date(bundleData.metadata.analyzedAt).toLocaleDateString()}
            </p>
          </div>

          <button onClick={onReset} className='btn-secondary'>
            Analyze New Bundle
          </button>
        </div>

        {/* Summary stats */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='bg-gray-800/50 rounded-lg p-4 text-center group relative'>
            <div className='text-2xl font-bold text-accent mb-1'>
              {formatSize(bundleData.totalSize)}
            </div>
            <div className='text-gray-400 text-sm'>Total Size</div>
            {/* Tooltip */}
            <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 max-w-xs group-hover:left-auto group-hover:right-auto group-hover:ml-0 group-hover:mr-0 group-hover:translate-x-0'>
              The total uncompressed size of all your JavaScript, CSS, and other
              assets combined. This is what users download before any
              compression.
              <div className='absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900'></div>
            </div>
          </div>

          <div className='bg-gray-800/50 rounded-lg p-4 text-center group relative'>
            <div className='text-2xl font-bold text-green-400 mb-1'>
              {formatSize(bundleData.totalGzipSize)}
            </div>
            <div className='text-gray-400 text-sm'>Gzipped Size</div>
            {/* Tooltip */}
            <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 max-w-xs group-hover:left-auto group-hover:right-auto group-hover:ml-0 group-hover:mr-0 group-hover:translate-x-0'>
              The compressed size when using gzip compression. This is closer to
              what users actually download over the network, typically 20-70%
              smaller than uncompressed.
              <div className='absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900'></div>
            </div>
          </div>

          <div className='bg-gray-800/50 rounded-lg p-4 text-center group relative'>
            <div className='text-2xl font-bold text-blue-400 mb-1'>
              {compressionRatio}%
            </div>
            <div className='text-gray-400 text-sm'>Compression</div>
            {/* Tooltip */}
            <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 max-w-xs group-hover:left-auto group-hover:right-auto group-hover:ml-0 group-hover:mr-0 group-hover:translate-x-0'>
              How much smaller your bundle becomes with gzip compression. Higher
              percentages mean better compression. Most text-based assets (JS,
              CSS, HTML) compress very well.
              <div className='absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900'></div>
            </div>
          </div>

          <div className='bg-gray-800/50 rounded-lg p-4 text-center group relative'>
            <div className='text-2xl font-bold text-purple-400 mb-1'>
              {bundleData.modules.length}
            </div>
            <div className='text-gray-400 text-sm'>Modules</div>
            {/* Tooltip */}
            <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 max-w-xs group-hover:left-auto group-hover:right-auto group-hover:ml-0 group-hover:mr-0 group-hover:translate-x-0'>
              The total number of individual files or modules that make up your
              bundle. More modules can mean better code splitting but also more
              HTTP requests.
              <div className='absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900'></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className='card'>
        <div className='border-b border-gray-700 mb-6'>
          <nav className='flex space-x-8'>
            {[
              { id: 'insights', label: 'Optimization Insights', icon: '💡' },
              { id: 'performance', label: 'Performance', icon: '⚡' },
              { id: 'treemap', label: 'Treemap View', icon: '📊' },
              { id: 'files', label: 'File Explorer', icon: '📁' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className='min-h-[600px]'>
          {activeTab === 'treemap' && (
            <div>
              <div className='mb-4'>
                <h3 className='text-lg font-semibold text-white mb-2'>
                  Bundle Treemap
                </h3>
                <p className='text-gray-400 text-sm'>
                  Click on rectangles to explore modules. Size represents file
                  size, colors indicate file types.
                </p>
              </div>
              <Treemap
                data={bundleData.modules}
                onModuleClick={setSelectedModule}
              />
            </div>
          )}

          {activeTab === 'insights' && (
            <div className='space-y-6'>
              <StatisticsPanel bundleData={bundleData} />
              <InsightsPanel insights={bundleData.insights} />
            </div>
          )}

          {activeTab === 'performance' && performanceData && (
            <div>
              <div className='mb-4'>
                <h3 className='text-lg font-semibold text-white mb-2'>
                  Performance Analysis
                </h3>
                <p className='text-gray-400 text-sm'>
                  Detailed performance metrics, load time estimates, and
                  optimization recommendations.
                </p>
              </div>
              <PerformancePanel
                performanceData={performanceData}
                bundleSize={bundleData.totalSize}
              />
            </div>
          )}

          {activeTab === 'files' && (
            <FileExplorer
              modules={bundleData.modules}
              onModuleSelect={setSelectedModule}
            />
          )}
        </div>
      </div>

      {/* Selected module details */}
      {selectedModule && (
        <div className='card'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-white'>Module Details</h3>
            <button
              onClick={() => setSelectedModule(null)}
              className='text-gray-400 hover:text-white transition-colors duration-200'
            >
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <div className='text-gray-400 text-sm mb-1'>Name</div>
              <div className='text-white font-mono text-sm break-all'>
                {selectedModule.name}
              </div>
            </div>

            <div>
              <div className='text-gray-400 text-sm mb-1'>Size</div>
              <div className='text-white'>
                {formatSize(selectedModule.size)}
                {selectedModule.gzipSize && (
                  <span className='text-gray-400 ml-2'>
                    ({formatSize(selectedModule.gzipSize)} gzipped)
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className='text-gray-400 text-sm mb-1'>Type</div>
              <div className='text-white capitalize'>{selectedModule.type}</div>
            </div>

            <div>
              <div className='text-gray-400 text-sm mb-1'>Dependencies</div>
              <div className='text-white'>
                {selectedModule.dependencies.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BundleAnalysis;
