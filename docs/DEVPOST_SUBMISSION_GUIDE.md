# Devpost Submission Guide, Section 6 Compliance Checklist & 2:45 Video Script

## Section 6: Mandatory Pre-Submission Compliance Checklist (Due Nov 12, 12:00 PM PT)

| # | Requirement | Status | Verification Artifact / Location |
| :--- | :--- | :---: | :--- |
| **6.1** | **Public Code Repository with Explicit AI Model Docs** | ✅ Ready | [`README.md`](../README.md) Section 2 documents `claude-3-7-sonnet-20250219` / `gpt-4o`, PayPal MCP primitives, and agent roles. |
| **6.2** | **4+ Distinct PayPal Sandbox APIs Orchestrated by AI** | ✅ Ready | `Invoicing v2`, `Orders v2 (AUTHORIZE/CAPTURE)`, `Shipping/Tracking v1`, `Payouts v1`, and `Captures Refund v2` in [`backend/app/paypal_sdk/client.py`](../backend/app/paypal_sdk/client.py). |
| **6.3** | **Sponsor Qualification: Best Use of AG Grid** | ✅ Ready | [`frontend/src/components/ClearingBlotterGrid.tsx`](../frontend/src/components/ClearingBlotterGrid.tsx) renders live escrow state badges, SVG risk sparklines, multi-tranche split bars, quick filtering, and inline execution triggers. |
| **6.4** | **Sponsor Qualification: Best Use of APIMatic** | ✅ Ready | [`docs/APIMATIC_WORKFLOW.md`](./APIMATIC_WORKFLOW.md) + live `APIMatic SDK` validation tab in the HUD. |
| **6.5** | **Best Use of Agentic Commerce (Channel3 Discovery)** | ✅ Ready | [`backend/app/agents/orchestrator.py`](../backend/app/agents/orchestrator.py) dynamically matches unstructured trade prompts against verified **Channel3** industrial catalogs and negotiates below-cap pricing. |
| **6.6** | **Sub-3-Minute Public YouTube Demo Video (2:45 Target)** | ✅ Script Below | Follow the second-by-second script below using the **"Autopilot: Full Lifecycle + SLA Split"** button or manual stage clicks. |

---

## Sub-3-Minute Demo Video Script (2:45 Total Runtime)

### `[0:00 – 0:15]` The $2.5T SME Trade Finance Vacuum (15s Hook)
- **Visual:** Open directly on the live **ACN Bloomberg-Style Operator HUD** (`http://localhost:3000`) — no login or loading screens.
- **Voiceover:** *"Cross-border SME importers and hardware suppliers operate in a $2.5 trillion trust vacuum: suppliers demand cash upfront, buyers refuse blind prepayment, and bank Letters of Credit cost $1,500 and take weeks. Meet the Agentic Clearing Network—turning standard PayPal Sandbox Orders and Invoices into AI-underwritten, milestone-gated micro-Letters-of-Credit."*

### `[0:15 – 0:55]` P0-1: Natural-Language Trade Structuring & Channel3 Discovery (40s)
- **Visual:** Point to the **P0-1 Natural-Language Trade Structuring** command bar (`"Source 50 industrial LiFePO4 battery packs under $12,000 with 30% release on bill-of-lading and 70% on customs clearance"`). Highlight the live **Channel3 Match (`CH3-BAT-LFP-48V100`)** negotiating the deal to `$11,400` (`$600` below cap), then click **"Issue mLoC (PayPal Invoice v2 + Order v2)"**.
- **Voiceover:** *"From a single natural-language prompt, our Procurement Agent discovers a verified supplier on Channel3, negotiates pricing below our $12,000 cap, and calls PayPal's Invoicing v2 and Orders v2 APIs using strict APIMatic-validated schemas to issue a programmable 30/70 escrow contract."*

### `[0:55 – 1:30]` P0-2: Dual-Lock Authorization & Cryptographic Assurance Receipt (35s)
- **Visual:** Click **"PayPal Dual-Lock"** on the new row in the **AG Grid Institutional Clearing Blotter**. In the PayPal Sandbox modal, click **"Approve PayPal Sandbox Dual-Lock & Emit Receipt"**. Highlight the generated **SHA-256 Cryptographic Assurance Receipt (`MLOC-AR-...`)**.
- **Voiceover:** *"When the buyer approves the PayPal Sandbox Order, our Underwriting Engine locks the $11,400 reserve and emits a cryptographic Letter-of-Credit Assurance Receipt to the supplier—proving funds are locked in clearing reserve so manufacturing can start immediately with zero counterparty risk."*

### `[1:30 – 2:05]` P0-3 & P0-4: AG Grid Blotter & Autonomous Fulfillment Oracle (35s)
- **Visual:** Click **"BoL Scan -> 30%"** directly inside the AG Grid row. Show the **Milestone Gating Timeline** advancing to M3 and switch the right inspector to **"PayPal JSON"** and **"APIMatic SDK"** tabs.
- **Voiceover:** *"Inside our AG Grid Clearing Blotter—complete with live Elastic risk sparklines and tranche progress bars—our Fulfillment Oracle attaches the DHL Bill-of-Lading via PayPal's Tracking v1 API and automatically disburses the 30% Tranche 1 payout ($3,420) via PayPal Payouts v1."*

### `[2:05 – 2:45]` P1-1: AI Dispute & SLA Exception Arbiter + Architectural Close (40s)
- **Visual:** Click **"SLA Breach"** on the active row. Show the red **AI SLA Exception Arbitration** card and the **Live Stream** tab showing `PAYMENT.CAPTURE.REFUNDED` (`$570` 5% rebate to buyer) and `PAYMENT.PAYOUTS-ITEM.SUCCEEDED` (`$7,410` net to seller).
- **Voiceover:** *"What if customs congestion delays delivery past the 120-hour SLA window? Instead of freezing funds for months in a manual dispute, our AI Dispute Arbiter ingests the Tracking v1 exception, calculates the contractual 5% late-delivery penalty, refunds $570 to the buyer via PayPal Captures Refund v2, and disburses the net $7,410 to the supplier via PayPal Payouts v1. Five PayPal Sandbox APIs, APIMatic strict typing, Channel3 discovery, and AG Grid—unlocking programmable global trade."*
