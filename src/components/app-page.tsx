"use client";

import { useState, useRef, useCallback } from "react";
import { ArrowLeft, Plus, X, Sparkles, Loader2, Download, Zap } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

interface AppPageProps {
  title: string;
  description: string;
  howItWorks: string;
  icon: React.ReactNode;
  image: string;
  needsPrompt?: boolean;
  promptPlaceholder?: string;
}

export function AppPage({ 
  title, 
  description, 
  howItWorks, 
  icon, 
  image, 
  needsPrompt = false,
  promptPlaceholder 
}: AppPageProps) {
  const { t, language } = useLanguage();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const refInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent, isRef = false) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files[0]?.type.startsWith("image/")) {
      const url = URL.createObjectURL(files[0]);
      if (isRef) {
        setReferenceImage(url);
      } else {
        setUploadedImage(url);
      }
      setResult(null);
    }
  }, []);

  const handleFiles = (files: FileList | null, isRef = false) => {
    if (files?.[0]?.type.startsWith("image/")) {
      const url = URL.createObjectURL(files[0]);
      if (isRef) {
        setReferenceImage(url);
      } else {
        setUploadedImage(url);
      }
      setResult(null);
    }
  };

  const handleProcess = async () => {
    if (!uploadedImage) return;
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 2500));
    setResult("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800");
    setIsProcessing(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
          <Link href="/app" className="p-2 rounded-full hover:bg-white/10 transition-colors border-none">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              {icon}
            </div>
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="rounded-2xl glass p-6">
              <h3 className="font-semibold mb-3">{language === "ru" ? "Как это работает" : "How it works"}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{howItWorks}</p>
            </div>
            <div className="lg:col-span-2 rounded-2xl overflow-hidden">
              <img src={image} alt={title} className="w-full h-64 object-cover" />
            </div>
          </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div
              className={`rounded-2xl glass p-4 transition-all ${isDragging ? "border-[#6F00FF] border-2" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => handleDrop(e, false)}
            >
              <h3 className="font-medium mb-4">{language === "ru" ? "Ваше изображение" : "Your Image"}</h3>
              
              {uploadedImage ? (
                <div className="relative">
                  <img src={uploadedImage} alt="Uploaded" className="w-full rounded-2xl" />
                  <button
                    onClick={() => { setUploadedImage(null); setResult(null); }}
                    className="absolute top-2 right-2 p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors border-none"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#6F00FF]/50 transition-colors"
                >
                  <Plus className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground text-center px-4">
                    {t("drag.hint")} <span className="text-[#6F00FF]">{t("drag.click")}</span>
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files, false)}
              />
            </div>

            <div className="rounded-2xl glass p-4">
              <h3 className="font-medium mb-4">{language === "ru" ? "Референс (опционально)" : "Reference (optional)"}</h3>
              
              {referenceImage ? (
                <div className="relative">
                  <img src={referenceImage} alt="Reference" className="w-full h-32 object-cover rounded-2xl" />
                  <button
                    onClick={() => setReferenceImage(null)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/60 hover:bg-black/80 transition-colors border-none"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => refInputRef.current?.click()}
                  className="h-32 border border-dashed border-white/20 rounded-2xl flex items-center justify-center cursor-pointer hover:border-[#6F00FF]/50 transition-colors"
                >
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </div>
              )}

              <input
                ref={refInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files, true)}
              />
            </div>

            {needsPrompt && (
              <div className="rounded-2xl glass p-4">
                <h3 className="font-medium mb-4">{language === "ru" ? "Описание" : "Description"}</h3>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={promptPlaceholder || t("prompt.placeholder")}
                  className="w-full bg-white/5 rounded-2xl p-3 resize-none outline-none text-white placeholder:text-muted-foreground min-h-[80px] font-mono text-sm border-none focus:ring-1 focus:ring-[#6F00FF]/50 transition-colors"
                  rows={3}
                />
              </div>
            )}

            {uploadedImage && (
              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className="btn-create w-full px-6 py-3 rounded-full font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {language === "ru" ? "Обработать" : "Process"}
                <div className="text-credits font-mono ml-2 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  10
                </div>
              </button>
            )}
          </div>

          <div className="rounded-2xl glass p-4">
            <h3 className="font-medium mb-4">{language === "ru" ? "Результат" : "Result"}</h3>
            
            {isProcessing ? (
              <div className="aspect-square flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-[#6F00FF] mx-auto mb-4" />
                  <p className="text-muted-foreground">{language === "ru" ? "Обработка..." : "Processing..."}</p>
                </div>
              </div>
            ) : result ? (
              <div className="relative">
                <img src={result} alt="Result" className="w-full rounded-2xl" />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button className="p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors border-none">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="aspect-square border border-dashed border-white/10 rounded-2xl flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  {language === "ru" ? "Результат появится здесь" : "Result will appear here"}
                </p>
              </div>
            )}
          </div>

      </div>
    </div>
  );
}
