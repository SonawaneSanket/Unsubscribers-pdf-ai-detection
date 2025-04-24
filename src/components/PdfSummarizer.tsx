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
    <div className="min-h-screen bg-gradient-to-br from-gray-25 to-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Document Intelligence
            </h1>
          </div>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Transform PDFs into structured insights with AI-powered analysis.
            Extract summaries, visual assets, and key information from your
            documents.
          </p>
        </div>

        {/* Upload Card */}
        <div className="group relative mb-12">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-all duration-300"></div>
          <div className="relative bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:border-gray-200 transition-colors">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-5 items-start"
            >
              <label className="w-full flex-1 cursor-pointer">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                <div className="h-14 flex items-center justify-between px-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 transition-all">
                  <span
                    className={`text-gray-500 truncate ${
                      file ? "font-medium text-gray-700" : ""
                    }`}
                  >
                    {file ? file.name : "Select PDF document..."}
                  </span>
                  <div className="flex-shrink-0 ml-4 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors">
                    Browse
                  </div>
                </div>
              </label>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="animate-pulse">Analyzing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                    Start Analysis
                  </div>
                )}
              </button>
            </form>
            {error && (
              <div className="mt-5 p-4 bg-red-50/80 backdrop-blur-sm rounded-xl flex items-start gap-3 animate-fade-in">
                <div className="flex-shrink-0 pt-1">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="text-red-700 leading-tight">{error}</div>
              </div>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* PDF Preview Panel */}
          <div className="sticky top-8 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-25">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Document Preview
              </h2>
            </div>
            <div className="h-[700px] p-4 bg-gradient-to-br from-gray-25 to-gray-50">
              {previewUrl ? (
                <div className="relative h-full rounded-xl overflow-hidden shadow-inner border border-gray-200">
                  <embed
                    src={previewUrl}
                    type="application/pdf"
                    className="absolute inset-0 w-full h-full"
                  />
                  <div className="absolute bottom-4 right-4">
                    <a
                      href={previewUrl}
                      download={file?.name}
                      className="px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-600 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download
                    </a>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full flex items-center justify-center">
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500">No document selected</p>
                </div>
              )}
            </div>
          </div>

          {/* Analysis Results */}
          <div className="space-y-8">
            {summaries.length > 0 ? (
              summaries.map((page, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-25">
                    <h3 className="font-medium text-gray-900 flex items-center gap-3">
                      <span className="w-7 h-7 bg-blue-500/10 text-blue-600 rounded-lg flex items-center justify-center">
                        {idx + 1}
                      </span>
                      Page Analysis
                      {page.title && (
                        <span className="text-gray-500 font-normal ml-2">
                          - {page.title}
                        </span>
                      )}
                    </h3>
                  </div>
                  <div className="p-6 space-y-6">
                    {page.description && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                          Summary
                        </h4>
                        <p className="text-gray-600 leading-relaxed bg-gray-50/50 p-4 rounded-lg">
                          {page.description}
                        </p>
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
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-gray-100">
                <div className="animate-float mx-auto w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full flex items-center justify-center mb-6">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
                <h3 className="text-gray-500 text-lg font-medium">
                  {loading
                    ? "Unpacking document insights..."
                    : "Awaiting document analysis"}
                </h3>
                <p className="text-gray-400 mt-2">
                  {loading
                    ? "Crunching data and extracting visuals"
                    : "Upload a PDF to begin content extraction"}
                </p>
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

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
        {title}
      </h4>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {items.map((url, i) => (
          <a
            key={i}
            href={`${SERVER_BASE}${url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:border-blue-200 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <img
              src={`${SERVER_BASE}${url}`}
              alt={`${type}-${i}`}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute bottom-0 left-0 right-0 p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs font-medium truncate">View Full</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default PdfSummarizer;
