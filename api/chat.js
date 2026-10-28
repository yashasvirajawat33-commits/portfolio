
module.exports = async function handler(req, res) {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    const apiKey = process.env.GROQ_API_KEY;
  
    if (!apiKey) {
      return res.status(500).json({
        error: "Chatbot configuration is missing on the server."
      });
    }
  
    try {
      const body = req.body || {};
      let messages = body.messages;
  
      // Also support a simple { message: "Hello" } request.
      if (!Array.isArray(messages) && typeof body.message === "string") {
        messages = [
          { role: "user", content: body.message }
        ];
      }
  
      if (
        !Array.isArray(messages) ||
        messages.length === 0 ||
        messages.length > 20 ||
        !messages.every(
          (m) =>
            m &&
            ["user", "assistant"].includes(m.role) &&
            typeof m.content === "string" &&
            m.content.length <= 8000
        )
      ) {
        return res.status(400).json({
          error: "Please send a valid chat message."
        });
      }
  
      const groqResponse = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages,
            temperature: 0.7,
            max_tokens: 800
          })
        }
      );
  
      if (!groqResponse.ok) {
        // Do not expose the provider's response or secret to visitors.
        console.error("Groq request failed with status:", groqResponse.status);
  
        return res.status(
          groqResponse.status === 429 ? 429 : 502
        ).json({
          error:
            groqResponse.status === 429
              ? "The chatbot is busy. Please try again shortly."
              : "The chatbot could not generate a response."
        });
      }
  
      const data = await groqResponse.json();
  
      return res.status(200).json({
        reply: data.choices?.[0]?.message?.content || ""
      });
    } catch (error) {
      console.error("Chat API failed:", error.message);
  
      return res.status(500).json({
        error: "Something went wrong with the chatbot."
      });
    }
  };
  