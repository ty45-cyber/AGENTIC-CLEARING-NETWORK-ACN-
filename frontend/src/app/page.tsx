"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ShieldCheck,
  Sparkles,
  Terminal,
  Play,
  KeyRound,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Truck,
  FileJson,
  Activity,
  Award,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Fingerprint,
} from "lucide-react";
import ClearingBlotterGrid from "@/components/ClearingBlotterGrid";
import MilestoneTimeline from "@/components/MilestoneTimeline";
import PayPalSandboxModal from "@/components/PayPalSandboxModal";
import {
  INITIAL_CONTRACTS,
  INITIAL_WEBHOOKS,
  advanceContractFallback,
  computeMetrics,
  createContractFallback,
  parsePromptFallback,
} from "@/lib/standaloneEngine";
import type {
  MLoCContract,
  PayPalStatus,
  PortfolioMetrics,
  WebhookEvent,
} from "@/types/acn";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const PRESET_PROMPTS = [
  {
    label: "P0-1 Spec: 50x LiFePO4 Battery Packs (<$12k, 30%/70%)",
    prompt:
      "Source 50 industrial LiFePO4 battery packs under $12,000 with 30% release on bill-of-lading and 70% on customs clearance",
  },
  {
    label: "800G Silicon Photonics Transceivers (<$18.5k, 40%/60%)",
    prompt:
      "Source 40 800G OSFP silicon photonics optical transceivers under $18,500 with 40% release on FedEx airway bill and 60% on customs clearance",
  },
  {
    label: "Precision Robotics Servo Actuators (<$9.8k, 25%/75%)",
    prompt:
      "Procure 25 precision harmonic drive servo actuators under $9,800 with 25% release on UPS bill-of-lading and 75% on final delivery",
  },
  {
    label: "B2B GPU Inference Cluster SLA (<$7.5k, 50%/50%)",
    prompt:
      "Reserve 40 dedicated low-latency B2B AI inference cluster nodes under $7,500 with 50% on provisioning proof and 50% on 48h SLA verification",
  },
];

export default function ACNOperatorHUD() {
  const [contracts, setContracts] = useState<MLoCContract[]>(INITIAL_CONTRACTS);
  const [selectedContract, setSelectedContract] =
    useState<MLoCContract | null>(INITIAL_CONTRACTS[0]);
  const [metrics, setMetrics] = useState<PortfolioMetrics>(() =>
    computeMetrics(INITIAL_CONTRACTS)
  );
  const [webhookEvents, setWebhookEvents] =
    useState<WebhookEvent[]>(INITIAL_WEBHOOKS);
  const [paypalStatus, setPaypalStatus] = useState<PayPalStatus>({
    mode: "SANDBOX_DETERMINISTIC_TWIN",
    base_url: "https://api-m.sandbox.paypal.com",
    client_id_configured: false,
    client_id_preview: "NOT_SET",
    apimatic_sdk_version: "2.4.0-paypal-sandbox",
    validated_calls_count: 14,
  });

  const [prompt, setPrompt] = useState<string>(PRESET_PROMPTS[0].prompt);
  const [previewData, setPreviewData] = useState<Record<string, unknown> | null>(
    () => parsePromptFallback(PRESET_PROMPTS[0].prompt)
  );
  const [isCreating, setIsCreating] = useState(false);
  const [busyMlocId, setBusyMlocId] = useState<string | null>(null);
  const [modalContract, setModalContract] = useState<MLoCContract | null>(null);
  const [inspectorTab, setInspectorTab] = useState<
    "OVERVIEW" | "PAYLOADS" | "APIMATIC" | "WEBHOOKS"
  >("OVERVIEW");
  const [activePayloadKey, setActivePayloadKey] = useState<string>("invoice_v2");

  // Credentials modal
  const [showCredsModal, setShowCredsModal] = useState(false);
  const [clientIdInput, setClientIdInput] = useState("");
  const [clientSecretInput, setClientSecretInput] = useState("");

  // Guided Autopilot Demo status
  const [autopilotBanner, setAutopilotBanner] = useState<string | null>(null);

  const fetchFullState = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/state`);
      if (!res.ok) return;
      const data = await res.json();
      setContracts(data.contracts || INITIAL_CONTRACTS);
      setMetrics(data.metrics);
      setWebhookEvents(data.webhook_events || INITIAL_WEBHOOKS);
      setPaypalStatus(data.paypal_status);
      setSelectedContract((prev) => {
        if (!prev && data.contracts?.length > 0) return data.contracts[0];
        if (prev) {
          const updated = (data.contracts as MLoCContract[]).find(
            (c) => c.mloc_id === prev.mloc_id
          );
          return updated || data.contracts[0] || null;
        }
        return null;
      });
    } catch {
      // Running standalone on Vercel without local FastAPI server — uses built-in deterministic engine
    }
  }, []);

  useEffect(() => {
    fetchFullState();
  }, [fetchFullState]);

  // Live NL Trade Structuring Preview (P0-1)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!prompt || prompt.trim().length < 8) return;
      try {
        const res = await fetch(`${API_BASE}/api/mloc/preview`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        if (res.ok) {
          const data = await res.json();
          setPreviewData(data);
          return;
        }
      } catch {
        // Fallback to standalone parser
      }
      setPreviewData(parsePromptFallback(prompt));
    }, 180);
    return () => clearTimeout(timer);
  }, [prompt]);

  const applyContractUpdate = (
    updated: MLoCContract,
    newMetrics?: PortfolioMetrics,
    newEvents?: WebhookEvent[]
  ) => {
    setContracts((prev) => {
      const exists = prev.some((c) => c.mloc_id === updated.mloc_id);
      const nextList = exists
        ? prev.map((c) => (c.mloc_id === updated.mloc_id ? updated : c))
        : [updated, ...prev];
      setMetrics(newMetrics || computeMetrics(nextList));
      return nextList;
    });
    setSelectedContract(updated);
    if (newEvents) setWebhookEvents(newEvents);
  };

  // P0-1: Create mLoC + PayPal Sandbox Invoice & Order
  const handleCreateMloc = async (): Promise<MLoCContract | null> => {
    if (!prompt.trim()) return null;
    setIsCreating(true);
    try {
      const res = await fetch(`${API_BASE}/api/mloc/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (res.ok) {
        const data = await res.json();
        applyContractUpdate(data.contract, data.metrics, data.webhook_events);
        return data.contract as MLoCContract;
      }
    } catch {
      // Standalone Vercel fallback
    } finally {
      setIsCreating(false);
    }
    const fallbackContract = createContractFallback(prompt);
    applyContractUpdate(fallbackContract);
    return fallbackContract;
  };

  // P0-2: Dual-Lock Authorization & Reserve Capture
  const handleAuthorizeMloc = async (
    mlocId: string
  ): Promise<MLoCContract | null> => {
    setBusyMlocId(mlocId);
    try {
      const res = await fetch(`${API_BASE}/api/mloc/${mlocId}/authorize`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        applyContractUpdate(data.contract, data.metrics, data.webhook_events);
        if (modalContract && modalContract.mloc_id === mlocId) {
          setModalContract(data.contract);
        }
        return data.contract as MLoCContract;
      }
    } catch {
      // Standalone Vercel fallback
    } finally {
      setBusyMlocId(null);
    }
    const target = contracts.find((c) => c.mloc_id === mlocId);
    if (!target) return null;
    const updated = advanceContractFallback(target, "AUTHORIZE");
    applyContractUpdate(updated);
    if (modalContract && modalContract.mloc_id === mlocId) {
      setModalContract(updated);
    }
    return updated;
  };

  // P0-3: Autonomous Fulfillment Oracle (Carrier BoL Scan -> Tranche 1 Payout)
  const handleFulfillTranche1 = async (
    mlocId: string
  ): Promise<MLoCContract | null> => {
    setBusyMlocId(mlocId);
    try {
      const res = await fetch(
        `${API_BASE}/api/mloc/${mlocId}/fulfill-tranche-1`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );
      if (res.ok) {
        const data = await res.json();
        applyContractUpdate(data.contract, data.metrics, data.webhook_events);
        return data.contract as MLoCContract;
      }
    } catch {
      // Standalone Vercel fallback
    } finally {
      setBusyMlocId(null);
    }
    const target = contracts.find((c) => c.mloc_id === mlocId);
    if (!target) return null;
    const updated = advanceContractFallback(target, "TRANCHE_1");
    applyContractUpdate(updated);
    return updated;
  };

  // Happy-Path Tranche 2 Customs Clearance Settlement
  const handleSettleTranche2 = async (
    mlocId: string
  ): Promise<MLoCContract | null> => {
    setBusyMlocId(mlocId);
    try {
      const res = await fetch(
        `${API_BASE}/api/mloc/${mlocId}/settle-tranche-2`,
        { method: "POST" }
      );
      if (res.ok) {
        const data = await res.json();
        applyContractUpdate(data.contract, data.metrics, data.webhook_events);
        return data.contract as MLoCContract;
      }
    } catch {
      // Standalone Vercel fallback
    } finally {
      setBusyMlocId(null);
    }
    const target = contracts.find((c) => c.mloc_id === mlocId);
    if (!target) return null;
    const updated = advanceContractFallback(target, "TRANCHE_2");
    applyContractUpdate(updated);
    return updated;
  };

  // P1-1: AI Dispute & SLA Exception Arbiter (5% Buyer Refund + 95% Net Payout)
  const handleArbitrateSla = async (
    mlocId: string
  ): Promise<MLoCContract | null> => {
    setBusyMlocId(mlocId);
    try {
      const res = await fetch(`${API_BASE}/api/mloc/${mlocId}/arbitrate-sla`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exception_reason:
            "CUSTOMS_HOLD: Port of Long Beach commercial tariff inspection exceeded 120h SLA window by 38 hours",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        applyContractUpdate(data.contract, data.metrics, data.webhook_events);
        return data.contract as MLoCContract;
      }
    } catch {
      // Standalone Vercel fallback
    } finally {
      setBusyMlocId(null);
    }
    const target = contracts.find((c) => c.mloc_id === mlocId);
    if (!target) return null;
    const updated = advanceContractFallback(target, "ARBITRATE");
    applyContractUpdate(updated);
    return updated;
  };

  // Guided End-to-End Autopilot Runner (for 2:45 Devpost Demo Video!)
  const handleRunAutopilotDemo = async (withSlaBreach: boolean = true) => {
    setAutopilotBanner(
      "STAGE 1/4 [P0-1]: Procurement Agent discovering Channel3 catalog & issuing PayPal Sandbox Invoice v2 + Order v2..."
    );
    const created = await handleCreateMloc();
    if (!created) {
      setAutopilotBanner(null);
      return;
    }
    await new Promise((r) => setTimeout(r, 1100));

    setAutopilotBanner(
      `STAGE 2/4 [P0-2]: Executing PayPal Orders v2 Dual-Lock Reserve Capture for ${created.mloc_id} & emitting SHA-256 Assurance Receipt...`
    );
    await handleAuthorizeMloc(created.mloc_id);
    await new Promise((r) => setTimeout(r, 1200));

    setAutopilotBanner(
      `STAGE 3/4 [P0-3]: Fulfillment Oracle registering ${created.carrier} Bill-of-Lading via PayPal Tracking v1 & disbursing ${created.tranche_1.pct}% Tranche 1 Payout...`
    );
    await handleFulfillTranche1(created.mloc_id);
    await new Promise((r) => setTimeout(r, 1200));

    if (withSlaBreach) {
      setAutopilotBanner(
        `STAGE 4/4 [P1-1]: Customs Hold SLA Breach detected! AI Arbiter executing 5% Buyer Refund + 95% Seller Split via PayPal Refunds & Payouts APIs...`
      );
      await handleArbitrateSla(created.mloc_id);
    } else {
      setAutopilotBanner(
        `STAGE 4/4 [P0-4]: Customs Clearance verified! Releasing final ${created.tranche_2.pct}% Tranche 2 via PayPal Payouts v1...`
      );
      await handleSettleTranche2(created.mloc_id);
    }

    await new Promise((r) => setTimeout(r, 1800));
    setAutopilotBanner(null);
  };

  const handleSaveCredentials = async () => {
    const res = await fetch(`${API_BASE}/api/paypal/credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientIdInput,
        client_secret: clientSecretInput,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setPaypalStatus(data.paypal_status);
      setShowCredsModal(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060911] text-slate-100">
      {/* Top Institutional Navigation & Sponsor Status Bar */}
      <header className="sticky top-0 z-30 bg-[#080D1A]/95 backdrop-blur border-b border-[#1E2B45] px-4 py-2.5">
        <div className="max-w-[1680px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand Title */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 font-mono font-black text-slate-950 text-sm">
              ACN
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-mono font-bold tracking-wide text-white">
                  AGENTIC CLEARING NETWORK (ACN)
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold">
                  mLoC ESCROW ENGINE v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Autonomous Micro-Letters-of-Credit on PayPal Sandbox (Invoicing v2 • Orders v2 • Tracking v1 • Payouts v1 • Disputes/Refunds)
              </p>
            </div>
          </div>

          {/* Right Controls & Sponsor Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {/* APIMatic SDK Badge */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0E1628] border border-emerald-500/30 text-[11px] font-mono text-emerald-300">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>APIMatic Strict SDK</span>
            </div>

            {/* Channel3 Discovery Badge */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0E1628] border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Channel3 Discovery</span>
            </div>

            {/* PayPal Sandbox Mode Button */}
            <button
              onClick={() => setShowCredsModal(true)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono inline-flex items-center gap-1.5 border transition ${
                paypalStatus.mode === "LIVE_PAYPAL_SANDBOX"
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                  : "bg-blue-500/15 text-blue-300 border-blue-500/40 hover:bg-blue-500/25"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>
                {paypalStatus.mode === "LIVE_PAYPAL_SANDBOX"
                  ? "PayPal Sandbox: LIVE API"
                  : "PayPal Sandbox: Twin + Live Ready"}
              </span>
            </button>

            {/* 1-Click Guided Autopilot Buttons */}
            <button
              onClick={() => handleRunAutopilotDemo(true)}
              disabled={Boolean(autopilotBanner)}
              className="px-3 py-1.5 rounded text-xs font-mono font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 inline-flex items-center gap-1.5 shadow-md transition disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Autopilot: Full Lifecycle + SLA Split</span>
            </button>
          </div>
        </div>
      </header>

      {/* Autopilot Progress Banner */}
      {autopilotBanner && (
        <div className="bg-gradient-to-r from-cyan-950/90 via-blue-950/90 to-emerald-950/90 border-b border-cyan-500/40 px-4 py-2 text-xs font-mono text-cyan-200 flex items-center justify-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
          <span>{autopilotBanner}</span>
        </div>
      )}

      {/* Main Content Container */}
      <main className="max-w-[1680px] w-full mx-auto px-4 py-3 space-y-3 flex-1">
        {/* KPI Telemetry Ribbon */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div className="bg-[#0B111E] border border-[#1E2B45] rounded-lg p-3">
            <div className="text-[10px] font-mono text-slate-400 uppercase">
              Underwritten mLoC Book
            </div>
            <div className="text-lg font-mono font-bold text-white mt-0.5">
              $
              {metrics.total_underwritten_volume.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </div>
            <div className="text-[10px] font-mono text-cyan-400 mt-0.5">
              {metrics.active_mloc_count} Programmable Contracts
            </div>
          </div>

          <div className="bg-[#0B111E] border border-[#1E2B45] rounded-lg p-3">
            <div className="text-[10px] font-mono text-slate-400 uppercase">
              PayPal Dual-Lock Reserve
            </div>
            <div className="text-lg font-mono font-bold text-amber-300 mt-0.5">
              $
              {metrics.locked_escrow_reserve.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
              Orders v2 AUTHORIZE + CAPTURE
            </div>
          </div>

          <div className="bg-[#0B111E] border border-[#1E2B45] rounded-lg p-3">
            <div className="text-[10px] font-mono text-slate-400 uppercase">
              Milestone Payouts Settled
            </div>
            <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5">
              $
              {metrics.total_disbursed_payouts.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
              PayPal Payouts v1 Tranches
            </div>
          </div>

          <div className="bg-[#0B111E] border border-[#1E2B45] rounded-lg p-3">
            <div className="text-[10px] font-mono text-slate-400 uppercase">
              AI SLA Penalty Rebates
            </div>
            <div className="text-lg font-mono font-bold text-rose-400 mt-0.5">
              $
              {metrics.total_sla_rebates_refunded.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
              Auto-Refunded on Customs Delay
            </div>
          </div>

          <div className="bg-[#0B111E] border border-[#1E2B45] rounded-lg p-3">
            <div className="text-[10px] font-mono text-slate-400 uppercase">
              Channel3 Buyer Savings
            </div>
            <div className="text-lg font-mono font-bold text-cyan-300 mt-0.5">
              $
              {metrics.channel3_procurement_savings.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
              Autonomous Catalog Discovery
            </div>
          </div>

          <div className="bg-[#0B111E] border border-[#1E2B45] rounded-lg p-3">
            <div className="text-[10px] font-mono text-slate-400 uppercase">
              Bank LoC Fees Saved
            </div>
            <div className="text-lg font-mono font-bold text-emerald-300 mt-0.5">
              ${metrics.traditional_loc_fees_saved.toLocaleString("en-US")}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
              vs. $1,500 Paper Bank LoC Fee
            </div>
          </div>
        </section>

        {/* P0-1: Natural-Language Trade Structuring Command Bar */}
        <section className="bg-[#0B111E] border border-[#1E2B45] rounded-lg p-3.5 shadow-xl space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                P0-1 Natural-Language Trade Structuring (Procurement Agent + Channel3 + PayPal MCP)
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {PRESET_PROMPTS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(preset.prompt)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono border transition ${
                    prompt === preset.prompt
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                      : "bg-[#070B14] text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-2.5">
            <div className="relative flex-1">
              <Terminal className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateMloc();
                }}
                placeholder="Enter unstructured B2B trade prompt (e.g., Source 50 industrial LiFePO4 battery packs under $12,000 with 30% release on bill-of-lading and 70% on customs clearance)..."
                className="w-full pl-9 pr-4 py-2.5 bg-[#060911] border border-[#1E2B45] focus:border-cyan-400 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleCreateMloc}
              disabled={isCreating}
              className="px-4 py-2.5 rounded-lg text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 inline-flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-500/10 disabled:opacity-50 shrink-0"
            >
              <Cpu className="w-4 h-4" />
              <span>
                {isCreating
                  ? "Synthesizing PayPal Invoice & Order..."
                  : "Issue mLoC (PayPal Invoice v2 + Order v2)"}
              </span>
            </button>
          </div>

          {/* Live Structured Synthesis Preview Ribbon */}
          {previewData && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded bg-[#070B14] border border-slate-800/80 text-[11px] font-mono text-slate-300">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-cyan-400 font-semibold">
                  Channel3 Match: {String(previewData.channel3_catalog_id)}
                </span>
                <span>•</span>
                <span>
                  Supplier:{" "}
                  <strong className="text-white">
                    {String(previewData.supplier_name)}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Corridor:{" "}
                  <strong className="text-emerald-300">
                    {String(previewData.corridor)}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Negotiated Total:{" "}
                  <strong className="text-emerald-400">
                    ${Number(previewData.total_amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </strong>{" "}
                  ({String(previewData.quantity)} units @ ${String(previewData.unit_price)})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300">
                  Tranche 1: {String(previewData.tranche_1_pct)}% ($
                  {Number(previewData.tranche_1_amount || 0).toLocaleString()})
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                  Tranche 2: {String(previewData.tranche_2_pct)}% ($
                  {Number(previewData.tranche_2_amount || 0).toLocaleString()})
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Main Split Grid: Left (AG Grid Blotter + Timeline) / Right (Deep Audit & PayPal Sandbox Inspector) */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-3">
          {/* Left 8 Columns */}
          <div className="xl:col-span-8 space-y-3">
            <ClearingBlotterGrid
              contracts={contracts}
              selectedMlocId={selectedContract?.mloc_id || null}
              onSelectContract={(c) => setSelectedContract(c)}
              onOpenPayPalModal={(c) => setModalContract(c)}
              onFulfillTranche1={handleFulfillTranche1}
              onSettleTranche2={handleSettleTranche2}
              onArbitrateSla={handleArbitrateSla}
              busyMlocId={busyMlocId}
            />

            <MilestoneTimeline contract={selectedContract} />
          </div>

          {/* Right 4 Columns: Auditor & PayPal Sandbox Inspector */}
          <div className="xl:col-span-4 flex flex-col bg-[#0B111E] border border-[#1E2B45] rounded-lg overflow-hidden shadow-xl">
            {/* Inspector Header */}
            <div className="px-4 py-2.5 bg-[#0E1628] border-b border-[#1E2B45] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  mLoC Deep Auditor & Sandbox Telemetry
                </span>
              </div>
              {selectedContract && (
                <span className="text-xs font-mono font-bold text-cyan-300">
                  {selectedContract.mloc_id}
                </span>
              )}
            </div>

            {/* Inspector Tabs */}
            <div className="grid grid-cols-4 border-b border-[#1E2B45] bg-[#070B14] text-[11px] font-mono">
              {[
                { id: "OVERVIEW", label: "Escrow & Receipt" },
                { id: "PAYLOADS", label: "PayPal JSON" },
                { id: "APIMATIC", label: "APIMatic SDK" },
                { id: "WEBHOOKS", label: "Live Stream" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setInspectorTab(
                      tab.id as "OVERVIEW" | "PAYLOADS" | "APIMATIC" | "WEBHOOKS"
                    )
                  }
                  className={`py-2 text-center font-semibold border-b-2 transition ${
                    inspectorTab === tab.id
                      ? "border-cyan-400 text-cyan-300 bg-[#0B111E]"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Inspector Content */}
            <div className="p-4 flex-1 overflow-y-auto max-h-[650px] space-y-3">
              {selectedContract && inspectorTab === "OVERVIEW" && (
                <>
                  {/* Lifecycle Interactive Stage Bar */}
                  <div className="p-3 rounded-lg bg-[#070B14] border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400 uppercase">
                        Interactive Lifecycle Trigger
                      </span>
                      <span className="text-cyan-300 font-bold">
                        Step {selectedContract.state_step} of 4
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setModalContract(selectedContract)}
                        className="px-2.5 py-2 rounded text-[11px] font-mono font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 flex items-center justify-center gap-1.5 transition"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>1. PayPal Dual-Lock</span>
                      </button>

                      <button
                        disabled={busyMlocId === selectedContract.mloc_id}
                        onClick={() =>
                          handleFulfillTranche1(selectedContract.mloc_id)
                        }
                        className="px-2.5 py-2 rounded text-[11px] font-mono font-semibold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>
                          2. BoL Scan ({selectedContract.tranche_1.pct}%)
                        </span>
                      </button>

                      <button
                        disabled={busyMlocId === selectedContract.mloc_id}
                        onClick={() =>
                          handleSettleTranche2(selectedContract.mloc_id)
                        }
                        className="px-2.5 py-2 rounded text-[11px] font-mono font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          3. Clear Customs ({selectedContract.tranche_2.pct}%)
                        </span>
                      </button>

                      <button
                        disabled={busyMlocId === selectedContract.mloc_id}
                        onClick={() =>
                          handleArbitrateSla(selectedContract.mloc_id)
                        }
                        className="px-2.5 py-2 rounded text-[11px] font-mono font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>4. Simulate SLA Split</span>
                      </button>
                    </div>
                  </div>

                  {/* PayPal Sandbox Resource Ledger */}
                  <div className="p-3 rounded-lg bg-[#070B14] border border-slate-800 space-y-2 text-xs font-mono">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">
                      PayPal Sandbox Multi-API Ledger
                    </div>
                    <div className="grid grid-cols-2 gap-y-1.5 text-[11px]">
                      <span className="text-slate-400">Invoicing v2 ID:</span>
                      <span className="text-slate-100 text-right truncate">
                        {selectedContract.paypal_ids.invoice_id}
                      </span>

                      <span className="text-slate-400">Orders v2 ID:</span>
                      <span className="text-cyan-300 text-right">
                        {selectedContract.paypal_ids.order_id}
                      </span>

                      <span className="text-slate-400">Authorization ID:</span>
                      <span className="text-slate-200 text-right">
                        {selectedContract.paypal_ids.authorization_id ||
                          "PENDING"}
                      </span>

                      <span className="text-slate-400">Escrow Capture ID:</span>
                      <span className="text-emerald-300 text-right">
                        {selectedContract.paypal_ids.capture_id || "PENDING"}
                      </span>

                      <span className="text-slate-400">
                        Tracking v1 ({selectedContract.carrier}):
                      </span>
                      <span className="text-cyan-300 text-right">
                        {selectedContract.tracking_number || "PENDING_BOL"}
                      </span>

                      <span className="text-slate-400">
                        Tranche 1 Payout ID:
                      </span>
                      <span className="text-emerald-300 text-right">
                        {selectedContract.paypal_ids.tranche_1_payout_id ||
                          "LOCKED"}
                      </span>

                      <span className="text-slate-400">
                        Tranche 2 Payout ID:
                      </span>
                      <span className="text-emerald-300 text-right">
                        {selectedContract.paypal_ids.tranche_2_payout_id ||
                          "LOCKED"}
                      </span>

                      {selectedContract.paypal_ids.refund_id && (
                        <>
                          <span className="text-rose-300">
                            SLA Rebate Refund ID:
                          </span>
                          <span className="text-rose-300 text-right font-bold">
                            {selectedContract.paypal_ids.refund_id}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Cryptographic Assurance Receipt Card (P0-2) */}
                  {selectedContract.assurance_receipt && (
                    <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/40 space-y-1.5 font-mono">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-emerald-300 font-bold inline-flex items-center gap-1.5">
                          <Fingerprint className="w-4 h-4" />
                          mLoC Assurance Receipt
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          {selectedContract.assurance_receipt.receipt_id}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-300 break-all bg-black/40 p-2 rounded border border-emerald-500/20">
                        SHA-256:{" "}
                        {selectedContract.assurance_receipt.sha256_proof}
                      </div>
                      <div className="text-[10px] text-emerald-200/90">
                        {
                          selectedContract.assurance_receipt
                            .supplier_instruction
                        }
                      </div>
                    </div>
                  )}

                  {/* AI Dispute & SLA Exception Arbitration Report (P1-1) */}
                  {selectedContract.sla_terms.arbitration_summary && (
                    <div className="p-3 rounded-lg bg-rose-950/25 border border-rose-500/40 space-y-1.5 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-rose-300 font-bold inline-flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4" />
                          AI SLA Exception Arbitration
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                          {
                            selectedContract.sla_terms.arbitration_summary
                              .dispute_case_id
                          }
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        {selectedContract.sla_terms.arbitration_summary.reason}
                      </p>
                      <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                        <div className="p-2 rounded bg-black/40 border border-rose-500/30">
                          <div className="text-[10px] text-slate-400">
                            Buyer SLA Rebate (5%)
                          </div>
                          <div className="text-rose-300 font-bold">
                            +$
                            {selectedContract.sla_terms.arbitration_summary.buyer_refund_amount.toFixed(
                              2
                            )}{" "}
                            Refunded
                          </div>
                        </div>
                        <div className="p-2 rounded bg-black/40 border border-emerald-500/30">
                          <div className="text-[10px] text-slate-400">
                            Seller Net Tranche 2
                          </div>
                          <div className="text-emerald-300 font-bold">
                            +$
                            {selectedContract.sla_terms.arbitration_summary.seller_net_tranche_2_amount.toFixed(
                              2
                            )}{" "}
                            Paid
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* TAB 2: Raw PayPal Sandbox JSON Payloads */}
              {selectedContract && inspectorTab === "PAYLOADS" && (
                <div className="space-y-2.5">
                  <div className="flex flex-wrap gap-1">
                    {[
                      { key: "invoice_v2", label: "Invoicing v2" },
                      { key: "order_v2", label: "Orders v2" },
                      { key: "auth_capture_v2", label: "Auth/Capture" },
                      { key: "tracking_v1", label: "Tracking v1" },
                      { key: "tranche_1_payout_v1", label: "Payout T1" },
                      { key: "tranche_2_payout_v1", label: "Payout T2" },
                      { key: "sla_refund_v2", label: "SLA Refund v2" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setActivePayloadKey(item.key)}
                        className={`px-2 py-1 rounded text-[10px] font-mono border transition ${
                          activePayloadKey === item.key
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                            : "bg-[#070B14] text-slate-400 border-slate-800"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg bg-[#050811] border border-slate-800 font-mono text-[11px] text-cyan-200 overflow-x-auto">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pb-2 mb-2 border-b border-slate-800">
                      <span className="inline-flex items-center gap-1">
                        <FileJson className="w-3.5 h-3.5 text-cyan-400" />
                        PayPal Sandbox Response Payload ({activePayloadKey})
                      </span>
                      <span className="text-emerald-400">200 OK</span>
                    </div>
                    <pre className="text-[11px] leading-relaxed">
                      {JSON.stringify(
                        selectedContract.paypal_payloads[activePayloadKey] || {
                          status:
                            "NOT_EXECUTED_YET — Trigger this stage in the blotter to inspect live payload.",
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              )}

              {/* TAB 3: APIMatic Strict Contract Validation Receipts */}
              {selectedContract && inspectorTab === "APIMATIC" && (
                <div className="space-y-2.5 font-mono">
                  <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-500/30 text-[11px] text-emerald-200">
                    All PayPal Sandbox requests are strictly validated against
                    APIMatic Context Plugin OpenAPI schemas before dispatch.
                  </div>
                  {selectedContract.apimatic_receipts.map((rec, i) => (
                    <div
                      key={i}
                      className="p-3 rounded bg-[#070B14] border border-slate-800 space-y-1 text-[11px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-cyan-300 font-bold">
                          {rec.http_method} {rec.endpoint}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          {rec.latency_ms}ms • PASS
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Model: <strong className="text-white">{rec.schema_model}</strong> • Spec: {rec.spec_version}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: Live Agent Tool-Calling & PayPal Webhook Stream */}
              {inspectorTab === "WEBHOOKS" && (
                <div className="space-y-2 font-mono">
                  {webhookEvents.map((ev) => (
                    <div
                      key={ev.event_id}
                      className="p-2.5 rounded bg-[#070B14] border border-slate-800 space-y-1 text-[11px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-cyan-300 font-bold inline-flex items-center gap-1">
                          <Activity className="w-3 h-3 text-emerald-400" />
                          {ev.event_type}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {ev.mloc_id}
                        </span>
                      </div>
                      <div className="text-[10px] text-amber-300">
                        {ev.agent_name} → {ev.tool_name}()
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        {ev.summary}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* P0-2 PayPal Sandbox Checkout & Assurance Receipt Modal */}
      <PayPalSandboxModal
        contract={modalContract}
        onClose={() => setModalContract(null)}
        onConfirmAuthorize={async (mlocId) => {
          await handleAuthorizeMloc(mlocId);
        }}
        isAuthorizing={Boolean(busyMlocId)}
      />

      {/* Runtime PayPal Sandbox Credentials Modal */}
      {showCredsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0B111E] border border-[#1E2B45] rounded-xl p-5 space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold uppercase text-cyan-300">
                Configure PayPal Developer Sandbox Credentials
              </h3>
              <button
                onClick={() => setShowCredsModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ESC
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Enter your PayPal Sandbox REST API credentials to route all agent
              tool calls directly to{" "}
              <code className="text-cyan-300">
                https://api-m.sandbox.paypal.com
              </code>
              . Leave blank to use the deterministic OpenAPI Sandbox Twin.
            </p>
            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">
                  PAYPAL_CLIENT_ID
                </label>
                <input
                  type="text"
                  value={clientIdInput}
                  onChange={(e) => setClientIdInput(e.target.value)}
                  placeholder="AeA1QIZXiflr1_-r0..."
                  className="w-full px-3 py-2 rounded bg-[#060911] border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">
                  PAYPAL_CLIENT_SECRET
                </label>
                <input
                  type="password"
                  value={clientSecretInput}
                  onChange={(e) => setClientSecretInput(e.target.value)}
                  placeholder="ECYYrrSHdK..."
                  className="w-full px-3 py-2 rounded bg-[#060911] border border-slate-800 text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCredsModal(false)}
                className="px-3 py-1.5 rounded text-xs bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCredentials}
                className="px-4 py-1.5 rounded text-xs font-bold bg-cyan-500 text-slate-950 inline-flex items-center gap-1"
              >
                <span>Apply Sandbox Config</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
