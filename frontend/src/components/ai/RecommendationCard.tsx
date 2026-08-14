import React from 'react';
import { Recommendation } from '../../types';
import { Card, Badge } from '../ui/UIComponents';
import { Sparkles, ShieldAlert, Target, StopCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const RecommendationCard: React.FC<{ rec: Recommendation; currency?: string }> = ({ rec, currency = 'USD' }) => {
  let badgeVariant: 'green' | 'red' | 'yellow' = 'yellow';
  if (rec.recommendation === 'BUY') badgeVariant = 'green';
  if (rec.recommendation === 'SELL') badgeVariant = 'red';

  const simplifiedReasons = rec.reasons.map((r) => {
    if (r.includes('Moving Average Alignment')) {
      return 'The current price is above its recent average, suggesting an upward trend.';
    }
    if (r.includes('Momentum Profile')) {
      return 'Recent price movement shows positive momentum.';
    }
    if (r.includes('Fundamental Health')) {
      return "The company's valuation looks reasonable compared with similar companies.";
    }
    if (r.includes('Risk/Reward Ratio')) {
      return 'The potential gain is higher than the planned downside.';
    }
    return r;
  });
  // Simplify summary wording for normal investors
  const simplifiedSummary = rec.summary
    .replace(/strong bullish momentum/gi, 'positive trend')
    .replace(/key moving averages/gi, 'recent averages')
    .replace(/valuation metrics/gi, 'valuation')
    .replace(/strong bullish/gi, 'positive')
    .replace(/bullish/gi, 'positive')
    .replace(/bearish/gi, 'negative');

  // Calculate potential upside percentage
  const potentialUpside = ((rec.target_price - rec.entry_price) / rec.entry_price) * 100;

  // Extract risk level and explanation
  const riskParts = (rec.risk_assessment || '').split(/\s+/);
  const riskLevel = riskParts[0] ?? 'N/A';
  const riskExplanation = riskParts.slice(1).join(' ');

  // Format analysis timestamp
  const analysisTime = new Date(rec.created_at).toLocaleString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true,
  });

  return (
    <Card className="bg-white border border-blue-200 shadow-sm rounded-xl space-y-5 p-5">
      {/* Header Badge & Title */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-xl">AI Stock Rating</h3>
            <span className="text-sm text-slate-600">Confidence: <strong className="text-green-600">{rec.confidence}%</strong></span>
          </div>
        </div>

        <Badge variant={badgeVariant}>
          <span className="text-sm font-extrabold px-1 tracking-wider">{rec.recommendation}</span>
        </Badge>
      </div>

      {/* Target Price Grid */}
      <div className="grid grid-cols-3 gap-3 bg-blue-50 p-3.5 rounded-xl border border-blue-200 text-xs">
        <div>
            <span className="block text-slate-500 uppercase font-semibold text-[10px]">Current Price</span>
            <span className="font-mono font-bold text-slate-900">{formatCurrency(rec.entry_price, currency)}</span>
        </div>
        <div>
          <span className="block text-slate-500 uppercase font-semibold text-[10px] flex items-center gap-1">
            <Target className="w-3 h-3 text-emerald-600" /> Target Price
          </span>
          <span className="font-mono font-bold text-emerald-600">{formatCurrency(rec.target_price, currency)}</span>
        </div>
        <div>
          <span className="block text-slate-500 uppercase font-semibold text-[10px] flex items-center gap-1">
            <StopCircle className="w-3 h-3 text-red-600" /> Stop Loss
          </span>
          <span className="font-mono font-bold text-red-600">{formatCurrency(rec.stop_loss, currency)}</span>
        </div>
      </div>

      {/* AI Summary */}
      <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-blue-100">
         <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">Executive Summary</h4>
         <p className="text-xs text-slate-900 leading-relaxed">
           {simplifiedSummary}
         </p>
      </div>

      {/* Rationale Bullet Points */}
      <div className="space-y-2 bg-white p-2">
        <h4 className="text-sm font-bold text-slate-800">Why this rating?</h4>
        <ul className="space-y-1.5">
          {simplifiedReasons.slice(0, 4).map((r, i) => (
            <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

       {/* Overall Risk */}
       <div className="flex items-center gap-2 text-sm mt-2">
         <span className="font-medium text-slate-800">Overall Risk:</span>
         <span className={riskLevel.toLowerCase() === 'low' ? 'text-green-600' : riskLevel.toLowerCase() === 'medium' ? 'text-amber-600' : 'text-red-600'}>
           {riskLevel}
         </span>
       </div>
       {riskExplanation && (
         <p className="text-xs text-slate-600 mt-1">{riskExplanation}</p>
       )}
       {/* Potential Upside */}
       <div className="text-sm text-slate-600 mt-2">
         Potential Upside: <strong className="text-green-600">{potentialUpside.toFixed(1)}%</strong>
       </div>
       {/* Analysis Timestamp */}
       <div className="text-xs text-slate-500 mt-1">Analysis updated: {analysisTime}</div>
       {/* Disclaimer */}
       <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 flex items-start gap-2 mt-2">
         <ShieldAlert className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
         <span>⚠️ AI-generated educational analysis. This is not financial advice.</span>
       </div>
    </Card>
  );
};
