const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit3, X, Image, Type, Trash2, Plus, GripVertical, Upload } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// A single draggable overlay element rendered on the page
function OverlayElement({ item, onDelete, onUpdate, isEditing }) {
  const [pos, setPos] = useState({ x: item.pos_x || 100, y: item.pos_y || 100 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);
  const elemRef = useRef(null);

  const handleMouseDown = (e) => {
    if (!isEditing) return;
    e.preventDefault();
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const dx = e.clientX - dragStart.current.mx;
      const dy = e.clientY - dragStart.current.my;
      setPos({ x: dragStart.current.px + dx, y: dragStart.current.py + dy });
    };
    const onUp = () => {
      setDragging(false);
      onUpdate(item.id, { pos_x: pos.x, pos_y: pos.y });
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [dragging, pos]);

  if (!item.is_visible) return null;

  return createPortal(
    <div
      ref={elemRef}
      style={{ position: "fixed", left: pos.x, top: pos.y, zIndex: item.z_index || 100, cursor: isEditing ? "grab" : "default", userSelect: "none" }}
      onMouseDown={handleMouseDown}
    >
      {/* Edit handle */}
      {isEditing && (
        <div className="absolute -top-7 left-0 flex items-center gap-1 bg-black/80 rounded-t-lg px-2 py-0.5">
          <GripVertical className="w-3 h-3 text-white/60" />
          <button onClick={() => onDelete(item.id)} className="text-red-400 hover:text-red-300">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {item.type === "text" && (
        <div
          style={{ fontSize: item.font_size || 16, color: item.color || "#ffffff", maxWidth: item.width || 300 }}
          className="font-bold drop-shadow-lg pointer-events-none select-none"
        >
          {item.content}
        </div>
      )}
      {(item.type === "image" || item.type === "gif") && (
        <img
          src={item.content}
          alt=""
          style={{ width: item.width || 200, borderRadius: 8 }}
          className="drop-shadow-lg pointer-events-none select-none"
          draggable={false}
        />
      )}
    </div>,
    document.body
  );
}

// The editor panel itself (draggable panel)
export default function SiteEditor() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingMode, setEditingMode] = useState(false);
  const [addType, setAddType] = useState("image"); // "image" | "gif" | "text"
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [colorInput, setColorInput] = useState("#ffffff");
  const [sizeInput, setSizeInput] = useState(200);
  const [fontSizeInput, setFontSizeInput] = useState(20);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const isAdmin = user?.role === "admin";

  const { data: overlays = [] } = useQuery({
    queryKey: ["site-overlays"],
    queryFn: () => db.entities.SiteOverlay.filter({ is_visible: true }, "-created_date", 100),
    refetchInterval: 30000,
    enabled: true,
  });

  const addOverlay = useMutation({
    mutationFn: (data) => db.entities.SiteOverlay.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["site-overlays"] }); toast.success("Elemento adicionado!"); setUrlInput(""); setTextInput(""); },
  });

  const deleteOverlay = useMutation({
    mutationFn: (id) => db.entities.SiteOverlay.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-overlays"] }),
  });

  const updateOverlay = useMutation({
    mutationFn: ({ id, data }) => db.entities.SiteOverlay.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-overlays"] }),
  });

  const handleAdd = () => {
    if (addType === "text") {
      if (!textInput.trim()) return toast.error("Escreve um texto!");
      addOverlay.mutate({ type: "text", content: textInput.trim(), color: colorInput, font_size: fontSizeInput, pos_x: 200, pos_y: 200, is_visible: true });
    } else {
      if (!urlInput.trim()) return toast.error("Cole um URL ou carrega um ficheiro!");
      addOverlay.mutate({ type: addType, content: urlInput.trim(), width: sizeInput, pos_x: 200, pos_y: 200, is_visible: true });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const res = await db.integrations.Core.UploadFile({ file });
    setUrlInput(res.file_url);
    setUploading(false);
    toast.success("Ficheiro carregado!");
  };

  const handleUpdate = (id, data) => updateOverlay.mutate({ id, data });

  if (!isAdmin) {
    // Non-admins only see the overlays, no panel
    return (
      <>
        {overlays.map(item => (
          <OverlayElement key={item.id} item={item} onDelete={() => {}} onUpdate={() => {}} isEditing={false} />
        ))}
      </>
    );
  }

  return (
    <>
      {/* Render all overlays */}
      {overlays.map(item => (
        <OverlayElement
          key={item.id} item={item}
          onDelete={(id) => deleteOverlay.mutate(id)}
          onUpdate={handleUpdate}
          isEditing={editingMode}
        />
      ))}

      {/* Admin Edit Button */}
      <div className="fixed bottom-24 right-6 z-[300] flex flex-col items-end gap-2">
        <AnimatePresence>
          {panelOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="w-72 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/10">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold">Editor do Site</span>
                </div>
                <button onClick={() => setPanelOpen(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>

              <div className="p-4 space-y-4">
                {/* Toggle drag mode */}
                <button
                  onClick={() => setEditingMode(!editingMode)}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    editingMode ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  <GripVertical className="w-4 h-4" />
                  {editingMode ? "Modo Arrastar ACTIVO — Clica para sair" : "Activar Modo Arrastar"}
                </button>

                {/* Type tabs */}
                <div className="flex gap-1">
                  {[
                    { key: "image", label: "Imagem", icon: Image },
                    { key: "gif",   label: "GIF",    icon: Image },
                    { key: "text",  label: "Texto",  icon: Type  },
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setAddType(key)}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        addType === key ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-3 h-3" />{label}
                    </button>
                  ))}
                </div>

                {/* Image / GIF inputs */}
                {(addType === "image" || addType === "gif") && (
                  <div className="space-y-2">
                    <Button
                      variant="outline" size="sm" className="w-full gap-2 text-xs"
                      onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {uploading ? "A carregar..." : "Upload ficheiro"}
                    </Button>
                    <input ref={fileInputRef} type="file" accept="image/*,.gif" className="hidden" onChange={handleFileUpload} />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />ou<div className="h-px flex-1 bg-border" /></div>
                    <Input
                      placeholder="Cole URL da imagem / GIF..."
                      value={urlInput}
                      onChange={e => setUrlInput(e.target.value)}
                      className="text-xs bg-secondary border-none"
                    />
                    {urlInput && (
                      <img src={urlInput} alt="" className="w-full h-24 object-contain rounded-lg bg-secondary"
                        onError={e => e.target.style.display = "none"} />
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">Tamanho:</span>
                      <input type="range" min={50} max={600} value={sizeInput} onChange={e => setSizeInput(Number(e.target.value))}
                        className="flex-1" />
                      <span className="text-xs text-muted-foreground">{sizeInput}px</span>
                    </div>
                  </div>
                )}

                {/* Text inputs */}
                {addType === "text" && (
                  <div className="space-y-2">
                    <Input
                      placeholder="Texto para mostrar no site..."
                      value={textInput}
                      onChange={e => setTextInput(e.target.value)}
                      className="text-xs bg-secondary border-none"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Cor:</span>
                      <input type="color" value={colorInput} onChange={e => setColorInput(e.target.value)} className="h-7 w-10 rounded cursor-pointer bg-transparent border-none" />
                      <span className="text-xs text-muted-foreground">Tamanho:</span>
                      <input type="range" min={10} max={80} value={fontSizeInput} onChange={e => setFontSizeInput(Number(e.target.value))}
                        className="flex-1" />
                      <span className="text-xs text-muted-foreground">{fontSizeInput}px</span>
                    </div>
                    {textInput && (
                      <div className="p-2 bg-secondary rounded-lg text-center" style={{ color: colorInput, fontSize: Math.min(fontSizeInput, 24) }}>
                        {textInput}
                      </div>
                    )}
                  </div>
                )}

                <Button className="w-full gap-2 text-sm" onClick={handleAdd} disabled={addOverlay.isPending}>
                  <Plus className="w-4 h-4" />
                  Adicionar ao Site
                </Button>

                {/* List of current overlays */}
                {overlays.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-semibold">Elementos no site ({overlays.length})</p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {overlays.map(item => (
                        <div key={item.id} className="flex items-center gap-2 p-2 bg-secondary rounded-lg">
                          <span className="text-lg flex-shrink-0">
                            {item.type === "text" ? "T" : "🖼"}
                          </span>
                          <span className="text-xs truncate flex-1 text-muted-foreground">
                            {item.type === "text" ? item.content : item.content?.split("/").pop()}
                          </span>
                          <button onClick={() => deleteOverlay.mutate(item.id)} className="text-destructive hover:text-destructive/80 flex-shrink-0">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${
            panelOpen ? "bg-destructive text-white" : "bg-yellow-500 text-black hover:bg-yellow-400"
          }`}
          title="Editor do Site"
        >
          {panelOpen ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
        </button>
      </div>
    </>
  );
}