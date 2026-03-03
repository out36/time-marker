import React, { useMemo } from 'react';
import { TimeBlock, Theme } from '../types';
import { getSlotIndexFromTime, INTERVAL_MINUTES } from '../utils/time';

interface ReportViewProps {
  date: string;
  blocks: TimeBlock[];
  themes: Theme[];
}

export const ReportView: React.FC<ReportViewProps> = ({ date, blocks, themes }) => {
  const stats = useMemo(() => {
    const themeStats: Record<string, number> = {};
    let totalMinutes = 0;

    blocks.forEach(block => {
      const start = getSlotIndexFromTime(block.startTime);
      const end = getSlotIndexFromTime(block.endTime);

      const duration = (end - start) * INTERVAL_MINUTES;
      themeStats[block.themeId] = (themeStats[block.themeId] || 0) + duration;
      totalMinutes += duration;
    });

    return { themeStats, totalMinutes };
  }, [blocks]);

  const sortedThemes = useMemo(() => {
    return Object.entries(stats.themeStats)
      .sort(([, a], [, b]) => b - a)
      .map(([themeId, minutes]) => {
        const theme = themes.find(t => t.id === themeId);
        return {
          theme,
          minutes,
          percentage: stats.totalMinutes > 0 ? (minutes / stats.totalMinutes) * 100 : 0
        };
      });
  }, [stats, themes]);

  const sortedBlocks = useMemo(() => {
    return [...blocks].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [blocks]);

  return (
    <div className="bg-white p-8 max-w-[210mm] mx-auto min-h-[297mm] shadow-lg print:shadow-none print:w-full print:max-w-none">
      <div className="mb-8 text-center border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Daily Time Report</h2>
        <p className="text-gray-500 mt-1">{date}</p>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Summary</h3>
          <div className="space-y-3">
            {sortedThemes.map(({ theme, minutes, percentage }) => (
              <div key={theme?.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3" 
                    style={{ backgroundColor: theme?.color || '#ccc' }} 
                  />
                  <span className="text-gray-700 font-medium">{theme?.name || 'Unknown'}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-900 font-bold block">{minutes} min</span>
                  <span className="text-gray-500 text-xs">{percentage.toFixed(1)}%</span>
                </div>
              </div>
            ))}
            <div className="pt-3 border-t flex justify-between font-bold text-gray-800 mt-2">
                <span>Total Tracked</span>
                <span>{stats.totalMinutes} min</span>
            </div>
          </div>
        </div>

        {/* Placeholder for a Chart if we had chart.js, for now simple bar visualization */}
        <div className="flex flex-col justify-center">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Distribution</h3>
            <div className="w-full h-4 rounded-full overflow-hidden flex bg-gray-100">
                {sortedThemes.map(({ theme, percentage }) => (
                    <div 
                        key={theme?.id}
                        style={{ width: `${percentage}%`, backgroundColor: theme?.color }}
                        title={`${theme?.name}: ${percentage.toFixed(1)}%`}
                    />
                ))}
            </div>
            <div className="mt-6 space-y-2">
                {sortedThemes.map(({ theme, percentage }) => (
                     <div key={theme?.id} className="w-full">
                        <div className="flex justify-between text-xs mb-1">
                            <span>{theme?.name}</span>
                            <span>{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div 
                                className="h-1.5 rounded-full" 
                                style={{ width: `${percentage}%`, backgroundColor: theme?.color }}
                            />
                        </div>
                     </div>
                ))}
            </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Timeline</h3>
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Activity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedBlocks.map((block) => {
                const theme = themes.find(t => t.id === block.themeId);
                return (
                  <tr key={block.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      {block.startTime} - {block.endTime}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span 
                        className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        style={{ backgroundColor: `${theme?.color}20`, color: theme?.color }}
                      >
                        {theme?.name}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {block.notes}
                    </td>
                  </tr>
                );
              })}
              {sortedBlocks.length === 0 && (
                  <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-400 text-sm">
                          No activities recorded for this day.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-12 text-center text-xs text-gray-400 print:fixed print:bottom-4 print:left-0 print:w-full">
          Generated by Time Marker on {new Date().toLocaleString()}
      </div>
    </div>
  );
};
