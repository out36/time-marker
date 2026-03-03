import { TimeBlock, Theme, DEFAULT_THEMES } from '../types';
import { invoke } from '@tauri-apps/api/core';

const STORAGE_KEYS = {
  TIME_BLOCKS: 'time_marker_blocks',
  THEMES: 'time_marker_themes',
};

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export const storageService = {
  async getTimeBlocks(date: string): Promise<TimeBlock[]> {
    if (isTauri) {
      try {
        return await invoke('get_time_blocks', { date });
      } catch (error) {
        console.error('Tauri invoke error:', error);
        // Fallback to local storage if command fails (e.g. dev mode without tauri)
      }
    }
    
    const allBlocks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TIME_BLOCKS) || '{}');
    return allBlocks[date] || [];
  },

  async saveTimeBlock(block: TimeBlock): Promise<void> {
    if (isTauri) {
      try {
        await invoke('save_time_block', { block });
        return;
      } catch (error) {
        console.error('Tauri invoke error:', error);
      }
    }

    const allBlocks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TIME_BLOCKS) || '{}');
    const dateBlocks = allBlocks[block.date] || [];
    
    // Remove existing block with same ID if exists
    const filtered = dateBlocks.filter((b: TimeBlock) => b.id !== block.id);
    
    // Add new block
    filtered.push(block);
    
    allBlocks[block.date] = filtered;
    localStorage.setItem(STORAGE_KEYS.TIME_BLOCKS, JSON.stringify(allBlocks));
  },

  async deleteTimeBlock(id: string, date: string): Promise<void> {
    if (isTauri) {
      try {
        await invoke('delete_time_block', { id });
        return;
      } catch (error) {
        console.error('Tauri invoke error:', error);
      }
    }

    const allBlocks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TIME_BLOCKS) || '{}');
    const dateBlocks = allBlocks[date] || [];
    const filtered = dateBlocks.filter((b: TimeBlock) => b.id !== id);
    
    allBlocks[date] = filtered;
    localStorage.setItem(STORAGE_KEYS.TIME_BLOCKS, JSON.stringify(allBlocks));
  },

  async getThemes(): Promise<Theme[]> {
    if (isTauri) {
      try {
        return await invoke('get_themes');
      } catch (error) {
        console.error('Tauri invoke error:', error);
      }
    }

    const themes = localStorage.getItem(STORAGE_KEYS.THEMES);
    return themes ? JSON.parse(themes) : DEFAULT_THEMES;
  },

  async saveTheme(theme: Theme): Promise<void> {
    if (isTauri) {
      try {
        await invoke('save_theme', { theme });
        return;
      } catch (error) {
        console.error('Tauri invoke error:', error);
      }
    }

    const themes = await this.getThemes();
    const index = themes.findIndex(t => t.id === theme.id);
    
    if (index >= 0) {
      themes[index] = theme;
    } else {
      themes.push(theme);
    }
    
    localStorage.setItem(STORAGE_KEYS.THEMES, JSON.stringify(themes));
  },

  async deleteTheme(id: string): Promise<void> {
    if (isTauri) {
      try {
        await invoke('delete_theme', { id });
        return;
      } catch (error) {
        console.error('Tauri invoke error:', error);
      }
    }

    const themes = await this.getThemes();
    const filtered = themes.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.THEMES, JSON.stringify(filtered));
  }
};
