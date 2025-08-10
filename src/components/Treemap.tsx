import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { TreemapProps, BundleModule, TreemapNode } from '../types';

const Treemap = ({ data, onModuleClick }: TreemapProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Color scale for different file types
  const colorScale = d3
    .scaleOrdinal<string>()
    .domain(['js', 'css', 'json', 'map', 'other'])
    .range(['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']);

  // Process data for D3 hierarchy
  const processData = (modules: BundleModule[]) => {
    if (!modules.length) return null;

    console.log('Processing modules:', modules);

    // Create a simple flat structure that D3 can handle
    const flatData: TreemapNode[] = modules.map((module) => ({
      name: module.name,
      size: module.size,
      module: module,
      children: undefined,
    }));

    console.log('Flat data structure:', flatData);

    // Create hierarchy from flat data
    const hierarchy = d3.hierarchy({
      name: 'root',
      size: 0,
      module: null,
      children: flatData,
    });

    hierarchy.sum((d) => d.size || 0);
    hierarchy.sort((a, b) => (b.value || 0) - (a.value || 0));

    console.log('Final hierarchy:', hierarchy);
    console.log('Root children:', hierarchy.children);

    return hierarchy as any;
  };

  // Create treemap layout
  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    console.log('Treemap useEffect - data:', data);
    console.log('Treemap useEffect - data.length:', data.length);
    console.log('SVG dimensions:', dimensions);
    console.log('SVG ref current:', svgRef.current);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const hierarchy = processData(data);
    console.log('Processed hierarchy:', hierarchy);

    if (!hierarchy) {
      console.log('No hierarchy created, returning early');
      return;
    }

    // Check if hierarchy has proper values
    console.log('Hierarchy value:', hierarchy.value);
    console.log('Hierarchy data:', hierarchy.data);

    const treemap = d3
      .treemap<TreemapNode>()
      .size([dimensions.width, dimensions.height])
      .padding(1)
      .round(true);

    const root = treemap(hierarchy);
    console.log('D3 root:', root);
    console.log('Root leaves:', root.leaves());
    console.log('Root leaves length:', root.leaves().length);

    // Check each leaf's properties
    root.leaves().forEach((leaf, i) => {
      console.log(`Leaf ${i}:`, {
        x0: leaf.x0,
        y0: leaf.y0,
        x1: leaf.x1,
        y1: leaf.y1,
        value: leaf.value,
        data: leaf.data,
        dataKeys: leaf.data ? Object.keys(leaf.data) : 'no data',
        dataModule: leaf.data?.module,
        dataName: leaf.data?.name,
        dataSize: leaf.data?.size,
      });
    });

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

    console.log('Created nodes:', nodes);
    console.log('Nodes size:', nodes.size());

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
      .on('click', (event, d) => {
        console.log('Click event data:', d);
        console.log('Click event d.data:', d.data);
        if (d.data && d.data.module) {
          onModuleClick(d.data.module);
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
        console.log('Text rendering d:', d);
        console.log('Text rendering d.data:', d.data);
        console.log(
          'Text rendering d.data keys:',
          d.data ? Object.keys(d.data) : 'no data'
        );
        console.log('Text rendering d.data.module:', d.data?.module);
        console.log('Text rendering d.data.name:', d.data?.name);

        if (d.data && d.data.module) {
          return truncateText(d.data.module.name, 20);
        }
        if (d.data && d.data.name) {
          return truncateText(d.data.name, 20);
        }
        return 'Unknown';
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
            width: container.clientWidth || 800,
            height: 600,
          });
        }
      }
    };

    // Run immediately and then on resize
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
