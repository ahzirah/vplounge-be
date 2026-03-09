ALTER TABLE waitlist_signups
  ADD COLUMN IF NOT EXISTS interest TEXT NULL;
