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

const mapPrompt = (obligations) => `You are a senior banking compliance officer creating Management Action Plans (MAPs).

For each compliance obligation provided, generate an implementation-ready management action plan.

Rules:
- Return exactly one MAP for each obligation.
- Keep actionPlan steps specific, auditable, and implementation focused.
- Use the obligation department as owner when it is appropriate; otherwise choose the most suitable internal owner.
- estimatedEffort must be a practical effort estimate such as "2-3 business days", "1 week", or "2 weeks".
- Do not include markdown, commentary, or extra text.

Return JSON only in this schema:

{
  "maps": [
    {
      "obligationTitle": "Matching obligation title",
      "actionPlan": [
        "Specific implementation step",
        "Specific implementation step"
      ],
      "owner": "Responsible team or role",
      "estimatedEffort": "Estimated implementation effort"
    }
  ]
}

Obligations:
${JSON.stringify(obligations, null, 2)}`;

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

const normalizeMaps = (maps, obligations) => {
  if (!Array.isArray(maps)) {
    return [];
  }

  const obligationTitles = obligations.map((obligation) => String(obligation.title || '').trim());

  return maps
    .slice(0, obligations.length)
    .map((map, index) => {
      const actionPlan = Array.isArray(map?.actionPlan)
        ? map.actionPlan
            .map((step) => String(step || '').trim())
            .filter(Boolean)
            .slice(0, 8)
        : [];

      return {
        obligationTitle: String(map?.obligationTitle || obligationTitles[index] || '').trim(),
        actionPlan,
        owner: String(map?.owner || obligations[index]?.department || 'Compliance').trim(),
        estimatedEffort: String(map?.estimatedEffort || 'Not specified').trim(),
      };
    })
    .filter((map) => map.obligationTitle && map.actionPlan.length > 0 && map.owner);
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

const generateManagementActionPlans = async (obligations) => {
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
    contents: mapPrompt(normalizedObligations),
    config: {
      responseMimeType: 'application/json',
    },
  });

  const parsedResponse = extractJson(response.text || '');
  const maps = normalizeMaps(parsedResponse.maps, normalizedObligations);

  if (maps.length !== normalizedObligations.length) {
    throw new Error('Gemini response did not include one valid MAP per obligation.');
  }

  return maps;
};

module.exports = {
  analyzeComplianceDocument,
  generateManagementActionPlans,
};
