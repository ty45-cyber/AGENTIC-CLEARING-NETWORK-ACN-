export interface TrancheInfo {
  pct: number;
  amount: number;
  status: "LOCKED" | "RELEASED" | "ARBITRATED_SPLIT";
  trigger: string;
  payout_batch_id: string | null;
  released_at: string | null;
}

export interface ArbitrationSummary {
  dispute_case_id: string;
  exception_state: string;
  reason: string;
  sla_penalty_pct: number;
  buyer_refund_amount: number;
  buyer_refund_id: string;
  seller_net_tranche_2_amount: number;
  seller_payout_batch_id: string;
  adjudicated_by: string;
  adjudicated_at: string;
}

export interface SLATerms {
  window_hours: number;
  deadline_iso: string;
  auth_expiry_iso: string;
  late_penalty_pct: number;
  breach_detected: boolean;
  arbitration_summary: ArbitrationSummary | null;
}

export interface RiskTelemetry {
  counterparty_score: number;
  anomaly_score: number;
  sanctions_screen: string;
  sparkline: number[];
  underwriting_verdict: string;
}

export interface PayPalIds {
  invoice_id: string;
  order_id: string;
  authorization_id: string | null;
  capture_id: string | null;
  tranche_1_payout_id: string | null;
  tranche_2_payout_id: string | null;
  refund_id: string | null;
}

export interface AssuranceReceipt {
  receipt_id: string;
  mloc_id: string;
  paypal_order_id: string;
  paypal_authorization_id: string;
  paypal_capture_id: string;
  locked_reserve_amount: string;
  beneficiary_supplier: string;
  disbursement_mode: string;
  sha256_proof: string;
  issued_at: string;
  verification_status: string;
  supplier_instruction: string;
}

export interface APIMaticReceipt {
  spec_version: string;
  endpoint: string;
  http_method: string;
  schema_model: string;
  strict_validation_passed: boolean;
  execution_mode: string;
  latency_ms: number;
  request_payload: Record<string, unknown>;
  response_payload: Record<string, unknown>;
  timestamp: string;
}

export interface TimelineMilestone {
  id: string;
  name: string;
  status: "COMPLETED" | "IN_PROGRESS" | "PENDING" | "ARBITRATED";
  timestamp: string | null;
  api: string;
}

export interface MLoCContract {
  mloc_id: string;
  created_at: string;
  updated_at: string;
  state:
    | "AWAITING_BUYER_DUAL_LOCK"
    | "ESCROW_LOCKED_ASSURED"
    | "TRANCHE_1_RELEASED_IN_TRANSIT"
    | "SETTLED_COMPLIANT"
    | "SLA_ARBITRATED_SPLIT_SETTLED";
  state_step: number;
  prompt: string;
  channel3_catalog_id: string;
  commodity_name: string;
  hs_code: string;
  corridor: string;
  buyer_name: string;
  buyer_email: string;
  supplier_name: string;
  supplier_email: string;
  carrier: string;
  tracking_number: string | null;
  tracking_status: string;
  quantity: number;
  unit_price: number;
  buyer_budget_cap: number;
  total_amount: number;
  savings_vs_cap: number;
  escrow_locked_amount: number;
  disbursed_amount: number;
  refunded_rebate_amount: number;
  currency: string;
  tranche_1: TrancheInfo;
  tranche_2: TrancheInfo;
  sla_terms: SLATerms;
  risk_telemetry: RiskTelemetry;
  paypal_ids: PayPalIds;
  assurance_receipt: AssuranceReceipt | null;
  paypal_payloads: Record<string, unknown>;
  apimatic_receipts: APIMaticReceipt[];
  timeline_milestones: TimelineMilestone[];
}

export interface PortfolioMetrics {
  active_mloc_count: number;
  total_underwritten_volume: number;
  locked_escrow_reserve: number;
  total_disbursed_payouts: number;
  total_sla_rebates_refunded: number;
  channel3_procurement_savings: number;
  avg_counterparty_score: number;
  traditional_loc_fees_saved: number;
}

export interface WebhookEvent {
  event_id: string;
  mloc_id: string;
  event_type: string;
  agent_name: string;
  tool_name: string;
  summary: string;
  paypal_resource_id: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

export interface PayPalStatus {
  mode: "LIVE_PAYPAL_SANDBOX" | "SANDBOX_DETERMINISTIC_TWIN";
  base_url: string;
  client_id_configured: boolean;
  client_id_preview: string;
  apimatic_sdk_version: string;
  validated_calls_count: number;
}
