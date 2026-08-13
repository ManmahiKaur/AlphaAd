import React from 'react';
import { Recommendation } from '../../types';
import { Card, Badge } from '../ui/UIComponents';
import { Sparkles, ShieldAlert, Target, StopCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const RecommendationCard: React.FC<{ rec: Recommendation; currency?: string }> = ({ rec, currency = 'USD' }) => {
  let badgeVariant: 'green' | 'red' | 'yellow' = 'yellow';
  if (rec.recommendation === 'BUY') badgeVariant = 'green';
  if (rec.recommendation === 'SELL') badgeVariant = 'red';

  return (
    <Card className="bg-white border border-blue-200 shadow-sm rounded-xl space-y-5 p-5">
      {/* Header Badge & Title */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">LangGraph AI Rating</h3>
            <span className="text-[11px] text-slate-500">Confidence Score: <strong className="text-blue-600">{rec.confidence}%</strong></span>
          </div>
        </div>

        <Badge variant={badgeVariant}>
          <span className="text-sm font-extrabold px-1 tracking-wider">{rec.recommendation}</span>
        </Badge>
      </div>

      {/* Target Price Grid */}
      <div className="grid grid-cols-3 gap-3 bg-blue-50 p-3.5 rounded-xl border border-blue-200 text-xs">
        <div>
          <span className="block text-slate-500 uppercase font-semibold text-[10px]">Entry Price</span>
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
          {rec.summary}
        </p>
      </div>

      {/* Rationale Bullet Points */}
      <div className="space-y-2 bg-white p-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">Key Drivers & Technical Signals</h4>
        <ul className="space-y-1.5">
          {rec.reasons.map((r, i) => (
            <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Risk & Disclaimer Footer */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>{rec.disclaimer}</span>
      </div>
    </Card>
  );
};
