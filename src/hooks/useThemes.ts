import { useState, useEffect, useCallback } from 'react';
import { Theme, DEFAULT_THEMES } from '../types';
import { storageService } from '../services/storage';

export const useThemes = () => {
  const [themes, setThemes] = useState<Theme[]>(DEFAULT_THEMES);
  const [loading, setLoading] = useState(true);

  const loadThemes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await storageService.getThemes();
      // Ensure we always have some themes, fallback to default if empty array returned (should be handled by service but double check)
      if (data && data.length > 0) {
        setThemes(data);
      } else {
        setThemes(DEFAULT_THEMES);
      }
    } catch (error) {
      console.error('Failed to load themes:', error);
      setThemes(DEFAULT_THEMES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadThemes();
  }, [loadThemes]);

  const addTheme = async (theme: Theme) => {
    try {
      await storageService.saveTheme(theme);
      await loadThemes();
    } catch (error) {
      console.error('Failed to save theme:', error);
      throw error;
    }
  };

  const updateTheme = async (theme: Theme) => {
    // Same as add for now as saveTheme handles insert or replace
    await addTheme(theme);
  };

  const removeTheme = async (id: string) => {
    try {
      await storageService.deleteTheme(id);
      await loadThemes();
    } catch (error) {
      console.error('Failed to delete theme:', error);
      throw error;
    }
  };

  return {
    themes,
    loading,
    addTheme,
    updateTheme,
    removeTheme,
    refresh: loadThemes
  };
};
