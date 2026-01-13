'use client';

import {
    Download,
    RefreshCw,
    Heart,
    MoreHorizontal,
    FolderPlus,
    Trash2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/lib/language-context';
import { Generation } from '@/stores/generation-store';
import { Model } from '@/stores/models-store';
import { toast } from 'sonner';

interface VideoDetailDialogProps {
    video: Generation | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    models: Model[];
    aspectRatio: string;
    duration: string;
    onRemix: (video: Generation) => void;
    onToggleLike: (id: string) => void;
}

export function VideoDetailDialog({
    video,
    open,
    onOpenChange,
    models,
    aspectRatio,
    duration,
    onRemix,
    onToggleLike,
}: VideoDetailDialogProps) {
    const { language } = useLanguage();

    if (!video) return null;

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = video.result_assets?.[0]?.url || '';
        link.download = 'generated-video.mp4';
        link.click();
        toast.success(language === 'ru' ? 'Загрузка начата' : 'Download started');
    };

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(video.prompt);
        toast.success(language === 'ru' ? 'Промпт скопирован' : 'Prompt copied');
    };

    const handleRemix = () => {
        onRemix(video);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] md:max-w-7xl bg-[#0A0A0B]/95 border-white/10 p-0 overflow-hidden rounded-[40px] h-[95vh] md:h-auto md:max-h-[90vh] shadow-2xl">
                <VisuallyHidden>
                    <DialogTitle>Video Details</DialogTitle>
                </VisuallyHidden>
                <div className="flex flex-col md:flex-row h-full">
                    {/* Video Preview */}
                    <div className="flex-1 bg-black/40 flex items-center justify-center p-4 md:p-12 overflow-hidden min-h-[300px] md:min-h-0 relative">
                        <div className="absolute inset-0 bg-[#6F00FF]/5 blur-[100px] -z-10" />
                        <div className="relative max-w-full max-h-[70vh] md:max-h-[80vh] w-auto h-auto flex items-center justify-center cursor-pointer group aspect-video">
                            <video
                                src={video.result_assets?.[0]?.url || ''}
                                className="w-full h-full object-contain rounded-3xl shadow-2xl transition-transform duration-700 group-hover:scale-[1.01]"
                                controls
                                autoPlay
                            />
                        </div>
                    </div>

                    {/* Details Panel */}
                    <div className="w-full md:w-[420px] p-8 flex flex-col gap-8 border-t md:border-t-0 md:border-l border-white/5 bg-white/[0.02] backdrop-blur-3xl overflow-y-auto">
                        <div className="space-y-6">
                            {/* Prompt */}
                            <div>
                                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">
                                    {language === 'ru' ? 'ПРОМПТ' : 'PROMPT'}
                                </h3>
                                <div
                                    onClick={handleCopyPrompt}
                                    className="bg-white/5 hover:bg-white/10 rounded-3xl p-6 border border-white/5 cursor-pointer transition-all group relative active:scale-[0.98]"
                                >
                                    <div className="max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                                        <p className="text-sm leading-relaxed text-white/90 font-medium select-all">
                                            {video.prompt}
                                        </p>
                                    </div>
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-white/20 px-2 py-1 rounded-lg text-[10px] text-white font-bold uppercase tracking-widest">
                                            Copy
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Parameters */}
                            <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-6">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/20 border-b border-white/5 pb-4">
                                    <span>
                                        {language === 'ru' ? 'Характеристики' : 'Parameters'}
                                    </span>
                                    <span>
                                        {new Date(video.created_at).toLocaleDateString(
                                            language === 'ru' ? 'ru-RU' : 'en-US'
                                        )}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <h4 className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                                            {language === 'ru' ? 'Модель' : 'Model'}
                                        </h4>
                                        <p className="text-xs font-black text-white/80">
                                            {models.find((m) => m.id === video.model)?.name ||
                                                video.model ||
                                                'Runway Gen-3'}
                                        </p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <h4 className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                                            {language === 'ru' ? 'Формат' : 'Aspect'}
                                        </h4>
                                        <p className="text-xs font-black text-white/80">
                                            {aspectRatio}
                                        </p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <h4 className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                                            {language === 'ru' ? 'Время' : 'Duration'}
                                        </h4>
                                        <p className="text-xs font-black text-[#FFDC74] uppercase tracking-widest">
                                            {duration}s
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleDownload}
                                    className="py-4 rounded-2xl bg-[#6F00FF] text-white hover:bg-[#7F00FF] transition-all flex items-center justify-center gap-3 text-xs font-bold active:scale-95 shadow-[0_0_30px_rgba(111,0,255,0.2)]"
                                >
                                    <Download className="w-4 h-4 text-white" />
                                    {language === 'ru' ? 'Скачать' : 'Download'}
                                </button>
                                <button
                                    onClick={handleRemix}
                                    className="py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all flex items-center justify-center gap-3 text-xs font-bold active:scale-95"
                                >
                                    <RefreshCw className="w-4 h-4 text-white" />
                                    {language === 'ru' ? 'Переделать' : 'Remake'}
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => onToggleLike(video.id)}
                                    className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all flex items-center justify-center gap-3 text-xs font-bold active:scale-95 group"
                                >
                                    <Heart className="w-4 h-4 transition-colors text-white/40 group-hover:text-white" />
                                    {language === 'ru' ? 'В избранное' : 'Favorite'}
                                </button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all active:scale-95 group">
                                            <MoreHorizontal className="w-5 h-5 text-white/40 group-hover:text-white" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="bg-[#0A0A0A]/95 backdrop-blur-xl border-white/10 rounded-2xl p-2 min-w-[180px]"
                                    >
                                        <DropdownMenuItem className="gap-3 py-3 rounded-xl cursor-pointer focus:bg-white/10">
                                            <FolderPlus className="w-4 h-4 text-white/40" />
                                            <span className="text-sm font-medium">
                                                {language === 'ru' ? 'В папку' : 'Add to folder'}
                                            </span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="gap-3 py-3 rounded-xl text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer">
                                            <Trash2 className="w-4 h-4" />
                                            <span className="text-sm font-medium">
                                                {language === 'ru' ? 'Удалить' : 'Delete'}
                                            </span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
