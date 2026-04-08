from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.init_db import init_db
from app.schemas import SaleCreate
from app import services

app = FastAPI(title='Golden Liquid Python API', openapi_url='/api/v1/openapi.json', docs_url='/api/v1/docs')
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.on_event('startup')
def startup_event():
    init_db()


@app.get('/health')
def health():
    return {'status': 'ok'}


@app.get('/api/v1/stores')
def get_stores():
    return services.list_stores()


@app.get('/api/v1/products')
def get_products():
    return services.list_products()


@app.get('/api/v1/inventory')
def get_inventory(storeId: str):
    return services.list_inventory(storeId)


@app.get('/api/v1/sales')
def get_sales(storeId: str | None = None, startDate: str | None = None, endDate: str | None = None):
    return services.list_sales(storeId, startDate, endDate)


@app.get('/api/v1/sales/{sale_id}')
def get_sale(sale_id: str):
    sale = services.get_sale_by_id(sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail='Sale not found')
    return sale


@app.post('/api/v1/sales')
def create_sale(payload: SaleCreate):
    try:
        return services.create_sale(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.get('/api/v1/reports/dashboard')
def get_dashboard(storeId: str | None = None):
    return services.dashboard(storeId)


@app.get('/api/v1/reports/daily-stats')
def get_daily_stats(storeId: str | None = None):
    return services.daily_stats(storeId)


@app.get('/api/v1/reports/financials')
def get_financials(startDate: str | None = None, endDate: str | None = None, storeId: str | None = None):
    return services.management_report(startDate, endDate, storeId)


@app.get('/api/v1/reports/management')
def get_management(startDate: str | None = None, endDate: str | None = None, storeId: str | None = None):
    return services.management_report(startDate, endDate, storeId)


if __name__ == '__main__':
    uvicorn.run('main:app', host='0.0.0.0', port=8080, reload=False)
