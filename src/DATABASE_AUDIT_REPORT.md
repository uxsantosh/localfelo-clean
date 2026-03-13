# 🔍 COMPLETE DATABASE SCHEMA AUDIT - LocalFelo

## Executive Summary

Based on codebase analysis, here are ALL tables currently in use by LocalFelo:

---

## 📊 Core Tables (from database_schema.sql)

### 1. **profiles** ✅ ACTIVE
**Purpose:** User accounts and authentication  
**Current Columns (OLD SCHEMA):**
```sql
- id UUID PRIMARY KEY
- name TEXT NOT NULL
- phone TEXT NOT NULL UNIQUE
- whatsapp_same BOOLEAN
- whatsapp TEXT
- created_at TIMESTAMP
- updated_at TIMESTAMP
```

**MISSING COLUMNS (causing auth bug):**
```sql
❌ password_hash TEXT          -- Bcrypt password
❌ client_token TEXT UNIQUE    -- Soft auth token
❌ owner_token TEXT UNIQUE     -- Owner identification
❌ display_name TEXT           -- Display name
❌ phone_number TEXT           -- Alternate phone storage
❌ avatar_url TEXT             -- Profile picture
❌ is_active BOOLEAN           -- Account status
❌ is_admin BOOLEAN            -- Admin flag
❌ auth_user_id UUID           -- Supabase auth link
❌ email TEXT                  -- Email (optional)
❌ city_id TEXT                -- User's city
❌ area_id TEXT                -- User's area
❌ subarea_id TEXT             -- User's subarea
❌ latitude NUMERIC            -- Location coords
❌ longitude NUMERIC           -- Location coords
❌ badge TEXT                  -- Trust badge
❌ badge_notes TEXT            -- Badge notes
```

**Used in:** Auth, Profile, Admin, Chat, All listings/wishes/tasks

---

### 2. **categories** ✅ ACTIVE
**Purpose:** Marketplace categories  
**Schema:**
```sql
- id TEXT PRIMARY KEY
- name TEXT NOT NULL
- slug TEXT NOT NULL UNIQUE
- emoji TEXT NOT NULL
- created_at TIMESTAMP
```
**Used in:** Marketplace listings

---

### 3. **cities** ✅ ACTIVE
**Purpose:** City selection  
**Schema:**
```sql
- id TEXT PRIMARY KEY
- name TEXT NOT NULL
- created_at TIMESTAMP
```
**Data:** 8 Indian cities (Mumbai, Delhi, Bangalore, etc.)

---

### 4. **areas** ✅ ACTIVE
**Purpose:** Area/locality within cities  
**Schema:**
```sql
- id TEXT PRIMARY KEY
- city_id TEXT REFERENCES cities(id)
- name TEXT NOT NULL
- slug TEXT              -- May be added
- latitude NUMERIC       -- May be added
- longitude NUMERIC      -- May be added
- created_at TIMESTAMP
```

---

### 5. **sub_areas** ✅ ACTIVE (if exists)
**Purpose:** Sub-locality within areas  
**Schema:**
```sql
- id TEXT PRIMARY KEY
- area_id TEXT REFERENCES areas(id)
- name TEXT NOT NULL
- latitude NUMERIC
- longitude NUMERIC
- created_at TIMESTAMP
```
**Note:** May or may not exist in current DB

---

### 6. **listings** ✅ ACTIVE
**Purpose:** Marketplace items  
**Current Schema:**
```sql
- id UUID PRIMARY KEY
- title TEXT NOT NULL
- description TEXT NOT NULL
- price INTEGER NOT NULL
- category_id TEXT REFERENCES categories(id)
- city_id TEXT REFERENCES cities(id)
- area_id TEXT REFERENCES areas(id)
- phone TEXT NOT NULL
- whatsapp TEXT
- has_whatsapp BOOLEAN
- seller_id UUID REFERENCES profiles(id)
- is_hidden BOOLEAN
- created_at TIMESTAMP
- updated_at TIMESTAMP
```

**MISSING COLUMNS:**
```sql
❌ subarea_id TEXT            -- Subarea location
❌ is_active BOOLEAN          -- Active status
❌ status TEXT                -- Status field
❌ owner_token TEXT           -- Owner identification
❌ owner_name TEXT            -- Owner name
❌ owner_phone TEXT           -- Owner phone
❌ condition TEXT             -- Item condition
❌ latitude NUMERIC           -- Location
❌ longitude NUMERIC          -- Location
```

---

### 7. **listing_images** ✅ ACTIVE
**Purpose:** Multiple images per listing  
**Schema:**
```sql
- id UUID PRIMARY KEY
- listing_id UUID REFERENCES listings(id) CASCADE
- image_url TEXT NOT NULL
- display_order INTEGER
- created_at TIMESTAMP
```

---

### 8. **reports** ✅ ACTIVE
**Purpose:** Report inappropriate listings  
**Schema:**
```sql
- id UUID PRIMARY KEY
- listing_id UUID REFERENCES listings(id) CASCADE
- reporter_id UUID REFERENCES profiles(id)
- reason TEXT NOT NULL
- details TEXT
- status TEXT DEFAULT 'pending'
- created_at TIMESTAMP
- reviewed_at TIMESTAMP
- reviewed_by UUID REFERENCES profiles(id)
```

---

## 🎯 Wishes & Tasks Tables

### 9. **wishes** ✅ ACTIVE
**Purpose:** User wishes (buyers looking for items)  
**Schema:**
```sql
- id UUID PRIMARY KEY
- title TEXT NOT NULL
- description TEXT NOT NULL
- budget_min INTEGER
- budget_max INTEGER
- category TEXT
- city_id TEXT REFERENCES cities(id)
- area_id TEXT REFERENCES areas(id)
- subarea_id TEXT
- owner_token TEXT REFERENCES profiles(client_token)
- owner_name TEXT
- owner_phone TEXT
- owner_whatsapp TEXT
- status TEXT DEFAULT 'active'
- urgency TEXT
- created_at TIMESTAMP
- updated_at TIMESTAMP
- expires_at TIMESTAMP
```

---

### 10. **tasks** ✅ ACTIVE
**Purpose:** Service tasks  
**Schema:**
```sql
- id UUID PRIMARY KEY
- title TEXT NOT NULL
- description TEXT NOT NULL
- price INTEGER NOT NULL
- task_category TEXT
- city_id TEXT REFERENCES cities(id)
- area_id TEXT REFERENCES areas(id)
- subarea_id TEXT
- owner_token TEXT REFERENCES profiles(client_token)
- owner_name TEXT
- owner_phone TEXT
- scheduled_date DATE
- scheduled_time TEXT
- status TEXT DEFAULT 'open'
- created_at TIMESTAMP
- updated_at TIMESTAMP
- completed_at TIMESTAMP
- completed_by UUID
- helper_id UUID
- accepted_at TIMESTAMP
- seeker_rating INTEGER
- helper_rating INTEGER
- seeker_review TEXT
- helper_review TEXT
```

---

### 11. **wish_reports** ✅ ACTIVE
**Purpose:** Report inappropriate wishes  
**Schema:**
```sql
- id UUID PRIMARY KEY
- wish_id UUID REFERENCES wishes(id) CASCADE
- reason TEXT
- reporter_token TEXT
- created_at TIMESTAMP
```

---

### 12. **task_reports** ✅ ACTIVE
**Purpose:** Report inappropriate tasks  
**Schema:**
```sql
- id UUID PRIMARY KEY
- task_id UUID REFERENCES tasks(id) CASCADE
- reason TEXT
- reporter_token TEXT
- created_at TIMESTAMP
```

---

### 13. **task_negotiations** ✅ ACTIVE (if exists)
**Purpose:** Price negotiations for tasks  
**Schema:**
```sql
- id UUID PRIMARY KEY
- task_id UUID REFERENCES tasks(id) CASCADE
- helper_id UUID REFERENCES profiles(id)
- proposed_price INTEGER
- message TEXT
- status TEXT
- created_at TIMESTAMP
- responded_at TIMESTAMP
```

---

### 14. **task_ratings** ✅ ACTIVE (if exists)
**Purpose:** Ratings for completed tasks  
**Schema:**
```sql
- id UUID PRIMARY KEY
- task_id UUID REFERENCES tasks(id) CASCADE
- rater_id UUID REFERENCES profiles(id)
- rated_user_id UUID REFERENCES profiles(id)
- rating INTEGER
- review TEXT
- created_at TIMESTAMP
```

---

### 15. **task_conversations** ✅ ACTIVE (if exists)
**Purpose:** Link tasks to chat conversations  
**Schema:**
```sql
- id UUID PRIMARY KEY
- task_id UUID REFERENCES tasks(id) CASCADE
- conversation_id UUID REFERENCES conversations(id) CASCADE
- created_at TIMESTAMP
```

---

## 💬 Chat Tables

### 16. **conversations** ✅ ACTIVE
**Purpose:** Chat conversations  
**Schema:**
```sql
- id UUID PRIMARY KEY
- listing_id UUID or TEXT
- listing_title TEXT
- listing_image TEXT
- listing_price INTEGER
- listing_type TEXT        -- 'marketplace', 'wish', 'task'
- buyer_id TEXT
- buyer_name TEXT
- buyer_avatar TEXT
- seller_id TEXT
- seller_name TEXT
- seller_avatar TEXT
- unread_count_buyer INTEGER DEFAULT 0
- unread_count_seller INTEGER DEFAULT 0
- last_message TEXT
- last_message_at TIMESTAMP
- created_at TIMESTAMP
- updated_at TIMESTAMP
- UNIQUE(listing_id, buyer_id, seller_id)
```

---

### 17. **messages** ✅ ACTIVE
**Purpose:** Chat messages  
**Schema:**
```sql
- id UUID PRIMARY KEY
- conversation_id UUID REFERENCES conversations(id) CASCADE
- sender_id TEXT
- sender_name TEXT
- sender_avatar TEXT
- content TEXT NOT NULL
- read BOOLEAN DEFAULT FALSE
- created_at TIMESTAMP
```

---

## 🔔 Notifications Tables

### 18. **notifications** ✅ ACTIVE
**Purpose:** In-app notifications  
**Schema:**
```sql
- id UUID PRIMARY KEY
- user_id TEXT REFERENCES profiles(client_token) CASCADE
- type TEXT CHECK (type IN ('message', 'listing_update', 'broadcast', ...))
- title TEXT NOT NULL
- message TEXT NOT NULL
- data JSONB
- read BOOLEAN DEFAULT FALSE
- created_at TIMESTAMP
```

---

### 19. **push_tokens** ✅ ACTIVE (if PWA enabled)
**Purpose:** Push notification tokens  
**Schema:**
```sql
- id UUID PRIMARY KEY
- user_id UUID REFERENCES auth.users(id) CASCADE
- token TEXT NOT NULL
- device_type TEXT
- created_at TIMESTAMP
- updated_at TIMESTAMP
- UNIQUE(user_id, token)
```

---

## 🔐 Auth Tables

### 20. **otp_verifications** ✅ ACTIVE
**Purpose:** OTP verification for phone auth  
**Schema:**
```sql
- id UUID PRIMARY KEY
- phone VARCHAR(20) NOT NULL
- session_id VARCHAR(100) UNIQUE
- otp VARCHAR(6)
- expires_at TIMESTAMP
- verified BOOLEAN DEFAULT FALSE
- created_at TIMESTAMP
```

---

## 🎛️ Admin Tables

### 21. **site_settings** ✅ ACTIVE
**Purpose:** Site-wide settings (banners, promos)  
**Schema:**
```sql
- id TEXT PRIMARY KEY
- setting_type TEXT        -- 'banner', 'greeting', 'floating_badge', 'ticker'
- enabled BOOLEAN
- message TEXT
- emoji TEXT
- gradient_color_1 TEXT
- gradient_color_2 TEXT
- text_color TEXT
- opacity NUMERIC
- created_at TIMESTAMP
- updated_at TIMESTAMP
```

---

### 22. **user_activity_logs** ✅ ACTIVE (if exists)
**Purpose:** Track user activity for badges  
**Schema:**
```sql
- id UUID PRIMARY KEY
- user_id UUID REFERENCES profiles(id) CASCADE
- activity_type TEXT
- metadata JSONB
- created_at TIMESTAMP
```

---

## ❌ Unused/Legacy Tables (Safe to Ignore)

These tables may be referenced in old code but are not actively used:

- `auth.users` - Supabase auth (using soft auth instead)
- `helper_preferences` - Old system
- `user_blocking` - Not implemented yet

---

## 🚨 CRITICAL ISSUES FOUND

### Issue 1: profiles table MISSING essential columns ❌

**Impact:** HIGH - Authentication completely broken  
**Affected Features:**
- Registration (password not saved)
- Login (can't verify password)
- Profile display (no display_name, avatar)
- Listings (no owner_token for identification)
- Admin (no is_admin flag)
- Location (no city/area/subarea columns)

**Solution:** Run `/database_migration_phone_auth.sql`

---

### Issue 2: listings table MISSING columns ❌

**Impact:** MEDIUM - Some features won't work  
**Missing:**
- `owner_token` - Can't identify listing owner properly
- `owner_name`, `owner_phone` - Denormalized data for performance
- `is_active` - Can't soft-delete/hide listings
- `status` - Can't track listing lifecycle
- `subarea_id` - Can't filter by subarea
- `condition` - Can't show item condition

---

### Issue 3: Foreign key mismatches ⚠️

**Problem:** Some tables reference `profiles(client_token)` but it doesn't exist yet

**Affected tables:**
- wishes.owner_token → profiles.client_token
- tasks.owner_token → profiles.client_token  
- notifications.user_id → profiles.client_token

**Fix:** Add client_token column first, then add foreign keys

---

### Issue 4: sub_areas table may not exist ⚠️

**Problem:** Code references `subarea_id` but table might not be created

**Check:** Run `SELECT * FROM information_schema.tables WHERE table_name = 'sub_areas';`

---

## ✅ Recommended Action Plan

### Step 1: Audit Current Database (5 min)
Run this SQL to see what exists:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Step 2: Check profiles columns (2 min)
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY column_name;
```

### Step 3: Check for foreign key issues (2 min)
```sql
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

### Step 4: Create Safe Migration (30 min)

Based on audit results, I'll create a comprehensive migration that:
- ✅ Adds missing columns to profiles
- ✅ Adds missing columns to listings, wishes, tasks
- ✅ Creates sub_areas table if needed
- ✅ Fixes foreign key references
- ✅ Migrates existing data
- ✅ Adds indexes for performance
- ✅ Does NOT break existing functionality

---

## 📋 Next Steps

**Please provide:**
1. Output of Step 1 (list of all tables)
2. Output of Step 2 (profiles columns)
3. Output of Step 3 (foreign keys)

Then I'll create a SAFE, COMPREHENSIVE migration that fixes everything without breaking anything.

---

**Status:** Awaiting database audit results  
**ETA:** 5 minutes to audit + 30 minutes to create safe migration  
**Risk:** LOW (audit-first approach, no destructive changes)
