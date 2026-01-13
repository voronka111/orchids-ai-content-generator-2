"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Image as ImageIcon, 
  Video, 
  Music, 
  Sparkles, 
  X,
  Plus,
  Eraser,
  Wand2,
  Expand,
  Paintbrush,
  User,
  RefreshCw,
  Sun,
  Zap,
    LayoutGrid,
    Gem,
    Square,
    Palette
  } from "lucide-react";

import { useLanguage } from "@/lib/language-context";
import { 
  aspectRatios, 
  qualityOptions, 
  imageModels, 
  videoModels, 
  audioModels 
} from "@/lib/mock-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type GenerationType = "image" | "video" | "audio";

interface UploadedImage {
  id: string;
  url: string;
  name: string;
}

function PromptBar({
  onGenerate,
  sticky = false,
}: {
  onGenerate?: (prompt: string, type: GenerationType) => void;
  sticky?: boolean;
}) {
  const { t } = useLanguage();
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState<GenerationType>("image");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [quality, setQuality] = useState("hd");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    const newImages = imageFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    setUploadedImages((prev) => [...prev, ...newImages].slice(0, 4));
  };

  const removeImage = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const getModel = () => {
    if (type === "image") return imageModels[0].name;
    if (type === "video") return videoModels[0].name;
    return audioModels[0].name;
  };

    const getAspectRatioIcon = (id: string, className?: string) => {
      switch (id) {
        case "1:1": return <div className={`w-3 h-3 border border-current rounded-sm ${className}`} />;
        case "16:9": return <div className={`w-4 h-2.5 border border-current rounded-sm ${className}`} />;
        case "9:16": return <div className={`w-2.5 h-4 border border-current rounded-sm ${className}`} />;
        case "4:3": return <div className={`w-3.5 h-3 border border-current rounded-sm ${className}`} />;
        case "3:2": return <div className={`w-3.5 h-2.5 border border-current rounded-sm ${className}`} />;
        default: return <div className={`w-3 h-3 border border-current rounded-sm ${className}`} />;
      }
    };

    return (
      <div
        className={`w-full max-w-2xl mx-auto ${
          sticky
            ? "fixed bottom-4 left-0 right-0 z-40 px-4 sm:px-6 pointer-events-none"
            : ""
        }`}
      >
      <div
        className={`relative rounded-3xl glass p-4 transition-all pointer-events-auto ${
          isDragging ? "border-[#6F00FF] border-2" : ""
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t("drag.hint")}</span>
          </button>

          {uploadedImages.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {uploadedImages.map((img) => (
                <div
                  key={img.id}
                  className="relative w-8 h-8 rounded-lg overflow-hidden group"
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeImage(img.id)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t("prompt.placeholder")}
          className="w-full bg-transparent resize-none outline-none text-white placeholder:text-muted-foreground min-h-[40px] font-mono text-sm"
          rows={1}
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Tabs
              value={type}
              onValueChange={(v) => setType(v as GenerationType)}
            >
              <TabsList className="bg-white/5 border-none rounded-full h-9 p-1 w-fit">
                <TabsTrigger
                  value="image"
                  className="gap-1.5 data-[state=active]:bg-[#6F00FF] rounded-full px-3 h-7 text-xs"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>{t("type.image")}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="video"
                  className="gap-1.5 data-[state=active]:bg-[#6F00FF] rounded-full px-3 h-7 text-xs"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>{t("type.video")}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="audio"
                  className="gap-1.5 data-[state=active]:bg-[#6F00FF] rounded-full px-3 h-7 text-xs"
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>{t("type.audio")}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {type !== "audio" && (
                <>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger className="w-fit min-w-[60px] h-9 bg-white/5 border-none rounded-full px-3 text-xs gap-2">
                      {getAspectRatioIcon(aspectRatio, "text-white")}
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-white/10">
                      {aspectRatios.map((ar) => (
                        <SelectItem key={ar.id} value={ar.id}>
                          <div className="flex items-center gap-2">
                            {getAspectRatioIcon(ar.id, "text-white/40")}
                            {ar.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={quality} onValueChange={setQuality}>
                    <SelectTrigger className="w-fit min-w-[60px] h-9 bg-white/5 border-none rounded-full px-3 text-xs gap-2">
                      <Gem className="w-3.5 h-3.5 text-white" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-white/10">
                      {qualityOptions.map((q) => (
                        <SelectItem key={q.id} value={q.id}>
                          <div className="flex items-center gap-2">
                            <Gem className="w-3.5 h-3.5 text-white/40" />
                            {q.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="w-3.5 h-3.5" />
              <span>{getModel()}</span>
              <span className="mx-1">•</span>
              <div className="flex items-center gap-0.5 text-credits font-mono">
                <span>10</span>
              </div>
            </div>
            <button
              onClick={() => onGenerate?.(prompt, type)}
              disabled={!prompt.trim()}
              className="btn-create px-4 py-2 rounded-xl font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
            >
              {t("prompt.create")}
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(Array.from(e.target.files || []))}
        />
      </div>
    </div>
  );
}

function CreateCard({
  icon: Icon,
  title,
  subtitle,
  href,
  image,
}: {
  icon: typeof ImageIcon;
  title: string;
  subtitle: string;
  href: string;
  image: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        className="relative h-48 sm:h-64 rounded-2xl overflow-hidden group cursor-pointer"
      >
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 flex flex-col gap-0.5">
          <div className="w-10 h-10 rounded-xl bg-[#6F00FF] flex items-center justify-center mb-1">
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-lg font-semibold">{title}</span>
          <span className="text-sm text-muted-foreground">{subtitle}</span>
        </div>
      </motion.div>
    </Link>
  );
}

function ToolCard({
  icon: Icon,
  title,
  subtitle,
  href,
}: {
  icon: typeof Eraser;
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        className="relative h-32 sm:h-44 rounded-2xl overflow-hidden cursor-pointer border border-purple-500/20 hover:border-purple-500/60 transition-all duration-300 bg-white/5"
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="font-medium text-center text-sm sm:text-base">{title}</span>
            <span className="text-[10px] sm:text-xs text-center opacity-70 line-clamp-1">{subtitle}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function AppCard({
  icon: Icon,
  title,
  subtitle,
  href,
  image,
}: {
  icon: typeof User;
  title: string;
  subtitle: string;
  href: string;
  image: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        className="relative h-40 sm:h-52 rounded-2xl overflow-hidden group cursor-pointer"
      >
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-4 left-4 flex flex-col gap-0.5">
          <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-1">
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-medium">{title}</span>
          <span className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">{subtitle}</span>
        </div>
      </motion.div>
    </Link>
  );
}

  export function HomePage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [generating, setGenerating] = useState(false);

    const [text, setText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(150);

    const phrases = ["смешную картинку", "видео из фото", "песню про друзей"];

    useEffect(() => {
      const handleType = () => {
        const i = loopNum % phrases.length;
        const fullText = phrases[i];

        setText(isDeleting 
          ? fullText.substring(0, text.length - 1) 
          : fullText.substring(0, text.length + 1)
        );

        setTypingSpeed(isDeleting ? 50 : 100);

        if (!isDeleting && text === fullText) {
          setTimeout(() => setIsDeleting(true), 1500);
        } else if (isDeleting && text === "") {
          setIsDeleting(false);
          setLoopNum(loopNum + 1);
          setTypingSpeed(300);
        }
      };

      const timer = setTimeout(handleType, typingSpeed);
      return () => clearTimeout(timer);
    }, [text, isDeleting, loopNum, typingSpeed]);

    const handleGenerate = (prompt: string, type: GenerationType) => {
    router.push(`/app/create/${type}?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16">
        <section className="relative text-left pt-8 pb-4 overflow-visible">
          <div className="relative z-10">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl sm:text-4xl font-bold mb-3 min-h-[1.2em]"
            >
              Сделай <span className="text-white/80">{text}</span>
              <span className="animate-pulse ml-1 inline-block w-[2px] h-[0.8em] bg-current align-middle" />
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground"
            >
              {t("home.subtitle")}
            </motion.p>
          </div>
        </section>

      <section>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <CreateCard
            icon={ImageIcon}
            title={t("type.image")}
            subtitle={t("type.image.sub")}
            href="/app/create/image"
            image="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop"
          />
          <CreateCard
            icon={Video}
            title={t("type.video")}
            subtitle={t("type.video.sub")}
            href="/app/create/video"
            image="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&h=400&fit=crop"
          />
          <CreateCard
            icon={Music}
            title={t("type.audio")}
            subtitle={t("type.audio.sub")}
            href="/app/create/audio"
            image="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=400&fit=crop"
          />
        </div>
      </section>

      <section>
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{t("section.edit")}</h2>
          <p className="text-sm text-muted-foreground">{t("section.edit.sub")}</p>
        </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <ToolCard
              icon={Eraser}
              title={t("edit.removeBg")}
              subtitle="Remove background instantly"
              href="/app/tools/remove-bg"
            />
            <ToolCard
              icon={Wand2}
              title={t("edit.enhance")}
              subtitle="Upscale and sharpen details"
              href="/app/tools/enhance"
            />
            <ToolCard
              icon={Expand}
              title={t("edit.expand")}
              subtitle="Extend image boundaries"
              href="/app/tools/expand"
            />
            <ToolCard
              icon={Paintbrush}
              title={t("edit.inpaint")}
              subtitle="Edit specific parts with AI"
              href="/app/tools/inpaint"
            />
          </div>
      </section>

      <section>
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{t("section.apps")}</h2>
          <p className="text-sm text-muted-foreground">{t("section.apps.sub")}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <AppCard
            icon={User}
            title={t("app.stylist")}
            subtitle={t("app.stylist.sub")}
            href="/app/apps/stylist"
            image="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"
          />
          <AppCard
            icon={RefreshCw}
            title={t("app.faceSwap")}
            subtitle={t("app.faceSwap.sub")}
            href="/app/apps/face-swap"
            image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop"
          />
          <AppCard
            icon={Sun}
            title={t("app.relight")}
            subtitle={t("app.relight.sub")}
            href="/app/apps/relight"
            image="https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=400&h=300&fit=crop"
          />
          <AppCard
            icon={RefreshCw}
            title={t("app.restore")}
            subtitle={t("app.restore.sub")}
            href="#"
            image="https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?w=400&h=300&fit=crop"
          />
            <AppCard
              icon={Palette}
              title={t("app.ghibli")}
              subtitle={t("app.ghibli.sub")}
              href="#"
              image="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop"
            />
          <AppCard
            icon={LayoutGrid}
            title={t("app.product")}
            subtitle={t("app.product.sub")}
            href="#"
            image="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop"
          />
        </div>
      </section>
    </div>
  );
}
