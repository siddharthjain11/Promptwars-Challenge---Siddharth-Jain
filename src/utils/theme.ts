import { AppTheme } from "../types";

export interface ThemeConfig {
  id: AppTheme;
  name: string;
  emoji: string;
  description: string;
  bgHex: string;
  appBgClass: string;
  headerBgClass: string;
  borderClass: string;
  softCardBgClass: string;
  primaryBtnClass: string;
  primaryBtnHoverClass: string;
  accentTextClass: string;
  badgeClass: string;
  previewColor: string;
}

export const THEMES: Record<AppTheme, ThemeConfig> = {
  blue: {
    id: "blue",
    name: "Sky Blue",
    emoji: "🌤️",
    description: "Peaceful, crisp & easy on the eyes",
    bgHex: "#F0F7FF",
    appBgClass: "bg-[#F0F7FF]",
    headerBgClass: "bg-[#F0F7FF]/95",
    borderClass: "border-sky-200",
    softCardBgClass: "bg-sky-50/80",
    primaryBtnClass: "bg-sky-600",
    primaryBtnHoverClass: "hover:bg-sky-700",
    accentTextClass: "text-sky-900",
    badgeClass: "bg-sky-100 text-sky-950 border-sky-300",
    previewColor: "#38bdf8",
  },
  yellow: {
    id: "yellow",
    name: "Warm Sunshine",
    emoji: "☀️",
    description: "Cozy warm butter & gentle amber",
    bgHex: "#FAF7F2",
    appBgClass: "bg-[#FAF7F2]",
    headerBgClass: "bg-[#FAF7F2]/95",
    borderClass: "border-amber-200",
    softCardBgClass: "bg-amber-50/80",
    primaryBtnClass: "bg-amber-600",
    primaryBtnHoverClass: "hover:bg-amber-700",
    accentTextClass: "text-amber-900",
    badgeClass: "bg-amber-100 text-amber-950 border-amber-300",
    previewColor: "#f59e0b",
  },
  pink: {
    id: "pink",
    name: "Soft Rose",
    emoji: "🌸",
    description: "Soothing, gentle light pastel pink",
    bgHex: "#FFF1F2",
    appBgClass: "bg-[#FFF1F2]",
    headerBgClass: "bg-[#FFF1F2]/95",
    borderClass: "border-rose-200",
    softCardBgClass: "bg-rose-50/80",
    primaryBtnClass: "bg-rose-500",
    primaryBtnHoverClass: "hover:bg-rose-600",
    accentTextClass: "text-rose-900",
    badgeClass: "bg-rose-100 text-rose-950 border-rose-300",
    previewColor: "#fb7185",
  },
  purple: {
    id: "purple",
    name: "Lavender Lilac",
    emoji: "🪻",
    description: "Calm, relaxing light lavender",
    bgHex: "#F5F3FF",
    appBgClass: "bg-[#F5F3FF]",
    headerBgClass: "bg-[#F5F3FF]/95",
    borderClass: "border-purple-200",
    softCardBgClass: "bg-purple-50/80",
    primaryBtnClass: "bg-purple-600",
    primaryBtnHoverClass: "hover:bg-purple-700",
    accentTextClass: "text-purple-900",
    badgeClass: "bg-purple-100 text-purple-950 border-purple-300",
    previewColor: "#c084fc",
  },
  green: {
    id: "green",
    name: "Sage Green",
    emoji: "🌿",
    description: "Serene, fresh gentle nature tone",
    bgHex: "#F0FDF4",
    appBgClass: "bg-[#F0FDF4]",
    headerBgClass: "bg-[#F0FDF4]/95",
    borderClass: "border-emerald-200",
    softCardBgClass: "bg-emerald-50/80",
    primaryBtnClass: "bg-emerald-600",
    primaryBtnHoverClass: "hover:bg-emerald-700",
    accentTextClass: "text-emerald-900",
    badgeClass: "bg-emerald-100 text-emerald-950 border-emerald-300",
    previewColor: "#34d399",
  },
};
