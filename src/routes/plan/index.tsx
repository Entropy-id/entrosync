import { streamPrd } from "#/modules/ai/ai.client";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowRight, ArrowUp, Loader2 } from "lucide-react";

export const Route = createFileRoute("/plan/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [value, setValue] = useState("");
  const [submittedText, setSubmittedText] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [reviseValue, setReviseValue] = useState("");
  const contentEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    contentEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isStreaming) scrollToBottom();
  }, [generatedContent, isStreaming]);

  const handleSubmit = async () => {
    if (!value.trim()) return;
    setSubmittedText(value);
    setGeneratedContent("");
    setIsStreaming(true);
    setValue("");

    try {
      const stream = streamPrd([{ role: "user", content: value }]);
      for await (const chunk of stream) {
        setGeneratedContent((prev) => prev + chunk);
      }
    } catch (error) {
      console.error("Streaming error:", error);
      setGeneratedContent(
        (prev) =>
          prev + "\n\n*[Error: Failed to generate PRD. Please try again.]*",
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter submits, plain Enter just adds a newline
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleRevise = async () => {
    if (!reviseValue.trim() || isStreaming || !submittedText) return;
    setIsStreaming(true);
    const revision = reviseValue;
    setReviseValue("");
    setGeneratedContent("");

    try {
      const stream = streamPrd([
        { role: "user", content: submittedText },
        { role: "assistant", content: generatedContent },
        { role: "user", content: revision },
      ]);
      for await (const chunk of stream) {
        setGeneratedContent((prev) => prev + chunk);
      }
    } catch (error) {
      console.error("Revise error:", error);
      setGeneratedContent("*[Error: Failed to revise. Please try again.]*");
    } finally {
      setIsStreaming(false);
    }
  };

  const handleReviseKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleRevise();
    }
  };

  if (!submittedText) {
    return (
      <div className="min-h-screen w-full bg-black text-white relative overflow-hidden">
        {/* subtle radial glow top-left, matches reference */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(800px 500px at 5% 0%, rgba(99,70,130,0.18), transparent 70%)",
          }}
        />

        {/* Header */}
        <div className="flex items-center gap-2 p-12">
          <img
            src="/logo_entrosync.svg"
            alt="EntroSync Logo"
            className="w-8 h-8"
          />
          <span className="font-semibold text-lg">EntroSync</span>
        </div>

        {/* Main content */}
        <main className="relative z-10 flex flex-col items-center px-6 pt-40">
          <h1 className="text-4xl font-bold text-center">
            Paste your client conversation
          </h1>
          <p className="mt-4 text-gray-400 text-lg text-center">
            Turn chats, notes, or rough briefs into structured project
            requirements.
          </p>

          <div className="mt-10 w-full max-w-3xl">
            <div className="relative bg-[#121214] border border-white/10 rounded-2xl p-5 pb-16">
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Paste client chats, notes, or a rough brief here..."
                rows={6}
                className="w-full bg-transparent resize-none outline-none text-gray-200 placeholder-gray-500 text-base leading-relaxed"
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!value.trim()}
                aria-label="Submit conversation"
                className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-gray-100 text-black flex items-center justify-center
                           hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="M12 19V5" />
                  <path d="M5 12l7-7 7 7" />
                </svg>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black text-white flex overflow-hidden">
      {/* Left Panel - Generated PRD */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-2">
                <img
                  src="/logo_entrosync.svg"
                  alt="EntroSync Logo"
                  className="w-8 h-8"
                />
                <span className="font-semibold text-lg">EntroSync</span>
              </div>
              <button
                type="button"
                className="bg-white text-black px-5 py-2.5 rounded-full font-medium flex items-center gap-2 hover:bg-gray-100 transition-colors"
              >
                Finish <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Streaming Content */}
            <div className="prose prose-invert max-w-none">
              {generatedContent ? (
                <ReactMarkdown>{generatedContent}</ReactMarkdown>
              ) : (
                <div className="flex items-center gap-3 text-gray-400 mt-20">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing your brief...</span>
                </div>
              )}
              <div ref={contentEndRef} />
            </div>
          </div>
        </div>
      </div>
      {/* Right Sidebar */}
      <div className="w-[420px] flex-shrink-0 border-l border-white/10 bg-[#0a0a0c] h-full overflow-hidden flex flex-col">
        {/* Original Brief */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
            Your brief
          </h3>
          <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
            {submittedText}
          </div>
        </div>

        {/* Revise Input */}
        <div className="border-t border-white/10 p-6 flex-shrink-0">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
            Revise
          </h3>
          <div className="relative bg-[#121214] border border-white/10 rounded-xl p-4 pb-14">
            <textarea
              value={reviseValue}
              onChange={(e) => setReviseValue(e.target.value)}
              onKeyDown={handleReviseKeyDown}
              placeholder="Ask to revise or add more details..."
              rows={3}
              className="w-full bg-transparent resize-none outline-none text-gray-200 placeholder-gray-500 text-sm leading-relaxed"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <span className="text-xs text-gray-500 bg-black/50 px-2.5 py-1 rounded-full border border-white/5">
                1 kredit
              </span>
              <button
                type="button"
                onClick={handleRevise}
                disabled={!reviseValue.trim() || isStreaming}
                className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
