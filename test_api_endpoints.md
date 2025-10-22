# Database and API Testing Guide

## 1. Test Database Connection

### Option A: Using SQL Script
Run the `test_database_connection.sql` script in your Supabase SQL editor to check:
- Table structure and columns
- Number of indicators in database
- Sample data
- Recent updates

### Option B: Using API Endpoint
Visit: `http://localhost:3000/api/test-database`

This will show:
- All indicators in the database
- Table structure
- Total count
- Any errors

## 2. Test Indicators API

### Check if indicators API works:
Visit: `http://localhost:3000/api/meal/indicators`

This should return all indicators from the database.

## 3. Test Update Functionality

### Try updating an indicator:
1. Go to the Project Indicators page
2. Select a project
3. Try to update an indicator value
4. Check the browser console for debug logs
5. Check if the update was saved to database

## 4. Check Database After Update

After trying to update an indicator, run the SQL script again to see if:
- The `current` value was updated
- The `last_updated_by` field was populated
- The `last_updated_at` timestamp was set
- Any `notes` were added

## 5. Debug Information

If updates are not working, check:
- Browser console for error messages
- Network tab for failed API calls
- Database logs for any errors
- Whether the new columns exist in the database
