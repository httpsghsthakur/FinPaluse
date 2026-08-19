import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  SlidersHorizontal,
  ArrowRight,
  TrendingUp,
  PieChart,
  Receipt,
  RotateCcw,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { useChatStore } from '../lib/store/useChatStore';
import { useUserStore } from '../lib/store/useUserStore';
import { CitationChip } from '../components/ui/CitationChip';
import { ConfidenceBadge } from '../components/ui/ConfidenceBadge';
import { api } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils/formatters';

const SUGGESTED_PROMPTS = [
  'Can I afford a ₹6,500 dinner without delaying my emergency fund goal?',
  'What is my monthly burn rate and runway if I lose my job today?',
  'Why did my dining spending increase by 34% this month?',
  'How much can I safely invest into index funds this paycheck?',
  'Forecast my cash balance for the next 90 days after rent is paid.',
];

export const CopilotPage: React.FC = () => {
  const navigate = useNavigate();
  const { messages, isStreaming, personality, addMessage, updateStreamingMessage, finishStreaming, setPersonality, clearMessages } = useChatStore();
  const { profile } = useUserStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSend = async (queryText?: string) => {
    const text = queryText || input.trim();
    if (!text || isStreaming) return;

    setInput('');

    // 1. Add User Message
    const userMsgId = `msg-u-${Date.now()}`;
    addMessage({
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    });

    // 2. Prepare AI streaming message container
    const aiMsgId = `msg-ai-${Date.now()}`;
    addMessage({
      id: aiMsgId,
      sender: 'ai',
      text: '',
      timestamp: new Date().toISOString(),
      confidenceScore: 0.96,
      confidenceBand: 'high',
      isStreaming: true,
    });

    try {
      await api.askCopilotStream(
        text,
        personality,
        (token) => {
          updateStreamingMessage(aiMsgId, token);
        },
        (complete) => {
          finishStreaming(aiMsgId, {
            groundedData: complete.groundedData,
            confidenceScore: complete.confidenceScore,
            confidenceBand: complete.confidenceBand,
            quickActions: complete.quickActions,
          });
        }
      );
    } catch (err) {
      console.error(err);
      updateStreamingMessage(aiMsgId, 'Sorry, I encountered an issue analyzing your financial telemetry. Please try again.');
      finishStreaming(aiMsgId);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] md:h-[calc(100vh-7rem)] max-w-4xl mx-auto w-full bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800/60 bg-slate-900/20 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Bot className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              Finpluse Copilot
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                LIVE AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Directly connected to your accounts, budgets, and cash forecast</p>
          </div>
        </div>

        {/* Personality and History Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-1 text-[11px]">
            {(['concise', 'balanced', 'detailed'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPersonality(p)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                  personality === p
                    ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={clearMessages}
            className="p-2 rounded-xl bg-slate-800/40 backdrop-blur-md border border-slate-700/50 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors cursor-pointer"
            title="Clear Chat History"
            aria-label="Clear chat history"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages List Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6 py-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Ask your money anything</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Finpluse uses deterministic financial calculations paired with contextual AI to provide
                actionable answers grounded in your real balances, runway, and goals.
              </p>
            </div>

            <div className="w-full space-y-2 text-left">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
                Suggested Prompts
              </span>
              <div className="space-y-1.5">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className="w-full p-3 rounded-2xl bg-slate-800/30 backdrop-blur-md border border-slate-700/40 hover:border-emerald-500/40 hover:bg-slate-800/50 text-xs text-slate-300 hover:text-white transition-all text-left flex items-center justify-between group cursor-pointer"
                  >
                    <span>{prompt}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`space-y-2 max-w-[85%] sm:max-w-[78%]`}>
                  {/* Message Bubble */}
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-emerald-500 text-slate-950 font-semibold rounded-tr-none shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                        : 'bg-slate-800/40 backdrop-blur-md border border-slate-700/50 text-slate-200 rounded-tl-none space-y-3 shadow-lg'
                    }`}
                  >
                    {/* Render message body with linebreaks */}
                    <div className="whitespace-pre-wrap">{msg.text || (msg.isStreaming && 'Thinking...')}</div>

                    {/* Grounded Data Chip & Confidence Badge for AI Messages */}
                    {!isUser && (msg.groundedData || msg.confidenceBand) && (
                      <div className="pt-2 border-t border-slate-700/40 flex flex-wrap items-center gap-2">
                        {msg.confidenceBand && (
                          <ConfidenceBadge
                            band={msg.confidenceBand}
                            score={msg.confidenceScore}
                          />
                        )}
                        {msg.groundedData && msg.groundedData.length > 0 && (
                          <CitationChip groundedData={msg.groundedData} />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quick Action Navigation Buttons */}
                  {!isUser && msg.quickActions && msg.quickActions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.quickActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => navigate(action.path)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-750/70 border border-slate-700/50 text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                        >
                          <span>{action.label}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div
                    className={`text-[10px] text-slate-400 font-mono ${
                      isUser ? 'text-right' : 'text-left'
                    }`}
                  >
                    {formatDate(msg.timestamp, 'p')}
                  </div>
                </div>

                {isUser && (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-8 h-8 rounded-xl object-cover border border-slate-700 shrink-0 mt-0.5"
                  />
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Field */}
      <div className="p-3 md:p-4 border-t border-slate-800/60 bg-slate-900/20 backdrop-blur-md shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-1.5 focus-within:border-emerald-500/70 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all"
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask about spending, runway, goals, or 'Can I afford X?'..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none font-sans"
          />

          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-slate-950 font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] cursor-pointer"
            aria-label="Send message"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-2 pt-1.5">
          <span>AI answers are grounded in your actual verified banking ledger.</span>
          <span className="font-mono">Privacy-safe local processing</span>
        </div>
      </div>
    </div>
  );
};
