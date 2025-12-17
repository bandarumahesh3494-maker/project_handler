# Project Tracker - Quick Setup Guide

This guide will help you set up the Project Tracker application with automatic database detection and setup.

## Quick Start

### 1. Configure Supabase Credentials

Edit the `.env` file in the project root:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Start the Application

```bash
npm install
npm run dev
```

### 3. Automatic Setup Detection

When you first access the application, it will:

1. **Check Database Schema** - Automatically detect if required tables exist
2. **Show Setup Wizard** - If tables are missing, display a guided setup wizard
3. **Provide SQL Script** - Give you a ready-to-use initialization script
4. **Verify Setup** - Confirm when everything is configured correctly

## Automatic Setup Wizard

The application includes an intelligent setup wizard that:

- Detects missing database tables automatically
- Provides step-by-step instructions
- Links directly to your Supabase SQL Editor
- Shows exactly what needs to be configured
- Verifies the setup when complete

### What Gets Detected

The system checks for these essential tables:
- `users` - User profiles and roles
- `tasks` - Project tasks
- `subtasks` - Task breakdowns
- `sub_subtasks` - Detailed work items
- `milestones` - Progress tracking
- `app_config` - Application settings
- `action_history` - Audit log

## Database Initialization

### Option 1: Using the Setup Wizard (Recommended)

1. Open the application
2. The wizard will automatically appear if setup is needed
3. Click "Open SQL Editor" to go to Supabase
4. Copy the SQL script from `supabase/init-schema.sql`
5. Paste and run it in the Supabase SQL Editor
6. Click "Verify & Continue" in the wizard

### Option 2: Manual Setup

Run the complete initialization script:

```bash
# Location of the script
supabase/init-schema.sql
```

Copy the contents and paste into your Supabase SQL Editor, then execute.

### Option 3: Using Individual Migrations

If you prefer to run migrations individually, execute them in order from the `supabase/migrations/` directory:

1. `20251205012545_create_project_tracker_schema.sql`
2. `20251205013030_remove_auth_requirements.sql`
3. `20251205014639_add_sub_subtasks.sql`
4. ... (see DATABASE_SETUP.md for complete list)

## Changing Supabase Credentials

When you need to switch to a different Supabase project:

1. **Update .env File**
   ```bash
   VITE_SUPABASE_URL=https://new-project.supabase.co
   VITE_SUPABASE_ANON_KEY=new-anon-key
   ```

2. **Restart Development Server**
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

3. **Automatic Detection**
   - The app will automatically detect the new database
   - If tables don't exist, the setup wizard will appear
   - Follow the wizard to initialize the new database

4. **Run Initialization Script**
   - Open Supabase SQL Editor for the new project
   - Run `supabase/init-schema.sql`
   - Verify and continue

## Docker Deployment

When deploying with Docker, credentials are set at build time:

```bash
docker-compose up -d
```

The Docker setup automatically uses credentials from `.env`. If you change credentials:

1. Update `.env` file
2. Rebuild the container:
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

## Features

### Automatic Table Detection
- Checks if each required table exists
- Identifies exactly which tables are missing
- Provides specific guidance for setup

### Setup Wizard
- Beautiful, step-by-step interface
- Direct links to Supabase SQL Editor
- Progress tracking
- Verification system

### Error Handling
- Clear error messages
- Connection status indicators
- Helpful troubleshooting information

## Troubleshooting

### Setup Wizard Doesn't Appear
- The wizard only shows if tables are missing
- If you see the main app, your database is already configured
- To reset: drop all tables in Supabase and refresh

### "Failed to Fetch" Errors
- Verify your Supabase credentials in `.env`
- Check that your Supabase project is active
- Ensure network connectivity to Supabase

### Tables Not Being Created
- Make sure you ran the entire `init-schema.sql` script
- Check for SQL errors in the Supabase SQL Editor
- Verify you have permissions to create tables

### Wizard Shows Tables as Missing When They Exist
- Check table names match exactly (lowercase)
- Verify tables are in the `public` schema
- Ensure RLS (Row Level Security) is enabled

## Architecture

### Schema Detection System

**File**: `src/hooks/useSchemaCheck.ts`
- Queries each required table
- Detects connection issues
- Returns setup status and missing tables

**File**: `src/components/SetupWizard.tsx`
- Interactive setup interface
- Step-by-step guidance
- Direct integration with Supabase

**File**: `src/App.tsx`
- Integrates schema check
- Shows wizard when needed
- Loads main app when ready

## Database Schema

The complete schema includes:
- **7 tables** with proper relationships
- **Row Level Security (RLS)** enabled on all tables
- **Public access policies** for simplified authentication
- **Indexes** for optimized queries
- **Foreign key constraints** for data integrity
- **Default configuration** values

## Next Steps

After setup is complete:

1. **Add Users** - Create user profiles for your team
2. **Create Tasks** - Start organizing your projects
3. **Configure Settings** - Customize colors and options
4. **Invite Team** - Share your Supabase project

## Support

- **Setup Issues**: See `DATABASE_SETUP.md`
- **Docker Deployment**: See `DOCKER_README.md`
- **General Usage**: Check the in-app config dashboard

The automatic setup system makes it easy to get started with any Supabase project!
