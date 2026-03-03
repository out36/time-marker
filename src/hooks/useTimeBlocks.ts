import { useState, useEffect, useCallback, useRef } from 'react';
import { TimeBlock } from '../types';
import { storageService } from '../services/storage';

export const useTimeBlocks = (date: string) => {
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const latestRequestId = useRef(0);

  const loadBlocks = useCallback(async (options?: { throwOnError?: boolean }) => {
    const requestId = ++latestRequestId.current;
    setLoading(true);
    try {
      const data = await storageService.getTimeBlocks(date);
      if (requestId === latestRequestId.current) {
        setBlocks(data);
      }
      return data;
    } catch (error) {
      console.error('Failed to load blocks:', error);
      if (options?.throwOnError) {
        throw error;
      }
      return [];
    } finally {
      if (requestId === latestRequestId.current) {
        setLoading(false);
      }
    }
  }, [date]);

  useEffect(() => {
    void loadBlocks();
  }, [loadBlocks]);

  const addBlock = useCallback(async (block: TimeBlock) => {
    try {
      await storageService.saveTimeBlock(block);
      await loadBlocks({ throwOnError: true });
    } catch (error) {
      console.error('Failed to save block:', error);
      throw error;
    }
  }, [loadBlocks]);

  const removeBlock = useCallback(async (id: string) => {
    try {
      await storageService.deleteTimeBlock(id, date);
      await loadBlocks({ throwOnError: true });
    } catch (error) {
      console.error('Failed to delete block:', error);
      throw error;
    }
  }, [date, loadBlocks]);

  return {
    blocks,
    loading,
    addBlock,
    removeBlock,
    refresh: loadBlocks
  };
};
