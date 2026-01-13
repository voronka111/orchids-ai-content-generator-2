'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Download,
    Loader2,
    Zap,
    Play,
    Pause,
    Music,
    X,
    RefreshCw,
    Shuffle,
    ChevronDown,
    ChevronRight,
    MoreHorizontal,
    ThumbsUp,
    ThumbsDown,
    Heart,
    SkipBack,
    SkipForward,
    Repeat,
    Gauge,
    Volume2,
    Sparkles,
} from 'lucide-react';

import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { useModelsStore } from '@/stores/models-store';
import { useGenerationStore, Generation } from '@/stores/generation-store';
import { toast } from 'sonner';

const defaultAudioStyles = [
    'synthwave',
    'vaporwave',
    'chillwave',
    'darkwave',
    'shoegaze',
    'post-punk',
    'trip-hop',
    'downtempo',
    'nu-disco',
    'witch house',
    'dream pop',
    'krautrock',
    'math rock',
    'noise rock',
    'sludge metal',
    'drone',
    'glitch',
    'breakcore',
    'jungle',
    'footwork',
    'grime',
    'uk garage',
    'happy hardcore',
    'gabber',
    'psytrance',
    'goa trance',
    'acid house',
    'deep house',
    'dub techno',
    'minimal',
    'idm',
    'braindance',
    'wonky',
    'future garage',
    'post-dubstep',
    'bass music',
];
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AudioGenerationPage() {
    const { t, language } = useLanguage();
    const searchParams = useSearchParams();

    // Stores
    const { audioModels, fetchModels } = useModelsStore();
    const { generations, generateAudioSuno, fetchHistory, activePolling } = useGenerationStore();

    // Local state
    const [prompt, setPrompt] = useState('');
    const [lyrics, setLyrics] = useState('');
    const [songTitle, setSongTitle] = useState('');
    const [model, setModel] = useState('');
    const [sunoModel, setSunoModel] = useState<'V4' | 'V4_5' | 'V4_5PLUS' | 'V4_5ALL' | 'V5'>('V5');
    const [isGenerating, setIsGenerating] = useState(false);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [currentTrack, setCurrentTrack] = useState<{
        url: string;
        cover?: string;
        title: string;
        genId: string;
        trackIndex: number;
    } | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioProgress, setAudioProgress] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [showLyrics, setShowLyrics] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [weirdness, setWeirdness] = useState([50]);
    const [displayedStyles, setDisplayedStyles] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
    const [instrumental, setInstrumental] = useState(false);

    // Fetch models and history on mount
    useEffect(() => {
        fetchModels();
        fetchHistory(true);
    }, [fetchModels, fetchHistory]);

    // Set default model when models are loaded
    useEffect(() => {
        if (audioModels.length > 0 && !model) {
            setModel(audioModels[0].id);
        }
    }, [audioModels, model]);

    // Get current model
    const selectedModel = useMemo(
        () => audioModels.find((m) => m.id === model),
        [audioModels, model]
    );

    // Filter generations to only show audio
    const audioGenerations = useMemo(
        () => generations.filter((g) => g.type === 'audio'),
        [generations]
    );

    const getRandomStyles = () => {
        const currentStyles = prompt
            .toLowerCase()
            .split(',')
            .map((s) => s.trim());
        const filtered = defaultAudioStyles.filter((s) => !currentStyles.includes(s.toLowerCase()));
        const shuffled = [...filtered].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 15);
    };

    useEffect(() => {
        setDisplayedStyles(getRandomStyles());
    }, []);

    const shuffleStyles = () => {
        setDisplayedStyles(getRandomStyles());
    };

    useEffect(() => {
        const promptParam = searchParams.get('prompt');
        if (promptParam && audioModels.length > 0) {
            setPrompt(decodeURIComponent(promptParam));
        }
    }, [searchParams, audioModels]);

    const handleGenerate = async (overridePrompt?: string) => {
        const currentPrompt = overridePrompt || prompt;
        if (!currentPrompt.trim() && !lyrics.trim()) return;

        setIsGenerating(true);
        if (window.innerWidth < 1024) {
            setIsSidebarMinimized(true);
        }

        try {
            // When custom_mode is true (lyrics provided), prompt should be the lyrics
            // and style should be the style/genre description
            const hasLyrics = lyrics.trim().length > 0;
            const generationId = await generateAudioSuno({
                prompt: hasLyrics ? lyrics : currentPrompt, // lyrics go in prompt when custom_mode
                model: sunoModel,
                custom_mode: hasLyrics,
                instrumental: instrumental,
                style: hasLyrics ? currentPrompt : undefined, // style/genre when using lyrics
                title: songTitle || undefined,
                style_weight: weirdness[0] / 100,
            });

            if (generationId) {
                toast.success(language === 'ru' ? 'Генерация запущена' : 'Generation started');
                if (!overridePrompt) {
                    setPrompt('');
                    setLyrics('');
                    setSongTitle('');
                }
            } else {
                toast.error(language === 'ru' ? 'Ошибка генерации' : 'Generation failed');
            }
        } catch (error) {
            console.error('Generation error:', error);
            toast.error(language === 'ru' ? 'Ошибка генерации' : 'Generation failed');
        } finally {
            setIsGenerating(false);
        }
    };

    // Helper function to extract audio tracks with covers from result_assets
    const getAudioTracks = (gen: Generation) => {
        if (!gen.result_assets || gen.result_assets.length === 0) return [];

        const tracks: { url: string; cover?: string; index: number }[] = [];
        const assets = gen.result_assets;

        // Pattern: audio, cover, audio, cover
        for (let i = 0; i < assets.length; i++) {
            const asset = assets[i];
            if (
                asset.mime?.startsWith('audio/') ||
                asset.url?.endsWith('.bin') ||
                asset.url?.endsWith('.mp3')
            ) {
                const coverAsset = assets[i + 1];
                const cover = coverAsset?.mime?.startsWith('image/') ? coverAsset.url : undefined;
                tracks.push({
                    url: asset.url,
                    cover,
                    index: tracks.length,
                });
            }
        }

        return tracks;
    };

    // Play a specific track
    const playTrack = (gen: Generation, trackIndex: number) => {
        const tracks = getAudioTracks(gen);
        const track = tracks[trackIndex];
        if (!track) return;

        const title = (gen as any).input?.title || gen.prompt?.slice(0, 30) || 'Untitled';

        setCurrentTrack({
            url: track.url,
            cover: track.cover,
            title: `${title} (Track ${trackIndex + 1})`,
            genId: gen.id,
            trackIndex,
        });
        setIsPlaying(true);
    };

    // Toggle play/pause
    const togglePlayPause = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    // Handle audio time update
    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setAudioProgress(audioRef.current.currentTime);
        }
    };

    // Handle audio loaded metadata
    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setAudioDuration(audioRef.current.duration);
        }
    };

    // Seek to position
    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current || !audioDuration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audioRef.current.currentTime = percent * audioDuration;
    };

    // Handle volume change
    const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        setVolume(percent);
        if (audioRef.current) {
            audioRef.current.volume = percent;
        }
    };

    // Play next/previous track
    const playNextTrack = () => {
        if (!currentTrack) return;
        const gen = audioGenerations.find((g) => g.id === currentTrack.genId);
        if (!gen) return;

        const tracks = getAudioTracks(gen);
        if (currentTrack.trackIndex < tracks.length - 1) {
            playTrack(gen, currentTrack.trackIndex + 1);
        } else {
            // Play first track of next generation
            const currentIndex = audioGenerations.findIndex((g) => g.id === currentTrack.genId);
            if (currentIndex < audioGenerations.length - 1) {
                const nextGen = audioGenerations[currentIndex + 1];
                if (nextGen.status === 'success') {
                    playTrack(nextGen, 0);
                }
            }
        }
    };

    const playPrevTrack = () => {
        if (!currentTrack) return;
        const gen = audioGenerations.find((g) => g.id === currentTrack.genId);
        if (!gen) return;

        if (currentTrack.trackIndex > 0) {
            playTrack(gen, currentTrack.trackIndex - 1);
        } else {
            // Play last track of previous generation
            const currentIndex = audioGenerations.findIndex((g) => g.id === currentTrack.genId);
            if (currentIndex > 0) {
                const prevGen = audioGenerations[currentIndex - 1];
                if (prevGen.status === 'success') {
                    const tracks = getAudioTracks(prevGen);
                    playTrack(prevGen, tracks.length - 1);
                }
            }
        }
    };

    // Format time for display
    const formatDuration = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Effect to handle audio element
    useEffect(() => {
        if (currentTrack && audioRef.current) {
            audioRef.current.src = currentTrack.url;
            audioRef.current.volume = volume;
            if (isPlaying) {
                audioRef.current.play().catch(console.error);
            }
        }
    }, [currentTrack?.url]);

    // Effect for playback speed
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackSpeed;
        }
    }, [playbackSpeed]);

    const generateLyrics = () => {
        setLyrics(
            language === 'ru'
                ? 'В звездной ночи, где мечты оживают,\nМы строим миры, что в огне не сгорают.\nСквозь тернии к свету, сквозь время и мрак,\nМы ищем свой путь, подавая нам знак.'
                : 'In the starry night, where dreams come alive,\nWe build worlds that in fire will survive.\nThrough thorns to the light, through time and the dark,\nWe seek our own way, giving us a spark.'
        );
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-black text-white -m-4">
            <div className="flex flex-1 overflow-hidden relative">
                {/* Fixed Sidebar (Prompt Bar) */}
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
                                        {t('nav.create')}
                                    </span>
                                    <button
                                        onClick={() => setIsSidebarMinimized(true)}
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
                                            <span>
                                                {language === 'ru' ? 'Текст песни' : 'Lyrics'}
                                            </span>
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
                                            onChange={(e) => setLyrics(e.target.value)}
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
                                                onClick={() => setPrompt('')}
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
                                                    setPrompt((prev) =>
                                                        prev ? `${prev}, ${style}` : style
                                                    )
                                                }
                                                className="shrink-0 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono font-medium lowercase tracking-normal transition-all border border-white/5 hover:border-[#6F00FF]/30"
                                            >
                                                {style}
                                            </button>
                                        ))}
                                    </div>

                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder={
                                            language === 'ru'
                                                ? 'Опишите стиль или жанр...'
                                                : 'Describe the style or genre...'
                                        }
                                        className="w-full bg-white/[0.03] rounded-2xl p-4 resize-none outline-none text-white placeholder:text-white/20 min-h-[100px] font-mono text-sm border border-white/5 leading-relaxed focus:border-[#6F00FF]/50 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Bottom Section: Advanced + Create - FIXED above player */}
                            <div className="absolute bottom-[164px] lg:bottom-[110px] left-0 right-0 p-6 bg-[#0A0A0A] border-t border-white/5 space-y-4 z-40">
                                {/* Advanced Content when expanded */}
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
                                                    onChange={(e) => setSongTitle(e.target.value)}
                                                    className="w-full h-12 bg-white/[0.03] rounded-xl px-4 outline-none text-sm font-mono border border-white/5 placeholder:text-white/20"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                                    {language === 'ru' ? 'Модель' : 'Model'}
                                                </span>
                                                <Select value={model} onValueChange={setModel}>
                                                    <SelectTrigger className="w-full h-12 bg-white/5 border-none rounded-xl px-4 text-xs font-mono gap-3 hover:bg-white/10 transition-colors">
                                                        <span>{selectedModel?.name}</span>
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#0A0A0A] border-white/10 rounded-xl p-2 font-mono">
                                                        {audioModels.map((m) => (
                                                            <SelectItem
                                                                key={m.id}
                                                                value={m.id}
                                                                className="rounded-lg"
                                                            >
                                                                <div className="flex items-center justify-between w-full gap-8">
                                                                    <span className="font-medium">
                                                                        {m.name}
                                                                    </span>
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
                                                        {language === 'ru'
                                                            ? 'Креативность'
                                                            : 'Creativity'}
                                                    </span>
                                                    <span className="text-[10px] font-mono font-bold text-[#6F00FF]">
                                                        {weirdness}%
                                                    </span>
                                                </div>
                                                <Slider
                                                    value={weirdness}
                                                    onValueChange={setWeirdness}
                                                    max={100}
                                                    step={1}
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
                                    onClick={() => handleGenerate()}
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
                            onClick={() => setIsSidebarMinimized(false)}
                            className="fixed right-6 bottom-[180px] z-[60] w-14 h-14 rounded-2xl bg-[#6F00FF] text-white flex items-center justify-center shadow-[0_0_30px_rgba(111,0,255,0.5)] hover:scale-110 active:scale-95 transition-all lg:hidden"
                        >
                            <Plus className="w-7 h-7" />
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col relative h-full bg-[#050505] overflow-hidden">
                    {/* Top Header with Search */}
                    <header className="p-6 flex items-center justify-between gap-6 border-b border-white/5">
                        <div className="flex-1 max-w-xl relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                            <input
                                type="text"
                                placeholder={language === 'ru' ? 'Поиск...' : 'Search...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-11 bg-white/5 rounded-full pl-12 pr-4 outline-none text-sm font-mono border border-white/5 focus:border-[#6F00FF]/50 transition-all placeholder:text-white/20"
                            />
                        </div>
                    </header>

                    {/* Tracks List */}
                    <div className="flex-1 overflow-y-auto p-4 lg:p-6 pb-80 no-scrollbar">
                        <div className="flex flex-col gap-4 w-full max-w-5xl mx-auto">
                            {isGenerating && (
                                <div className="h-[100px] rounded-[20px] bg-white/[0.02] border border-white/5 flex items-center px-6 gap-6 relative overflow-hidden group">
                                    <div className="w-[68px] h-[68px] rounded-xl bg-white/5 animate-pulse flex items-center justify-center shrink-0">
                                        <Loader2 className="w-5 h-5 animate-spin text-[#6F00FF]" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-1/3 bg-white/5 animate-pulse rounded" />
                                        <div className="h-2 w-1/2 bg-white/5 animate-pulse rounded opacity-50" />
                                    </div>
                                </div>
                            )}

                            <AnimatePresence mode="popLayout">
                                {audioGenerations.map((gen) => {
                                    const isProcessing =
                                        gen.status === 'processing' || gen.status === 'queued';
                                    const tracks = getAudioTracks(gen);
                                    const genTitle =
                                        (gen as any).input?.title ||
                                        gen.prompt?.slice(0, 30) ||
                                        'Untitled';

                                    // Show loading/error state
                                    if (isProcessing || gen.status === 'failed') {
                                        return (
                                            <motion.div
                                                key={gen.id}
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
                                                        {gen.model} •{' '}
                                                        {new Date(
                                                            gen.created_at
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        );
                                    }

                                    // Render each track separately with its cover
                                    return tracks.map((track, trackIdx) => {
                                        const isCurrentTrack =
                                            currentTrack?.genId === gen.id &&
                                            currentTrack?.trackIndex === trackIdx;

                                        return (
                                            <motion.div
                                                key={`${gen.id}-track-${trackIdx}`}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`h-[100px] rounded-[20px] border transition-all flex items-center px-6 gap-6 group relative cursor-pointer ${
                                                    isCurrentTrack
                                                        ? 'bg-[#6F00FF]/10 border-[#6F00FF]/30'
                                                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
                                                }`}
                                                onClick={() => playTrack(gen, trackIdx)}
                                            >
                                                {/* Thumbnail with Cover */}
                                                <div className="relative w-[68px] h-[68px] shrink-0 rounded-xl overflow-hidden group/thumb bg-white/5 flex items-center justify-center">
                                                    {track.cover ? (
                                                        <img
                                                            src={track.cover}
                                                            alt={`${genTitle} Track ${
                                                                trackIdx + 1
                                                            }`}
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
                                                        {genTitle}{' '}
                                                        {tracks.length > 1
                                                            ? `(Track ${trackIdx + 1})`
                                                            : ''}
                                                    </h3>
                                                    <p className="text-[11px] text-white/40 font-medium truncate">
                                                        {gen.model} •{' '}
                                                        {new Date(
                                                            gen.created_at
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>

                                                {/* Action Bar (Icons) */}
                                                <div className="hidden sm:flex items-center gap-1 lg:gap-3">
                                                    <button
                                                        className="p-2 text-white/20 hover:text-white transition-colors"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <ThumbsUp className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="p-2 text-white/20 hover:text-[#6F00FF] transition-colors"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Heart className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            window.open(track.url, '_blank');
                                                        }}
                                                        className="p-2 text-white/20 hover:text-white transition-colors"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* More Menu */}
                                                <div
                                                    className="absolute right-6 top-1/2 -translate-y-1/2"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
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
                                                                {language === 'ru'
                                                                    ? 'Переименовать'
                                                                    : 'Rename'}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest p-2.5">
                                                                {language === 'ru'
                                                                    ? 'Продолжить'
                                                                    : 'Extend'}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest p-2.5 text-red-500">
                                                                {language === 'ru'
                                                                    ? 'Удалить'
                                                                    : 'Delete'}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </motion.div>
                                        );
                                    });
                                })}
                            </AnimatePresence>
                        </div>
                    </div>
                </main>
            </div>

            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={playNextTrack}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />

            {/* Bottom Audio Player - Full Width */}
            <footer className="fixed bottom-16 lg:bottom-0 left-0 right-0 h-[100px] lg:h-[110px] bg-[#0A0A0A]/95 backdrop-blur-2xl border-t border-white/5 flex flex-col z-50">
                {/* Progress Bar - Minimalist (Absolute top) */}
                <div
                    className="absolute top-0 left-0 right-0 h-1 bg-white/5 cursor-pointer group z-10"
                    onClick={handleSeek}
                >
                    <div
                        className="h-full bg-[#6F00FF] group-hover:bg-[#8B33FF] transition-all"
                        style={{
                            width: audioDuration
                                ? `${(audioProgress / audioDuration) * 100}%`
                                : '0%',
                        }}
                    />
                    <div
                        className="absolute top-1/2 w-3 h-3 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 transition-transform shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        style={{
                            left: audioDuration
                                ? `${(audioProgress / audioDuration) * 100}%`
                                : '0%',
                        }}
                    />
                </div>

                {/* Controls Row */}
                <div className="flex-1 px-4 lg:px-8 py-3 flex items-center justify-between gap-4 lg:gap-8">
                    {/* Left: Info & Playback Speed (minimalist) */}
                    <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 shrink-0 overflow-hidden">
                            {currentTrack?.cover ? (
                                <img
                                    src={currentTrack.cover}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Music className="w-5 h-5 lg:w-6 lg:h-6 text-white/20" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className="text-xs lg:text-sm font-bold truncate">
                                {currentTrack?.title ||
                                    (language === 'ru'
                                        ? 'Ничего не воспроизводится'
                                        : 'Nothing playing')}
                            </h4>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest truncate">
                                {currentTrack
                                    ? `${formatDuration(audioProgress)} / ${formatDuration(
                                          audioDuration
                                      )}`
                                    : language === 'ru'
                                    ? 'Выберите трек'
                                    : 'Select a track'}
                            </p>
                        </div>

                        {/* Minimalist Speed Switcher */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all">
                                    <Gauge className="w-4 h-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                side="top"
                                className="bg-[#111] border-white/10 rounded-xl p-1 font-mono"
                            >
                                {[0.8, 1.0, 1.2, 1.5].map((speed) => (
                                    <DropdownMenuItem
                                        key={speed}
                                        onClick={() => setPlaybackSpeed(speed)}
                                        className={`text-[10px] font-bold p-2 rounded-lg cursor-pointer ${
                                            playbackSpeed === speed
                                                ? 'bg-[#6F00FF]'
                                                : 'focus:bg-[#6F00FF]'
                                        }`}
                                    >
                                        {speed}x
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Center: Main Controls */}
                    <div className="flex items-center gap-3 lg:gap-8">
                        <button className="hidden sm:block text-white/20 hover:text-white transition-colors">
                            <Shuffle className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-4 lg:gap-6">
                            <button
                                onClick={playPrevTrack}
                                className="text-white/40 hover:text-white transition-colors"
                            >
                                <SkipBack className="w-5 h-5 fill-current" />
                            </button>
                            <button
                                onClick={togglePlayPause}
                                disabled={!currentTrack}
                                className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50"
                            >
                                {isPlaying ? (
                                    <Pause className="w-5 h-5 lg:w-6 lg:h-6 fill-current" />
                                ) : (
                                    <Play className="w-5 h-5 lg:w-6 lg:h-6 fill-current ml-0.5" />
                                )}
                            </button>
                            <button
                                onClick={playNextTrack}
                                className="text-white/40 hover:text-white transition-colors"
                            >
                                <SkipForward className="w-5 h-5 fill-current" />
                            </button>
                        </div>
                        <button className="hidden sm:block text-white/20 hover:text-white transition-colors">
                            <Repeat className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Right: Volume & More */}
                    <div className="hidden lg:flex items-center justify-end gap-6 flex-1">
                        <div className="flex items-center gap-3 group">
                            <Volume2 className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
                            <div
                                className="w-24 h-1 bg-white/5 rounded-full relative overflow-hidden cursor-pointer"
                                onClick={handleVolumeChange}
                            >
                                <div
                                    className="absolute inset-y-0 left-0 bg-white/20 group-hover:bg-[#6F00FF] transition-all"
                                    style={{ width: `${volume * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Mobile Right: Small buttons */}
                    <div className="lg:hidden flex items-center gap-2">
                        <button className="p-2 text-white/40">
                            <Heart className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
