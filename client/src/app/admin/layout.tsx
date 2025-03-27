"use client";
import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { Toaster } from "react-hot-toast";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground">
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          {/* Main Content */}
          <div
            className={`flex-1 ${
              sidebarOpen ? "ml-64" : "ml-20"
            } transition-all duration-300 ease-in-out`}
          >
            {/* Top Header */}
            <Header />

            {/* Main Content */}
            <main
              className="p-6 overflow-y-auto"
              style={{ height: "calc(100vh - 4rem)" }}
            >
              {children}
            </main>
            <Toaster />
          </div>
        </div>
      </body>
    </html>
  );
}
