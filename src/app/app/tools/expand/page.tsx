"use client";

import { ToolPage } from "@/components/tool-page";
import { Expand } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function ExpandPage() {
  const { language } = useLanguage();
  return (
    <ToolPage
      title={language === "ru" ? "Расширить" : "Expand"}
      description={language === "ru" ? "Расширение границ изображения с помощью ИИ" : "Expand image boundaries with AI"}
      icon={<Expand className="w-5 h-5" />}
      gradient="bg-gradient-to-br from-amber-500/50 to-yellow-500/50"
    />
  );
}
