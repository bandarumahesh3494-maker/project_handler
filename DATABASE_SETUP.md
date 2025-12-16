# Database Setup Guide

This project uses Supabase as its database. Follow these steps to set up the database schema.

## Prerequisites

- A Supabase account and project
- Your Supabase URL and anon key (already configured in `.env`)

## Setup Instructions

### 1. Access Supabase SQL Editor

1. Go to your Supabase project dashboard at https://supabase.com/dashboard
2. Navigate to the **SQL Editor** section in the left sidebar

### 2. Run Migration Files

The migrations must be run in chronological order (by timestamp in filename). Run each of these files in the SQL Editor:

1. **20251205012545_create_project_tracker_schema.sql** - Creates main tables (users, tasks, subtasks, milestones)
2. **20251205013030_remove_auth_requirements.sql** - Updates RLS policies for public access
3. **20251205014639_add_sub_subtasks.sql** - Adds sub-subtasks functionality
4. **20251205162645_add_config_table.sql** - Creates app configuration table
5. **20251205163623_add_opacity_to_row_colors.sql** - Updates row color configuration
6. **20251205163758_add_priority_to_tasks.sql** - Adds priority field to tasks
7. **20251205164252_add_category_colors_config.sql** - Adds category color configuration
8. **20251205181308_add_assigned_to_sub_subtasks.sql** - Adds assignment to sub-subtasks
9. **20251205181909_add_category_opacity_config.sql** - Adds category opacity settings
10. **20251205204421_fix_milestones_sub_subtask_constraint.sql** - Fixes milestone constraints
11. **20251208155929_add_action_history_table.sql** - Creates action history logging
12. **20251209015123_update_user_roles_to_user_admin_fixed.sql** - Updates user role definitions

### 3. Running a Migration

For each migration file:

1. Open the file in the `supabase/migrations/` directory
2. Copy the entire SQL content
3. Paste it into the Supabase SQL Editor
4. Click **Run** to execute
5. Verify there are no errors
6. Move to the next migration file

### 4. Verify Setup

After running all migrations, verify the following tables exist in your database:

- `users` - User profiles and roles
- `tasks` - Main tasks with categories
- `subtasks` - Subtasks linked to tasks
- `sub_subtasks` - Sub-subtasks for detailed tracking
- `milestones` - Milestone dates and status
- `app_config` - Application configuration
- `action_history` - User action logs

You can check this in the **Table Editor** section of your Supabase dashboard.

### 5. Refresh Application

Once all migrations are complete:

1. Return to the application
2. Click the **Retry Connection** button (if shown)
3. Or simply refresh the page

The application should now connect successfully to your database!

## Troubleshooting

### "Failed to fetch" or Connection Errors

- Verify your `.env` file has the correct Supabase URL and anon key
- Check that all migration files have been run successfully
- Ensure there are no SQL errors in the Supabase SQL Editor

### Tables Not Found

- Make sure you ran all migrations in the correct order
- Check the Supabase Table Editor to verify tables were created
- Look for error messages in the SQL Editor after running each migration

### RLS Policy Errors

- The application uses public access policies (USING true) for simplicity
- If you need authentication, you'll need to modify the RLS policies
- Check migration files for policy definitions

## Need Help?

If you encounter issues:

1. Check the browser console for detailed error messages
2. Review the Supabase logs in your dashboard
3. Verify your Supabase project is active and accessible
