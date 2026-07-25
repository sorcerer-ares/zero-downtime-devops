-- Step 1: Expand Phase
-- Add new columns as NULLABLE so App v1 can continue inserting without knowing about them.
ALTER TABLE users 
  ADD COLUMN first_name VARCHAR(50),
  ADD COLUMN last_name VARCHAR(50);
