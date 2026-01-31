-- Migration: Create order status history table and update orders status field
-- Author: System
-- Date: 2024

-- First, create the order_status_history table
CREATE TABLE order_status_history (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    reason TEXT,
    notes TEXT,

    -- Who made the change
    changed_by_user_id BIGINT,
    changed_by_role VARCHAR(50), -- CUSTOMER, ADMIN, MERCHANT, SYSTEM

    -- System tracking
    automatic_change BOOLEAN DEFAULT FALSE,
    external_reference VARCHAR(255), -- Payment ID, Shipment tracking, etc.

    -- Timestamp
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints
    CONSTRAINT fk_order_status_history_order_id
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    -- Constraints for status values
    CONSTRAINT chk_order_status_history_previous_status
        CHECK (previous_status IN ('PENDING', 'PAYMENT_PENDING', 'PAID', 'PAYMENT_FAILED',
                                  'CONFIRMED', 'PROCESSING', 'READY_TO_SHIP', 'SHIPPED',
                                  'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED',
                                  'CANCELLED', 'REFUNDED', 'RETURNED', 'ON_HOLD', 'DISPUTED')),

    CONSTRAINT chk_order_status_history_new_status
        CHECK (new_status IN ('PENDING', 'PAYMENT_PENDING', 'PAID', 'PAYMENT_FAILED',
                             'CONFIRMED', 'PROCESSING', 'READY_TO_SHIP', 'SHIPPED',
                             'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED',
                             'CANCELLED', 'REFUNDED', 'RETURNED', 'ON_HOLD', 'DISPUTED')),

    CONSTRAINT chk_order_status_history_changed_by_role
        CHECK (changed_by_role IN ('CUSTOMER', 'ADMIN', 'MERCHANT', 'SYSTEM'))
);

-- Update the orders table status constraint to match the new enum values
-- First, update any existing orders with old status values
UPDATE orders SET status = 'PENDING' WHERE status = 'pending';
UPDATE orders SET status = 'PAID' WHERE status = 'paid';
UPDATE orders SET status = 'CONFIRMED' WHERE status = 'confirmed';
UPDATE orders SET status = 'PROCESSING' WHERE status = 'processing';
UPDATE orders SET status = 'SHIPPED' WHERE status = 'shipped';
UPDATE orders SET status = 'DELIVERED' WHERE status = 'delivered';
UPDATE orders SET status = 'COMPLETED' WHERE status = 'completed';
UPDATE orders SET status = 'CANCELLED' WHERE status = 'cancelled';

-- Add constraint to orders status field
ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_orders_status;
ALTER TABLE orders ADD CONSTRAINT chk_orders_status
    CHECK (status IN ('PENDING', 'PAYMENT_PENDING', 'PAID', 'PAYMENT_FAILED',
                     'CONFIRMED', 'PROCESSING', 'READY_TO_SHIP', 'SHIPPED',
                     'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED',
                     'CANCELLED', 'REFUNDED', 'RETURNED', 'ON_HOLD', 'DISPUTED'));

-- Indexes for better performance
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_new_status ON order_status_history(new_status);
CREATE INDEX idx_order_status_history_created_at ON order_status_history(created_at);
CREATE INDEX idx_order_status_history_changed_by_user_id ON order_status_history(changed_by_user_id);

-- Comments
COMMENT ON TABLE order_status_history IS 'Order status change history for auditing and tracking';
COMMENT ON COLUMN order_status_history.automatic_change IS 'TRUE if status change was automatic/system-triggered';
COMMENT ON COLUMN order_status_history.external_reference IS 'External system reference (payment ID, tracking number, etc.)';
COMMENT ON COLUMN order_status_history.changed_by_role IS 'Role of the user/system that made the change';