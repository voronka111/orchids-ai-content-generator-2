'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Video as VideoIcon, Music, ArrowRight, Zap, Sparkles, Wand2, Maximize, Eraser, Play } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef } from 'react';

import { useLanguage } from '@/lib/language-context';
import { TypewriterTitle, UnifiedGenerationBar } from '@/components/home';

const TEMPLATES = [
    {
        id: 'product',
        title: 'Карточка товара',
        description: 'Профессиональное фото для маркетплейсов',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
        prompt_ru: 'Предметная съемка дорогих часов на чистом белом фоне, студийное освещение, 8к, высокая детализация',
        prompt_en: 'Product photography of a high-end watch on a clean white background, studio lighting, 8k, highly detailed',
        target: '/app/create/image'
    },
    {
        id: 'remove-object',
        title: 'Убрать объект',
        description: 'Чистый фон без лишних деталей',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
        prompt_ru: 'Чистый пейзаж, широкий угол, убрать лишние объекты, нетронутая природа',
        prompt_en: 'Clean landscape, wide angle, remove unwanted objects, pristine nature',
        target: '/app/create/image'
    },
    {
        id: 'clothes',
        title: 'Поменять одежду',
        description: 'Примерь любой образ за секунды',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
        prompt_ru: 'Модель в роскошном красном шелковом платье, фон улицы Парижа, реалистичное освещение',
        prompt_en: 'Fashion model wearing a luxury red silk dress, Paris street background, realistic lighting',
        target: '/app/create/image'
    },
    {
        id: 'face-swap',
        title: 'Заменить лицо',
        description: 'Реалистичная замена лиц на фото',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
        prompt_ru: 'Кинематографичный портрет человека с высокой детализацией, реалистичная текстура кожи',
        prompt_en: 'Cinematic portrait of a person with highly detailed features, realistic skin texture',
        target: '/app/create/image'
    },
    {
        id: '3d-model',
        title: '3д модель',
        description: 'Объемные персонажи и объекты',
        image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800&q=80',
        prompt_ru: '3D рендер милого робота, изометрический вид, эстетика мягкой игрушки, octane render, пастельные тона',
        prompt_en: '3D render of a cute robot character, isometric view, soft toy aesthetic, octane render, pastel colors',
        target: '/app/create/image'
    },
    {
        id: 'ghibli',
        title: 'Студия Гибли',
        description: 'Атмосфера легендарного аниме',
        image: 'https://images.unsplash.com/photo-1578632738908-4521c726eeb4?w=800&q=80',
        prompt_ru: 'Красивый пейзаж в стиле Студии Гибли, пышные зеленые холмы, синее небо с пушистыми белыми облаками, эстетика аниме',
        prompt_en: 'Beautiful landscape in Studio Ghibli style, lush green hills, blue sky with fluffy white clouds, anime aesthetic',
        target: '/app/create/image'
    },
    {
        id: 'animate',
        title: 'Анимировать фото',
        description: 'Оживи свои воспоминания',
        image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
        prompt_ru: 'Кинематографичное движение водопада в густом лесу, текущая вода, движущийся туман, высокое качество видео',
        prompt_en: 'Cinematic movement of a waterfall in a lush forest, flowing water, moving mist, high quality video',
        target: '/app/create/video'
    }
];

const AUDIO_STYLES = [
    {
        id: 'makan',
        title: 'Макан',
        description: 'Глубокий вайб, качающий бит',
        image: 'https://avatars.yandex.net/get-music-content/8100650/e0f074d3.a.24354316-1/400x400',
        style: 'Russian rap, deep masculine voice, melodic, dark atmospheric beat, emotional lyrics',
        target: '/app/create/audio'
    },
    {
        id: 'kadysheva',
        title: 'Кадышева',
        description: 'Народные мотивы и душевность',
        image: 'https://avatars.yandex.net/get-music-content/163479/f0f8d836.a.3426214-1/400x400',
        style: 'Russian folk pop, upbeat, accordion, energetic female vocals, traditional melodic structure',
        target: '/app/create/audio'
    },
    {
        id: 'vitas',
        title: 'Витас',
        description: 'Космический вокал и опера',
        image: 'https://avatars.yandex.net/get-music-content/10530739/5319808a.a.28636750-1/400x400',
        style: 'Operatic pop, high pitch male vocals, falsetto, electronic dance elements, dramatic atmosphere',
        target: '/app/create/audio'
    },
    {
        id: 'molchat-doma',
        title: 'Молчат Дома',
        description: 'Пост-панк и эстетика панелек',
        image: 'https://avatars.yandex.net/get-music-content/11183141/008f168f.a.29088676-1/400x400',
        style: 'Post-punk, Sovietwave, dark synth, lo-fi aesthetic, melancholic vocals, 80s drum machine',
        target: '/app/create/audio'
    }
];

const TOOLS = [
    {
        id: 'remove-bg',
        title: 'Удалить фон',
        description: 'Идеально чисто',
        image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/010102a2-9a78-497c-a40c-16883620b037/removebg-1768346852348.png?width=8000&height=8000&resize=contain',
        hoverImage: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/010102a2-9a78-497c-a40c-16883620b037/removebg_hover-1768346852348.png?width=8000&height=8000&resize=contain',
        href: '/app/tools/remove-bg'
    },
    {
        id: 'enhance',
        title: 'Улучшить',
        description: 'Детализация и четкость',
        image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/010102a2-9a78-497c-a40c-16883620b037/upscale-1768346852348.png?width=8000&height=8000&resize=contain',
        hoverImage: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/010102a2-9a78-497c-a40c-16883620b037/upscale_hover-1768346852404.png?width=8000&height=8000&resize=contain',
        href: '/app/tools/enhance'
    },
    {
        id: 'expand',
        title: 'Дорисовать',
        description: 'Расширение границ',
        image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/010102a2-9a78-497c-a40c-16883620b037/expand-1768346852352.png?width=8000&height=8000&resize=contain',
        hoverImage: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/010102a2-9a78-497c-a40c-16883620b037/expand_hover-1768346852354.png?width=8000&height=8000&resize=contain',
        href: '/app/tools/expand'
    }
];

function HorizontalScroll({ children }: { children: React.ReactNode }) {
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <div className="relative group">
            <div 
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory scroll-smooth"
            >
                {children}
            </div>
        </div>
    );
}

function TemplateCard({ item }: { item: typeof TEMPLATES[0] }) {
    const { language } = useLanguage();
    const prompt = language === 'ru' ? item.prompt_ru : item.prompt_en;
    
    return (
        <Link 
            href={`${item.target}?prompt=${encodeURIComponent(prompt)}`}
            className="flex-shrink-0 w-[280px] snap-start group"
        >
            <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3 relative bg-white/5">
                <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80"
                />
            </div>
            <h4 className="font-bold text-base mb-1">{item.title}</h4>
            <p className="text-xs text-white/40 line-clamp-2">{item.description}</p>
        </Link>
    );
}

function AudioStyleCard({ item }: { item: typeof AUDIO_STYLES[0] }) {
    return (
        <Link 
            href={`${item.target}?style=${encodeURIComponent(item.style)}`}
            className="flex-shrink-0 w-[200px] snap-start group"
        >
            <div className="aspect-square rounded-xl overflow-hidden mb-3 relative bg-white/5">
                <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80"
                />
            </div>
            <div className="text-left px-1">
                <h4 className="font-bold text-base mb-0.5">{item.title}</h4>
                <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">{item.description}</p>
            </div>
        </Link>
    );
}

function ToolCardSquare({ item }: { item: any }) {
    const [isHovered, setIsHovered] = useState(false);
    const { t } = useLanguage();

    return (
        <Link 
            href={item.href}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="flex-shrink-0 w-[180px] snap-start group"
        >
            <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-[#1A1A1A] border border-white/5 relative">
                {item.badge && (
                    <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full bg-yellow-500 text-black text-[8px] font-black uppercase tracking-widest shadow-lg">
                        {item.badge}
                    </div>
                )}
                <img 
                    src={isHovered ? item.hoverImage : item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-opacity duration-300"
                />
            </div>
            <div className="px-1">
                <h4 className="font-bold text-base mb-0.5">{item.title}</h4>
                <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">{item.description}</p>
            </div>
        </Link>
    );
}

export function HomePage() {
    const { t, language } = useLanguage();
    const phrases = ['смешную картинку', 'видео из фото', 'песню про друзей'];

    const TOOLS_WITH_NANO = [
        {
            id: 'nano',
            title: 'Nano Banana',
            description: 'Лучшая генеративная модель',
            image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/010102a2-9a78-497c-a40c-16883620b037/banana-apple-manzano-exoticfruitscouk-905674-1768392693560.jpg?width=8000&height=8000&resize=contain',
            hoverImage: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/010102a2-9a78-497c-a40c-16883620b037/banana-apple-manzano-exoticfruitscouk-905674-1768392693560.jpg?width=8000&height=8000&resize=contain',
            href: '/app/create/image?model=nano',
            badge: 'ТОП'
        },
        ...TOOLS
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-24 pb-32">
            {/* Hero Section */}
            <section className="pt-12 text-center space-y-12">
                <div className="space-y-4">
                    <TypewriterTitle phrases={phrases} prefix="Сделай" />
                </div>

                <UnifiedGenerationBar />
            </section>

            {/* Инструменты */}
            <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-bold uppercase tracking-wider text-white/40">Инструменты</h2>
                </div>
                <HorizontalScroll>
                    {TOOLS_WITH_NANO.map(item => (
                        <ToolCardSquare key={item.id} item={item} />
                    ))}
                </HorizontalScroll>
            </section>

            {/* Чертежи */}
            <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-bold uppercase tracking-wider text-white/40">Чертежи</h2>
                </div>
                <HorizontalScroll>
                    {TEMPLATES.map(item => (
                        <TemplateCard key={item.id} item={item} />
                    ))}
                </HorizontalScroll>
            </section>

            {/* Песня в любом стиле */}
            <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="space-y-1 text-left">
                        <h2 className="text-xl font-bold uppercase tracking-wider text-white/40">Песня в любом стиле</h2>
                        <p className="text-sm text-white/20">Музыка на любой вкус в одно нажатие</p>
                    </div>
                    <Link 
                        href="/app/create/audio"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition-all border border-white/5"
                    >
                        <Music className="w-3.5 h-3.5" />
                        Сделать песню
                    </Link>
                </div>
                <HorizontalScroll>
                    {AUDIO_STYLES.map(item => (
                        <AudioStyleCard key={item.id} item={item} />
                    ))}
                </HorizontalScroll>
            </section>
        </div>
    );
}
