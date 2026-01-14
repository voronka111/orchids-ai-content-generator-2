'use client';

import { useRouter } from 'next/navigation';
import {
    X,
    Download,
    RefreshCw,
    Heart,
    MoreHorizontal,
    FolderPlus,
    Trash2,
    Sparkles,
    Image as ImageIcon,
    ChevronUp,
    ChevronDown,
    Play,
    Wand2,
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
import { DiamondIcon } from '@/components/ui/diamond-icon';
import { useEffect, useState, useCallback } from 'react';

interface ImageDetailDialogProps {
    image: Generation | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    resolution: string;
    onRemix: (image: Generation) => void;
    onToggleLike: (id: string) => void;
    generations?: Generation[];
    onSelectImage?: (image: Generation) => void;
}

export function ImageDetailDialog({
    image,
    open,
    onOpenChange,
    resolution,
    onRemix,
    onToggleLike,
    generations = [],
    onSelectImage,
}: ImageDetailDialogProps) {
    const { language } = useLanguage();
    const router = useRouter();
    const [showMoreInfo, setShowMoreInfo] = useState(true);
    const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);

    // Reset asset index when image changes
    useEffect(() => {
        setSelectedAssetIndex(0);
    }, [image?.id]);

    const handlePrevious = useCallback(() => {
        if (!image || !onSelectImage || generations.length === 0) return;
        const currentIndex = generations.findIndex((g) => g.id === image.id);
        if (currentIndex > 0) {
            onSelectImage(generations[currentIndex - 1]);
        }
    }, [image, generations, onSelectImage]);

    const handleNext = useCallback(() => {
        if (!image || !onSelectImage || generations.length === 0) return;
        const currentIndex = generations.findIndex((g) => g.id === image.id);
        if (currentIndex < generations.length - 1) {
            onSelectImage(generations[currentIndex + 1]);
        }
    }, [image, generations, onSelectImage]);

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

    if (!image) return null;

    const currentAsset = image.result_assets?.[selectedAssetIndex] || image.result_assets?.[0];

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = currentAsset?.url || '';
        link.download = 'generated-image.png';
        link.click();
    };

    const handleCopyPrompt = (e: React.MouseEvent) => {
        e.preventDefault();
        navigator.clipboard.writeText(image.prompt);
    };

    const handleRemix = () => {
        onRemix(image);
        onOpenChange(false);
    };

    const handleAnimate = () => {
        router.push(`/app/create/video?image=${encodeURIComponent(currentAsset?.url || '')}`);
    };

    const handleUpscale = () => {
        router.push(`/app/tools/enhance?image=${encodeURIComponent(currentAsset?.url || '')}`);
    };

    const hasMultipleAssets = (image.result_assets?.length || 0) > 1;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="fixed inset-0 w-screen h-screen max-w-none max-h-none p-0 rounded-none border-none bg-transparent"
                showCloseButton={false}
            >
                <VisuallyHidden>
                    <DialogTitle>Image Details</DialogTitle>
                </VisuallyHidden>
                <div className="flex h-full w-full">
                    {/* Image Preview */}
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
                                disabled={generations.findIndex((g) => g.id === image.id) === 0}
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
                                    generations.findIndex((g) => g.id === image.id) ===
                                    generations.length - 1
                                }
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="relative max-w-full max-h-[85%] flex flex-col items-center justify-center">
                            <img
                                src={currentAsset?.url || ''}
                                alt=""
                                className="max-w-full max-h-full w-auto h-auto object-contain rounded-2xl shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            />

                            {/* Variations Thumbnails - Overlay Style */}
                            {hasMultipleAssets && (
                                <div
                                    className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 opacity-40 hover:opacity-100 transition-opacity z-10 no-scrollbar overflow-x-auto max-w-[90%]"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {image.result_assets?.map((asset, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedAssetIndex(index)}
                                            className={`relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 transition-all border-2 ${
                                                selectedAssetIndex === index
                                                    ? 'border-[#6F00FF] scale-105 shadow-lg shadow-[#6F00FF]/20'
                                                    : 'border-transparent hover:border-white/40'
                                            }`}
                                        >
                                            <img
                                                src={asset.url}
                                                alt=""
                                                className="w-full h-full object-cover"
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
                                        <Sparkles className="w-4 h-4" />
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
                                    {image.prompt}
                                </p>
                            </div>

                            {/* Information Section */}
                            <div className="pt-4">
                                <button
                                    onClick={() => setShowMoreInfo(!showMoreInfo)}
                                    className="flex items-center justify-between w-full text-white/50 mb-6"
                                >
                                    <div className="flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4" />
                                        <span className="text-xs font-semibold uppercase tracking-wider">
                                            {language === 'ru' ? 'Информация' : 'Information'}
                                        </span>
                                    </div>
                                    {showMoreInfo ? (
                                        <ChevronUp className="w-4 h-4" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4" />
                                    )}
                                </button>

                                {showMoreInfo && (
                                    <div className="space-y-5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-white/40">
                                                {language === 'ru' ? 'Модель' : 'Model'}
                                            </span>
                                            <span className="text-sm font-bold text-white/90">
                                                {image.model}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-white/40">
                                                {language === 'ru' ? 'Изображения' : 'Images'}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                                                    <img
                                                        src={currentAsset?.url || ''}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-white/40">
                                                {language === 'ru' ? 'Качество' : 'Quality'}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <DiamondIcon className="w-3.5 h-3.5 text-white/40" />
                                                <span className="text-sm font-bold text-white/90 uppercase tracking-widest">
                                                    {resolution}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-white/40">
                                                {language === 'ru' ? 'Размер' : 'Size'}
                                            </span>
                                            <span className="text-sm font-bold text-white/90">
                                                {currentAsset?.size
                                                    ? `${Math.round(currentAsset.size / 1024)} KB`
                                                    : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-white/40">
                                                {language === 'ru' ? 'Создано' : 'Created'}
                                            </span>
                                            <span className="text-sm font-bold text-white/90">
                                                {new Date(image.created_at).toLocaleDateString(
                                                    language === 'ru' ? 'ru-RU' : 'en-US',
                                                    {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    }
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-6 border-t border-white/10 space-y-4">
                            <button
                                onClick={handleAnimate}
                                className="w-full py-4 rounded-2xl bg-[#6F00FF] hover:bg-[#7F00FF] text-white font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-[0_0_30px_rgba(111,0,255,0.2)]"
                            >
                                <Play className="w-4 h-4 fill-white text-white" />
                                {language === 'ru' ? 'Анимировать' : 'Animate'}
                            </button>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleUpscale}
                                    className="py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold flex items-center justify-center gap-2.5 text-xs transition-all border border-white/5"
                                >
                                    <Wand2 className="w-4 h-4 text-white" />
                                    {language === 'ru' ? 'Улучшить' : 'Upscale'}
                                </button>
                                <button
                                    onClick={handleRemix}
                                    className="py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold flex items-center justify-center gap-2.5 text-xs transition-all border border-white/5"
                                >
                                    <RefreshCw className="w-4 h-4 text-white" />
                                    {language === 'ru' ? 'Переделать' : 'Remake'}
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleDownload}
                                    className="flex-1 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold flex items-center justify-center gap-2.5 text-xs transition-all border border-white/5"
                                >
                                    <Download className="w-4 h-4 text-white" />
                                    {language === 'ru' ? 'Скачать' : 'Download'}
                                </button>
                                <button
                                    onClick={() => onToggleLike(image.id)}
                                    className={`p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all border border-white/5 group active:scale-90 ${
                                        image.is_favorite ? 'text-red-500' : ''
                                    }`}
                                >
                                    <Heart
                                        className={`w-5 h-5 transition-colors ${
                                            image.is_favorite
                                                ? 'fill-current text-white'
                                                : 'text-white/40 group-hover:text-white'
                                        }`}
                                    />
                                </button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all border border-white/5 group active:scale-90">
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
