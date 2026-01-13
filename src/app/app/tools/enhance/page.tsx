"use client";

import { ToolPage } from "@/components/tool-page";
import { Wand2 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function EnhancePage() {
  const { language } = useLanguage();
  return (
    <ToolPage
      title={language === "ru" ? "Улучшить качество" : "Enhance Quality"}
      description={language === "ru" ? "Увеличение разрешения и улучшение деталей" : "Upscale resolution and enhance details"}
      icon={<Wand2 className="w-5 h-5" />}
      gradient="bg-gradient-to-br from-blue-500/50 to-cyan-500/50"
    />
  );
}
