# Supabase Database Setup Guide for Property1313 CRM

This guide will walk you through connecting your Property1313 CRM to the Supabase cloud database.

---

## Step 1: Get Your Supabase Anon Key

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/pztmbvondjwoicmpsof
2. Click on **Project Settings** (gear icon in left sidebar)
3. Click on **Data API** in the left menu
4. Under "Project API keys", find the **anon** key (starts with `eyJ...`)
5. Click the **Copy** button next to it

> **Important:** The `anon` key is safe to use in the frontend. The `service_role` key should NEVER be exposed in the frontend.

---

## Step 2: Add Environment Variable to Vercel

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Find and click on your **property1313-crm** project
3. Click on **Settings** tab at the top
4. Click on **Environment Variables** in the left menu
5. Add a new environment variable:
   - **Name:** `VITE_SUPABASE_ANON_KEY`
   - **Value:** Paste the anon key you copied from Step 1
   - **Environment:** Select all (Production, Preview, Development)
6. Click **Save**

---

## Step 3: Run the Database Schema

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/pztmbvondjwoicmpsof
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file `supabase/schema.sql` from your project
5. Copy the entire contents and paste it into the SQL Editor
6. Click **Run** (the green play button)

This will:
- Create all 9 tables (users, leads, projects, followups, visits, loan_inquiries, notifications, audit_logs, master_values)
- Enable Row Level Security (RLS)
- Create RLS policies (allow all operations for now)
- Insert 6 default users
- Insert 2 default projects

---

## Step 4: Redeploy on Vercel

1. Go to your Vercel Dashboard
2. Click on your project
3. Go to the **Deployments** tab
4. Find the latest deployment and click the **...** menu
5. Click **Redeploy** and select **Use existing Build Cache: NO**

OR simply push a new commit to GitHub (Vercel auto-deploys):

```bash
git add .
git commit -m "Add Supabase database integration"
git push origin main
```

---

## Step 5: Verify Connection

1. Open your live site: https://p1313.xyz
2. Login with your credentials
3. Look at the top navigation bar - you should see a **"Cloud"** badge (green) instead of **"Local"** (amber)
4. This means your database is connected!

---

## What Happens When Connected

| Feature | Local Mode (Before) | Cloud Mode (After) |
|---|---|---|
| Leads | Stored in browser only | Synced to Supabase |
| Projects | Stored in browser only | Synced to Supabase |
| Follow-ups | Stored in browser only | Synced to Supabase |
| Visits | Stored in browser only | Synced to Supabase |
| Loan Inquiries | Stored in browser only | Synced to Supabase |
| Notifications | Stored in browser only | Synced to Supabase |
| Data Persistence | Lost on browser clear | Permanent in cloud |
| Multi-device | Not possible | Works across devices |
| Backup | None | Automatic via Supabase |

---

## Troubleshooting

### Still showing "Local" badge after adding key?

1. **Check the key is correct** - Make sure you copied the `anon` key, not the `service_role` key
2. **Redeploy** - Environment variables only take effect after a new deployment
3. **Check browser console** - Open DevTools (F12) and look for any Supabase connection errors
4. **Verify the variable name** - Must be exactly `VITE_SUPABASE_ANON_KEY` (all caps, underscores)

### "Failed to fetch" errors?

1. Check if the tables exist in Supabase: Go to **Table Editor** and verify all 9 tables are listed
2. If tables are missing, re-run the `schema.sql` in the SQL Editor
3. Check RLS policies: Go to each table → **Policies** and verify policies exist

### Data not showing after connecting?

1. The app will sync data from Supabase on load - wait a moment for the sync to complete
2. Click the **Sync now** button in the Cloud badge tooltip to force a sync
3. Check if the seed data was inserted properly in Supabase Table Editor

---

## Your Supabase Project Details

| Detail | Value |
|---|---|
| Project URL | https://pztmbvondjwoicmpsof.supabase.co |
| Region | (shown in Supabase dashboard) |
| Database | PostgreSQL 15 |
| Tables | 9 |

---

## Security Note

The current RLS policies allow all operations without authentication. This is fine for initial setup. For production:

1. Enable Supabase Auth
2. Update RLS policies to check `auth.uid()`
3. Use Row Level Security to restrict data access by user role

This can be done later once the basic setup is working.
