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

import { AddToCollectionModal } from '@/components/library/AddToCollectionModal';

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
    const [isAddToCollectionOpen, setIsAddToCollectionOpen] = useState(false);

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
                    <div className="flex-1 flex flex-col h-full overflow-y-auto no-scrollbar">
                        {/* Video Section */}
                        <div className="w-full bg-black flex items-center justify-center p-4 sm:p-12 min-h-[300px] sm:min-h-[500px] relative">
                            <video
                                  key={currentAsset?.url}
                                  src={currentAsset?.url || ''}
                                  className="max-w-full max-h-[70vh] w-auto h-auto object-contain rounded-xl lg:rounded-2xl shadow-2xl"
                                  controls
                                  autoPlay
                              />

                               {/* Variations Thumbnails */}
                               {hasMultipleAssets && (
                                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 overflow-x-auto max-w-[90%] no-scrollbar">
                                      {video.result_assets?.map((asset, index) => (
                                          <button
                                              key={index}
                                              onClick={() => setSelectedAssetIndex(index)}
                                              className={`relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 transition-all border-2 ${
                                                  selectedAssetIndex === index
                                                      ? 'border-[#6F00FF]'
                                                      : 'border-transparent'
                                              }`}
                                          >
                                              <video src={asset.url} className="w-full h-full object-cover" muted />
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
                                              className="text-[10px] font-bold text-[#DFFF1A] uppercase tracking-widest px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                          >
                                              {language === 'ru' ? 'Копировать' : 'Copy'}
                                          </button>
                                      </div>
                                      <p className="text-base text-white/90 leading-relaxed font-medium bg-white/5 p-5 rounded-xl border border-white/5">
                                          {video.prompt}
                                      </p>
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                      <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-1">
                                          <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Model</span>
                                          <p className="text-sm text-white/70 font-bold truncate">
                                              {models.find((m) => m.id === video.model)?.name || video.model}
                                          </p>
                                      </div>
                                      <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-1">
                                          <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Aspect</span>
                                          <p className="text-sm text-white/70 font-bold uppercase">{aspectRatio}</p>
                                      </div>
                                      <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-1">
                                          <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Duration</span>
                                          <p className="text-sm text-white/70 font-bold">{duration}s</p>
                                      </div>
                                      <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-1">
                                          <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Created</span>
                                          <p className="text-sm text-white/70 font-bold">
                                              {new Date(video.created_at).toLocaleDateString()}
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
                                  className="flex-1 py-4 rounded-xl bg-[#DFFF1A] hover:bg-[#EFFF4A] text-black font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-[0_0_30px_rgba(223,255,26,0.2)]"
                              >
                                  <RefreshCw className="w-4 h-4" />
                                  {language === 'ru' ? 'Переделать' : 'Remake'}
                              </button>

                              <div className="flex items-center gap-3">
                                  <button
                                      onClick={handleDownload}
                                      className="w-14 h-14 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all border border-white/10"
                                      title="Download"
                                  >
                                      <Download className="w-5 h-5" />
                                  </button>
                                  <button
                                      className="w-14 h-14 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all border border-white/10"
                                      title="Share"
                                  >
                                      <Share2 className="w-5 h-5" />
                                  </button>
                                  <button
                                      onClick={() => onToggleLike(video.id)}
                                      className={`w-14 h-14 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10 ${video.is_favorite ? 'text-red-500' : 'text-white'}`}
                                      title="Favorite"
                                  >
                                      <Heart className={`w-5 h-5 ${video.is_favorite ? 'fill-current' : ''}`} />
                                  </button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="w-14 h-14 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all border border-white/10">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end" className="bg-[#0A0A0A]/95 backdrop-blur-xl border-white/10 rounded-2xl p-2 min-w-[180px]">
                                              <DropdownMenuItem 
                                                onClick={() => setIsAddToCollectionOpen(true)}
                                                className="gap-3 py-3 rounded-lg cursor-pointer focus:bg-white/10"
                                              >
                                                  <FolderPlus className="w-4 h-4 text-white/40" /> {language === 'ru' ? 'В папку' : 'Add to folder'}
                                              </DropdownMenuItem>
                                              <DropdownMenuItem className="gap-3 py-3 rounded-lg text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer">
                                                <Trash2 className="w-4 h-4" /> {language === 'ru' ? 'Удалить' : 'Delete'}
                                              </DropdownMenuItem>
                                          </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                          </div>
                      </div>

                      <AddToCollectionModal
                        generationId={video.id}
                        open={isAddToCollectionOpen}
                        onOpenChange={setIsAddToCollectionOpen}
                      />
              </DialogContent>
          </Dialog>

    );
}
