'use client';

import { Play, Pause, Music, Download, Heart, MoreHorizontal, Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Generation } from '@/stores/generation-store';
import { useLanguage } from '@/lib/language-context';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AudioTrack {
    url: string;
    cover?: string;
    index: number;
}

interface AudioTrackCardProps {
    generation: Generation;
    track: AudioTrack;
    trackIndex: number;
    totalTracks: number;
    isCurrentTrack: boolean;
    isPlaying: boolean;
    onClick: () => void;
    onDownload: () => void;
}

export function AudioTrackCard({
    generation,
    track,
    trackIndex,
    totalTracks,
    isCurrentTrack,
    isPlaying,
    onClick,
    onDownload,
}: AudioTrackCardProps) {
    const { language } = useLanguage();
    const genTitle = (generation as any).input?.title || generation.prompt?.slice(0, 30) || 'Untitled';
    const isProcessing = generation.status === 'processing' || generation.status === 'queued';

    if (isProcessing || generation.status === 'failed') {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-[100px] rounded-[20px] bg-white/[0.02] border border-white/5 flex items-center px-6 gap-6 relative"
            >
                <div className="relative w-[68px] h-[68px] shrink-0 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center">
                    {isProcessing ? (
                        <Loader2 className="w-6 h-6 animate-spin text-[#6F00FF]" />
                    ) : (
                        <X className="w-6 h-6 text-red-500" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold truncate mb-1">
                        {isProcessing
                            ? language === 'ru'
                                ? 'Генерация...'
                                : 'Generating...'
                            : language === 'ru'
                            ? 'Ошибка'
                            : 'Failed'}
                    </h3>
                    <p className="text-[11px] text-white/40 font-medium truncate">
                        {generation.model} • {new Date(generation.created_at).toLocaleDateString()}
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`h-[100px] rounded-[20px] border transition-all flex items-center px-6 gap-6 group relative cursor-pointer ${
                isCurrentTrack
                    ? 'bg-[#6F00FF]/10 border-[#6F00FF]/30'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
            }`}
            onClick={onClick}
        >
            {/* Thumbnail with Cover */}
            <div className="relative w-[68px] h-[68px] shrink-0 rounded-xl overflow-hidden group/thumb bg-white/5 flex items-center justify-center">
                {track.cover ? (
                    <img
                        src={track.cover}
                        alt={`${genTitle} Track ${trackIndex + 1}`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <Music className="w-6 h-6 text-[#6F00FF]" />
                )}
                <div
                    className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                        isCurrentTrack && isPlaying
                            ? 'opacity-100'
                            : 'opacity-0 group-hover/thumb:opacity-100'
                    }`}
                >
                    {isCurrentTrack && isPlaying ? (
                        <Pause className="w-6 h-6 fill-white" />
                    ) : (
                        <Play className="w-6 h-6 fill-white" />
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pr-10">
                <h3 className="text-sm font-bold truncate mb-1">
                    {genTitle} {totalTracks > 1 ? `(Track ${trackIndex + 1})` : ''}
                </h3>
                <p className="text-[11px] text-white/40 font-medium truncate">
                    {generation.model} • {new Date(generation.created_at).toLocaleDateString()}
                </p>
            </div>

            {/* Action Bar (Icons) */}
            <div className="hidden sm:flex items-center gap-1 lg:gap-3">
                <button
                    className="p-2 text-white/20 hover:text-[#6F00FF] transition-colors"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Heart className="w-4 h-4" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDownload();
                    }}
                    className="p-2 text-white/20 hover:text-white transition-colors"
                >
                    <Download className="w-4 h-4" />
                </button>
            </div>

            {/* More Menu */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                            <MoreHorizontal className="w-5 h-5 text-white/20" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="bg-[#111] border-white/5 rounded-xl font-mono"
                    >
                        <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest p-2.5">
                            {language === 'ru' ? 'Переименовать' : 'Rename'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest p-2.5">
                            {language === 'ru' ? 'Продолжить' : 'Extend'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest p-2.5 text-red-500">
                            {language === 'ru' ? 'Удалить' : 'Delete'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </motion.div>
    );
}
