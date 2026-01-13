'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Sparkles,
    Plus,
    X,
    Download,
    Share2,
    RefreshCw,
    Loader2,
    Zap,
    LayoutGrid,
    List,
    Play,
    Square,
    Cpu,
    Info,
    Clock,
    Heart,
    MoreHorizontal,
    Trash2,
    FolderPlus,
    Maximize2,
    Minimize2,
    Diamond,
} from 'lucide-react';

import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { useModelsStore } from '@/stores/models-store';
import { useGenerationStore, Generation } from '@/stores/generation-store';
import { toast } from 'sonner';
import { Slider } from '@/components/ui/slider';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UploadedImage {
    id: string;
    url: string;
    name: string;
    file?: File;
}

export function VideoGenerationPage() {
    const { t, language } = useLanguage();
    const searchParams = useSearchParams();

    // Stores
    const { videoModels, fetchModels } = useModelsStore();
    const {
        generations,
        generateVideoKling,
        generateVideoKlingI2V,
        generateVideoWan,
        uploadImage,
        fetchHistory,
        activePolling,
    } = useGenerationStore();

    // Local state
    const [prompt, setPrompt] = useState('');
    const [model, setModel] = useState('');
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [duration, setDuration] = useState('5');
    const [sound, setSound] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [gridSize, setGridSize] = useState([400]);
    const [selectedVideo, setSelectedVideo] = useState<Generation | null>(null);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch models and history on mount
    useEffect(() => {
        fetchModels();
        fetchHistory(true);
    }, [fetchModels, fetchHistory]);

    // Set default model when models are loaded
    useEffect(() => {
        if (videoModels.length > 0 && !model) {
            setModel(videoModels[0].id);
        }
    }, [videoModels, model]);

    // Get current model and its constraints
    const selectedModel = useMemo(
        () => videoModels.find((m) => m.id === model),
        [videoModels, model]
    );

    // Dynamic aspect ratios from model constraints
    const availableAspectRatios = useMemo(() => {
        if (selectedModel?.constraints?.aspectRatios) {
            return selectedModel.constraints.aspectRatios.map((ar) => ({
                id: ar,
                name: ar,
            }));
        }
        return [
            { id: '1:1', name: '1:1' },
            { id: '16:9', name: '16:9' },
            { id: '9:16', name: '9:16' },
        ];
    }, [selectedModel]);

    // Dynamic durations from model constraints
    const availableDurations = useMemo(() => {
        if (selectedModel?.constraints?.durations) {
            return selectedModel.constraints.durations;
        }
        return ['5', '10'];
    }, [selectedModel]);

    // Filter generations to only show videos
    const videoGenerations = useMemo(
        () => generations.filter((g) => g.type === 'video'),
        [generations]
    );

    const toggleLike = (id: string) => {
        toast.info(language === 'ru' ? 'В разработке' : 'Coming soon');
    };

    const handleRemix = (gen: Generation) => {
        setPrompt(gen.prompt);
        const foundModel = videoModels.find((m) => m.id === gen.model || m.name === gen.model);
        if (foundModel) setModel(foundModel.id);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        toast.success(
            language === 'ru'
                ? 'Параметры скопированы в панель генерации'
                : 'Parameters copied to generation bar'
        );
    };

    useEffect(() => {
        const promptParam = searchParams.get('prompt');
        const imageParam = searchParams.get('image');
        if (promptParam && videoModels.length > 0) {
            setPrompt(decodeURIComponent(promptParam));
        }
        // Handle image-to-video from image generation page
        if (imageParam) {
            setUploadedImages([
                {
                    id: 'url-image',
                    url: decodeURIComponent(imageParam),
                    name: 'Reference Image',
                },
            ]);
        }
    }, [searchParams, videoModels]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    }, []);

    const handleFiles = (files: File[]) => {
        const imageFiles = files.filter((f) => f.type.startsWith('image/'));
        const newImages = imageFiles.map((file) => ({
            id: Math.random().toString(36).substr(2, 9),
            url: URL.createObjectURL(file),
            name: file.name,
            file: file,
        }));
        setUploadedImages((prev) => [...prev, ...newImages].slice(0, 2));
    };

    const removeImage = (id: string) => {
        setUploadedImages((prev) => prev.filter((img) => img.id !== id));
    };

    const handleGenerate = async (overridePrompt?: string) => {
        const currentPrompt = overridePrompt || prompt;
        if (!currentPrompt.trim() || !selectedModel) return;

        setIsGenerating(true);

        try {
            let generationId: string | null = null;

            // Upload images if present (for image-to-video)
            const uploadedUrls: string[] = [];
            if (uploadedImages.length > 0) {
                for (const img of uploadedImages) {
                    if (img.file) {
                        const url = await uploadImage(img.file);
                        if (url) uploadedUrls.push(url);
                    } else if (img.url && !img.url.startsWith('blob:')) {
                        // URL from query param (image-to-video flow)
                        uploadedUrls.push(img.url);
                    }
                }
            }

            // Route to correct generation endpoint based on model
            const modelId = selectedModel.id.toLowerCase();

            if (modelId.includes('kling')) {
                if (uploadedUrls.length > 0) {
                    generationId = await generateVideoKlingI2V({
                        prompt: currentPrompt,
                        image_urls: uploadedUrls,
                        duration: duration as '5' | '10',
                        sound: sound,
                    });
                } else {
                    generationId = await generateVideoKling({
                        prompt: currentPrompt,
                        aspect_ratio: aspectRatio as '1:1' | '16:9' | '9:16',
                        duration: duration as '5' | '10',
                        sound: sound,
                    });
                }
            } else if (modelId.includes('wan')) {
                generationId = await generateVideoWan({
                    prompt: currentPrompt,
                    duration: duration as '5' | '10' | '15',
                    resolution: '1080p',
                });
            } else {
                // Default to Kling
                generationId = await generateVideoKling({
                    prompt: currentPrompt,
                    aspect_ratio: aspectRatio as '1:1' | '16:9' | '9:16',
                    duration: duration as '5' | '10',
                    sound: sound,
                });
            }

            if (generationId) {
                toast.success(language === 'ru' ? 'Генерация запущена' : 'Generation started');
                if (!overridePrompt) {
                    setPrompt('');
                    setUploadedImages([]);
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

    const getAspectRatioIcon = (id: string, className?: string) => {
        switch (id) {
            case '1:1':
                return (
                    <div
                        className={`w-3.5 h-3.5 border-2 border-current rounded-none ${className}`}
                    />
                );
            case '16:9':
                return (
                    <div className={`w-5 h-3 border-2 border-current rounded-none ${className}`} />
                );
            case '9:16':
                return (
                    <div className={`w-3 h-5 border-2 border-current rounded-none ${className}`} />
                );
            case '4:3':
                return (
                    <div
                        className={`w-4.5 h-3.5 border-2 border-current rounded-none ${className}`}
                    />
                );
            case '3:2':
                return (
                    <div
                        className={`w-4.5 h-3 border-2 border-current rounded-none ${className}`}
                    />
                );
            default:
                return (
                    <div
                        className={`w-3.5 h-3.5 border-2 border-current rounded-none ${className}`}
                    />
                );
        }
    };

    return (
        <div className="max-w-full mx-auto pb-40 relative overflow-x-hidden">
            {/* Background Ellipses */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#6F00FF]/20 blur-[120px] rounded-full -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#a855f7]/20 blur-[120px] rounded-full -z-10" />

            <div className="flex items-center justify-between gap-4 mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <Link
                        href="/app"
                        className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">
                            {t('type.video')}
                        </h1>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold opacity-50">
                            {t('type.video.sub')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 w-32 sm:w-48">
                        <Minimize2 className="w-3.5 h-3.5 text-white/20" />
                        <Slider
                            value={gridSize}
                            onValueChange={setGridSize}
                            max={800}
                            min={250}
                            step={1}
                            className="flex-1 cursor-pointer"
                        />
                        <Maximize2 className="w-3.5 h-3.5 text-white/20" />
                    </div>
                </div>
            </div>

            <div
                className="grid gap-4 sm:gap-6"
                style={{
                    gridTemplateColumns: `repeat(auto-fill, minmax(${gridSize[0]}px, 1fr))`,
                }}
            >
                {isGenerating && (
                    <div className="aspect-video rounded-[32px] glass flex items-center justify-center">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 animate-spin text-[#6F00FF] mx-auto mb-4" />
                            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
                                {language === 'ru' ? 'Генерация...' : 'Generating...'}
                            </p>
                        </div>
                    </div>
                )}
                {videoGenerations.map((gen) => {
                    const videoUrl = gen.result_assets?.[0]?.url;
                    const isProcessing = gen.status === 'processing' || gen.status === 'queued';

                    return (
                        <div key={gen.id} className="flex flex-col gap-4">
                            <div
                                className="relative group rounded-[32px] overflow-hidden glass transition-all aspect-video cursor-pointer border border-white/5 hover:border-white/20 shadow-xl"
                                onClick={() => !isProcessing && setSelectedVideo(gen)}
                            >
                                {isProcessing ? (
                                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                                        <div className="text-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-[#6F00FF] mx-auto mb-2" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                                                {gen.status === 'queued'
                                                    ? language === 'ru'
                                                        ? 'В очереди...'
                                                        : 'Queued...'
                                                    : language === 'ru'
                                                    ? 'Генерация...'
                                                    : 'Generating...'}
                                            </p>
                                        </div>
                                    </div>
                                ) : gen.status === 'failed' ? (
                                    <div className="w-full h-full flex items-center justify-center bg-red-500/10">
                                        <div className="text-center">
                                            <X className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">
                                                {language === 'ru' ? 'Ошибка' : 'Failed'}
                                            </p>
                                        </div>
                                    </div>
                                ) : videoUrl ? (
                                    <>
                                        <video
                                            src={videoUrl}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            muted
                                            loop
                                            onMouseEnter={(e) => e.currentTarget.play()}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.pause();
                                                e.currentTarget.currentTime = 0;
                                            }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                                                <Play className="w-8 h-8 fill-white ml-1" />
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                                            <p className="text-sm font-medium line-clamp-2 text-white/90 leading-relaxed">
                                                {gen.prompt}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                                        <Play className="w-8 h-8 text-white/20" />
                                    </div>
                                )}

                                {!isProcessing && gen.status === 'success' && (
                                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleLike(gen.id);
                                            }}
                                            className="p-3 rounded-2xl bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-[#6F00FF] transition-all active:scale-95"
                                        >
                                            <Heart className="w-4 h-4" />
                                        </button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                    className="p-3 rounded-2xl bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-[#6F00FF] transition-all active:scale-95"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                className="bg-[#0A0A0A]/95 backdrop-blur-xl border-white/10 rounded-2xl p-2 min-w-[180px]"
                                            >
                                                <DropdownMenuItem className="gap-3 py-3 rounded-xl cursor-pointer focus:bg-white/10">
                                                    <FolderPlus className="w-4 h-4 text-white/40" />
                                                    <span className="text-sm font-medium">
                                                        {language === 'ru'
                                                            ? 'В папку'
                                                            : 'Add to folder'}
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
                                )}
                            </div>

                            <div className="px-3 space-y-2">
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium opacity-60">
                                    {gen.prompt}
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                                            {gen.model}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-white/10" />
                                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                            {new Date(gen.created_at).toLocaleDateString(
                                                language === 'ru' ? 'ru-RU' : 'en-US',
                                                { day: 'numeric', month: 'short' }
                                            )}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleRemix(gen)}
                                        className="p-2 rounded-xl hover:bg-white/10 text-white/20 hover:text-white transition-all active:scale-90"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="fixed bottom-0 md:bottom-6 left-0 right-0 z-40 flex justify-center pointer-events-none px-0 md:px-6 mb-[64px] md:mb-0">
                <div className="w-full max-w-2xl pointer-events-auto">
                    <div
                        className={`relative rounded-t-[32px] md:rounded-[32px] glass p-4 transition-all ${
                            isDragging
                                ? 'border-[#6F00FF] border-2 border-dashed shadow-[0_0_50px_rgba(111,0,255,0.2)]'
                                : 'border-white/10 md:border border-b-0 md:border-b shadow-2xl'
                        }`}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                    >
                        {uploadedImages.length > 0 && (
                            <div className="flex gap-3 mb-4 flex-wrap">
                                {uploadedImages.map((img) => (
                                    <div
                                        key={img.id}
                                        className="relative w-16 h-16 rounded-2xl overflow-hidden group border border-white/10 shadow-lg"
                                    >
                                        <img
                                            src={img.url}
                                            alt={img.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => removeImage(img.id)}
                                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                        >
                                            <X className="w-4 h-4 text-white" />
                                        </button>
                                        <span className="absolute bottom-1 left-1 text-[8px] bg-black/60 px-1 rounded text-white font-black uppercase tracking-widest">
                                            {uploadedImages.indexOf(img) === 0 ? 'Start' : 'End'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-3 mb-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors py-1.5 px-3 rounded-xl bg-white/5"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>{language === 'ru' ? 'Добавьте кадр' : 'Add frame'}</span>
                            </button>
                        </div>

                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={t('prompt.placeholder')}
                            className="w-full bg-transparent resize-none outline-none text-white placeholder:text-white/20 min-h-[44px] font-medium text-sm mb-4 leading-relaxed"
                            rows={1}
                        />

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Select
                                    value={model}
                                    onValueChange={(v) => {
                                        setModel(v);
                                        setOpenDropdown(null);
                                    }}
                                    open={openDropdown === 'model'}
                                    onOpenChange={(open) => setOpenDropdown(open ? 'model' : null)}
                                >
                                    <SelectTrigger className="w-fit min-w-[100px] h-10 bg-white/5 border-none rounded-2xl px-4 text-xs font-bold gap-3 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Cpu className="w-4 h-4 text-white" />
                                            <span className="text-white">
                                                {selectedModel?.name}
                                            </span>
                                        </div>
                                        <VisuallyHidden>
                                            <SelectValue />
                                        </VisuallyHidden>
                                    </SelectTrigger>

                                    <SelectContent
                                        className="bg-[#0A0A0A]/95 backdrop-blur-xl border-white/10 rounded-2xl p-2"
                                        align="start"
                                    >
                                        {videoModels.map((m) => (
                                            <SelectItem
                                                key={m.id}
                                                value={m.id}
                                                className="rounded-xl py-2.5"
                                            >
                                                <div className="flex items-center justify-between w-full gap-8">
                                                    <span className="font-medium">{m.name}</span>
                                                    <span className="text-credits font-mono text-[10px] font-black">
                                                        {m.credits_cost}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={aspectRatio}
                                    onValueChange={(v) => {
                                        setAspectRatio(v);
                                        setOpenDropdown(null);
                                    }}
                                    open={openDropdown === 'aspect'}
                                    onOpenChange={(open) => setOpenDropdown(open ? 'aspect' : null)}
                                >
                                    <SelectTrigger className="w-fit min-w-[70px] h-10 bg-white/5 border-none rounded-2xl px-4 text-xs font-bold gap-3 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            {getAspectRatioIcon(aspectRatio, 'text-white')}
                                            <span className="text-white">{aspectRatio}</span>
                                        </div>
                                        <VisuallyHidden>
                                            <SelectValue />
                                        </VisuallyHidden>
                                    </SelectTrigger>
                                    <SelectContent
                                        className="bg-[#0A0A0A]/95 backdrop-blur-xl border-white/10 rounded-2xl p-2"
                                        align="start"
                                    >
                                        {availableAspectRatios.map((ar) => (
                                            <SelectItem
                                                key={ar.id}
                                                value={ar.id}
                                                className="rounded-xl py-2.5 font-medium"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {getAspectRatioIcon(ar.id, 'text-white/40')}
                                                    {ar.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={duration}
                                    onValueChange={(v) => {
                                        setDuration(v);
                                        setOpenDropdown(null);
                                    }}
                                    open={openDropdown === 'duration'}
                                    onOpenChange={(open) =>
                                        setOpenDropdown(open ? 'duration' : null)
                                    }
                                >
                                    <SelectTrigger className="w-fit min-w-[70px] h-10 bg-white/5 border-none rounded-2xl px-4 text-xs font-bold gap-3 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-4 h-4 text-white" />
                                            <span className="text-white">{duration}s</span>
                                        </div>
                                        <VisuallyHidden>
                                            <SelectValue />
                                        </VisuallyHidden>
                                    </SelectTrigger>
                                    <SelectContent
                                        className="bg-[#0A0A0A]/95 backdrop-blur-xl border-white/10 rounded-2xl p-2"
                                        align="start"
                                    >
                                        {availableDurations.map((dur) => (
                                            <SelectItem
                                                key={dur}
                                                value={dur}
                                                className="rounded-xl py-2.5 font-medium uppercase tracking-widest"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Clock className="w-3.5 h-3.5 text-white/40" />
                                                    {dur}s
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="text-sm text-muted-foreground hidden sm:block">
                                    <span className="text-[#FFDC74] font-mono flex items-center gap-2 font-black">
                                        <Zap className="w-4 h-4 fill-current" />
                                        {selectedModel?.credits_cost || 25}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleGenerate()}
                                    disabled={!prompt.trim() || isGenerating}
                                    className="px-6 py-2.5 rounded-2xl bg-[#6F00FF] text-white font-black uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto flex items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(111,0,255,0.3)]"
                                >
                                    {isGenerating ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        t('prompt.create')
                                    )}
                                </button>
                            </div>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFiles(Array.from(e.target.files || []))}
                        />
                    </div>
                </div>
            </div>

            <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
                <DialogContent className="max-w-[95vw] md:max-w-7xl bg-[#0A0A0B]/95 border-white/10 p-0 overflow-hidden rounded-[40px] h-[95vh] md:h-auto md:max-h-[90vh] shadow-2xl">
                    <VisuallyHidden>
                        <DialogTitle>Video Details</DialogTitle>
                    </VisuallyHidden>
                    {selectedVideo && (
                        <div className="flex flex-col md:flex-row h-full">
                            <div className="flex-1 bg-black/40 flex items-center justify-center p-4 md:p-12 overflow-hidden min-h-[300px] md:min-h-0 relative">
                                <div className="absolute inset-0 bg-[#6F00FF]/5 blur-[100px] -z-10" />
                                <div className="relative max-w-full max-h-[70vh] md:max-h-[80vh] w-auto h-auto flex items-center justify-center cursor-pointer group aspect-video">
                                    <video
                                        src={selectedVideo.result_assets?.[0]?.url || ''}
                                        className="w-full h-full object-contain rounded-3xl shadow-2xl transition-transform duration-700 group-hover:scale-[1.01]"
                                        controls
                                        autoPlay
                                    />
                                </div>
                            </div>

                            <div className="w-full md:w-[420px] p-8 flex flex-col gap-8 border-t md:border-t-0 md:border-l border-white/5 bg-white/[0.02] backdrop-blur-3xl overflow-y-auto">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">
                                            {language === 'ru' ? 'ПРОМПТ' : 'PROMPT'}
                                        </h3>
                                        <div
                                            onClick={() => {
                                                navigator.clipboard.writeText(selectedVideo.prompt);
                                                toast.success(
                                                    language === 'ru'
                                                        ? 'Промпт скопирован'
                                                        : 'Prompt copied'
                                                );
                                            }}
                                            className="bg-white/5 hover:bg-white/10 rounded-3xl p-6 border border-white/5 cursor-pointer transition-all group relative active:scale-[0.98]"
                                        >
                                            <div className="max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                                                <p className="text-sm leading-relaxed text-white/90 font-medium select-all">
                                                    {selectedVideo.prompt}
                                                </p>
                                            </div>
                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="bg-white/20 px-2 py-1 rounded-lg text-[10px] text-white font-bold uppercase tracking-widest">
                                                    Copy
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-6">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/20 border-b border-white/5 pb-4">
                                            <span>
                                                {language === 'ru'
                                                    ? 'Характеристики'
                                                    : 'Parameters'}
                                            </span>
                                            <span>
                                                {new Date(
                                                    selectedVideo.created_at
                                                ).toLocaleDateString(
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
                                                    {videoModels.find(
                                                        (m) => m.id === selectedVideo.model
                                                    )?.name ||
                                                        selectedVideo.model ||
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

                                <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href =
                                                    selectedVideo.result_assets?.[0]?.url || '';
                                                link.download = 'generated-video.mp4';
                                                link.click();
                                                toast.success(
                                                    language === 'ru'
                                                        ? 'Загрузка начата'
                                                        : 'Download started'
                                                );
                                            }}
                                            className="py-4 rounded-2xl bg-[#6F00FF] text-white hover:bg-[#7F00FF] transition-all flex items-center justify-center gap-3 text-xs font-bold active:scale-95 shadow-[0_0_30px_rgba(111,0,255,0.2)]"
                                        >
                                            <Download className="w-4 h-4 text-white" />
                                            {language === 'ru' ? 'Скачать' : 'Download'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleRemix(selectedVideo);
                                                setSelectedVideo(null);
                                            }}
                                            className="py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all flex items-center justify-center gap-3 text-xs font-bold active:scale-95"
                                        >
                                            <RefreshCw className="w-4 h-4 text-white" />
                                            {language === 'ru' ? 'Переделать' : 'Remake'}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => toggleLike(selectedVideo.id)}
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
                                                        {language === 'ru'
                                                            ? 'В папку'
                                                            : 'Add to folder'}
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
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
