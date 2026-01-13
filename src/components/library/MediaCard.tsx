'use client';

import { motion } from 'framer-motion';
import {
    Check,
    Play,
    Image as ImageIcon,
    Video,
    Music,
    X,
    Loader2,
} from 'lucide-react';
import { Generation } from '@/stores/generation-store';
import { useLanguage } from '@/lib/language-context';

interface MediaCardProps {
    generation: Generation;
    isSelected: boolean;
    onToggleSelect: () => void;
}

export function MediaCard({ generation, isSelected, onToggleSelect }: MediaCardProps) {
    const { language } = useLanguage();
    const mediaUrl = generation.result_assets?.[0]?.url;
    const isProcessing = generation.status === 'processing' || generation.status === 'queued';

    const renderMediaPreview = () => {
        if (isProcessing) {
            return (
                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#6F00FF]" />
                </div>
            );
        }

        if (generation.status === 'failed') {
            return (
                <div className="w-full h-full bg-red-500/10 flex items-center justify-center">
                    <X className="w-8 h-8 text-red-500" />
                </div>
            );
        }

        switch (generation.type) {
            case 'image':
                return mediaUrl ? (
                    <img
                        src={mediaUrl}
                        alt={generation.prompt}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-white/20" />
                    </div>
                );

            case 'video':
                return mediaUrl ? (
                    <div className="relative w-full h-full">
                        <video
                            src={mediaUrl}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            onMouseEnter={(e) => e.currentTarget.play()}
                            onMouseLeave={(e) => {
                                e.currentTarget.pause();
                                e.currentTarget.currentTime = 0;
                            }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center">
                                <Play className="w-5 h-5 fill-white ml-0.5" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <Video className="w-8 h-8 text-white/20" />
                    </div>
                );

            case 'audio':
                return (
                    <div className="w-full h-full bg-gradient-to-br from-[#6F00FF]/20 to-purple-500/20 flex items-center justify-center">
                        <Music className="w-12 h-12 text-white/40" />
                    </div>
                );

            default:
                return (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-white/20" />
                    </div>
                );
        }
    };

    if (generation.type === 'audio') {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`group relative aspect-square rounded-[24px] overflow-hidden cursor-pointer transition-all duration-300 ${
                    isSelected
                        ? 'ring-2 ring-[#6F00FF] ring-offset-4 ring-offset-black scale-[0.98]'
                        : 'hover:scale-[1.02]'
                }`}
                onClick={onToggleSelect}
            >
                <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/[0.02] flex flex-col items-center justify-center p-6 text-center border border-white/5">
                    <div className="w-16 h-16 rounded-full bg-[#6F00FF]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Music className="w-8 h-8 text-[#6F00FF]" />
                    </div>
                    <p className="text-sm font-medium line-clamp-2 mb-2 px-4">
                        {generation.prompt}
                    </p>
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                        {new Date(generation.created_at).toLocaleDateString(
                            language === 'ru' ? 'ru-RU' : 'en-US',
                            { day: 'numeric', month: 'short' }
                        )}
                    </span>
                </div>

                <div
                    className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
                        isSelected
                            ? 'bg-[#6F00FF] border-[#6F00FF]'
                            : 'bg-black/20 border-white/20 opacity-0 group-hover:opacity-100'
                    }`}
                >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`group relative aspect-square rounded-[24px] overflow-hidden cursor-pointer transition-all duration-300 ${
                isSelected
                    ? 'ring-2 ring-[#6F00FF] ring-offset-4 ring-offset-black scale-[0.98]'
                    : 'hover:scale-[1.02]'
            }`}
            onClick={onToggleSelect}
        >
            {renderMediaPreview()}

            <div
                className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
                    isSelected
                        ? 'bg-[#6F00FF] border-[#6F00FF]'
                        : 'bg-black/20 border-white/20 opacity-0 group-hover:opacity-100'
                }`}
            >
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
        </motion.div>
    );
}
