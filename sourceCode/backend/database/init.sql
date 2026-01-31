-- 🎯 SIMPLIFIED E-COMMERCE DATABASE SCHEMA
-- Version: Simple & Essential

-- 🗑️ DROP ALL EXISTING TABLES (Run this first to clean up)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS shipments CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS inventories CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS shops CASCADE;
DROP TABLE IF EXISTS sellers CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop any custom functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 🆕 NEW SIMPLIFIED SCHEMA STARTS HERE

-- 👤 USERS
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email CITEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'admin')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 📍 ADDRESSES (Simplified - one table for all address types)
CREATE TABLE addresses (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'shipping' CHECK (type IN ('shipping', 'billing')),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line TEXT NOT NULL,
  district TEXT,
  province TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'TH',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 🏪 SHOPS
CREATE TABLE shops (
  id BIGSERIAL PRIMARY KEY,
  owner_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 📚 CATEGORIES (Simple hierarchy)
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  parent_id BIGINT REFERENCES categories(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0
);

-- 📦 PRODUCTS
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT REFERENCES shops(id) ON DELETE CASCADE,
  category_id BIGINT REFERENCES categories(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL,
  compare_price NUMERIC(12,2), -- Original price for discount display
  sku TEXT UNIQUE,
  stock_quantity INTEGER DEFAULT 0,
  weight_gram INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  rating_avg NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 🖼️ PRODUCT IMAGES
CREATE TABLE product_images (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE
);

-- 🛒 CARTS
CREATE TABLE carts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE cart_items (
  id BIGSERIAL PRIMARY KEY,
  cart_id BIGINT REFERENCES carts(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_snapshot NUMERIC(12,2) NOT NULL, -- Price when added to cart
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 📋 ORDERS
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL, -- Human-readable order number
  user_id BIGINT REFERENCES users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  
  -- Amounts
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  
  -- Address snapshots (stored as JSON)
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  
  -- Tracking
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id),
  shop_id BIGINT REFERENCES shops(id),
  
  -- Product snapshot data
  product_name TEXT NOT NULL,
  product_sku TEXT,
  unit_price NUMERIC(12,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_price NUMERIC(12,2) NOT NULL,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'))
);

-- 💳 PAYMENTS
CREATE TABLE payments (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL, -- 'credit_card', 'bank_transfer', 'cod', etc.
  provider TEXT, -- 'omise', 'stripe', etc.
  transaction_id TEXT UNIQUE,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 🚚 SHIPMENTS (Simplified)
CREATE TABLE shipments (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  tracking_number TEXT,
  carrier TEXT, -- 'thailand_post', 'kerry', 'flash', etc.
  status TEXT DEFAULT 'preparing' CHECK (status IN ('preparing', 'picked_up', 'in_transit', 'delivered', 'failed')),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ⭐ REVIEWS
CREATE TABLE reviews (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  order_item_id BIGINT REFERENCES order_items(id), -- Link to actual purchase
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  comment TEXT,
  images JSONB, -- Array of image URLs
  is_verified BOOLEAN DEFAULT FALSE, -- Verified purchase
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 🏷️ DISCOUNT COUPONS (Optional but useful)


-- 📊 INDEXES FOR PERFORMANCE
CREATE INDEX idx_products_shop_id ON products(shop_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status) WHERE status = 'active';
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- 🎯 TRIGGERS FOR AUTO-UPDATE timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 🌱 SAMPLE DATA
INSERT INTO categories (name, slug) VALUES 
('Electronics', 'electronics'),
('Fashion', 'fashion'),
('Home & Living', 'home-living'),
('Books', 'books'),
('Sports', 'sports');

-- Electronics subcategories
INSERT INTO categories (parent_id, name, slug) VALUES 
(1, 'Mobile Phones', 'mobile-phones'),
(1, 'Laptops', 'laptops'),
(1, 'Headphones', 'headphones');

-- Fashion subcategories  
INSERT INTO categories (parent_id, name, slug) VALUES
(2, 'Men''s Clothing', 'mens-clothing'),
(2, 'Women''s Clothing', 'womens-clothing'),
(2, 'Shoes', 'shoes');

-- Sample admin user
INSERT INTO users (email, password_hash, full_name, role) VALUES 
('admin@example.com', '$2b$12$dummy_hash_here', 'System Admin', 'admin');

COMMENT ON TABLE users IS 'User accounts with simplified role management';
COMMENT ON TABLE products IS 'Products with basic variant support through different products';
COMMENT ON TABLE orders IS 'Orders with embedded address snapshots for data integrity';
COMMENT ON TABLE order_items IS 'Individual items within orders with shop reference for multi-vendor support';
COMMENT ON TABLE reviews IS 'Product reviews linked to verified purchases';