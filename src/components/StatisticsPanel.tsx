import { StatisticsPanelProps } from '../types';
import { useState, useRef } from 'react';

// Tooltip component for explaining metrics
const MetricTooltip = ({
  children,
  tooltip,
}: {
  children: React.ReactNode;
  tooltip: string;
}) => {
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateTooltipPosition = () => {
    if (!containerRef.current || !tooltipRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = '50%';
    let transform = 'translateX(-50%)';
    let top = 'auto';
    let bottom = '100%';
    let marginBottom = '0.5rem';
    let marginTop = '0';

    // Check if tooltip would go off the left edge
    if (container.left < tooltip.width / 2) {
      left = '0';
      transform = 'translateX(0)';
    }
    // Check if tooltip would go off the right edge
    else if (container.right + tooltip.width / 2 > viewportWidth) {
      left = '100%';
      transform = 'translateX(-100%)';
    }

    // Check if tooltip would go off the top edge
    if (container.top < tooltip.height + 20) {
      top = '100%';
      bottom = 'auto';
      marginBottom = '0';
      marginTop = '0.5rem';
    }

    setTooltipStyle({
      left,
      top,
      bottom,
      marginBottom,
      marginTop,
      transform,
    });
  };

  const handleMouseEnter = () => {
    setShowTooltip(true);
    // Use setTimeout to ensure the tooltip is rendered before calculating position
    setTimeout(updateTooltipPosition, 0);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div
      ref={containerRef}
      className='relative inline-block'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {showTooltip && (
        <div
          ref={tooltipRef}
          className='absolute px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl z-50 max-w-xs whitespace-nowrap pointer-events-none'
          style={tooltipStyle}
        >
          {tooltip}
          <div
            className='absolute w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900'
            style={{
              top: tooltipStyle.top === '100%' ? 'auto' : '100%',
              bottom: tooltipStyle.bottom === '100%' ? 'auto' : '100%',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          ></div>
        </div>
      )}
    </div>
  );
};

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
        <MetricTooltip tooltip='Comprehensive analysis of your bundle size, composition, and performance metrics. Use these insights to identify optimization opportunities and understand your bundle structure.'>
          <h3 className='text-lg font-semibold text-white mb-2 cursor-help'>
            Bundle Statistics
          </h3>
        </MetricTooltip>
        <p className='text-gray-400 text-sm'>
          Detailed breakdown of your bundle composition and performance metrics.
        </p>
      </div>

      {/* Overall metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <MetricTooltip tooltip='The total uncompressed size of all your JavaScript, CSS, and other assets combined. This is what users download before any compression.'>
          <div className='card text-center'>
            <div className='text-3xl font-bold text-accent mb-2'>
              {formatSize(bundleData.totalSize)}
            </div>
            <div className='text-gray-400 text-sm'>Total Bundle Size</div>
          </div>
        </MetricTooltip>

        <MetricTooltip tooltip='The compressed size when using gzip compression. This is closer to what users actually download over the network, typically 20-70% smaller than uncompressed.'>
          <div className='card text-center'>
            <div className='text-3xl font-bold text-green-400 mb-2'>
              {formatSize(bundleData.totalGzipSize)}
            </div>
            <div className='text-gray-400 text-sm'>Gzipped Size</div>
          </div>
        </MetricTooltip>

        <MetricTooltip tooltip='The total number of individual files or modules that make up your bundle. More modules can mean better code splitting but also more HTTP requests.'>
          <div className='card text-center'>
            <div className='text-3xl font-bold text-blue-400 mb-2'>
              {bundleData.modules.length}
            </div>
            <div className='text-gray-400 text-sm'>Total Modules</div>
          </div>
        </MetricTooltip>

        <MetricTooltip tooltip='Separate JavaScript bundles that can be loaded independently. Entry chunks contain the main application code, while other chunks can be loaded on-demand.'>
          <div className='card text-center'>
            <div className='text-3xl font-bold text-purple-400 mb-2'>
              {bundleData.chunks.length}
            </div>
            <div className='text-gray-400 text-sm'>Chunks</div>
          </div>
        </MetricTooltip>
      </div>

      {/* File type breakdown */}
      <div className='card'>
        <MetricTooltip tooltip='Shows how your bundle size is distributed across different file types. JavaScript files typically make up the largest portion, followed by CSS and other assets.'>
          <h4 className='text-lg font-semibold text-white mb-4 cursor-help'>
            File Type Breakdown
          </h4>
        </MetricTooltip>
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
          <MetricTooltip tooltip='Estimated time to download and parse your bundle on different network speeds. 3G is ~1.5 Mbps, 4G is ~15+ Mbps. These are rough estimates for planning purposes.'>
            <div>
              <div className='text-gray-400 text-sm mb-1'>
                Estimated Load Time
              </div>
              <div className='text-white font-medium'>
                {estimateLoadTime(bundleData.totalSize)}
              </div>
            </div>
          </MetricTooltip>

          <MetricTooltip tooltip='How much smaller your bundle becomes with gzip compression. Higher percentages mean better compression. Most text-based assets (JS, CSS, HTML) compress very well.'>
            <div>
              <div className='text-gray-400 text-sm mb-1'>
                Compression Ratio
              </div>
              <div className='text-white font-medium'>
                {(
                  ((bundleData.totalSize - bundleData.totalGzipSize) /
                    bundleData.totalSize) *
                  100
                ).toFixed(1)}
                %
              </div>
            </div>
          </MetricTooltip>

          <MetricTooltip tooltip='The average size of individual modules in your bundle. Smaller modules can improve caching efficiency and enable better code splitting strategies.'>
            <div>
              <div className='text-gray-400 text-sm mb-1'>
                Average Module Size
              </div>
              <div className='text-white font-medium'>
                {formatSize(bundleData.totalSize / bundleData.modules.length)}
              </div>
            </div>
          </MetricTooltip>

          <MetricTooltip tooltip='The single largest module in your bundle. Large modules can slow down initial page load and may be candidates for code splitting or lazy loading.'>
            <div>
              <div className='text-gray-400 text-sm mb-1'>Largest Module</div>
              <div className='text-white font-medium'>
                {bundleData.modules.length > 0
                  ? formatSize(
                      Math.max(...bundleData.modules.map((m) => m.size))
                    )
                  : 'N/A'}
              </div>
            </div>
          </MetricTooltip>
        </div>
      </div>

      {/* Largest modules */}
      <div className='card'>
        <MetricTooltip tooltip='The biggest modules in your bundle, ordered by size. These are prime candidates for optimization - consider code splitting, lazy loading, or finding smaller alternatives.'>
          <h4 className='text-lg font-semibold text-white mb-4 cursor-help'>
            Top 10 Largest Modules
          </h4>
        </MetricTooltip>
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
          <MetricTooltip tooltip='Chunks are separate JavaScript bundles that can be loaded independently. Entry chunks load first, while other chunks can be loaded on-demand to improve initial page load performance.'>
            <h4 className='text-lg font-semibold text-white mb-4 cursor-help'>
              Chunk Breakdown
            </h4>
          </MetricTooltip>
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
