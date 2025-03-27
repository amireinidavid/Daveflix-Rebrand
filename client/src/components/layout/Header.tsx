"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BiSearch,
  BiUser,
  BiBell,
  BiMenu,
  BiHomeAlt,
  BiMovie,
  BiTv,
  BiTrendingUp,
  BiBookmark,
  BiDownload,
  BiHistory,
  BiCog,
  BiLogOut,
} from "react-icons/bi";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";
import { useAuthStore } from "@/store/useAuthStore";
import { LogOut } from "lucide-react";

const mainNavItems = [
  { name: "Home", href: "/browse", icon: BiHomeAlt },
  { name: "Movies", href: "/movies", icon: BiMovie },
  { name: "TV Shows", href: "/tv", icon: BiTv },
  { name: "New & Popular", href: "/new", icon: BiTrendingUp },
  { name: "My List", href: "/my-list", icon: BiBookmark },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const pathname = usePathname();
  const { user, activeProfile } = useUserStore();
  const router = useRouter();
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border/50"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          {/* Logo - Increased size */}
          <Link
            href="/browse"
            className="flex-shrink-0 text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/50 
              bg-clip-text text-transparent hover:to-primary transition-all duration-300"
          >
            Daveflix
          </Link>

          {/* Desktop Navigation - Increased text size */}
          <nav className="hidden md:flex items-center space-x-2">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-base font-medium transition-colors",
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:text-primary hover:bg-primary/10"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions - Updated with hover menu */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex hover:bg-primary/10 hover:text-primary h-12 w-12"
            >
              <BiSearch className="h-8 w-8" />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex hover:bg-primary/10 hover:text-primary h-12 w-12"
            >
              <BiBell className="h-8 w-8" />
            </Button>
            {/* Downloads */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex hover:bg-primary/10 hover:text-primary h-12 w-12"
            >
              <BiDownload className="h-8 w-8" />
            </Button>

            {/* Profile with Hover Menu */}
            {activeProfile && (
              <div className="hidden md:block relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10 hover:text-primary h-12 w-12"
                  onMouseEnter={() => setShowAccountMenu(true)}
                  onMouseLeave={() => setShowAccountMenu(false)}
                >
                  <BiUser className="h-8 w-8" />
                </Button>

                {/* Hover Menu */}
                <AnimatePresence>
                  {showAccountMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 rounded-lg bg-background/95 backdrop-blur-md border border-border/50 shadow-lg"
                      onMouseEnter={() => setShowAccountMenu(true)}
                      onMouseLeave={() => setShowAccountMenu(false)}
                    >
                      {/* User Info */}
                      <div className="p-4 border-b border-border/50">
                        <p className="text-sm font-medium">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>

                      {/* Menu Links */}
                      <div className="p-2">
                        <Link
                          href="/account"
                          className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <BiCog className="h-4 w-4" />
                          Account Settings
                        </Link>
                        <Link
                          href="/watchlist"
                          className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <BiBookmark className="h-4 w-4" />
                          My Watchlist
                        </Link>
                        <Link
                          href="/history"
                          className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <BiHistory className="h-4 w-4" />
                          Watch History
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="p-2 border-t border-border/50">
                        <button
                          className="flex w-full items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
                          onClick={() => {
                            const logout = useAuthStore.getState().logout;
                            logout();
                            router.push("/auth/login");
                          }}
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden hover:bg-primary/10 hover:text-primary h-12 w-12"
                >
                  <BiMenu className="h-10 w-10" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col h-full">
                  <div className="space-y-4 flex-1">
                    {/* Mobile Navigation - Increased text and icon sizes */}
                    {mainNavItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors",
                            pathname === item.href
                              ? "bg-primary/10 text-primary"
                              : "text-foreground/70 hover:text-primary hover:bg-primary/10"
                          )}
                        >
                          <Icon className="h-6 w-6" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Mobile Actions - Increased text and icon sizes */}
                  <div className="border-t border-border/50 pt-4">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-base py-3"
                    >
                      <BiSearch className="h-6 w-6" />
                      Search
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-base py-3"
                    >
                      <BiBell className="h-6 w-6" />
                      Notifications
                    </Button>
                    {activeProfile && (
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-base py-3"
                      >
                        <BiUser className="h-6 w-6" />
                        Profile
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
