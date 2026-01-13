'use client';

import {
    Heart,
    Folder,
    Image as ImageIcon,
    Video,
    Music,
    Smile,
    Palette,
    Sun,
    Plus,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export type CategoryType =
    | 'all'
    | 'image'
    | 'video'
    | 'audio'
    | 'face-swap'
    | 'stylist'
    | 'relight'
    | 'favorites';

export interface FolderType {
    id: string;
    name: string;
    count: number;
}

interface LibrarySidebarProps {
    activeCategory: CategoryType;
    onCategoryChange: (category: CategoryType) => void;
    folders: FolderType[];
    onAddFolder: () => void;
    counts: {
        all: number;
        favorites: number;
        image: number;
        video: number;
        audio: number;
    };
}

export function LibrarySidebar({
    activeCategory,
    onCategoryChange,
    folders,
    onAddFolder,
    counts,
}: LibrarySidebarProps) {
    const { language } = useLanguage();

    const categories = [
        {
            id: 'all' as const,
            label: language === 'ru' ? 'Библиотека' : 'Library',
            icon: Folder,
            count: counts.all,
        },
        {
            id: 'favorites' as const,
            label: language === 'ru' ? 'Избранное' : 'Favorites',
            icon: Heart,
            count: counts.favorites,
        },
    ];

    const tools = [
        {
            id: 'image' as const,
            label: language === 'ru' ? 'Изображения' : 'Images',
            icon: ImageIcon,
            count: counts.image,
        },
        {
            id: 'video' as const,
            label: language === 'ru' ? 'Видео' : 'Video',
            icon: Video,
            count: counts.video,
        },
        {
            id: 'audio' as const,
            label: language === 'ru' ? 'Аудио' : 'Audio',
            icon: Music,
            count: counts.audio,
        },
    ];

    const apps = [
        {
            id: 'face-swap' as const,
            label: language === 'ru' ? 'Замена лица' : 'Face Swap',
            icon: Smile,
            count: 0,
        },
        {
            id: 'stylist' as const,
            label: language === 'ru' ? 'Стилист' : 'Stylist',
            icon: Palette,
            count: 0,
        },
        {
            id: 'relight' as const,
            label: language === 'ru' ? 'Освещение' : 'Relight',
            icon: Sun,
            count: 0,
        },
    ];

    const renderCategoryButton = (
        id: CategoryType,
        label: string,
        Icon: typeof Folder,
        count: number
    ) => (
        <button
            key={id}
            onClick={() => onCategoryChange(id)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                activeCategory === id
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
        >
            <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${activeCategory === id ? 'text-[#6F00FF]' : ''}`} />
                <span className="text-sm font-medium">{label}</span>
            </div>
            <span className="text-[10px] font-bold opacity-40">{count}</span>
        </button>
    );

    return (
        <aside className="w-full lg:w-64 shrink-0 space-y-8">
            <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4 px-3">
                    {language === 'ru' ? 'Обзор' : 'Overview'}
                </h2>
                <div className="space-y-1">
                    {categories.map((cat) =>
                        renderCategoryButton(cat.id, cat.label, cat.icon, cat.count)
                    )}
                </div>
            </div>

            <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4 px-3">
                    {language === 'ru' ? 'Инструменты' : 'Tools'}
                </h2>
                <div className="space-y-1">
                    {tools.map((tool) =>
                        renderCategoryButton(tool.id, tool.label, tool.icon, tool.count)
                    )}
                </div>
            </div>

            <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4 px-3">
                    {language === 'ru' ? 'Приложения' : 'Apps'}
                </h2>
                <div className="space-y-1">
                    {apps.map((app) => renderCategoryButton(app.id, app.label, app.icon, app.count))}
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between px-3 mb-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                        {language === 'ru' ? 'Моё' : 'Mine'}
                    </h2>
                    <button
                        onClick={onAddFolder}
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
                            <span className="text-[10px] font-bold opacity-40">{folder.count}</span>
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    );
}
