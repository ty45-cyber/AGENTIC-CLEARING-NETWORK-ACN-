"use client";

import React from "react";
import {
  X,
  Lock,
  ShieldCheck,
  CheckCircle2,
  FileCode2,
  ExternalLink,
  Fingerprint,
} from "lucide-react";
import type { MLoCContract } from "@/types/acn";

interface PayPalSandboxModalProps {
  contract: MLoCContract | null;
  onClose: () => void;
  onConfirmAuthorize: (mlocId: string) => Promise<void>;
  isAuthorizing: boolean;
}

export default function PayPalSandboxModal({
  contract,
  onClose,
  onConfirmAuthorize,
  isAuthorizing,
}: PayPalSandboxModalProps) {
  if (!contract) return null;

  const isAlreadyLocked = Boolean(contract.assurance_receipt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#0B111E] border border-[#1E2B45] rounded-xl shadow-2xl overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0E1628] border-b border-[#1E2B45]">
          <div className="flex items-center gap-2.5">
            <div className="px-2 py-0.5 rounded bg-[#0070BA] text-white font-bold text-xs tracking-wide">
              PayPal
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-semibold">
              Sandbox B2B Dual-Lock Escrow Checkout (Orders v2 AUTHORIZE)
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Summary Banner */}
          <div className="p-3.5 rounded-lg bg-[#070B14] border border-[#1E2B45] flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-mono text-slate-400">
                MICRO-LETTER-OF-CREDIT REFERENCE
              </div>
              <div className="text-sm font-mono font-bold text-white flex items-center gap-2">
                <span>{contract.mloc_id}</span>
                <span className="text-xs text-cyan-400">
                  ({contract.corridor})
                </span>
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                {contract.quantity}x {contract.commodity_name}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-mono text-slate-400">
                TOTAL ESCROW RESERVE HOLD
              </div>
              <div className="text-xl font-mono font-bold text-emerald-400">
                $
                {contract.total_amount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}{" "}
                <span className="text-xs text-slate-400">
                  {contract.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Counterparty & PayPal Sandbox IDs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded bg-[#070B14] border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400">
                BUYER TREASURY (PAYER)
              </div>
              <div className="text-slate-100 font-semibold">
                {contract.buyer_name}
              </div>
              <div className="text-cyan-400 text-[11px]">
                {contract.buyer_email}
              </div>
              <div className="text-[10px] text-slate-500 pt-1">
                PayPal Order ID: {contract.paypal_ids.order_id}
              </div>
            </div>

            <div className="p-3 rounded bg-[#070B14] border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400">
                BENEFICIARY SUPPLIER (ESCROW RECIPIENT)
              </div>
              <div className="text-slate-100 font-semibold">
                {contract.supplier_name}
              </div>
              <div className="text-emerald-400 text-[11px]">
                {contract.supplier_email}
              </div>
              <div className="text-[10px] text-slate-500 pt-1">
                PayPal Invoice ID: {contract.paypal_ids.invoice_id}
              </div>
            </div>
          </div>

          {/* Programmable Tranche Conditions */}
          <div className="p-3.5 rounded bg-[#070B14] border border-slate-800 space-y-2">
            <div className="text-[11px] font-mono text-slate-300 font-semibold uppercase">
              Programmable Milestone Release Schedule (Zero Blind Prepayment)
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded bg-[#0B111E] border border-cyan-500/30">
                <div className="text-cyan-300 font-bold">
                  Tranche 1 ({contract.tranche_1.pct}%): $
                  {contract.tranche_1.amount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Trigger: {contract.tranche_1.trigger}
                </div>
              </div>
              <div className="p-2.5 rounded bg-[#0B111E] border border-emerald-500/30">
                <div className="text-emerald-300 font-bold">
                  Tranche 2 ({contract.tranche_2.pct}%): $
                  {contract.tranche_2.amount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Trigger: {contract.tranche_2.trigger}
                </div>
              </div>
            </div>
          </div>

          {/* Cryptographic Assurance Receipt (if already locked) */}
          {isAlreadyLocked && contract.assurance_receipt ? (
            <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/40 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-emerald-300 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  CRYPTOGRAPHIC mLoC ASSURANCE RECEIPT ISSUED
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                  {contract.assurance_receipt.receipt_id}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                <div>
                  <span className="text-slate-500">Auth ID: </span>
                  {contract.assurance_receipt.paypal_authorization_id}
                </div>
                <div>
                  <span className="text-slate-500">Capture ID: </span>
                  {contract.assurance_receipt.paypal_capture_id}
                </div>
              </div>
              <div className="p-2 rounded bg-black/50 border border-emerald-500/20 text-[10px] text-emerald-300 break-all flex items-center gap-2">
                <Fingerprint className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>SHA-256 Proof: {contract.assurance_receipt.sha256_proof}</span>
              </div>
              <div className="text-[11px] text-emerald-200">
                {contract.assurance_receipt.supplier_instruction}
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <a
                href={`https://www.sandbox.paypal.com/checkoutnow?token=${contract.paypal_ids.order_id}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>Open PayPal Sandbox Checkout URL</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  onClick={onClose}
                  className="px-3.5 py-2 rounded text-xs font-mono text-slate-300 bg-slate-800 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  disabled={isAuthorizing}
                  onClick={() => onConfirmAuthorize(contract.mloc_id)}
                  className="px-4 py-2 rounded text-xs font-mono font-bold bg-[#FFC439] hover:bg-[#f4b827] text-slate-950 inline-flex items-center gap-2 shadow-lg transition disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    {isAuthorizing
                      ? "Executing Orders v2 Auth & Capture..."
                      : "Approve PayPal Sandbox Dual-Lock & Emit Receipt"}
                  </span>
                </button>
              </div>
            </div>
          )}

          {isAlreadyLocked && (
            <div className="flex justify-end pt-1">
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded text-xs font-mono font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 inline-flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Done</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
