import { useState } from 'react';
import { BundleAnalysisProps } from '../types';
import Treemap from './Treemap';
import InsightsPanel from './InsightsPanel';
import StatisticsPanel from './StatisticsPanel';
import FileExplorer from './FileExplorer';

const BundleAnalysis = ({ bundleData, onReset }: BundleAnalysisProps) => {
  const [selectedModule, setSelectedModule] = useState(null);
  const [activeTab, setActiveTab] = useState<'treemap' | 'insights' | 'files'>(
    'treemap'
  );

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
          <div className='bg-gray-800/50 rounded-lg p-4 text-center'>
            <div className='text-2xl font-bold text-accent mb-1'>
              {formatSize(bundleData.totalSize)}
            </div>
            <div className='text-gray-400 text-sm'>Total Size</div>
          </div>

          <div className='bg-gray-800/50 rounded-lg p-4 text-center'>
            <div className='text-2xl font-bold text-green-400 mb-1'>
              {formatSize(bundleData.totalGzipSize)}
            </div>
            <div className='text-gray-400 text-sm'>Gzipped Size</div>
          </div>

          <div className='bg-gray-800/50 rounded-lg p-4 text-center'>
            <div className='text-2xl font-bold text-blue-400 mb-1'>
              {compressionRatio}%
            </div>
            <div className='text-gray-400 text-sm'>Compression</div>
          </div>

          <div className='bg-gray-800/50 rounded-lg p-4 text-center'>
            <div className='text-2xl font-bold text-purple-400 mb-1'>
              {bundleData.modules.length}
            </div>
            <div className='text-gray-400 text-sm'>Modules</div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className='card'>
        <div className='border-b border-gray-700 mb-6'>
          <nav className='flex space-x-8'>
            {[
              { id: 'treemap', label: 'Treemap View', icon: '📊' },
              { id: 'insights', label: 'Optimization Insights', icon: '💡' },
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
            <InsightsPanel insights={bundleData.insights} />
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
