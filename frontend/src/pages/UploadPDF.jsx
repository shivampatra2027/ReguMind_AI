import { useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaCloudUploadAlt, FaFilePdf, FaTimesCircle } from 'react-icons/fa';
import WorkflowStepper from "../components/WorkflowStepper";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const maxFileSize = 10 * 1024 * 1024;

const formatFileSize = (bytes) => {
  if (!bytes) {
    return '0 KB';
  }

  const units = ['bytes', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;

  return `${value.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
};

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || 'Upload failed. Please try again.';

const UploadPDF = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  const selectedFileSummary = useMemo(() => {
    if (!file) {
      return null;
    }

    return {
      name: file.name,
      size: formatFileSize(file.size),
    };
  }, [file]);

  const clearResult = () => {
    setSuccess(null);
    setError('');
    setUploadProgress(0);
  };

  const validateAndSetFile = (selectedFile) => {
    clearResult();

    if (!selectedFile) {
      return;
    }

    if (selectedFile.type !== 'application/pdf' || !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setFile(null);
      setError('Only PDF files are allowed.');
      return;
    }

    if (selectedFile.size > maxFileSize) {
      setFile(null);
      setError('PDF file must be 10MB or smaller.');
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (event) => {
    validateAndSetFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    validateAndSetFile(event.dataTransfer.files?.[0]);
  };

  const handleUpload = async () => {
    clearResult();

    if (!file) {
      setError('Select a PDF file before uploading.');
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.replace(/\.pdf$/i, ''));

    try {
      setIsUploading(true);

      const response = await axios.post(`${apiBaseUrl}/documents/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) {
            return;
          }

          setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        },
      });

      setSuccess(response.data.document);
      setFile(null);
      setUploadProgress(100);

      const documentId = response.data.document.id;

      // Pipeline Steps: Each is an async operation that runs sequentially

      // Step 1 - Extract Text from the uploaded document
      await axios.post(
        `${apiBaseUrl}/documents/${documentId}/extract`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Step 2 - Analyze the extracted text for context and details
      await axios.post(
        `${apiBaseUrl}/documents/${documentId}/analyze`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Step 3 - Generate a compliance map (MAP) based on the analysis
      await axios.post(
        `${apiBaseUrl}/documents/${documentId}/generate-map`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Step 4 - Perform a risk assessment based on the document and analysis
      await axios.post(
        `${apiBaseUrl}/documents/${documentId}/generate-risk`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Navigate to the analysis dashboard for the new document
      navigate(`/analysis/${documentId}`);
    } catch (uploadError) {
      setError(getErrorMessage(uploadError));
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#030B3D] px-4 py-8 text-white overflow-hidden">
      {/* Background with animated Aurora glow and blobs */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.25),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(6,182,212,0.25),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(59,130,246,0.25),transparent_30%)] animate-aurora"></div>

        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-fuchsia-500/20 blur-[150px] animate-blob"></div>

        <div className="absolute top-20 right-0 h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[150px] animate-blob animation-delay-2000"></div>

        <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-purple-500/20 blur-[150px] animate-blob animation-delay-4000"></div>
      </div>
      <div className="absolute inset-0 opacity-20">
  <svg className="w-full h-full" viewBox="0 0 1440 900">
    <path
      d="M200 0 C400 300 400 600 200 900"
      stroke="#4F46E5"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M600 0 C800 300 800 600 600 900"
      stroke="#06B6D4"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M1000 0 C1200 300 1200 600 1000 900"
      stroke="#A855F7"
      strokeWidth="2"
      fill="none"
    />
  </svg>
</div>


      <section className="mx-auto max-w-5xl">
        <WorkflowStepper currentStep={0} />

        {/* Header panel */}
        <div className="mb-8 rounded-[32px] border border-white/10 bg-white/[0.05] backdrop-blur-2xl p-8 text-white shadow-[0_0_60px_rgba(6,182,212,0.15)]">
          <h1 className="text-4xl font-bold">
            Upload Regulatory Document
          </h1>

          <p className="mt-3 text-lg text-blue-100">
            Upload PDFs and let AI perform compliance analysis, risk assessment and audit preparation.
          </p>
        </div>

        {/* Main upload area and side panel */}
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.05] backdrop-blur-xl p-6 shadow-xl">
            {/* Drag-and-drop zone */}
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex min-h-[350px] flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-10 text-center transition-all duration-300 ${
                isDragging
                  ? 'border-cyan-500 bg-cyan-50'
                  : 'border-cyan-500/30 bg-cyan-500/10 hover:border-cyan-500'
              }`}
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xl">
                <FaCloudUploadAlt className="h-12 w-12" />
              </div>

              <h2 className="mt-5 text-xl font-semibold text-white">Drop PDF here</h2>
              <p className="mt-2 max-w-md text-sm text-slate-400">
                Upload regulatory documents, policies, audit evidence, or compliance records.
              </p>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="mt-6 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-105 disabled:opacity-50"
              >
                Browse File
              </button>
            </div>

            {/* Selected file summary */}
            {selectedFileSummary && (
              <div className="mt-5 flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-600">
                  <FaFilePdf className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-950">{selectedFileSummary.name}</p>
                  <p className="mt-1 text-sm text-cyan-300">{selectedFileSummary.size}</p>
                </div>
              </div>
            )}

            {/* Upload progress bar */}
            {isUploading && (
              <div className="mt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">Uploading</span>
                  <span className="font-semibold text-emerald-700">{uploadProgress}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Main upload button */}
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-500 px-6 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl disabled:bg-slate-300 disabled:from-slate-400 disabled:to-slate-400 disabled:via-slate-400"
            >
              {isUploading ? 'Processing...' : 'Upload PDF'}
            </button>
          </div>

          {/* Side panel for status, errors, and pipeline information */}
          <aside className="space-y-6">
            {success && (
              <div className="
rounded-3xl
border border-emerald-500/20
bg-white/[0.04]
backdrop-blur-xl
p-6
shadow-[0_0_30px_rgba(16,185,129,0.15)]
">
                <div className="flex items-center gap-3 text-emerald-700">
                  <FaCheckCircle className="h-6 w-6" />
                  <h2 className="text-lg font-semibold">Upload Success</h2>
                </div>
                <dl className="mt-5 space-y-4 text-sm">
                  <div>
                    <dt className="font-medium text-cyan-300">Document ID</dt>
                    <dd className="mt-1 break-all font-semibold text-white">{success.id}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-cyan-300">Status</dt>
                    <dd className="mt-1 inline-flex rounded-md bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                      {success.status}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            {error && (
              <div className="
rounded-3xl
border border-red-500/20
bg-white/[0.04]
backdrop-blur-xl
p-6
shadow-[0_0_30px_rgba(239,68,68,0.15)]
">
                <div className="flex items-center gap-3 text-red-700">
                  <FaTimesCircle className="h-6 w-6" />
                  <h2 className="text-lg font-semibold">Upload Error</h2>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-700">{error}</p>
              </div>
            )}

            {/* Pipeline status visualizer */}
            <div className="
rounded-3xl
border border-cyan-500/20
bg-white/[0.04]
backdrop-blur-xl
p-6
shadow-[0_0_40px_rgba(6,182,212,0.12)]
">
              <p className="text-sm font-medium text-cyan-300">Pipeline</p>
              <div className="mt-6 space-y-4">
                {['Upload', 'Metadata capture', 'AI analysis queue'].map((step, index) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className="
flex h-8 w-8 items-center justify-center
rounded-full
bg-gradient-to-r
from-fuchsia-500
to-cyan-500
text-white
text-xs
font-bold
shadow-[0_0_15px_rgba(168,85,247,0.5)]
">
                      {index + 1}
                    </div>
                    <p className="text-sm font-medium text-white">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default UploadPDF;