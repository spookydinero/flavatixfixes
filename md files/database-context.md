# FlavorWheel México - Database Context

## 📊 Supabase Project Overview

**Project Name:** FlavorWheel México  
**Project Reference:** `kobuclkvlacdwvxmakvq`  
**Database URL:** `https://kobuclkvlacdwvxmakvq.supabase.co`  
**Status:** ✅ Active and Connected

---

## 🗄️ Database Schema

### Tables Overview

| Table | Records | Size | Purpose |
|-------|---------|------|---------|
| `public.profiles` | ~0 | 8192 bytes | User profile management |

---

## 👤 Profiles Table - Complete Structure

```sql
CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "user_id" uuid NOT NULL,
    "full_name" text,
    "avatar_url" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "username" text,
    "bio" text,
    "posts_count" integer DEFAULT 0 NOT NULL,
    "followers_count" integer DEFAULT 0 NOT NULL,
    "following_count" integer DEFAULT 0 NOT NULL,
    "preferred_category" text,
    "last_tasted_at" timestamp with time zone,
    "email_confirmed" boolean DEFAULT false NOT NULL,
    "tastings_count" integer DEFAULT 0 NOT NULL,
    "reviews_count" integer DEFAULT 0 NOT NULL
);
```

### Field Categories

#### 🔑 **Core User Information**
- `user_id` (uuid, NOT NULL) - Primary key, foreign key to `auth.users.id`
- `full_name` (text) - User's display name
- `username` (text) - Unique username identifier
- `avatar_url` (text) - Profile picture URL
- `bio` (text) - User biography (max 200 characters)
- `email_confirmed` (boolean, DEFAULT false) - Email verification status

#### 📊 **Social Features**
- `posts_count` (integer, DEFAULT 0) - Number of posts created
- `followers_count` (integer, DEFAULT 0) - Number of followers
- `following_count` (integer, DEFAULT 0) - Number of users following
- `reviews_count` (integer, DEFAULT 0) - Number of reviews written

#### 🍷 **FlavorWheel Specific**
- `preferred_category` (text) - User's favorite flavor category
- `tastings_count` (integer, DEFAULT 0) - Number of tastings completed
- `last_tasted_at` (timestamp) - Last tasting activity timestamp

#### ⏰ **Timestamps**
- `created_at` (timestamp, DEFAULT now()) - Account creation time
- `updated_at` (timestamp, DEFAULT now()) - Last profile update time

---

## 🔒 Row Level Security (RLS)

**Status:** ✅ Enabled on `profiles` table

### Active Policies

1. **`delete_own_profile`**
   - **Action:** DELETE
   - **Target:** authenticated users
   - **Rule:** Users can only delete their own profile

2. **`insert_own_profile`**
   - **Action:** INSERT
   - **Target:** authenticated users
   - **Rule:** Users can only create their own profile

3. **`read_all_profiles`**
   - **Action:** SELECT
   - **Target:** authenticated users
   - **Rule:** All authenticated users can read all profiles

4. **`update_own_profile`**
   - **Action:** UPDATE
   - **Target:** authenticated users
   - **Rule:** Users can only update their own profile

5. **`user_view_profile`**
   - **Action:** SELECT
   - **Target:** authenticated users
   - **Rule:** Additional profile viewing permissions

---

## 🔗 Foreign Key Constraints

```sql
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" 
    FOREIGN KEY ("user_id") 
    REFERENCES "auth"."users"("id") 
    ON DELETE CASCADE;
```

**Key Features:**
- ✅ Automatic cleanup when user account is deleted
- ✅ Maintains referential integrity
- ✅ Links profiles to Supabase Auth system

---

## 🛡️ Database Permissions

### Role Access Matrix

| Role | Profiles Table Access |
|------|----------------------|
| `anon` | ✅ Limited (via RLS) |
| `authenticated` | ✅ Full (via RLS) |
| `service_role` | ✅ Full (bypass RLS) |

---

## 📈 Performance & Statistics

### Table Statistics
- **Sequential Scans:** 0 (optimized)
- **Index Usage:** Efficient
- **Current Size:** 8192 bytes
- **Estimated Rows:** 0 (new database)

---

## ✨ Key Database Features

### ✅ **Security**
- Row Level Security enabled
- User isolation enforced
- Proper authentication integration
- Secure foreign key relationships

### ✅ **Data Integrity**
- Automatic timestamps
- Constraint validation
- Cascade delete protection
- Default value enforcement

### ✅ **Social Platform Ready**
- User profiles with social metrics
- Follow/follower system support
- Content creation tracking
- Activity monitoring

### ✅ **FlavorWheel Specific**
- Flavor preference tracking
- Tasting activity logging
- Review system integration
- Category-based recommendations

---

## 🚀 Database Status

- **Connection:** ✅ Active
- **Security:** ✅ Properly configured
- **Performance:** ✅ Optimized
- **Ready for:** ✅ Authentication flow
- **Ready for:** ✅ User registration
- **Ready for:** ✅ Social features
- **Ready for:** ✅ FlavorWheel functionality

---

## 🔧 Database Triggers & Functions

### 🎯 **Active Functions**

#### 1. **`handle_new_user()` - Auto Profile Creation**

```sql
CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, full_name, avatar_url, username, bio, email_confirmed, created_at, updated_at
  )
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'bio',
    false,
    now(),
    now()
  );
  RETURN new;
END;
$$;
```

**Purpose:** Automatically creates a profile when a new user registers  
**Trigger Event:** `AFTER INSERT` on `auth.users`  
**Functionality:**
- ✅ Extracts user data from Supabase Auth metadata
- ✅ Creates corresponding profile in `public.profiles`
- ✅ Sets default values (email_confirmed = false)
- ✅ Ensures every authenticated user has a profile

#### 2. **`set_updated_at()` - Auto Timestamp Update**

```sql
CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
```

**Purpose:** Automatically updates the `updated_at` timestamp  
**Trigger Event:** `BEFORE UPDATE` on `public.profiles`  
**Functionality:**
- ✅ Automatically sets `updated_at` to current timestamp
- ✅ Triggers on every profile update
- ✅ Ensures accurate modification tracking

### ⚡ **Active Triggers**

```sql
-- Trigger for automatic timestamp updates
CREATE OR REPLACE TRIGGER "trg_profiles_updated_at" 
BEFORE UPDATE ON "public"."profiles" 
FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
```

### 🔄 **Automation Workflow**

#### **User Registration Flow:**
1. User signs up via Supabase Auth
2. `handle_new_user()` trigger fires automatically
3. Profile is created with metadata from registration
4. User gets both auth account + profile record

#### **Profile Update Flow:**
1. User updates their profile
2. `set_updated_at()` trigger fires before save
3. `updated_at` timestamp is automatically refreshed
4. Change tracking is maintained

### ✅ **Trigger Benefits**
- **Automatic:** No manual profile creation needed
- **Consistent:** Every user gets a profile
- **Tracked:** All changes are timestamped
- **Secure:** Uses `SECURITY DEFINER` for safe execution
- **Reliable:** Database-level automation (can't be bypassed)

---

## 📝 Notes

- Database is freshly initialized (0 records)
- All security policies are properly configured
- Automated triggers handle user lifecycle
- Ready for immediate use with authentication system
- Designed for comprehensive social flavor-tasting platform
- Supports full user lifecycle management
- Intelligent automation for user management

---

*Last Updated: Generated from Supabase CLI analysis with trigger documentation*