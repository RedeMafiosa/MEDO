import React from "react";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline } from "lucide-react";

export default function RichTextToolbar({ isBold, isItalic, isUnderline, onBold, onItalic, onUnderline }) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className={`h-7 w-7 p-0 font-bold ${isBold ? "bg-secondary text-primary" : "text-muted-foreground"}`}
        onClick={onBold}
        title="Negrito"
      >
        <Bold className="w-3.5 h-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`h-7 w-7 p-0 ${isItalic ? "bg-secondary text-primary" : "text-muted-foreground"}`}
        onClick={onItalic}
        title="Itálico"
      >
        <Italic className="w-3.5 h-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`h-7 w-7 p-0 ${isUnderline ? "bg-secondary text-primary" : "text-muted-foreground"}`}
        onClick={onUnderline}
        title="Sublinhado"
      >
        <Underline className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}