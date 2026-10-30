const express = require("express");
const router = express.Router();

/**
 * POST /api/ai/generate-description
 * Generates an AI-powered task description based on the task title.
 * Supports Google Gemini and OpenAI depending on which key is configured in .env.
 */
router.post("/generate-description", async (req, res) => {
    try {
        const { title } = req.body || {};

        if (!title || typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                error: "Task title is required to generate description."
            });
        }

        const trimmedTitle = title.trim();
        const geminiKey = process.env.GEMINI_API_KEY;
        const openaiKey = process.env.OPENAI_API_KEY;

        // 1. Validate API Key presence
        if (!geminiKey && !openaiKey) {
            return res.status(503).json({
                error: "AI API key is not configured. Please add GEMINI_API_KEY or OPENAI_API_KEY to backend/.env to enable AI description generation."
            });
        }

        // 2. Call Google Gemini if GEMINI_API_KEY is present
        if (geminiKey) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

                const prompt = `You are a helpful task manager assistant. Write a clear, concise, and professional task description (2 to 3 sentences maximum) for a task with the title: "${trimmedTitle}". Do not include conversational filler, markdown formatting, or introductory phrases. Provide only the description text.`;

                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            contents: [
                                {
                                    parts: [{ text: prompt }]
                                }
                            ]
                        }),
                        signal: controller.signal
                    }
                );

                clearTimeout(timeoutId);

                const data = await response.json();

                if (!response.ok) {
                    const errMsg = data?.error?.message || `Gemini API returned status ${response.status}`;
                    return res.status(502).json({
                        error: `Gemini API error: ${errMsg}`
                    });
                }

                const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

                if (!generatedText) {
                    return res.status(502).json({
                        error: "Gemini returned an empty response. Please try again."
                    });
                }

                return res.status(200).json({
                    description: generatedText.trim(),
                    provider: "gemini"
                });
            } catch (apiErr) {
                if (apiErr.name === "AbortError") {
                    return res.status(504).json({
                        error: "AI service request timed out after 10 seconds. Please try again."
                    });
                }
                return res.status(502).json({
                    error: `Failed to reach Gemini API: ${apiErr.message}`
                });
            }
        }

        // 3. Fallback to OpenAI if OPENAI_API_KEY is present
        if (openaiKey) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

                const prompt = `You are a helpful task manager assistant. Write a clear, concise, and professional task description (2 to 3 sentences maximum) for a task with the title: "${trimmedTitle}". Do not include conversational filler or quotes.`;

                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${openaiKey}`
                    },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        messages: [
                            { role: "system", content: "You are a helpful task management assistant." },
                            { role: "user", content: prompt }
                        ],
                        max_tokens: 150
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                const data = await response.json();

                if (!response.ok) {
                    const errMsg = data?.error?.message || `OpenAI API returned status ${response.status}`;
                    return res.status(502).json({
                        error: `OpenAI API error: ${errMsg}`
                    });
                }

                const generatedText = data?.choices?.[0]?.message?.content;

                if (!generatedText) {
                    return res.status(502).json({
                        error: "OpenAI returned an empty response."
                    });
                }

                return res.status(200).json({
                    description: generatedText.trim(),
                    provider: "openai"
                });
            } catch (apiErr) {
                if (apiErr.name === "AbortError") {
                    return res.status(504).json({
                        error: "OpenAI request timed out after 10 seconds."
                    });
                }
                return res.status(502).json({
                    error: `Failed to reach OpenAI API: ${apiErr.message}`
                });
            }
        }
    } catch (err) {
        return res.status(500).json({
            error: `Internal server error: ${err.message}`
        });
    }
});

module.exports = router;
