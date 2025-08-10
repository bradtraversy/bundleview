import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { TreemapProps, BundleModule } from '../types';

interface TreemapNode {
  name: string;
  size: number;
  module: BundleModule | null;
  children?: TreemapNode[];
}

const Treemap = ({ data, onModuleClick }: TreemapProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 600 });

  // Color scale for different file types
  const colorScale = d3
    .scaleOrdinal<string>()
    .domain(['js', 'css', 'json', 'map', 'other'])
    .range(['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']);

  // Process data for D3 hierarchy
  const processData = (modules: BundleModule[]) => {
    if (modules.length === 0) return null;

    // Group modules by path segments
    const groupedData: any = {};

    modules.forEach((module) => {
      const path = module.path.length > 0 ? module.path : [module.name];
      let current = groupedData;

      path.forEach((segment, index) => {
        if (!current[segment]) {
          current[segment] = {
            name: segment,
            children: {},
            size: 0,
            module: null,
          };
        }

        if (index === path.length - 1) {
          // Leaf node
          current[segment].size = module.size;
          current[segment].module = module;
        } else {
          current = current[segment].children;
        }
      });
    });

    // Convert to D3 hierarchy format
    const convertToHierarchy = (obj: any): TreemapNode => {
      const children = Object.values(obj.children).map(convertToHierarchy);
      return {
        name: obj.name,
        size: obj.size,
        module: obj.module,
        children: children.length > 0 ? children : undefined,
      };
    };

    return d3
      .hierarchy(convertToHierarchy(groupedData))
      .sum((d) => d.size || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));
  };

  // Create treemap layout
  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const hierarchy = processData(data);
    if (!hierarchy) return;

    const treemap = d3
      .treemap<TreemapNode>()
      .size([dimensions.width, dimensions.height])
      .padding(1)
      .round(true);

    const root = treemap(hierarchy);

    // Create tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr(
        'class',
        'absolute bg-dark-card border border-gray-600 rounded-lg p-3 text-white text-sm shadow-xl pointer-events-none z-50'
      )
      .style('opacity', 0);

    // Draw rectangles
    const nodes = svg
      .selectAll('g')
      .data(root.leaves())
      .join('g')
      .attr('transform', (d) => `translate(${d.x0},${d.y0})`);

    nodes
      .append('rect')
      .attr('width', (d) => d.x1 - d.x0)
      .attr('height', (d) => d.y1 - d.y0)
      .attr('fill', (d) => {
        const module = d.data.module;
        return module ? colorScale(module.type) : '#6b7280';
      })
      .attr('stroke', '#1f2937')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        const module = d.data.module;
        if (module) {
          tooltip.transition().duration(200).style('opacity', 0.9);

          tooltip
            .html(
              `
            <div class="font-semibold mb-1">${module.name}</div>
            <div class="text-gray-300">Size: ${formatSize(module.size)}</div>
            <div class="text-gray-300">Type: ${module.type}</div>
            <div class="text-gray-300">Dependencies: ${
              module.dependencies.length
            }</div>
          `
            )
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 10 + 'px');
        }
      })
      .on('mouseout', () => {
        tooltip.transition().duration(500).style('opacity', 0);
      })
      .on('click', (d) => {
        const module = d.data.module;
        if (module) {
          onModuleClick(module);
        }
      });

    // Add labels for larger rectangles
    nodes
      .filter((d) => d.x1 - d.x0 > 80 && d.y1 - d.y0 > 30)
      .append('text')
      .attr('x', 5)
      .attr('y', 20)
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .text((d) => {
        const module = d.data.module;
        return module ? truncateText(module.name, 20) : '';
      });

    // Cleanup tooltip on unmount
    return () => {
      tooltip.remove();
    };
  }, [data, dimensions, onModuleClick]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const container = svgRef.current.parentElement;
        if (container) {
          setDimensions({
            width: container.clientWidth,
            height: 600,
          });
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  if (data.length === 0) {
    return (
      <div className='flex items-center justify-center h-96 text-gray-400'>
        <div className='text-center'>
          <div className='text-6xl mb-4'>📦</div>
          <div className='text-xl font-medium'>No modules to display</div>
          <div className='text-sm'>
            Upload bundle files to see the treemap visualization
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full'>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className='w-full border border-gray-700 rounded-lg'
      />

      {/* Legend */}
      <div className='mt-4 flex flex-wrap gap-4 justify-center'>
        {['js', 'css', 'json', 'map', 'other'].map((type) => (
          <div key={type} className='flex items-center space-x-2'>
            <div
              className='w-4 h-4 rounded'
              style={{ backgroundColor: colorScale(type) || '#6b7280' }}
            />
            <span className='text-gray-400 text-sm capitalize'>{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Treemap;
