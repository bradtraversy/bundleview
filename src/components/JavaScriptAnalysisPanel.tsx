import React from 'react';
import { JavaScriptAnalysis } from '../types';

interface JavaScriptAnalysisPanelProps {
  analysis: JavaScriptAnalysis;
}

const JavaScriptAnalysisPanel: React.FC<JavaScriptAnalysisPanelProps> = ({
  analysis,
}) => {
  const getFileTypeColor = (fileType: string): string => {
    switch (fileType) {
      case 'vanilla':
        return 'text-green-400';
      case 'bundle':
        return 'text-blue-400';
      case 'module':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  const getFileTypeIcon = (fileType: string): string => {
    switch (fileType) {
      case 'vanilla':
        return '📝';
      case 'bundle':
        return '📦';
      case 'module':
        return '📚';
      default:
        return '❓';
    }
  };

  const getComplexityColor = (complexity: number): string => {
    if (complexity <= 3) return 'text-green-400';
    if (complexity <= 7) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getComplexityLabel = (complexity: number): string => {
    if (complexity <= 3) return 'Low';
    if (complexity <= 7) return 'Medium';
    return 'High';
  };

  return (
    <div className='space-y-6'>
      {/* File Type Detection */}
      <div className='bg-gray-800 rounded-lg p-6'>
        <h3 className='text-xl font-semibold text-white mb-4'>
          File Type Analysis
        </h3>
        <div className='flex items-center space-x-4'>
          <div className='text-4xl'>{getFileTypeIcon(analysis.fileType)}</div>
          <div>
            <div
              className={`text-2xl font-bold ${getFileTypeColor(
                analysis.fileType
              )}`}
            >
              {analysis.fileType.charAt(0).toUpperCase() +
                analysis.fileType.slice(1)}{' '}
              JavaScript
            </div>
            <div className='text-gray-400 text-sm'>
              Confidence: {analysis.confidence}%
            </div>
          </div>
        </div>
      </div>

      {/* Code Metrics */}
      <div className='bg-gray-800 rounded-lg p-6'>
        <h3 className='text-xl font-semibold text-white mb-4'>Code Metrics</h3>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-blue-400'>
              {analysis.codeMetrics.totalLines}
            </div>
            <div className='text-gray-400 text-sm'>Total Lines</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-green-400'>
              {analysis.codeMetrics.codeLines}
            </div>
            <div className='text-gray-400 text-sm'>Code Lines</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-yellow-400'>
              {analysis.codeMetrics.functionCount}
            </div>
            <div className='text-gray-400 text-sm'>Functions</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-purple-400'>
              {analysis.codeMetrics.classCount}
            </div>
            <div className='text-gray-400 text-sm'>Classes</div>
          </div>
        </div>

        <div className='mt-4 grid grid-cols-2 md:grid-cols-3 gap-4'>
          <div className='text-center'>
            <div className='text-lg font-semibold text-cyan-400'>
              {analysis.codeMetrics.importCount}
            </div>
            <div className='text-gray-400 text-sm'>Imports</div>
          </div>
          <div className='text-center'>
            <div className='text-lg font-semibold text-orange-400'>
              {analysis.codeMetrics.exportCount}
            </div>
            <div className='text-gray-400 text-sm'>Exports</div>
          </div>
          <div className='text-center'>
            <div
              className={`text-lg font-semibold ${getComplexityColor(
                analysis.codeMetrics.cyclomaticComplexity
              )}`}
            >
              {analysis.codeMetrics.cyclomaticComplexity}
            </div>
            <div className='text-gray-400 text-sm'>Complexity</div>
            <div className='text-xs text-gray-500'>
              {getComplexityLabel(analysis.codeMetrics.cyclomaticComplexity)}
            </div>
          </div>
        </div>
      </div>

      {/* Functions Analysis */}
      {analysis.functions.length > 0 && (
        <div className='bg-gray-800 rounded-lg p-6'>
          <h3 className='text-xl font-semibold text-white mb-4'>
            Functions Analysis ({analysis.functions.length})
          </h3>
          <div className='space-y-3'>
            {analysis.functions.map((func, index) => (
              <div key={index} className='bg-gray-700 rounded p-3'>
                <div className='flex justify-between items-start'>
                  <div>
                    <div className='text-white font-medium'>{func.name}()</div>
                    <div className='text-gray-400 text-sm'>
                      Type: {func.type} • Lines: {func.lineStart}-{func.lineEnd}{' '}
                      • Size: {func.size} chars
                    </div>
                    {func.parameters.length > 0 && (
                      <div className='text-gray-500 text-xs mt-1'>
                        Parameters: {func.parameters.join(', ')}
                      </div>
                    )}
                  </div>
                  <div className='text-right'>
                    <div
                      className={`text-sm font-medium ${getComplexityColor(
                        func.complexity
                      )}`}
                    >
                      Complexity: {func.complexity}
                    </div>
                    <div className='text-xs text-gray-500'>
                      {getComplexityLabel(func.complexity)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Classes Analysis */}
      {analysis.classes.length > 0 && (
        <div className='bg-gray-800 rounded-lg p-6'>
          <h3 className='text-xl font-semibold text-white mb-4'>
            Classes Analysis ({analysis.classes.length})
          </h3>
          <div className='space-y-3'>
            {analysis.classes.map((cls, index) => (
              <div key={index} className='bg-gray-700 rounded p-3'>
                <div className='text-white font-medium mb-2'>
                  {cls.name}
                  {cls.extends && (
                    <span className='text-gray-400 text-sm ml-2'>
                      extends {cls.extends}
                    </span>
                  )}
                  {cls.implements && cls.implements.length > 0 && (
                    <span className='text-gray-400 text-sm ml-2'>
                      implements {cls.implements.join(', ')}
                    </span>
                  )}
                </div>
                <div className='text-gray-400 text-sm mb-2'>
                  Lines: {cls.lineStart}-{cls.lineEnd} • Size: {cls.size} chars
                </div>
                <div className='grid grid-cols-2 gap-4 text-xs'>
                  <div>
                    <div className='text-gray-500'>
                      Methods ({cls.methods.length})
                    </div>
                    <div className='text-gray-300'>
                      {cls.methods.length > 0 ? cls.methods.join(', ') : 'None'}
                    </div>
                  </div>
                  <div>
                    <div className='text-gray-500'>
                      Properties ({cls.properties.length})
                    </div>
                    <div className='text-gray-300'>
                      {cls.properties.length > 0
                        ? cls.properties.join(', ')
                        : 'None'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Imports Analysis */}
      {analysis.imports.length > 0 && (
        <div className='bg-gray-800 rounded-lg p-6'>
          <h3 className='text-xl font-semibold text-white mb-4'>
            Imports Analysis ({analysis.imports.length})
          </h3>
          <div className='space-y-2'>
            {analysis.imports.map((imp, index) => (
              <div
                key={index}
                className='flex justify-between items-center bg-gray-700 rounded px-3 py-2'
              >
                <div>
                  <div className='text-white text-sm'>
                    {imp.items.join(', ')} from '{imp.source}'
                  </div>
                  <div className='text-gray-400 text-xs'>
                    Type: {imp.type} • Line: {imp.line}
                  </div>
                </div>
                <div className='text-gray-500 text-xs'>
                  {imp.type.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exports Analysis */}
      {analysis.exports.length > 0 && (
        <div className='bg-gray-800 rounded-lg p-6'>
          <h3 className='text-xl font-semibold text-white mb-4'>
            Exports Analysis ({analysis.exports.length})
          </h3>
          <div className='space-y-2'>
            {analysis.exports.map((exp, index) => (
              <div
                key={index}
                className='flex justify-between items-center bg-gray-700 rounded px-3 py-2'
              >
                <div>
                  <div className='text-white text-sm'>
                    {exp.type === 'all'
                      ? `export * from '${exp.items[0]}'`
                      : `${exp.type} export: ${exp.items.join(', ')}`}
                  </div>
                  <div className='text-gray-400 text-xs'>Line: {exp.line}</div>
                </div>
                <div className='text-gray-500 text-xs'>
                  {exp.type.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Libraries Detection */}
      {analysis.libraries.length > 0 && (
        <div className='bg-gray-800 rounded-lg p-6'>
          <h3 className='text-xl font-semibold text-white mb-4'>
            Libraries Detected ({analysis.libraries.length})
          </h3>
          <div className='space-y-2'>
            {analysis.libraries.map((lib, index) => (
              <div
                key={index}
                className='flex justify-between items-center bg-gray-700 rounded px-3 py-2'
              >
                <div>
                  <div className='text-white font-medium'>{lib.name}</div>
                  <div className='text-gray-400 text-xs'>
                    Usage: {lib.usageCount} times • Confidence:{' '}
                    {Math.round(lib.confidence * 100)}%
                  </div>
                </div>
                <div className='text-green-400 text-sm font-medium'>
                  ✓ Detected
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optimization Opportunities */}
      {analysis.optimizationOpportunities.length > 0 && (
        <div className='bg-gray-800 rounded-lg p-6'>
          <h3 className='text-xl font-semibold text-white mb-4'>
            Optimization Opportunities
          </h3>
          <div className='space-y-3'>
            {analysis.optimizationOpportunities.map((opportunity, index) => (
              <div
                key={index}
                className='flex items-start space-x-3 p-3 bg-gray-700 rounded'
              >
                <span className='text-yellow-400 text-lg'>💡</span>
                <span className='text-gray-300 text-sm'>{opportunity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JavaScriptAnalysisPanel;
