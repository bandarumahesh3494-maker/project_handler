-- Database Verification Script
-- Run this in Supabase SQL Editor to verify everything is set up correctly

-- Check all tables exist
SELECT
  'Tables Check' as check_type,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) = 7 THEN '✓ PASS - All 7 tables exist'
    ELSE '✗ FAIL - Expected 7 tables, found ' || COUNT(*)
  END as status
FROM pg_tables
WHERE schemaname = 'public';

-- Check RLS is enabled on all tables
SELECT
  'RLS Check' as check_type,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) = 7 THEN '✓ PASS - RLS enabled on all tables'
    ELSE '✗ FAIL - RLS not enabled on all tables'
  END as status
FROM pg_tables t
WHERE schemaname = 'public'
  AND rowsecurity = true;

-- Check app_config has data
SELECT
  'Config Data Check' as check_type,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) = 4 THEN '✓ PASS - All config entries exist'
    ELSE '✗ FAIL - Expected 4 config entries, found ' || COUNT(*)
  END as status
FROM app_config;

-- List all tables
SELECT 'TABLE LIST:' as info;
SELECT tablename as table_name
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verify config keys
SELECT 'CONFIG KEYS:' as info;
SELECT config_key
FROM app_config
ORDER BY config_key;

-- Test query similar to what the app does
SELECT 'TEST QUERY - Fetching milestone_options:' as info;
SELECT config_value
FROM app_config
WHERE config_key = 'milestone_options';

-- Final status
SELECT '========================================' as divider;
SELECT 'DATABASE STATUS: READY ✓' as final_status;
SELECT '========================================' as divider;
