import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

interface AgentPrompts {
  ideaIntake: string;
  problem: string;
  research: string;
  feasibility: string;
  innovation: string;
  patentWriter: string;
}

const AGENT_PROMPTS: AgentPrompts = {
  ideaIntake: `You are the Idea Intake Agent. Your task is to analyze a raw invention idea and extract:
- A clear, concise technical title (max 6 words, domain-appropriate)
- A one-sentence, natural overview of the concept

Be extremely precise. Return your response in JSON format:
{
  "title": "extracted title",
  "summary": "one sentence summary"
}`,

  problem: `You are the Problem Analysis Agent. Identify the exact technical problem that this invention solves.
- Describe the specific friction or bottleneck in natural, simple engineering language.
- Identify who is affected (e.g. clinical teams, embedded devs, utility grids).
- Keep it highly specific to the input domain.
- Do NOT use generic AI filler. Maximum 150 words.`,

  research: `You are the Research Agent. Bypassed for presentation rendering. Return "Research analysis compiled."`,

  feasibility: `You are the Feasibility Agent. Explain how practical the idea is in simple, human-readable language.
- What basic hardware or software components are actually required?
- Outline a realistic prototyping timeline (e.g., 3-5 weeks).
- Focus on practical constraints and realistic risks. Maximum 150 words.`,

  innovation: `You are the Innovation Agent. Propose the unique point or breakthrough directly derived from the user's idea.
- Explain exactly how this invention solves the problem in a new, novel way.
- Avoid generic marketing hype or AI buzzwords. Keep it technically descriptive. Maximum 150 words.`,

  patentWriter: `You are the Patent Writer. Compile a highly concise, simple patent-style draft:
- SECTION 1: ABSTRACT: A short 2-3 sentence overview.
- SECTION 2: DETAILED DESCRIPTION: Simple explanation of how the system works mechanically or programmatically.
- SECTION 3: CONCISE CLAIMS: List exactly 3 simple, direct claims.
Do NOT output a massive generic document. Keep it short, focused, and natural.`,
};

async function callAgent(
  agentType: keyof AgentPrompts,
  userInput: string,
  context: Record<string, string> = {}
): Promise<{ output: string; executionTime: number }> {
  const startTime = Date.now();
  
  try {
    const systemPrompt = AGENT_PROMPTS[agentType];
    
    // Build context string
    let contextStr = "";
    if (Object.keys(context).length > 0) {
      contextStr = "\n\nPrevious agent outputs:\n" + 
        Object.entries(context).map(([key, value]) => `${key}: ${value}`).join("\n\n");
    }
    
    const response = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userInput + contextStr }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI Gateway error for ${agentType}:`, response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const output = data.choices?.[0]?.message?.content || "No response generated";
    
    const executionTime = Date.now() - startTime;
    console.log(`${agentType} completed in ${executionTime}ms`);
    
    return { output, executionTime };
  } catch (error) {
    console.error(`Error in ${agentType}:`, error);
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      output: `Error processing ${agentType}: ${errorMessage}`,
      executionTime
    };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idea } = await req.json();
    
    if (!idea || typeof idea !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid idea provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Starting invention pipeline for idea:", idea.substring(0, 100));

    // Agent 1: Idea Intake
    const intakeResult = await callAgent("ideaIntake", idea);
    let ideaData;
    try {
      ideaData = JSON.parse(intakeResult.output);
    } catch {
      ideaData = { title: "Untitled Invention", summary: idea.substring(0, 100) };
    }

    // Agent 2: Problem Analysis
    const problemResult = await callAgent("problem", idea, {
      "Idea": `${ideaData.title} - ${ideaData.summary}`
    });

    // Agent 3: Research
    const researchResult = await callAgent("research", idea, {
      "Idea": `${ideaData.title} - ${ideaData.summary}`,
      "Problem": problemResult.output
    });

    // Agent 4: Feasibility
    const feasibilityResult = await callAgent("feasibility", idea, {
      "Idea": `${ideaData.title} - ${ideaData.summary}`,
      "Problem": problemResult.output,
      "Research": researchResult.output
    });

    // Agent 5: Innovation
    const innovationResult = await callAgent("innovation", idea, {
      "Idea": `${ideaData.title} - ${ideaData.summary}`,
      "Problem": problemResult.output,
      "Research": researchResult.output,
      "Feasibility": feasibilityResult.output
    });

    // Agent 6: Patent Writer
    const patentResult = await callAgent("patentWriter", idea, {
      "Title": ideaData.title,
      "Summary": ideaData.summary,
      "Problem": problemResult.output,
      "Research": researchResult.output,
      "Feasibility": feasibilityResult.output,
      "Innovation": innovationResult.output
    });

    const blueprint = {
      title: ideaData.title,
      summary: ideaData.summary,
      problemStatement: problemResult.output,
      research: researchResult.output,
      feasibility: feasibilityResult.output,
      innovation: innovationResult.output,
      patentDocument: patentResult.output,
      agentResults: [
        { agent: "ideaIntake", output: intakeResult.output, executionTime: intakeResult.executionTime },
        { agent: "problem", output: problemResult.output, executionTime: problemResult.executionTime },
        { agent: "research", output: researchResult.output, executionTime: researchResult.executionTime },
        { agent: "feasibility", output: feasibilityResult.output, executionTime: feasibilityResult.executionTime },
        { agent: "innovation", output: innovationResult.output, executionTime: innovationResult.executionTime },
        { agent: "patentWriter", output: patentResult.output, executionTime: patentResult.executionTime },
      ]
    };

    console.log("Pipeline completed successfully");

    return new Response(
      JSON.stringify(blueprint),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Pipeline error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
