"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Film, 
  Heart, 
  User, 
  Menu, 
  X, 
  Tv, 
  Clock, 
  Star, 
  Sparkles, 
  Settings, 
  LogOut, 
  HelpCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

export default function MobileNavBar() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useOnClickOutside(menuRef, () => setMenuOpen(false));

  // Handle scroll to hide/show navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Always show navbar when menu is open
      if (menuOpen) {
        setIsVisible(true);
        return;
      }
      
      // Show navbar when scrolling up or at the top
      if (currentScrollY <= 10 || currentScrollY < lastScrollY) {
        setIsVisible(true);
      } 
      // Hide navbar when scrolling down
      else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, menuOpen]);

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Navigation items
  const navItems = [
    { name: "Home", icon: Home, path: "/" },
    { name: "Movies", icon: Film, path: "/movies" },
    { name: "Watchlist", icon: Heart, path: "/watch" },
    { name: "Profile", icon: User, path: "/profile" },
  ];

  // Menu items
  const menuItems = [
    { 
      title: "Content",
      items: [
        { name: "TV Shows", icon: Tv, path: "/tv" },
        { name: "New Releases", icon: Sparkles, path: "/new" },
        { name: "Trending Now", icon: Star, path: "/trending" },
        { name: "Coming Soon", icon: Clock, path: "/coming-soon" },
      ]
    },
    {
      title: "Your Stuff",
      items: [
        { name: "Liked Movies", icon: Heart, path: "/liked" },
        { name: "Watch History", icon: Clock, path: "/history" },
        { name: "Downloads", icon: Film, path: "/downloads" },
      ]
    },
    {
      title: "Account",
      items: [
        { name: "Settings", icon: Settings, path: "/settings" },
        { name: "Help Center", icon: HelpCircle, path: "/help" },
        { name: "Sign Out", icon: LogOut, path: "/logout" },
      ]
    }
  ];

  // Check if a path is active
  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Backdrop for menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Menu Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            className="fixed bottom-16 right-2 w-[calc(100%-1rem)] max-w-xs bg-card rounded-xl border border-border shadow-lg z-40 md:hidden overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="max-h-[70vh] overflow-y-auto p-2">
              {menuItems.map((section, idx) => (
                <div key={section.title} className={idx > 0 ? "mt-4" : ""}>
                  <h3 className="text-xs font-semibold text-muted-foreground px-3 py-2">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.name}
                        href={item.path}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                      >
                        <item.icon className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Bottom Navigation Bar */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border md:hidden z-40 shadow-lg"
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : 100 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center px-4 py-2 max-w-screen-xl mx-auto">
          {navItems.map((item) => (
            <Link 
              key={item.name}
              href={item.path} 
              className={`flex flex-col items-center py-3 px-4 rounded-xl transition-colors duration-200 ${
                isActive(item.path) 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`relative ${isActive(item.path) ? "mb-3" : "mb-1"}`}>
                <item.icon className={`h-6 w-6 ${isActive(item.path) ? "stroke-[2.5px]" : ""}`} />
                
                {/* Active indicator dot */}
                {isActive(item.path) && (
                  <motion.div 
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full"
                    layoutId="activeIndicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          ))}
          
          {/* Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex flex-col items-center py-3 px-4 rounded-xl transition-colors duration-200 ${
              menuOpen 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="relative mb-1">
              {menuOpen ? (
                <X className="h-6 w-6 stroke-[2.5px]" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </div>
            <span className="text-xs font-medium">Menu</span>
          </button>
        </div>
      </motion.div>
    </>
  );
} 