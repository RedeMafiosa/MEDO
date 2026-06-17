import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";

const EMOJIS = [
  "😀","😂","🥰","😎","🤔","😡","😭","🤩","🥳","😏",
  "👍","👎","❤️","🔥","⭐","💎","🎮","🏆","💰","🎁",
  "🚀","💥","⚡","🌟","🎯","👑","🦁","🐉","🎵","🎉",
  "😱","🤣","😴","🥺","😤","🤯","🎃","🌈","💫","✨",
  "🙏","💪","👀","🫡","🤝","🫶","💬","🔮","🎲","🃏",
];

export default function EmojiPicker({ onSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground" onClick={() => setOpen(!open)}>
        <Smile className="w-4 h-4" />
      </Button>
      {open && (
        <div className="absolute bottom-11 left-0 z-50 bg-card border border-border rounded-xl p-3 shadow-2xl w-64">
          <div className="grid grid-cols-10 gap-1">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => { onSelect(e); setOpen(false); }}
                className="text-lg hover:bg-secondary rounded p-0.5 transition-colors leading-tight">
                {e}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}