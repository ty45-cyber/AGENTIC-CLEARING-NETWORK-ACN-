"use client";

import React, { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
  Filter,
  Search,
} from "lucide-react";
import type { MLoCContract } from "@/types/acn";

interface ClearingBlotterGridProps {
  contracts: MLoCContract[];
  selectedMlocId: string | null;
  onSelectContract: (contract: MLoCContract) => void;
  onOpenPayPalModal: (contract: MLoCContract) => void;
  onFulfillTranche1: (mlocId: string) => void;
  onSettleTranche2: (mlocId: string) => void;
  onArbitrateSla: (mlocId: string) => void;
  busyMlocId: string | null;
}

function StateBadgeRenderer(params: ICellRendererParams<MLoCContract>) {
  const c = params.data;
  if (!c) return null;

  const map: Record<
    MLoCContract["state"],
    { label: string; cls: string; icon: React.ReactNode }
  > = {
    AWAITING_BUYER_DUAL_LOCK: {
      label: "1/4 AWAITING DUAL-LOCK",
      cls: "bg-amber-500/15 text-amber-300 border-amber-500/40",
      icon: <Lock className="w-3 h-3" />,
    },
    ESCROW_LOCKED_ASSURED: {
      label: "2/4 RESERVE ASSURED",
      cls: "bg-cyan-500/15 text-cyan-300 border-cyan-500/40",
      icon: <ShieldCheck className="w-3 h-3" />,
    },
    TRANCHE_1_RELEASED_IN_TRANSIT: {
      label: `3/4 TRANCHE 1 (${c.tranche_1.pct}%) PAID`,
      cls: "bg-blue-500/15 text-blue-300 border-blue-500/40",
      icon: <Truck className="w-3 h-3" />,
    },
    SETTLED_COMPLIANT: {
      label: "4/4 SETTLED 100%",
      cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    SLA_ARBITRATED_SPLIT_SETTLED: {
      label: "4/4 SLA SPLIT ARBITRATED",
      cls: "bg-rose-500/15 text-rose-300 border-rose-500/40",
      icon: <AlertTriangle className="w-3 h-3" />,
    },
  };

  const badge = map[c.state] || map.AWAITING_BUYER_DUAL_LOCK;

  return (
    <div className="flex items-center h-full">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold border ${badge.cls}`}
      >
        {badge.icon}
        {badge.label}
      </span>
    </div>
  );
}

function RiskSparklineRenderer(params: ICellRendererParams<MLoCContract>) {
  const c = params.data;
  if (!c) return null;
  const pts = c.risk_telemetry?.sparkline || [10, 10, 10];
  const score = c.risk_telemetry?.counterparty_score ?? 95;
  const max = Math.max(...pts, 25);
  const min = Math.min(...pts, 0);
  const width = 68;
  const height = 22;

  const polyline = pts
    .map((val, i) => {
      const x = (i / Math.max(1, pts.length - 1)) * width;
      const y = height - ((val - min) / Math.max(1, max - min)) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const isBreach = c.sla_terms?.breach_detected;
  const strokeColor = isBreach ? "#fb7185" : "#34d399";

  return (
    <div className="flex items-center gap-2.5 h-full">
      <div className="flex flex-col leading-tight">
        <span
          className={`font-mono text-xs font-bold ${
            score >= 95
              ? "text-emerald-400"
              : score >= 90
              ? "text-cyan-400"
              : "text-amber-400"
          }`}
        >
          {score}/100
        </span>
        <span className="text-[10px] text-slate-400 font-mono">ELASTIC OK</span>
      </div>
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.75"
          points={polyline}
        />
      </svg>
    </div>
  );
}

function TrancheSplitRenderer(params: ICellRendererParams<MLoCContract>) {
  const c = params.data;
  if (!c) return null;

  const t1Released = c.tranche_1.status === "RELEASED";
  const t2Released = c.tranche_2.status === "RELEASED";
  const t2Arbitrated = c.tranche_2.status === "ARBITRATED_SPLIT";

  return (
    <div className="flex flex-col justify-center h-full py-1 gap-1">
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-200 font-semibold">
          ${c.total_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
        <span className="text-slate-400 text-[10px]">
          T1:{c.tranche_1.pct}% | T2:{c.tranche_2.pct}%
        </span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
        <div
          style={{ width: `${c.tranche_1.pct}%` }}
          className={`h-full transition-all ${
            t1Released ? "bg-emerald-400" : "bg-cyan-500/40"
          }`}
          title={`Tranche 1 (${c.tranche_1.pct}%): $${c.tranche_1.amount}`}
        />
        <div
          style={{ width: `${c.tranche_2.pct}%` }}
          className={`h-full transition-all ${
            t2Released
              ? "bg-emerald-400"
              : t2Arbitrated
              ? "bg-rose-400"
              : "bg-slate-700"
          }`}
          title={`Tranche 2 (${c.tranche_2.pct}%): $${c.tranche_2.amount}`}
        />
      </div>
    </div>
  );
}

function PayPalIdsRenderer(params: ICellRendererParams<MLoCContract>) {
  const c = params.data;
  if (!c) return null;
  return (
    <div className="flex flex-col justify-center h-full font-mono text-[11px] leading-tight">
      <div className="flex items-center gap-1.5 text-cyan-300">
        <span className="text-slate-500">ORD:</span>
        <span>{c.paypal_ids.order_id}</span>
      </div>
      <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
        <span className="text-slate-500">INV:</span>
        <span>{c.paypal_ids.invoice_id.slice(0, 14)}</span>
      </div>
    </div>
  );
}

export default function ClearingBlotterGrid({
  contracts,
  selectedMlocId,
  onSelectContract,
  onOpenPayPalModal,
  onFulfillTranche1,
  onSettleTranche2,
  onArbitrateSla,
  busyMlocId,
}: ClearingBlotterGridProps) {
  const [quickFilter, setQuickFilter] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("ALL");

  const filteredContracts = useMemo(() => {
    if (stateFilter === "ALL") return contracts;
    return contracts.filter((c) => c.state === stateFilter);
  }, [contracts, stateFilter]);

  const columnDefs = useMemo<ColDef<MLoCContract>[]>(
    () => [
      {
        headerName: "mLoC ID & Corridor",
        field: "mloc_id",
        minWidth: 175,
        flex: 1.1,
        cellRenderer: (params: ICellRendererParams<MLoCContract>) => {
          const c = params.data;
          if (!c) return null;
          const isSelected = c.mloc_id === selectedMlocId;
          return (
            <div className="flex flex-col justify-center h-full leading-tight">
              <div className="flex items-center gap-1.5">
                <span
                  className={`font-mono text-xs font-bold ${
                    isSelected ? "text-cyan-300" : "text-white"
                  }`}
                >
                  {c.mloc_id}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded border border-slate-700">
                  {c.corridor}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 truncate">
                {c.commodity_name}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Counterparty / Supplier",
        field: "supplier_name",
        minWidth: 185,
        flex: 1.1,
        cellRenderer: (params: ICellRendererParams<MLoCContract>) => {
          const c = params.data;
          if (!c) return null;
          return (
            <div className="flex flex-col justify-center h-full leading-tight">
              <span className="text-xs text-slate-200 font-medium truncate">
                {c.supplier_name}
              </span>
              <span className="text-[10px] font-mono text-slate-400 truncate">
                {c.carrier} {c.tracking_number ? `• ${c.tracking_number}` : "• Awaiting BoL"}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Escrow State Machine",
        field: "state",
        minWidth: 195,
        flex: 1.15,
        cellRenderer: StateBadgeRenderer,
      },
      {
        headerName: "Notional & Tranche Split",
        field: "total_amount",
        minWidth: 175,
        flex: 1,
        cellRenderer: TrancheSplitRenderer,
      },
      {
        headerName: "Risk & Velocity",
        field: "risk_telemetry.counterparty_score",
        minWidth: 145,
        flex: 0.85,
        cellRenderer: RiskSparklineRenderer,
      },
      {
        headerName: "PayPal Sandbox Refs",
        field: "paypal_ids.order_id",
        minWidth: 165,
        flex: 0.95,
        cellRenderer: PayPalIdsRenderer,
      },
      {
        headerName: "Autonomous Execution Controls",
        colId: "actions",
        minWidth: 245,
        flex: 1.35,
        sortable: false,
        filter: false,
        cellRenderer: (params: ICellRendererParams<MLoCContract>) => {
          const c = params.data;
          if (!c) return null;
          const isBusy = busyMlocId === c.mloc_id;

          return (
            <div
              className="flex items-center gap-1.5 h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {c.state === "AWAITING_BUYER_DUAL_LOCK" && (
                <button
                  disabled={isBusy}
                  onClick={() => onOpenPayPalModal(c)}
                  className="px-2.5 py-1 rounded text-[11px] font-mono font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-sm disabled:opacity-50"
                >
                  {isBusy ? "Locking..." : "PayPal Dual-Lock"}
                </button>
              )}

              {c.state === "ESCROW_LOCKED_ASSURED" && (
                <button
                  disabled={isBusy}
                  onClick={() => onFulfillTranche1(c.mloc_id)}
                  className="px-2.5 py-1 rounded text-[11px] font-mono font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-sm disabled:opacity-50"
                >
                  {isBusy ? "Scanning..." : `BoL Scan -> ${c.tranche_1.pct}%`}
                </button>
              )}

              {c.state === "TRANCHE_1_RELEASED_IN_TRANSIT" && (
                <>
                  <button
                    disabled={isBusy}
                    onClick={() => onSettleTranche2(c.mloc_id)}
                    className="px-2 py-1 rounded text-[11px] font-mono font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition disabled:opacity-50"
                    title="Verify Customs Clearance & Release Tranche 2"
                  >
                    {isBusy ? "..." : `Clear -> ${c.tranche_2.pct}%`}
                  </button>
                  <button
                    disabled={isBusy}
                    onClick={() => onArbitrateSla(c.mloc_id)}
                    className="px-2 py-1 rounded text-[11px] font-mono font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition disabled:opacity-50"
                    title="Simulate Customs Hold / SLA Breach & Run AI Dispute Split"
                  >
                    SLA Breach
                  </button>
                </>
              )}

              {(c.state === "SETTLED_COMPLIANT" ||
                c.state === "SLA_ARBITRATED_SPLIT_SETTLED") && (
                <button
                  onClick={() => onSelectContract(c)}
                  className="px-2.5 py-1 rounded text-[11px] font-mono text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 inline-flex items-center gap-1"
                >
                  <span>Audit Receipt</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [
      selectedMlocId,
      busyMlocId,
      onOpenPayPalModal,
      onFulfillTranche1,
      onSettleTranche2,
      onArbitrateSla,
      onSelectContract,
    ]
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      resizable: true,
      filter: true,
    }),
    []
  );

  return (
    <div className="flex flex-col bg-[#0B111E] border border-[#1E2B45] rounded-lg overflow-hidden shadow-xl">
      {/* Blotter Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#0E1628] border-b border-[#1E2B45]">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-100">
            AG Grid Institutional Clearing Blotter (Live Escrow Book)
          </h2>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            {filteredContracts.length} Active Contracts
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* State Filter Pills */}
          <div className="flex items-center gap-1 bg-[#070B14] p-0.5 rounded border border-[#1E2B45] text-[11px] font-mono">
            <Filter className="w-3 h-3 text-slate-400 ml-1.5 mr-0.5" />
            {[
              { id: "ALL", label: "ALL" },
              { id: "AWAITING_BUYER_DUAL_LOCK", label: "DUAL-LOCK" },
              { id: "ESCROW_LOCKED_ASSURED", label: "ASSURED" },
              { id: "TRANCHE_1_RELEASED_IN_TRANSIT", label: "IN-TRANSIT" },
              { id: "SLA_ARBITRATED_SPLIT_SETTLED", label: "ARBITRATED" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStateFilter(tab.id)}
                className={`px-2 py-0.5 rounded transition ${
                  stateFilter === tab.id
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={quickFilter}
              onChange={(e) => setQuickFilter(e.target.value)}
              placeholder="Filter corridor, PayPal ID, supplier..."
              className="pl-8 pr-3 py-1 bg-[#070B14] border border-[#1E2B45] rounded text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-56"
            />
          </div>
        </div>
      </div>

      {/* AG Grid Viewport */}
      <div className="ag-theme-quartz-dark w-full" style={{ height: 320 }}>
        <AgGridReact<MLoCContract>
          rowData={filteredContracts}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          quickFilterText={quickFilter}
          rowHeight={54}
          headerHeight={36}
          animateRows={true}
          rowSelection="single"
          onRowClicked={(e) => {
            if (e.data) onSelectContract(e.data);
          }}
          getRowId={(params) => params.data.mloc_id}
        />
      </div>
    </div>
  );
}
