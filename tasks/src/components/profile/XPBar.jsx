import React from "react";
import { motion } from "framer-motion";

// XP needed to reach next level (cumulative)
export const XP_TABLE = Array.from({ length: 50 }, (_, i) => {
  const level = i + 1;
  return Math.floor(100 * Math.pow(1.5, i));
});

export function getLevelFromXP(xp) {
  let level = 1;
  let accumulated = 0;
  for (let i = 0; i < XP_TABLE.length; i++) {
    if (xp >= accumulated + XP_TABLE[i]) {
      accumulated += XP_TABLE[i];
      level = i + 2;
    } else {
      return {
        level: Math.min(level, 50),
        currentXP: xp - accumulated,
        neededXP: XP_TABLE[i],
        percentage: Math.min(100, Math.floor(((xp - accumulated) / XP_TABLE[i]) * 100)),
      };
    }
  }
  return { level: 50, currentXP: 0, neededXP: XP_TABLE[49], percentage: 100 };
}

const LEVEL_COLORS = {
  1: "#94a3b8", 5: "#22c55e", 10: "#3b82f6", 15: "#8b5cf6",
  20: "#f59e0b", 25: "#ef4444", 30: "#ec4899", 35: "#06b6d4",
  40: "#f97316", 45: "#a855f7", 50: "#ffd700",
};
const getLevelColor = (lvl) => {
  const keys = Object.keys(LEVEL_COLORS).map(Number).sort((a, b) => b - a);
  for (const k of keys) if (lvl >= k) return LEVEL_COLORS[k];
  return "#94a3b8";
};

export default function XPBar({ xp = 0, compact = false }) {
  const info = getLevelFromXP(xp);
  const color = getLevelColor(info.level);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: color + "30", color }}>
          Lv.{info.level}
        </span>
        <div className="flex-1 bg-secondary rounded-full h-1.5 overflow-hidden min-w-[60px]">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${info.percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground">{info.percentage}%</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-display font-bold" style={{ color }}>Nível {info.level}</span>
          <span className="text-xs text-muted-foreground">{info.currentXP}/{info.neededXP} XP</span>
        </div>
        <span className="text-sm font-bold" style={{ color }}>{info.percentage}%</span>
      </div>
      <div className="bg-secondary rounded-full h-3 overflow-hidden">
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${info.percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </motion.div>
      </div>
    </div>
  );
}