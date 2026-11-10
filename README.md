# Agentic Clearing Network (ACN) — Autonomous Micro-Letter-of-Credit & B2B Escrow Engine

> **Core Value Proposition:** An AI-native clearing house that replaces paper-heavy trade finance ($500–$2,500 bank Letters of Credit) with programmable **Micro-Letters-of-Credit (`mLoC`)** backed by the **PayPal Sandbox Developer Platform** (`Invoicing v2`, `Orders v2`, `Shipping/Tracking v1`, `Payouts v1`, and `Captures Refund v2 / Disputes APIs`). Autonomous procurement and supplier agents discover catalogs via **Channel3**, negotiate SLA milestones, lock funds, verify carrier/API fulfillment, and execute multi-party split settlements without human bottlenecks.

---

## 1. Prize-Stacking Architecture & Alignment Matrix

| Prize Category | Award Value | ACN Implementation & Qualification Mechanism |
| :--- | :--- | :--- |
| **Grand Prize (1st / 2nd / 3rd)** | **$12,000 / $8,000 / $5,000** | End-to-end 4-stage multi-agent clearing lifecycle built natively on PayPal Sandbox APIs with real-time telemetry and cryptographic Assurance Receipts. |
| **Best Use of Agentic Commerce** | **$5,000** | Autonomous Procurement & Fulfillment agents dynamically discover supplier catalogs via **Channel3**, negotiate below-cap unit pricing, structure milestone tranches, and settle via PayPal MCP primitives. |
| **Best Use of PayPal + AI** | **$5,000** | Deep multi-API orchestration of PayPal `Invoicing v2`, `Orders v2 (intent: AUTHORIZE)`, `Tracking v1`, `Payouts v1`, and `Captures Refund v2` via structured LLM tool-calling rather than a passive checkout button. |
| **Sponsor: Best Use of AG Grid** | **$5,000 (1st) / $2,000 (2nd)** | Institutional Bloomberg-grade real-time clearing blotter (`ClearingBlotterGrid.tsx`) with custom SVG risk/velocity sparklines, multi-tranche progress bars, state-machine badges, quick filtering, and inline autonomous execution triggers. |
| **Sponsor: Best Use of APIMatic** | **$1,000 + 6 Mo Business Sub** | Built using the **APIMatic Context Plugin for PayPal** (`backend/app/paypal_sdk/models.py` & `client.py`) to generate strictly typed, contract-validated SDK bindings that eliminate schema hallucination on PayPal `Orders v2` and `Invoicing v2` payloads. |

---

## 2. Explicit AI Model & Agent Documentation (Devpost Mandatory Requirement)

Per Devpost competition rules, the AI models, agent roles, and tool-calling primitives used in ACN are explicitly documented below:

* **Primary Reasoning & Tool-Calling Model:** `claude-3-7-sonnet-20250219` / `gpt-4o` integrated with the **PayPal Agent Toolkit / MCP Server** and deterministic structured contract parser (`backend/app/agents/orchestrator.py`).
* **Agent 1 — Procurement Agent (`P0-1`):**
  * Parses unstructured natural-language trade prompts (e.g., *"Source 50 industrial LiFePO4 battery packs under $12,000 with 30% release on bill-of-lading and 70% on customs clearance"*).
  * Queries the **Channel3 B2B Supplier Catalog** (`CH3-BAT-LFP-48V100`, `CH3-SEMI-H100-OPT`, `CH3-CNC-SERVO-AX`, `CH3-API-INF-CLUSTER`) to negotiate unit pricing below the buyer's budget cap.
  * Invokes `paypal_invoicing_v2_create` (`POST /v2/invoicing/invoices`) and `paypal_orders_v2_create_authorize` (`POST /v2/checkout/orders` with `intent: "AUTHORIZE"`).
* **Agent 2 — Underwriting & Risk Engine (`P0-2`):**
  * Performs Elastic Anomaly & Counterparty Fraud scoring (`0–100`), HS tariff code screening, and velocity sparkline generation.
  * Executes Dual-Lock Authorization & Escrow Capture (`POST /v2/checkout/orders/{id}/authorize`) and emits a SHA-256 **Cryptographic Letter-of-Credit Assurance Receipt (`MLOC-AR-...`)**.
* **Agent 3 — Fulfillment & Dispute Arbiter Agent (`P0-3` & `P1-1`):**
  * **Autonomous Fulfillment Oracle (`P0-3`):** Registers carrier Bill-of-Lading tracking numbers (`DHL`, `FEDEX`, `UPS`) via `POST /v1/shipping/trackers-batch` and automatically releases **Tranche 1 (e.g., 30%)** via `POST /v1/payments/payouts`.
  * **AI Dispute & SLA Exception Arbiter (`P1-1`):** When carrier telemetry transitions to `CUSTOMS_HOLD` or `DELAYED` beyond the contractual SLA window, automatically calculates the contractual penalty rebate (e.g., **5% late-delivery rebate refunded to buyer** via `POST /v2/payments/captures/{id}/refund` and **95% net settlement disbursed to supplier** via `POST /v1/payments/payouts`).

---

## 3. APIMatic Context Plugin Workflow Documentation

See [`docs/APIMATIC_WORKFLOW.md`](./docs/APIMATIC_WORKFLOW.md) for full details on how the **APIMatic Context Plugin for PayPal** was used to ground the coding agent in PayPal's exact OpenAPI specifications:

1. **Strict Schema Grounding:** Every PayPal Sandbox API call in [`backend/app/paypal_sdk/models.py`](./backend/app/paypal_sdk/models.py) uses `ConfigDict(extra="forbid")` and PayPal OpenAPI regex constraints (`^\d+(\.\d{1,2})?$` for `Money.value`, ISO-4217 3-character `currency_code`, 22-char `soft_descriptor`).
2. **Runtime Contract Validation Receipts:** Every SDK method in [`backend/app/paypal_sdk/client.py`](./backend/app/paypal_sdk/client.py) emits an `APIMaticValidationReceipt` recording the OpenAPI spec version, HTTP endpoint, Pydantic schema model, execution mode, and latency—inspectable live in the **APIMatic SDK** tab of the HUD.

---

## 4. Quickstart Instructions

### Option A: One-Command Startup (Windows PowerShell)

```powershell
.\start_acn.ps1
```

### Option B: Manual Terminal Startup

#### 1. Start the FastAPI Agentic Clearing Orchestrator (Port 8000)

```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Start the Next.js + AG Grid Operator HUD (Port 3000)

```powershell
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Open **`http://localhost:3000`** in your browser.

* **Live PayPal Sandbox Credentials:** Click **"PayPal Sandbox: Twin + Live Ready"** in the top-right header (or populate `backend/.env` from `backend/.env.example`) to enter your `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` at runtime.
* **1-Click End-to-End Demo Autopilot:** Click **"Autopilot: Full Lifecycle + SLA Split"** in the top-right header to watch all 4 stages (`P0-1` → `P0-2` → `P0-3` → `P1-1`) execute sequentially with live AG Grid updates.

---

## 6. Mandatory Pre-Submission Compliance Checklist (Due Nov 12, 12:00 PM PT)

- [x] **4+ Distinct PayPal Sandbox APIs Orchestrated by AI Agents:**
  - `POST /v2/invoicing/invoices` (Invoicing v2 API)
  - `POST /v2/checkout/orders` & `/authorize` (Orders v2 API with `intent: AUTHORIZE`)
  - `POST /v1/shipping/trackers-batch` (Shipping/Tracking v1 API)
  - `POST /v1/payments/payouts` (Payouts v1 API for Tranche 1 & Tranche 2 milestone releases)
  - `POST /v2/payments/captures/{id}/refund` (Captures Refund v2 API for automated 5% SLA penalty rebate splits)
- [x] **Sponsor Tool 1 — AG Grid Clearing Blotter:** High-density institutional blotter (`ClearingBlotterGrid.tsx`) with custom status renderers, risk/velocity sparklines, tranche split progress bars, quick filtering, and deep payload inspection.
- [x] **Sponsor Tool 2 — APIMatic Context Plugin:** Documented in `README.md` and `docs/APIMATIC_WORKFLOW.md`, with live `APIMaticValidationReceipt` telemetry in the UI.
- [x] **Explicit AI Model Documentation in README:** Documented in Section 2 above (`claude-3-7-sonnet-20250219` / `gpt-4o` + PayPal MCP Server).
- [x] **Sub-3-Minute Demo Video Script (2:45 Target):** Included in [`docs/DEVPOST_SUBMISSION_GUIDE.md`](./docs/DEVPOST_SUBMISSION_GUIDE.md).
