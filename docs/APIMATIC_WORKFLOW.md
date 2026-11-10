# APIMatic Context Plugin Workflow for PayPal Sandbox SDK Generation

## Overview

The **Agentic Clearing Network (ACN)** uses the **APIMatic Context Plugin for PayPal** to ground the AI coding agent and backend orchestrator in PayPal's official OpenAPI specifications, eliminating schema hallucination across complex multi-party trade finance payloads.

## Why APIMatic Was Essential for ACN

Orchestrating a programmable Micro-Letter-of-Credit (`mLoC`) requires chaining five distinct PayPal Sandbox endpoints where output identifiers (`invoice_id`, `order_id`, `authorization_id`, `capture_id`, `payout_batch_id`, `refund_id`) and nested monetary breakdowns must strictly conform to PayPal's OpenAPI specification:

1. **Invoicing v2 (`/v2/invoicing/invoices`):** Requires string-formatted decimal quantities (`"50"`), nested `unit_amount` objects (`{"currency_code": "USD", "value": "228.00"}`), and structured `primary_recipients` billing blocks.
2. **Orders v2 (`/v2/checkout/orders`):** Requires `intent: "AUTHORIZE"`, `soft_descriptor` capped at 22 ASCII characters (`"ACN*MLOC ESCROW"`), and `purchase_units[].amount.breakdown.item_total` matching the exact sum of line items.
3. **Shipping / Tracking v1 (`/v1/shipping/trackers-batch`):** Requires a `trackers` batch array linking `transaction_id` (the PayPal Capture ID) with a valid `CarrierCode` enum (`DHL`, `FEDEX`, `UPS`, `MAERSK`) and `TrackingStatus` (`SHIPPED`, `IN_TRANSIT`, `CUSTOMS_HOLD`, `DELIVERED`).
4. **Payouts v1 (`/v1/payments/payouts`):** Requires a unique `sender_batch_id` in `sender_batch_header` and recipient items with `recipient_type: "EMAIL"`.
5. **Captures Refund v2 (`/v2/payments/captures/{capture_id}/refund`):** Used by the AI Dispute & SLA Exception Arbiter to refund the 5% late-delivery rebate to the buyer while disbursing the net 95% remainder via Payouts v1.

## Contract Validation Architecture (`backend/app/paypal_sdk/`)

- **[`models.py`](../backend/app/paypal_sdk/models.py):** Strictly typed Pydantic v2 models with `ConfigDict(extra="forbid")` and regex validation (`pattern=r"^\d+(\.\d{1,2})?$"`). Any hallucinated field or floating-point formatting error is caught prior to network dispatch.
- **[`client.py`](../backend/app/paypal_sdk/client.py):** Every SDK call records a verifiable `APIMaticValidationReceipt` containing:
  - `spec_version` (e.g., `"PayPal Orders v2.14 (APIMatic Strict)"`)
  - `endpoint` & `http_method`
  - `schema_model` validated
  - `execution_mode` (`"LIVE_PAYPAL_SANDBOX"` or `"SANDBOX_DETERMINISTIC_TWIN"`)
  - `latency_ms` & full request/response JSON payloads
