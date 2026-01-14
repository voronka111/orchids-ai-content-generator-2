'use client';

import { create } from 'zustand';
import { api } from '@/api/client';
import { Generation } from './generation-store';

export interface Collection {
    id: string;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
    count?: number; // Added locally for UI convenience
    items?: Generation[]; // Populated when fetching a specific collection
}

// Helper to map backend collection data to our frontend interface
const mapCollection = (data: any, fallbackName?: string): Collection => {
    if (!data) return {
        id: '',
        name: fallbackName || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        count: 0,
        items: []
    };

    return {
        id: String(data.id || data._id || data.uuid || Math.random().toString(36).substring(7)),
        name: data.name || data.title || data.label || fallbackName || '',
        description: data.description || '',
        created_at: data.created_at || data.createdAt || new Date().toISOString(),
        updated_at: data.updated_at || data.updatedAt || new Date().toISOString(),
        count: data.count || (data.items ? data.items.length : 0),
        items: data.items || [],
    };
};

interface CollectionsState {
    collections: Collection[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchCollections: () => Promise<void>;
    fetchCollectionDetails: (id: string) => Promise<Collection | null>;
    createCollection: (name: string) => Promise<Collection | null>;
    renameCollection: (id: string, name: string) => Promise<boolean>;
    deleteCollection: (id: string) => Promise<boolean>;
    setCollections: (collections: Collection[]) => void;
    addToCollection: (collectionId: string, generationId: string) => Promise<boolean>;
    removeFromCollection: (collectionId: string, generationId: string) => Promise<boolean>;
    getCollectionsForGeneration: (generationId: string) => Promise<Collection[]>;
}

export const useCollectionsStore = create<CollectionsState>()((set, get) => ({
    collections: [],
    isLoading: false,
    error: null,

    fetchCollections: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await api.GET('/collections/');
            if (error) {
                set({ error: 'Failed to fetch collections', isLoading: false });
                return;
            }
            if (data && Array.isArray(data)) {
                set({ collections: (data as any[]).map(mapCollection), isLoading: false });
            } else {
                set({ collections: [], isLoading: false });
            }
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Network error', isLoading: false });
        }
    },

    fetchCollectionDetails: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await api.GET('/collections/{id}', {
                params: { path: { id } },
            });
            set({ isLoading: false });
            if (error) {
                set({ error: 'Failed to fetch collection details' });
                return null;
            }
            return mapCollection(data);
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Network error', isLoading: false });
            return null;
        }
    },

    createCollection: async (name: string) => {
        set({ error: null });
        try {
            const { data, error } = await api.POST('/collections/', {
                body: { name },
            });
            if (error) {
                set({ error: 'Failed to create collection' });
                return null;
            }
            if (data) {
                const newCollection = mapCollection(data, name);
                set((state) => ({ collections: [newCollection, ...state.collections] }));
                return newCollection;
            }
            return null;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Network error' });
            return null;
        }
    },

    renameCollection: async (id: string, name: string) => {
        set({ error: null });
        try {
            const { error } = await api.PATCH('/collections/{id}', {
                params: { path: { id } },
                body: { name },
            });
            if (error) {
                set({ error: 'Failed to rename collection' });
                return false;
            }
            set((state) => ({
                collections: state.collections.map((c) => (c.id === id ? { ...c, name } : c)),
            }));
            return true;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Network error' });
            return false;
        }
    },

    deleteCollection: async (id: string) => {
        set({ error: null });
        try {
            const { error } = await api.DELETE('/collections/{id}', {
                params: { path: { id } },
            });
            if (error) {
                set({ error: 'Failed to delete collection' });
                return false;
            }
            set((state) => ({
                collections: state.collections.filter((c) => c.id !== id),
            }));
            return true;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Network error' });
            return false;
        }
    },

    setCollections: (collections: Collection[]) => {
        set({ collections });
    },

    addToCollection: async (collectionId: string, generationId: string) => {
        set({ error: null });
        try {
            const { error } = await api.POST('/collections/{id}/items', {
                params: { path: { id: collectionId } },
                body: { generation_id: generationId } as any,
            });
            if (error) {
                set({ error: 'Failed to add item to collection' });
                return false;
            }
            // Update local count if possible
            set((state) => ({
                collections: state.collections.map((c) => 
                    c.id === collectionId ? { ...c, count: (c.count || 0) + 1 } : c
                )
            }));
            return true;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Network error' });
            return false;
        }
    },

    removeFromCollection: async (collectionId: string, generationId: string) => {
        set({ error: null });
        try {
            const { error } = await api.DELETE('/collections/{id}/items/{generationId}', {
                params: { path: { id: collectionId, generationId } },
            });
            if (error) {
                set({ error: 'Failed to remove item from collection' });
                return false;
            }
            set((state) => ({
                collections: state.collections.map((c) => 
                    c.id === collectionId ? { ...c, count: Math.max(0, (c.count || 0) - 1) } : c
                )
            }));
            return true;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Network error' });
            return false;
        }
    },

    getCollectionsForGeneration: async (generationId: string) => {
        try {
            const { data, error } = await api.GET('/collections/for-generation/{generationId}', {
                params: { path: { generationId } },
            });
            if (error || !data) return [];
            return (data as any[]).map(mapCollection);
        } catch {
            return [];
        }
    }
}));
