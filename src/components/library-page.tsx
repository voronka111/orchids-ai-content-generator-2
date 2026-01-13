'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download,
    Trash2,
    Heart,
    FolderPlus,
    MoreHorizontal,
    Play,
    Pause,
    Image as ImageIcon,
    Video,
    Music,
    Zap,
    Folder,
    Plus,
    Settings2,
    Smile,
    Sun,
    Palette,
    Check,
    X,
    ChevronRight,
    Maximize2,
    Minimize2,
    ExternalLink,
    Loader2,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { useGenerationStore, Generation } from '@/stores/generation-store';
import { toast } from 'sonner';
import { Slider } from '@/components/ui/slider';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';

type CategoryType =
    | 'all'
    | 'image'
    | 'video'
    | 'audio'
    | 'face-swap'
    | 'stylist'
    | 'relight'
    | 'favorites';

interface FolderType {
    id: string;
    name: string;
    count: number;
}

export function LibraryPage() {
    const { language } = useLanguage();

    // Store
    const { generations, fetchHistory, isLoading, hasMore } = useGenerationStore();

    // Local state
    const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
    const [gridSize, setGridSize] = useState([300]); // Smooth grid size
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [folders, setFolders] = useState<FolderType[]>([
        { id: '1', name: language === 'ru' ? 'Проект А' : 'Project A', count: 12 },
        { id: '2', name: language === 'ru' ? 'Для соцсетей' : 'For Socials', count: 5 },
    ]);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [playingAudio, setPlayingAudio] = useState<string | null>(null);

    const filteredGenerations = useMemo(() => {
        return generations.filter((g) => {
            if (activeCategory === 'all') return true;
            if (activeCategory === 'favorites') return false; // TODO: Implement favorites via API
            if (activeCategory === 'image') return g.type === 'image';
            if (activeCategory === 'video') return g.type === 'video';
            if (activeCategory === 'audio') return g.type === 'audio';
            // App categories not yet implemented
            return false;
        });
    }, [generations, activeCategory]);

    const groupedGenerations = useMemo(() => {
        const groups: { [key: string]: Generation[] } = {};
        filteredGenerations.forEach((gen) => {
            const date = new Date(gen.created_at);
            const now = new Date();
            const isToday = date.toDateString() === now.toDateString();
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const isYesterday = date.toDateString() === yesterday.toDateString();

            let label = date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            });
            if (isToday) label = language === 'ru' ? 'Сегодня' : 'Today';
            else if (isYesterday) label = language === 'ru' ? 'Вчера' : 'Yesterday';

            if (!groups[label]) groups[label] = [];
            groups[label].push(gen);
        });
        return Object.entries(groups).sort((a, b) => {
            // Simple sort: Today and Yesterday first, then by date string (could be better but works for now)
            if (a[0] === (language === 'ru' ? 'Сегодня' : 'Today')) return -1;
            if (b[0] === (language === 'ru' ? 'Сегодня' : 'Today')) return 1;
            return 0;
        });
    }, [filteredGenerations, language]);

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleAddFolder = () => {
        if (folders.length >= 3) {
            setIsUpgradeModalOpen(true);
            return;
        }
        const name =
            language === 'ru'
                ? `Новая папка ${folders.length + 1}`
                : `New Folder ${folders.length + 1}`;
        setFolders([...folders, { id: Date.now().toString(), name, count: 0 }]);
    };

    const categories = [
        {
            id: 'all',
            label: language === 'ru' ? 'Библиотека' : 'Library',
            icon: Folder,
            count: generations.length,
        },
        {
            id: 'favorites',
            label: language === 'ru' ? 'Избранное' : 'Favorites',
            icon: Heart,
            count: 0, // TODO: Implement favorites via API
        },
    ];

    const tools = [
        {
            id: 'image',
            label: language === 'ru' ? 'Изображения' : 'Images',
            icon: ImageIcon,
            count: generations.filter((g) => g.type === 'image').length,
        },
        {
            id: 'video',
            label: language === 'ru' ? 'Видео' : 'Video',
            icon: Video,
            count: generations.filter((g) => g.type === 'video').length,
        },
        {
            id: 'audio',
            label: language === 'ru' ? 'Аудио' : 'Audio',
            icon: Music,
            count: generations.filter((g) => g.type === 'audio').length,
        },
    ];

    const apps = [
        {
            id: 'face-swap',
            label: language === 'ru' ? 'Замена лица' : 'Face Swap',
            icon: Smile,
            count: 0,
        },
        {
            id: 'stylist',
            label: language === 'ru' ? 'Стилист' : 'Stylist',
            icon: Palette,
            count: 0,
        },
        { id: 'relight', label: language === 'ru' ? 'Освещение' : 'Relight', icon: Sun, count: 0 },
    ];

    const getMediaPreview = (gen: Generation) => {
        const mediaUrl = gen.result_assets?.[0]?.url;
        const isProcessing = gen.status === 'processing' || gen.status === 'queued';

        if (isProcessing) {
            return (
                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#6F00FF]" />
                </div>
            );
        }

        if (gen.status === 'failed') {
            return (
                <div className="w-full h-full bg-red-500/10 flex items-center justify-center">
                    <X className="w-8 h-8 text-red-500" />
                </div>
            );
        }

        switch (gen.type) {
            case 'image':
                return mediaUrl ? (
                    <img
                        src={mediaUrl}
                        alt={gen.prompt}
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

    return (
        <div className="relative min-h-screen -mt-6 -mx-[14px] sm:-mx-6 px-4 sm:px-8 py-8 overflow-hidden">
            {/* Background Grid */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
                style={{
                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                    backgroundSize: '32px 32px',
                }}
            />

            <div className="relative z-10 flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full lg:w-64 shrink-0 space-y-8">
                    <div>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4 px-3">
                            {language === 'ru' ? 'Обзор' : 'Overview'}
                        </h2>
                        <div className="space-y-1">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id as CategoryType)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                                        activeCategory === cat.id
                                            ? 'bg-white/10 text-white'
                                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <cat.icon
                                            className={`w-4 h-4 ${
                                                activeCategory === cat.id ? 'text-[#6F00FF]' : ''
                                            }`}
                                        />
                                        <span className="text-sm font-medium">{cat.label}</span>
                                    </div>
                                    <span className="text-[10px] font-bold opacity-40">
                                        {cat.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4 px-3">
                            {language === 'ru' ? 'Инструменты' : 'Tools'}
                        </h2>
                        <div className="space-y-1">
                            {tools.map((tool) => (
                                <button
                                    key={tool.id}
                                    onClick={() => setActiveCategory(tool.id as CategoryType)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                                        activeCategory === tool.id
                                            ? 'bg-white/10 text-white'
                                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <tool.icon
                                            className={`w-4 h-4 ${
                                                activeCategory === tool.id ? 'text-[#6F00FF]' : ''
                                            }`}
                                        />
                                        <span className="text-sm font-medium">{tool.label}</span>
                                    </div>
                                    <span className="text-[10px] font-bold opacity-40">
                                        {tool.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4 px-3">
                            {language === 'ru' ? 'Приложения' : 'Apps'}
                        </h2>
                        <div className="space-y-1">
                            {apps.map((app) => (
                                <button
                                    key={app.id}
                                    onClick={() => setActiveCategory(app.id as CategoryType)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                                        activeCategory === app.id
                                            ? 'bg-white/10 text-white'
                                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <app.icon
                                            className={`w-4 h-4 ${
                                                activeCategory === app.id ? 'text-[#6F00FF]' : ''
                                            }`}
                                        />
                                        <span className="text-sm font-medium">{app.label}</span>
                                    </div>
                                    <span className="text-[10px] font-bold opacity-40">
                                        {app.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between px-3 mb-4">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                {language === 'ru' ? 'Моё' : 'Mine'}
                            </h2>
                            <button
                                onClick={handleAddFolder}
                                className="p-1 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div className="space-y-1">
                            {folders.map((folder) => (
                                <button
                                    key={folder.id}
                                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Folder className="w-4 h-4 text-white/20 group-hover:text-white/40" />
                                        <span className="text-sm font-medium">{folder.name}</span>
                                    </div>
                                    <span className="text-[10px] font-bold opacity-40">
                                        {folder.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 space-y-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <h1 className="text-3xl font-black uppercase tracking-tight">
                            {activeCategory === 'all'
                                ? language === 'ru'
                                    ? 'Библиотека'
                                    : 'Library'
                                : activeCategory === 'favorites'
                                ? language === 'ru'
                                    ? 'Избранное'
                                    : 'Favorites'
                                : categories.find((c) => c.id === activeCategory)?.label ||
                                  tools.find((t) => t.id === activeCategory)?.label ||
                                  apps.find((a) => a.id === activeCategory)?.label}
                        </h1>

                        <div className="flex items-center gap-6 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3 w-32 sm:w-48">
                                <Minimize2 className="w-3.5 h-3.5 text-white/20" />
                                <Slider
                                    value={gridSize}
                                    onValueChange={setGridSize}
                                    max={600}
                                    min={150}
                                    step={1}
                                    className="flex-1 cursor-pointer"
                                />
                                <Maximize2 className="w-3.5 h-3.5 text-white/20" />
                            </div>
                        </div>
                    </div>

                    {groupedGenerations.length > 0 ? (
                        <div className="space-y-12">
                            {groupedGenerations.map(([label, items]) => (
                                <div key={label} className="space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-4">
                                        {label}
                                        <div className="h-px flex-1 bg-white/5" />
                                    </h3>

                                    <div
                                        className="grid gap-4 sm:gap-6"
                                        style={{
                                            gridTemplateColumns: `repeat(auto-fill, minmax(${gridSize[0]}px, 1fr))`,
                                        }}
                                    >
                                        {items.map((gen) => (
                                            <motion.div
                                                key={gen.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className={`group relative aspect-square rounded-[24px] overflow-hidden cursor-pointer transition-all duration-300 ${
                                                    selectedIds.includes(gen.id)
                                                        ? 'ring-2 ring-[#6F00FF] ring-offset-4 ring-offset-black scale-[0.98]'
                                                        : 'hover:scale-[1.02]'
                                                }`}
                                                onClick={() => toggleSelect(gen.id)}
                                            >
                                                {gen.type === 'audio' ? (
                                                    <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/[0.02] flex flex-col items-center justify-center p-6 text-center border border-white/5">
                                                        <div className="w-16 h-16 rounded-full bg-[#6F00FF]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                            <Music className="w-8 h-8 text-[#6F00FF]" />
                                                        </div>
                                                        <p className="text-sm font-medium line-clamp-2 mb-2 px-4">
                                                            {gen.prompt}
                                                        </p>
                                                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                                            {new Date(
                                                                gen.created_at
                                                            ).toLocaleDateString(
                                                                language === 'ru'
                                                                    ? 'ru-RU'
                                                                    : 'en-US',
                                                                { day: 'numeric', month: 'short' }
                                                            )}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    getMediaPreview(gen)
                                                )}

                                                {/* Selection Overlay */}
                                                <div
                                                    className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
                                                        selectedIds.includes(gen.id)
                                                            ? 'bg-[#6F00FF] border-[#6F00FF]'
                                                            : 'bg-black/20 border-white/20 opacity-0 group-hover:opacity-100'
                                                    }`}
                                                >
                                                    {selectedIds.includes(gen.id) && (
                                                        <Check className="w-3.5 h-3.5 text-white" />
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                <Folder className="w-8 h-8 text-white/20" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">
                                {language === 'ru' ? 'Тут ничего нет' : 'Nothing here'}
                            </h3>
                            <p className="text-white/40">
                                {language === 'ru'
                                    ? 'Сделайте, чтобы было.'
                                    : 'Create something to see it here.'}
                            </p>
                        </div>
                    )}
                </main>
            </div>

            {/* Action Bar */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
                    >
                        <div className="bg-white text-black rounded-[24px] shadow-2xl px-6 py-4 flex items-center justify-between gap-8 backdrop-blur-xl border border-white/20">
                            <div className="flex items-center gap-4 shrink-0">
                                <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-sm">
                                    {selectedIds.length}
                                </div>
                                <span className="text-sm font-bold uppercase tracking-tight whitespace-nowrap">
                                    {language === 'ru' ? 'Выбрано' : 'Selected'}
                                </span>
                            </div>

                            <div className="h-8 w-px bg-black/10" />

                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                                <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-black/5 transition-colors text-sm font-bold whitespace-nowrap">
                                    <Download className="w-4 h-4" />
                                    {language === 'ru' ? 'Скачать' : 'Download'}
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-black/5 transition-colors text-sm font-bold whitespace-nowrap">
                                    <FolderPlus className="w-4 h-4" />
                                    {language === 'ru' ? 'В папку' : 'To folder'}
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-red-50 text-red-600 transition-colors text-sm font-bold whitespace-nowrap">
                                    <Trash2 className="w-4 h-4" />
                                    {language === 'ru' ? 'Удалить' : 'Delete'}
                                </button>
                            </div>

                            <button
                                onClick={() => setSelectedIds([])}
                                className="p-2 hover:bg-black/5 rounded-full transition-colors shrink-0"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upgrade Modal */}
            <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
                <DialogContent className="bg-[#0A0A0A] border-white/10 text-white rounded-[32px] p-8 max-w-md">
                    <DialogHeader className="items-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-[#6F00FF]/20 flex items-center justify-center mb-6">
                            <Zap className="w-8 h-8 text-[#6F00FF] fill-current" />
                        </div>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight mb-2">
                            {language === 'ru' ? 'Лимит папок исчерпан' : 'Folder limit reached'}
                        </DialogTitle>
                        <DialogDescription className="text-white/60 text-base leading-relaxed">
                            {language === 'ru'
                                ? 'На бесплатном плане можно создавать до 3 папок. Перейдите на Pro, чтобы создавать неограниченное количество папок и лучше организовывать свои проекты.'
                                : 'You can create up to 3 folders on the free plan. Upgrade to Pro for unlimited folders and better organization.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-8 flex-col sm:flex-col gap-3">
                        <button
                            className="w-full py-4 rounded-2xl bg-[#6F00FF] text-white font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(111,0,255,0.3)]"
                            onClick={() => setIsUpgradeModalOpen(false)}
                        >
                            {language === 'ru' ? 'Улучшить план' : 'Upgrade Plan'}
                        </button>
                        <button
                            className="w-full py-4 rounded-2xl bg-white/5 text-white/60 font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-colors"
                            onClick={() => setIsUpgradeModalOpen(false)}
                        >
                            {language === 'ru' ? 'Позже' : 'Maybe later'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
