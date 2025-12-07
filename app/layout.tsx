"use client";

import localFont from "next/font/local";
import "./globals.css";
import { ReactNode, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Home, Clipboard, Settings, Menu, X, List, Plus } from "lucide-react";

const nunito = localFont({
  src: [
    { path: "./fonts/Nunito-Light.ttf", weight: "300", style: "normal" },
    { path: "./fonts/Nunito-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Nunito-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/Nunito-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/Nunito-Bold.ttf", weight: "700", style: "normal" },
    { path: "./fonts/Nunito-ExtraBold.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-nunito",
  display: "swap",
});

// Navigation items
const navItems = [
  {
    label: "Dashboard",
    icon: <Home className="w-5 h-5" />,
    href: "/",
  },
  { label: "Tasks", icon: <List className="w-5 h-5" />, href: "/tasks" },
  {
    label: "New",
    icon: <Plus className="w-5 h-5" />,
    href: "/new",
  },
];

// Framer Motion variants for sidebar
const sidebarVariants = {
  open: { width: 240 },
  closed: { width: 64 },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${nunito.className} antialiased flex h-screen bg-background text-foreground`}
      >
        <main className="flex-1 overflow-auto ">{children}</main>
      </body>
    </html>
  );
}
