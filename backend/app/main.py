"""
FastAPI Backend for Agentic Clearing Network (ACN)
Autonomous Micro-Letter-of-Credit & B2B Escrow Engine on PayPal Sandbox Developer Platform.
"""

from __future__ import annotations
import asyncio
import json
import os
from typing import Any, Dict, Optional
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from .agents import AgenticClearingOrchestrator, CHANNEL3_SUPPLIER_CATALOG
from .paypal_sdk import PayPalSandboxSDK

load_dotenv()

app = FastAPI(
    title="Agentic Clearing Network (ACN) — PayPal Sandbox Orchestrator",
    version="2.4.0",
    description=(
        "Autonomous Micro-Letter-of-Credit (mLoC) & B2B Escrow Engine orchestrating "
        "PayPal Sandbox Invoicing v2, Orders v2, Shipping/Tracking v1, Payouts v1, and Captures Refund v2 APIs."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

paypal_sdk = PayPalSandboxSDK()
orchestrator = AgenticClearingOrchestrator(paypal_sdk)


class PromptRequest(BaseModel):
    prompt: str = Field(
        ...,
        min_length=5,
        description="Unstructured natural language procurement prompt",
    )


class FulfillmentRequest(BaseModel):
    tracking_number: Optional[str] = None
    carrier: Optional[str] = None


class SLAAdjudicationRequest(BaseModel):
    exception_reason: str = Field(
        default="CUSTOMS_HOLD: Port of Long Beach tariff inspection exceeded 120h SLA window by 38 hours"
    )


class CredentialsRequest(BaseModel):
    client_id: str = ""
    client_secret: str = ""
    base_url: Optional[str] = "https://api-m.sandbox.paypal.com"


@app.get("/api/health")
async def get_health() -> Dict[str, Any]:
    return {
        "status": "ONLINE",
        "service": "Agentic Clearing Network (ACN) Orchestrator",
        "paypal_sandbox": paypal_sdk.get_status(),
        "ai_agents": {
            "procurement_agent": "Claude 3.7 Sonnet + Channel3 Catalog Discovery",
            "underwriting_engine": "Elastic Anomaly & Counterparty Fraud Scorer",
            "fulfillment_arbiter": "PayPal Tracking v1 Oracle + Dispute SLA Arbiter",
        },
    }


@app.get("/api/state")
async def get_full_state() -> Dict[str, Any]:
    return {
        "contracts": orchestrator.contracts,
        "metrics": orchestrator.get_portfolio_metrics(),
        "webhook_events": orchestrator.webhook_events[:35],
        "paypal_status": paypal_sdk.get_status(),
        "catalog": CHANNEL3_SUPPLIER_CATALOG,
        "apimatic_log": [r.model_dump() for r in paypal_sdk.validation_log[:25]],
    }


@app.post("/api/mloc/preview")
async def preview_mloc_structuring(req: PromptRequest) -> Dict[str, Any]:
    return orchestrator.parse_natural_language_prompt(req.prompt)


@app.post("/api/mloc/create")
async def create_mloc(req: PromptRequest) -> Dict[str, Any]:
    contract = await orchestrator.create_mloc_from_prompt(req.prompt)
    return {
        "contract": contract,
        "metrics": orchestrator.get_portfolio_metrics(),
        "webhook_events": orchestrator.webhook_events[:25],
    }


@app.post("/api/mloc/{mloc_id}/authorize")
async def authorize_mloc(mloc_id: str) -> Dict[str, Any]:
    try:
        contract = await orchestrator.execute_dual_lock_authorization(mloc_id)
        return {
            "contract": contract,
            "metrics": orchestrator.get_portfolio_metrics(),
            "webhook_events": orchestrator.webhook_events[:25],
        }
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.post("/api/mloc/{mloc_id}/fulfill-tranche-1")
async def fulfill_tranche_1(mloc_id: str, req: Optional[FulfillmentRequest] = None) -> Dict[str, Any]:
    try:
        contract = await orchestrator.execute_fulfillment_tranche_1(
            mloc_id,
            tracking_number=req.tracking_number if req else None,
            carrier=req.carrier if req else None,
        )
        return {
            "contract": contract,
            "metrics": orchestrator.get_portfolio_metrics(),
            "webhook_events": orchestrator.webhook_events[:25],
        }
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.post("/api/mloc/{mloc_id}/settle-tranche-2")
async def settle_tranche_2(mloc_id: str) -> Dict[str, Any]:
    try:
        contract = await orchestrator.execute_customs_clearance_tranche_2(mloc_id)
        return {
            "contract": contract,
            "metrics": orchestrator.get_portfolio_metrics(),
            "webhook_events": orchestrator.webhook_events[:25],
        }
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.post("/api/mloc/{mloc_id}/arbitrate-sla")
async def arbitrate_sla(mloc_id: str, req: Optional[SLAAdjudicationRequest] = None) -> Dict[str, Any]:
    try:
        reason = (
            req.exception_reason
            if req and req.exception_reason
            else "CUSTOMS_HOLD: Port of Long Beach congestion exceeded 120h SLA window by 38 hours"
        )
        contract = await orchestrator.execute_sla_exception_arbitration(mloc_id, exception_reason=reason)
        return {
            "contract": contract,
            "metrics": orchestrator.get_portfolio_metrics(),
            "webhook_events": orchestrator.webhook_events[:25],
        }
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.post("/api/paypal/credentials")
async def update_paypal_credentials(req: CredentialsRequest) -> Dict[str, Any]:
    status = paypal_sdk.configure_credentials(
        client_id=req.client_id,
        client_secret=req.client_secret,
        base_url=req.base_url,
    )
    return {"paypal_status": status}


@app.get("/api/stream")
async def sse_stream() -> StreamingResponse:
    async def event_generator():
        last_event_id = None
        while True:
            top_event_id = orchestrator.webhook_events[0]["event_id"] if orchestrator.webhook_events else None
            if top_event_id != last_event_id:
                last_event_id = top_event_id
                payload = {
                    "metrics": orchestrator.get_portfolio_metrics(),
                    "latest_event": orchestrator.webhook_events[0] if orchestrator.webhook_events else None,
                    "contracts_count": len(orchestrator.contracts),
                }
                yield f"data: {json.dumps(payload)}\n\n"
            await asyncio.sleep(2.0)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
