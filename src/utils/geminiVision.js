import { EXPENSE_CATEGORIES } from "./expenses";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Sends a base64 encoded image to Gemini 2.5 Flash to extract receipt details.
 * 
 * @param {string} base64Image The base64 string of the image (without data:image/... prefix)
 * @param {string} mimeType The mime type of the image (e.g. image/jpeg)
 * @returns {Promise<{item: string, amount: number, category: string, date: string}>}
 */
export async function analyzeReceipt(base64Image, mimeType) {
  if (!API_KEY) {
    throw new Error("Missing VITE_GEMINI_API_KEY environment variable");
  }

  const prompt = `You are an AI financial assistant. I am giving you a picture of a receipt.
Extract the details of the purchase and return ONLY a raw JSON object with the following keys. Do NOT wrap it in markdown blockquotes like \`\`\`json. Return strictly the JSON object.

Keys:
1. "item": A short, concise summary of what was bought (max 3 words, e.g. "Groceries", "Coffee", "Gasoline").
2. "amount": The total numerical cost as a float number (e.g. 150.50). Do not include currency symbols. If you see multiple totals, use the final total paid.
3. "date": The date of the purchase in YYYY-MM-DD format. If no date is found, use today's date.
4. "category": Pick the most appropriate category from this exact list: [${EXPENSE_CATEGORIES.join(", ")}]. If unsure, use "Other".

Example output:
{
  "item": "Starbucks Coffee",
  "amount": 185.00,
  "date": "2023-10-15",
  "category": "Food"
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Image,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error?.message || "Failed to analyze receipt");
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error("No response from AI");
  }

  try {
    // Strip markdown formatting if the model accidentally included it
    const cleanText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleanText);
    
    return {
      item: result.item || "",
      amount: parseFloat(result.amount) || 0,
      category: EXPENSE_CATEGORIES.includes(result.category) ? result.category : "Other",
      date: result.date || new Date().toISOString().split("T")[0]
    };
  } catch (err) {
    console.error("Failed to parse AI response:", rawText);
    throw new Error("AI returned invalid data format");
  }
}
