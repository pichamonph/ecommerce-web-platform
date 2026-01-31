-- Fix existing order status values to match OrderStatus enum
-- Convert lowercase status values to uppercase

UPDATE orders
SET status = 'PENDING'
WHERE status = 'pending' OR status = 'Pending';

UPDATE orders
SET status = 'PAID'
WHERE status = 'paid' OR status = 'Paid';

UPDATE orders
SET status = 'CONFIRMED'
WHERE status = 'confirmed' OR status = 'Confirmed';

UPDATE orders
SET status = 'PROCESSING'
WHERE status = 'processing' OR status = 'Processing';

UPDATE orders
SET status = 'SHIPPED'
WHERE status = 'shipped' OR status = 'Shipped';

UPDATE orders
SET status = 'DELIVERED'
WHERE status = 'delivered' OR status = 'Delivered';

UPDATE orders
SET status = 'COMPLETED'
WHERE status = 'completed' OR status = 'Completed';

UPDATE orders
SET status = 'CANCELLED'
WHERE status = 'cancelled' OR status = 'Cancelled';

-- Check if there are any unrecognized status values
-- and convert them to PENDING as default
UPDATE orders
SET status = 'PENDING'
WHERE status NOT IN (
    'PENDING', 'PAYMENT_PENDING', 'PAID', 'PAYMENT_FAILED',
    'CONFIRMED', 'PROCESSING', 'READY_TO_SHIP', 'SHIPPED',
    'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED',
    'REFUNDED', 'RETURNED', 'ON_HOLD', 'DISPUTED'
);

-- Show updated status counts
-- This will be logged during migration
SELECT status, COUNT(*) as count
FROM orders
GROUP BY status
ORDER BY status;