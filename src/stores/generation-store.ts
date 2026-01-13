'use client';

import { create } from 'zustand';
import { api, API_BASE_URL } from '@/api/client';
import { useAuthStore } from './auth-store';

export interface GenerationAsset {
    url: string;
    mime: string;
    size?: number;
}

export interface Generation {
    id: string;
    type: 'image' | 'video' | 'audio';
    model: string;
    status: 'queued' | 'processing' | 'success' | 'failed';
    prompt: string;
    cost_credits: number;
    result_assets?: GenerationAsset[];
    error?: string;
    created_at: string;
    updated_at?: string;
}

interface GenerationState {
    generations: Generation[];
    activePolling: Set<string>;
    isLoading: boolean;
    error: string | null;

    // History pagination
    hasMore: boolean;
    offset: number;

    // Actions
    addGeneration: (generation: Generation) => void;
    updateGeneration: (id: string, updates: Partial<Generation>) => void;
    removeGeneration: (id: string) => void;

    // API methods
    fetchHistory: (reset?: boolean) => Promise<void>;
    pollGenerationStatus: (id: string) => Promise<void>;
    stopPolling: (id: string) => void;
    stopAllPolling: () => void;

    // Generation methods - Image
    generateImageFlux2: (params: Flux2TextToImageParams) => Promise<string | null>;
    generateImageFlux2I2I: (params: Flux2ImageToImageParams) => Promise<string | null>;
    generateImageImagen4Fast: (params: Imagen4Params) => Promise<string | null>;
    generateImageImagen4Ultra: (params: Imagen4Params) => Promise<string | null>;
    generateImageSeedream: (params: SeedreamParams) => Promise<string | null>;
    generateImageNanoBanana: (params: NanoBananaParams) => Promise<string | null>;

    // Generation methods - Video
    generateVideoKling: (params: KlingTextToVideoParams) => Promise<string | null>;
    generateVideoKlingI2V: (params: KlingImageToVideoParams) => Promise<string | null>;
    generateVideoWan: (params: WanParams) => Promise<string | null>;

    // Generation methods - Audio
    generateAudioSuno: (params: SunoParams) => Promise<string | null>;

    // Upload
    uploadImage: (file: File) => Promise<string | null>;
    uploadVideo: (file: File) => Promise<string | null>;
}

export interface Flux2TextToImageParams {
    prompt: string;
    aspect_ratio: '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '3:2' | '2:3' | 'auto';
    resolution: '1K' | '2K';
}

export interface Flux2ImageToImageParams {
    prompt: string;
    input_urls: string[];
    aspect_ratio: '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '3:2' | '2:3' | 'auto';
    resolution: '1K' | '2K';
}

export interface Imagen4Params {
    prompt: string;
    aspect_ratio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
}

export interface SeedreamParams {
    prompt: string;
    aspect_ratio: '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '3:2' | '2:3' | '21:9';
    quality: 'basic' | 'high';
}

export interface NanoBananaParams {
    prompt: string;
    reference_urls?: string[];
    aspect_ratio?: '1:1' | '4:3' | '3:4' | '16:9' | '9:16';
}

export interface KlingTextToVideoParams {
    prompt: string;
    aspect_ratio: '1:1' | '16:9' | '9:16';
    duration: '5' | '10';
    sound: boolean;
}

export interface KlingImageToVideoParams {
    prompt: string;
    image_urls: string[];
    duration: '5' | '10';
    sound: boolean;
}

export interface WanParams {
    prompt: string;
    duration?: '5' | '10' | '15';
    resolution?: '720p' | '1080p';
}

export interface SunoParams {
    prompt: string;
    model: 'V4' | 'V4_5' | 'V4_5PLUS' | 'V4_5ALL' | 'V5';
    custom_mode: boolean;
    instrumental: boolean;
    style?: string;
    title?: string;
    vocal_gender?: 'm' | 'f';
    style_weight?: number;
}

const POLL_INTERVAL = 5000;
const MAX_POLL_ATTEMPTS = 120;

const pollingIntervals = new Map<string, NodeJS.Timeout>();

export const useGenerationStore = create<GenerationState>()((set, get) => ({
    generations: [],
    activePolling: new Set(),
    isLoading: false,
    error: null,
    hasMore: true,
    offset: 0,

    addGeneration: (generation) => {
        set((state) => ({
            generations: [generation, ...state.generations],
        }));
    },

    updateGeneration: (id, updates) => {
        set((state) => ({
            generations: state.generations.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        }));
    },

    removeGeneration: (id) => {
        get().stopPolling(id);
        set((state) => ({
            generations: state.generations.filter((g) => g.id !== id),
        }));
    },

    fetchHistory: async (reset = false) => {
        const { offset, hasMore, isLoading } = get();
        if (isLoading || (!hasMore && !reset)) return;

        const newOffset = reset ? 0 : offset;
        set({ isLoading: true, error: null });

        try {
            const { data, error } = await api.GET('/user/history', {
                params: {
                    query: {
                        limit: '20',
                        offset: String(newOffset),
                    },
                },
            });

            if (error) {
                set({ error: 'Failed to fetch history', isLoading: false });
                return;
            }

            if (data) {
                const historyData = data as {
                    data: Generation[];
                    pagination: { has_more: boolean };
                };

                set((state) => ({
                    generations: reset
                        ? historyData.data
                        : [...state.generations, ...historyData.data],
                    hasMore: historyData.pagination.has_more,
                    offset: newOffset + historyData.data.length,
                    isLoading: false,
                }));
            }
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : 'Network error',
                isLoading: false,
            });
        }
    },

    pollGenerationStatus: async (id: string) => {
        const { activePolling } = get();
        if (activePolling.has(id)) return;

        set((state) => ({
            activePolling: new Set(state.activePolling).add(id),
        }));

        let attempts = 0;

        const poll = async () => {
            attempts++;

            try {
                const { data } = await api.GET('/generations/{id}', {
                    params: { path: { id } },
                });

                if (data) {
                    const genData = data as Generation;
                    get().updateGeneration(id, genData);

                    if (genData.status === 'success' || genData.status === 'failed') {
                        get().stopPolling(id);

                        // Refresh user credits after generation completes
                        useAuthStore.getState().fetchUser();
                        return;
                    }
                }
            } catch {
                // Continue polling on network errors
            }

            if (attempts >= MAX_POLL_ATTEMPTS) {
                get().stopPolling(id);
                get().updateGeneration(id, {
                    status: 'failed',
                    error: 'Polling timeout',
                });
                return;
            }
        };

        // Initial poll
        await poll();

        // Set up interval
        const interval = setInterval(poll, POLL_INTERVAL);
        pollingIntervals.set(id, interval);
    },

    stopPolling: (id: string) => {
        const interval = pollingIntervals.get(id);
        if (interval) {
            clearInterval(interval);
            pollingIntervals.delete(id);
        }
        set((state) => {
            const newPolling = new Set(state.activePolling);
            newPolling.delete(id);
            return { activePolling: newPolling };
        });
    },

    stopAllPolling: () => {
        pollingIntervals.forEach((interval) => clearInterval(interval));
        pollingIntervals.clear();
        set({ activePolling: new Set() });
    },

    // Image generation methods
    generateImageFlux2: async (params) => {
        set({ error: null });
        try {
            const { data, error } = await api.POST('/image/flux-2/text-to-image', {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'image',
                model: 'flux-2-pro',
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    generateImageFlux2I2I: async (params) => {
        set({ error: null });
        try {
            const { data, error } = await api.POST('/image/flux-2/image-to-image', {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'image',
                model: 'flux-2-pro-i2i',
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    generateImageImagen4Fast: async (params) => {
        set({ error: null });
        try {
            const { data, error } = await api.POST('/image/imagen4/fast', {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'image',
                model: 'imagen4-fast',
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    generateImageImagen4Ultra: async (params) => {
        set({ error: null });
        try {
            const { data, error } = await api.POST('/image/imagen4/ultra', {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'image',
                model: 'imagen4-ultra',
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    generateImageSeedream: async (params) => {
        set({ error: null });
        try {
            const { data, error } = await api.POST('/image/seedream/text-to-image', {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'image',
                model: 'seedream-4.5',
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    generateImageNanoBanana: async (params) => {
        set({ error: null });
        try {
            const { data, error } = await api.POST('/image/nano-banana/generate', {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'image',
                model: 'nano-banana-pro',
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    // Video generation methods
    generateVideoKling: async (params) => {
        set({ error: null });
        try {
            const { data, error } = await api.POST('/video/kling/text-to-video', {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'video',
                model: 'kling-2.6',
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    generateVideoKlingI2V: async (params) => {
        set({ error: null });
        try {
            const { data, error } = await api.POST('/video/kling/image-to-video', {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'video',
                model: 'kling-2.6-i2v',
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    generateVideoWan: async (params) => {
        set({ error: null });
        try {
            const { data, error } = await api.POST('/video/wan/text-to-video', {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'video',
                model: 'wan',
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    // Audio generation
    generateAudioSuno: async (params) => {
        set({ error: null });
        try {
            const { data, error } = await api.POST('/audio/suno/generate-music', {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'audio',
                model: 'suno',
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    // Upload methods
    uploadImage: async (file: File) => {
        const token = useAuthStore.getState().token;
        if (!token) {
            set({ error: 'Not authenticated' });
            return null;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE_URL}/upload/image`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                set({ error: 'Upload failed' });
                return null;
            }

            const data = await response.json();
            return data.url as string;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Upload error' });
            return null;
        }
    },

    uploadVideo: async (file: File) => {
        const token = useAuthStore.getState().token;
        if (!token) {
            set({ error: 'Not authenticated' });
            return null;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE_URL}/upload/video`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                set({ error: 'Upload failed' });
                return null;
            }

            const data = await response.json();
            return data.url as string;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Upload error' });
            return null;
        }
    },
}));

// Selectors
export const selectGenerations = (state: GenerationState) => state.generations;
export const selectProcessingGenerations = (state: GenerationState) =>
    state.generations.filter((g) => g.status === 'processing' || g.status === 'queued');
export const selectCompletedGenerations = (state: GenerationState) =>
    state.generations.filter((g) => g.status === 'success');
