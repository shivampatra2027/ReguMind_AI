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

module.exports = {
  analyzeComplianceDocument,
};
