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
- A clear, concise title (max 10 words)
- A one-sentence summary of the core concept

Be precise and focus on the essence of the idea. Return your response in JSON format:
{
  "title": "extracted title",
  "summary": "one sentence summary"
}`,

  problem: `You are the Problem Analysis Agent. Your task is to identify and articulate the key problem that this invention aims to solve.

Analyze the invention idea and provide:
- The core problem or pain point
- Who is affected by this problem
- Current limitations or gaps in existing solutions
- Why this problem is worth solving

Be specific and evidence-based. Return a detailed problem statement (200-300 words).`,

  research: `You are the Research Agent. Your task is to identify similar existing ideas, technologies, or patents.

Research and document:
- 3-5 similar existing solutions or technologies
- How they work and their key features
- Their limitations or gaps
- Patents or papers in this space (if relevant)

Be thorough but concise. Return structured research findings (300-400 words).`,

  feasibility: `You are the Feasibility Analysis Agent. Your task is to evaluate the technological and practical feasibility of this invention.

Analyze:
- Technical requirements and complexity
- Available technologies that could be used
- Resource requirements (time, expertise, capital)
- Potential technical challenges
- Market readiness and timing
- Risk assessment

Provide a balanced, realistic assessment (300-400 words).`,

  innovation: `You are the Innovation Agent. Your task is to identify opportunities for differentiation and novel features.

Propose:
- 3-5 innovative features that could set this apart
- Unique value propositions
- Potential breakthrough aspects
- Creative applications or use cases
- Competitive advantages

Think creatively but practically. Return actionable innovation suggestions (300-400 words).`,

  patentWriter: `You are the Patent Writer Agent. Your task is to compile all previous analyses into a formal, comprehensive technical document in patent-style format.

Create a structured document with:
1. Title and Abstract
2. Background and Problem Statement
3. Prior Art and Existing Solutions
4. Detailed Technical Description
5. System Architecture and Components
6. Innovation and Novelty Claims
7. Implementation Details
8. Advantages and Benefits
9. Potential Applications
10. Conclusion

Write in formal technical language, be thorough and precise. This should read like a professional patent application (800-1000 words).`,
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
