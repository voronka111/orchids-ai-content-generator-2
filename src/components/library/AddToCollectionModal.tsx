'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/lib/language-context';
import { useCollectionsStore, Collection } from '@/stores/collections-store';
import { Folder, Plus, Check, Loader2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGenerationStore } from '@/stores/generation-store';

interface AddToCollectionModalProps {
    generationId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddToCollectionModal({
    generationId,
    open,
    onOpenChange,
}: AddToCollectionModalProps) {
    const { language } = useLanguage();
    const { 
        collections, 
        fetchCollections, 
        addToCollection, 
        removeFromCollection, 
        createCollection,
        getCollectionsForGeneration 
    } = useCollectionsStore();
    const { generations, toggleFavorite } = useGenerationStore();

    const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    const generation = generations.find(g => g.id === generationId);
    const isFavorite = generation?.is_favorite || false;

    useEffect(() => {
        if (open) {
            setIsLoading(true);
            Promise.all([
                fetchCollections(),
                getCollectionsForGeneration(generationId)
            ]).then(([_, currentCollections]) => {
                setSelectedCollectionIds(currentCollections.map(c => c.id));
                setIsLoading(false);
            });
        }
    }, [open, generationId]);

    const handleToggleCollection = async (collectionId: string) => {
        const isSelected = selectedCollectionIds.includes(collectionId);
        if (isSelected) {
            const success = await removeFromCollection(collectionId, generationId);
            if (success) {
                setSelectedCollectionIds(prev => prev.filter(id => id !== collectionId));
            }
        } else {
            const success = await addToCollection(collectionId, generationId);
            if (success) {
                setSelectedCollectionIds(prev => [...prev, collectionId]);
            }
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        setIsCreating(true);
        const folderName = newFolderName.trim();
        const newCol = await createCollection(folderName);
        if (newCol) {
            await addToCollection(newCol.id, generationId);
            setSelectedCollectionIds(prev => [...prev, newCol.id]);
            setNewFolderName('');
            // Refresh collections to ensure sidebar is updated
            fetchCollections();
        }
        setIsCreating(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[360px] p-0 overflow-hidden bg-[#0A0A0A] border-white/10">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-xl font-bold">
                        {language === 'ru' ? 'Добавить в папку' : 'Add to folder'}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-4">
                    {/* Favorites shortcut */}
                    <button
                        onClick={() => toggleFavorite(generationId)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                            isFavorite ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-white/60'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <Heart className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-white/20'}`} />
                            <span className="text-sm font-medium">
                                {language === 'ru' ? 'Избранное' : 'Favorites'}
                            </span>
                        </div>
                        {isFavorite && <Check className="w-4 h-4 text-white" />}
                    </button>

                    <div className="h-px bg-white/5 mx-[-24px]" />

                    {/* Collections list */}
                    <div className="max-h-[300px] overflow-y-auto space-y-1 -mx-2 px-2 custom-scrollbar">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-white/20" />
                            </div>
                        ) : collections.length > 0 ? (
                            collections
                                .filter(c => c.name !== 'Избранное' && c.name !== 'Favorites')
                                .map((col) => {
                                const isSelected = selectedCollectionIds.includes(col.id);
                                return (
                                    <button
                                        key={col.id}
                                        onClick={() => handleToggleCollection(col.id)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                                            isSelected ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-white/60'
                                        }`}
                                    >
                                            <div className="flex items-center gap-3">
                                                <Folder className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-white/20'}`} />
                                                <span className="text-sm font-medium">
                                                    {col.name || (language === 'ru' ? 'Новая папка' : 'Untitled Folder')}
                                                </span>
                                            </div>
                                        {isSelected && <Check className="w-4 h-4 text-white" />}
                                    </button>
                                );
                            })
                        ) : (
                            <p className="text-center py-4 text-sm text-white/40">
                                {language === 'ru' ? 'Папок пока нет' : 'No folders yet'}
                            </p>
                        )}
                    </div>

                    <div className="h-px bg-white/5 mx-[-24px]" />

                    {/* Create new */}
                    <div className="flex gap-2 pt-2">
                        <Input
                            placeholder={language === 'ru' ? 'Название папки...' : 'Folder name...'}
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                            className="bg-white/5 border-white/10"
                        />
                        <Button 
                            size="icon" 
                            onClick={handleCreateFolder}
                            disabled={!newFolderName.trim() || isCreating}
                            className="shrink-0"
                        >
                            {isCreating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
