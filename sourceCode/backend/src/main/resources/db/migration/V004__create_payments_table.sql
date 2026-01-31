-- Migration: Create payments table for payment system
-- Author: System
-- Date: 2024

CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    order_id BIGINT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',

    -- Amounts
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'THB',
    gateway_fee DECIMAL(12,2) DEFAULT 0.00,

    -- Gateway Integration
    gateway_transaction_id VARCHAR(255),
    gateway_response JSONB,
    payment_details JSONB,

    -- Status tracking
    failure_reason TEXT,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    failed_at TIMESTAMP,
    refunded_at TIMESTAMP,

    -- Foreign key constraints
    CONSTRAINT fk_payments_order_id
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    -- Constraints
    CONSTRAINT chk_payments_amount_positive
        CHECK (amount > 0 OR status = 'REFUNDED'),

    CONSTRAINT chk_payments_status
        CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED')),

    CONSTRAINT chk_payments_method
        CHECK (payment_method IN ('CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'PROMPTPAY', 'TRUE_MONEY', 'RABBIT_LINE_PAY', 'CASH_ON_DELIVERY', 'PAYPAL', 'STRIPE'))
);

-- Indexes for better performance
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_method ON payments(payment_method);
CREATE INDEX idx_payments_gateway_transaction_id ON payments(gateway_transaction_id);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_payments_paid_at ON payments(paid_at) WHERE paid_at IS NOT NULL;

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_payments_updated_at();

-- Comments
COMMENT ON TABLE payments IS 'Payment records for orders with gateway integration';
COMMENT ON COLUMN payments.payment_number IS 'Unique payment identifier for external reference';
COMMENT ON COLUMN payments.gateway_response IS 'Full response from payment gateway stored as JSON';
COMMENT ON COLUMN payments.payment_details IS 'Payment method specific details (tokenized/encrypted)';
COMMENT ON COLUMN payments.gateway_fee IS 'Fee charged by payment gateway';