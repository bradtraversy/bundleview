import { StatisticsPanelProps } from '../types';

const StatisticsPanel = ({ bundleData }: StatisticsPanelProps) => {
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatPercentage = (value: number, total: number): string => {
    return ((value / total) * 100).toFixed(1) + '%';
  };

  const getFileTypeBreakdown = () => {
    const breakdown: Record<string, { count: number; size: number }> = {};

    bundleData.modules.forEach((module) => {
      if (!breakdown[module.type]) {
        breakdown[module.type] = { count: 0, size: 0 };
      }
      breakdown[module.type].count++;
      breakdown[module.type].size += module.size;
    });

    return Object.entries(breakdown).map(([type, data]) => ({
      type,
      ...data,
      percentage: formatPercentage(data.size, bundleData.totalSize),
    }));
  };

  const getLargestModules = () => {
    return [...bundleData.modules].sort((a, b) => b.size - a.size).slice(0, 10);
  };

  const getChunkBreakdown = () => {
    return bundleData.chunks.map((chunk) => ({
      ...chunk,
      percentage: formatPercentage(chunk.size, bundleData.totalSize),
    }));
  };

  const estimateLoadTime = (sizeInBytes: number): string => {
    // Rough estimation: 1MB = ~1 second on 3G, 0.1 second on 4G
    const sizeInMB = sizeInBytes / (1024 * 1024);
    const time3G = sizeInMB * 1;
    const time4G = sizeInMB * 0.1;

    if (time3G < 1) {
      return `${(time3G * 1000).toFixed(0)}ms (3G) / ${(time4G * 1000).toFixed(
        0
      )}ms (4G)`;
    } else {
      return `${time3G.toFixed(1)}s (3G) / ${time4G.toFixed(1)}s (4G)`;
    }
  };

  return (
    <div className='space-y-6'>
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-white mb-2'>
          Bundle Statistics
        </h3>
        <p className='text-gray-400 text-sm'>
          Detailed breakdown of your bundle composition and performance metrics.
        </p>
      </div>

      {/* Overall metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='card text-center'>
          <div className='text-3xl font-bold text-accent mb-2'>
            {formatSize(bundleData.totalSize)}
          </div>
          <div className='text-gray-400 text-sm'>Total Bundle Size</div>
        </div>

        <div className='card text-center'>
          <div className='text-3xl font-bold text-green-400 mb-2'>
            {formatSize(bundleData.totalGzipSize)}
          </div>
          <div className='text-gray-400 text-sm'>Gzipped Size</div>
        </div>

        <div className='card text-center'>
          <div className='text-3xl font-bold text-blue-400 mb-2'>
            {bundleData.modules.length}
          </div>
          <div className='text-gray-400 text-sm'>Total Modules</div>
        </div>

        <div className='card text-center'>
          <div className='text-3xl font-bold text-purple-400 mb-2'>
            {bundleData.chunks.length}
          </div>
          <div className='text-gray-400 text-sm'>Chunks</div>
        </div>
      </div>

      {/* File type breakdown */}
      <div className='card'>
        <h4 className='text-lg font-semibold text-white mb-4'>
          File Type Breakdown
        </h4>
        <div className='space-y-3'>
          {getFileTypeBreakdown().map(({ type, count, size, percentage }) => (
            <div key={type} className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <span className='text-gray-400 capitalize'>{type}</span>
                <span className='text-gray-500 text-sm'>({count} files)</span>
              </div>
              <div className='flex items-center space-x-3'>
                <span className='text-white font-medium'>
                  {formatSize(size)}
                </span>
                <span className='text-gray-400 text-sm'>{percentage}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance estimates */}
      <div className='card'>
        <h4 className='text-lg font-semibold text-white mb-4'>
          Performance Estimates
        </h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <div className='text-gray-400 text-sm mb-1'>
              Estimated Load Time
            </div>
            <div className='text-white font-medium'>
              {estimateLoadTime(bundleData.totalSize)}
            </div>
          </div>

          <div>
            <div className='text-gray-400 text-sm mb-1'>Compression Ratio</div>
            <div className='text-white font-medium'>
              {(
                ((bundleData.totalSize - bundleData.totalGzipSize) /
                  bundleData.totalSize) *
                100
              ).toFixed(1)}
              %
            </div>
          </div>

          <div>
            <div className='text-gray-400 text-sm mb-1'>
              Average Module Size
            </div>
            <div className='text-white font-medium'>
              {formatSize(bundleData.totalSize / bundleData.modules.length)}
            </div>
          </div>

          <div>
            <div className='text-gray-400 text-sm mb-1'>Largest Module</div>
            <div className='text-white font-medium'>
              {bundleData.modules.length > 0
                ? formatSize(Math.max(...bundleData.modules.map((m) => m.size)))
                : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Largest modules */}
      <div className='card'>
        <h4 className='text-lg font-semibold text-white mb-4'>
          Top 10 Largest Modules
        </h4>
        <div className='space-y-2'>
          {getLargestModules().map((module, index) => (
            <div
              key={module.id}
              className='flex items-center justify-between p-3 bg-gray-800/30 rounded-lg'
            >
              <div className='flex items-center space-x-3'>
                <span className='text-gray-500 text-sm w-6'>#{index + 1}</span>
                <div className='max-w-xs'>
                  <div
                    className='text-white font-mono text-sm truncate'
                    title={module.name}
                  >
                    {module.name}
                  </div>
                </div>
              </div>
              <div className='flex items-center space-x-3'>
                <span className='text-white font-medium'>
                  {formatSize(module.size)}
                </span>
                <span className='text-gray-400 text-sm'>
                  {formatPercentage(module.size, bundleData.totalSize)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chunk breakdown */}
      {bundleData.chunks.length > 0 && (
        <div className='card'>
          <h4 className='text-lg font-semibold text-white mb-4'>
            Chunk Breakdown
          </h4>
          <div className='space-y-3'>
            {getChunkBreakdown().map((chunk) => (
              <div
                key={chunk.id}
                className='flex items-center justify-between p-3 bg-gray-800/30 rounded-lg'
              >
                <div className='flex items-center space-x-3'>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      chunk.entry
                        ? 'bg-accent/20 text-accent border border-accent/30'
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}
                  >
                    {chunk.entry ? 'Entry' : 'Chunk'}
                  </span>
                  <span className='text-white font-medium'>{chunk.name}</span>
                </div>
                <div className='flex items-center space-x-3'>
                  <span className='text-white font-medium'>
                    {formatSize(chunk.size)}
                  </span>
                  <span className='text-gray-400 text-sm'>
                    {chunk.percentage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsPanel;
