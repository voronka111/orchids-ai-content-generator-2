'use client';

import { motion } from 'framer-motion';
import { Download, Trash2, FolderPlus, X } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface SelectionActionBarProps {
    selectedCount: number;
    onClear: () => void;
    onDownload?: () => void;
    onAddToFolder?: () => void;
    onDelete?: () => void;
}

export function SelectionActionBar({
    selectedCount,
    onClear,
    onDownload,
    onAddToFolder,
    onDelete,
}: SelectionActionBarProps) {
    const { language } = useLanguage();

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
        >
            <div className="bg-white text-black rounded-[24px] shadow-2xl px-6 py-4 flex items-center justify-between gap-8 backdrop-blur-xl border border-white/20">
                <div className="flex items-center gap-4 shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-sm">
                        {selectedCount}
                    </div>
                    <span className="text-sm font-bold uppercase tracking-tight whitespace-nowrap">
                        {language === 'ru' ? 'Выбрано' : 'Selected'}
                    </span>
                </div>

                <div className="h-8 w-px bg-black/10" />

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    <button
                        onClick={onDownload}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-black/5 transition-colors text-sm font-bold whitespace-nowrap"
                    >
                        <Download className="w-4 h-4" />
                        {language === 'ru' ? 'Скачать' : 'Download'}
                    </button>
                    <button
                        onClick={onAddToFolder}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-black/5 transition-colors text-sm font-bold whitespace-nowrap"
                    >
                        <FolderPlus className="w-4 h-4" />
                        {language === 'ru' ? 'В папку' : 'To folder'}
                    </button>
                    <button
                        onClick={onDelete}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-red-50 text-red-600 transition-colors text-sm font-bold whitespace-nowrap"
                    >
                        <Trash2 className="w-4 h-4" />
                        {language === 'ru' ? 'Удалить' : 'Delete'}
                    </button>
                </div>

                <button
                    onClick={onClear}
                    className="p-2 hover:bg-black/5 rounded-full transition-colors shrink-0"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
}
