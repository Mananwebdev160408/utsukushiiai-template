"use client";

import Link from "next/link";
import {
  Search,
  Zap,
  LayoutGrid,
  Music,
  Film,
  Settings,
  User,
  Menu,
} from "lucide-react";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, fetchMe } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // Immersive studio pages where navbar should be hidden
  // Matches /projects/[id] (Video Editor) and /projects/[id]/edit (Style Maker)
  // We explicitly exclude /projects/new (Creation Wizard) and /projects (Dashboard)
  const isVideoEditor =
    /^\/projects\/[^/]+$/.test(pathname) && pathname !== "/projects/new";
  const isStyleMaker = pathname.endsWith("/edit");
  const hideNavbar = isVideoEditor || isStyleMaker;

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-slate-100 overflow-x-hidden font-body">
      {/* Navbar */}
      {!hideNavbar && (
        <header className="sticky top-0 z-50 w-full bg-white dark:bg-surface-dark border-b-6 border-black dark:border-white">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Logo */}
              <div className="flex items-center gap-4">
                <Link href="/">
                  <img
                    src="/images/logo-Photoroom.png"
                    alt="Logo"
                    className="w-10 h-10 object-contain"
                  />
                </Link>
                <h1 className="font-display font-black text-2xl tracking-tight uppercase hidden md:block italic">
                  Utsukushii<span className="text-primary">AI</span>
                </h1>
              </div>

              {/* Nav Links & Profile */}
              <div className="flex items-center gap-6">
                <nav className="hidden lg:flex items-center gap-8 font-mono font-bold text-sm uppercase">
                  <Link
                    className="hover:underline decoration-4 decoration-primary underline-offset-4"
                    href="/projects"
                  >
                    Projects
                  </Link>
                  <Link
                    className="hover:underline decoration-4 decoration-primary underline-offset-4"
                    href="/presets"
                  >
                    Presets
                  </Link>
                </nav>

                <Link
                  href="/settings"
                  className="w-10 h-10 border-4 border-black dark:border-white bg-gray-300 dark:bg-gray-700 overflow-hidden shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                >
                  <div
                    className="w-full h-full bg-cover bg-center grayscale hover:grayscale-0 transition-opacity"
                    style={{ backgroundImage: `url('${user?.avatar || '/images/logo-Photoroom.png'}')` }}
                  />
                </Link>

                <button className="lg:hidden text-black dark:text-white">
                  <Menu className="w-8 h-8" />
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main
        className={cn(
          "relative",
          hideNavbar ? "min-h-screen" : "min-h-[calc(100vh-80px)]",
        )}
      >
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none grid-bg" />
        <div className="relative z-10 h-full">{children}</div>
      </main>
    </div>
  );
}
