'use client';

import { useState } from 'react';

interface ClaimVerification {
  claim: string;
  verdict: string;
  explanation: string;
  sources: string[];
}

interface FactCheckSource {
  name: string;
  type: string;
  reliability: string;
}

interface FactCheckResult {
  overallVerdict: string;
  truthPercentage: number;
  overallSummary: string;
  claimVerifications: ClaimVerification[];
  sources: FactCheckSource[];
  redFlags: string[];
  context: string;
}

const verdictColors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  'TRUE': { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30', icon: '✅' },
  'MOSTLY TRUE': { bg: 'bg-green-500/15', text: 'text-green-300', border: 'border-green-500/25', icon: '✅' },
  'PARTIALLY TRUE': { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30', icon: '⚠️' },
  'MISLEADING': { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/30', icon: '⚠️' },
  'MOSTLY FALSE': { bg: 'bg-red-500/15', text: 'text-red-300', border: 'border-red-500/25', icon: '❌' },
  'FALSE': { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30', icon: '❌' },
  'UNVERIFIED': { bg: 'bg-gray-500/20', text: 'text-gray-300', border: 'border-gray-500/30', icon: '❓' },
};

function getVerdictStyle(verdict: string) {
  return verdictColors[verdict] || verdictColors['UNVERIFIED'];
}

function getTruthColor(percentage: number): string {
  if (percentage >= 80) return 'from-green-500 to-emerald-500';
  if (percentage >= 60) return 'from-yellow-500 to-amber-500';
  if (percentage >= 40) return 'from-orange-500 to-amber-600';
  return 'from-red-500 to-rose-600';
}

function getReliabilityBadge(reliability: string) {
  switch (reliability) {
    case 'High':
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    case 'Medium':
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    case 'Low':
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
}

export default function FactCheckButton({ articleId }: { articleId: number }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FactCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleFactCheck = async () => {
    if (result) {
      // Toggle visibility if already loaded
      setExpanded(!expanded);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/fact-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error('AI quota exceeded. Please wait about 1 minute and try again.');
        }
        throw new Error(data.error || 'Fact-check failed');
      }

      setResult(data.factCheck);
      setExpanded(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Fact Check Button */}
      <button
        onClick={handleFactCheck}
        disabled={loading}
        className={`w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
          result
            ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-200 hover:border-blue-400/50'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.01]'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4" fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            AI is Verifying Facts...
          </>
        ) : result ? (
          <>
            🔍 {expanded ? 'Hide' : 'Show'} Fact-Check Results
            <span className={`px-3 py-1 rounded-full text-sm ${getVerdictStyle(result.overallVerdict).bg} ${getVerdictStyle(result.overallVerdict).text}`}>
              {result.truthPercentage}% Verified
            </span>
          </>
        ) : (
          <>
            🔍 Verify This News — AI Fact Check
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-center justify-between">
          <span>❌ {error}</span>
          <button
            onClick={() => { setError(null); handleFactCheck(); }}
            className="ml-4 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-xs font-medium transition"
          >
            🔄 Retry
          </button>
        </div>
      )}

      {/* Fact Check Results */}
      {result && expanded && (
        <div className="mt-6 space-y-6 animate-in fade-in duration-500">
          {/* Overall Verdict Card */}
          <div className={`rounded-2xl p-6 border ${getVerdictStyle(result.overallVerdict).bg} ${getVerdictStyle(result.overallVerdict).border}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl">{getVerdictStyle(result.overallVerdict).icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className={`text-2xl font-bold ${getVerdictStyle(result.overallVerdict).text}`}>
                    {result.overallVerdict}
                  </h3>
                </div>
                <p className="text-gray-300 text-sm">{result.overallSummary}</p>
              </div>
            </div>

            {/* Truth Percentage Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Truth Score</span>
                <span className={`font-bold ${getVerdictStyle(result.overallVerdict).text}`}>
                  {result.truthPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-4 overflow-hidden">
                <div
                  className={`bg-gradient-to-r ${getTruthColor(result.truthPercentage)} rounded-full h-4 transition-all duration-1000 ease-out`}
                  style={{ width: `${result.truthPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Claim-by-Claim Verification */}
          {result.claimVerifications && result.claimVerifications.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-blue-400">▎</span> Claim-by-Claim Analysis
              </h3>
              <div className="space-y-3">
                {result.claimVerifications.map((claim, idx) => {
                  const style = getVerdictStyle(claim.verdict);
                  return (
                    <div
                      key={idx}
                      className={`rounded-xl p-4 border ${style.bg} ${style.border}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl flex-shrink-0 mt-0.5">{style.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text} border ${style.border}`}>
                              {claim.verdict}
                            </span>
                          </div>
                          <p className="text-white font-medium text-sm mb-1">
                            &ldquo;{claim.claim}&rdquo;
                          </p>
                          <p className="text-gray-300 text-sm">
                            {claim.explanation}
                          </p>
                          {claim.sources && claim.sources.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {claim.sources.map((source, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-2 py-0.5 bg-white/5 text-gray-400 rounded text-xs border border-gray-700/50"
                                >
                                  📎 {source}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Red Flags */}
          {result.redFlags && result.redFlags.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-red-400">▎</span> Red Flags
              </h3>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <ul className="space-y-2">
                  {result.redFlags.map((flag, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-red-200 text-sm">
                      <span className="text-red-400 flex-shrink-0">🚩</span>
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Verification Sources */}
          {result.sources && result.sources.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-purple-400">▎</span> Verification Sources
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.sources.map((source, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50"
                  >
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-purple-500/20 rounded-lg text-sm">
                      📰
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{source.name}</p>
                      <p className="text-gray-400 text-xs">{source.type}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs border ${getReliabilityBadge(source.reliability)}`}>
                      {source.reliability}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Context */}
          {result.context && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-blue-300 mb-2 flex items-center gap-2">
                💡 Additional Context
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">{result.context}</p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-4 text-center">
            <p className="text-gray-500 text-xs">
              ⚠️ This fact-check is AI-generated and should be used as a starting point for verification. 
              Always cross-reference with official sources for critical decisions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
