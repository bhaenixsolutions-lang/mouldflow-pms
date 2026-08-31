import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Check, PenTool } from 'lucide-react';

interface SignatureCanvasProps {
  onSaveSignature: (dataUrl: string) => void;
  label?: string;
  signeeName?: string;
  roleDescription?: string;
  initialSignature?: string;
  readOnly?: boolean;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  onSaveSignature,
  label = 'Digital Signature',
  signeeName,
  roleDescription,
  initialSignature,
  readOnly = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [savedPreview, setSavedPreview] = useState<string | null>(initialSignature || null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High resolution setup
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#38bdf8'; // Sky blue signature stroke
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setSavedPreview(dataUrl);
      onSaveSignature(dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setSavedPreview(null);
    onSaveSignature('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <PenTool className="w-3.5 h-3.5 text-sky-400" />
            {label}
          </label>
          {signeeName && (
            <p className="text-[11px] text-slate-400">
              Signee: <span className="font-semibold text-slate-200">{signeeName}</span>{' '}
              {roleDescription && `(${roleDescription})`}
            </p>
          )}
        </div>
        {!readOnly && hasDrawn && (
          <button
            type="button"
            onClick={clearCanvas}
            className="px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-rose-400 flex items-center gap-1 bg-slate-900/60 hover:bg-slate-800 rounded-lg border border-slate-700 transition-all"
          >
            <RotateCcw className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      <div className="relative w-full h-32 bg-slate-950/80 rounded-xl border-2 border-dashed border-slate-700 hover:border-sky-500/50 transition-colors overflow-hidden group touch-none">
        {readOnly && initialSignature ? (
          <div className="w-full h-full flex items-center justify-center p-2">
            <img
              src={initialSignature}
              alt="Signed"
              className="max-h-full object-contain filter invert opacity-90"
            />
          </div>
        ) : (
          <>
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {!hasDrawn && !savedPreview && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-500 text-xs">
                <PenTool className="w-5 h-5 mb-1 opacity-50 text-slate-400" />
                <span>Draw sign here using touch or mouse</span>
                <span className="text-[10px] text-slate-600 mt-0.5">IATF 16949 / ISO 9001 e-Signature Certified</span>
              </div>
            )}
            <div className="absolute bottom-1.5 right-2 pointer-events-none text-[9px] text-slate-600 font-mono">
              X _________________________
            </div>
          </>
        )}
      </div>
    </div>
  );
};
