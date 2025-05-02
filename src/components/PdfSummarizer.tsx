import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";

const SERVER_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

type PageSummary = {
  title: string;
  description: string;
  embeddedImages: string[];
  logos: string[];
  photos: string[];
};

const PdfSummarizer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<PageSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setSummaries([]);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${SERVER_BASE}/pdf/summarize`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }
      const data: PageSummary[] = await res.json();
      console.log("Fetched summaries:", data);
      setSummaries(data);
      if (data.length === 0) {
        setError("No pages were extracted. Ensure the PDF has readable text.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50 min-h-screen font-sans">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-16">
        {/* Header Section */}
        <div className="mb-10 sm:mb-12 md:mb-16 text-center px-2 sm:px-4">
          <div className="inline-block">
            <div className="relative z-10 mb-4 sm:mb-5 inline-flex items-center bg-gradient-to-br from-blue-700 to-indigo-800 py-2 px-4 sm:py-2.5 sm:px-5 rounded-full shadow-md sm:shadow-lg">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-white mr-2 sm:mr-2.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-xs sm:text-sm font-semibold text-white tracking-wide">POWERED BY AI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">Document Intelligence</h1>
            <div className="w-16 sm:w-20 h-1 sm:h-1.5 bg-blue-600 mx-auto rounded-full mb-4 sm:mb-6"></div>
          </div>
          <p className="text-gray-700 text-sm sm:text-base md:text-lg max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed">
            Transform PDFs into structured insights with AI-powered analysis.
            Extract summaries, visual assets, and key information in seconds.
          </p>
        </div>

        {/* Upload Card */}
        <div className="group relative mb-10 sm:mb-12 lg:mb-16">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-indigo-600/20 rounded-3xl blur-xl opacity-70 transition-all duration-500 ease-out group-hover:opacity-80" />
          <div className="relative bg-white backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 border border-blue-100 transition-all duration-300 hover:transform hover:scale-[1.01]">
            <form
              onSubmit={handleSubmit}
              className="w-full flex flex-col sm:flex-row gap-4 sm:gap-5 md:gap-6 items-center sm:items-stretch"
            >
              <label className="w-full flex-1 cursor-pointer min-w-0">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                <div className="w-full h-12 sm:h-14 md:h-16 flex items-center justify-between px-4 sm:px-6 border-2 border-dashed border-blue-200 hover:border-blue-400 rounded-xl transition-all duration-300 group-hover:shadow-md bg-blue-50/30 hover:bg-blue-50/50">
                  <span
                    className={`text-sm sm:text-base text-gray-600 truncate max-w-[60%] ${file ? "font-medium text-gray-800" : "font-normal"
                      }`}
                  >
                    {file ? file.name : "Select PDF document..."}
                  </span>
                  <div className="flex-shrink-0 ml-2 sm:ml-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-white shadow-sm hover:shadow text-blue-600 rounded-lg transition-all duration-200 text-sm sm:text-base font-medium border border-blue-100 hover:border-blue-300">
                    Browse
                  </div>
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto h-12 sm:h-14 md:h-16 px-6 sm:px-8 md:px-10 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-70 flex-shrink-0"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 border-[2px] sm:border-[3px] border-white border-t-transparent rounded-full animate-spin" />
                    <span className="animate-pulse text-sm sm:text-base md:text-lg tracking-wide">Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-transform duration-200 group-hover:translate-y-[-2px]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                    <span className="text-sm sm:text-base md:text-lg tracking-wide whitespace-nowrap">Analyze Document</span>
                  </div>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-6 p-5 bg-gradient-to-r from-red-50 to-red-100/80 rounded-xl flex items-start gap-4 animate-fade-in border border-red-200 shadow-md">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 border border-red-200">
                  <svg
                    className="w-6 h-6 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-red-800 font-semibold text-base sm:text-lg mb-1">Error Occurred</h4>
                  <div className="text-red-700 text-sm sm:text-base leading-relaxed">
                    {error}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
          {/* PDF Preview Panel */}
          <div className="lg:sticky lg:top-8 w-full bg-white backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <div className="p-5 sm:p-6 border-b border-blue-50 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/30">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <span className="truncate">Document Preview</span>
              </h2>
            </div>
            <div className="h-[400px] sm:h-[450px] md:h-[500px] lg:h-[600px] p-4 sm:p-5 bg-gradient-to-br from-gray-50 to-blue-50/10">
              {previewUrl ? (
                <div className="relative h-full max-h-[80vh] rounded-xl overflow-hidden shadow-lg">
                  <div className="relative h-full overflow-y-auto">
                    <embed
                      src={previewUrl}
                      type="application/pdf"
                      className="absolute inset-0 w-full h-full"
                    />
                    <div className="sticky bottom-3 right-3 sm:bottom-4 sm:right-4 float-right z-10">
                      <a
                        href={previewUrl}
                        download={file?.name}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium"
                      >
                        <svg
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        <span className="whitespace-nowrap">Download PDF</span>
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center space-y-4 sm:space-y-6 p-4 text-gray-400">
                  {/* 1. relative wrapper sized to the LARGER (gradient) circle */}
                  <div
                    className="
                    relative
                    w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32
                    flex items-center justify-center
                  "
                  >
                    {/* 2. full‑bleed gradient circle, absolutely inset */}
                    <div
                      className="
                      absolute inset-0
                      bg-gradient-to-br from-blue-100 to-indigo-50
                      rounded-full
                      shadow-inner
                      animate-pulse-slow
                      opacity-60
                    "
                    />

                    {/* 3. smaller white circle with icon, flex‑centered */}
                    <div
                      className="
                      relative z-10
                      w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28
                      bg-white
                      rounded-full
                      border-4 border-blue-50
                      shadow-md
                      flex items-center justify-center
                    "
                    >
                      <svg
                        className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 text-blue-300"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-gray-700 text-base sm:text-lg font-semibold">
                      No Document Selected
                    </p>
                    <p className="text-gray-500 text-sm sm:text-base max-w-xs mx-auto">
                      Upload a PDF document to preview its contents here
                    </p>
                  </div>
                </div>

              )}
            </div>
          </div>

          {/* Analysis Results */}
          <div className="w-full space-y-4 sm:space-y-6 lg:space-y-8">
            {summaries.length > 0 ? (
              summaries.map((page, idx) => (
                <div
                  key={idx}
                  className="w-full bg-white backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-blue-100 overflow-hidden transition-all duration-300 hover:shadow-2xl"
                >
                  <div className="p-4 sm:p-5 md:p-6 border-b border-blue-50 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/30">
                    <h4 className="flex items-start gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-xs sm:text-sm md:text-base rounded-lg flex items-center justify-center shrink-0 font-bold shadow-md mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base sm:text-lg md:text-xl font-bold text-gray-800 leading-tight">Page Analysis</span>
                        {page.title && (
                          <span className="text-gray-500 font-medium text-sm sm:text-base break-words w-full overflow-hidden">
                            {page.title}
                          </span>
                        )}
                      </div>
                    </h4>
                  </div>
                  <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
                    {page.description && (
                      <div className="space-y-2 sm:space-y-3">
                        <h4 className="text-xs sm:text-sm font-semibold text-blue-600 uppercase tracking-wide flex items-center gap-1.5 sm:gap-2">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Summary
                        </h4>
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/30 p-4 sm:p-5 rounded-lg sm:rounded-xl text-gray-700 leading-relaxed text-sm sm:text-base border border-blue-100 shadow-inner">
                          {page.description}
                        </div>
                      </div>
                    )}

                    <MediaGrid
                      title="Embedded Graphics"
                      items={page.embeddedImages}
                      type="image"
                    />
                    <MediaGrid
                      title="Brand Logos"
                      items={page.logos}
                      type="logo"
                    />
                    <MediaGrid
                      title="Photographic Content"
                      items={page.photos}
                      type="photo"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-6 sm:p-8 md:p-10 text-center border border-blue-100 bg-gradient-to-br from-white via-white to-blue-50/30">
                <div className="relative flex justify-center items-center h-20 sm:h-24 md:h-32 mb-5 sm:mb-6 md:mb-8">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full absolute inset-0 m-auto animate-pulse-slow"></div>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center shadow-lg relative z-10">
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-gray-800 text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3">
                  {loading ? "Unpacking Insights..." : "Ready for Analysis"}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-xs sm:max-w-sm md:max-w-md mx-auto">
                  {loading
                    ? "AI is extracting content and visual assets from your document..."
                    : "Upload a PDF document to begin AI-powered intelligent processing"}
                </p>
                {loading && (
                  <div className="mt-4 sm:mt-6 w-full bg-blue-100 rounded-full h-2 overflow-hidden shadow-inner">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full animate-pulse w-2/3" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MediaGrid: React.FC<{
  title: string;
  items: string[];
  type: "image" | "logo" | "photo";
}> = ({ title, items, type }) => {
  if (items.length === 0) return null;

  const titleIcon = {
    image: <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    logo: <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
    photo: <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <h4 className="text-xs sm:text-sm font-semibold text-blue-600 uppercase tracking-wide flex items-center gap-1.5 sm:gap-2">
        {titleIcon[type]}
        {title}
      </h4>
      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {items.map((url, i) => (
          <a
            key={i}
            href={`${SERVER_BASE}${url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block aspect-square bg-gray-50 rounded-lg sm:rounded-xl overflow-hidden border border-blue-100 hover:border-blue-300 transition-all shadow-sm sm:shadow-md hover:shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            <img
              src={`${SERVER_BASE}${url}`}
              alt={`${type}-${i}`}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-xs sm:text-sm font-medium whitespace-nowrap">View Full</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default PdfSummarizer;
