# OldCycle Database Migrations

This directory contains SQL migration scripts for the OldCycle Supabase database.

## How to Apply Migrations

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the SQL from the migration file
4. Click "Run" to execute the migration

## Available Migrations

### add_real_estate_jobs_categories.sql
Adds two new categories to the platform:
- **Real Estate** (🏢) - For property listings, rentals, and real estate services
- **Jobs** (💼) - For job postings and career opportunities

**Status**: Ready to apply

## Migration History

| Date | Migration | Description |
|------|-----------|-------------|
| 2024 | add_real_estate_jobs_categories.sql | Added Real Estate and Jobs categories |

## Notes

- Always backup your database before running migrations
- Test migrations in a development environment first
- Migrations are designed to be idempotent (safe to run multiple times)
