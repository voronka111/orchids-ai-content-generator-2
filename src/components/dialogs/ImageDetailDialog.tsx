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
    Share2,
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
    const [showMoreInfo, setShowMoreInfo] = useState(false);
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
                className="fixed inset-0 w-full h-full max-w-none p-0 border-none bg-black overflow-y-auto sm:overflow-hidden"
                showCloseButton={false}
            >
                <VisuallyHidden>
                    <DialogTitle>Image Details</DialogTitle>
                </VisuallyHidden>
                
                <div className="flex flex-col h-full relative">
                    {/* Header */}
                    <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center pointer-events-none">
                        <button
                            onClick={() => onOpenChange(false)}
                            className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-white/20 transition-all pointer-events-auto"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="flex gap-2 pointer-events-auto">
                             <button
                                onClick={handlePrevious}
                                className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-white/20 transition-all disabled:opacity-30"
                                disabled={generations.findIndex((g) => g.id === image.id) === 0}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-white/20 transition-all disabled:opacity-30"
                                disabled={generations.findIndex((g) => g.id === image.id) === generations.length - 1}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col h-full overflow-y-auto no-scrollbar">
                        {/* Image Section */}
                        <div className="w-full bg-black flex items-center justify-center p-4 sm:p-12 min-h-[300px] sm:min-h-[500px] relative">
                            <img
                                src={currentAsset?.url || ''}
                                alt=""
                                className="max-w-full max-h-[70vh] w-auto h-auto object-contain rounded-2xl shadow-2xl"
                            />

                             {/* Variations Thumbnails */}
                             {hasMultipleAssets && (
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 overflow-x-auto max-w-[90%] no-scrollbar">
                                    {image.result_assets?.map((asset, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedAssetIndex(index)}
                                            className={`relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 transition-all border-2 ${
                                                selectedAssetIndex === index
                                                    ? 'border-[#6F00FF]'
                                                    : 'border-transparent'
                                            }`}
                                        >
                                            <img src={asset.url} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Info Section */}
                        <div className="w-full max-w-2xl mx-auto px-6 pb-40">
                            <div className="space-y-8 py-8">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            {language === 'ru' ? 'Промпт' : 'Prompt'}
                                        </h3>
                                        <button
                                            onClick={handleCopyPrompt}
                                            className="text-[10px] font-bold text-[#DFFF1A] uppercase tracking-widest px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                        >
                                            {language === 'ru' ? 'Копировать' : 'Copy'}
                                        </button>
                                    </div>
                                    <p className="text-base text-white/90 leading-relaxed font-medium bg-white/5 p-5 rounded-2xl border border-white/5">
                                        {image.prompt}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                                        <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Model</span>
                                        <p className="text-sm text-white/70 font-bold truncate">{image.model}</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                                        <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Quality</span>
                                        <p className="text-sm text-white/70 font-bold uppercase">{resolution}</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                                        <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Size</span>
                                        <p className="text-sm text-white/70 font-bold">
                                            {currentAsset?.size ? `${Math.round(currentAsset.size / 1024)} KB` : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                                        <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Created</span>
                                        <p className="text-sm text-white/70 font-bold">
                                            {new Date(image.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Bottom Bar - Fixed */}
                    <div className="fixed bottom-0 left-0 right-0 p-6 bg-black/60 backdrop-blur-2xl border-t border-white/10 z-50">
                        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleRemix}
                                className="flex-1 py-4 rounded-2xl bg-[#DFFF1A] hover:bg-[#EFFF4A] text-black font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-[0_0_30px_rgba(223,255,26,0.2)]"
                            >
                                <Sparkles className="w-4 h-4 fill-current" />
                                {language === 'ru' ? 'Изменить' : 'Modify'}
                            </button>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleDownload}
                                    className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all border border-white/10"
                                    title="Download"
                                >
                                    <Download className="w-5 h-5" />
                                </button>
                                <button
                                    className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all border border-white/10"
                                    title="Share"
                                >
                                    <Share2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => onToggleLike(image.id)}
                                    className={`w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10 ${image.is_favorite ? 'text-red-500' : 'text-white'}`}
                                    title="Favorite"
                                >
                                    <Heart className={`w-5 h-5 ${image.is_favorite ? 'fill-current' : ''}`} />
                                </button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all border border-white/10">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-[#0A0A0A]/95 backdrop-blur-xl border-white/10 rounded-2xl p-2 min-w-[180px]">
                                        <DropdownMenuItem className="gap-3 py-3 rounded-xl cursor-pointer focus:bg-white/10" onClick={handleAnimate}>
                                            <Play className="w-4 h-4" /> {language === 'ru' ? 'Анимировать' : 'Animate'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="gap-3 py-3 rounded-xl cursor-pointer focus:bg-white/10" onClick={handleUpscale}>
                                            <Wand2 className="w-4 h-4" /> {language === 'ru' ? 'Улучшить' : 'Upscale'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="gap-3 py-3 rounded-xl cursor-pointer focus:bg-white/10">
                                            <FolderPlus className="w-4 h-4" /> {language === 'ru' ? 'В папку' : 'Add to folder'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="gap-3 py-3 rounded-xl text-red-500 focus:text-red-500 focus:bg-red-500/10">
                                            <Trash2 className="w-4 h-4" /> {language === 'ru' ? 'Удалить' : 'Delete'}
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
