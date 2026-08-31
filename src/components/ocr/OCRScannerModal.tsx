import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileSpreadsheet,
  Layers,
  RefreshCw,
  Eye,
  Zap,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { extractProductionReportWithOCR } from '../../services/geminiService';
import { OCRScanResult, REJECTION_CODES_MAP, DOWNTIME_CODES_MAP } from '../../types/schema';
import { OCRReviewModal } from './OCRReviewModal';

interface OCRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OCRScannerModal: React.FC<OCRScannerModalProps> = ({ isOpen, onClose }) => {
  const {
    departments,
    machines,
    products,
    applyOcrResultToReport,
    triggerHaptic,
  } = useApp();

  const [selectedDept, setSelectedDept] = useState<string>('Moulding');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<OCRScanResult | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);

  // Two completely separate HTML file input references
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Sample production sheet presets for 1-tap testing
  const samplePresets = [
    {
      title: 'Moulding Shift Log (IMM-01)',
      dept: 'Moulding',
      machineCode: 'IMM-01',
      sku: 'CON-PBT-08P',
      sampleText: 'IMM-01 SHIFT-A MOULDING REPORT | CON-PBT-08P | TOTAL: 4980 PCS | REJ: 59 | DT: 22 MIN',
      preview: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%231e293b"/><text x="20" y="30" fill="%2394a3b8" font-family="monospace" font-size="12">DAILY PRODUCTION REPORT - INJECTION</text><text x="20" y="60" fill="%23f8fafc" font-family="monospace" font-size="14">MACHINE: IMM-01 | SHIFT: A</text><text x="20" y="85" fill="%2338bdf8" font-family="monospace" font-size="12">SKU: CON-PBT-08P (8-Pin Header)</text><line x1="20" y1="100" x2="280" y2="100" stroke="%23475569" stroke-width="1"/><text x="20" y="125" fill="%234ade80" font-family="monospace" font-size="12">ACTUAL: 1790 (H1-H3) | REJ: 25 | DT: 14m</text><text x="20" y="150" fill="%23fb7185" font-family="monospace" font-size="11">DEFECT: [A] Short Shot (16 pcs)</text><text x="20" y="175" fill="%23facc15" font-family="monospace" font-size="11">DT REASON: [3] Material Empty (14 min)</text></svg>',
    },
    {
      title: 'Insert Assembly Log (ASM-01)',
      dept: 'Insert Assembly',
      machineCode: 'ASM-01',
      sku: 'SWG-PCABS-2C',
      sampleText: 'ASM-01 SHIFT-A INSERT ASSEMBLY | SWG-PCABS-2C | TOTAL: 3340 PCS | REJ: 35 | DT: 10 MIN',
      preview: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%231e293b"/><text x="20" y="30" fill="%2394a3b8" font-family="monospace" font-size="12">ASSEMBLY PRODUCTION SHEET</text><text x="20" y="60" fill="%23f8fafc" font-family="monospace" font-size="14">LINE: ASM-01 | SHIFT: A</text><text x="20" y="85" fill="%2338bdf8" font-family="monospace" font-size="12">SKU: SWG-PCABS-2C (Dual Rocker)</text><line x1="20" y1="100" x2="280" y2="100" stroke="%23475569" stroke-width="1"/><text x="20" y="125" fill="%234ade80" font-family="monospace" font-size="12">ACTUAL: 1250 | REJ: 18 | DT: 10m</text><text x="20" y="150" fill="%23fb7185" font-family="monospace" font-size="11">DEFECT: [F] Misaligned Pin</text></svg>',
    },
    {
      title: 'BDV Dielectric Test Log (BDV-01)',
      dept: 'BDV',
      machineCode: 'BDV-01',
      sku: 'CON-PBT-08P',
      sampleText: 'BDV-01 HIGH VOLTAGE LOG | TEST 3.75kV | TOTAL TESTED: 4800 | REJ: 12 | PASS: 99.75%',
      preview: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%231e293b"/><text x="20" y="30" fill="%2394a3b8" font-family="monospace" font-size="12">BDV DIELECTRIC BREAKDOWN REPORT</text><text x="20" y="60" fill="%23f8fafc" font-family="monospace" font-size="14">TEST BENCH: BDV-01 | VOLTAGE: 3.75 kV</text><text x="20" y="85" fill="%2338bdf8" font-family="monospace" font-size="12">INSULATION RESISTANCE &gt; 1000 MΩ</text><line x1="20" y1="100" x2="280" y2="100" stroke="%23475569" stroke-width="1"/><text x="20" y="125" fill="%234ade80" font-family="monospace" font-size="12">TESTED: 1600 | SPARK FAIL: 4 | 99.75%</text></svg>',
    },
  ];

  const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset the input value so user can take/select another image seamlessly
    e.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setPreviewImage(base64);
      runOcrProcess(base64, selectedDept);
    };
    reader.readAsDataURL(file);
  };

  const handlePresetSelect = (preset: typeof samplePresets[0]) => {
    triggerHaptic();
    setSelectedDept(preset.dept);
    setPreviewImage(preset.preview);
    runOcrProcess(preset.preview, preset.dept, { machineCode: preset.machineCode, productSku: preset.sku });
  };

  const runOcrProcess = async (
    imageBase64: string,
    dept: string,
    fallback?: { machineCode?: string; productSku?: string }
  ) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setScanResult(null);

    try {
      const result = await extractProductionReportWithOCR(imageBase64, dept, fallback);
      result.imageThumbnail = imageBase64;
      setScanResult(result);
      setIsReviewOpen(true);
      triggerHaptic();
    } catch (err: any) {
      console.error('OCR Extraction Failed:', err);
      setErrorMessage(err.message || 'Failed to scan document.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xs">
        <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                  AI Vision OCR Scanner
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-600 text-white font-mono">
                    Gemini Flash
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Digitize handwritten/printed shopfloor production log sheets
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto space-y-4 flex-1">
            {/* Department Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Target Department Format
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {departments.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      setSelectedDept(d.name);
                    }}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      selectedDept === d.name
                        ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="truncate text-[11px]">{d.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 1. Camera / File Upload Trigger */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                1. Snap Camera Photo or Select Paper Log
              </label>

              {/* TWO COMPLETELY SEPARATE INPUTS */}
              {/* Camera Input: triggers rear camera directly on Android/iOS with capture="environment" */}
              <input
                ref={cameraInputRef}
                id="ocr-camera-file-input"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageInput}
                className="hidden"
              />

              {/* Gallery/Picker Input: opens file picker / photos WITHOUT camera trigger */}
              <input
                ref={galleryInputRef}
                id="ocr-gallery-file-input"
                type="file"
                accept="image/*,image/jpeg,image/png,image/webp"
                onChange={handleImageInput}
                className="hidden"
              />

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="btn-take-photo-ocr"
                  onClick={() => {
                    triggerHaptic();
                    cameraInputRef.current?.click();
                  }}
                  className="flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs active:scale-95 shadow-md transition-transform"
                >
                  <Camera className="w-4 h-4" />
                  Take Photo
                </button>

                <button
                  type="button"
                  id="btn-select-image-ocr"
                  onClick={() => {
                    triggerHaptic();
                    galleryInputRef.current?.click();
                  }}
                  className="flex items-center justify-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs active:scale-95 border border-slate-700 transition-transform"
                >
                  <Upload className="w-4 h-4" />
                  Select Image
                </button>
              </div>
            </div>

            {/* Image Preview Box when photo or image is loaded */}
            {previewImage && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    Captured Image Preview
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Format: {selectedDept}</span>
                </div>
                <div className="relative rounded-lg overflow-hidden border border-slate-800 max-h-44 flex items-center justify-center bg-slate-900">
                  <img
                    src={previewImage}
                    alt="Captured Paper Log"
                    referrerPolicy="no-referrer"
                    className="max-h-44 object-contain w-full"
                  />
                </div>
              </div>
            )}

            {/* 2. Sample Presets for Testing */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Or Try Industrial Test Sheets (1-Tap Simulation):
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {samplePresets.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePresetSelect(p)}
                    className="p-2 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/80 rounded-xl text-left active:scale-95 transition-all text-xs"
                  >
                    <div className="font-semibold text-slate-200 truncate">{p.title.split(' ')[0]}</div>
                    <div className="text-[10px] text-amber-400 font-mono mt-0.5">{p.machineCode}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Processing State */}
            {isProcessing && (
              <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                <div className="text-sm font-bold text-white">Gemini Vision AI is Analyzing Log Sheet...</div>
                <div className="text-xs text-slate-400">
                  Detecting completed hours, rejection codes A-M, downtime codes 1-10, runner weight & cycle time
                </div>
              </div>
            )}

            {/* Error message */}
            {errorMessage && (
              <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 3. Quick Summary Preview Card if Scan already exists */}
            {scanResult && !isProcessing && (
              <div className="p-3 bg-slate-950 rounded-xl border border-emerald-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Scanned: {scanResult.recognizedMachineCode} ({scanResult.parsedHourlyRows.length} Hours)</span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400 font-bold">{scanResult.confidenceScore}%</span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  Actual: {scanResult.totalActual} pcs • Rejections: {scanResult.totalReject} pcs • Downtime: {scanResult.totalDowntime}m
                </div>
                <button
                  type="button"
                  onClick={() => setIsReviewOpen(true)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Open Full Verification Screen
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Review & Verification Modal */}
      {isReviewOpen && scanResult && (
        <OCRReviewModal
          isOpen={isReviewOpen}
          onClose={() => {
            setIsReviewOpen(false);
            onClose();
          }}
          scanResult={scanResult}
          onRescanRequested={() => {
            setIsReviewOpen(false);
            setScanResult(null);
          }}
        />
      )}
    </>
  );
};

