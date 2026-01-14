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
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 w-24 sm:w-32">
                <Slider
                    value={value}
                    onValueChange={onChange}
                    max={max}
                    min={min}
                    step={1}
                    className="flex-1 cursor-pointer"
                />
            </div>
        </div>
    );
}
