import { useState } from 'react';
import { X, BookOpen, Maximize2, Minimize2 } from 'lucide-react';

export default function Dovidnik({ onClose, isFullscreen }) {
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-700 bg-slate-900">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <h2 className="text-base sm:text-xl font-bold text-white">Довідкові матеріали НМТ</h2>
        </div>
        <button
          onClick={onClose}
          className="bg-slate-700 hover:bg-slate-600 p-2 rounded-lg transition-colors"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </button>
      </div>

      {/* Content - Full screen iframe */}
      <div className="flex-1 bg-slate-900 overflow-hidden">
        <iframe
          src="/dovidnik/ZNO_Math_dovidkovy-materialy.pdf"
          className="w-full h-full border-0"
          title="Довідкові матеріали"
        />
      </div>
    </div>
  );
}
