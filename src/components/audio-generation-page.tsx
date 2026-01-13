"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search,
  Filter,
  Download, 
  Share2, 
  Loader2,
  Zap,
  Play,
  Pause,
  Music,
  X,
  RefreshCw,
  Shuffle,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  Heart,
  SkipBack,
  SkipForward,
  Repeat,
  Gauge,
  Volume2,
  Sparkles,
} from "lucide-react";

import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { audioModels, audioStyles } from "@/lib/mock-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GeneratedAudio {
  id: string;
  title: string;
  prompt: string;
  styles: string;
  duration: number;
  coverUrl?: string;
}

export function AudioGenerationPage() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [model, setModel] = useState(audioModels[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudios, setGeneratedAudios] = useState<GeneratedAudio[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [showLyrics, setShowLyrics] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [weirdness, setWeirdness] = useState([50]);
  const [negativePrompt, setNegativePrompt] = useState("");
  const [displayedStyles, setDisplayedStyles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  const getRandomStyles = () => {
    const currentStyles = prompt.toLowerCase().split(",").map(s => s.trim());
    const filtered = audioStyles.filter(s => !currentStyles.includes(s.toLowerCase()));
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 15); // Show more styles
  };

  useEffect(() => {
    setDisplayedStyles(getRandomStyles());
  }, []);

  const shuffleStyles = () => {
    setDisplayedStyles(getRandomStyles());
  };

  useEffect(() => {
    const promptParam = searchParams.get("prompt");
    if (promptParam) {
      setPrompt(decodeURIComponent(promptParam));
      handleGenerate(decodeURIComponent(promptParam));
    }
  }, [searchParams]);

  const handleGenerate = async (overridePrompt?: string) => {
    const currentPrompt = overridePrompt || prompt;
    if (!currentPrompt.trim()) return;
    
    setIsGenerating(true);
    if (window.innerWidth < 1024) {
      setIsSidebarMinimized(true);
    }
    
    await new Promise((r) => setTimeout(r, 2000));
    
    const newAudio: GeneratedAudio = {
      id: Math.random().toString(36).substr(2, 9),
      title: songTitle || (language === "ru" ? "Новый трек" : "New Track"),
      prompt: currentPrompt,
      styles: currentPrompt.split(",").slice(0, 3).join(", ").toLowerCase(),
      duration: 180,
      coverUrl: `https://picsum.photos/seed/${Math.random()}/200`,
    };
    
    setGeneratedAudios((prev) => [newAudio, ...prev]);
    setIsGenerating(false);
    if (!overridePrompt) {
      setPrompt("");
      setLyrics("");
      setSongTitle("");
    }
  };

  const generateLyrics = () => {
    setLyrics(language === "ru" ? "В звездной ночи, где мечты оживают,\nМы строим миры, что в огне не сгорают.\nСквозь тернии к свету, сквозь время и мрак,\nМы ищем свой путь, подавая нам знак." : "In the starry night, where dreams come alive,\nWe build worlds that in fire will survive.\nThrough thorns to the light, through time and the dark,\nWe seek our own way, giving us a spark.");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const selectedModel = audioModels.find((m) => m.id === model);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-black text-white -m-4">
        <div className="flex flex-1 overflow-hidden relative">
          {/* Fixed Sidebar (Prompt Bar) */}
          <AnimatePresence mode="wait">
            {!isSidebarMinimized ? (
              <motion.aside 
                initial={{ x: 0, opacity: 1 }}
                exit={{ x: -400, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-full lg:w-[380px] border-r border-white/5 flex flex-col h-full bg-[#0A0A0A] relative z-30"
              >
                <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-80">
                  {/* Header for Mobile Collapse */}
                  <div className="flex items-center justify-between lg:hidden mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-white/40">{t("nav.create")}</span>
                    <button 
                      onClick={() => setIsSidebarMinimized(true)}
                      className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white"
                    >
                      <ChevronDown className="w-5 h-5 rotate-90" />
                    </button>
                  </div>

                  {/* Lyrics Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => setShowLyrics(!showLyrics)}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 group hover:text-white transition-colors"
                      >
                        {showLyrics ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        <span>{language === "ru" ? "Текст песни" : "Lyrics"}</span>
                      </button>
                      <button
                        onClick={generateLyrics}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#6F00FF] transition-all"
                        title={language === "ru" ? "Сгенерировать текст" : "Generate lyrics"}
                      >
                        <Sparkles className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                    {showLyrics && (
                      <textarea
                        value={lyrics}
                        onChange={(e) => setLyrics(e.target.value)}
                        placeholder={language === "ru" ? "Введите текст песни..." : "Enter lyrics..."}
                        className="w-full bg-white/[0.03] rounded-2xl p-4 resize-none outline-none text-white placeholder:text-white/20 min-h-[140px] font-mono text-sm border border-white/5 leading-relaxed focus:border-[#6F00FF]/50 transition-all"
                      />
                    )}
                  </div>

                  {/* Description Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{language === "ru" ? "Описание" : "Description"}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPrompt("")}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={shuffleStyles}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#6F00FF] transition-all"
                        >
                          <Shuffle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Horizontal Scrollable Styles */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                      {displayedStyles.map((style) => (
                        <button
                          key={style}
                          onClick={() => setPrompt(prev => prev ? `${prev}, ${style}` : style)}
                          className="shrink-0 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono font-medium lowercase tracking-normal transition-all border border-white/5 hover:border-[#6F00FF]/30"
                        >
                          {style}
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={language === "ru" ? "Опишите стиль или жанр..." : "Describe the style or genre..."}
                      className="w-full bg-white/[0.03] rounded-2xl p-4 resize-none outline-none text-white placeholder:text-white/20 min-h-[100px] font-mono text-sm border border-white/5 leading-relaxed focus:border-[#6F00FF]/50 transition-all"
                    />
                  </div>
                </div>

                {/* Bottom Section: Advanced + Create - FIXED above player */}
                <div className="absolute bottom-[164px] lg:bottom-[110px] left-0 right-0 p-6 bg-[#0A0A0A] border-t border-white/5 space-y-4 z-40">
                  {/* Advanced Content when expanded */}
                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-6 mb-4"
                      >
                        <div className="space-y-3">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{language === "ru" ? "Название" : "Title"}</span>
                          <input
                            type="text"
                            value={songTitle}
                            onChange={(e) => setSongTitle(e.target.value)}
                            className="w-full h-12 bg-white/[0.03] rounded-xl px-4 outline-none text-sm font-mono border border-white/5 placeholder:text-white/20"
                          />
                        </div>

                        <div className="space-y-3">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{language === "ru" ? "Модель" : "Model"}</span>
                          <Select value={model} onValueChange={setModel}>
                            <SelectTrigger className="w-full h-12 bg-white/5 border-none rounded-xl px-4 text-xs font-mono gap-3 hover:bg-white/10 transition-colors">
                              <span>{selectedModel?.name}</span>
                            </SelectTrigger>
                            <SelectContent className="bg-[#0A0A0A] border-white/10 rounded-xl p-2 font-mono">
                              {audioModels.map((m) => (
                                <SelectItem key={m.id} value={m.id} className="rounded-lg">
                                  <div className="flex items-center justify-between w-full gap-8">
                                    <span className="font-medium">{m.name}</span>
                                    <span className="text-credits font-mono text-[10px] font-black opacity-50">{m.credits}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{language === "ru" ? "Креативность" : "Creativity"}</span>
                            <span className="text-[10px] font-mono font-bold text-[#6F00FF]">{weirdness}%</span>
                          </div>
                          <Slider
                            value={weirdness}
                            onValueChange={setWeirdness}
                            max={100}
                            step={1}
                            className="py-2"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button 
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full flex items-center justify-center gap-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white transition-colors"
                  >
                    {showAdvanced ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    <span>{language === "ru" ? "Настройки" : "Settings"}</span>
                  </button>

                  <button
                    onClick={() => handleGenerate()}
                    disabled={!prompt.trim() || isGenerating}
                    className="w-full h-14 rounded-2xl bg-[#6F00FF] text-white font-black uppercase tracking-[0.2em] text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(111,0,255,0.2)]"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <div className="flex items-center gap-4">
                        <span>{language === "ru" ? "Создать" : "Create"}</span>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/20 text-[#FFD700]">
                          <Zap className="w-3 h-3 fill-current" />
                          <span className="text-[10px] font-black">10</span>
                        </div>
                      </div>
                    )}
                  </button>
                </div>
              </motion.aside>
            ) : (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={() => setIsSidebarMinimized(false)}
                className="fixed right-6 bottom-[180px] z-[60] w-14 h-14 rounded-2xl bg-[#6F00FF] text-white flex items-center justify-center shadow-[0_0_30px_rgba(111,0,255,0.5)] hover:scale-110 active:scale-95 transition-all lg:hidden"
              >
                <Plus className="w-7 h-7" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col relative h-full bg-[#050505] overflow-hidden">
            {/* Top Header with Search */}
            <header className="p-6 flex items-center justify-between gap-6 border-b border-white/5">
              <div className="flex-1 max-w-xl relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="text"
                  placeholder={language === "ru" ? "Поиск..." : "Search..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 bg-white/5 rounded-full pl-12 pr-4 outline-none text-sm font-mono border border-white/5 focus:border-[#6F00FF]/50 transition-all placeholder:text-white/20"
                />
              </div>
            </header>

            {/* Tracks List */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 pb-80 no-scrollbar">
              <div className="flex flex-col gap-4 w-full max-w-5xl mx-auto">
                {isGenerating && (
                  <div className="h-[100px] rounded-[20px] bg-white/[0.02] border border-white/5 flex items-center px-6 gap-6 relative overflow-hidden group">
                    <div className="w-[68px] h-[68px] rounded-xl bg-white/5 animate-pulse flex items-center justify-center shrink-0">
                      <Loader2 className="w-5 h-5 animate-spin text-[#6F00FF]" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/3 bg-white/5 animate-pulse rounded" />
                      <div className="h-2 w-1/2 bg-white/5 animate-pulse rounded opacity-50" />
                    </div>
                  </div>
                )}

                <AnimatePresence mode="popLayout">
                  {generatedAudios.map((audio) => (
                    <motion.div
                      key={audio.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="h-[100px] rounded-[20px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all flex items-center px-6 gap-6 group relative"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-[68px] h-[68px] shrink-0 rounded-xl overflow-hidden group/thumb cursor-pointer">
                        <img 
                          src={audio.coverUrl} 
                          alt="" 
                          className="w-full h-full object-cover transition-transform group-hover/thumb:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                          <Play className="w-6 h-6 fill-white" />
                        </div>
                        <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[8px] font-black">
                          {formatTime(audio.duration)}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 pr-10">
                        <h3 className="text-sm font-bold truncate mb-1">{audio.title}</h3>
                        <p className="text-[11px] text-white font-medium truncate">
                          {audio.styles}
                        </p>
                      </div>

                      {/* Action Bar (Icons) */}
                      <div className="hidden sm:flex items-center gap-1 lg:gap-3">
                        <button className="p-2 text-white/20 hover:text-white transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-white/20 hover:text-[#6F00FF] transition-colors">
                          <Heart className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-white/20 hover:text-white transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>

                      {/* More Menu */}
                      <div className="absolute right-6 top-1/2 -translate-y-1/2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                              <MoreHorizontal className="w-5 h-5 text-white/20" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#111] border-white/5 rounded-xl font-mono">
                            <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest p-2.5">
                              {language === "ru" ? "Переименовать" : "Rename"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest p-2.5">
                              {language === "ru" ? "Продолжить" : "Extend"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest p-2.5 text-red-500">
                              {language === "ru" ? "Удалить" : "Delete"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </main>
        </div>

      {/* Bottom Audio Player - Full Width */}
      <footer className="fixed bottom-16 lg:bottom-0 left-0 right-0 h-[100px] lg:h-[110px] bg-[#0A0A0A]/95 backdrop-blur-2xl border-t border-white/5 flex flex-col z-50">
        {/* Progress Bar - Minimalist (Absolute top) */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 cursor-pointer group z-10">
          <div className="h-full bg-[#6F00FF] group-hover:bg-[#8B33FF] transition-all" style={{ width: '33%' }} />
          <div className="absolute top-1/2 left-[33%] w-3 h-3 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 transition-transform shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
        </div>

        {/* Controls Row */}
        <div className="flex-1 px-4 lg:px-8 py-3 flex items-center justify-between gap-4 lg:gap-8">
          {/* Left: Info & Playback Speed (minimalist) */}
          <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 shrink-0">
              <Music className="w-5 h-5 lg:w-6 lg:h-6 text-white/20" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs lg:text-sm font-bold truncate">{language === "ru" ? "Ничего не воспроизводится" : "Nothing playing"}</h4>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest truncate">{language === "ru" ? "Выберите трек" : "Select a track"}</p>
            </div>
            
            {/* Minimalist Speed Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all">
                  <Gauge className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top" className="bg-[#111] border-white/10 rounded-xl p-1 font-mono">
                {[0.8, 1.0, 1.2, 1.5].map(speed => (
                  <DropdownMenuItem 
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)} 
                    className="text-[10px] font-bold p-2 rounded-lg focus:bg-[#6F00FF] cursor-pointer"
                  >
                    {speed}x
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Center: Main Controls */}
          <div className="flex items-center gap-3 lg:gap-8">
            <button className="hidden sm:block text-white/20 hover:text-white transition-colors"><Shuffle className="w-4 h-4" /></button>
            <div className="flex items-center gap-4 lg:gap-6">
              <button className="text-white/40 hover:text-white transition-colors"><SkipBack className="w-5 h-5 fill-current" /></button>
              <button className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                <Play className="w-5 h-5 lg:w-6 lg:h-6 fill-current ml-0.5" />
              </button>
              <button className="text-white/40 hover:text-white transition-colors"><SkipForward className="w-5 h-5 fill-current" /></button>
            </div>
            <button className="hidden sm:block text-white/20 hover:text-white transition-colors"><Repeat className="w-4 h-4" /></button>
          </div>

            {/* Right: Volume & More */}
            <div className="hidden lg:flex items-center justify-end gap-6 flex-1">
              <div className="flex items-center gap-3 group">
                <Volume2 className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
                <div className="w-24 h-1 bg-white/5 rounded-full relative overflow-hidden cursor-pointer">
                  <div className="absolute inset-y-0 left-0 w-2/3 bg-white/20 group-hover:bg-[#6F00FF] transition-all" />
                </div>
              </div>
            </div>

          
          {/* Mobile Right: Small buttons */}
          <div className="lg:hidden flex items-center gap-2">
            <button className="p-2 text-white/40"><Heart className="w-5 h-5" /></button>
          </div>
        </div>
      </footer>
    </div>
  );
}
