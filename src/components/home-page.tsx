'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Music, Play } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { useLanguage } from '@/lib/language-context';
import { TypewriterTitle } from '@/components/home';

const imageModels = [
    {
        id: 'grok',
        name: 'Grok Imagine',
        subtitle: 'Быстрая генерация',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
        href: '/app/create/image?model=grok'
    },
    {
        id: 'openai',
        name: 'OpenAI 4o',
        subtitle: 'Стабильный результат',
        image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80',
        href: '/app/create/image?model=openai'
    },
    {
        id: 'nano',
        name: 'Nano Banana Pro',
        subtitle: 'Максимальное качество',
        image: 'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=800&q=80',
        href: '/app/create/image?model=nano'
    }
];

const videoModels = [
    {
        id: 'grok-video',
        name: 'Grok Imagine',
        subtitle: 'Быстрое видео',
        image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80',
        video: 'https://cdn.pixabay.com/vimeo/327334469/mountains-23435.mp4?width=640&hash=8a9a5f4a1c5b4e3f8a9a5f4a1c5b4e3f8a9a5f4a',
        href: '/app/create/video?model=grok'
    },
    {
        id: 'wan',
        name: 'WAN 2.2',
        subtitle: 'Баланс качества',
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
        video: 'https://cdn.pixabay.com/vimeo/327334469/mountains-23435.mp4?width=640&hash=8a9a5f4a1c5b4e3f8a9a5f4a1c5b4e3f8a9a5f4a',
        href: '/app/create/video?model=wan'
    },
    {
        id: 'kling',
        name: 'Kling 2.6',
        subtitle: 'Кинематографичная анимация',
        image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
        video: 'https://cdn.pixabay.com/vimeo/327334469/mountains-23435.mp4?width=640&hash=8a9a5f4a1c5b4e3f8a9a5f4a1c5b4e3f8a9a5f4a',
        href: '/app/create/video?model=kling'
    }
];

const audioModels = [
    {
        id: 'create-song',
        name: 'Создай песню',
        subtitle: 'Твой текст, любой стиль',
        image: 'https://images.unsplash.com/photo-1514525253344-99a42999d226?w=800&q=80',
        href: '/app/create/audio'
    },
    {
        id: 'example-1',
        name: 'Neon Dreams',
        subtitle: 'Synthwave / 80s',
        image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&q=80',
        href: '/app/create/audio'
    },
    {
        id: 'example-2',
        name: 'Summer Breeze',
        subtitle: 'Lo-fi / Chill',
        image: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=800&q=80',
        href: '/app/create/audio'
    }
];

function ModelCard({ model, type }: { model: any, type: 'image' | 'video' | 'audio' }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link href={model.href}>
            <motion.div 
                className="relative aspect-[16/10] rounded-2xl overflow-hidden group transition-all duration-500"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {type === 'video' && isHovered ? (
                    <video 
                        src={model.video} 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <img 
                        src={model.image} 
                        alt={model.name} 
                        className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
                    />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                
                <div className="absolute bottom-5 left-5 right-5">
                    <h3 className="text-xl font-bold text-white mb-0.5">{model.name}</h3>
                    <p className="text-sm font-medium text-white/70">{model.subtitle}</p>
                </div>

                {type === 'video' && !isHovered && (
                    <div className="absolute top-4 right-4">
                        <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <Play className="w-4 h-4 fill-white text-white translate-x-0.5" />
                        </div>
                    </div>
                )}
            </motion.div>
        </Link>
    );
}

function ToolCardWithHover({ title, subtitle, image, hoverImage, href }: { title: string, subtitle: string, image: string, hoverImage: string, href: string }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link href={href}>
            <motion.div 
                className="relative aspect-[16/10] rounded-2xl overflow-hidden group cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <img 
                    src={isHovered ? hoverImage : image} 
                    alt={title} 
                    className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                    <h3 className="text-xl font-bold text-white mb-0.5">{title}</h3>
                    <p className="text-sm font-medium text-white/70">{subtitle}</p>
                </div>
            </motion.div>
        </Link>
    );
}

export function HomePage() {
    const { t } = useLanguage();
    const phrases = ['смешную картинку', 'видео из фото', 'песню про друзей'];

    return (
        <div className="max-w-6xl mx-auto space-y-20 pb-20">
            <section className="relative text-left pt-8 pb-4">
                <div className="relative z-10">
                    <TypewriterTitle phrases={phrases} prefix="Сделай" />
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground"
                    >
                        {t('home.subtitle')}
                    </motion.p>
                </div>
            </section>

            {/* Изображение Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-[#6F00FF] rounded-full" />
                    <h2 className="text-2xl font-bold">Изображение</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {imageModels.map(model => (
                        <ModelCard key={model.id} model={model} type="image" />
                    ))}
                </div>
            </section>

            {/* Видео Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-[#FF3D00] rounded-full" />
                    <h2 className="text-2xl font-bold">Видео</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {videoModels.map(model => (
                        <ModelCard key={model.id} model={model} type="video" />
                    ))}
                </div>
            </section>

            {/* Аудио Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-[#00C853] rounded-full" />
                    <h2 className="text-2xl font-bold">Аудио</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {audioModels.map(model => (
                        <ModelCard key={model.id} model={model} type="audio" />
                    ))}
                </div>
            </section>

            {/* Редактировать Section */}
            <section className="space-y-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold">Редактировать</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <ToolCardWithHover 
                        title="Удалить фон"
                        subtitle="Идеально чисто"
                        image="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/010102a2-9a78-497c-a40c-16883620b037/removebg-1768346852348.png?width=8000&height=8000&resize=contain"
                        hoverImage="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/010102a2-9a78-497c-a40c-16883620b037/removebg_hover-1768346852348.png?width=8000&height=8000&resize=contain"
                        href="/app/tools/remove-bg"
                    />
                    <ToolCardWithHover 
                        title="Улучшить"
                        subtitle="Детализация и четкость"
                        image="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/010102a2-9a78-497c-a40c-16883620b037/upscale-1768346852348.png?width=8000&height=8000&resize=contain"
                        hoverImage="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/010102a2-9a78-497c-a40c-16883620b037/upscale_hover-1768346852404.png?width=8000&height=8000&resize=contain"
                        href="/app/tools/enhance"
                    />
                    <ToolCardWithHover 
                        title="Дорисовать"
                        subtitle="Расширение границ"
                        image="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/010102a2-9a78-497c-a40c-16883620b037/expand-1768346852352.png?width=8000&height=8000&resize=contain"
                        hoverImage="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/010102a2-9a78-497c-a40c-16883620b037/expand_hover-1768346852354.png?width=8000&height=8000&resize=contain"
                        href="/app/tools/expand"
                    />
                </div>
            </section>
        </div>
    );
}
