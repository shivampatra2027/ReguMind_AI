import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaChartLine,
  FaCheckCircle,
  FaFileAlt,
  FaFileImport,
  FaSpinner,
} from 'react-icons/fa';
import Toast from '../components/Toast';
import {
  analyzeDocument,
  extractDocumentText,
  generateMAP,
  generateRisk,
  getDocuments,
  uploadEvidence,
  validateCompliance,
} from '../services/documentService';

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

const statusStyles = {
  uploaded: 'border-blue-200 bg-blue-50 text-blue-700',
  extracted: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  analyzed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  failed: 'border-red-200 bg-red-50 text-red-700',
};

const getWorkflowStatus = (document) => {
  if (document.analysisStatus === 'completed') {
    return {
      label: 'Analysis Complete',
      style: statusStyles.analyzed,
    };
  }

  if (document.analysisStatus === 'failed' || document.processingStatus === 'failed') {
    return {
      label: 'Failed',
      style: statusStyles.failed,
    };
  }

  if (document.processingStatus === 'completed') {
    return {
      label: 'Extracted',
      style: statusStyles.extracted,
    };
  }

  return {
    label: 'Uploaded',
    style: statusStyles.uploaded,
  };
};

const Documents = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAction, setActiveAction] = useState(null);
  const [toast, setToast] = useState(null);

  const loadingKey = useMemo(
    () => (activeAction ? `${activeAction.type}:${activeAction.documentId}` : ''),
    [activeAction]
  );

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchDocuments = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      setIsLoading(true);
      const response = await getDocuments();
      setDocuments(response.documents || []);
    } catch (error) {
      showToast(getErrorMessage(error, 'Failed to fetch documents.'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const runDocumentAction = async (document, actionType) => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const isExtract = actionType === 'extract';
    const isAnalyze = actionType === 'analyze';
    const isGenerateMAP = actionType === 'generate-map';
    const isGenerateRisk = actionType === 'generate-risk';

    const actionLabel = isExtract
      ? 'Text extraction'
      : isAnalyze
        ? 'Document analysis'
        : isGenerateMAP
          ? 'Management Action Plan (MAP)'
          : 'Risk assessment';

    try {
      setActiveAction({ documentId: document.id, type: actionType });

      if (isExtract) {
        await extractDocumentText(document.id);
      } else if (isAnalyze) {
        await analyzeDocument(document.id);
      } else if (isGenerateMAP) {
        await generateMAP(document.id);
      } else if (isGenerateRisk) {
        await generateRisk(document.id);
      }

      showToast(`${actionLabel} completed for ${document.originalFileName}.`);
      await fetchDocuments();
    } catch (error) {
      showToast(getErrorMessage(error, `${actionLabel} failed.`), 'error');
    } finally {
      setActiveAction(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-4 py-8">
      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      <section className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-cyan-700">Document Workflow</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
                Document History
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Extract text, run AI analysis, and open completed results from one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-500 hover:text-cyan-700"
              >
                <FaArrowLeft className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                to="/upload"
                className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700"
              >
                Upload PDF
              </Link>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <FaSpinner className="h-5 w-5 animate-spin text-cyan-600" />
              <p className="text-sm font-medium">Loading documents...</p>
            </div>
          </div>
        ) : documents.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">No documents uploaded yet</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Upload a regulatory PDF to start the extraction and analysis workflow.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-slate-700">Document</th>
                    <th className="px-6 py-3 font-semibold text-slate-700">Workflow Status</th>
                    <th className="px-6 py-3 font-semibold text-slate-700">Uploaded</th>
                    <th className="px-6 py-3 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
<tbody className="divide-y divide-slate-100 bg-white">
                  {documents.map((doc) => {
                    const workflowStatus = getWorkflowStatus(doc);
                    const extractLoading = loadingKey === `extract:${doc.id}`;
                    const analyzeLoading = loadingKey === `analyze:${doc.id}`;
                    const mapLoading = loadingKey === `generate-map:${doc.id}`;
                    const riskLoading = loadingKey === `generate-risk:${doc.id}`;
                    const anyActionLoading = Boolean(activeAction);
                    const canExtract = doc.processingStatus !== 'completed';
                    const canAnalyze =
                      doc.processingStatus === 'completed' &&
                      doc.analysisStatus !== 'completed';
                    const canViewAnalysis = doc.analysisStatus === 'completed';
                    const canGenerateMAP =
                      doc.analysisStatus === 'completed' &&
                      doc.mapStatus !== 'completed';
                    const canGenerateRisk =
                      doc.mapStatus === 'completed' &&
                      doc.riskStatus !== 'completed';

                    const canValidateCompliance =
                      doc.mapStatus === 'completed' &&
                      (doc.validationStatus !== 'completed' &&
                        doc.validationStatus !== 'processing');

                    const validateLoading =
                      loadingKey === `validate:${doc.id}`;

                    return (
                      <tr key={doc.id} className="align-top">
                        <td className="max-w-sm px-6 py-5">
                          <div className="flex gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
                              <FaFileAlt className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-950">
                                {doc.originalFileName}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Processing: {doc.processingStatus} | Analysis: {doc.analysisStatus}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-md border px-3 py-1 text-xs font-semibold ${workflowStatus.style}`}
                          >
                            {workflowStatus.label}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-slate-600">
                          {new Date(doc.createdAt).toLocaleString()}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => runDocumentAction(doc, 'extract')}
                              disabled={!canExtract || anyActionLoading}
                              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-500 hover:text-cyan-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                            >
                              {extractLoading ? (
                                <FaSpinner className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <FaFileImport className="h-3.5 w-3.5" />
                              )}
                              Extract Text
                            </button>

                            <button
                              type="button"
                              onClick={() => runDocumentAction(doc, 'analyze')}
                              disabled={!canAnalyze || anyActionLoading}
                              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                            >
                              {analyzeLoading ? (
                                <FaSpinner className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <FaChartLine className="h-3.5 w-3.5" />
                              )}
                              Analyze Document
                            </button>

                            <button
                              type="button"
                              onClick={() => runDocumentAction(doc, 'generate-map')}
                              disabled={!canGenerateMAP || anyActionLoading}
                              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                            >
                              {mapLoading ? (
                                <FaSpinner className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <FaCheckCircle className="h-3.5 w-3.5" />
                              )}
                              Generate MAP
                            </button>

                            <button
                              type="button"
                              onClick={() => runDocumentAction(doc, 'generate-risk')}
                              disabled={!canGenerateRisk || anyActionLoading}
                              className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                            >
                              {riskLoading ? (
                                <FaSpinner className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <FaChartLine className="h-3.5 w-3.5" />
                              )}
                              Generate Risk
                            </button>

                            <button
                              type="button"
                              onClick={() => navigate(`/analysis/${doc.id}`)}
                              disabled={!canViewAnalysis || anyActionLoading}
                              className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                            >
                              <FaCheckCircle className="h-3.5 w-3.5" />
                              View Analysis
                            </button>

                            <button
                              type="button"
                              onClick={async () => {
                                const input = window.document.getElementById(
                                  `evidence-input-${doc.id}`
                                );
                                input?.click();
                              }}
                              disabled={!canValidateCompliance || anyActionLoading}
                              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:bg-indigo-200 disabled:text-indigo-400"
                            >
                              {validateLoading ? (
                                <FaSpinner className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <FaCheckCircle className="h-3.5 w-3.5" />
                              )}
                              Validate Compliance
                            </button>

                            <input
                              id={`evidence-input-${doc.id}`}
                              type="file"
                              accept="application/pdf,.pdf,text/plain,.txt"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                try {
                                  setActiveAction({
                                    documentId: doc.id,
                                    type: 'validate',
                                  });

                                  // MVP: evidence upload must be done before validation.
                                  await uploadEvidence(doc.id, file);
                                  await validateCompliance(doc.id);

                                  showToast(
                                    `Compliance validation completed for ${doc.originalFileName}.`
                                  );
                                  await fetchDocuments();
                                } catch (error) {
                                  showToast(
                                    getErrorMessage(
                                      error,
                                      'Compliance validation failed.'
                                    ),
                                    'error'
                                  );
                                } finally {
                                  setActiveAction(null);
                                }
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default Documents;
