"""
APIMatic-Grounded PayPal Sandbox SDK Bindings & Contract Models
Strictly typed Pydantic v2 schemas generated and validated against PayPal OpenAPI Specs:
- Invoicing v2 (https://api-m.sandbox.paypal.com/v2/invoicing/invoices)
- Orders v2 (https://api-m.sandbox.paypal.com/v2/checkout/orders)
- Tracking v1 (https://api-m.sandbox.paypal.com/v1/shipping/trackers-batch)
- Payouts v1 (https://api-m.sandbox.paypal.com/v1/payments/payouts)
- Captures Refund v2 & Customer Disputes v1
"""

from __future__ import annotations
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict


class OrderIntent(str, Enum):
    CAPTURE = "CAPTURE"
    AUTHORIZE = "AUTHORIZE"


class OrderStatus(str, Enum):
    CREATED = "CREATED"
    SAVED = "SAVED"
    APPROVED = "APPROVED"
    VOIDED = "VOIDED"
    COMPLETED = "COMPLETED"
    PAYER_ACTION_REQUIRED = "PAYER_ACTION_REQUIRED"


class TrackingStatus(str, Enum):
    SHIPPED = "SHIPPED"
    IN_TRANSIT = "IN_TRANSIT"
    ON_HOLD = "ON_HOLD"
    CUSTOMS_HOLD = "CUSTOMS_HOLD"
    DELAYED = "DELAYED"
    DELIVERED = "DELIVERED"
    EXCEPTION = "EXCEPTION"


class CarrierCode(str, Enum):
    DHL = "DHL"
    FEDEX = "FEDEX"
    UPS = "UPS"
    MAERSK = "MAERSK"
    USPS = "USPS"


class Money(BaseModel):
    model_config = ConfigDict(extra="forbid")
    currency_code: str = Field(default="USD", min_length=3, max_length=3, description="ISO-4217 3-character currency code")
    value: str = Field(..., pattern=r"^\d+(\.\d{1,2})?$", description="Formatted decimal amount string per PayPal OpenAPI spec")


# ---------------------------------------------------------------------------
# 1. PayPal Invoicing v2 Models (/v2/invoicing/invoices)
# ---------------------------------------------------------------------------

class InvoiceItem(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str = Field(..., max_length=200)
    description: str = Field(..., max_length=1000)
    quantity: str = Field(..., pattern=r"^\d+(\.\d{1,2})?$")
    unit_amount: Money
    unit_of_measure: str = Field(default="QUANTITY")


class InvoiceDetail(BaseModel):
    model_config = ConfigDict(extra="forbid")
    invoice_number: str
    reference: str
    invoice_date: str
    currency_code: str = "USD"
    note: str
    terms_and_conditions: str
    memo: Optional[str] = None


class InvoicerInfo(BaseModel):
    model_config = ConfigDict(extra="forbid")
    business_name: str
    email_address: str


class BillingInfo(BaseModel):
    model_config = ConfigDict(extra="forbid")
    business_name: str
    email_address: str


class RecipientInfo(BaseModel):
    model_config = ConfigDict(extra="forbid")
    billing_info: BillingInfo


class CreateInvoiceRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    detail: InvoiceDetail
    invoicer: InvoicerInfo
    primary_recipients: List[RecipientInfo]
    items: List[InvoiceItem]


# ---------------------------------------------------------------------------
# 2. PayPal Orders v2 Models (/v2/checkout/orders)
# ---------------------------------------------------------------------------

class AmountBreakdown(BaseModel):
    model_config = ConfigDict(extra="forbid")
    item_total: Money
    shipping: Optional[Money] = None
    handling: Optional[Money] = None


class PurchaseUnitAmount(BaseModel):
    model_config = ConfigDict(extra="forbid")
    currency_code: str = "USD"
    value: str
    breakdown: Optional[AmountBreakdown] = None


class PurchaseUnitRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    reference_id: str
    description: str
    custom_id: str
    invoice_id: str
    soft_descriptor: str = Field(default="ACN*MLOC ESCROW", max_length=22)
    amount: PurchaseUnitAmount


class CreateOrderRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    intent: OrderIntent = OrderIntent.AUTHORIZE
    purchase_units: List[PurchaseUnitRequest]


# ---------------------------------------------------------------------------
# 3. PayPal Shipping / Tracking v1 Models (/v1/shipping/trackers-batch)
# ---------------------------------------------------------------------------

class TrackerItem(BaseModel):
    model_config = ConfigDict(extra="forbid")
    transaction_id: str = Field(..., description="PayPal Capture or Authorization ID")
    tracking_number: str = Field(..., min_length=4, max_length=64)
    status: TrackingStatus
    carrier: CarrierCode
    carrier_name_other: Optional[str] = None
    shipment_date: Optional[str] = None
    notify_buyer: bool = True


class TrackersBatchRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    trackers: List[TrackerItem]


# ---------------------------------------------------------------------------
# 4. PayPal Payouts v1 Models (/v1/payments/payouts)
# ---------------------------------------------------------------------------

class SenderBatchHeader(BaseModel):
    model_config = ConfigDict(extra="forbid")
    sender_batch_id: str
    email_subject: str
    email_message: str
    recipient_type: str = "EMAIL"


class PayoutItem(BaseModel):
    model_config = ConfigDict(extra="forbid")
    recipient_type: str = "EMAIL"
    amount: Money
    note: str
    sender_item_id: str
    receiver: str


class CreatePayoutRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    sender_batch_header: SenderBatchHeader
    items: List[PayoutItem]


# ---------------------------------------------------------------------------
# 5. PayPal Captures Refund v2 & Disputes Models
# ---------------------------------------------------------------------------

class RefundCaptureRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    amount: Money
    invoice_id: str
    note_to_payer: str


class APIMaticValidationReceipt(BaseModel):
    """Contract validation metadata emitted by the APIMatic-grounded SDK binding layer."""
    spec_version: str
    endpoint: str
    http_method: str
    schema_model: str
    strict_validation_passed: bool = True
    execution_mode: str  # "LIVE_PAYPAL_SANDBOX" | "SANDBOX_DETERMINISTIC_TWIN"
    latency_ms: float
    request_payload: Dict[str, Any]
    response_payload: Dict[str, Any]
    timestamp: str
