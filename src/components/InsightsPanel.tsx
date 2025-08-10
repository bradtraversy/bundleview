import { InsightsPanelProps } from '../types';

const InsightsPanel = ({ insights }: InsightsPanelProps) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '💡';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'dependency':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'code-splitting':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'tree-shaking':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'duplicates':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'performance':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (insights.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='text-6xl mb-4'>🎯</div>
        <h3 className='text-xl font-medium text-white mb-2'>
          No insights available
        </h3>
        <p className='text-gray-400'>
          Upload bundle files to get optimization recommendations
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-white mb-2'>
          Optimization Insights
        </h3>
        <p className='text-gray-400 text-sm'>
          Based on your bundle analysis, here are recommendations to improve
          performance and reduce size.
        </p>
      </div>

      <div className='grid gap-4'>
        {insights.map((insight) => (
          <div
            key={insight.id}
            className='card border-l-4 border-l-accent hover:border-l-accent-hover transition-colors duration-200'
          >
            <div className='flex items-start space-x-4'>
              <div className='text-2xl flex-shrink-0'>
                {getInsightIcon(insight.type)}
              </div>

              <div className='flex-1 min-w-0'>
                <div className='flex items-center justify-between mb-2'>
                  <h4 className='text-lg font-semibold text-white'>
                    {insight.title}
                  </h4>
                  <div className='flex items-center space-x-2'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
                        insight.category
                      )}`}
                    >
                      {insight.category.replace('-', ' ')}
                    </span>
                    <span
                      className={`text-sm font-medium ${getImpactColor(
                        insight.impact
                      )}`}
                    >
                      {insight.impact.toUpperCase()} IMPACT
                    </span>
                  </div>
                </div>

                <p className='text-gray-300 mb-3'>{insight.description}</p>

                <div className='bg-gray-800/50 rounded-lg p-3 mb-3'>
                  <div className='text-sm text-gray-400 mb-1'>
                    Recommendation:
                  </div>
                  <div className='text-white font-medium'>
                    {insight.recommendation}
                  </div>
                </div>

                {insight.estimatedSavings && (
                  <div className='flex items-center space-x-2 text-sm'>
                    <span className='text-gray-400'>Estimated savings:</span>
                    <span className='text-green-400 font-medium'>
                      {formatSize(insight.estimatedSavings)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className='card bg-accent/10 border-accent/30'>
        <div className='flex items-center space-x-3 mb-3'>
          <div className='text-2xl'>📊</div>
          <h4 className='text-lg font-semibold text-white'>Summary</h4>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
          <div>
            <div className='text-gray-400 mb-1'>High Impact Issues</div>
            <div className='text-white font-medium'>
              {insights.filter((i) => i.impact === 'high').length}
            </div>
          </div>

          <div>
            <div className='text-gray-400 mb-1'>Total Recommendations</div>
            <div className='text-white font-medium'>{insights.length}</div>
          </div>

          <div>
            <div className='text-gray-400 mb-1'>Potential Savings</div>
            <div className='text-white font-medium'>
              {formatSize(
                insights
                  .filter((i) => i.estimatedSavings)
                  .reduce((sum, i) => sum + (i.estimatedSavings || 0), 0)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default InsightsPanel;
