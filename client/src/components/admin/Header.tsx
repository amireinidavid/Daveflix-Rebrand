"use client";

import { Bell, ChevronDown, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 bg-card border-b border-border shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-64 rounded-lg border border-border bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 rounded-full hover:bg-secondary focus:outline-none">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white">
              A
            </div>
            <span className="hidden md:block font-medium">Admin</span>
            <ChevronDown size={16} />
          </div>
        </div>
      </div>
    </header>
  );
}
