ALTER TABLE public.cyber_merchants
ADD COLUMN IF NOT EXISTS payout_phone text;

COMMENT ON COLUMN public.cyber_merchants.payout_phone
IS 'Owner M-Pesa phone number for future cyber earnings payouts';
