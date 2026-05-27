-- Critical indexes for POS multi-tenant performance
-- Run in PostgreSQL database: sistema_local

CREATE INDEX IF NOT EXISTS idx_sales_store_created_at
  ON public.sales ("storeId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_sales_store_status_created_at
  ON public.sales ("storeId", status, "createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_sales_store_cashier_created_at
  ON public.sales ("storeId", "cashierId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id
  ON public.sale_items ("saleId");

CREATE INDEX IF NOT EXISTS idx_sale_items_product_id
  ON public.sale_items ("productId");

CREATE INDEX IF NOT EXISTS idx_products_store_barcode
  ON public.products ("storeId", barcode);

CREATE INDEX IF NOT EXISTS idx_products_store_name
  ON public.products ("storeId", name);

CREATE INDEX IF NOT EXISTS idx_products_store_active
  ON public.products ("storeId", "isActive");

CREATE INDEX IF NOT EXISTS idx_customers_store_phone
  ON public.customers ("storeId", phone);

CREATE INDEX IF NOT EXISTS idx_customers_store_document
  ON public.customers ("storeId", document);

CREATE INDEX IF NOT EXISTS idx_cash_registers_store_created_at
  ON public.cash_registers ("storeId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_credit_accounts_store_customer
  ON public.credit_accounts ("storeId", "customerId");

