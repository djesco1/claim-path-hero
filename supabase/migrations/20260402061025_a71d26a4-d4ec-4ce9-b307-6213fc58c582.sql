
ALTER TABLE public.claims ADD COLUMN IF NOT EXISTS success_probability integer;
ALTER TABLE public.claims ADD COLUMN IF NOT EXISTS counterparty_email text;
