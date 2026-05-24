export interface LiveBlueprintData {
  title: string;
  summary: string;
  problemStatement: string;
  innovation: string;
  feasibility: string;
  patentDocument: string;
}

const SYSTEM_PROMPT = `You are a professional patent attorney and technical innovation agent. Your task is to analyze the user's raw invention concept and draft a highly detailed, concise, and domain-appropriate technical blueprint.

You MUST return your output in structured JSON format with EXACTLY the following keys:
{
  "title": "A concise, descriptive engineering title for the invention (max 6 words)",
  "summary": "A natural, 1-2 sentence overview of what the concept is and its primary mechanism.",
  "problemStatement": "Describe the exact operational bottleneck or pain point resolved, who is affected, and why it is worth solving. Avoid generic AI filler. Maximum 150 words.",
  "innovation": "Detail the specific technical breakthrough directly derived from the user's idea. Explain the novel mechanism clearly without generic marketing hype or corporate buzzwords. Maximum 150 words.",
  "feasibility": "Explain in simple, practical, human-readable language how practical this is. List the actual hardware/software blocks required and provide a realistic prototyping timeline (e.g. 3-4 weeks). Maximum 150 words.",
  "patentDocument": "Format this with three clear sections: \\n- SECTION 1: ABSTRACT (2-3 sentences)\\n- SECTION 2: DETAILED DESCRIPTION (how it works mechanically or programmatically)\\n- SECTION 3: CONCISE CLAIMS (list exactly 3 simple, direct claims)"
}

Keep your wording short, clean, clear, and professional. Avoid repetitive placeholders or generic filler texts. Detect the domain (Healthcare, IoT, Energy, Software, etc.) and write in natural, domain-specific terminology.`;

/**
 * Executes a direct real-time API call to Google Gemini.
 */
const fetchGemini = async (idea: string, apiKey: string): Promise<LiveBlueprintData> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: `${SYSTEM_PROMPT}\n\nUser Invention Idea: ${idea}` }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
  }

  const resJson = await response.json();
  const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!rawText) {
    throw new Error("Gemini returned an empty response.");
  }

  return JSON.parse(rawText.trim()) as LiveBlueprintData;
};

/**
 * Executes a direct real-time API call to Groq.
 */
const fetchGroq = async (idea: string, apiKey: string): Promise<LiveBlueprintData> => {
  const url = "https://api.groq.com/openai/v1/chat/completions";
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `User Invention Idea: ${idea}` }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API Error: ${response.status} - ${errorText}`);
  }

  const resJson = await response.json();
  const rawText = resJson.choices?.[0]?.message?.content;

  if (!rawText) {
    throw new Error("Groq returned an empty response.");
  }

  return JSON.parse(rawText.trim()) as LiveBlueprintData;
};

/**
 * Dispatches the idea to the configured LLM client in real-time.
 */
export const generateLiveBlueprint = async (
  idea: string,
  provider: "gemini" | "groq",
  apiKey: string
): Promise<LiveBlueprintData> => {
  if (!apiKey || !apiKey.trim()) {
    throw new Error("API Key is missing or empty.");
  }
  
  if (provider === "gemini") {
    return fetchGemini(idea, apiKey.trim());
  } else if (provider === "groq") {
    return fetchGroq(idea, apiKey.trim());
  }
  
  throw new Error("Unsupported API provider.");
};
