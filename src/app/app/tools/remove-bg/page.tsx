"use client";

import { ToolPage } from "@/components/tool-page";
import { Eraser } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function RemoveBgPage() {
  const { language } = useLanguage();
  return (
    <ToolPage
      title={language === "ru" ? "Удалить фон" : "Remove Background"}
      description={language === "ru" ? "Автоматическое удаление фона с изображения" : "Automatically remove background from images"}
      icon={<Eraser className="w-5 h-5" />}
      gradient="bg-gradient-to-br from-rose-500/50 to-pink-500/50"
    />
  );
}
