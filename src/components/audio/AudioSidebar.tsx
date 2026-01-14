'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    X,
    Loader2,
    Zap,
    Shuffle,
    ChevronDown,
    ChevronRight,
    Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { Model } from '@/stores/models-store';
import { AUDIO_STYLES } from '@/constants/audio-styles';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface AudioSidebarProps {
    prompt: string;
    onPromptChange: (value: string) => void;
    lyrics: string;
    onLyricsChange: (value: string) => void;
    songTitle: string;
    onSongTitleChange: (value: string) => void;
    models: Model[];
    selectedModelId: string;
    onModelChange: (value: string) => void;
    weirdness: number[];
    onWeirdnessChange: (value: number[]) => void;
    isGenerating: boolean;
    onGenerate: () => void;
    isSidebarMinimized: boolean;
    onToggleSidebar: () => void;
}

export function AudioSidebar({
    prompt,
    onPromptChange,
    lyrics,
    onLyricsChange,
    songTitle,
    onSongTitleChange,
    models,
    selectedModelId,
    onModelChange,
    weirdness,
    onWeirdnessChange,
    isGenerating,
    onGenerate,
    isSidebarMinimized,
    onToggleSidebar,
}: AudioSidebarProps) {
    const { language } = useLanguage();
    const [showLyrics, setShowLyrics] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [displayedStyles, setDisplayedStyles] = useState<string[]>(() => getRandomStyles());

    const selectedModel = models.find((m) => m.id === selectedModelId);

    function getRandomStyles() {
        const currentStyles = prompt
            .toLowerCase()
            .split(',')
            .map((s) => s.trim());
        const filtered = AUDIO_STYLES.filter((s) => !currentStyles.includes(s.toLowerCase()));
        const shuffled = [...filtered].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 15);
    }

    const shuffleStyles = () => {
        setDisplayedStyles(getRandomStyles());
    };

    const generateLyrics = () => {
        onLyricsChange(
            language === 'ru'
                ? 'В звездной ночи, где мечты оживают,\nМы строим миры, что в огне не сгорают.\nСквозь тернии к свету, сквозь время и мрак,\nМы ищем свой путь, подавая нам знак.'
                : 'In the starry night, where dreams come alive,\nWe build worlds that in fire will survive.\nThrough thorns to the light, through time and the dark,\nWe seek our own way, giving us a spark.'
        );
    };

    return (
        <AnimatePresence mode="wait">
            {!isSidebarMinimized ? (
                <motion.aside
                    initial={{ x: 0, opacity: 1 }}
                    exit={{ x: -400, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="w-full lg:w-[380px] border-r border-white/5 flex flex-col h-full bg-[#0A0A0A] relative z-30"
                >
                    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-80">
                        {/* Header for Mobile Collapse */}
                        <div className="flex items-center justify-between lg:hidden mb-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-white/40">
                                {language === 'ru' ? 'Создать' : 'Create'}
                            </span>
                            <button
                                onClick={onToggleSidebar}
                                className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white"
                            >
                                <ChevronDown className="w-5 h-5 rotate-90" />
                            </button>
                        </div>

                        {/* Lyrics Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setShowLyrics(!showLyrics)}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 group hover:text-white transition-colors"
                                >
                                    {showLyrics ? (
                                        <ChevronDown className="w-3 h-3" />
                                    ) : (
                                        <ChevronRight className="w-3 h-3" />
                                    )}
                                    <span>{language === 'ru' ? 'Текст песни' : 'Lyrics'}</span>
                                </button>
                                <button
                                    onClick={generateLyrics}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#6F00FF] transition-all"
                                    title={
                                        language === 'ru'
                                            ? 'Сгенерировать текст'
                                            : 'Generate lyrics'
                                    }
                                >
                                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                                </button>
                            </div>
                            {showLyrics && (
                                <textarea
                                    value={lyrics}
                                    onChange={(e) => onLyricsChange(e.target.value)}
                                    placeholder={
                                        language === 'ru'
                                            ? 'Введите текст песни...'
                                            : 'Enter lyrics...'
                                    }
                                    className="w-full bg-white/[0.03] rounded-2xl p-4 resize-none outline-none text-white placeholder:text-white/20 min-h-[140px] font-mono text-sm border border-white/5 leading-relaxed focus:border-[#6F00FF]/50 transition-all"
                                />
                            )}
                        </div>

                        {/* Description Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                    {language === 'ru' ? 'Описание' : 'Description'}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => onPromptChange('')}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={shuffleStyles}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#6F00FF] transition-all"
                                    >
                                        <Shuffle className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Horizontal Scrollable Styles */}
                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                                {displayedStyles.map((style) => (
                                    <button
                                        key={style}
                                        onClick={() =>
                                            onPromptChange(prompt ? `${prompt}, ${style}` : style)
                                        }
                                        className="shrink-0 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono font-medium lowercase tracking-normal transition-all border border-white/5 hover:border-[#6F00FF]/30"
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>

                            <textarea
                                value={prompt}
                                onChange={(e) => onPromptChange(e.target.value)}
                                placeholder={
                                    language === 'ru'
                                        ? 'Опишите стиль или жанр...'
                                        : 'Describe the style or genre...'
                                }
                                className="w-full bg-white/[0.03] rounded-2xl p-4 resize-none outline-none text-white placeholder:text-white/20 min-h-[100px] font-mono text-sm border border-white/5 leading-relaxed focus:border-[#6F00FF]/50 transition-all"
                            />
                        </div>
                    </div>

                    {/* Bottom Section: Advanced + Create */}
                    <div className="absolute bottom-[164px] lg:bottom-[110px] left-0 right-0 p-6 bg-[#0A0A0A] border-t border-white/5 space-y-4 z-40">
                        <AnimatePresence>
                            {showAdvanced && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden space-y-6 mb-4"
                                >
                                    <div className="space-y-3">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                            {language === 'ru' ? 'Название' : 'Title'}
                                        </span>
                                        <input
                                            type="text"
                                            value={songTitle}
                                            onChange={(e) => onSongTitleChange(e.target.value)}
                                            className="w-full h-12 bg-white/[0.03] rounded-xl px-4 outline-none text-sm font-mono border border-white/5 placeholder:text-white/20"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                            {language === 'ru' ? 'Модель' : 'Model'}
                                        </span>
                                        <Select value={selectedModelId} onValueChange={onModelChange}>
                                            <SelectTrigger className="w-full h-12 bg-white/5 border-none rounded-xl px-4 text-xs font-mono gap-3 hover:bg-white/10 transition-colors">
                                                <span>{selectedModel?.name}</span>
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#0A0A0A] border-white/10 rounded-xl p-2 font-mono">
                                                {models.map((m) => (
                                                    <SelectItem
                                                        key={m.id}
                                                        value={m.id}
                                                        className="rounded-lg"
                                                    >
                                                        <div className="flex items-center justify-between w-full gap-8">
                                                            <span className="font-medium">{m.name}</span>
                                                            <span className="text-credits font-mono text-[10px] font-black opacity-50">
                                                                {m.credits_cost}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                                {language === 'ru' ? 'Креативность' : 'Creativity'}
                                            </span>
                                            <span className="text-[10px] font-mono font-bold text-[#6F00FF]">
                                                {weirdness}%
                                            </span>
                                        </div>
                                        <Slider
                                            value={weirdness}
                                            onValueChange={onWeirdnessChange}
                                            max={100}
                                            step={0.1}
                                            className="py-2"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="w-full flex items-center justify-center gap-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white transition-colors"
                        >
                            {showAdvanced ? (
                                <ChevronDown className="w-3 h-3" />
                            ) : (
                                <ChevronRight className="w-3 h-3" />
                            )}
                            <span>{language === 'ru' ? 'Настройки' : 'Settings'}</span>
                        </button>

                        <button
                            onClick={onGenerate}
                            disabled={!prompt.trim() || isGenerating}
                            className="w-full h-14 rounded-2xl bg-[#6F00FF] text-white font-black uppercase tracking-[0.2em] text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(111,0,255,0.2)]"
                        >
                            {isGenerating ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <div className="flex items-center gap-4">
                                    <span>{language === 'ru' ? 'Создать' : 'Create'}</span>
                                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/20 text-[#FFD700]">
                                        <Zap className="w-3 h-3 fill-current" />
                                        <span className="text-[10px] font-black">10</span>
                                    </div>
                                </div>
                            )}
                        </button>
                    </div>
                </motion.aside>
            ) : (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    onClick={onToggleSidebar}
                    className="fixed right-6 bottom-[180px] z-[60] w-14 h-14 rounded-2xl bg-[#6F00FF] text-white flex items-center justify-center shadow-[0_0_30px_rgba(111,0,255,0.5)] hover:scale-110 active:scale-95 transition-all lg:hidden"
                >
                    <Plus className="w-7 h-7" />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
