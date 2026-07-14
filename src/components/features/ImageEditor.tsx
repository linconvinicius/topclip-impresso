import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, RotateCw, Save, X, Maximize, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ImageEditorProps {
  imageUrl: string;
  initialBox?: { x: number; y: number; width: number; height: number };
  onSave: (box: { x: number; y: number; width: number; height: number }) => void;
  onClose: () => void;
}

export default function ImageEditor({ imageUrl, initialBox, onSave, onClose }: ImageEditorProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [box, setBox] = useState(initialBox || { x: 50, y: 50, width: 200, height: 150 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  // Basic drag/resize logic placeholders for initial layout
  // We'll enhance this into a full interactive canvas/SVG later

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-6xl h-[90vh] flex flex-col surface-elevated rounded-xl border border-border shadow-2xl overflow-hidden"
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleZoomOut} className="h-8 w-8"><ZoomOut className="h-4 w-4" /></Button>
            <span className="text-xs font-mono-data w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="icon" onClick={handleZoomIn} className="h-8 w-8"><ZoomIn className="h-4 w-4" /></Button>
            <div className="w-px h-4 bg-border mx-2" />
            <Button variant="outline" size="icon" onClick={handleRotate} className="h-8 w-8"><RotateCw className="h-4 w-4" /></Button>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-foreground">
              Cancelar
            </Button>
            <Button size="sm" onClick={() => onSave(box)} className="click-press">
              <Save className="h-4 w-4 mr-2" /> Salvar Recorte
            </Button>
            <Button variant="outline" size="icon" onClick={onClose} className="h-8 w-8"><X className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Viewport Area */}
        <div className="flex-1 relative bg-neutral-900 overflow-auto p-8 flex items-center justify-center" ref={containerRef}>
          <div 
            style={{ 
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            className="relative shadow-2xl"
          >
            <img src={imageUrl} alt="Scan" className="max-w-none block h-auto select-none pointer-events-none" />
            
            {/* Interactive Clipping Box */}
            <div 
              style={{
                left: box.x,
                top: box.y,
                width: box.width,
                height: box.height,
              }}
              className="absolute border-2 border-primary bg-primary/10 cursor-move group"
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Move className="h-6 w-6 text-primary drop-shadow-md" />
              </div>
              
              {/* Resizer Handles */}
              {['nw', 'ne', 'sw', 'se'].map(handle => (
                <div 
                  key={handle}
                  className={`absolute h-3 w-3 bg-primary border border-white rounded-full ${
                    handle === 'nw' ? '-top-1.5 -left-1.5 cursor-nw-resize' :
                    handle === 'ne' ? '-top-1.5 -right-1.5 cursor-ne-resize' :
                    handle === 'sw' ? '-bottom-1.5 -left-1.5 cursor-sw-resize' :
                    '-bottom-1.5 -right-1.5 cursor-se-resize'
                  }`}
                />
              ))}
              
              {/* Corner Metadata */}
              <div className="absolute -top-6 left-0 bg-primary text-[10px] text-white px-2 py-0.5 rounded-t-md font-mono-data">
                {Math.round(box.width)}x{Math.round(box.height)}px
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Status */}
        <div className="p-3 border-t border-border bg-secondary/30 flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-mono-data">
          <div className="flex gap-4">
            <span>X: {Math.round(box.x)}</span>
            <span>Y: {Math.round(box.y)}</span>
          </div>
          <span>Página Principal (Scan)</span>
        </div>
      </motion.div>
    </div>
  );
}
