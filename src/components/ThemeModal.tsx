import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Theme } from '../types';
import { clsx } from 'clsx';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (themeId: string, notes: string) => Promise<void>;
  startTime: string;
  endTime: string;
  initialThemeId?: string;
  initialNotes?: string;
  themes: Theme[];
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  startTime,
  endTime,
  initialThemeId,
  initialNotes = '',
  themes
}) => {
  const [selectedThemeId, setSelectedThemeId] = useState<string>('');
  const [notes, setNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Default to first theme if initialThemeId is not found or not provided
      const defaultThemeId = themes.length > 0 ? themes[0].id : '';
      setSelectedThemeId(initialThemeId || defaultThemeId);
      setNotes(initialNotes);
      setIsSaving(false);
      setSaveError(null);
    }
  }, [isOpen, initialThemeId, initialNotes, themes]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await onSave(selectedThemeId, notes);
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save time block.';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={isSaving ? () => undefined : onClose}
      >
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Configure Time Block ({startTime} - {endTime})
                </Dialog.Title>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Theme
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setSelectedThemeId(theme.id)}
                        disabled={isSaving}
                        className={clsx(
                          "flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all",
                          selectedThemeId === theme.id 
                            ? "border-blue-500 bg-blue-50" 
                            : "border-transparent hover:bg-gray-50",
                          isSaving && "opacity-60 cursor-not-allowed"
                        )}
                      >
                        <div 
                          className="w-8 h-8 rounded-full mb-1"
                          style={{ backgroundColor: theme.color }}
                        />
                        <span className="text-xs text-gray-600 truncate w-full text-center">
                          {theme.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    placeholder="What did you do?"
                    value={notes}
                    disabled={isSaving}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {saveError && (
                  <p className="mt-3 text-sm text-red-600">{saveError}</p>
                )}

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                    disabled={isSaving}
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    disabled={isSaving}
                    onClick={handleSave}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
