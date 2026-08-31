import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Plus,
  Layers,
  Cpu,
  Package,
  Calendar,
  CheckSquare,
  Square,
  Clock,
  Zap,
  Info,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { PPCRequirementDocument, PPCRequirementItem } from '../../../types/ppc';

interface PPCOCRImportTabProps {
  onPlanGenerated?: () => void;
}

export const PPCOCRImportTab: React.FC<PPCOCRImportTabProps> = ({ onPlanGenerated }) => {
  const {
    ppcRequirementDocs,
    products,
    machines,
    currentUser,
    addPPCRequirementDoc,
    generatePlansFromRequirementDoc,
    triggerHaptic,
  } = useApp();

  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string>(ppcRequirementDocs[0]?.id || '');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [rawTextPrompt, setRawTextPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');

  const currentDoc = ppcRequirementDocs.find((d) => d.id === selectedDocId) || ppcRequirementDocs[0];

  const handleScanSample = async (sampleType: 'tata' | 'mahindra' | 'bajaj') => {
    setIsScanning(true);
    setScanError(null);
    triggerHaptic();

    let samplePayload = '';
    if (sampleType === 'tata') {
      samplePayload = `CUSTOMER: Tata Motors Ltd (Pune Plant)
PO NUMBER: PO-TATA-2026-8941
DATE: 2026-09-01
DELIVERY DUE: 2026-09-18
SCHEDULE:
1. Part: TATA-IM-901 | Desc: Front Bumper Grille Clip (4-Cavity) | Cust Part: 5442-8819-01 | Qty: 45,000 pcs | Mat: ABS FR | Priority: HIGH
2. Part: TATA-IM-902 | Desc: HVAC Air Louver Blade Set | Cust Part: 7721-9920-00 | Qty: 30,000 pcs | Mat: PP 20% Talc | Priority: MEDIUM
3. Part: TATA-IM-905 | Desc: Dashboard Console Bracket | Cust Part: 3310-4491-02 | Qty: 15,000 pcs | Mat: PA66 GF30 | Priority: CRITICAL`;
    } else if (sampleType === 'mahindra') {
      samplePayload = `CUSTOMER: Mahindra & Mahindra Auto Div
PO NUMBER: PO-MM-2026-1184
DATE: 2026-09-02
DELIVERY DUE: 2026-09-22
SCHEDULE:
1. Part: MM-INJ-401 | Desc: Wheel Arch Flare Fastener Pin | Cust Part: MM-88219 | Qty: 60,000 pcs | Mat: POM Delrin | Priority: HIGH
2. Part: MM-INJ-405 | Desc: Fuse Box Top Cover Flap | Cust Part: MM-44312 | Qty: 20,000 pcs | Mat: Polycarbonate Flame Retardant | Priority: HIGH`;
    } else {
      samplePayload = `CUSTOMER: Bajaj Auto Ltd
PO NUMBER: PO-BAL-2026-773
DATE: 2026-09-03
DELIVERY DUE: 2026-09-15
SCHEDULE:
1. Part: BAJ-MTR-108 | Desc: Handlebar Switch Bezel Left | Cust Part: BJ-9912 | Qty: 25,000 pcs | Mat: ABS Glossy Black | Priority: CRITICAL
2. Part: BAJ-MTR-110 | Desc: Tail Lamp Reflector Housing | Cust Part: BJ-4419 | Qty: 18,000 pcs | Mat: PMMA Acrylic Optical | Priority: HIGH`;
    }

    try {
      const response = await fetch('/api/ppc/ocr-requirement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: samplePayload,
          documentTitle: `${sampleType.toUpperCase()} Production Schedule Release`,
          companyId: 'comp-apex',
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        const newDoc = addPPCRequirementDoc(data.data);
        setSelectedDocId(newDoc.id);
        // Select all by default
        setSelectedItemIds(newDoc.extractedItems.map((i: PPCRequirementItem) => i.id));
      } else {
        throw new Error(data.message || 'Failed to extract requirements');
      }
    } catch (err: any) {
      setScanError(err.message || 'OCR parsing failed. Falling back to local template.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanError(null);
    triggerHaptic();

    try {
      // Read file text or base64
      const reader = new FileReader();
      reader.onload = async () => {
        const fileContent = reader.result as string;
        const response = await fetch('/api/ppc/ocr-requirement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentText: fileContent.substring(0, 5000),
            documentTitle: file.name.replace(/\.[^/.]+$/, ''),
            companyId: 'comp-apex',
          }),
        });

        const data = await response.json();
        if (data.success && data.data) {
          const newDoc = addPPCRequirementDoc(data.data);
          setSelectedDocId(newDoc.id);
          setSelectedItemIds(newDoc.extractedItems.map((i: PPCRequirementItem) => i.id));
        } else {
          throw new Error(data.message || 'Failed to process document');
        }
        setIsScanning(false);
      };
      reader.readAsText(file);
    } catch (err: any) {
      setScanError(err.message || 'OCR extraction error');
      setIsScanning(false);
    }
  };

  const handleToggleSelectAll = () => {
    if (!currentDoc) return;
    if (selectedItemIds.length === currentDoc.extractedItems.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(currentDoc.extractedItems.map((i) => i.id));
    }
  };

  const handleToggleItem = (itemId: string) => {
    if (selectedItemIds.includes(itemId)) {
      setSelectedItemIds(selectedItemIds.filter((id) => id !== itemId));
    } else {
      setSelectedItemIds([...selectedItemIds, itemId]);
    }
  };

  const handleGeneratePlans = () => {
    if (!currentDoc) return;
    const generated = generatePlansFromRequirementDoc(currentDoc.id, selectedItemIds);
    triggerHaptic();
    alert(`Successfully created ${generated.length} production plans with automated capacity loading & shift targets!`);
    if (onPlanGenerated) onPlanGenerated();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Toggle */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 p-5 rounded-2xl border border-purple-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            AI Production Requirement OCR & Auto-Scheduler
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Extract POs, Monthly Customer Releases & MRP schedules with automatic Master Matching
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'upload'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            Scan & Extract
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            Requirement Docs ({ppcRequirementDocs.length})
          </button>
        </div>
      </div>

      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Box / Samples Column */}
          <div className="space-y-4">
            {/* Dropzone */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border-2 border-dashed border-slate-700 hover:border-purple-500 transition-colors text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Upload PO / MRP Schedule</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">PDF, Excel CSV, or Image (JPEG/PNG)</p>
              </div>

              <label className="inline-block cursor-pointer px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 active:scale-95 transition-all">
                <span>Select Document</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Quick Demo Pre-sets */}
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Quick Customer Release Demo Samples
              </div>
              <p className="text-[11px] text-slate-400">
                1-Tap test AI OCR extractor with realistic OEM injection molding purchase orders:
              </p>
              <div className="space-y-2 pt-1">
                <button
                  disabled={isScanning}
                  onClick={() => handleScanSample('tata')}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <div className="font-semibold text-slate-200">Tata Motors Schedule Release</div>
                    <div className="text-[10px] text-slate-400 font-mono">3 Automotive Part Numbers (90k pcs)</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-purple-400" />
                </button>

                <button
                  disabled={isScanning}
                  onClick={() => handleScanSample('mahindra')}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <div className="font-semibold text-slate-200">Mahindra Auto Injection PO</div>
                    <div className="text-[10px] text-slate-400 font-mono">2 Fastener & Cover Components (80k pcs)</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-purple-400" />
                </button>

                <button
                  disabled={isScanning}
                  onClick={() => handleScanSample('bajaj')}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <div className="font-semibold text-slate-200">Bajaj Auto 2-Wheeler Schedule</div>
                    <div className="text-[10px] text-slate-400 font-mono">2 Switch & Lens Items (43k pcs)</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-purple-400" />
                </button>
              </div>
            </div>

            {/* Scanning Indicator */}
            {isScanning && (
              <div className="bg-purple-950/60 p-4 rounded-2xl border border-purple-500/40 text-center space-y-2">
                <RefreshCw className="w-6 h-6 text-purple-400 animate-spin mx-auto" />
                <div className="font-bold text-xs text-white">Gemini AI Extracting Schedule...</div>
                <div className="text-[10px] text-purple-300">
                  Parsing component part numbers, quantities, due dates & matching tooling masters
                </div>
              </div>
            )}

            {scanError && (
              <div className="bg-rose-950/60 p-3 rounded-xl border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{scanError}</span>
              </div>
            )}
          </div>

          {/* Extracted Requirements Preview & Conversion */}
          <div className="lg:col-span-2 space-y-4">
            {currentDoc ? (
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-sm space-y-4 p-5">
                {/* Document Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{currentDoc.title}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-950 text-purple-300 border border-purple-800 font-mono font-bold">
                        v{currentDoc.version}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      Customer: <span className="text-slate-200 font-semibold">{currentDoc.customerName}</span> • PO: <span className="text-cyan-400 font-semibold">{currentDoc.poNumber}</span>
                    </div>
                  </div>

                  {/* Convert CTA */}
                  <button
                    onClick={handleGeneratePlans}
                    disabled={selectedItemIds.length === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 active:scale-95 transition-all self-start sm:self-center shrink-0"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Convert {selectedItemIds.length} to Production Plan</span>
                  </button>
                </div>

                {/* Extracted Items Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <button
                      onClick={handleToggleSelectAll}
                      className="flex items-center gap-1.5 text-slate-400 hover:text-white font-medium"
                    >
                      {selectedItemIds.length === currentDoc.extractedItems.length ? (
                        <CheckSquare className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500" />
                      )}
                      <span>Select All Extracted Items ({currentDoc.extractedItems.length})</span>
                    </button>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Total Requirement: {currentDoc.totalRequirementQty.toLocaleString()} pcs
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {currentDoc.extractedItems.map((item) => {
                      const isChecked = selectedItemIds.includes(item.id);
                      const matchedProd = products.find(
                        (p) =>
                          p.sku.toLowerCase() === item.partNumber.toLowerCase() ||
                          p.name.toLowerCase().includes(item.componentName.toLowerCase())
                      );

                      const cycle = item.matchedCycleTimeSec || matchedProd?.standardCycleTimeSec || 35;
                      const cav = item.matchedCavities || matchedProd?.cavitiesActive || 2;
                      const ratePerHour = Math.round((3600 / cycle) * cav * 0.85);

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleToggleItem(item.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-slate-950 border-cyan-500/50 shadow-md shadow-cyan-950/20'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 text-cyan-400">
                                {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-600" />}
                              </div>
                              <div>
                                <div className="font-bold text-xs text-white flex items-center gap-2">
                                  <span>{item.componentName}</span>
                                  <span className="font-mono text-cyan-400">({item.partNumber})</span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  Cust Part: {item.customerPartNumber || 'N/A'} • Due: <span className="text-slate-200 font-semibold">{item.dueDate}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-sm font-bold font-mono text-white">
                                {item.requiredQuantity.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">pcs</span>
                              </div>
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold mt-0.5 ${
                                  item.priority === 'CRITICAL'
                                    ? 'bg-rose-600/20 text-rose-300'
                                    : item.priority === 'HIGH'
                                    ? 'bg-amber-600/20 text-amber-300'
                                    : 'bg-blue-600/20 text-blue-300'
                                }`}
                              >
                                {item.priority}
                              </span>
                            </div>
                          </div>

                          {/* Master Matching Engine Bar */}
                          <div className="mt-2.5 pt-2.5 border-t border-slate-900 grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-400 bg-slate-900/60 p-2 rounded-lg">
                            <div>
                              <span className="text-slate-500">Mould:</span> <span className="text-slate-200">{item.matchedMouldCode || matchedProd?.mouldCode || 'MLD-01'}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Machine:</span> <span className="text-blue-300 font-semibold">{item.matchedMachineCode || 'IM-01 (180T)'}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Output:</span> <span className="text-emerald-400 font-bold">{ratePerHour} pcs/hr</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 text-center text-slate-400">
                <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs">No requirement documents uploaded yet. Upload a schedule or try a sample release.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
            <h3 className="font-bold text-slate-200">Historical Requirement Documents & OCR Logs</h3>
            <span className="text-[11px] text-slate-400 font-mono">{ppcRequirementDocs.length} Total Uploads</span>
          </div>

          <div className="divide-y divide-slate-800">
            {ppcRequirementDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{doc.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-950 text-purple-300 border border-purple-800 font-mono font-bold">
                      v{doc.version}
                    </span>
                  </div>
                  <div className="text-slate-400 font-mono text-[11px] mt-1">
                    Customer: <span className="text-slate-200">{doc.customerName}</span> • PO: <span className="text-cyan-400">{doc.poNumber}</span> • Uploaded: {doc.uploadedAt}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right font-mono">
                    <div className="font-bold text-white text-sm">{doc.totalRequirementQty.toLocaleString()} pcs</div>
                    <div className="text-[10px] text-slate-400">{doc.itemsCount} line items</div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedDocId(doc.id);
                      setSelectedItemIds(doc.extractedItems.map((i) => i.id));
                      setActiveTab('upload');
                      triggerHaptic();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold"
                  >
                    View & Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
