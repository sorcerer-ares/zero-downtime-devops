-- Step 4: Contract Phase
-- Safely drop the old column now that zero code paths depend on it
ALTER TABLE users DROP COLUMN full_name;
