'use client';

import {
    Download,
    RefreshCw,
    Heart,
    MoreHorizontal,
    FolderPlus,
    Trash2,
    X,
    ChevronLeft,
    ChevronRight,
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
import { useEffect, useState, useCallback } from 'react';

interface VideoDetailDialogProps {
    video: Generation | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    models: Model[];
    aspectRatio: string;
    duration: string;
    onRemix: (video: Generation) => void;
    onToggleLike: (id: string) => void;
    videos?: Generation[];
    onSelectVideo?: (video: Generation) => void;
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
    videos = [],
    onSelectVideo,
}: VideoDetailDialogProps) {
    const { language } = useLanguage();
    const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);

    // Reset asset index when video changes
    useEffect(() => {
        setSelectedAssetIndex(0);
    }, [video?.id]);

    const handlePrevious = useCallback(() => {
        if (!video || !onSelectVideo || videos.length === 0) return;
        const currentIndex = videos.findIndex((v) => v.id === video.id);
        if (currentIndex > 0) {
            onSelectVideo(videos[currentIndex - 1]);
        }
    }, [video, videos, onSelectVideo]);

    const handleNext = useCallback(() => {
        if (!video || !onSelectVideo || videos.length === 0) return;
        const currentIndex = videos.findIndex((v) => v.id === video.id);
        if (currentIndex < videos.length - 1) {
            onSelectVideo(videos[currentIndex + 1]);
        }
    }, [video, videos, onSelectVideo]);

    // Keyboard navigation
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') handlePrevious();
            if (e.key === 'ArrowRight') handleNext();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, handlePrevious, handleNext]);

    if (!video) return null;

    const currentAsset = video.result_assets?.[selectedAssetIndex] || video.result_assets?.[0];

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = currentAsset?.url || '';
        link.download = 'generated-video.mp4';
        link.click();
    };

    const handleCopyPrompt = (e: React.MouseEvent) => {
        e.preventDefault();
        navigator.clipboard.writeText(video.prompt);
    };

    const handleRemix = () => {
        onRemix(video);
        onOpenChange(false);
    };

    const hasMultipleAssets = (video.result_assets?.length || 0) > 1;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="fixed inset-0 w-screen h-screen max-w-none max-h-none p-0 rounded-none border-none bg-transparent">
                <VisuallyHidden>
                    <DialogTitle>Video Details</DialogTitle>
                </VisuallyHidden>
                <div className="flex h-full w-full">
                    {/* Video Preview */}
                    <div
                        className="flex-1 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-8 relative cursor-pointer group/preview"
                        onClick={() => onOpenChange(false)}
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpenChange(false);
                            }}
                            className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>

                        {/* Navigation Arrows */}
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-8 pointer-events-none">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrevious();
                                }}
                                className="p-4 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-white/20 transition-all pointer-events-auto opacity-0 group-hover/preview:opacity-100 disabled:opacity-0"
                                disabled={videos.findIndex((v) => v.id === video.id) === 0}
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleNext();
                                }}
                                className="p-4 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-white/20 transition-all pointer-events-auto opacity-0 group-hover/preview:opacity-100 disabled:opacity-0"
                                disabled={
                                    videos.findIndex((v) => v.id === video.id) === videos.length - 1
                                }
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="relative max-w-full max-h-[80%] flex flex-col items-center gap-6">
                            <video
                                key={currentAsset?.url}
                                src={currentAsset?.url || ''}
                                className="max-w-full max-h-full w-auto h-auto object-contain rounded-2xl shadow-2xl"
                                controls
                                autoPlay
                                onClick={(e) => e.stopPropagation()}
                            />

                            {/* Variations Thumbnails */}
                            {hasMultipleAssets && (
                                <div
                                    className="flex items-center gap-3 p-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 overflow-x-auto max-w-full no-scrollbar"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {video.result_assets?.map((asset, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedAssetIndex(index)}
                                            className={`relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 transition-all border-2 ${
                                                selectedAssetIndex === index
                                                    ? 'border-[#6F00FF] scale-105'
                                                    : 'border-transparent hover:border-white/20'
                                            }`}
                                        >
                                            <video
                                                src={asset.url}
                                                className="w-full h-full object-cover"
                                                muted
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details Panel */}
                    <div className="w-[320px] h-full bg-[#0A0A0B] border-l border-white/10 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-6 space-y-10">
                            {/* Prompt Section */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-white/50">
                                        <span className="text-xs font-semibold uppercase tracking-wider">
                                            {language === 'ru' ? 'Промпт' : 'Prompt'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleCopyPrompt}
                                        className="px-3 py-1 text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white/70"
                                    >
                                        {language === 'ru' ? 'Копировать' : 'Copy'}
                                    </button>
                                </div>
                                <p className="text-sm text-white/90 leading-relaxed font-medium">
                                    {video.prompt}
                                </p>
                            </div>

                            {/* Parameters Section */}
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white/40">
                                        {language === 'ru' ? 'Модель' : 'Model'}
                                    </span>
                                    <span className="text-sm font-bold text-white/90">
                                        {models.find((m) => m.id === video.model)?.name ||
                                            video.model}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white/40">
                                        {language === 'ru' ? 'Формат' : 'Aspect'}
                                    </span>
                                    <span className="text-sm font-bold text-white/90">
                                        {aspectRatio}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white/40">
                                        {language === 'ru' ? 'Время' : 'Duration'}
                                    </span>
                                    <span className="text-sm font-bold text-[#FFDC74]">
                                        {duration}s
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white/40">
                                        {language === 'ru' ? 'Создано' : 'Created'}
                                    </span>
                                    <span className="text-sm font-bold text-white/90 text-right">
                                        {new Date(video.created_at).toLocaleDateString(
                                            language === 'ru' ? 'ru-RU' : 'en-US'
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-6 border-t border-white/10 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleDownload}
                                    className="py-4 rounded-2xl bg-[#6F00FF] hover:bg-[#7F00FF] text-white font-bold flex items-center justify-center gap-3 text-xs transition-all active:scale-95 shadow-[0_0_30px_rgba(111,0,255,0.2)]"
                                >
                                    <Download className="w-4 h-4 text-white" />
                                    {language === 'ru' ? 'Скачать' : 'Download'}
                                </button>
                                <button
                                    onClick={handleRemix}
                                    className="py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/5 transition-all flex items-center justify-center gap-3 text-xs active:scale-95"
                                >
                                    <RefreshCw className="w-4 h-4 text-white" />
                                    {language === 'ru' ? 'Переделать' : 'Remake'}
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => onToggleLike(video.id)}
                                    className={`flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/5 transition-all flex items-center justify-center gap-3 text-xs active:scale-95 group ${
                                        video.is_favorite ? 'text-red-500' : ''
                                    }`}
                                >
                                    <Heart
                                        className={`w-4 h-4 transition-colors ${
                                            video.is_favorite
                                                ? 'fill-current text-white'
                                                : 'text-white/40 group-hover:text-white'
                                        }`}
                                    />
                                    {language === 'ru' ? 'В избранное' : 'Favorite'}
                                </button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all border border-white/5 group active:scale-95">
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
