import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { clsx } from 'clsx';
import { TimeBlock, Theme } from '../types';
import { TOTAL_SLOTS, getSlotTime, getSlotIndexFromTime, START_HOUR, END_HOUR } from '../utils/time';

interface TimeGridProps {
  blocks: TimeBlock[];
  themes: Theme[];
  onRangeSelected: (startIndex: number, endIndex: number) => void;
  onBlockClick: (block: TimeBlock) => void;
}

export const TimeGrid: React.FC<TimeGridProps> = ({ 
  blocks, 
  themes,
  onRangeSelected,
  onBlockClick
}) => {
  const SLOT_HEIGHT_PX = 32;
  const SLOTS_PER_HOUR = 12;
  const [isDragging, setIsDragging] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const slotToBlockMap = useMemo(() => {
    const map = new Map<number, TimeBlock>();
    blocks.forEach(block => {
      const startIndex = getSlotIndexFromTime(block.startTime);
      const endIndex = getSlotIndexFromTime(block.endTime) - 1;
      for (let i = startIndex; i <= endIndex; i++) {
        map.set(i, block);
      }
    });
    return map;
  }, [blocks]);

  const handleMouseDown = useCallback((index: number) => {
    if (slotToBlockMap.has(index)) {
      onBlockClick(slotToBlockMap.get(index)!);
      return;
    }
    setIsDragging(true);
    setSelectionStart(index);
    setSelectionEnd(index);
  }, [onBlockClick, slotToBlockMap]);

  const handleMouseEnter = useCallback((index: number) => {
    if (isDragging && selectionStart !== null) {
      setSelectionEnd(index);
    }
  }, [isDragging, selectionStart]);

  const handleMouseUp = useCallback(() => {
    if (isDragging && selectionStart !== null && selectionEnd !== null) {
      const start = Math.min(selectionStart, selectionEnd);
      const end = Math.max(selectionStart, selectionEnd);
      
      let hasOverlap = false;
      for (let i = start; i <= end; i++) {
        if (slotToBlockMap.has(i)) {
          hasOverlap = true;
          break;
        }
      }

      if (!hasOverlap) {
        onRangeSelected(start, end);
      }
    }
    setIsDragging(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  }, [isDragging, onRangeSelected, selectionEnd, selectionStart, slotToBlockMap]);

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  const themeColors = useMemo(() => {
    return themes.reduce((acc, theme) => {
      acc[theme.id] = theme.color;
      return acc;
    }, {} as Record<string, string>);
  }, [themes]);

  const renderSlots = () => {
    const slots: React.ReactElement[] = [];

    for (let i = 0; i < TOTAL_SLOTS; i++) {
      const isSelected = isDragging && 
        selectionStart !== null && 
        selectionEnd !== null &&
        i >= Math.min(selectionStart, selectionEnd) && 
        i <= Math.max(selectionStart, selectionEnd);
      
      const block = slotToBlockMap.get(i);
      
      // Calculate visual boundaries for rounded corners
      const isBlockStart = block && getSlotIndexFromTime(block.startTime) === i;
      const isBlockEnd = block && (getSlotIndexFromTime(block.endTime) - 1) === i;
      const isRowStart = i % 12 === 0;
      const isRowEnd = i % 12 === 11;

      // Apply rounded corners at start/end of block OR start/end of row (for visual continuity)
      const roundLeft = block && (isBlockStart || isRowStart);
      const roundRight = block && (isBlockEnd || isRowEnd);

      slots.push(
        <div
          key={i}
          className={clsx(
            "h-8 transition-all relative group select-none cursor-pointer",
            // Base grid lines - subtle horizontal lines
            "border-b border-gray-50",
            
            // Vertical markers - only at 30min and start
            i % 12 === 0 && "border-l-2 border-l-gray-100", // Start of hour
            i % 12 === 6 && "border-l border-l-dashed border-l-gray-100", // 30 min mark
            
            // Selection state
            isSelected ? "bg-indigo-100/60" : "bg-transparent",
            
            // Hover effect on empty slots
            !block && !isSelected && "hover:bg-gray-50/80",

            // Block styling
            block && "z-10", // Bring blocks forward
            block && roundLeft && "rounded-l-md ml-[1px]", // Add slight margin for separation
            block && roundRight && "rounded-r-md mr-[1px]",
            block && !roundLeft && "border-l-0", // Visually connect
            block && !roundRight && "border-r-0",
            
            // Shadow for blocks to make them pop
            block && "shadow-sm"
          )}
          style={block ? { backgroundColor: themeColors[block.themeId] } : {}}
          onMouseDown={() => handleMouseDown(i)}
          onMouseEnter={() => handleMouseEnter(i)}
          title={getSlotTime(i) + (block ? ` - ${block.notes}` : '')}
        >
            {block && isBlockStart && (
                <span className="absolute left-2 top-1.5 text-xs text-white font-bold truncate max-w-full pointer-events-none drop-shadow-md tracking-wide">
                    {block.notes || themes.find(t => t.id === block.themeId)?.name}
                </span>
            )}
            
            {/* Add a subtle hour label inside the grid for better context? No, too cluttered. */}
        </div>
      );
    }
    return slots;
  };

  const gridHeightPx = (TOTAL_SLOTS / SLOTS_PER_HOUR) * SLOT_HEIGHT_PX;

  return (
    <div className="w-full select-none" ref={gridRef}>
      <div className="grid grid-cols-[60px_1fr] gap-4">
        {/* Time Labels */}
        <div className="relative pr-4 text-right text-xs font-medium text-gray-400" style={{ height: `${gridHeightPx}px` }}>
          {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
            <span
              key={i}
              className="absolute right-0 -translate-y-1/2 flex items-center justify-end"
              style={{ top: `${i * SLOT_HEIGHT_PX}px` }}
            >
              {START_HOUR + i}:00
            </span>
          ))}
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-12 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {renderSlots()}
        </div>
      </div>
    </div>
  );
};
