import fetch from "node-fetch";
import Product from "../Models/Product.js";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_PROMPT = `You are a helpful customer support assistant for Ajmera Paints Store, a paint shop in Kasganj, Uttar Pradesh, India.

STORE INFORMATION:
- Owner: Kamal Ajmera
- Phone: 9837140458
- Email: ajmerapaintsksg@gmail.com
- Address: M/S Ajmera Paints, Barahdwari, Bilram Gate, Kasganj, Uttar Pradesh, India
- Established: 1990
- Business Hours: Monday–Saturday 9AM–7PM, Sunday 10AM–4PM

PRODUCT CATEGORIES WE SELL:
- Interior Paints (wall paints for rooms, bedrooms, halls)
- Exterior Paints (weather-resistant outdoor coatings)
- Primer (base coat before painting)
- Distemper (economical wall coating)
- Emulsion (smooth finish, washable)
- Stainer (colour pigments to tint paint)
- Brushes and Rollers
- Stencils (decorative patterns)

POLICIES:
- Free home delivery available
- Payments via Razorpay (UPI, cards, net banking)
- Orders can be tracked from the Profile page after login
- Returns/complaints: contact us by phone or email

INSTRUCTIONS:
- Be friendly, helpful, and concise (2–4 sentences unless more detail is needed)
- Answer in the same language the user writes in (Hindi or English)
- If asked about a specific product or price, suggest visiting the website or calling the store
- Never make up prices or stock availability — direct users to the website or store
- If you don't know something, say so honestly and give the contact number
- Do not answer questions unrelated to paints, home improvement, or the store`;

export const chatMessage = async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ success: false, error: "Message is required" });
        }

        // Fetch live product list from DB to give AI real context
        let productContext = "";
        try {

        const products = await Product.find({}, "title category price").limit(50);
            if (products.length > 0) {
                productContext =
                    "\n\nCURRENT PRODUCTS IN STORE:\n" +
                    products.map((p) => `- ${p.title} (${p.category}) — ₹${p.price}`).join("\n");
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            // product context is optional — don't crash if model/query differs
        }

        // Build messages array: keep last 10 messages for context
        const messages = [
            { role: "system", content: SYSTEM_PROMPT + productContext },
            ...history.slice(-10).map((msg) => ({
                role: msg.from === "user" ? "user" : "assistant",
                content: msg.text,
            })),
            { role: "user", content: message },
        ];

        const response = await fetch(OPENROUTER_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
                "X-Title": "Ajmera Paints Chatbot",
            },
            body: JSON.stringify({
                model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
                messages,
                max_tokens: 512,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("OpenRouter error:", response.status, errText);
            throw new Error(`OpenRouter responded with ${response.status}`);
        }

        const data = await response.json();
        const reply =
            data.choices?.[0]?.message?.content?.trim() ||
            "Sorry, I couldn't generate a response. Please try again.";

        return res.status(200).json({ success: true, reply });

    } catch (error) {
        console.error("Chatbot error:", error.message);
        return res.status(200).json({
            success: true,
            reply: "I'm having a bit of trouble right now. For immediate help, please call us at 9837140458 or email ajmerapaintsksg@gmail.com.",
        });
    }
};