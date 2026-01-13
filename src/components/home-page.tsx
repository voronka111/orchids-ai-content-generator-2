'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Video, Music, Eraser, Wand2, Expand, Paintbrush } from 'lucide-react';

import { useLanguage } from '@/lib/language-context';
import { CreateCard, ToolCard, TypewriterTitle } from '@/components/home';

type GenerationType = 'image' | 'video' | 'audio';

export function HomePage() {
    const router = useRouter();
    const { t } = useLanguage();

    const phrases = ['смешную картинку', 'видео из фото', 'песню про друзей'];

    const handleGenerate = (prompt: string, type: GenerationType) => {
        router.push(`/app/create/${type}?prompt=${encodeURIComponent(prompt)}`);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-16">
            <section className="relative text-left pt-8 pb-4 overflow-visible">
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

            <section>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <CreateCard
                        icon={ImageIcon}
                        title={t('type.image')}
                        subtitle={t('type.image.sub')}
                        href="/app/create/image"
                        image="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop"
                    />
                    <CreateCard
                        icon={Video}
                        title={t('type.video')}
                        subtitle={t('type.video.sub')}
                        href="/app/create/video"
                        image="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&h=400&fit=crop"
                    />
                    <CreateCard
                        icon={Music}
                        title={t('type.audio')}
                        subtitle={t('type.audio.sub')}
                        href="/app/create/audio"
                        image="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=400&fit=crop"
                    />
                </div>
            </section>

            <section>
                <div className="mb-6">
                    <h2 className="text-xl font-semibold">{t('section.edit')}</h2>
                    <p className="text-sm text-muted-foreground">{t('section.edit.sub')}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <ToolCard
                        icon={Eraser}
                        title={t('edit.removeBg')}
                        subtitle="Remove background instantly"
                        href="/app/tools/remove-bg"
                    />
                    <ToolCard
                        icon={Wand2}
                        title={t('edit.enhance')}
                        subtitle="Upscale and sharpen details"
                        href="/app/tools/enhance"
                    />
                    <ToolCard
                        icon={Expand}
                        title={t('edit.expand')}
                        subtitle="Extend image boundaries"
                        href="/app/tools/expand"
                    />
                    <ToolCard
                        icon={Paintbrush}
                        title={t('edit.inpaint')}
                        subtitle="Edit specific parts with AI"
                        href="/app/tools/inpaint"
                    />
                </div>
            </section>
        </div>
    );
}
