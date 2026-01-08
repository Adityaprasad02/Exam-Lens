import React, { useEffect, useMemo, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "./AppContext";
import ComparisonChart from "./ComparisonChart";
import { PDFDownloadLink } from "@react-pdf/renderer";
import AnalysisPDF from "./AnalysisPDF";
import logo from "../assets/image.jpg";

import {
  FileText,
  ArrowLeft,
  RefreshCcw,
  BarChart3,
  AlertTriangle,
  Download,
  Maximize2,
  X,
} from "lucide-react";

  const api = import.meta.env.API_URL ;

export default function ResultPage() {
  const { analysisResults, topics } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [data, setData] = useState(
    location.state?.analysisData || analysisResults || []
  );

  if (!Array.isArray(data) || data.length === 0) {
    return <Navigate to="/" replace />;
  }

  // Load modern fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const normalized = useMemo(
    () =>
      data.map((f) => ({
        ...f,
        analysis: Array.isArray(f.analysis) ? f.analysis : [],
        error: !!f.error,
        originalFile: f.originalFile ?? null,
      })),
    [data]
  );

  const [chartBase64, setChartBase64] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [retryingIndex, setRetryingIndex] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        const canvas = document.querySelector("#comparison-chart canvas");
        if (canvas) {
          setChartBase64(canvas.toDataURL("image/png"));
        }
      } catch (e) {
        console.error("Chart capture failed", e);
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [normalized]);

  const [activeFileName, setActiveFileName] = useState(normalized[0].file_name);
  const active = normalized.find((x) => x.file_name === activeFileName);

  const retryFile = async (index) => {
    const f = normalized[index];
    if (!f.originalFile) {
      alert("Original file not found for retry. Please re-upload.");
      return;
    }

    setRetryingIndex(index);

    try {
      const fd = new FormData();
      fd.append("files", f.originalFile);
      fd.append(
        "req",
        new Blob([JSON.stringify({ request: topics })], {
          type: "application/json",
        })
      );

      const res = await fetch(`${api}/upload-pdf`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const newData = await res.json();

      // Update the specific file in the data array
      setData((prev) => {
        const updated = [...prev];
        updated[index] = {
          file_name: f.file_name,
          analysis: Array.isArray(newData[0]?.analysis) ? newData[0].analysis : [],
          error: false,
          originalFile: f.originalFile,
        };
        return updated;
      });

      alert(`Successfully re-analyzed ${f.file_name}`);
    } catch (err) {
      console.error("Retry error:", err);
      alert(`Retry failed: ${err.message}`);
    } finally {
      setRetryingIndex(null);
    }
  };

  const comparison = useMemo(() => {
    const names = Array.from(
      new Set(normalized.flatMap((f) => f.analysis.map((t) => t.Topic)))
    );

    return names.map((name) => {
      const row = { name };
      normalized.forEach((file) => {
        const total = file.analysis.reduce(
          (s, t) => s + Number(t.Total_Marks || 0),
          0
        );
        const topic = file.analysis.find((t) => t.Topic === name);
        const marks = Number(topic?.Total_Marks || 0);
        row[file.file_name] = total > 0 ? ((marks / total) * 100).toFixed(1) : 0;
      });
      return row;
    });
  }, [normalized]);

  // Safe PDF data preparation - ensure all data is valid
  const safePDFData = useMemo(() => {
    return {
      analyzedFiles: normalized.map(f => ({
        file_name: f.file_name || 'Unknown',
        analysis: Array.isArray(f.analysis) ? f.analysis : [],
        error: f.error || false
      })),
      comparisonData: comparison || [],
      chartImageBase64: chartBase64 || null
    };
  }, [normalized, comparison, chartBase64]);

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Header */}
        <header className="backdrop-blur-xl bg-white/80 border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-5 py-3 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={() => navigate(-1)}
                className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-300 group"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 group-hover:text-slate-900 transition" />
              </button>

              <h1 
                className="text-xl sm:text-2xl lg:text-3xl font-bold bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <div className="relative hidden sm:block w-12 h-12">
                  <img
                    src={logo} 
                    alt="Logo"
                    className="w-full h-full object-cover rounded-full shadow-md"
                  />
                </div>

                Exam-lens <span className="text-slate-400 text-sm sm:text-lg font-normal">/ Results</span>
              </h1>
            </div>

            <div className="w-full sm:w-auto">
              <PDFDownloadLink
                document={
                  <AnalysisPDF
                    analyzedFiles={safePDFData.analyzedFiles}
                    comparisonData={safePDFData.comparisonData}
                    chartImageBase64={safePDFData.chartImageBase64}
                  />
                }
                fileName="Examlens_Analysis_Report.pdf"
              >
                {({ loading }) => (
                  <button className="w-full sm:w-auto group px-4 sm:px-6 py-2.5 sm:py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-semibold rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base">
                    <Download className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-y-0.5 transition" />
                    {loading ? "Preparing..." : "Download Report"}
                  </button>
                )}
              </PDFDownloadLink>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-3 sm:px-5 py-6 sm:py-10 space-y-6 sm:space-y-10">
          {/* Files Grid */}
          <section>
            <h2 
              className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              Analyzed Papers
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {normalized.map((file, i) => (
                <div
                  key={i}
                  onClick={() => setActiveFileName(file.file_name)}
                  className={`group relative overflow-hidden rounded-xl sm:rounded-2xl border bg-white shadow-md hover:shadow-xl cursor-pointer transition-all duration-300 ${
                    activeFileName === file.file_name
                      ? "border-blue-400 ring-2 sm:ring-4 ring-blue-100 scale-105"
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                        <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex-shrink-0">
                          <FileText className="w-5 h-5 sm:w-7 sm:h-7 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800 truncate text-sm sm:text-base">
                            {file.file_name}
                          </p>
                          {file.error ? (
                            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 sm:py-1 rounded-full mt-1 inline-block border border-red-200">
                              Failed
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 sm:py-1 rounded-full mt-1 inline-block border border-emerald-200">
                              Success
                            </span>
                          )}
                        </div>
                      </div>

                      {file.error && file.originalFile && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            retryFile(i);
                          }}
                          disabled={retryingIndex === i}
                          className="p-1.5 sm:p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition border border-red-200 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Retry analysis"
                        >
                          <RefreshCcw className={`w-3 h-3 sm:w-4 sm:h-4 ${retryingIndex === i ? 'animate-spin' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Active Indicator */}
                  {activeFileName === file.file_name && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl pointer-events-none opacity-50" />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Comparison Chart - Full Width */}
          <section>
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 p-4 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                <h2 
                  className="text-xl sm:text-2xl font-bold text-slate-800"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Comparison Across Papers
                </h2>
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="px-3 py-2 sm:p-2 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all duration-300 flex items-center gap-2 text-sm sm:text-base"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium">Fullscreen</span>
                </button>
              </div>
              <div id="comparison-chart" className="w-full h-[300px] sm:h-[400px] lg:h-[500px]">
                <ComparisonChart comparisonData={comparison} />
              </div>
            </div>
          </section>

          {/* Topic Breakdown */}
          <section>
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 p-4 sm:p-8">
              <h2 
                className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg sm:rounded-xl text-purple-700 font-semibold text-xs sm:text-sm">
                  Active
                </span>
                Topic Breakdown
              </h2>

              <p className="text-base sm:text-lg font-medium text-blue-600 mb-4 sm:mb-6 truncate">
                {active.file_name}
              </p>

              {active.analysis.length === 0 ? (
                <div className="text-center py-8 sm:py-12 text-slate-400">
                  <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-30" />
                  <p className="text-sm sm:text-base">No topics extracted from this paper.</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-5 max-h-[400px] sm:max-h-96 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                  {active.analysis.map((t, i) => (
                    <div
                      key={i}
                      className="group p-4 sm:p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl border border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0 mb-3">
                        <h4 className="font-bold text-slate-800 text-base sm:text-lg">{t.Topic}</h4>
                        <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-gradient-to-r from-yellow-300 to-green-300 text-white text-xs sm:text-sm font-bold rounded-full shadow-md whitespace-nowrap">
                          {t.Total_Marks} marks
                        </span>
                      </div>

                      <ul className="space-y-1.5 sm:space-y-2 text-slate-600 text-xs sm:text-sm">
                        {(t.Important_Subtopics || []).map((s, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                            <span className="flex-1">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>

        {/* Custom Scrollbar Styles */}
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          @media (min-width: 640px) {
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(226, 232, 240, 0.5);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #3b82f6, #8b5cf6);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #2563eb, #7c3aed);
          }
        `}</style>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-8">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full h-full max-w-[98vw] sm:max-w-[95vw] max-h-[98vh] sm:max-h-[95vh] flex flex-col">
            <div className="flex items-center justify-between p-3 sm:p-6 border-b border-slate-200">
              <h2 
                className="text-lg sm:text-2xl font-bold text-slate-800"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Comparison Across Papers
              </h2>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all duration-300"
                title="Close"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <div className="flex-1 p-3 sm:p-6 overflow-auto">
              <div className="w-full h-full min-h-[300px]">
                <ComparisonChart comparisonData={comparison} fullscreen={true} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}