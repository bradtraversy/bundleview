import { useState, useMemo } from 'react';
import { FileExplorerProps, BundleModule } from '../types';

const FileExplorer = ({ modules, onModuleSelect }: FileExplorerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'type'>('size');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredAndSortedModules = useMemo(() => {
    let filtered = modules.filter((module) => {
      const matchesSearch = module.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType =
        selectedType === 'all' || module.type === selectedType;
      return matchesSearch && matchesType;
    });

    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'size':
          aValue = a.size;
          bValue = b.size;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        default:
          aValue = a.size;
          bValue = b.size;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [modules, searchTerm, sortBy, sortOrder, selectedType]);

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'js':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'css':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'json':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'map':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSizeBarWidth = (size: number) => {
    const maxSize = Math.max(...modules.map((m) => m.size));
    return (size / maxSize) * 100;
  };

  const toggleSort = (field: 'name' | 'size' | 'type') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: 'name' | 'size' | 'type') => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  if (modules.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='text-6xl mb-4'>📁</div>
        <h3 className='text-xl font-medium text-white mb-2'>
          No modules found
        </h3>
        <p className='text-gray-400'>
          Upload bundle files to explore module details
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-white mb-2'>File Explorer</h3>
        <p className='text-gray-400 text-sm'>
          Browse and search through all modules in your bundle. Click on any
          module to view detailed information.
        </p>
      </div>

      {/* Controls */}
      <div className='flex flex-col sm:flex-row gap-4 mb-6'>
        <div className='flex-1'>
          <input
            type='text'
            placeholder='Search modules...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='input-field w-full'
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className='input-field min-w-[120px]'
        >
          <option value='all'>All Types</option>
          <option value='js'>JavaScript</option>
          <option value='css'>CSS</option>
          <option value='json'>JSON</option>
          <option value='map'>Source Map</option>
          <option value='other'>Other</option>
        </select>
      </div>

      {/* Results count */}
      <div className='text-sm text-gray-400 mb-4'>
        Showing {filteredAndSortedModules.length} of {modules.length} modules
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr className='border-b border-gray-700'>
              <th className='text-left py-3 px-4'>
                <button
                  onClick={() => toggleSort('name')}
                  className='flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200'
                >
                  <span>Name</span>
                  <span className='text-xs'>{getSortIcon('name')}</span>
                </button>
              </th>
              <th className='text-left py-3 px-4'>
                <button
                  onClick={() => toggleSort('size')}
                  className='flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200'
                >
                  <span>Size</span>
                  <span className='text-xs'>{getSortIcon('size')}</span>
                </button>
              </th>
              <th className='text-left py-3 px-4'>
                <button
                  onClick={() => toggleSort('type')}
                  className='flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200'
                >
                  <span>Type</span>
                  <span className='text-xs'>{getSortIcon('type')}</span>
                </button>
              </th>
              <th className='text-left py-3 px-4'>Dependencies</th>
              <th className='text-left py-3 px-4'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedModules.map((module) => (
              <tr
                key={module.id}
                className='border-b border-gray-800 hover:bg-gray-800/30 transition-colors duration-200'
              >
                <td className='py-3 px-4'>
                  <div className='max-w-xs'>
                    <div
                      className='text-white font-mono text-sm truncate'
                      title={module.name}
                    >
                      {module.name}
                    </div>
                    {module.path.length > 1 && (
                      <div className='text-gray-500 text-xs truncate'>
                        {module.path.slice(0, -1).join(' / ')}
                      </div>
                    )}
                  </div>
                </td>

                <td className='py-3 px-4'>
                  <div className='space-y-1'>
                    <div className='text-white font-medium'>
                      {formatSize(module.size)}
                    </div>
                    <div className='w-24 bg-gray-700 rounded-full h-2'>
                      <div
                        className='bg-accent h-2 rounded-full transition-all duration-300'
                        style={{ width: `${getSizeBarWidth(module.size)}%` }}
                      />
                    </div>
                  </div>
                </td>

                <td className='py-3 px-4'>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(
                      module.type
                    )}`}
                  >
                    {module.type.toUpperCase()}
                  </span>
                </td>

                <td className='py-3 px-4'>
                  <div className='text-gray-400 text-sm'>
                    {module.dependencies.length} deps
                  </div>
                </td>

                <td className='py-3 px-4'>
                  <button
                    onClick={() => onModuleSelect(module)}
                    className='btn-secondary text-sm py-1 px-3'
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedModules.length === 0 && (
        <div className='text-center py-8 text-gray-400'>
          No modules match your search criteria
        </div>
      )}
    </div>
  );
};

export default FileExplorer;
