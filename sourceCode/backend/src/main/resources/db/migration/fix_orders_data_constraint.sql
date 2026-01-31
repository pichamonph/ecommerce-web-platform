-- Update existing data to match enum values
UPDATE orders SET status = 'PAID' WHERE status = 'paid';
UPDATE orders SET status = 'PENDING' WHERE status = 'pending';
UPDATE orders SET status = 'COMPLETED' WHERE status = 'completed';
UPDATE orders SET status = 'CANCELLED' WHERE status = 'cancelled';
UPDATE orders SET status = 'DELIVERED' WHERE status = 'delivered';
UPDATE orders SET status = 'SHIPPED' WHERE status = 'shipped';
UPDATE orders SET status = 'CONFIRMED' WHERE status = 'confirmed';
UPDATE orders SET status = 'PROCESSING' WHERE status = 'processing';

-- Now add the constraint
ALTER TABLE orders ADD CONSTRAINT orders_status_check
    CHECK (status IN ('PENDING', 'PAYMENT_PENDING', 'PAID', 'PAYMENT_FAILED', 'CONFIRMED', 'PROCESSING', 'READY_TO_SHIP', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED', 'RETURNED', 'ON_HOLD', 'DISPUTED'));