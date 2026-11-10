"use client";

import React from "react";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  CircleDot,
  CalendarClock,
  PlaneTakeoff,
  ShieldAlert,
} from "lucide-react";
import type { MLoCContract } from "@/types/acn";

interface MilestoneTimelineProps {
  contract: MLoCContract | null;
}

export default function MilestoneTimeline({ contract }: MilestoneTimelineProps) {
  if (!contract) {
    return (
      <div className="bg-[#0B111E] border border-[#1E2B45] rounded-lg p-4 text-xs font-mono text-slate-400">
        Select an mLoC row in the AG Grid Clearing Blotter to inspect its SLA Milestone Timeline.
      </div>
    );
  }

  const ganttBars = [
    {
      idx: 0,
      code: "M1",
      title: "Channel3 Discovery & PayPal Invoice/Order v2",
      apiBadge: "POST /v2/invoicing/invoices + /v2/checkout/orders",
      startPct: 0,
      widthPct: 24,
      milestone: contract.timeline_milestones[0],
      amountLabel: `$${contract.total_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} Underwritten`,
    },
    {
      idx: 1,
      code: "M2",
      title: "Dual-Lock Reserve Capture & SHA-256 Assurance",
      apiBadge: "POST /v2/checkout/orders/{id}/authorize",
      startPct: 22,
      widthPct: 26,
      milestone: contract.timeline_milestones[1],
      amountLabel: contract.assurance_receipt
        ? contract.assurance_receipt.receipt_id
        : "Pending Buyer Approval",
    },
    {
      idx: 2,
      code: "M3",
      title: `Carrier BoL Scan & Tranche 1 Release (${contract.tranche_1.pct}%)`,
      apiBadge: "POST /v1/shipping/trackers-batch + /v1/payments/payouts",
      startPct: 46,
      widthPct: 28,
      milestone: contract.timeline_milestones[2],
      amountLabel: `$${contract.tranche_1.amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
      })} (${contract.tranche_1.status})`,
    },
    {
      idx: 3,
      code: "M4",
      title: contract.sla_terms.breach_detected
        ? `SLA Breach Arbiter: ${contract.sla_terms.late_penalty_pct}% Buyer Rebate + Net Payout`
        : `Customs Clearance & Tranche 2 Settlement (${contract.tranche_2.pct}%)`,
      apiBadge: contract.sla_terms.breach_detected
        ? "POST /v2/payments/captures/{id}/refund + /v1/payments/payouts"
        : "POST /v1/shipping/trackers-batch + /v1/payments/payouts",
      startPct: 72,
      widthPct: 28,
      milestone: contract.timeline_milestones[3],
      amountLabel: contract.sla_terms.breach_detected
        ? `-$${contract.refunded_rebate_amount.toFixed(2)} Rebate | +$${contract.tranche_2.amount.toFixed(2)} Seller`
        : `$${contract.tranche_2.amount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })} (${contract.tranche_2.status})`,
    },
  ];

  return (
    <div className="flex flex-col bg-[#0B111E] border border-[#1E2B45] rounded-lg overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#0E1628] border-b border-[#1E2B45]">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-100">
            Milestone Gating Timeline — SLA Deadlines & Carrier Windows
          </h3>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
            {contract.mloc_id} • {contract.corridor}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="inline-flex items-center gap-1 text-slate-300">
            <PlaneTakeoff className="w-3.5 h-3.5 text-cyan-400" />
            Carrier: <strong className="text-white">{contract.carrier}</strong>
            {contract.tracking_number ? ` (${contract.tracking_number})` : ""}
          </span>
          <span className="inline-flex items-center gap-1 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            SLA Window: <strong className="text-amber-300">{contract.sla_terms.window_hours}h</strong>
          </span>
          {contract.sla_terms.breach_detected && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
              <ShieldAlert className="w-3 h-3" />
              SLA PENALTY REBATE APPLIED (-{contract.sla_terms.late_penalty_pct}%)
            </span>
          )}
        </div>
      </div>

      {/* Gantt Grid Body */}
      <div className="p-4 space-y-2.5">
        {/* Time Axis Ruler */}
        <div className="grid grid-cols-12 text-[10px] font-mono text-slate-500 border-b border-slate-800/80 pb-1.5">
          <div className="col-span-5">MILESTONE / PAYPAL SANDBOX PRIMITIVE</div>
          <div className="col-span-7 grid grid-cols-4 text-center">
            <span>T+00h (INVOICE/ORDER)</span>
            <span>T+02h (DUAL-LOCK)</span>
            <span>T+24h (CARRIER BOL)</span>
            <span>T+{contract.sla_terms.window_hours}h (CUSTOMS SLA)</span>
          </div>
        </div>

        {ganttBars.map((bar) => {
          const status = bar.milestone?.status || "PENDING";
          const barColor =
            status === "COMPLETED"
              ? "bg-gradient-to-r from-emerald-500/80 to-emerald-400/80 border-emerald-400"
              : status === "ARBITRATED"
              ? "bg-gradient-to-r from-rose-500/80 to-amber-500/80 border-rose-400"
              : status === "IN_PROGRESS"
              ? "bg-gradient-to-r from-cyan-500/80 to-blue-500/80 border-cyan-400 animate-pulse"
              : "bg-slate-800/90 border-slate-700";

          return (
            <div
              key={bar.code}
              className="grid grid-cols-12 items-center gap-2 py-1.5 px-2 rounded bg-[#070B14]/70 border border-slate-800/70"
            >
              <div className="col-span-5 flex items-start gap-2 pr-2">
                <div className="mt-0.5">
                  {status === "COMPLETED" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  {status === "ARBITRATED" && (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  )}
                  {status === "IN_PROGRESS" && (
                    <CircleDot className="w-4 h-4 text-cyan-400 animate-spin" />
                  )}
                  {status === "PENDING" && (
                    <Clock className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 font-bold">
                      {bar.code}
                    </span>
                    <span className="text-xs font-medium text-slate-200 truncate">
                      {bar.title}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                    {bar.apiBadge}
                  </div>
                </div>
              </div>

              {/* Gantt Track */}
              <div className="col-span-7 relative h-7 bg-[#050811] rounded border border-slate-800/80 overflow-hidden flex items-center">
                {/* Vertical Grid Guides */}
                <div className="absolute inset-0 grid grid-cols-4 pointer-events-none">
                  <div className="border-r border-slate-800/50" />
                  <div className="border-r border-slate-800/50" />
                  <div className="border-r border-slate-800/50" />
                  <div />
                </div>

                {/* Gantt Bar */}
                <div
                  style={{
                    marginLeft: `${bar.startPct}%`,
                    width: `${bar.widthPct}%`,
                  }}
                  className={`relative h-5 rounded border px-2 flex items-center justify-between text-[10px] font-mono font-semibold text-slate-950 shadow-sm transition-all ${barColor}`}
                >
                  <span
                    className={`truncate ${
                      status === "PENDING" ? "text-slate-400" : "text-slate-950 font-bold"
                    }`}
                  >
                    {bar.amountLabel}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
