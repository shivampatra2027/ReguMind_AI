import { useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaCloudUploadAlt, FaFilePdf, FaTimesCircle } from 'react-icons/fa';

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
    } catch (uploadError) {
      setError(getErrorMessage(uploadError));
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-4 py-8">
      <section className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="mb-4 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-400 hover:text-emerald-700"
            >
              <FaArrowLeft className="h-3.5 w-3.5" />
              Dashboard
            </button>
            <p className="text-sm font-medium text-emerald-700">Document Intake</p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-950">Upload PDF</h1>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
            <p className="font-medium text-slate-950">Accepted format</p>
            <p className="mt-1 text-slate-600">PDF up to 10MB</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex min-h-[320px] flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-300 bg-slate-50 hover:border-emerald-400'
              }`}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <FaCloudUploadAlt className="h-8 w-8" />
              </div>

              <h2 className="mt-5 text-xl font-semibold text-slate-950">Drop PDF here</h2>
              <p className="mt-2 max-w-md text-sm text-slate-600">
                Upload regulatory documents, policies, audit evidence, or compliance records.
              </p>

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
                className="mt-6 rounded-md bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Browse File
              </button>
            </div>

            {selectedFileSummary && (
              <div className="mt-5 flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-600">
                  <FaFilePdf className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-950">{selectedFileSummary.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{selectedFileSummary.size}</p>
                </div>
              </div>
            )}

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

            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="mt-6 w-full rounded-md bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isUploading ? 'Uploading...' : 'Upload PDF'}
            </button>
          </div>

          <aside className="space-y-6">
            {success && (
              <div className="rounded-lg border border-emerald-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 text-emerald-700">
                  <FaCheckCircle className="h-6 w-6" />
                  <h2 className="text-lg font-semibold">Upload Success</h2>
                </div>
                <dl className="mt-5 space-y-4 text-sm">
                  <div>
                    <dt className="font-medium text-slate-500">Document ID</dt>
                    <dd className="mt-1 break-all font-semibold text-slate-950">{success.id}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">Status</dt>
                    <dd className="mt-1 inline-flex rounded-md bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                      {success.status}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 text-red-700">
                  <FaTimesCircle className="h-6 w-6" />
                  <h2 className="text-lg font-semibold">Upload Error</h2>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-700">{error}</p>
              </div>
            )}

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Pipeline</p>
              <div className="mt-4 space-y-3">
                {['Upload', 'Metadata capture', 'AI analysis queue'].map((step, index) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                      {index + 1}
                    </div>
                    <p className="text-sm font-medium text-slate-800">{step}</p>
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
