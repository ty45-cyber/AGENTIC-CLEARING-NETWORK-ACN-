import type {
  MLoCContract,
  PayPalStatus,
  PortfolioMetrics,
  WebhookEvent,
} from "@/types/acn";

function isoNow(offsetHours = 0): string {
  return new Date(Date.now() + offsetHours * 3600_000).toISOString();
}

function randHex(len = 8): string {
  let out = "";
  const chars = "0123456789ABCDEF";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export const INITIAL_CONTRACTS: MLoCContract[] = [
  {
    mloc_id: "MLOC-2026-8841A",
    created_at: isoNow(-6),
    updated_at: isoNow(-0.5),
    state: "TRANCHE_1_RELEASED_IN_TRANSIT",
    state_step: 3,
    prompt:
      "Source 50 industrial LiFePO4 battery packs under $12,000 with 30% release on bill-of-lading and 70% on customs clearance",
    channel3_catalog_id: "CH3-BAT-LFP-48V100",
    commodity_name:
      "Industrial LiFePO4 48V 100Ah Rack Battery Pack (UL1973 / UN38.3)",
    hs_code: "8507.60.0020",
    corridor: "CN-SZX -> US-LAX",
    buyer_name: "Apex Autonomous Robotics Inc.",
    buyer_email: "treasury@apex-robotics.io",
    supplier_name: "Shenzhen VoltCore Energy Systems Co., Ltd.",
    supplier_email: "settlements@voltcore-shenzhen.cn",
    carrier: "DHL",
    tracking_number: "DHL-7749201844CN",
    tracking_status: "IN_TRANSIT",
    quantity: 50,
    unit_price: 228.0,
    buyer_budget_cap: 12000.0,
    total_amount: 11400.0,
    savings_vs_cap: 600.0,
    escrow_locked_amount: 7980.0,
    disbursed_amount: 3420.0,
    refunded_rebate_amount: 0.0,
    currency: "USD",
    tranche_1: {
      pct: 30,
      amount: 3420.0,
      status: "RELEASED",
      trigger: "CARRIER_BOL_SCAN (PayPal Tracking v1 = SHIPPED/IN_TRANSIT)",
      payout_batch_id: "PYB3819204918273M",
      released_at: isoNow(-2),
    },
    tranche_2: {
      pct: 70,
      amount: 7980.0,
      status: "LOCKED",
      trigger: "CUSTOMS_CLEARANCE_DELIVERED (PayPal Tracking v1 = DELIVERED)",
      payout_batch_id: null,
      released_at: null,
    },
    sla_terms: {
      window_hours: 120,
      deadline_iso: isoNow(96),
      auth_expiry_iso: isoNow(24 * 28),
      late_penalty_pct: 5.0,
      breach_detected: false,
      arbitration_summary: null,
    },
    risk_telemetry: {
      counterparty_score: 94,
      anomaly_score: 0.06,
      sanctions_screen: "CLEARED",
      sparkline: [14, 15, 13, 12, 11, 12, 10, 9, 11, 8],
      underwriting_verdict: "APPROVED_FOR_INSTANT_MLOC",
    },
    paypal_ids: {
      invoice_id: "INV2-992A-481C-773B-102E",
      order_id: "8MC4920184729104F",
      authorization_id: "4AU9182736450192K",
      capture_id: "2GG8472910384756L",
      tranche_1_payout_id: "PYB3819204918273M",
      tranche_2_payout_id: null,
      refund_id: null,
    },
    assurance_receipt: {
      receipt_id: "MLOC-AR-8841A99F",
      mloc_id: "MLOC-2026-8841A",
      paypal_order_id: "8MC4920184729104F",
      paypal_authorization_id: "4AU9182736450192K",
      paypal_capture_id: "2GG8472910384756L",
      locked_reserve_amount: "11400.00 USD",
      beneficiary_supplier: "settlements@voltcore-shenzhen.cn",
      disbursement_mode: "DELAYED_MILESTONE_GATED",
      sha256_proof:
        "0x9f84b2c1e80a44d19b37e6c5a120f8e4d3c2b1a0987654321fedcba09876540f",
      issued_at: isoNow(-5),
      verification_status: "CRYPTOGRAPHICALLY_ASSURED_DUAL_LOCK",
      supplier_instruction:
        "FUNDS LOCKED IN ACN PAYPAL CLEARING RESERVE. SAFE TO COMMENCE MANUFACTURING & SHIPMENT.",
    },
    paypal_payloads: {
      invoice_v2: {
        id: "INV2-992A-481C-773B-102E",
        status: "SENT",
        amount: { currency_code: "USD", value: "11400.00" },
      },
      order_v2: {
        id: "8MC4920184729104F",
        intent: "AUTHORIZE",
        status: "COMPLETED",
      },
      auth_capture_v2: {
        authorization_id: "4AU9182736450192K",
        capture_id: "2GG8472910384756L",
        status: "COMPLETED",
        disbursement_mode: "DELAYED",
      },
      tracking_v1: {
        transaction_id: "2GG8472910384756L",
        tracking_number: "DHL-7749201844CN",
        status: "IN_TRANSIT",
        carrier: "DHL",
      },
      tranche_1_payout_v1: {
        payout_batch_id: "PYB3819204918273M",
        batch_status: "SUCCESS",
        amount: { currency_code: "USD", value: "3420.00" },
      },
      tranche_2_payout_v1: null,
      sla_refund_v2: null,
    },
    apimatic_receipts: [
      {
        spec_version: "PayPal Orders v2.14 (APIMatic Strict)",
        endpoint: "/v2/checkout/orders/8MC4920184729104F/authorize",
        http_method: "POST",
        schema_model: "AuthorizeAndCaptureReserveRequest",
        strict_validation_passed: true,
        execution_mode: "SANDBOX_DETERMINISTIC_TWIN",
        latency_ms: 48.2,
        request_payload: { order_id: "8MC4920184729104F" },
        response_payload: { capture_id: "2GG8472910384756L" },
        timestamp: isoNow(-5),
      },
    ],
    timeline_milestones: [
      {
        id: "M1",
        name: "Channel3 Discovery & PayPal Invoice/Order v2",
        status: "COMPLETED",
        timestamp: isoNow(-6),
        api: "Invoicing v2 + Orders v2",
      },
      {
        id: "M2",
        name: "Buyer Dual-Lock Authorization & Escrow Capture",
        status: "COMPLETED",
        timestamp: isoNow(-5),
        api: "Orders v2 Authorize/Capture",
      },
      {
        id: "M3",
        name: "Carrier BoL Scan & Tranche 1 Payout (30%)",
        status: "COMPLETED",
        timestamp: isoNow(-2),
        api: "Tracking v1 + Payouts v1",
      },
      {
        id: "M4",
        name: "Customs Clearance / SLA Final Settlement (70%)",
        status: "IN_PROGRESS",
        timestamp: null,
        api: "Tracking v1 + Payouts/Refunds",
      },
    ],
  },
  {
    mloc_id: "MLOC-2026-7729B",
    created_at: isoNow(-12),
    updated_at: isoNow(-1),
    state: "ESCROW_LOCKED_ASSURED",
    state_step: 2,
    prompt:
      "Procure 40 800G OSFP silicon photonics optical transceivers under $19,000 with 40% release on airway bill and 60% on delivery",
    channel3_catalog_id: "CH3-SEMI-H100-OPT",
    commodity_name: "800G OSFP DR8 Silicon Photonics Optical Transceiver Module",
    hs_code: "8517.62.0090",
    corridor: "TW-TPE -> US-SJC",
    buyer_name: "HyperScale Fabric Corp.",
    buyer_email: "ap-escrow@hyperscalefabric.io",
    supplier_name: "Hsinchu OptoSemiconductor Foundry Corp.",
    supplier_email: "escrow-desk@hsinchu-opto.tw",
    carrier: "FEDEX",
    tracking_number: null,
    tracking_status: "AWAITING_CARRIER_SCAN",
    quantity: 40,
    unit_price: 451.25,
    buyer_budget_cap: 19000.0,
    total_amount: 18050.0,
    savings_vs_cap: 950.0,
    escrow_locked_amount: 18050.0,
    disbursed_amount: 0.0,
    refunded_rebate_amount: 0.0,
    currency: "USD",
    tranche_1: {
      pct: 40,
      amount: 7220.0,
      status: "LOCKED",
      trigger: "CARRIER_BOL_SCAN (PayPal Tracking v1 = SHIPPED/IN_TRANSIT)",
      payout_batch_id: null,
      released_at: null,
    },
    tranche_2: {
      pct: 60,
      amount: 10830.0,
      status: "LOCKED",
      trigger: "CUSTOMS_CLEARANCE_DELIVERED (PayPal Tracking v1 = DELIVERED)",
      payout_batch_id: null,
      released_at: null,
    },
    sla_terms: {
      window_hours: 72,
      deadline_iso: isoNow(60),
      auth_expiry_iso: isoNow(24 * 27),
      late_penalty_pct: 5.0,
      breach_detected: false,
      arbitration_summary: null,
    },
    risk_telemetry: {
      counterparty_score: 97,
      anomaly_score: 0.04,
      sanctions_screen: "CLEARED",
      sparkline: [9, 8, 9, 7, 8, 6, 7, 6, 5, 5],
      underwriting_verdict: "APPROVED_FOR_INSTANT_MLOC",
    },
    paypal_ids: {
      invoice_id: "INV2-331F-884D-219A-550C",
      order_id: "8MC7718293049182N",
      authorization_id: "4AU6627182930491P",
      capture_id: "2GG5516273849501Q",
      tranche_1_payout_id: null,
      tranche_2_payout_id: null,
      refund_id: null,
    },
    assurance_receipt: {
      receipt_id: "MLOC-AR-7729B99F",
      mloc_id: "MLOC-2026-7729B",
      paypal_order_id: "8MC7718293049182N",
      paypal_authorization_id: "4AU6627182930491P",
      paypal_capture_id: "2GG5516273849501Q",
      locked_reserve_amount: "18050.00 USD",
      beneficiary_supplier: "escrow-desk@hsinchu-opto.tw",
      disbursement_mode: "DELAYED_MILESTONE_GATED",
      sha256_proof:
        "0x9f84b2c1e80a44d19b37e6c5a120f8e4d3c2b1a0987654321fedcba09876541f",
      issued_at: isoNow(-11),
      verification_status: "CRYPTOGRAPHICALLY_ASSURED_DUAL_LOCK",
      supplier_instruction:
        "FUNDS LOCKED IN ACN PAYPAL CLEARING RESERVE. SAFE TO COMMENCE MANUFACTURING & SHIPMENT.",
    },
    paypal_payloads: {
      invoice_v2: {
        id: "INV2-331F-884D-219A-550C",
        status: "SENT",
        amount: { currency_code: "USD", value: "18050.00" },
      },
      order_v2: {
        id: "8MC7718293049182N",
        intent: "AUTHORIZE",
        status: "COMPLETED",
      },
      auth_capture_v2: {
        authorization_id: "4AU6627182930491P",
        capture_id: "2GG5516273849501Q",
        status: "COMPLETED",
      },
      tracking_v1: null,
      tranche_1_payout_v1: null,
      tranche_2_payout_v1: null,
      sla_refund_v2: null,
    },
    apimatic_receipts: [
      {
        spec_version: "PayPal Orders v2.14 (APIMatic Strict)",
        endpoint: "/v2/checkout/orders/8MC7718293049182N/authorize",
        http_method: "POST",
        schema_model: "AuthorizeAndCaptureReserveRequest",
        strict_validation_passed: true,
        execution_mode: "SANDBOX_DETERMINISTIC_TWIN",
        latency_ms: 44.1,
        request_payload: { order_id: "8MC7718293049182N" },
        response_payload: { capture_id: "2GG5516273849501Q" },
        timestamp: isoNow(-11),
      },
    ],
    timeline_milestones: [
      {
        id: "M1",
        name: "Channel3 Discovery & PayPal Invoice/Order v2",
        status: "COMPLETED",
        timestamp: isoNow(-12),
        api: "Invoicing v2 + Orders v2",
      },
      {
        id: "M2",
        name: "Buyer Dual-Lock Authorization & Escrow Capture",
        status: "COMPLETED",
        timestamp: isoNow(-11),
        api: "Orders v2 Authorize/Capture",
      },
      {
        id: "M3",
        name: "Carrier BoL Scan & Tranche 1 Payout (40%)",
        status: "IN_PROGRESS",
        timestamp: null,
        api: "Tracking v1 + Payouts v1",
      },
      {
        id: "M4",
        name: "Customs Clearance / SLA Final Settlement (60%)",
        status: "PENDING",
        timestamp: null,
        api: "Tracking v1 + Payouts/Refunds",
      },
    ],
  },
  {
    mloc_id: "MLOC-2026-6410C",
    created_at: isoNow(-18),
    updated_at: isoNow(-0.3),
    state: "SLA_ARBITRATED_SPLIT_SETTLED",
    state_step: 4,
    prompt:
      "Order 25 precision harmonic drive servo actuators under $10,000 with 30% on DHL bill-of-lading and 70% on customs clearance",
    channel3_catalog_id: "CH3-CNC-SERVO-AX",
    commodity_name:
      "Precision Harmonic Drive Actuator & Brushless Servo Assembly",
    hs_code: "8501.52.4000",
    corridor: "DE-FRA -> US-ORD",
    buyer_name: "Midwest Automated Fab LLC",
    buyer_email: "treasury@midwestfab.com",
    supplier_name: "Stuttgart Mechatronik GmbH",
    supplier_email: "tradefinance@stuttgart-mechatronik.de",
    carrier: "UPS",
    tracking_number: "1Z999AA10123456784",
    tracking_status: "CUSTOMS_HOLD",
    quantity: 25,
    unit_price: 380.0,
    buyer_budget_cap: 10000.0,
    total_amount: 9500.0,
    savings_vs_cap: 500.0,
    escrow_locked_amount: 0.0,
    disbursed_amount: 9025.0,
    refunded_rebate_amount: 475.0,
    currency: "USD",
    tranche_1: {
      pct: 30,
      amount: 2850.0,
      status: "RELEASED",
      trigger: "CARRIER_BOL_SCAN (PayPal Tracking v1 = SHIPPED/IN_TRANSIT)",
      payout_batch_id: "PYB9918273645102U",
      released_at: isoNow(-6),
    },
    tranche_2: {
      pct: 70,
      amount: 6175.0,
      status: "ARBITRATED_SPLIT",
      trigger: "CUSTOMS_CLEARANCE_DELIVERED (PayPal Tracking v1 = DELIVERED)",
      payout_batch_id: "PYB8827364551920V",
      released_at: isoNow(-0.3),
    },
    sla_terms: {
      window_hours: 96,
      deadline_iso: isoNow(-28),
      auth_expiry_iso: isoNow(24 * 25),
      late_penalty_pct: 5.0,
      breach_detected: true,
      arbitration_summary: {
        dispute_case_id: "PP-D-88412A",
        exception_state: "CUSTOMS_HOLD / DELAYED",
        reason:
          "CUSTOMS_HOLD: O'Hare commercial tariff inspection exceeded 96h SLA window by 28 hours",
        sla_penalty_pct: 5.0,
        buyer_refund_amount: 475.0,
        buyer_refund_id: "9RF7716253440918W",
        seller_net_tranche_2_amount: 6175.0,
        seller_payout_batch_id: "PYB8827364551920V",
        adjudicated_by:
          "ACN Dispute & SLA Exception Arbiter (Claude 3.7 Sonnet)",
        adjudicated_at: isoNow(-0.3),
      },
    },
    risk_telemetry: {
      counterparty_score: 96,
      anomaly_score: 0.06,
      sanctions_screen: "CLEARED",
      sparkline: [11, 10, 12, 16, 21, 19, 15, 12, 10, 9],
      underwriting_verdict: "APPROVED_FOR_INSTANT_MLOC",
    },
    paypal_ids: {
      invoice_id: "INV2-610C-918B-441D-882F",
      order_id: "8MC3192837465019R",
      authorization_id: "4AU2019283746510S",
      capture_id: "2GG1928374650912T",
      tranche_1_payout_id: "PYB9918273645102U",
      tranche_2_payout_id: "PYB8827364551920V",
      refund_id: "9RF7716253440918W",
    },
    assurance_receipt: {
      receipt_id: "MLOC-AR-6410C99F",
      mloc_id: "MLOC-2026-6410C",
      paypal_order_id: "8MC3192837465019R",
      paypal_authorization_id: "4AU2019283746510S",
      paypal_capture_id: "2GG1928374650912T",
      locked_reserve_amount: "9500.00 USD",
      beneficiary_supplier: "tradefinance@stuttgart-mechatronik.de",
      disbursement_mode: "DELAYED_MILESTONE_GATED",
      sha256_proof:
        "0x9f84b2c1e80a44d19b37e6c5a120f8e4d3c2b1a0987654321fedcba09876542f",
      issued_at: isoNow(-17),
      verification_status: "CRYPTOGRAPHICALLY_ASSURED_DUAL_LOCK",
      supplier_instruction:
        "FUNDS LOCKED IN ACN PAYPAL CLEARING RESERVE. SAFE TO COMMENCE MANUFACTURING & SHIPMENT.",
    },
    paypal_payloads: {
      invoice_v2: {
        id: "INV2-610C-918B-441D-882F",
        status: "SENT",
        amount: { currency_code: "USD", value: "9500.00" },
      },
      order_v2: {
        id: "8MC3192837465019R",
        intent: "AUTHORIZE",
        status: "COMPLETED",
      },
      auth_capture_v2: {
        authorization_id: "4AU2019283746510S",
        capture_id: "2GG1928374650912T",
        status: "COMPLETED",
      },
      tracking_v1: {
        transaction_id: "2GG1928374650912T",
        tracking_number: "1Z999AA10123456784",
        status: "CUSTOMS_HOLD",
        carrier: "UPS",
      },
      tranche_1_payout_v1: {
        payout_batch_id: "PYB9918273645102U",
        batch_status: "SUCCESS",
        amount: { currency_code: "USD", value: "2850.00" },
      },
      tranche_2_payout_v1: {
        payout_batch_id: "PYB8827364551920V",
        batch_status: "SUCCESS",
        amount: { currency_code: "USD", value: "6175.00" },
      },
      sla_refund_v2: {
        id: "9RF7716253440918W",
        status: "COMPLETED",
        amount: { currency_code: "USD", value: "475.00" },
      },
    },
    apimatic_receipts: [
      {
        spec_version: "PayPal Captures Refund v2.2 (APIMatic Strict)",
        endpoint: "/v2/payments/captures/2GG1928374650912T/refund",
        http_method: "POST",
        schema_model: "RefundCaptureRequest",
        strict_validation_passed: true,
        execution_mode: "SANDBOX_DETERMINISTIC_TWIN",
        latency_ms: 39.1,
        request_payload: { amount: { currency_code: "USD", value: "475.00" } },
        response_payload: { id: "9RF7716253440918W", status: "COMPLETED" },
        timestamp: isoNow(-0.3),
      },
    ],
    timeline_milestones: [
      {
        id: "M1",
        name: "Channel3 Discovery & PayPal Invoice/Order v2",
        status: "COMPLETED",
        timestamp: isoNow(-18),
        api: "Invoicing v2 + Orders v2",
      },
      {
        id: "M2",
        name: "Buyer Dual-Lock Authorization & Escrow Capture",
        status: "COMPLETED",
        timestamp: isoNow(-17),
        api: "Orders v2 Authorize/Capture",
      },
      {
        id: "M3",
        name: "Carrier BoL Scan & Tranche 1 Payout (30%)",
        status: "COMPLETED",
        timestamp: isoNow(-6),
        api: "Tracking v1 + Payouts v1",
      },
      {
        id: "M4",
        name: "AI SLA Arbitration: 5.0% Buyer Refund + 95% Net Payout",
        status: "ARBITRATED",
        timestamp: isoNow(-0.3),
        api: "Tracking v1 + Payouts/Refunds",
      },
    ],
  },
];

export const INITIAL_WEBHOOKS: WebhookEvent[] = [
  {
    event_id: "WH-88A1029C",
    mloc_id: "MLOC-2026-6410C",
    event_type: "PAYMENT.CAPTURE.REFUNDED",
    agent_name: "Fulfillment & Dispute Arbiter Agent",
    tool_name: "paypal_captures_v2_refund_rebate",
    summary:
      "Refunded $475.00 (5.0% SLA late-delivery rebate) to Buyer via PayPal Refund 9RF7716253440918W.",
    paypal_resource_id: "9RF7716253440918W",
    timestamp: isoNow(-0.3),
    payload: { refund_id: "9RF7716253440918W", amount: "475.00 USD" },
  },
  {
    event_id: "WH-77B2014F",
    mloc_id: "MLOC-2026-8841A",
    event_type: "PAYMENT.PAYOUTS-ITEM.SUCCEEDED",
    agent_name: "Fulfillment Oracle Agent",
    tool_name: "paypal_payouts_v1_release_tranche_1",
    summary:
      "Verified DHL Bill-of-Lading DHL-7749201844CN. Auto-disbursed Tranche 1 (30% = $3,420.00) via PayPal Payout PYB3819204918273M.",
    paypal_resource_id: "PYB3819204918273M",
    timestamp: isoNow(-2),
    payload: { payout_batch_id: "PYB3819204918273M", amount: "3420.00 USD" },
  },
];

export function computeMetrics(contracts: MLoCContract[]): PortfolioMetrics {
  const total_underwritten_volume = contracts.reduce(
    (s, c) => s + c.total_amount,
    0
  );
  const locked_escrow_reserve = contracts.reduce(
    (s, c) => s + c.escrow_locked_amount,
    0
  );
  const total_disbursed_payouts = contracts.reduce(
    (s, c) => s + c.disbursed_amount,
    0
  );
  const total_sla_rebates_refunded = contracts.reduce(
    (s, c) => s + c.refunded_rebate_amount,
    0
  );
  const channel3_procurement_savings = contracts.reduce(
    (s, c) => s + c.savings_vs_cap,
    0
  );
  return {
    active_mloc_count: contracts.length,
    total_underwritten_volume,
    locked_escrow_reserve,
    total_disbursed_payouts,
    total_sla_rebates_refunded,
    channel3_procurement_savings,
    avg_counterparty_score: 95.3,
    traditional_loc_fees_saved: contracts.length * 1500,
  };
}

export function parsePromptFallback(prompt: string): Record<string, unknown> {
  const lower = prompt.toLowerCase();
  const isOpto =
    lower.includes("transceiver") ||
    lower.includes("800g") ||
    lower.includes("optical");
  const isServo =
    lower.includes("servo") ||
    lower.includes("actuator") ||
    lower.includes("robotics");
  const isGpu =
    lower.includes("inference") ||
    lower.includes("cluster") ||
    lower.includes("gpu");

  const qtyMatch = prompt.match(/\b(\d{1,4})\b/);
  const qty = qtyMatch ? Math.max(1, parseInt(qtyMatch[1], 10)) : 50;

  const budgetMatch = prompt.match(/\$\s*([\d,]+)/);
  const rawBudget = budgetMatch
    ? parseFloat(budgetMatch[1].replace(/,/g, ""))
    : 12000;
  const totalAmount = Math.round(rawBudget * 0.95);
  const unitPrice = Number((totalAmount / qty).toFixed(2));

  const pctMatches = Array.from(prompt.matchAll(/(\d{1,2})\s*%/g)).map((m) =>
    parseInt(m[1], 10)
  );
  const t1Pct =
    pctMatches.length >= 2 && pctMatches[0] + pctMatches[1] === 100
      ? pctMatches[0]
      : 30;
  const t2Pct = 100 - t1Pct;
  const t1Amt = Number(((totalAmount * t1Pct) / 100).toFixed(2));
  const t2Amt = Number((totalAmount - t1Amt).toFixed(2));

  return {
    channel3_catalog_id: isOpto
      ? "CH3-SEMI-H100-OPT"
      : isServo
      ? "CH3-CNC-SERVO-AX"
      : isGpu
      ? "CH3-API-INF-CLUSTER"
      : "CH3-BAT-LFP-48V100",
    commodity_name: isOpto
      ? "800G OSFP DR8 Silicon Photonics Optical Transceiver Module"
      : isServo
      ? "Precision Harmonic Drive Actuator & Brushless Servo Assembly"
      : isGpu
      ? "Dedicated Low-Latency B2B AI Inference Cluster SLA Reservation"
      : "Industrial LiFePO4 48V 100Ah Rack Battery Pack (UL1973 / UN38.3)",
    supplier_name: isOpto
      ? "Hsinchu OptoSemiconductor Foundry Corp."
      : isServo
      ? "Stuttgart Mechatronik GmbH"
      : isGpu
      ? "NordicCompute Sovereign Cloud AB"
      : "Shenzhen VoltCore Energy Systems Co., Ltd.",
    supplier_email: isOpto
      ? "escrow-desk@hsinchu-opto.tw"
      : isServo
      ? "tradefinance@stuttgart-mechatronik.de"
      : isGpu
      ? "billing-clearing@nordiccompute.se"
      : "settlements@voltcore-shenzhen.cn",
    corridor: isOpto
      ? "TW-TPE -> US-SJC"
      : isServo
      ? "DE-FRA -> US-ORD"
      : isGpu
      ? "SE-ARN -> US-IAD"
      : "CN-SZX -> US-LAX",
    carrier: isOpto ? "FEDEX" : isServo ? "UPS" : "DHL",
    quantity: qty,
    unit_price: unitPrice,
    buyer_budget_cap: rawBudget,
    total_amount: totalAmount,
    savings_vs_cap: Math.max(0, rawBudget - totalAmount),
    tranche_1_pct: t1Pct,
    tranche_1_amount: t1Amt,
    tranche_2_pct: t2Pct,
    tranche_2_amount: t2Amt,
  };
}

export function createContractFallback(prompt: string): MLoCContract {
  const p = parsePromptFallback(prompt);
  const mlocId = `MLOC-2026-${randHex(5)}`;
  const invId = `INV2-${randHex(4)}-${randHex(4)}-${randHex(4)}`;
  const ordId = `8MC${randHex(14)}`;
  const now = isoNow();

  return {
    mloc_id: mlocId,
    created_at: now,
    updated_at: now,
    state: "AWAITING_BUYER_DUAL_LOCK",
    state_step: 1,
    prompt,
    channel3_catalog_id: String(p.channel3_catalog_id),
    commodity_name: String(p.commodity_name),
    hs_code: "8507.60.0020",
    corridor: String(p.corridor),
    buyer_name: "Apex Autonomous Robotics Inc.",
    buyer_email: "treasury@apex-robotics.io",
    supplier_name: String(p.supplier_name),
    supplier_email: String(p.supplier_email),
    carrier: String(p.carrier),
    tracking_number: null,
    tracking_status: "PENDING_BOL",
    quantity: Number(p.quantity),
    unit_price: Number(p.unit_price),
    buyer_budget_cap: Number(p.buyer_budget_cap),
    total_amount: Number(p.total_amount),
    savings_vs_cap: Number(p.savings_vs_cap),
    escrow_locked_amount: 0,
    disbursed_amount: 0,
    refunded_rebate_amount: 0,
    currency: "USD",
    tranche_1: {
      pct: Number(p.tranche_1_pct),
      amount: Number(p.tranche_1_amount),
      status: "LOCKED",
      trigger: "CARRIER_BOL_SCAN (PayPal Tracking v1 = SHIPPED/IN_TRANSIT)",
      payout_batch_id: null,
      released_at: null,
    },
    tranche_2: {
      pct: Number(p.tranche_2_pct),
      amount: Number(p.tranche_2_amount),
      status: "LOCKED",
      trigger: "CUSTOMS_CLEARANCE_DELIVERED (PayPal Tracking v1 = DELIVERED)",
      payout_batch_id: null,
      released_at: null,
    },
    sla_terms: {
      window_hours: 120,
      deadline_iso: isoNow(120),
      auth_expiry_iso: isoNow(24 * 29),
      late_penalty_pct: 5.0,
      breach_detected: false,
      arbitration_summary: null,
    },
    risk_telemetry: {
      counterparty_score: 95,
      anomaly_score: 0.05,
      sanctions_screen: "CLEARED",
      sparkline: [14, 13, 12, 11, 12, 10, 9, 9, 8, 7],
      underwriting_verdict: "APPROVED_FOR_INSTANT_MLOC",
    },
    paypal_ids: {
      invoice_id: invId,
      order_id: ordId,
      authorization_id: null,
      capture_id: null,
      tranche_1_payout_id: null,
      tranche_2_payout_id: null,
      refund_id: null,
    },
    assurance_receipt: null,
    paypal_payloads: {
      invoice_v2: {
        id: invId,
        status: "SENT",
        amount: {
          currency_code: "USD",
          value: Number(p.total_amount).toFixed(2),
        },
      },
      order_v2: {
        id: ordId,
        intent: "AUTHORIZE",
        status: "CREATED",
      },
      auth_capture_v2: null,
      tracking_v1: null,
      tranche_1_payout_v1: null,
      tranche_2_payout_v1: null,
      sla_refund_v2: null,
    },
    apimatic_receipts: [
      {
        spec_version: "PayPal Invoicing v2.1 (APIMatic Strict)",
        endpoint: "/v2/invoicing/invoices",
        http_method: "POST",
        schema_model: "CreateInvoiceRequest",
        strict_validation_passed: true,
        execution_mode: "SANDBOX_DETERMINISTIC_TWIN",
        latency_ms: 41.8,
        request_payload: { invoice_id: invId },
        response_payload: { status: "SENT" },
        timestamp: now,
      },
      {
        spec_version: "PayPal Orders v2.14 (APIMatic Strict)",
        endpoint: "/v2/checkout/orders",
        http_method: "POST",
        schema_model: "CreateOrderRequest",
        strict_validation_passed: true,
        execution_mode: "SANDBOX_DETERMINISTIC_TWIN",
        latency_ms: 38.4,
        request_payload: { order_id: ordId, intent: "AUTHORIZE" },
        response_payload: { status: "CREATED" },
        timestamp: now,
      },
    ],
    timeline_milestones: [
      {
        id: "M1",
        name: "Channel3 Discovery & PayPal Invoice/Order v2",
        status: "COMPLETED",
        timestamp: now,
        api: "Invoicing v2 + Orders v2",
      },
      {
        id: "M2",
        name: "Buyer Dual-Lock Authorization & Escrow Capture",
        status: "IN_PROGRESS",
        timestamp: null,
        api: "Orders v2 Authorize/Capture",
      },
      {
        id: "M3",
        name: `Carrier BoL Scan & Tranche 1 Payout (${p.tranche_1_pct}%)`,
        status: "PENDING",
        timestamp: null,
        api: "Tracking v1 + Payouts v1",
      },
      {
        id: "M4",
        name: `Customs Clearance / SLA Final Settlement (${p.tranche_2_pct}%)`,
        status: "PENDING",
        timestamp: null,
        api: "Tracking v1 + Payouts/Refunds",
      },
    ],
  };
}

export function advanceContractFallback(
  contract: MLoCContract,
  stage: "AUTHORIZE" | "TRANCHE_1" | "TRANCHE_2" | "ARBITRATE"
): MLoCContract {
  const now = isoNow();
  const c: MLoCContract = JSON.parse(JSON.stringify(contract));

  if (stage === "AUTHORIZE") {
    const authId = `4AU${randHex(14)}`;
    const capId = `2GG${randHex(14)}`;
    c.state = "ESCROW_LOCKED_ASSURED";
    c.state_step = 2;
    c.updated_at = now;
    c.escrow_locked_amount = c.total_amount;
    c.paypal_ids.authorization_id = authId;
    c.paypal_ids.capture_id = capId;
    c.assurance_receipt = {
      receipt_id: `MLOC-AR-${randHex(8)}`,
      mloc_id: c.mloc_id,
      paypal_order_id: c.paypal_ids.order_id,
      paypal_authorization_id: authId,
      paypal_capture_id: capId,
      locked_reserve_amount: `${c.total_amount.toFixed(2)} USD`,
      beneficiary_supplier: c.supplier_email,
      disbursement_mode: "DELAYED_MILESTONE_GATED",
      sha256_proof: `0x${randHex(32).toLowerCase()}${randHex(32).toLowerCase()}`,
      issued_at: now,
      verification_status: "CRYPTOGRAPHICALLY_ASSURED_DUAL_LOCK",
      supplier_instruction:
        "FUNDS LOCKED IN ACN PAYPAL CLEARING RESERVE. SAFE TO COMMENCE MANUFACTURING & SHIPMENT.",
    };
    c.paypal_payloads.auth_capture_v2 = {
      authorization_id: authId,
      capture_id: capId,
      status: "COMPLETED",
      disbursement_mode: "DELAYED",
    };
    c.timeline_milestones[1].status = "COMPLETED";
    c.timeline_milestones[1].timestamp = now;
    c.timeline_milestones[2].status = "IN_PROGRESS";
  } else if (stage === "TRANCHE_1") {
    if (!c.paypal_ids.capture_id) {
      return advanceContractFallback(
        advanceContractFallback(c, "AUTHORIZE"),
        "TRANCHE_1"
      );
    }
    const trk = `${c.carrier}-${randHex(10)}`;
    const pyb = `PYB${randHex(14)}`;
    c.tracking_number = trk;
    c.tracking_status = "IN_TRANSIT";
    c.state = "TRANCHE_1_RELEASED_IN_TRANSIT";
    c.state_step = 3;
    c.updated_at = now;
    c.disbursed_amount = c.tranche_1.amount;
    c.escrow_locked_amount = Number(
      (c.total_amount - c.tranche_1.amount).toFixed(2)
    );
    c.tranche_1.status = "RELEASED";
    c.tranche_1.payout_batch_id = pyb;
    c.tranche_1.released_at = now;
    c.paypal_ids.tranche_1_payout_id = pyb;
    c.paypal_payloads.tracking_v1 = {
      transaction_id: c.paypal_ids.capture_id,
      tracking_number: trk,
      status: "IN_TRANSIT",
      carrier: c.carrier,
    };
    c.paypal_payloads.tranche_1_payout_v1 = {
      payout_batch_id: pyb,
      batch_status: "SUCCESS",
      amount: { currency_code: "USD", value: c.tranche_1.amount.toFixed(2) },
    };
    c.timeline_milestones[2].status = "COMPLETED";
    c.timeline_milestones[2].timestamp = now;
    c.timeline_milestones[3].status = "IN_PROGRESS";
  } else if (stage === "TRANCHE_2") {
    const base =
      c.tranche_1.status !== "RELEASED"
        ? advanceContractFallback(c, "TRANCHE_1")
        : c;
    const pyb2 = `PYB${randHex(14)}`;
    base.tracking_status = "DELIVERED";
    base.state = "SETTLED_COMPLIANT";
    base.state_step = 4;
    base.updated_at = now;
    base.disbursed_amount = base.total_amount;
    base.escrow_locked_amount = 0;
    base.tranche_2.status = "RELEASED";
    base.tranche_2.payout_batch_id = pyb2;
    base.tranche_2.released_at = now;
    base.paypal_ids.tranche_2_payout_id = pyb2;
    base.paypal_payloads.tranche_2_payout_v1 = {
      payout_batch_id: pyb2,
      batch_status: "SUCCESS",
      amount: { currency_code: "USD", value: base.tranche_2.amount.toFixed(2) },
    };
    base.timeline_milestones[3].status = "COMPLETED";
    base.timeline_milestones[3].timestamp = now;
    return base;
  } else if (stage === "ARBITRATE") {
    const base =
      c.tranche_1.status !== "RELEASED"
        ? advanceContractFallback(c, "TRANCHE_1")
        : c;
    const rebate = Number((base.total_amount * 0.05).toFixed(2));
    const netT2 = Number((base.tranche_2.amount - rebate).toFixed(2));
    const refId = `9RF${randHex(14)}`;
    const pyb2 = `PYB${randHex(14)}`;
    base.tracking_status = "CUSTOMS_HOLD";
    base.state = "SLA_ARBITRATED_SPLIT_SETTLED";
    base.state_step = 4;
    base.updated_at = now;
    base.refunded_rebate_amount = rebate;
    base.disbursed_amount = Number((base.tranche_1.amount + netT2).toFixed(2));
    base.escrow_locked_amount = 0;
    base.tranche_2.status = "ARBITRATED_SPLIT";
    base.tranche_2.amount = netT2;
    base.tranche_2.payout_batch_id = pyb2;
    base.tranche_2.released_at = now;
    base.paypal_ids.refund_id = refId;
    base.paypal_ids.tranche_2_payout_id = pyb2;
    base.sla_terms.breach_detected = true;
    base.sla_terms.arbitration_summary = {
      dispute_case_id: `PP-D-${randHex(6)}`,
      exception_state: "CUSTOMS_HOLD / DELAYED",
      reason:
        "CUSTOMS_HOLD: Port of Long Beach congestion exceeded 120h SLA window by 38 hours",
      sla_penalty_pct: 5.0,
      buyer_refund_amount: rebate,
      buyer_refund_id: refId,
      seller_net_tranche_2_amount: netT2,
      seller_payout_batch_id: pyb2,
      adjudicated_by: "ACN Dispute & SLA Exception Arbiter (Claude 3.7 Sonnet)",
      adjudicated_at: now,
    };
    base.paypal_payloads.sla_refund_v2 = {
      id: refId,
      status: "COMPLETED",
      amount: { currency_code: "USD", value: rebate.toFixed(2) },
    };
    base.paypal_payloads.tranche_2_payout_v1 = {
      payout_batch_id: pyb2,
      batch_status: "SUCCESS",
      amount: { currency_code: "USD", value: netT2.toFixed(2) },
    };
    base.timeline_milestones[3].name =
      "AI SLA Arbitration: 5.0% Buyer Refund + 95% Net Payout";
    base.timeline_milestones[3].status = "ARBITRATED";
    base.timeline_milestones[3].timestamp = now;
    return base;
  }

  return c;
}
