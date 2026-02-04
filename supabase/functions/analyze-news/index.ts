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

function analyzeNews(articleText: string): AnalysisResult {
  const text = articleText.toLowerCase();
  let fakeIndicators = 0;
  let realIndicators = 0;

  const fakePatterns = [
    /exclusive proof/i,
    /shocking truth/i,
    /they don't want you to know/i,
    /wake up sheeple/i,
    /this will blow your mind/i,
    /unbelievable/i,
    /miracle cure/i,
    /conspiracy/i,
    /fake news/i,
    /mainstream media lies/i,
    /urgent:/i,
    /breaking: (fake|hoax)/i,
    /!!!|!!!/,
  ];

  const realPatterns = [
    /according to/i,
    /research shows/i,
    /study found/i,
    /published in/i,
    /government report/i,
    /official statement/i,
    /source:/i,
    /verified/i,
    /peer-reviewed/i,
    /organization|agency|department/i,
  ];

  const qualityPatterns = [
    /however|furthermore|moreover/i,
    /analysis|investigation/i,
    /context|background/i,
  ];

  fakePatterns.forEach(pattern => {
    if (pattern.test(text)) fakeIndicators++;
  });

  realPatterns.forEach(pattern => {
    if (pattern.test(text)) realIndicators++;
  });

  let qualityScore = 0;
  qualityPatterns.forEach(pattern => {
    if (pattern.test(text)) qualityScore++;
  });

  const words = text.split(/\s+/).length;
  const allCaps = (text.match(/[A-Z]{4,}/g) || []).length;
  const emotionalWords = (text.match(/amazing|terrible|horrible|disgusting|love|hate/g) || []).length;

  if (allCaps > words * 0.05) fakeIndicators++;
  if (emotionalWords > words * 0.02) fakeIndicators++;

  let result: "fake" | "real" | "uncertain" = "uncertain";
  let confidence = 0.5;
  let reasoning = "";

  if (fakeIndicators > realIndicators + 2) {
    result = "fake";
    confidence = Math.min(0.95, 0.6 + (fakeIndicators * 0.1));
    reasoning = `This article shows multiple signs of misinformation including sensationalist language, lack of credible sources, and emotional manipulation tactics. The content contains ${fakeIndicators} characteristics commonly found in fake news.`;
  } else if (realIndicators > fakeIndicators + 2) {
    result = "real";
    confidence = Math.min(0.95, 0.6 + (realIndicators * 0.08));
    reasoning = `This article demonstrates several characteristics of legitimate journalism including credible sourcing, factual language, and proper context. It contains ${realIndicators} indicators of authentic news reporting.`;
  } else {
    result = "uncertain";
    confidence = 0.5 + (qualityScore * 0.05);
    reasoning = `This article's authenticity is unclear. It shows a mix of credible and questionable elements. Additional verification from authoritative sources is recommended before sharing.`;
  }

  return { result, confidence: Math.min(0.99, Math.max(0.01, confidence)), reasoning };
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

    const analysisResult = analyzeNews(articleText);

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
