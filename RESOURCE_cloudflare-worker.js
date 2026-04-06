export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: corsHeaders,
      });
    }

    try {
      const { messages } = await request.json();

      const openaiResponse = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: messages,
            max_tokens: 300,
            temperature: 0.7,
          }),
        },
      );

      const data = await openaiResponse.json();

      if (!openaiResponse.ok) {
        return new Response(
          JSON.stringify({
            error: "OpenAI API error",
            details: data,
          }),
          {
            status: openaiResponse.status,
            headers: corsHeaders,
          },
        );
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: corsHeaders,
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: "Worker error",
          details: error.message,
        }),
        {
          status: 500,
          headers: corsHeaders,
        },
      );
    }
  },
};
