'use client';

import { Clock } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface DurationSelectorProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function DurationSelector({
    options,
    value,
    onChange,
    open,
    onOpenChange,
}: DurationSelectorProps) {
    return (
        <Select value={value} onValueChange={onChange} open={open} onOpenChange={onOpenChange}>
            <SelectTrigger className="w-fit min-w-[70px] h-10 bg-white/5 border-none rounded-2xl px-4 text-xs font-bold gap-3 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-white" />
                    <span className="text-white">{value}s</span>
                </div>
                <VisuallyHidden>
                    <SelectValue />
                </VisuallyHidden>
            </SelectTrigger>
            <SelectContent
                className="bg-[#0A0A0A]/95 backdrop-blur-xl border-white/10 rounded-2xl p-2"
                align="start"
            >
                {options.map((dur) => (
                    <SelectItem
                        key={dur}
                        value={dur}
                        className="rounded-xl py-2.5 font-medium uppercase tracking-widest"
                    >
                        <div className="flex items-center gap-3">
                            <Clock className="w-3.5 h-3.5 text-white/40" />
                            {dur}s
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
