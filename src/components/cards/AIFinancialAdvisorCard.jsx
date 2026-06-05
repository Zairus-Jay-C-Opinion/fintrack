import { useState } from "react";
import Button from "../ui/Button";
import { Sparkles, Send, Loader2 } from "lucide-react";

export default function AIFinancialAdvisorCard({
  netWorth,
  cashOnHand,
  savingsBalance,
  investmentPhp,
  monthlyIncome,
  allocation,
}) {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const handleAsk = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError("");
    setResponse("");

    const systemInstruction = `
You are an expert, professional financial advisor.
Your goal is to provide helpful, actionable, and clear financial advice to the user based on their specific financial context.
Use markdown to format your response nicely (e.g., bullet points, bold text). Keep your advice concise but comprehensive. Focus specifically on the user's situation.

Here is the user's current financial context:
Net Worth: PHP ${netWorth || 0}
Cash on Hand: PHP ${cashOnHand || 0}
Savings Balance: PHP ${savingsBalance || 0}
Investments: PHP ${investmentPhp || 0}
Monthly Income: PHP ${monthlyIncome || 0}
Allocation Strategy: ${allocation?.investments || 0}% Investments, ${
      allocation?.savings || 0
    }% Savings, ${allocation?.spending || 0}% Spending
`;

    try {
      const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      if (!API_KEY) {
        throw new Error("VITE_GEMINI_API_KEY is not set in your .env file.");
      }

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemInstruction }],
            },
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error?.message || "Failed to fetch advice");
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error("Received empty response from API");
      }

      setResponse(text);
    } catch (err) {
      setError(err.message || "An error occurred while fetching advice.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  // Basic markdown-to-html for bold and bullets for a clean display
  const formatMarkdown = (text) => {
    let formatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");
    // Handle bullet points
    formatted = formatted.replace(/^\* (.*$)/gim, "<li>$1</li>");
    // Handle newlines
    formatted = formatted.replace(/\n/g, "<br />");
    // Cleanup list tags if multiple li exist
    formatted = formatted.replace(/(<li>.*<\/li>)/s, "<ul class='list-disc pl-5 mt-2 space-y-1'>$1</ul>");
    return { __html: formatted };
  };

  return (
    <div className="card col-span-full border-t-4 border-t-gain bg-gradient-to-br from-bg-deepest to-bg-deep shadow-lg">
      <div className="flex items-center gap-2 mb-4 text-gain">
        <Sparkles size={24} className="animate-pulse" />
        <h3 className="font-display text-xl font-bold text-white">AI Financial Advisor</h3>
      </div>
      <p className="text-sm text-text-secondary mb-6">
        Ask me anything about your finances. I will analyze your current net worth, income, and allocation to give you personalized advice.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <textarea
            className="w-full rounded-[var(--radius-md)] border border-accent bg-bg-deep px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-highlight focus:outline-none focus:ring-1 focus:ring-highlight resize-none min-h-[50px]"
            placeholder="E.g., How can I optimize my savings?"
            rows={1}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
        </div>
        <Button
          onClick={handleAsk}
          disabled={isLoading || !prompt.trim()}
          className="self-end sm:self-auto h-[50px] px-6 py-0 flex items-center justify-center gap-2 bg-gain hover:bg-gain/90 text-white"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          <span className="hidden sm:inline">{isLoading ? "Thinking..." : "Ask AI"}</span>
        </Button>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded bg-loss/10 border border-loss/20 text-loss text-sm">
          {error}
        </div>
      )}

      {response && (
        <div className="mt-6 p-5 rounded-[var(--radius-md)] bg-bg-deep/50 border border-accent text-sm text-text-primary leading-relaxed shadow-inner">
          <div dangerouslySetInnerHTML={formatMarkdown(response)} />
        </div>
      )}
    </div>
  );
}
