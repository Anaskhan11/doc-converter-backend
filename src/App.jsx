import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { PageTitle } from './components/PageTitle';
import { Home } from './pages/Home';
import { Tools } from './pages/Tools';
import { CategoryPage } from './pages/CategoryPage';
import { Pricing } from './pages/Pricing';
import { ChatWithPdf } from './pages/ChatWithPdf';
import { AiPdfSummarizer } from './pages/AiPdfSummarizer';
import { PdfToWord } from './pages/PdfToWord';
import { WordToPdf } from './pages/WordToPdf';
import { PdfToJpg } from './pages/PdfToJpg';
import { JpgToPdf } from './pages/JpgToPdf';
import { PdfToPng } from './pages/PdfToPng';
import { PngToPdf } from './pages/PngToPdf';
import { MergePdf } from './pages/MergePdf';
import { SplitPdf } from './pages/SplitPdf';
import { CompressPdf } from './pages/CompressPdf';
import { RotatePdf } from './pages/RotatePdf';
import { PdfToExcel } from './pages/PdfToExcel';
import { ExcelToPdf } from './pages/ExcelToPdf';
import { PdfToPowerpoint } from './pages/PdfToPowerpoint';
import { PowerpointToPdf } from './pages/PowerpointToPdf';
import { ExtractPdfPages } from './pages/ExtractPdfPages';
import { DeletePdfPages } from './pages/DeletePdfPages';
import { ReorderPdfPages } from './pages/ReorderPdfPages';
import { WatermarkPdf } from './pages/WatermarkPdf';
import { AddPageNumbers } from './pages/AddPageNumbers';
import { ProtectPdf } from './pages/ProtectPdf';
import { OcrPdf } from './pages/OcrPdf';
import { RepairPdf } from './pages/RepairPdf';
import { UnlockPdf } from './pages/UnlockPdf';
import { SignPdf } from './pages/SignPdf';
import { RedactPdf } from './pages/RedactPdf';
import { CropPdf } from './pages/CropPdf';
import { EditPdf } from './pages/EditPdf';
import { ComparePdf } from './pages/ComparePdf';
import { PdfToText } from './pages/PdfToText';
import { PdfToMarkdown } from './pages/PdfToMarkdown';
import { NotFound } from './pages/NotFound';

export const App = () => {
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <PageTitle />
          <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-[#0bff03] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-slate-950"
            >
              Skip to main content
            </a>
            <Header onOpenSearch={() => setSearchModalOpen(true)} />
            <main id="main-content" className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/tools" element={<Tools />} />
                <Route path="/tools/:categoryId" element={<CategoryPage />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/chat-with-pdf" element={<ChatWithPdf />} />
                <Route path="/ai-pdf-summarizer" element={<AiPdfSummarizer />} />
                <Route path="/pdf-to-word" element={<PdfToWord />} />
                <Route path="/word-to-pdf" element={<WordToPdf />} />
                <Route path="/pdf-to-jpg" element={<PdfToJpg />} />
                <Route path="/jpg-to-pdf" element={<JpgToPdf />} />
                <Route path="/pdf-to-png" element={<PdfToPng />} />
                <Route path="/png-to-pdf" element={<PngToPdf />} />
                <Route path="/merge-pdf" element={<MergePdf />} />
                <Route path="/split-pdf" element={<SplitPdf />} />
                <Route path="/compress-pdf" element={<CompressPdf />} />
                <Route path="/rotate-pdf" element={<RotatePdf />} />
                <Route path="/pdf-to-excel" element={<PdfToExcel />} />
                <Route path="/excel-to-pdf" element={<ExcelToPdf />} />
                <Route path="/pdf-to-powerpoint" element={<PdfToPowerpoint />} />
                <Route path="/powerpoint-to-pdf" element={<PowerpointToPdf />} />
                <Route path="/extract-pdf-pages" element={<ExtractPdfPages />} />
                <Route path="/delete-pdf-pages" element={<DeletePdfPages />} />
                <Route path="/reorder-pdf-pages" element={<ReorderPdfPages />} />
                <Route path="/watermark-pdf" element={<WatermarkPdf />} />
                <Route path="/add-page-numbers" element={<AddPageNumbers />} />
                <Route path="/protect-pdf" element={<ProtectPdf />} />
                <Route path="/ocr-pdf" element={<OcrPdf />} />
                <Route path="/repair-pdf" element={<RepairPdf />} />
                <Route path="/unlock-pdf" element={<UnlockPdf />} />
                <Route path="/sign-pdf" element={<SignPdf />} />
                <Route path="/redact-pdf" element={<RedactPdf />} />
                <Route path="/crop-pdf" element={<CropPdf />} />
                <Route path="/edit-pdf" element={<EditPdf />} />
                <Route path="/compare-pdf" element={<ComparePdf />} />
                <Route path="/pdf-to-text" element={<PdfToText />} />
                <Route path="/pdf-to-markdown" element={<PdfToMarkdown />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />

            <SearchModal
              isOpen={searchModalOpen}
              onClose={() => setSearchModalOpen(false)}
              onOpen={() => setSearchModalOpen(true)}
            />
          </div>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
