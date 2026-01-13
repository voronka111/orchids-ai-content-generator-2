'use client';

import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Folder, Maximize2, Minimize2 } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { useGenerationStore, Generation } from '@/stores/generation-store';
import { Slider } from '@/components/ui/slider';
import {
    LibrarySidebar,
    MediaCard,
    SelectionActionBar,
    UpgradeModal,
    type CategoryType,
    type FolderType,
} from '@/components/library';

export function LibraryPage() {
    const { language } = useLanguage();

    // Store
    const { generations } = useGenerationStore();

    // Local state
    const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
    const [gridSize, setGridSize] = useState([300]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [folders, setFolders] = useState<FolderType[]>([
        { id: '1', name: language === 'ru' ? 'Проект А' : 'Project A', count: 12 },
        { id: '2', name: language === 'ru' ? 'Для соцсетей' : 'For Socials', count: 5 },
    ]);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const filteredGenerations = useMemo(() => {
        return generations.filter((g) => {
            if (activeCategory === 'all') return true;
            if (activeCategory === 'favorites') return false;
            if (activeCategory === 'image') return g.type === 'image';
            if (activeCategory === 'video') return g.type === 'video';
            if (activeCategory === 'audio') return g.type === 'audio';
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

    const counts = {
        all: generations.length,
        favorites: 0,
        image: generations.filter((g) => g.type === 'image').length,
        video: generations.filter((g) => g.type === 'video').length,
        audio: generations.filter((g) => g.type === 'audio').length,
    };

    const getCategoryLabel = () => {
        const labels: Record<CategoryType, string> = {
            all: language === 'ru' ? 'Библиотека' : 'Library',
            favorites: language === 'ru' ? 'Избранное' : 'Favorites',
            image: language === 'ru' ? 'Изображения' : 'Images',
            video: language === 'ru' ? 'Видео' : 'Video',
            audio: language === 'ru' ? 'Аудио' : 'Audio',
            'face-swap': language === 'ru' ? 'Замена лица' : 'Face Swap',
            stylist: language === 'ru' ? 'Стилист' : 'Stylist',
            relight: language === 'ru' ? 'Освещение' : 'Relight',
        };
        return labels[activeCategory];
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
                <LibrarySidebar
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                    folders={folders}
                    onAddFolder={handleAddFolder}
                    counts={counts}
                />

                {/* Main Content */}
                <main className="flex-1 space-y-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <h1 className="text-3xl font-black uppercase tracking-tight">
                            {getCategoryLabel()}
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
                                            <MediaCard
                                                key={gen.id}
                                                generation={gen}
                                                isSelected={selectedIds.includes(gen.id)}
                                                onToggleSelect={() => toggleSelect(gen.id)}
                                            />
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
                    <SelectionActionBar
                        selectedCount={selectedIds.length}
                        onClear={() => setSelectedIds([])}
                    />
                )}
            </AnimatePresence>

            {/* Upgrade Modal */}
            <UpgradeModal open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen} />
        </div>
    );
}
