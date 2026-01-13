"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Plus, FolderOpen, User, Menu, X, Zap, Image, Video, Music, Sparkles, Scissors, Wand2, Maximize, Eraser, Smile, Sun, Palette } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { mockUser } from "@/lib/mock-data";
import { Progress } from "@/components/ui/progress";
import { useState, useRef, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { OnboardingModal } from "@/components/onboarding-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { AnimatedLogo } from "@/components/animated-logo";

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: any;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-colors ${
        active
          ? "text-white bg-white/10"
          : "text-muted-foreground hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs">{label}</span>
    </Link>
  );
}

function HeaderDropdown({
  label,
  items,
  pathname,
}: {
  label: string;
  items: any[];
  pathname: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 100); // Small delay to prevent flickering
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative py-2"
    >
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <DropdownMenuTrigger
          className={`px-4 py-2 rounded-xl transition-colors border-none outline-none text-sm font-medium ${
            pathname.startsWith(
              items[0].href.split("/").slice(0, 3).join("/")
            )
              ? "bg-white/10 text-white"
              : "text-muted-foreground hover:text-white hover:bg-white/5"
          }`}
        >
          {label}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={8}
          className="bg-[#0A0A0A]/95 backdrop-blur-xl border-white/10 rounded-2xl min-w-[280px] p-2"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {items.map((item) => (
            <DropdownMenuItem
              key={item.href}
              asChild
              className="rounded-xl focus:bg-white/10 focus:text-white cursor-pointer p-0"
            >
                  <Link
                    href={item.href}
                    className="flex items-start gap-3 w-full p-3 group/item"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover/item:bg-white/10 transition-colors shrink-0">
                      <item.icon className="w-5 h-5 text-white/40 group-hover/item:text-white transition-transform group-hover/item:scale-110" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm text-white transition-colors">
                        {item.label}
                      </span>
                    <span className="text-xs text-muted-foreground leading-tight">
                      {item.description}
                    </span>
                  </div>
                </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { href: "/app/create", icon: Plus, label: t("nav.create") },
    { href: "/app/library", icon: FolderOpen, label: t("nav.library") },
    { href: "/app/profile", icon: User, label: t("nav.profile") },
  ];

  const createItems = [
    { 
      href: "/app/create/image", 
      label: t("type.image"), 
      description: t("type.image.sub"),
      icon: Image 
    },
    { 
      href: "/app/create/video", 
      label: t("type.video"), 
      description: t("type.video.sub"),
      icon: Video 
    },
    { 
      href: "/app/create/audio", 
      label: t("type.audio"), 
      description: t("type.audio.sub"),
      icon: Music 
    },
  ];

  const editItems = [
    { 
      href: "/app/tools/enhance", 
      label: t("edit.enhance"), 
      description: t("edit.enhance.sub"),
      icon: Wand2 
    },
    { 
      href: "/app/tools/expand", 
      label: t("edit.expand"), 
      description: t("edit.expand.sub"),
      icon: Maximize 
    },
    { 
      href: "/app/tools/inpaint", 
      label: t("edit.inpaint"), 
      description: t("edit.inpaint.sub"),
      icon: Scissors 
    },
    { 
      href: "/app/tools/remove-bg", 
      label: t("edit.removeBg"), 
      description: t("edit.removeBg.sub"),
      icon: Eraser 
    },
  ];

  const appItems = [
    { 
      href: "/app/apps/face-swap", 
      label: t("app.faceSwap"), 
      description: t("app.faceSwap.sub"),
      icon: Smile 
    },
    { 
      href: "/app/apps/relight", 
      label: t("app.relight"), 
      description: t("app.relight.sub"),
      icon: Sun 
    },
    { 
      href: "/app/apps/stylist", 
      label: t("app.stylist"), 
      description: t("app.stylist.sub"),
      icon: Palette 
    },
  ];

  const creditPercentage = (mockUser.credits / mockUser.maxCredits) * 100;

  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem("hasSeenOnboarding", "true");
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white overflow-x-hidden">
      <OnboardingModal isOpen={showOnboarding} onClose={handleCloseOnboarding} />
      <div className="gradient-bg" />

    <header className="fixed top-0 left-0 right-0 z-50 h-16">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-transparent backdrop-blur-xl [mask-image:linear-gradient(to_bottom,black_0%,black_40%,transparent_100%)] pointer-events-none" />
      <div className="h-full px-[14px] sm:px-6 flex items-center justify-between max-w-[1440px] mx-auto relative z-10 border-b border-white/5">
        <div className="flex items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2">
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <button className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                    <Menu className="w-5 h-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-[#0A0A0A]/95 backdrop-blur-xl border-white/10 p-0 w-[280px]">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b border-white/10">
                    <Link href="/app" onClick={() => setMenuOpen(false)}>
                      <AnimatedLogo />
                    </Link>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div>
                      <h3 className="px-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">{t("nav.create")}</h3>
                      <div className="space-y-1">
                        {createItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 group-hover:text-white transition-colors">
                              <item.icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="px-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">{t("nav.edit")}</h3>
                      <div className="space-y-1">
                        {editItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 group-hover:text-white transition-colors">
                              <item.icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>


                    <div>
                      <h3 className="px-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">{t("nav.library")}</h3>
                      <div className="space-y-1">
                        <Link
                          href="/app/library"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 group-hover:text-white transition-colors">
                            <FolderOpen className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium">{t("nav.library")}</span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-white/10 space-y-4">
                    <div className="bg-white/5 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Кредиты</span>
                          <span className="text-xs font-bold text-[#FFDC74]">{mockUser.credits} / {mockUser.maxCredits}</span>
                        </div>
                      <Progress value={creditPercentage} className="h-1.5 bg-white/10" indicatorClassName="bg-gradient-to-r from-[#6F00FF] to-[#a855f7]" />
                    </div>
                  </div>
                </div>
                </SheetContent>
              </Sheet>

              <Link href="/app" className="flex items-center gap-2">
                <AnimatedLogo />
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <HeaderDropdown label={t("nav.create")} items={createItems} pathname={pathname} />
              <HeaderDropdown label={t("nav.edit")} items={editItems} pathname={pathname} />

            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <Link 
              href="/app/library"
              className={`hidden md:flex px-4 py-2 rounded-xl transition-colors text-sm font-medium ${
                pathname === "/app/library"
                  ? "bg-white/10 text-white"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            >
              {t("nav.library")}
            </Link>

            <div className="hidden sm:flex items-center gap-1.5">
              <Zap className="w-4 h-4 fill-[#FFDC74] text-[#FFDC74]" />
              <span className="text-sm font-bold text-[#FFDC74] font-mono">{mockUser.credits}</span>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/app/profile" className="flex items-center gap-2.5 transition-all group">
                <div className="w-8 h-8 rounded-full overflow-hidden shadow-lg group-hover:scale-105 transition-transform border border-white/10">
                  <img 
                    src={mockUser.avatar} 
                    alt={mockUser.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
            </div>
          </div>
      </div>
    </header>

    <main className="pt-16 pb-20 md:pb-8 min-h-[100dvh]">
        <div className="px-[14px] sm:px-6 py-6">{children}</div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/95 to-transparent backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href}
            />
          ))}
        </div>
      </nav>
    </div>
  );
}
