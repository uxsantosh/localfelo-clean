# Database Migration Instructions

## Run these migrations in order in your Supabase SQL Editor:

### 1. Add wish_id and task_id to conversations table
**File:** `/migrations/add_wish_task_to_conversations.sql`

This adds support for conversations about wishes and tasks (not just marketplace listings).

```sql
-- Run this first
```

### 2. Add direct references to messages table
**File:** `/migrations/add_messages_direct_references.sql`

This adds receiver_id, listing_id, wish_id, task_id to messages for easier querying.

```sql
-- Run this second
```

### 3. Add app download and banner settings
**File:** `/migrations/add_app_and_banner_settings.sql`

This adds columns and default settings for app download links and banner customization.

```sql
-- Run this third
```

### 4. Add footer pages content
**File:** `/migrations/add_footer_pages_content.sql`

This adds the content column and default content for About, Terms, Privacy, Contact pages.

```sql
-- Run this fourth
```

## What These Migrations Do:

### Conversations Table Updates:
- ✅ Adds `wish_id` column for wish conversations
- ✅ Adds `task_id` column for task conversations
- ✅ Adds indexes for better performance
- ✅ Updates RLS policies

### Messages Table Updates:
- ✅ Adds `receiver_id` for direct recipient reference
- ✅ Adds `listing_id`, `wish_id`, `task_id` for direct item references
- ✅ Adds `message` column (alias for `content`)
- ✅ Backfills existing data from conversations table
- ✅ Adds indexes for all new columns

### Site Settings Updates:
- ✅ Adds `app_download_url` column
- ✅ Adds `gradient_color_1`, `gradient_color_2` columns for banner styling
- ✅ Adds `text_color` and `opacity` columns for banner text
- ✅ Adds `image_url` column for banner images
- ✅ Adds `content` column for footer page HTML/Markdown content
- ✅ Inserts default records for all settings

## After Running Migrations:

Your admin panel will now have:
- ✅ Complete site settings management
- ✅ App download link configuration
- ✅ Active task banner customization
- ✅ All Chats tab with full history
- ✅ Footer Pages editor for About, Terms, Privacy, Contact

## Troubleshooting:

If you get foreign key errors:
1. Make sure you have the `wishes` and `tasks` tables created first
2. Run `/migrations/add_wishes_tasks_tables.sql` if you haven't already

If you get RLS policy errors:
1. Check that you're logged in as admin
2. Make sure your profile has `is_admin = true`

## Verify Success:

After running all migrations, check:

```sql
-- Verify conversations table has new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'conversations' 
  AND column_name IN ('wish_id', 'task_id');

-- Verify messages table has new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages' 
  AND column_name IN ('receiver_id', 'listing_id', 'wish_id', 'task_id', 'message');

-- Verify site_settings has new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'site_settings' 
  AND column_name IN ('app_download_url', 'content', 'image_url', 'gradient_color_1');

-- Check default settings are inserted
SELECT id, setting_type, title 
FROM site_settings 
WHERE id IN ('app_download', 'active_task_banner', 'footer_about', 'footer_terms', 'footer_privacy', 'footer_contact');
```

All queries should return results. If any return empty, check the migration logs for errors.
