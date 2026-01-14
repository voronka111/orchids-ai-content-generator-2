'use client';

import { Plus, Loader2, Zap } from 'lucide-react';
import { Model } from '@/stores/models-store';
import { UploadedImage } from '@/types/generation';
import { useLanguage } from '@/lib/language-context';
import { UploadedImagesPreview } from './UploadedImagesPreview';
import { ModelSelector } from './ModelSelector';
import { AspectRatioSelector } from './AspectRatioSelector';
import { ResolutionSelector } from './ResolutionSelector';
import { AspectRatioOption } from '@/types/generation';

interface ResolutionOption {
    id: string;
    name: string;
}

interface ImageGenerationBarProps {
    prompt: string;
    onPromptChange: (value: string) => void;
    uploadedImages: UploadedImage[];
    onRemoveImage: (id: string) => void;
    onOpenFilePicker: () => void;
    isDragging: boolean;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent) => void;
    models: Model[];
    selectedModelId: string;
    onModelChange: (value: string) => void;
    aspectRatios: AspectRatioOption[];
    aspectRatio: string;
    onAspectRatioChange: (value: string) => void;
    resolutions: ResolutionOption[];
    resolution: string;
    onResolutionChange: (value: string) => void;
    creditsCost: number;
    isGenerating: boolean;
    onGenerate: () => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImageGenerationBar({
    prompt,
    onPromptChange,
    uploadedImages,
    onRemoveImage,
    onOpenFilePicker,
    isDragging,
    onDragOver,
    onDragLeave,
    onDrop,
    models,
    selectedModelId,
    onModelChange,
    aspectRatios,
    aspectRatio,
    onAspectRatioChange,
    resolutions,
    resolution,
    onResolutionChange,
    creditsCost,
    isGenerating,
    onGenerate,
    fileInputRef,
    onFileInputChange,
}: ImageGenerationBarProps) {
    const { t, language } = useLanguage();

    return (
        <div className="fixed bottom-0 md:bottom-6 left-0 right-0 z-40 flex justify-center pointer-events-none px-0 md:px-6 mb-[64px] md:mb-0">
            <div className="w-full max-w-2xl pointer-events-auto">
                <div
                    className={`relative rounded-t-[32px] md:rounded-[32px] glass p-4 transition-all ${
                        isDragging
                            ? 'border-[#6F00FF] border-2 border-dashed shadow-[0_0_50px_rgba(111,0,255,0.2)]'
                            : 'border-white/10 md:border border-b-0 md:border-b shadow-2xl'
                    }`}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    {uploadedImages.length > 0 && (
                        <div className="mb-4">
                            <UploadedImagesPreview images={uploadedImages} onRemove={onRemoveImage} />
                        </div>
                    )}

                    <textarea
                        value={prompt}
                        onChange={(e) => onPromptChange(e.target.value)}
                        placeholder={t('prompt.placeholder') + (language === 'ru' ? ' или приложите изображение' : ' or attach an image')}
                        className="w-full bg-transparent resize-none outline-none text-white placeholder:text-white/20 min-h-[44px] font-medium text-sm mb-4 leading-relaxed"
                        rows={1}
                    />

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={onOpenFilePicker}
                                className="flex items-center justify-center text-white/40 hover:text-white transition-colors w-10 h-10 rounded-full bg-white/5 border border-white/10"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                            <ModelSelector
                                models={models}
                                value={selectedModelId}
                                onChange={onModelChange}
                            />
                            <AspectRatioSelector
                                options={aspectRatios}
                                value={aspectRatio}
                                onChange={onAspectRatioChange}
                            />
                            <ResolutionSelector
                                options={resolutions}
                                value={resolution}
                                onChange={onResolutionChange}
                            />
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="text-sm text-muted-foreground hidden sm:block">
                                <span className="text-[#FFDC74] font-mono flex items-center gap-2 font-black">
                                    <Zap className="w-4 h-4 fill-current" />
                                    {creditsCost}
                                </span>
                            </div>
                            <button
                                onClick={onGenerate}
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
                        onChange={onFileInputChange}
                    />
                </div>
            </div>
        </div>
    );
}
