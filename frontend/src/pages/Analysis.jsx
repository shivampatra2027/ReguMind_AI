import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import WorkflowStepper from '../components/WorkflowStepper';
import Toast from '../components/Toast';
import { uploadEvidence, validateCompliance } from '../services/documentService';

const formatValue = (value) => {
  if (!value) {
    return 'Not specified';
  }

  return value;
};


const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || 'Failed to load analysis.';

const getRiskBand = (score) => {
  const numericScore = Number(score) || 0;

  if (numericScore <= 30) {
    return {
      label: 'Low',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    };
  }

  if (numericScore <= 60) {
    return {
      label: 'Medium',
      className: 'border-amber-200 bg-amber-50 text-amber-700',
    };
  }

  if (numericScore <= 80) {
    return {
      label: 'High',
      className: 'border-orange-200 bg-orange-50 text-orange-700',
    };
  }

  return {
    label: 'Critical',
    className: 'border-red-200 bg-red-50 text-red-700',
  };
};



const Analysis = () => {
  const { id } = useParams();

const documentId =
  id || localStorage.getItem('documentId');

  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(documentId));
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!documentId) {
        setAnalysis(null);
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        setIsLoading(true);
        setError('');

        const response = await axios.get(`${apiBaseUrl}/documents/${documentId}/analysis`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setAnalysis(response.data);
      } catch (analysisError) {
        setError(getErrorMessage(analysisError));
        setAnalysis(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [documentId, navigate]);

  const obligations = analysis?.obligations || [];
  const maps = analysis?.maps || [];
  const risks = analysis?.risks || [];
  const overallRiskBand = getRiskBand(analysis?.overallRiskScore);

  const validationStatus = analysis?.validationStatus || '';
  const validationResult = analysis?.validationResult || null;

  // const validationBand = (() => {
  //   const s = String(validationStatus || '').toLowerCase();
  //   if (s === 'completed') {
  //     return {
  //       className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  //       label: 'Completed',
  //     };
  //   }
  //   if (s === 'processing') {
  //     return {
  //       className: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  //       label: 'Processing',
  //     };
  //   }
  //   if (s === 'failed') {
  //     return {
  //       className: 'border-red-200 bg-red-50 text-red-700',
  //       label: 'Failed',
  //     };
  //   }
  //   return {
  //     className: 'border-slate-200 bg-slate-50 text-slate-700',
  //     label: 'Pending',
  //   };
  // })();
  const validationBand = (() => {
    const s = String(validationStatus || '').toLowerCase();

    if (s === 'completed') {
      return {
        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        label: 'Completed',
      };
    }

    if (s === 'partially_completed') {
      return {
        className: 'border-amber-200 bg-amber-50 text-amber-700',
        label: 'Partially Completed',
      };
    }

    if (s === 'incomplete') {
      return {
        className: 'border-red-200 bg-red-50 text-red-700',
        label: 'Incomplete',
      };
    }

    if (s === 'processing') {
      return {
        className: 'border-cyan-200 bg-cyan-50 text-cyan-700',
        label: 'Processing',
      };
    }

    if (s === 'failed') {
      return {
        className: 'border-red-200 bg-red-50 text-red-700',
        label: 'Failed',
      };
    }

    return {
      className: 'border-slate-200 bg-cyan-500/10 text-slate-700',
      label: 'Pending',
    };
  })();
  const hasValidation = Boolean(validationResult && validationStatus && validationStatus !== 'pending');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const refreshAnalysis = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiBaseUrl}/documents/${documentId}/analysis`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalysis(response.data);
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };

  const validateExistingEvidence = async () => {
    if (!analysis?.evidenceFiles?.length) {
      showToast('No evidence available to validate.', 'error');
      return;
    }

    if (!analysis?.mapStatus || analysis.mapStatus !== 'completed') {
      showToast('Management Action Plan needs to be completed before validation.', 'error');
      return;
    }

    try {
      setActionInProgress(true);
      await validateCompliance(documentId);
      showToast('Validation completed successfully.');
      await refreshAnalysis();
    } catch (validationError) {
      showToast(getErrorMessage(validationError), 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleEvidenceUploadAndValidate = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setActionInProgress(true);
      await uploadEvidence(id, file);
      await validateCompliance(documentId);
      showToast('Evidence uploaded and validation completed.');
      await refreshAnalysis();
    } catch (uploadError) {
      showToast(getErrorMessage(uploadError), 'error');
    } finally {
      setActionInProgress(false);
      event.target.value = null;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#a62121] via-[#000000] to-[#c62525] px-4 py-8 text-white overflow-hidden">
      <div className="fixed inset-0 overflow-hidden -z-10">

  <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-fuchsia-500/30 blur-[180px] animate-blob"></div>

  <div className="absolute top-20 right-0 h-[500px] w-[500px] rounded-full bg-cyan-500/30 blur-[180px] animate-blob animation-delay-2000"></div>

  <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-purple-500/30 blur-[180px] animate-blob animation-delay-4000"></div>

  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

</div>
      <section className="mx-auto max-w-6xl">
        <WorkflowStepper currentStep={1} />

        <div className="
mb-8
rounded-[32px]
border border-cyan-500/20
bg-white/[0.05]
backdrop-blur-2xl
p-8
shadow-[0_0_50px_rgba(6,182,212,0.15)]
">
  <div className="grid gap-6 lg:grid-cols-[1fr_350px_auto]">
            <div>
              <p className="text-sm font-semibold uppercase text-black-700">AI Compliance Analysis</p>
              <h1 className="mt-2 break-words text-2xl font-bold text-white md:text-3xl">
                <div className="break-all">
  {analysis?.title || 'Document analysis'}
</div>
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                Review the generated summary and extracted obligations for this regulatory document.
              </p>
            </div>

            <div className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-950">Uploaded Evidence</h2>
                <p className="text-sm text-slate-500">Evidence Files</p>
              </div>

              {(analysis?.evidenceFiles || []).length === 0 ? (
                <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-800">
                  No evidence files uploaded for this document.
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {(analysis.evidenceFiles || []).map((f, idx) => (
                    <div key={`${f.fileName || 'evidence'}-${idx}`} className="rounded-lg border border-slate-100 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-semibold text-slate-900">{f.fileName}</div>
                          <div className="mt-1 text-xs text-slate-500">Uploaded: {f.uploadedAt ? new Date(f.uploadedAt).toLocaleString() : 'Unknown'}</div>
                          <div className="mt-1 text-xs text-slate-500">Type: {f.fileType || 'unknown'}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-semibold">Extraction</div>
                          <div className="mt-1 text-xs text-slate-500">{(f.extractionStatus || 'pending').toUpperCase()}</div>
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-slate-700">
                        {f.extractionStatus === 'failed' ? (
                          <div className="italic text-slate-500">Evidence text could not be extracted.</div>
                        ) : f.preview ? (
                          <pre className="whitespace-pre-wrap max-h-40 overflow-auto text-sm">{f.preview}</pre>
                        ) : (
                          <div className="italic text-slate-500">No preview available.</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/documents"
              className="inline-flex items-center justify-center rounded-lg border border-slate-100 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-red-500 hover:text-red-700"
            >
              Back to documents
            </Link>
          </div>
        </div>

        {!id && (
          <div className="rounded-lg border border-amber-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Select a document first</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Open Document History and choose a document to view its analysis.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-300">Loading analysis...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-red-700">Unable to load analysis</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">{error}</p>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            <Toast
              message={toast?.message}
              type={toast?.type}
              onClose={() => setToast(null)}
            />
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-xl font-bold text-slate-950">Summary</h2>
                  <span className="inline-flex w-fit rounded-md bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700">
                    {analysis.analysisStatus}
                  </span>
                </div>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">
                  {analysis.summary || 'No summary is available for this document yet.'}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:min-w-48">
                <p className="text-sm font-medium text-slate-500">Obligations</p>
                <p className="mt-3 text-4xl font-bold text-slate-950">{obligations.length}</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-xl font-bold text-slate-950">Obligations</h2>
              </div>


              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-slate-700">Title</th>
                      <th className="px-6 py-3 font-semibold text-slate-700">Department</th>
                      <th className="px-6 py-3 font-semibold text-slate-700">Priority</th>
                      <th className="px-6 py-3 font-semibold text-slate-700">Deadline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {obligations.length === 0 ? (
                      <tr>
                        <td className="px-6 py-6 text-slate-500" colSpan="4">
                          No obligations were found for this document.
                        </td>
                      </tr>
                    ) : (
                      obligations.map((obligation, index) => (
                        <tr key={`${obligation.title || 'obligation'}-${index}`}>
                          <td className="max-w-sm px-6 py-4 font-medium text-slate-950">
                            {formatValue(obligation.title)}
                          </td>
                          <td className="px-6 py-4 text-slate-700">
                            {formatValue(obligation.department)}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex rounded-md bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                              {formatValue(obligation.priority)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-700">
                            {formatValue(obligation.deadline)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">Management Action Plans</h2>
              <p className="mt-2 text-sm text-slate-300">
                Actionable compliance plans generated from extracted obligations.
              </p>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {analysis?.mapStatus !== 'completed' ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-300">
                    No management action plans generated yet.
                  </div>
                ) : maps.length === 0 ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-300">
                    No management action plans found for this document.
                  </div>
                ) : (
                  maps.map((map, index) => (
                    <div
                      key={`${map.obligationTitle || 'map'}-${index}`}
                      className="
rounded-3xl
border border-cyan-500/20
bg-white/[0.05]
backdrop-blur-xl
p-5
shadow-[0_0_25px_rgba(6,182,212,0.15)]
"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="text-sm font-semibold uppercase text-cyan-700">
                          MAP {index + 1}
                        </div>
                        <div className="text-lg font-bold text-slate-950">
                          {map.obligationTitle || 'Untitled obligation'}
                        </div>
                        <div className="text-sm text-slate-700">
                          <span className="font-semibold text-slate-900">Objective:</span>{' '}
                          {map.objective || formatValue('Not specified')}
                        </div>
                        <div className="text-sm text-slate-700">
                          <span className="font-semibold text-slate-900">Owner:</span>{' '}
                          {map.owner || formatValue('Not specified')}
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="text-sm font-semibold text-slate-900">
                          Action Plan Steps
                        </div>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                          {(map.actionPlan || []).map((step, stepIndex) => (
                            <li key={`${index}-${stepIndex}`}>{step}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4">
                        <div className="text-sm font-semibold text-slate-900">
                          Deliverables
                        </div>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                          {(map.deliverables || []).map((d, dIndex) => (
                            <li key={`${index}-d-${dIndex}`}>{d}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div>
                          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Estimated Effort
                          </div>
                          <div className="mt-1 text-sm font-semibold text-slate-900">
                            {map.estimatedEffort || 'Medium'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Timeline
                          </div>
                          <div className="mt-1 text-sm font-semibold text-slate-900">
                            {map.timeline || 'Not specified'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">Compliance Validation</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Evidence-based validation of whether the Management Action Plans were completed.
                  </p>
                </div>

                <div
                  className={`inline-flex w-fit flex-col rounded-lg border px-5 py-3 ${validationBand.className}`}
                >
                  <span className="text-xs font-semibold uppercase">Validation Status</span>
                  <span className="mt-1 text-sm font-semibold">{validationBand.label}</span>

                  {hasValidation && (
                    <span className="mt-2 text-2xl font-bold">
                      {Number(validationResult?.confidence) || 0}%
                    </span>
                  )}

                  {!hasValidation && (
                    <span className="mt-2 text-sm font-semibold">0%</span>
                  )}
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                {!hasValidation ? (
                  <div>No validation has been performed yet.</div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold text-slate-900">Reason:</span>{' '}
                      {validationResult?.reason || 'Not specified'}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">Outcome:</span>{' '}
                      {validationResult?.status || 'Not specified'}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={validateExistingEvidence}
                  disabled={actionInProgress || !analysis?.evidenceFiles?.length || analysis?.mapStatus !== 'completed'}
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-red-600 via-red-500 to-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-900"
                >
                  {actionInProgress ? 'Processing...' : 'Validate Existing Evidence'}
                </button>
                <button
                  type="button"
                  onClick={() => document.getElementById('analysis-evidence-input')?.click()}
                  disabled={actionInProgress || analysis?.mapStatus !== 'completed'}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-500 hover:text-cyan-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {actionInProgress ? 'Processing...' : 'Upload Evidence & Validate'}
                </button>
                <input
                  id="analysis-evidence-input"
                  type="file"
                  accept="application/pdf,.pdf,text/plain,.txt"
                  className="hidden"
                  onChange={handleEvidenceUploadAndValidate}
                />
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">Risk Assessment</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Compliance risk scoring generated from obligations and Management Action Plans.
                  </p>
                </div>


                <div
                  className={`inline-flex w-fit flex-col rounded-lg border px-5 py-3 ${overallRiskBand.className}`}
                >
                  <span className="text-xs font-semibold uppercase">Overall Risk Score</span>
                  <span className="mt-1 text-3xl font-bold">
                    {Number(analysis?.overallRiskScore) || 0}
                  </span>
                  <span className="text-sm font-semibold">{overallRiskBand.label}</span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {analysis?.riskStatus !== 'completed' ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-300">
                    No risk assessment generated yet.
                  </div>
                ) : risks.length === 0 ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-300">
                    No risk assessment items found for this document.
                  </div>
                ) : (
                  risks.map((risk, index) => {
                    const riskBand = getRiskBand(risk.riskScore);

                    return (
                      <div
                        key={`${risk.obligationTitle || 'risk'}-${index}`}
                        className="rounded-lg border border-slate-200 bg-white/[0.05] backdrop-blur-xl p-5 shadow-sm"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="text-sm font-semibold uppercase text-cyan-700">
                              Risk {index + 1}
                            </div>
                            <div className="mt-1 text-lg font-bold text-slate-950">
                              {risk.obligationTitle || 'Untitled obligation'}
                            </div>
                          </div>

                          <div
                            className={`inline-flex w-fit rounded-md border px-3 py-1 text-sm font-semibold ${riskBand.className}`}
                          >
                            {risk.riskScore || 0} - {risk.riskLevel || riskBand.label}
                          </div>
                        </div>

                        <div className="mt-4 space-y-3 text-sm text-slate-700">
                          <div>
                            <span className="font-semibold text-slate-900">Reason:</span>{' '}
                            {risk.reason || 'Not specified'}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900">Impact:</span>{' '}
                            {risk.impact || 'Not specified'}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900">Mitigation:</span>{' '}
                            {risk.mitigation || 'Not specified'}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <div className="flex justify-end mt-6">
  <button
    onClick={() => navigate(`/risk/${documentId}`)}
    className="rounded-lg bg-black px-6 py-3 text-white font-semibold hover:bg-gray-600"
  >
    Next: Risk Scoring Dashboard →
  </button>
</div>
            
          </div>
          
        )}
      </section>
    </main>
  );
};

export default Analysis;
