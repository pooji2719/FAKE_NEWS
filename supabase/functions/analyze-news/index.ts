import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalysisRequest {
  articleText: string;
}

interface AnalysisResult {
  result: "fake" | "real" | "uncertain";
  confidence: number;
  reasoning: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { articleText }: AnalysisRequest = await req.json();

    if (!articleText || articleText.trim().length < 50) {
      return new Response(
        JSON.stringify({
          error: "Article text must be at least 50 characters long",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({
          error: "OpenAI API key not configured. Please add your OPENAI_API_KEY to continue.",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const prompt = `You are an expert fact-checker and misinformation analyst. Analyze the following news article and determine if it's likely to be FAKE NEWS or REAL NEWS.

Consider these factors:
1. Emotional manipulation and sensationalism
2. Lack of credible sources or citations
3. Logical fallacies and inconsistencies
4. Inflammatory language designed to provoke
5. Verifiable facts vs unsubstantiated claims
6. Writing quality and journalistic standards
7. Context and plausibility

Article to analyze:
"""
${articleText}
"""

Respond in JSON format with:
{
  "result": "fake" | "real" | "uncertain",
  "confidence": 0.0-1.0,
  "reasoning": "detailed explanation of your analysis"
}`;

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an expert at detecting fake news and misinformation. Always respond with valid JSON.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error("OpenAI API error:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to analyze article. Please try again.",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const openaiData = await openaiResponse.json();
    const analysisResult: AnalysisResult = JSON.parse(
      openaiData.choices[0].message.content
    );

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const clientIp = req.headers.get("x-forwarded-for") || "unknown";

    await supabase.from("news_analyses").insert({
      article_text: articleText,
      result: analysisResult.result,
      confidence_score: analysisResult.confidence,
      reasoning: analysisResult.reasoning,
      ip_address: clientIp,
    });

    return new Response(
      JSON.stringify({
        result: analysisResult.result,
        confidence: analysisResult.confidence,
        reasoning: analysisResult.reasoning,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in analyze-news function:", error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred. Please try again.",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
