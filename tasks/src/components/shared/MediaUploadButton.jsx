import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Image } from "lucide-react";

export default function MediaUploadButton({ onUpload, accept = "image/*,image/gif", label = "Foto/GIF", compact = false }) {
  const ref = useRef();

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const type = file.type.includes("gif") ? "gif" : "image";
    onUpload(file, type);
    e.target.value = "";
  };

  return (
    <>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={handleChange} />
      <Button
        type="button"
        variant="ghost"
        size={compact ? "sm" : "sm"}
        className={`gap-1.5 text-muted-foreground hover:text-foreground ${compact ? "h-7 px-2 text-xs" : ""}`}
        onClick={() => ref.current?.click()}
      >
        <Image className={compact ? "w-3 h-3" : "w-4 h-4"} />
        {label}
      </Button>
    </>
  );
}