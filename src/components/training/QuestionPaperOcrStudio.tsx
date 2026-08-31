import React, { useState, useRef, useMemo } from 'react';
import {
  Upload,
  FileText,
  Camera,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ZoomIn,
  ZoomOut,
  Edit3,
  Trash2,
  Plus,
  ArrowRight,
  ShieldCheck,
  Building,
  HelpCircle,
  Clock,
  Award,
  RefreshCw,
  GitBranch,
  Eye,
  Check,
  Languages,
  Shuffle,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CompanyQuestionPaper, OCRQuestionItem } from '../../types/training';
import { normalizePassMark } from '../../utils/assessmentUtils';

interface QuestionPaperOcrStudioProps {
  initialProgramId?: string;
  onPaperApproved?: (paperId: string) => void;
  onOpenDigitalTest?: (paperId?: string) => void;
}

export const QuestionPaperOcrStudio: React.FC<QuestionPaperOcrStudioProps> = ({
  initialProgramId,
  onPaperApproved,
  onOpenDigitalTest,
}) => {
  const {
    companies,
    selectedCompanyId,
    companyTrainingPrograms,
    companyQuestionPapers,
    importCompanyQuestionPaper,
    approveQuestionPaper,
    triggerHaptic,
  } = useApp();

  const currentCompany = companies.find((c) => c.id === selectedCompanyId) || companies[0];

  const [selectedProgramId, setSelectedProgramId] = useState<string>(
    initialProgramId || companyTrainingPrograms[0]?.id || ''
  );
  const [versionInput, setVersionInput] = useState<string>('1.0');
  const [passingMarks, setPassingMarks] = useState<number>(80);
  const [durationMins, setDurationMins] = useState<number>(30);
  const [randomizeQuestions, setRandomizeQuestions] = useState<boolean>(true);
  const [randomizeOptions, setRandomizeOptions] = useState<boolean>(false);

  // File Upload State
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isTranslatingAll, setIsTranslatingAll] = useState<boolean>(false);
  const [translatingIndex, setTranslatingIndex] = useState<number | null>(null);
  const [ocrConfidence, setOcrConfidence] = useState<number>(94.5);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Extracted Questions Editor State
  const [extractedQuestions, setExtractedQuestions] = useState<OCRQuestionItem[]>([]);
  const [paperTitle, setPaperTitle] = useState<string>('');
  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);
  const [savedPaperId, setSavedPaperId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedProgram = useMemo(() => {
    return companyTrainingPrograms.find((p) => p.id === selectedProgramId);
  }, [companyTrainingPrograms, selectedProgramId]);

  // Existing company questions for duplicate detection
  const existingCompanyQuestions = useMemo(() => {
    const questions: string[] = [];
    companyQuestionPapers
      .filter((qp) => !qp.companyId || qp.companyId === selectedCompanyId)
      .forEach((qp) => {
        qp.questions.forEach((q) => {
          if (q.questionText) questions.push(q.questionText.toLowerCase().trim());
        });
      });
    return questions;
  }, [companyQuestionPapers, selectedCompanyId]);

  // Helper to check for duplicate questions
  const isQuestionDuplicate = (text: string) => {
    if (!text || text.length < 10) return false;
    const cleanText = text.toLowerCase().trim();
    return existingCompanyQuestions.some((eq) => eq === cleanText || eq.includes(cleanText) || cleanText.includes(eq));
  };

  // Sample Presets for instantaneous 1-click test with complete English + Hindi
  const handleLoadPreset = (presetName: string) => {
    triggerHaptic();
    setIsProcessing(true);
    setOriginalFileName(`${presetName.replace(/\s+/g, '_')}_Paper.jpg`);
    
    // Set a realistic sample image
    setPreviewImage(
      'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=800&q=80'
    );

    setTimeout(() => {
      let questions: OCRQuestionItem[] = [];
      let title = `${selectedProgram?.programName || 'Injection Moulding'} Assessment Paper`;

      if (presetName.includes('Safety')) {
        title = 'Injection Moulding Safety & E-Stop Protocol Paper (Bilingual)';
        questions = [
          {
            id: `q-${Date.now()}-1`,
            questionNumber: 1,
            questionText: 'What is the required primary action when an Emergency Stop alarm triggers during machine operation?',
            questionTextHindi: 'उत्पादन के दौरान इंजेक्शन मोल्डिंग मशीन पर इमरजेंसी स्टॉप (E-Stop) अलार्म ट्रिगर होने पर क्या अनिवार्य पहली कार्रवाई होनी चाहिए?',
            questionType: 'Multiple Choice',
            options: [
              { label: 'A', text: 'Immediately reset the e-stop button and resume auto cycle', textHindi: 'ई-स्टॉप बटन को तुरंत रीसेट करें और ऑटो चक्र फिर से शुरू करें' },
              { label: 'B', text: 'Inspect safety gates, isolate power, notify supervisor, and investigate obstruction', textHindi: 'सुरक्षा द्वारों का निरीक्षण करें, पावर आइसोलेट करें, सुपरवाइजर को सूचित करें और रुकावट की जांच करें' },
              { label: 'C', text: 'Force open the mold clamp using mechanical hand tool', textHindi: 'मैकेनिकल हैंड टूल का उपयोग करके मोल्ड क्लैंप को जबरन खोलें' },
              { label: 'D', text: 'Increase barrel heater temperature to melt residual resin', textHindi: 'अवशिष्ट प्लास्टिक पिघल को पिघलाने के लिए बैरल हीटर का तापमान बढ़ाएं' },
            ],
            optionA: 'Immediately reset the e-stop button and resume auto cycle',
            optionB: 'Inspect safety gates, isolate power, notify supervisor, and investigate obstruction',
            optionC: 'Force open the mold clamp using mechanical hand tool',
            optionD: 'Increase barrel heater temperature to melt residual resin',
            optionAHindi: 'ई-स्टॉप बटन को तुरंत रीसेट करें और ऑटो चक्र फिर से शुरू करें',
            optionBHindi: 'सुरक्षा द्वारों का निरीक्षण करें, पावर आइसोलेट करें, सुपरवाइजर को सूचित करें और रुकावट की जांच करें',
            optionCHindi: 'मैकेनिकल हैंड टूल का उपयोग करके मोल्ड क्लैंप को जबरन खोलें',
            optionDHindi: 'अवशिष्ट प्लास्टिक पिघल को पिघलाने के लिए बैरल हीटर का तापमान बढ़ाएं',
            correctAnswer: 'B',
            explanation: 'OSHA & ISO 20430 standards require lockout inspection and shift supervisor sign-off before resetting emergency interlocks.',
            explanationHindi: 'OSHA और ISO 20430 मानकों के अनुसार आपातकालीन इंटरलॉक को रीसेट करने से पहले लॉकआउट निरीक्षण और सुपरवाइजर की मंजूरी अनिवार्य है।',
            marks: 20,
            confidence: 97,
            status: 'Approved',
          },
          {
            id: `q-${Date.now()}-2`,
            questionNumber: 2,
            questionText: 'Mechanical safety drop bars on horizontal injection moulding machines must be checked at the start of every shift.',
            questionTextHindi: 'हॉरिजॉन्टल इंजेक्शन मोल्डिंग मशीनों पर मैकेनिकल सेफ्टी ड्रॉप बार की जांच हर शिफ्ट की शुरुआत में अनिवार्य रूप से की जानी चाहिए।',
            questionType: 'True/False',
            options: [
              { label: 'A', text: 'True - Mechanical drop bar prevents platen movement when safety gate is open', textHindi: 'सही - जब सुरक्षा द्वार खुला होता है तो मैकेनिकल ड्रॉप बार प्लेटन की गति को रोकता है' },
              { label: 'B', text: 'False - Only electrical proximity sensors are required', textHindi: 'गलत - केवल इलेक्ट्रिकल प्रॉक्सिमिटी सेंसर की आवश्यकता होती है' },
            ],
            optionA: 'True - Mechanical drop bar prevents platen movement when safety gate is open',
            optionB: 'False - Only electrical proximity sensors are required',
            optionAHindi: 'सही - जब सुरक्षा द्वार खुला होता है तो मैकेनिकल ड्रॉप बार प्लेटन की गति को रोकता है',
            optionBHindi: 'गलत - केवल इलेक्ट्रिकल प्रॉक्सिमिटी सेंसर की आवश्यकता होती है',
            correctAnswer: 'A',
            explanation: 'Mechanical drop bars provide hardware physical interlock against accidental platen closure.',
            explanationHindi: 'मैकेनिकल ड्रॉप बार आकस्मिक प्लेटन बंद होने के खिलाफ हार्डवेयर फिजिकल इंटरलॉक प्रदान करता है।',
            marks: 20,
            confidence: 96,
            status: 'Approved',
          },
          {
            id: `q-${Date.now()}-3`,
            questionNumber: 3,
            questionText: 'What PPE is strictly mandatory when purging high-temperature engineering polymers (such as PBT GF30 or PC/ABS) from the nozzle?',
            questionTextHindi: 'नोजल से उच्च तापमान वाले इंजीनियरिंग पॉलिमर (जैसे PBT GF30 या PC/ABS) को पर्ज करते समय कौन सा PPE सख्ती से अनिवार्य है?',
            questionType: 'Multiple Choice',
            options: [
              { label: 'A', text: 'Full face shield, heat-resistant Kevlar gauntlets, and safety shoes', textHindi: 'फुल फेस शील्ड, हीट-रेसिस्टेंट केवलर दस्ताने और सेफ्टी शूज' },
              { label: 'B', text: 'Standard sunglasses and cotton gloves', textHindi: 'साधारण धूप का चश्मा और सूती दस्ताने' },
              { label: 'C', text: 'No PPE required if purge shield is closed', textHindi: 'यदि पर्ज शील्ड बंद है तो किसी PPE की आवश्यकता नहीं है' },
              { label: 'D', text: 'Dust mask only', textHindi: 'केवल डस्ट मास्क' },
            ],
            optionA: 'Full face shield, heat-resistant Kevlar gauntlets, and safety shoes',
            optionB: 'Standard sunglasses and cotton gloves',
            optionC: 'No PPE required if purge shield is closed',
            optionD: 'Dust mask only',
            optionAHindi: 'फुल फेस शील्ड, हीट-रेसिस्टेंट केवलर दस्ताने और सेफ्टी शूज',
            optionBHindi: 'साधारण धूप का चश्मा और सूती दस्ताने',
            optionCHindi: 'यदि पर्ज शील्ड बंद है तो किसी PPE की आवश्यकता नहीं है',
            optionDHindi: 'केवल डस्ट मास्क',
            correctAnswer: 'A',
            explanation: 'Molten polymer splatters under nozzle pressure can cause severe 3rd-degree burns without full face and heat gauntlet protection.',
            explanationHindi: 'नोजल दबाव के तहत पिघला हुआ पॉलिमर छिटकने से बिना फेस शील्ड और हीट ग्लव्स के गंभीर जलन हो सकती है।',
            marks: 20,
            confidence: 94,
            status: 'Approved',
          },
        ];
      } else {
        title = `${selectedProgram?.programName || 'General Competency'} Certified Exam (Bilingual)`;
        questions = [
          {
            id: `q-${Date.now()}-1`,
            questionNumber: 1,
            questionText: 'Which process parameter adjustment is most effective for eliminating sink marks in thick-walled ribs?',
            questionTextHindi: 'मोटी दीवार वाली पसलियों (Ribs) में सिंक मार्क (सिकुड़न गड्ढे) को खत्म करने के लिए कौन सा प्रोसेस पैरामीटर सबसे प्रभावी है?',
            questionType: 'Multiple Choice',
            options: [
              { label: 'A', text: 'Increase holding pressure and holding time', textHindi: 'होल्डिंग प्रेशर (Holding Pressure) और होल्डिंग समय बढ़ाएं' },
              { label: 'B', text: 'Decrease mold cooling time', textHindi: 'मोल्ड कूलिंग समय कम करें' },
              { label: 'C', text: 'Increase injection speed to maximum', textHindi: 'इंजेक्शन की गति को अधिकतम तक बढ़ाएं' },
              { label: 'D', text: 'Lower the clamping tonnage to zero', textHindi: 'क्लैम्पिंग टनेज को शून्य तक कम करें' },
            ],
            optionA: 'Increase holding pressure and holding time',
            optionB: 'Decrease mold cooling time',
            optionC: 'Increase injection speed to maximum',
            optionD: 'Lower the clamping tonnage to zero',
            optionAHindi: 'होल्डिंग प्रेशर (Holding Pressure) और होल्डिंग समय बढ़ाएं',
            optionBHindi: 'मोल्ड कूलिंग समय कम करें',
            optionCHindi: 'इंजेक्शन की गति को अधिकतम तक बढ़ाएं',
            optionDHindi: 'क्लैम्पिंग टनेज को शून्य तक कम करें',
            correctAnswer: 'A',
            explanation: 'Holding pressure compensates for polymer volumetric shrinkage during solidification in thick areas.',
            explanationHindi: 'होल्डिंग दबाव मोटे क्षेत्रों में ठोसकरण के दौरान पॉलिमर वॉल्यूमेट्रिक संकोचन की भरपाई करता है।',
            marks: 20,
            confidence: 95,
            status: 'Approved',
          },
          {
            id: `q-${Date.now()}-2`,
            questionNumber: 2,
            questionText: 'Moisture content in hygroscopic resin (PBT / PA66) must be verified below 0.02% prior to feeding the machine hopper.',
            questionTextHindi: 'मशीन हॉपर में डालने से पहले हाइड्रोस्कोपिक रेजिन (PBT / PA66) में नमी की मात्रा 0.02% से कम सत्यापित की जानी चाहिए।',
            questionType: 'True/False',
            options: [
              { label: 'A', text: 'True - Excess moisture causes hydrolysis, polymer degradation, and silver streaks', textHindi: 'सही - अत्यधिक नमी हाइड्रोलिसिस, पॉलिमर क्षरण और सिल्वर स्ट्रीक्स का कारण बनती है' },
              { label: 'B', text: 'False - Water evaporates inside the barrel with no negative impact', textHindi: 'गलत - बिना किसी नकारात्मक प्रभाव के बैरल के अंदर पानी वाष्पित हो जाता है' },
            ],
            optionA: 'True - Excess moisture causes hydrolysis, polymer degradation, and silver streaks',
            optionB: 'False - Water evaporates inside the barrel with no negative impact',
            optionAHindi: 'सही - अत्यधिक नमी हाइड्रोलिसिस, पॉलिमर क्षरण और सिल्वर स्ट्रीक्स का कारण बनती है',
            optionBHindi: 'गलत - बिना किसी नकारात्मक प्रभाव के बैरल के अंदर पानी वाष्पित हो जाता है',
            correctAnswer: 'A',
            explanation: 'Hygroscopic polymers undergo hydrolytic degradation in melt state if not dried in desiccant hoppers.',
            explanationHindi: 'डेसीकेंट हॉपर में न सुखाए जाने पर हाइग्रोस्कोपिक पॉलिमर पिघलने की स्थिति में हाइड्रोलाइटिक गिरावट से गुजरते हैं।',
            marks: 20,
            confidence: 98,
            status: 'Approved',
          },
        ];
      }

      setPaperTitle(title);
      setExtractedQuestions(questions);
      setOcrConfidence(95.2);
      setIsProcessing(false);
    }, 1000);
  };

  // Handle Real File Upload and call backend OCR
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOriginalFileName(file.name);
    setIsProcessing(true);
    triggerHaptic();

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setPreviewImage(base64Data);

      try {
        const response = await fetch('/api/training/ocr-question-paper', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type || 'image/jpeg',
            programName: selectedProgram?.programName || 'Injection Moulding Competency',
            version: versionInput,
            companyName: currentCompany.name,
            originalFileName: file.name,
          }),
        });

        const result = await response.json();
        if (result.success && result.data) {
          setPaperTitle(result.data.title || `${selectedProgram?.programName} Assessment Paper`);
          
          // Enrich questions to ensure both English & Hindi are structured
          const formattedQuestions = (result.data.questions || []).map((q: any, idx: number) => {
            const opts = q.options || [];
            return {
              ...q,
              id: q.id || `q-ocr-${Date.now()}-${idx + 1}`,
              questionNumber: idx + 1,
              questionTextHindi: q.questionTextHindi || '',
              optionA: opts[0]?.text || q.optionA || '',
              optionB: opts[1]?.text || q.optionB || '',
              optionC: opts[2]?.text || q.optionC || '',
              optionD: opts[3]?.text || q.optionD || '',
              optionAHindi: opts[0]?.textHindi || q.optionAHindi || '',
              optionBHindi: opts[1]?.textHindi || q.optionBHindi || '',
              optionCHindi: opts[2]?.textHindi || q.optionCHindi || '',
              optionDHindi: opts[3]?.textHindi || q.optionDHindi || '',
              options: opts.map((opt: any, optIdx: number) => ({
                label: opt.label || ['A', 'B', 'C', 'D'][optIdx],
                text: opt.text || '',
                textHindi: opt.textHindi || '',
              })),
              status: q.confidence && q.confidence < 85 ? 'Under Review' : 'Approved',
            };
          });

          setExtractedQuestions(formattedQuestions);
          setOcrConfidence(result.data.confidenceScore || 94.0);
          setPassingMarks(normalizePassMark(result.data.passingScorePct, 80));
          setDurationMins(result.data.durationMinutes || 30);
        }
      } catch (err) {
        console.error('OCR Extraction error:', err);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Translate a single question to Hindi
  const handleTranslateSingleQuestion = async (index: number) => {
    const q = extractedQuestions[index];
    if (!q) return;

    triggerHaptic();
    setTranslatingIndex(index);

    try {
      const response = await fetch('/api/training/translate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: q.questionText,
          options: q.options || [
            { label: 'A', text: q.optionA || '' },
            { label: 'B', text: q.optionB || '' },
            { label: 'C', text: q.optionC || '' },
            { label: 'D', text: q.optionD || '' },
          ],
          explanation: q.explanation || '',
        }),
      });

      const result = await response.json();
      if (result.success) {
        const translatedOpts = result.optionsHindi || [];
        const optHMap: Record<string, string> = {};
        translatedOpts.forEach((o: any) => {
          optHMap[o.label] = o.textHindi;
        });

        const newOptions = (q.options || []).map((opt) => ({
          ...opt,
          textHindi: optHMap[opt.label || ''] || opt.textHindi || '',
        }));

        handleUpdateQuestion(index, {
          questionTextHindi: result.questionTextHindi || q.questionTextHindi,
          explanationHindi: result.explanationHindi || q.explanationHindi,
          options: newOptions,
          optionAHindi: optHMap['A'] || q.optionAHindi,
          optionBHindi: optHMap['B'] || q.optionBHindi,
          optionCHindi: optHMap['C'] || q.optionCHindi,
          optionDHindi: optHMap['D'] || q.optionDHindi,
        });
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setTranslatingIndex(null);
    }
  };

  // Translate all questions in paper
  const handleTranslateAll = async () => {
    if (extractedQuestions.length === 0) return;
    triggerHaptic();
    setIsTranslatingAll(true);

    for (let i = 0; i < extractedQuestions.length; i++) {
      await handleTranslateSingleQuestion(i);
    }

    setIsTranslatingAll(false);
  };

  // Question editing
  const handleUpdateQuestion = (index: number, updates: Partial<OCRQuestionItem>) => {
    setExtractedQuestions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  const handleAddQuestion = () => {
    triggerHaptic();
    const newQ: OCRQuestionItem = {
      id: `q-manual-${Date.now()}`,
      questionNumber: extractedQuestions.length + 1,
      questionText: 'New Assessment Question (English)',
      questionTextHindi: 'नया मूल्यांकन प्रश्न (हिंदी)',
      questionType: 'Multiple Choice',
      options: [
        { label: 'A', text: 'Option A description', textHindi: 'विकल्प A विवरण' },
        { label: 'B', text: 'Option B description', textHindi: 'विकल्प B विवरण' },
        { label: 'C', text: 'Option C description', textHindi: 'विकल्प C विवरण' },
        { label: 'D', text: 'Option D description', textHindi: 'विकल्प D विवरण' },
      ],
      optionA: 'Option A description',
      optionB: 'Option B description',
      optionC: 'Option C description',
      optionD: 'Option D description',
      optionAHindi: 'विकल्प A विवरण',
      optionBHindi: 'विकल्प B विवरण',
      optionCHindi: 'विकल्प C विवरण',
      optionDHindi: 'विकल्प D विवरण',
      correctAnswer: 'A',
      explanation: 'Technical explanation for the correct answer',
      explanationHindi: 'सही उत्तर के लिए तकनीकी स्पष्टीकरण',
      marks: 20,
      confidence: 100,
      status: 'Approved',
    };
    setExtractedQuestions((prev) => [...prev, newQ]);
  };

  const handleDeleteQuestion = (index: number) => {
    triggerHaptic();
    setExtractedQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleApproveAll = () => {
    triggerHaptic();
    setExtractedQuestions((prev) =>
      prev.map((q) => ({ ...q, status: 'Approved' }))
    );
  };

  // Final Save & Approval into AppContext
  const handleSaveAndApprovePaper = () => {
    if (!paperTitle || extractedQuestions.length === 0) return;
    triggerHaptic();

    const normalizedPass = normalizePassMark(passingMarks, 80);

    const formattedQuestions = extractedQuestions.map((q) => {
      const opts = q.options || [];
      return {
        ...q,
        optionA: opts[0]?.text || q.optionA || '',
        optionB: opts[1]?.text || q.optionB || '',
        optionC: opts[2]?.text || q.optionC || '',
        optionD: opts[3]?.text || q.optionD || '',
        optionAHindi: opts[0]?.textHindi || q.optionAHindi || '',
        optionBHindi: opts[1]?.textHindi || q.optionBHindi || '',
        optionCHindi: opts[2]?.textHindi || q.optionCHindi || '',
        optionDHindi: opts[3]?.textHindi || q.optionDHindi || '',
        status: 'Approved' as const,
      };
    });

    const newPaper = importCompanyQuestionPaper({
      companyId: selectedCompanyId,
      trainingProgramId: selectedProgramId,
      programName: selectedProgram?.programName || paperTitle,
      title: paperTitle,
      version: versionInput || '1.0',
      totalQuestions: formattedQuestions.length,
      passingPercentage: normalizedPass,
      durationMinutes: durationMins || 30,
      originalDocumentName: originalFileName || 'Question_Paper_Scan.jpg',
      originalDocumentType: 'jpeg',
      originalDocumentUrl: previewImage || undefined,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Quality Department',
      ocrExtractedAt: new Date().toISOString(),
      ocrConfidenceScore: ocrConfidence,
      ocrStatus: 'Approved',
      approvedAt: new Date().toISOString(),
      approvedBy: 'System Administrator (IATF Auditor)',
      questionType: 'Multiple Choice',
      randomizeQuestions,
      randomizeOptions,
      maxAttempts: 3,
      testValidityMonths: 12,
      questions: formattedQuestions,
    });

    setIsSavedSuccess(true);
    setSavedPaperId(newPaper.id);

    if (onPaperApproved) {
      onPaperApproved(newPaper.id);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Studio Header Banner */}
      <div className="bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-black text-white">
                Bilingual Question Paper OCR &amp; Vision Studio
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload company question papers • Automatic English &amp; Hindi translation • Multi-version audit tracking
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400">Organization:</span>
            <span className="px-3 py-1 bg-slate-900 text-amber-400 font-extrabold rounded-xl border border-slate-700 text-xs">
              {currentCompany.name} ({currentCompany.code})
            </span>
          </div>
        </div>

        {/* Setup Parameters Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Target Training Program</label>
            <select
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-semibold"
            >
              {companyTrainingPrograms
                .filter((p) => !p.companyId || p.companyId === selectedCompanyId)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.programId} - {p.programName}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Paper Version</label>
            <input
              type="text"
              value={versionInput}
              onChange={(e) => setVersionInput(e.target.value)}
              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold"
              placeholder="1.0"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Passing Mark (%)</label>
            <input
              type="number"
              min={50}
              max={100}
              value={passingMarks}
              onChange={(e) => setPassingMarks(normalizePassMark(Number(e.target.value), 80))}
              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-emerald-400 font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Duration (Mins)</label>
            <input
              type="number"
              min={5}
              value={durationMins}
              onChange={(e) => setDurationMins(Number(e.target.value))}
              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
            />
          </div>

          <div className="flex flex-col justify-center space-y-1.5 pt-4 sm:pt-0">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-semibold text-[11px]">
              <input
                type="checkbox"
                checked={randomizeQuestions}
                onChange={(e) => setRandomizeQuestions(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-slate-900 text-amber-500"
              />
              <Shuffle className="w-3 h-3 text-amber-400" /> Randomize Questions
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-semibold text-[11px]">
              <input
                type="checkbox"
                checked={randomizeOptions}
                onChange={(e) => setRandomizeOptions(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-slate-900 text-amber-500"
              />
              <Shuffle className="w-3 h-3 text-purple-400" /> Randomize Options
            </label>
          </div>
        </div>
      </div>

      {/* Success Notification Banner if saved */}
      {isSavedSuccess && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-300 animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-extrabold text-sm text-white">
                Bilingual Question Paper v{versionInput} Approved &amp; Integrated!
              </h4>
              <p className="text-xs text-emerald-300/80">
                Extracted {extractedQuestions.length} bilingual questions. Ready for digital testing in English &amp; Hindi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenDigitalTest && (
              <button
                onClick={() => {
                  triggerHaptic();
                  onOpenDigitalTest(savedPaperId || undefined);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5"
              >
                <Award className="w-4 h-4" /> Launch Bilingual Test →
              </button>
            )}
            <button
              onClick={() => setIsSavedSuccess(false)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Upload Zone if no preview yet */}
      {!previewImage && !isProcessing && (
        <div className="bg-slate-850 p-6 sm:p-10 rounded-2xl border-2 border-dashed border-slate-700 hover:border-purple-500/60 transition-all text-center space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,.pdf"
            className="hidden"
          />

          <div className="w-16 h-16 rounded-3xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center mx-auto shadow-xl">
            <Camera className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-base font-extrabold text-white">
              Upload Company Question Paper / Exam Scan
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Supports scanned test sheets, multiple-choice exams, SOP practical evaluations (PDF, JPG, PNG). Automatic English &amp; Hindi translation is applied.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-purple-950/60"
            >
              <Upload className="w-4 h-4" /> Browse Paper File
            </button>
          </div>

          {/* Preset Quick Starters */}
          <div className="pt-6 border-t border-slate-800 flex flex-col items-center gap-2">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Or Load a 1-Click Bilingual Preset:
            </span>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <button
                onClick={() => handleLoadPreset('IMM Safety & Emergency Exam')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Machine Safety &amp; E-Stop Paper (Hindi + English)
              </button>
              <button
                onClick={() => handleLoadPreset('Defect Quality & Shrinkage Exam')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Process Defect &amp; Resin Drying Exam (Hindi + English)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Animation */}
      {isProcessing && (
        <div className="bg-slate-850 p-12 rounded-2xl border border-slate-800 text-center space-y-4 animate-pulse">
          <RefreshCw className="w-10 h-10 text-purple-400 animate-spin mx-auto" />
          <h3 className="text-base font-extrabold text-white">
            Vision AI is Scanning &amp; Translating Question Paper...
          </h3>
          <p className="text-xs text-slate-400">
            Extracting question stems, multiple-choice options, answer keys, marks, and generating Hindi translations.
          </p>
        </div>
      )}

      {/* Split Screen OCR Studio (Left: Document Viewer, Right: Extracted Questions Review) */}
      {previewImage && !isProcessing && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Panel: Document Viewer (5 cols) */}
          <div className="lg:col-span-5 bg-slate-850 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-xs text-white truncate max-w-[200px]">
                  {originalFileName || 'Question_Paper.jpg'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(50, z - 20))}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono text-slate-400 px-1">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(200, z + 20))}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Document Image Container */}
            <div className="w-full h-[540px] bg-slate-950 rounded-xl border border-slate-800 overflow-auto flex items-center justify-center p-2">
              <img
                src={previewImage}
                alt="Question Paper Document"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
                className="max-h-full max-w-full object-contain rounded-lg shadow-xl transition-transform"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                OCR Confidence: <strong className="text-emerald-400">{ocrConfidence}%</strong>
              </span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-purple-400 hover:text-purple-300 font-bold text-[11px]"
              >
                Re-upload / Change Photo
              </button>
            </div>
          </div>

          {/* Right Panel: Extracted Questions Editor (7 cols) */}
          <div className="lg:col-span-7 bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
            <div>
              {/* Header Editor */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">
                    Extracted Paper Title
                  </label>
                  <input
                    type="text"
                    value={paperTitle}
                    onChange={(e) => setPaperTitle(e.target.value)}
                    className="w-full bg-slate-900 text-white font-extrabold text-sm p-1.5 rounded-lg border border-slate-700"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleTranslateAll}
                    disabled={isTranslatingAll}
                    className="px-2.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center gap-1 disabled:opacity-50"
                    title="Translate all questions to Hindi using AI"
                  >
                    <Languages className={`w-3.5 h-3.5 ${isTranslatingAll ? 'animate-spin' : ''}`} />
                    {isTranslatingAll ? 'Translating...' : 'Translate All to Hindi'}
                  </button>
                  <button
                    onClick={handleApproveAll}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Approve All
                  </button>
                  <button
                    onClick={handleAddQuestion}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Question
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1 mt-3">
                {extractedQuestions.map((q, idx) => {
                  const isDuplicate = isQuestionDuplicate(q.questionText);
                  const isTranslatingThis = translatingIndex === idx;

                  return (
                    <div
                      key={q.id || idx}
                      className={`p-4 rounded-xl border transition-all space-y-3 ${
                        q.status === 'Approved'
                          ? 'bg-slate-900 border-slate-800'
                          : 'bg-amber-950/20 border-amber-500/40'
                      }`}
                    >
                      {/* Top Q row */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 font-black text-xs flex items-center justify-center shrink-0">
                            Q{idx + 1}
                          </span>
                          <select
                            value={q.questionType}
                            onChange={(e) => handleUpdateQuestion(idx, { questionType: e.target.value as any })}
                            className="bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-300 p-1"
                          >
                            <option value="Multiple Choice">Multiple Choice</option>
                            <option value="True/False">True / False</option>
                            <option value="Short Answer">Short Answer</option>
                            <option value="Practical Check">Practical Check</option>
                          </select>

                          {isDuplicate && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Potential Duplicate in Bank
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleQuestion(idx)}
                            disabled={isTranslatingThis}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 text-[10px] font-bold flex items-center gap-1 border border-slate-700"
                            title="Auto-translate this question to Hindi"
                          >
                            <Languages className="w-3 h-3" />
                            {isTranslatingThis ? 'Translating...' : 'Hindi AI'}
                          </button>

                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                            {q.confidence}% OCR
                          </span>
                          <input
                            type="number"
                            value={q.marks}
                            onChange={(e) => handleUpdateQuestion(idx, { marks: Number(e.target.value) })}
                            className="w-12 text-center bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-white p-1"
                            title="Marks"
                          />
                          <button
                            onClick={() => handleDeleteQuestion(idx)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Bilingual Question Text (English + Hindi) */}
                      <div className="space-y-1.5">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">English Question</label>
                          <textarea
                            rows={2}
                            value={q.questionText}
                            onChange={(e) => handleUpdateQuestion(idx, { questionText: e.target.value })}
                            className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-medium focus:border-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-purple-300 uppercase">हिंदी प्रश्न (Hindi Translation)</label>
                          <textarea
                            rows={2}
                            value={q.questionTextHindi || ''}
                            placeholder="हिंदी में प्रश्न दर्ज करें..."
                            onChange={(e) => handleUpdateQuestion(idx, { questionTextHindi: e.target.value })}
                            className="w-full p-2 bg-slate-950/80 border border-purple-500/30 rounded-lg text-xs text-purple-200 font-medium focus:border-purple-400"
                          />
                        </div>
                      </div>

                      {/* Options if Multiple Choice or True/False */}
                      {q.options && q.options.length > 0 && (
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">
                            Options (Click option badge to select correct answer)
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {q.options.map((opt, optIdx) => {
                              const isCorrect = q.correctAnswer === opt.label;
                              return (
                                <div
                                  key={optIdx}
                                  onClick={() => handleUpdateQuestion(idx, { correctAnswer: opt.label as any })}
                                  className={`p-2.5 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                                    isCorrect
                                      ? 'bg-emerald-500/20 border-emerald-500/50 text-white'
                                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs shrink-0 ${isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                                      {opt.label}
                                    </span>
                                    <input
                                      type="text"
                                      value={opt.text}
                                      placeholder="English option..."
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) => {
                                        const newOpts = [...q.options];
                                        newOpts[optIdx] = { ...opt, text: e.target.value };
                                        handleUpdateQuestion(idx, { options: newOpts });
                                      }}
                                      className="bg-transparent text-xs w-full focus:outline-none font-medium"
                                    />
                                  </div>

                                  <input
                                    type="text"
                                    value={opt.textHindi || ''}
                                    placeholder="हिंदी विकल्प..."
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => {
                                      const newOpts = [...q.options];
                                      newOpts[optIdx] = { ...opt, textHindi: e.target.value };
                                      handleUpdateQuestion(idx, { options: newOpts });
                                    }}
                                    className="bg-transparent text-[11px] text-purple-200/90 pl-7 w-full focus:outline-none"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Explanations */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
                        <div>
                          <span className="font-bold text-slate-500 uppercase text-[9px] block mb-0.5">Explanation (EN):</span>
                          <input
                            type="text"
                            value={q.explanation || ''}
                            onChange={(e) => handleUpdateQuestion(idx, { explanation: e.target.value })}
                            placeholder="Technical explanation why this answer is correct..."
                            className="w-full bg-slate-950/60 border border-slate-800/80 rounded px-2 py-1 text-[11px] text-slate-300"
                          />
                        </div>
                        <div>
                          <span className="font-bold text-purple-400 uppercase text-[9px] block mb-0.5">स्पष्टीकरण (HI):</span>
                          <input
                            type="text"
                            value={q.explanationHindi || ''}
                            onChange={(e) => handleUpdateQuestion(idx, { explanationHindi: e.target.value })}
                            placeholder="हिंदी में तकनीकी स्पष्टीकरण..."
                            className="w-full bg-slate-950/60 border border-purple-500/30 rounded px-2 py-1 text-[11px] text-purple-200"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Approval Action Strip */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Total Marks: <strong className="text-white">{extractedQuestions.reduce((s, q) => s + (q.marks || 20), 0)}</strong> • Pass: <strong className="text-emerald-400">{passingMarks}%</strong>
              </span>

              <button
                onClick={handleSaveAndApprovePaper}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-xl shadow-amber-950/50"
              >
                <ShieldCheck className="w-4 h-4" /> Save &amp; Approve Question Paper v{versionInput}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
