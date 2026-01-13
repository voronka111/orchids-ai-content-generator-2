'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Sparkles,
    Plus,
    X,
    Download,
    RefreshCw,
    Loader2,
    Heart,
    MoreHorizontal,
    Trash2,
    FolderPlus,
    Cpu,
    Zap,
    Maximize2,
    Minimize2,
    Image as ImageIcon,
    Play,
    ChevronUp,
    ChevronDown,
    Wand2,
} from 'lucide-react';
import { DiamondIcon } from '@/components/ui/diamond-icon';

import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { useModelsStore, Model } from '@/stores/models-store';
import { useGenerationStore, Generation } from '@/stores/generation-store';
import { useAuthStore } from '@/stores/auth-store';
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

export function ImageGenerationPage() {
    const { t, language } = useLanguage();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Stores
    const { imageModels, fetchModels, isLoading: modelsLoading } = useModelsStore();
    const { generations, generateImageGeneric, uploadImage, fetchHistory, activePolling } =
        useGenerationStore();
    const { user } = useAuthStore();

    // Local state
    const [prompt, setPrompt] = useState('');
    const [model, setModel] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [resolution, setResolution] = useState('1K');
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [gridSize, setGridSize] = useState([350]);
    const [selectedImage, setSelectedImage] = useState<Generation | null>(null);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [showMoreInfo, setShowMoreInfo] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch models and history on mount
    useEffect(() => {
        fetchModels();
        fetchHistory(true);
    }, [fetchModels, fetchHistory]);

    // Set default model when models are loaded
    useEffect(() => {
        if (imageModels.length > 0 && !model) {
            setModel(imageModels[0].id);
        }
    }, [imageModels, model]);

    // Get current model and its constraints
    const selectedModel = useMemo(
        () => imageModels.find((m) => m.id === model),
        [imageModels, model]
    );

    // Dynamic aspect ratios from model constraints
    const availableAspectRatios = useMemo(() => {
        if (selectedModel?.constraints?.aspectRatios) {
            return selectedModel.constraints.aspectRatios.map((ar) => ({
                id: ar,
                name: ar,
                description: ar,
            }));
        }
        return [
            { id: '1:1', name: '1:1', description: 'Square' },
            { id: '16:9', name: '16:9', description: 'Wide' },
            { id: '9:16', name: '9:16', description: 'Vertical' },
            { id: '4:3', name: '4:3', description: 'Standard' },
            { id: '3:2', name: '3:2', description: 'Photo' },
        ];
    }, [selectedModel]);

    // Dynamic resolutions from model constraints
    const availableResolutions = useMemo(() => {
        if (selectedModel?.constraints?.resolutions) {
            return selectedModel.constraints.resolutions.map((res) => ({
                id: res,
                name: res,
                description: res,
            }));
        }
        return [
            { id: '1K', name: '1K', description: '1024px' },
            { id: '2K', name: '2K', description: '2048px' },
        ];
    }, [selectedModel]);

    // Filter generations to only show images
    const imageGenerations = useMemo(
        () => generations.filter((g) => g.type === 'image'),
        [generations]
    );

    // Check if any generation is currently processing
    const hasProcessingGenerations = activePolling.size > 0;

    const toggleLike = (id: string) => {
        // TODO: Implement like functionality via API
        toast.info(language === 'ru' ? 'В разработке' : 'Coming soon');
    };

    const handleRemix = (gen: Generation) => {
        setPrompt(gen.prompt);
        const foundModel = imageModels.find((m) => m.id === gen.model || m.name === gen.model);
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
        if (promptParam && imageModels.length > 0) {
            setPrompt(decodeURIComponent(promptParam));
        }
    }, [searchParams, imageModels]);

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
        setUploadedImages((prev) => [...prev, ...newImages].slice(0, 4));
    };

    const removeImage = (id: string) => {
        setUploadedImages((prev) => prev.filter((img) => img.id !== id));
    };

    const handleGenerate = async (overridePrompt?: string) => {
        const currentPrompt = overridePrompt || prompt;
        if (!currentPrompt.trim() || !selectedModel) return;

        setIsGenerating(true);

        try {
            // Upload images if present (for image-to-image)
            const uploadedUrls: string[] = [];
            if (uploadedImages.length > 0) {
                for (const img of uploadedImages) {
                    if (img.file) {
                        const url = await uploadImage(img.file);
                        if (url) uploadedUrls.push(url);
                    }
                }
            }

            // Use the generic method that properly maps model ID to endpoint
            const generationId = await generateImageGeneric(selectedModel.id, {
                prompt: currentPrompt,
                aspect_ratio: aspectRatio,
                input_urls: uploadedUrls.length > 0 ? uploadedUrls : undefined,
                resolution: resolution,
            });

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
                </div>

                <div className="flex items-center gap-6 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 w-32 sm:w-48">
                        <Minimize2 className="w-3.5 h-3.5 text-white/20" />
                        <Slider
                            value={gridSize}
                            onValueChange={setGridSize}
                            max={800}
                            min={200}
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
                    <div className="aspect-square rounded-[32px] glass flex items-center justify-center">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 animate-spin text-[#6F00FF] mx-auto mb-4" />
                            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
                                {language === 'ru' ? 'Генерация...' : 'Generating...'}
                            </p>
                        </div>
                    </div>
                )}
                {imageGenerations.map((gen) => {
                    const imageUrl = gen.result_assets?.[0]?.url;
                    const isProcessing = gen.status === 'processing' || gen.status === 'queued';

                    return (
                        <div key={gen.id} className="flex flex-col gap-4">
                            <div
                                className="relative group rounded-[32px] overflow-hidden glass transition-all aspect-square cursor-pointer border border-white/5 hover:border-white/20 shadow-xl"
                                onClick={() => !isProcessing && setSelectedImage(gen)}
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
                                ) : imageUrl ? (
                                    <>
                                        <img
                                            src={imageUrl}
                                            alt={gen.prompt}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                                            <p className="text-sm font-medium line-clamp-2 text-white/90 leading-relaxed">
                                                {gen.prompt}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                                        <ImageIcon className="w-8 h-8 text-white/20" />
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
                                <span>{t('drag.hint')}</span>
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
                                        {imageModels.map((m) => (
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
                                    value={resolution}
                                    onValueChange={(v) => {
                                        setResolution(v);
                                        setOpenDropdown(null);
                                    }}
                                    open={openDropdown === 'resolution'}
                                    onOpenChange={(open) =>
                                        setOpenDropdown(open ? 'resolution' : null)
                                    }
                                >
                                    <SelectTrigger className="w-fit min-w-[70px] h-10 bg-white/5 border-none rounded-2xl px-4 text-xs font-bold gap-3 hover:bg-white/10 transition-colors uppercase tracking-widest">
                                        <div className="flex items-center gap-3">
                                            <DiamondIcon className="w-4 h-4 text-white" />
                                            <span className="text-white">{resolution}</span>
                                        </div>
                                        <VisuallyHidden>
                                            <SelectValue />
                                        </VisuallyHidden>
                                    </SelectTrigger>

                                    <SelectContent
                                        className="bg-[#0A0A0A]/95 backdrop-blur-xl border-white/10 rounded-2xl p-2"
                                        align="start"
                                    >
                                        {availableResolutions.map((r) => (
                                            <SelectItem
                                                key={r.id}
                                                value={r.id}
                                                className="rounded-xl py-2.5 font-medium uppercase tracking-widest"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <DiamondIcon className="w-3.5 h-3.5 text-white/40" />
                                                    {r.name}
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
                                        {selectedModel?.credits_cost || 10}
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

            <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
                <DialogContent
                    className="fixed inset-0 w-screen h-screen max-w-none max-h-none p-0 rounded-none border-none bg-transparent"
                    showCloseButton={false}
                >
                    <VisuallyHidden>
                        <DialogTitle>Image Details</DialogTitle>
                    </VisuallyHidden>
                    {selectedImage && (
                        <div className="flex h-full w-full">
                            <div
                                className="flex-1 bg-black/80 backdrop-blur-xl flex items-center justify-center p-8 relative cursor-pointer"
                                onClick={() => setSelectedImage(null)}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedImage(null);
                                    }}
                                    className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>

                                <img
                                    src={selectedImage.result_assets?.[0]?.url || ''}
                                    alt=""
                                    className="max-w-full max-h-full w-auto h-auto object-contain rounded-2xl shadow-2xl"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>

                            <div className="w-[320px] h-full bg-[#0A0A0B] border-l border-white/10 flex flex-col overflow-hidden">
                                <div className="flex-1 overflow-y-auto p-6 space-y-10">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2 text-white/50">
                                                <Sparkles className="w-4 h-4" />
                                                <span className="text-xs font-semibold uppercase tracking-wider">
                                                    {language === 'ru' ? 'Промпт' : 'Prompt'}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(
                                                        selectedImage.prompt
                                                    );
                                                    toast.success(
                                                        language === 'ru' ? 'Скопировано' : 'Copied'
                                                    );
                                                }}
                                                className="px-3 py-1 text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white/70"
                                            >
                                                {language === 'ru' ? 'Копировать' : 'Copy'}
                                            </button>
                                        </div>
                                        <p className="text-sm text-white/90 leading-relaxed font-medium">
                                            {selectedImage.prompt}
                                        </p>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            onClick={() => setShowMoreInfo(!showMoreInfo)}
                                            className="flex items-center justify-between w-full text-white/50 mb-6"
                                        >
                                            <div className="flex items-center gap-2">
                                                <ImageIcon className="w-4 h-4" />
                                                <span className="text-xs font-semibold uppercase tracking-wider">
                                                    {language === 'ru'
                                                        ? 'Информация'
                                                        : 'Information'}
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
                                                        {selectedImage.model}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-white/40">
                                                        {language === 'ru'
                                                            ? 'Изображения'
                                                            : 'Images'}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                                                            <img
                                                                src={
                                                                    selectedImage.result_assets?.[0]
                                                                        ?.url || ''
                                                                }
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
                                                        2112x2016
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-white/40">
                                                        {language === 'ru' ? 'Создано' : 'Created'}
                                                    </span>
                                                    <span className="text-sm font-bold text-white/90">
                                                        {new Date(
                                                            selectedImage.created_at
                                                        ).toLocaleDateString(
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

                                <div className="p-6 border-t border-white/10 space-y-4">
                                    <button
                                        onClick={() => {
                                            router.push(
                                                `/app/create/video?image=${encodeURIComponent(
                                                    selectedImage.result_assets?.[0]?.url || ''
                                                )}`
                                            );
                                        }}
                                        className="w-full py-4 rounded-2xl bg-[#6F00FF] hover:bg-[#7F00FF] text-white font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-[0_0_30px_rgba(111,0,255,0.2)]"
                                    >
                                        <Play className="w-4 h-4 fill-white text-white" />
                                        {language === 'ru' ? 'Анимировать' : 'Animate'}
                                    </button>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => {
                                                router.push(
                                                    `/app/tools/enhance?image=${encodeURIComponent(
                                                        selectedImage.result_assets?.[0]?.url || ''
                                                    )}`
                                                );
                                            }}
                                            className="py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold flex items-center justify-center gap-2.5 text-xs transition-all border border-white/5"
                                        >
                                            <Wand2 className="w-4 h-4 text-white" />
                                            {language === 'ru' ? 'Улучшить' : 'Upscale'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleRemix(selectedImage);
                                                setSelectedImage(null);
                                            }}
                                            className="py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold flex items-center justify-center gap-2.5 text-xs transition-all border border-white/5"
                                        >
                                            <RefreshCw className="w-4 h-4 text-white" />
                                            {language === 'ru' ? 'Переделать' : 'Remake'}
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href =
                                                    selectedImage.result_assets?.[0]?.url || '';
                                                link.download = 'generated-image.png';
                                                link.click();
                                                toast.success(
                                                    language === 'ru'
                                                        ? 'Загрузка начата'
                                                        : 'Download started'
                                                );
                                            }}
                                            className="flex-1 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold flex items-center justify-center gap-2.5 text-xs transition-all border border-white/5"
                                        >
                                            <Download className="w-4 h-4 text-white" />
                                            {language === 'ru' ? 'Скачать' : 'Download'}
                                        </button>
                                        <button
                                            onClick={() => toggleLike(selectedImage.id)}
                                            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all border border-white/5 group active:scale-90"
                                        >
                                            <Heart className="w-5 h-5 transition-colors text-white/40 group-hover:text-white" />
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
