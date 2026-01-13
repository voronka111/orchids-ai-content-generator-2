'use client';

import { Minimize2, Maximize2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface GridSizeSliderProps {
    value: number[];
    onChange: (value: number[]) => void;
    min?: number;
    max?: number;
}

export function GridSizeSlider({
    value,
    onChange,
    min = 150,
    max = 800,
}: GridSizeSliderProps) {
    return (
        <div className="flex items-center gap-6 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3 w-32 sm:w-48">
                <Minimize2 className="w-3.5 h-3.5 text-white/20" />
                <Slider
                    value={value}
                    onValueChange={onChange}
                    max={max}
                    min={min}
                    step={1}
                    className="flex-1 cursor-pointer"
                />
                <Maximize2 className="w-3.5 h-3.5 text-white/20" />
            </div>
        </div>
    );
}
