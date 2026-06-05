const model = 'gemini-2.5-flash';

const analysisPrompt = (rawText) => `Analyze this regulatory/compliance document.

Return JSON with:

{
  "summary": "string",
  "obligations": [
    {
      "title": "string",
      "description": "string",
      "department": "string",
      "priority": "string",
      "deadline": "string"
    }
  ]
}

Only return valid JSON.

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

  return obligations.map((obligation) => ({
    title: String(obligation?.title || '').trim(),
    description: String(obligation?.description || '').trim(),
    department: String(obligation?.department || '').trim(),
    priority: String(obligation?.priority || '').trim(),
    deadline: String(obligation?.deadline || '').trim(),
  }));
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

  return {
    summary: String(parsedResponse.summary || '').trim(),
    obligations: normalizeObligations(parsedResponse.obligations),
  };
};

module.exports = {
  analyzeComplianceDocument,
};
