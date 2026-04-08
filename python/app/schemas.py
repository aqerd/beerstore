from datetime import datetime, date
from decimal import Decimal
from typing import List, Literal, Optional

from pydantic import BaseModel, Field


PaymentMethod = Literal['cash', 'card', 'transfer']


class SaleItemIn(BaseModel):
    productId: str
    quantity: Decimal = Field(gt=0)


class SaleCreate(BaseModel):
    storeId: str
    sellerId: str
    paymentMethod: PaymentMethod
    items: List[SaleItemIn]
    customerId: Optional[str] = None
    customerName: Optional[str] = None
    customerPhone: Optional[str] = None
    bonusToUse: Decimal = Decimal('0')


class SaleRefund(BaseModel):
    reason: str


class ManagementReportResponse(BaseModel):
    period: dict
    summary: dict
    revenueByDay: list
    topProducts: list
    staffPerformance: list
    salesByPaymentMethod: list
    customers: dict


class DashboardResponse(BaseModel):
    todayStats: dict
    weekStats: dict
    lowStockCount: int
    chartData: list
