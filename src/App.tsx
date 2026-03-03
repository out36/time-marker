import { useState } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, FileText, Printer, Settings } from 'lucide-react';
import { TimeGrid } from './components/TimeGrid';
import { ThemeModal } from './components/ThemeModal';
import { ReportView } from './components/ReportView';
import { ThemeSettingsModal } from './components/ThemeSettingsModal';
import { useTimeBlocks } from './hooks/useTimeBlocks';
import { useThemes } from './hooks/useThemes';
import { getSlotTime, getSlotIndexFromTime } from './utils/time';
import { TimeBlock } from './types';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const dateStr = format(currentDate, 'yyyy-MM-dd');
  
  const { blocks, addBlock } = useTimeBlocks(dateStr);
  const { themes, addTheme, updateTheme, removeTheme } = useThemes();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [modalRange, setModalRange] = useState<{ start: number; end: number } | null>(null);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const [showReport, setShowReport] = useState(false);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalRange(null);
    setEditingBlock(null);
  };

  const handleRangeSelected = (start: number, end: number) => {
    setModalRange({ start, end });
    setEditingBlock(null);
    setIsModalOpen(true);
  };

  const handleBlockClick = (block: TimeBlock) => {
    const start = getSlotIndexFromTime(block.startTime);
    const end = getSlotIndexFromTime(block.endTime) - 1;
    setModalRange({ start, end });
    setEditingBlock(block);
    setIsModalOpen(true);
  };

  const handleSaveTheme = async (themeId: string, notes: string) => {
    if (!modalRange) {
      throw new Error('No selected range to save.');
    }

    const newBlock: TimeBlock = {
      id: editingBlock?.id || crypto.randomUUID(),
      startTime: getSlotTime(modalRange.start),
      endTime: getSlotTime(modalRange.end + 1),
      themeId,
      notes,
      date: dateStr
    };
    await addBlock(newBlock);
  };

  const handlePrevDay = () => setCurrentDate(d => subDays(d, 1));
  const handleNextDay = () => setCurrentDate(d => addDays(d, 1));
  
  const handlePrint = () => {
    if (!showReport) {
        setShowReport(true);
        // Wait for render then print
        setTimeout(() => window.print(), 100);
    } else {
        window.print();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - Hide when printing */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm print:hidden">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="bg-blue-600 text-white p-1 rounded mr-2">TM</span>
            Time Marker
          </h1>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button onClick={handlePrevDay} className="p-1 hover:bg-white rounded shadow-sm transition-all">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="mx-4 font-medium text-gray-700 min-w-[140px] text-center">
              {format(currentDate, 'MMMM d, yyyy')}
            </span>
            <button onClick={handleNextDay} className="p-1 hover:bg-white rounded shadow-sm transition-all">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </button>
          <button 
            onClick={() => setShowReport(!showReport)}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md border shadow-sm transition-colors ${
                showReport 
                ? 'bg-gray-100 text-gray-900 border-gray-300' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-4 h-4 mr-2" />
            {showReport ? 'View Grid' : 'View Report'}
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto print:p-0 print:overflow-visible">
        {showReport ? (
            <div className="print:block">
                <ReportView date={format(currentDate, 'MMMM d, yyyy')} blocks={blocks} themes={themes} />
            </div>
        ) : (
            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8 min-h-[600px] print:hidden transition-all hover:shadow-2xl duration-500">
            <TimeGrid 
                blocks={blocks}
                themes={themes}
                onRangeSelected={handleRangeSelected}
                onBlockClick={handleBlockClick}
            />
            </div>
        )}
      </main>

      {/* Modal */}
      {modalRange && (
        <ThemeModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveTheme}
          startTime={getSlotTime(modalRange.start)}
          endTime={getSlotTime(modalRange.end + 1)}
          initialThemeId={editingBlock?.themeId}
          initialNotes={editingBlock?.notes}
          themes={themes}
        />
      )}

      {/* Settings Modal */}
      <ThemeSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        themes={themes}
        onAddTheme={addTheme}
        onUpdateTheme={updateTheme}
        onDeleteTheme={removeTheme}
      />
    </div>
  );
}

export default App;
