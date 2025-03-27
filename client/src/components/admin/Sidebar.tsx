"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Film,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  PanelLeft,
  Layers,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const pathname = usePathname();
  const logout = useAuthStore.getState().logout;
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: "Content", href: "/admin/content", icon: <Film size={20} /> },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: <Layers size={20} />,
    },
    { name: "Users", href: "/admin/users", icon: <Users size={20} /> },
    {
      name: "Subscriptions",
      href: "/admin/subscriptions",
      icon: <CreditCard size={20} />,
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: <BarChart3 size={20} />,
    },
    { name: "Settings", href: "/admin/settings", icon: <Settings size={20} /> },
  ];

  return (
    <aside
      className={`${sidebarOpen ? "w-64" : "w-20"} 
                bg-card 
                h-screen transition-all duration-300 ease-in-out 
                border-r border-border
                fixed left-0 top-0 z-30
                backdrop-blur-sm bg-opacity-90`}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header with Gradient Border */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border relative">
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
          {sidebarOpen ? (
            <Link href="/admin" className="flex items-center space-x-2">
              <span className="text-xl font-bold gradient-text">
                Daveflix Admin
              </span>
            </Link>
          ) : (
            <Link href="/admin" className="flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center text-white font-bold">
                D
              </div>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-secondary focus:outline-none transition-colors duration-200"
          >
            {sidebarOpen ? <PanelLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation Links with Enhanced Styling */}
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out
                  ${
                    isActive
                      ? "bg-gradient-to-r from-secondary via-secondary to-secondary/70 text-primary shadow-md"
                      : "text-foreground hover:bg-secondary/50 hover:translate-x-1"
                  }`}
              >
                <div
                  className={`flex items-center justify-center w-6 h-6 mr-3 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.icon}
                </div>
                {sidebarOpen && (
                  <span className={`${isActive ? "font-semibold" : ""}`}>
                    {item.name}
                  </span>
                )}
                {isActive && sidebarOpen && (
                  <div className="absolute left-0 w-1 h-8 bg-primary rounded-r-md"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer with Gradient Border */}
        <div className="p-4 border-t border-border relative">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-foreground rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all duration-200 ease-in-out group"
          >
            <span className="flex items-center justify-center w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300">
              <LogOut size={20} />
            </span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
