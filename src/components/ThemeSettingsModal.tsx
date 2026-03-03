import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Theme } from '../types';
import { Trash2, Plus, X } from 'lucide-react';
import { clsx } from 'clsx';

interface ThemeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  themes: Theme[];
  onAddTheme: (theme: Theme) => Promise<void>;
  onUpdateTheme: (theme: Theme) => Promise<void>;
  onDeleteTheme: (id: string) => Promise<void>;
}

export const ThemeSettingsModal: React.FC<ThemeSettingsModalProps> = ({
  isOpen,
  onClose,
  themes,
  onAddTheme,
  onUpdateTheme,
  onDeleteTheme,
}) => {
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [color, setColor] = useState('#000000');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setColor('#000000');
    setDescription('');
    setError(null);
    setEditingTheme(null);
    setIsAdding(false);
  };

  const handleEditClick = (theme: Theme) => {
    setEditingTheme(theme);
    setName(theme.name);
    setColor(theme.color);
    setDescription(theme.description || '');
    setIsAdding(false);
    setError(null);
  };

  const handleAddClick = () => {
    setEditingTheme(null);
    setIsAdding(true);
    setName('');
    setColor('#3B82F6'); // Default blue
    setDescription('');
    setError(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!color.trim()) {
      setError('Color is required');
      return;
    }

    try {
      const themeData: Theme = {
        id: editingTheme ? editingTheme.id : crypto.randomUUID(),
        name,
        color,
        description: description || undefined,
      };

      if (editingTheme) {
        await onUpdateTheme(themeData);
      } else {
        await onAddTheme(themeData);
      }
      resetForm();
    } catch {
      setError('Failed to save theme');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this theme?')) {
      try {
        await onDeleteTheme(id);
        if (editingTheme?.id === id) {
          resetForm();
        }
      } catch {
        setError('Failed to delete theme');
      }
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-20" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Theme Settings
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex gap-6 h-[400px]">
                  {/* Sidebar: List of Themes */}
                  <div className="w-1/3 border-r pr-4 overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-medium text-gray-500">Themes</h4>
                      <button 
                        onClick={handleAddClick}
                        className="p-1 rounded hover:bg-gray-100 text-blue-600"
                        title="Add Theme"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {themes.map(theme => (
                        <div 
                          key={theme.id}
                          className={clsx(
                            "flex items-center p-2 rounded cursor-pointer group",
                            (editingTheme?.id === theme.id) ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50 border border-transparent"
                          )}
                          onClick={() => handleEditClick(theme)}
                        >
                          <div 
                            className="w-4 h-4 rounded-full mr-3 shrink-0" 
                            style={{ backgroundColor: theme.color }}
                          />
                          <span className="text-sm text-gray-700 truncate flex-1">{theme.name}</span>
                          <button
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(theme.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Main: Edit/Add Form */}
                  <div className="w-2/3 pl-2">
                    {(editingTheme || isAdding) ? (
                      <div className="space-y-4">
                        <h4 className="text-md font-medium text-gray-800 border-b pb-2">
                          {isAdding ? 'New Theme' : 'Edit Theme'}
                        </h4>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                            placeholder="e.g. Work"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="color"
                              value={color}
                              onChange={(e) => setColor(e.target.value)}
                              className="h-10 w-20 p-1 rounded border cursor-pointer"
                            />
                            <span className="text-sm text-gray-500">{color}</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                            placeholder="Brief description..."
                          />
                        </div>

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        <div className="flex justify-end space-x-3 pt-4">
                          <button
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                          >
                            Save Theme
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <div className="bg-gray-100 p-4 rounded-full mb-3">
                          <Plus className="w-8 h-8 text-gray-300" />
                        </div>
                        <p>Select a theme to edit or create a new one</p>
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
