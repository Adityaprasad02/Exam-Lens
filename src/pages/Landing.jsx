import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "./AppContext";
import { 
  Plus, 
  X, 
  Upload, 
  Sparkles, 
  Loader2, 
  Trash2, 
  FileText,
  BarChart3,
  Linkedin,
  Github,
  Globe,
  TrendingUp,
  FileSearch,
  Download as DownloadIcon,
  CheckCircle2
} from "lucide-react";
import logoImage from "/image.jpg";

export default function LandingPage() {
  const { topics, saveTopics, saveAnalysisResults } = useAppContext();
  const [localTopics, setLocalTopics] = useState([...topics]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const api = import.meta.env.VITE_API_URL ;

  // Load modern fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const handleFileUpload = (e) => {
    const selected = Array.from(e.target.files);
    const remaining = 3 - files.length;
    setFiles([...files, ...selected.slice(0, remaining)]);
    e.target.value = null;
  };

  const removeFile = (i) => setFiles(files.filter((_, idx) => idx !== i));

  const handleMainChange = (i, value) => {
    const newTopics = [...localTopics];
    newTopics[i].mainTopic = value;
    setLocalTopics(newTopics);
  };

  const addMainTopic = () => setLocalTopics([...localTopics, { mainTopic: "", subTopics: [""] }]);
  const removeMainTopic = (i) => setLocalTopics(localTopics.filter((_, idx) => idx !== i));

  const addSubTopic = (i) => {
    const newTopics = [...localTopics];
    newTopics[i].subTopics.push("");
    setLocalTopics(newTopics);
  };
  
  const removeSubTopic = (i, j) => {
    const newTopics = [...localTopics];
    newTopics[i].subTopics.splice(j, 1);
    setLocalTopics(newTopics);
  };
  
  const handleSubChange = (i, j, value) => {
    const newTopics = [...localTopics];
    newTopics[i].subTopics[j] = value;
    setLocalTopics(newTopics);
  };

  const handleAnalyze = async () => {
    if (!files.length) return alert("Upload at least 1 file");
    if (localTopics.some((t) => !t.mainTopic.trim())) return alert("Fill all main topics");

    saveTopics(localTopics);
    setLoading(true);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      formData.append(
        "req",
        new Blob([JSON.stringify({ request: localTopics })], { type: "application/json" })
      );

      const res = await fetch(`${api}/upload-pdf`, { method: "POST", body: formData });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      const normalizedData = data.map((d, i) => ({
        ...d,
        originalFile: files[i] || null,
      }));

      saveAnalysisResults(normalizedData);
      navigate("/results", { state: { analysisData: normalizedData } });
    } catch (err) {
      console.error(err);
      alert("Upload failed, check console");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/80 border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <img 
                src={logoImage} 
                alt="Exam-lens Logo" 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover shadow-md"
              />
              <div>
                <h1 
                  className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Exam-lens
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 hidden sm:block">Smart PYQ Analysis Tool</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <a 
                href="#features" 
                className="hidden md:block px-4 py-2 text-slate-600 hover:text-blue-600 font-medium transition-colors"
              >
                Features
              </a>
              <button className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 text-sm sm:text-base">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 font-medium text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Analysis
            </div>
            <h2 
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4 sm:mb-6"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Analyze Your <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">PYQs</span>
              <br className="hidden sm:block" /> Like Never Before
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8">
              Upload your previous year question papers, define topics, and get instant AI-powered insights. 
              Perfect for exam preparation and trend analysis.
            </p>

            {/* Features Grid */}
            <div id="features" className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <FileSearch className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Smart Analysis</h3>
                <p className="text-sm text-slate-600">AI analyzes your PDFs and extracts topic-wise breakdown</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Trend Insights</h3>
                <p className="text-sm text-slate-600">Compare multiple papers and identify important topics</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <DownloadIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Export Reports</h3>
                <p className="text-sm text-slate-600">Download comprehensive PDF reports with charts</p>
              </div>
            </div>
          </div>

          {/* Main Form Card */}
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <h3 
                  className="text-xl sm:text-2xl font-bold text-slate-800"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Upload & Analyze
                </h3>
                <p className="text-sm text-slate-600">Upload up to 3 PDFs and define your topics</p>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="mb-6 sm:mb-8">
              <label className="flex flex-col items-center justify-center w-full h-40 sm:h-48 border-2 border-dashed border-blue-300 rounded-2xl cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 group">
                <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-sm sm:text-base font-semibold text-slate-700 mb-1">Click or drag to upload PDFs</span>
                <span className="text-xs sm:text-sm text-slate-500">Maximum 3 files • PDF format only</span>
                <input 
                  type="file" 
                  accept="application/pdf" 
                  multiple 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />
              </label>
              
              {files.length > 0 && (
                <div className="mt-4 space-y-2 sm:space-y-3">
                  {files.map((f, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                        <span className="font-medium text-slate-700 truncate text-sm sm:text-base">{f.name}</span>
                      </div>
                      <button
                        onClick={() => removeFile(idx)}
                        className="ml-2 p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Topics Section */}
            <div className="mb-6 sm:mb-8">
              <h4 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                Define Topics
              </h4>
              
              <div className="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {localTopics.map((t, i) => (
                  <div 
                    key={i} 
                    className="border-2 border-slate-200 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="Enter Main Topic (e.g., Data Structures)"
                        value={t.mainTopic}
                        onChange={(e) => handleMainChange(i, e.target.value)}
                        className="flex-1 p-2.5 sm:p-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm sm:text-base font-medium"
                      />
                      {localTopics.length > 1 && (
                        <button
                          onClick={() => removeMainTopic(i)}
                          className="p-2 sm:p-2.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-2 ml-0 sm:ml-4">
                      {t.subTopics.map((s, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Add Subtopic (optional)"
                            value={s}
                            onChange={(e) => handleSubChange(i, j, e.target.value)}
                            className="flex-1 p-2 sm:p-2.5 border border-slate-300 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm sm:text-base"
                          />
                          {t.subTopics.length > 1 && (
                            <button
                              onClick={() => removeSubTopic(i, j)}
                              className="p-1.5 sm:p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <button 
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mt-3 ml-0 sm:ml-4 text-sm sm:text-base" 
                      onClick={() => addSubTopic(i)}
                    >
                      <Plus className="w-4 h-4" /> Add Subtopic
                    </button>
                  </div>
                ))}
              </div>

              <button 
                className="flex items-center justify-center gap-2 w-full p-3 sm:p-4 mt-4 border-2 border-dashed border-blue-300 rounded-2xl text-blue-600 hover:bg-blue-50 font-semibold transition-all duration-300 text-sm sm:text-base" 
                onClick={addMainTopic}
              >
                <Plus className="w-5 h-5" /> Add Main Topic
              </button>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-gradient-to-r bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white p-4 sm:p-5 rounded-2xl font-bold text-base sm:text-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all duration-300 transform hover:-translate-y-1"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5 sm:w-6 sm:h-6" />
                  <span>Analyzing Papers...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>Start Analysis</span>
                </>
              )}
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand Section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={logoImage} 
                  alt="Exam-lens Logo" 
                  className="w-10 h-10 rounded-xl object-cover shadow-md"
                />
                <h3 
                  className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Exam-lens
                </h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                AI-powered tool for analyzing university and semester previous year question papers. 
                Get insights, trends, and downloadable reports.
              </p>
              <p className="text-xs text-slate-500">
                © 2025 Exam-lens. All rights reserved.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-slate-800 mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#features" className="hover:text-blue-600 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            {/* Developer Info */}
            <div>
              <h4 className="font-bold text-slate-800 mb-4">Developed By</h4>
              <p className="text-sm font-semibold text-slate-700 mb-3">Aditya Prasad Sahoo</p>
              <div className="flex items-center gap-3">
                <a 
                  href="https://www.linkedin.com/in/aditya-prasad-sahoo-1a86b01b9/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 transition-all duration-300 hover:shadow-md"
                  title="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href="https://github.com/Adityaprasad02" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-800 text-slate-600 hover:text-white transition-all duration-300 hover:shadow-md"
                  title="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a 
                  href="https://github.com/Adityaprasad02" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-600 transition-all duration-300 hover:shadow-md"
                  title="Website"
                >
                  <Globe className="w-5 h-5" />
                </a>
              </div>
              <p className="text-xs text-slate-500 mt-4">
                Built with ❤️ using Springboot , React and AI
              </p>
            </div>
          </div>
        </div>
      </footer>

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
  );
}