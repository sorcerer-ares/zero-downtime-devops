-- Step 3: Backfill Phase
-- Populate NULL first_name and last_name values for historical records
UPDATE users 
SET 
  first_name = split_part(full_name, ' ', 1),
  last_name = COALESCE(NULLIF(substr(full_name, length(split_part(full_name, ' ', 1)) + 2), ''), '')
WHERE first_name IS NULL;
