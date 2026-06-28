const axios = require('axios');

const BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:3b';
const GENERATE_URL = `${BASE_URL.replace(/\/$/, '')}/api/generate`;

const analysisPrompt = (rawText) => `You are a senior banking compliance officer.

Analyze the RBI circular and extract ONLY actionable compliance obligations.

A compliance obligation must:

- Require a specific action
- Be auditable
- Be assigned to a department
- Contain a reporting or implementation requirement

Extract only statements containing concepts such as:
- shall
- must
- required to
- obligated to
- submit
- report
- upload
- comply

Ignore:
- background information
- legal references
- explanations
- definitions
- salutations
- historical context

Return JSON only in this schema:

{
  "summary": "Brief summary of the actionable compliance obligations only.",
  "obligations": [
    {
      "title": "Specific obligation title",
      "description": "Auditable action including the reporting or implementation requirement",
      "department": "Responsible department",
      "priority": "low | medium | high | critical",
      "deadline": "Deadline if stated, otherwise Not specified"
    }
  ]
}

Maximum 10 obligations.

Document:
${rawText}`;

const mapPrompt = (summary, obligations) => `Senior Regulatory Compliance Consultant creating Management Action Plans for banking and regulatory compliance teams.

You must generate implementation-ready Management Action Plans (MAPs) for the provided compliance obligations.

Rules:
- Return JSON only. No markdown, no commentary, no extra text.
- Cap output to a maximum of 10 MAP items.
- Generate ONE MAP per obligation.
- For each MAP:
  - obligationTitle must match the obligation title.
  - objective must clearly state the intended compliance outcome.
  - owner should be the responsible internal team/role (use the obligation department when appropriate).
  - actionPlan must be an array of specific, auditable implementation steps.
  - deliverables must be an array of tangible outputs (documents, reports, controls, evidence).
  - estimatedEffort must be exactly one of: "Low" | "Medium" | "High".
  - timeline must be a concise target timeline (e.g., "2-4 weeks", "1-2 months").

Output schema (JSON only):
{
  "maps": [
    {
      "obligationTitle": string,
      "objective": string,
      "owner": string,
      "actionPlan": string[],
      "deliverables": string[],
      "estimatedEffort": "Low" | "Medium" | "High",
      "timeline": string
    }
  ]
}

Document summary:
${summary}

Compliance obligations:
${JSON.stringify(obligations, null, 2)}`;

const riskPrompt = (obligations, maps) => `You are a Senior Banking Compliance Risk Officer.

Generate a compliance risk assessment for every extracted obligation using the related Management Action Plan context.

Rules:
- Return JSON only. No markdown, no commentary, no extra text.
- Generate ONE risk item per obligation.
- riskScore must be a number from 0 to 100.
- riskLevel must be exactly one of: "Low" | "Medium" | "High" | "Critical".
- Regulatory filings must receive higher risk.
- Reporting obligations must receive higher risk.
- Missing or unspecified deadlines must receive higher risk.
- Administrative actions should receive lower risk.

Score bands:
- 0-30: Low
- 31-60: Medium
- 61-80: High
- 81-100: Critical

Output schema (JSON only):
{
  "risks": [
    {
      "obligationTitle": string,
      "riskScore": number,
      "riskLevel": "Low" | "Medium" | "High" | "Critical",
      "reason": string,
      "impact": string,
      "mitigation": string
    }
  ],
  "overallRiskScore": number
}

Compliance obligations:
${JSON.stringify(obligations, null, 2)}

Management Action Plans:
${JSON.stringify(maps, null, 2)}`;

const validationPrompt = (normalizedMaps, evidenceText) => `You are a senior banking compliance validation officer.

Your task is to determine whether the uploaded evidence demonstrates completion of the Management Action Plans.

Important:

Evidence does NOT need to contain identical wording.

Use semantic matching.

Examples:

MAP:
"Implement website disclosure controls"

Evidence:
"Website disclosure controls have been implemented"

→ completed

MAP:
"Update bulk deposit framework"

Evidence:
"Treasury team updated bulk deposit interest rate framework"

→ completed

Classifications:

completed:
Evidence demonstrates implementation of most or all required actions.

partially_completed:
Evidence demonstrates some actions but not all.

incomplete:
Evidence does not demonstrate meaningful completion.

Return JSON only:

{
"status": "completed | partially_completed | incomplete",
"confidence": 0-100,
"reason": "brief explanation"
}

Management Action Plans (MAPs):
${JSON.stringify(normalizedMaps, null, 2)}

Uploaded Evidence Text:
${evidenceText}`;

const extractJson = (text) => {
  const trimmedText = String(text || '').trim();
  const fencedJsonMatch = trimmedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const jsonText = fencedJsonMatch ? fencedJsonMatch[1] : trimmedText;
  const firstBraceIndex = jsonText.indexOf('{');
  const lastBraceIndex = jsonText.lastIndexOf('}');

  if (firstBraceIndex === -1 || lastBraceIndex === -1 || lastBraceIndex <= firstBraceIndex) {
    throw new Error('Ollama response did not contain valid JSON.');
  }

  return JSON.parse(jsonText.slice(firstBraceIndex, lastBraceIndex + 1));
};

const normalizeObligations = (obligations) => {
  if (!Array.isArray(obligations)) {
    return [];
  }

  return obligations
    .slice(0, 10)
    .map((obligation) => ({
      title: String(obligation?.title || '').trim(),
      description: String(obligation?.description || '').trim(),
      department: String(obligation?.department || 'Compliance').trim(),
      priority: String(obligation?.priority || 'medium').trim().toLowerCase(),
      deadline: String(obligation?.deadline || 'Not specified').trim(),
    }))
    .filter((obligation) => obligation.title && obligation.description);
};

const normalizeEffort = (value) => {
  const v = String(value || '').trim().toLowerCase();

  if (v === 'low') return 'Low';
  if (v === 'medium') return 'Medium';
  if (v === 'high') return 'High';

  return 'Medium';
};

const normalizeMaps = (maps, obligations) => {
  if (!Array.isArray(maps)) {
    return [];
  }

  const obligationTitles = obligations.map((obligation) => String(obligation.title || '').trim());

  return maps
    .slice(0, Math.min(10, obligations.length))
    .map((map, index) => {
      const actionPlan = Array.isArray(map?.actionPlan)
        ? map.actionPlan.map((step) => String(step || '').trim()).filter(Boolean).slice(0, 8)
        : [];

      const deliverables = Array.isArray(map?.deliverables)
        ? map.deliverables.map((d) => String(d || '').trim()).filter(Boolean).slice(0, 8)
        : [];

      return {
        obligationTitle: String(map?.obligationTitle || obligationTitles[index] || '').trim(),
        objective: String(map?.objective || '').trim(),
        owner: String(map?.owner || obligations[index]?.department || 'Compliance').trim(),
        actionPlan,
        deliverables,
        estimatedEffort: normalizeEffort(map?.estimatedEffort),
        timeline: String(map?.timeline || 'Not specified').trim(),
      };
    })
    .filter((map) => map.obligationTitle && map.objective && map.owner && map.actionPlan.length > 0 && map.deliverables.length > 0);
};

const getRiskLevelFromScore = (score) => {
  if (score <= 30) return 'Low';
  if (score <= 60) return 'Medium';
  if (score <= 80) return 'High';
  return 'Critical';
};

const normalizeRiskLevel = (value, score) => {
  const v = String(value || '').trim().toLowerCase();

  if (v === 'low') return 'Low';
  if (v === 'medium') return 'Medium';
  if (v === 'high') return 'High';
  if (v === 'critical') return 'Critical';

  return getRiskLevelFromScore(score);
};

const normalizeRiskScore = (value) => {
  const score = Number(value);

  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
};

const normalizeRisks = (risks, obligations) => {
  if (!Array.isArray(risks)) {
    return [];
  }

  const obligationTitles = obligations.map((obligation) => String(obligation.title || '').trim());

  return risks
    .slice(0, Math.min(10, obligations.length))
    .map((risk, index) => {
      const riskScore = normalizeRiskScore(risk?.riskScore);

      return {
        obligationTitle: String(risk?.obligationTitle || obligationTitles[index] || '').trim(),
        riskScore,
        riskLevel: normalizeRiskLevel(risk?.riskLevel, riskScore),
        reason: String(risk?.reason || '').trim(),
        impact: String(risk?.impact || '').trim(),
        mitigation: String(risk?.mitigation || '').trim(),
      };
    })
    .filter((risk) => risk.obligationTitle && risk.reason && risk.impact && risk.mitigation);
};

const calculateOverallRiskScore = (risks, fallbackScore) => {
  if (risks.length === 0) {
    return normalizeRiskScore(fallbackScore);
  }

  const average = risks.reduce((total, risk) => total + normalizeRiskScore(risk.riskScore), 0) / risks.length;
  return normalizeRiskScore(average);
};

const callOllama = async (prompt) => {
  const startTime = Date.now();
  console.log('OLLAMA MODEL:', MODEL);
  console.log('PROMPT LENGTH:', String(prompt || '').length);

  try {
    const response = await axios.post(
      GENERATE_URL,
      {
        model: MODEL,
        prompt,
        stream: false,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 700000,
      }
    );

    const responseText = response?.data?.response;
    const responseLength = responseText ? String(responseText).length : 0;
    console.log('RESPONSE LENGTH:', responseLength);
    console.log('GENERATION TIME:', `${Date.now() - startTime}ms`);

    if (responseText === undefined || responseText === null) {
      throw new Error('Ollama response did not include a response field.');
    }

    return responseText;
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.log('GENERATION TIME:', `${elapsed}ms`);

    if (error.response) {
      const status = error.response.status;
      const statusText = error.response.statusText || '';
      throw new Error(`Ollama unavailable at ${GENERATE_URL} (${status} ${statusText}).`);
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      throw new Error(`Ollama unavailable at ${BASE_URL}. ${error.message}`);
    }

    throw new Error(`Ollama request failed: ${error.message}`);
  }
};

const analyzeComplianceDocument = async (rawText) => {
  const responseText = await callOllama(analysisPrompt(rawText));
  const parsedResponse = extractJson(responseText || '');
  const obligations = normalizeObligations(parsedResponse.obligations);

  return {
    summary: String(parsedResponse.summary || '').trim(),
    obligations,
  };
};

const generateManagementActionPlans = async (summary, obligations) => {
  const normalizedObligations = normalizeObligations(obligations);

  if (normalizedObligations.length === 0) {
    return [];
  }

  const responseText = await callOllama(mapPrompt(summary, normalizedObligations));
  const parsedResponse = extractJson(responseText || '');
  const maps = normalizeMaps(parsedResponse.maps, normalizedObligations);

  return maps.slice(0, 10);
};

const generateRiskAssessment = async (obligations, maps) => {
  const normalizedObligations = normalizeObligations(obligations);
  const normalizedMaps = normalizeMaps(maps, normalizedObligations);

  if (normalizedObligations.length === 0 || normalizedMaps.length === 0) {
    return {
      risks: [],
      overallRiskScore: 0,
    };
  }

  const responseText = await callOllama(riskPrompt(normalizedObligations, normalizedMaps));
  const parsedResponse = extractJson(responseText || '');
  const risks = normalizeRisks(parsedResponse.risks, normalizedObligations);

  return {
    risks,
    overallRiskScore: calculateOverallRiskScore(risks, parsedResponse.overallRiskScore),
  };
};

const validateComplianceCompletion = async (maps, evidenceText) => {
  const normalizedMaps = Array.isArray(maps) ? maps : [];

  try {
    console.log('VALIDATION MAPS:', JSON.stringify(maps, null, 2));
  } catch (e) {
    console.log('VALIDATION MAPS: <unserializable maps>');
  }

  console.log('EVIDENCE TEXT LENGTH:', String(evidenceText || '').length);

  if (!evidenceText || String(evidenceText).trim().length < 20) {
    return {
      status: 'incomplete',
      confidence: 0,
      reason: 'Evidence file could not be read.',
    };
  }

  const responseText = await callOllama(validationPrompt(normalizedMaps, evidenceText));
  const parsed = extractJson(responseText || '');

  try {
    console.log('VALIDATION RESULT:', JSON.stringify(parsed, null, 2));
  } catch (e) {
    console.log('VALIDATION RESULT: <unserializable result>');
  }

  const statusRaw = String(parsed?.status || '').trim();
  const status =
    statusRaw === 'completed'
      ? 'completed'
      : statusRaw === 'partially_completed' || statusRaw === 'partially completed'
      ? 'partially_completed'
      : 'incomplete';

  let confidence = Number(parsed?.confidence);
  if (!Number.isFinite(confidence)) confidence = 0;
  confidence = Math.max(0, Math.min(100, Math.round(confidence)));

  if (status === 'completed') {
    if (confidence < 80) confidence = 80;
    if (confidence > 100) confidence = 100;
  } else if (status === 'partially_completed') {
    if (confidence < 40) confidence = 40;
    if (confidence > 69) confidence = 69;
  } else {
    if (confidence > 39) confidence = 39;
  }

  if (confidence === 1) {
    if (status === 'completed') confidence = 80;
    else if (status === 'partially_completed') confidence = 50;
    else confidence = 0;
  }

  const reason = String(parsed?.reason || '').trim() || 'No explanation provided by model.';

  return { status, confidence, reason };
};

module.exports = {
  analyzeComplianceDocument,
  generateManagementActionPlans,
  generateRiskAssessment,
  validateComplianceCompletion,
};
