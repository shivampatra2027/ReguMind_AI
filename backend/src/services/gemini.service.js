const model = 'gemini-2.5-flash';

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


const getGoogleGenAI = () => {
  try {
    return require('@google/genai').GoogleGenAI;
  } catch (error) {
    throw new Error('Google GenAI SDK is not installed. Run npm install @google/genai.');
  }
};

const extractJson = (text) => {
  const trimmedText = text.trim();
  const fencedJsonMatch = trimmedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const jsonText = fencedJsonMatch ? fencedJsonMatch[1] : trimmedText;
  const firstBraceIndex = jsonText.indexOf('{');
  const lastBraceIndex = jsonText.lastIndexOf('}');

  if (firstBraceIndex === -1 || lastBraceIndex === -1 || lastBraceIndex <= firstBraceIndex) {
    throw new Error('Gemini response did not contain valid JSON.');
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

  const obligationTitles = obligations.map((obligation) =>
    String(obligation.title || '').trim()
  );

  return maps
    .slice(0, Math.min(10, obligations.length))
    .map((map, index) => {
      const actionPlan = Array.isArray(map?.actionPlan)
        ? map.actionPlan
            .map((step) => String(step || '').trim())
            .filter(Boolean)
            .slice(0, 8)
        : [];

      const deliverables = Array.isArray(map?.deliverables)
        ? map.deliverables
            .map((d) => String(d || '').trim())
            .filter(Boolean)
            .slice(0, 8)
        : [];

      return {
        obligationTitle: String(
          map?.obligationTitle || obligationTitles[index] || ''
        ).trim(),
        objective: String(map?.objective || '').trim(),
        owner: String(
          map?.owner || obligations[index]?.department || 'Compliance'
        ).trim(),
        actionPlan,
        deliverables,
        estimatedEffort: normalizeEffort(map?.estimatedEffort),
        timeline: String(map?.timeline || 'Not specified').trim(),
      };
    })
    .filter(
      (map) =>
        map.obligationTitle &&
        map.objective &&
        map.owner &&
        map.actionPlan.length > 0 &&
        map.deliverables.length > 0
    );
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

  const obligationTitles = obligations.map((obligation) =>
    String(obligation.title || '').trim()
  );

  return risks
    .slice(0, Math.min(10, obligations.length))
    .map((risk, index) => {
      const riskScore = normalizeRiskScore(risk?.riskScore);

      return {
        obligationTitle: String(
          risk?.obligationTitle || obligationTitles[index] || ''
        ).trim(),
        riskScore,
        riskLevel: normalizeRiskLevel(risk?.riskLevel, riskScore),
        reason: String(risk?.reason || '').trim(),
        impact: String(risk?.impact || '').trim(),
        mitigation: String(risk?.mitigation || '').trim(),
      };
    })
    .filter(
      (risk) =>
        risk.obligationTitle &&
        risk.reason &&
        risk.impact &&
        risk.mitigation
    );
};

const calculateOverallRiskScore = (risks, fallbackScore) => {
  if (risks.length === 0) {
    return normalizeRiskScore(fallbackScore);
  }

  const average =
    risks.reduce((total, risk) => total + normalizeRiskScore(risk.riskScore), 0) /
    risks.length;

  return normalizeRiskScore(average);
};

const analyzeComplianceDocument = async (rawText) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const GoogleGenAI = getGoogleGenAI();
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const response = await ai.models.generateContent({
    model,
    contents: analysisPrompt(rawText),
    config: {
      responseMimeType: 'application/json',
    },
  });

  const parsedResponse = extractJson(response.text || '');
  const obligations = normalizeObligations(parsedResponse.obligations);

  return {
    summary: String(parsedResponse.summary || '').trim(),
    obligations,
  };
};

const generateManagementActionPlans = async (summary, obligations) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const normalizedObligations = normalizeObligations(obligations);

  if (normalizedObligations.length === 0) {
    return [];
  }

  const GoogleGenAI = getGoogleGenAI();
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const response = await ai.models.generateContent({
    model,
    contents: mapPrompt(summary, normalizedObligations),
    config: {
      responseMimeType: 'application/json',
    },
  });

  const parsedResponse = extractJson(response.text || '');
  const maps = normalizeMaps(parsedResponse.maps, normalizedObligations);

  // If Gemini drops some items or produces invalid shapes, return what we can.
  // Controller will still persist the returned maps.
  return maps.slice(0, 10);
};

const generateRiskAssessment = async (obligations, maps) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const normalizedObligations = normalizeObligations(obligations);
  const normalizedMaps = normalizeMaps(maps, normalizedObligations);

  if (normalizedObligations.length === 0 || normalizedMaps.length === 0) {
    return {
      risks: [],
      overallRiskScore: 0,
    };
  }

  const GoogleGenAI = getGoogleGenAI();
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const response = await ai.models.generateContent({
    model,
    contents: riskPrompt(normalizedObligations, normalizedMaps),
    config: {
      responseMimeType: 'application/json',
    },
  });

  const parsedResponse = extractJson(response.text || '');
  const risks = normalizeRisks(parsedResponse.risks, normalizedObligations);

  return {
    risks,
    overallRiskScore: calculateOverallRiskScore(
      risks,
      parsedResponse.overallRiskScore
    ),
  };
};

module.exports = {
  analyzeComplianceDocument,
  generateManagementActionPlans,
  generateRiskAssessment,
};
