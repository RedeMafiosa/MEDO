import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EFFECT_CONFIG = {
  stars: {
    particles: ["⭐", "✨", "💫", "🌟", "⭐", "✨"],
    colors: ["#ffd700", "#fff", "#fffacd"],
  },
  bubbles: {
    particles: ["🫧", "🔵", "⚪", "🫧", "🔵"],
    colors: ["#60a5fa", "#93c5fd", "#bfdbfe"],
  },
  sparkle: {
    particles: ["✨", "💥", "⚡", "✨", "💫"],
    colors: ["#e879f9", "#f0abfc", "#ffd700"],
  },
  rainbow: {
    particles: ["🌈", "💎", "🎨", "🌈", "✨"],
    colors: ["#ff0080", "#ff8c00", "#ffd700", "#00ff00", "#00bfff", "#8b5cf6"],
  },
  fire: {
    particles: ["🔥", "💥", "⚡", "🔥", "✨"],
    colors: ["#ff4500", "#ff8c00", "#ffd700"],
  },
  none: {
    particles: [],
    colors: [],
  },
};

// Extra rich particles set
const FLOATING_PARTICLES = {
  stars: ["⭐", "✨", "💫", "🌟"],
  bubbles: ["🫧", "⚪", "🔵"],
  sparkle: ["✨", "⚡", "💫", "💥"],
  rainbow: ["🌈", "💎", "🎨", "🎇"],
  fire: ["🔥", "⚡", "💥", "✨"],
  none: [],
  // admin/special effects use butterflies, flowers, hearts, stars
  admin: ["🦋", "🌸", "❤️", "⭐", "🌺", "💜", "✨", "🌟", "💐", "🫶"],
};

function getParticlesForEffect(effect) {
  return FLOATING_PARTICLES[effect] || FLOATING_PARTICLES.none;
}

// A single floating particle that drifts upward and fades
function FloatingParticle({ particle, delay, startX, color }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 0, x: startX, scale: 0.6 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [-4, -28 - Math.random() * 20],
        x: [startX, startX + (Math.random() - 0.5) * 28],
        scale: [0.6, 1.1, 0.8],
        rotate: [0, (Math.random() - 0.5) * 60],
      }}
      transition={{
        duration: 2 + Math.random(),
        delay,
        repeat: Infinity,
        repeatDelay: 0.5 + Math.random() * 1.5,
        ease: "easeOut",
      }}
      className="absolute pointer-events-none select-none"
      style={{
        fontSize: "10px",
        top: 0,
        left: "50%",
        color,
        zIndex: 50,
        lineHeight: 1,
      }}
    >
      {particle}
    </motion.span>
  );
}

export default function TagBadge({ tag, alwaysAnimate = false }) {
  const effect = tag?.effect || "none";
  const isRainbow = effect === "rainbow";
  const particles = getParticlesForEffect(effect);
  const config = EFFECT_CONFIG[effect] || EFFECT_CONFIG.none;
  const shouldAnimate = alwaysAnimate || particles.length > 0;

  const particleList = useMemo(() => {
    if (!shouldAnimate || particles.length === 0) return [];
    const count = 8;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      particle: particles[i % particles.length],
      delay: i * 0.3,
      startX: (i - count / 2) * 8 + (Math.random() - 0.5) * 6,
      color: config.colors[i % (config.colors.length || 1)] || "#fff",
    }));
  }, [effect, tag?.name]);

  const [rainbowAngle, setRainbowAngle] = useState(0);
  useEffect(() => {
    if (!isRainbow) return;
    const interval = setInterval(() => setRainbowAngle(a => (a + 2) % 360), 50);
    return () => clearInterval(interval);
  }, [isRainbow]);

  if (!tag) return null;

  const labelStyle = isRainbow
    ? {
        backgroundColor: "#1e1b2e",
        borderColor: "#8b5cf6",
        color: "transparent",
        backgroundImage: `linear-gradient(${rainbowAngle}deg, #ff0080, #ff8c00, #ffd700, #00ff00, #00bfff, #8b5cf6)`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }
    : {
        backgroundColor: tag.bg_color || "#1e1b2e",
        borderColor: tag.color || "#8b5cf6",
        color: tag.color || "#ffffff",
        boxShadow: shouldAnimate ? `0 0 8px ${tag.color || "#8b5cf6"}50` : undefined,
      };

  return (
    <span className="relative inline-flex items-center" style={{ isolation: "isolate" }}>
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border select-none transition-all duration-200"
        style={labelStyle}
      >
        {tag.icon && <span style={isRainbow ? { WebkitTextFillColor: "initial", backgroundClip: "unset" } : {}}>{tag.icon}</span>}
        {tag.label}
      </span>

      {/* Continuous floating particles */}
      {particleList.map((p) => (
        <FloatingParticle
          key={p.id}
          particle={p.particle}
          delay={p.delay}
          startX={p.startX}
          color={p.color}
        />
      ))}
    </span>
  );
}