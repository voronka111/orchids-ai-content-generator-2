"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, X, Sparkles, Loader2, Download, Zap } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

interface ToolPageProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

export function ToolPage({ title, description, icon, gradient }: ToolPageProps) {
  const { t, language } = useLanguage();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files[0]?.type.startsWith("image/")) {
      setUploadedImage(URL.createObjectURL(files[0]));
      setResult(null);
    }
  }, []);

  const handleFiles = (files: FileList | null) => {
    if (files?.[0]?.type.startsWith("image/")) {
      setUploadedImage(URL.createObjectURL(files[0]));
      setResult(null);
    }
  };

  const handleProcess = async () => {
    if (!uploadedImage) return;
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setResult(uploadedImage);
    setIsProcessing(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/app" className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div
          className={`rounded-2xl glass p-6 transition-all ${isDragging ? "border-[#6F00FF] border-2" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <h3 className="font-medium mb-4">{language === "ru" ? "Исходное изображение" : "Source Image"}</h3>
          
          {uploadedImage ? (
            <div className="relative">
              <img src={uploadedImage} alt="Uploaded" className="w-full rounded-2xl" />
              <button
                onClick={() => { setUploadedImage(null); setResult(null); }}
                className="absolute top-2 right-2 p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
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
            onChange={(e) => handleFiles(e.target.files)}
          />

          {uploadedImage && (
            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className="btn-create w-full mt-4 px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {language === "ru" ? "Обработать" : "Process"}
              <span className="text-credits font-mono ml-2 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-current" />
                10
              </span>
            </button>
          )}
        </div>

        <div className="rounded-2xl glass p-6">
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
                <button className="p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors">
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
