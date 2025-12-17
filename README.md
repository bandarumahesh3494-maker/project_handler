# Project Tracker

A comprehensive project management and task tracking application built with React, TypeScript, and Supabase.

## Features

- **Multiple Dashboard Views**: Timeline, Calendar, Kanban, Gantt Chart, Task List, and more
- **Task Management**: Hierarchical task organization (Tasks → Subtasks → Sub-subtasks)
- **Milestone Tracking**: Track progress with configurable milestone statuses
- **User Assignment**: Assign tasks to team members
- **Action History**: Complete audit log of all changes
- **Customizable Themes**: Multiple color themes including Dark, Blue, Green, and Purple
- **Resource Analysis**: Track team workload and performance
- **Automatic Setup**: Smart detection of database configuration

## Quick Start

### 1. Configure Supabase

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Supabase credentials
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get your credentials from: Supabase Dashboard → Settings → API

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Automatic Database Setup

When you first open the application:

1. **Automatic Detection** - The app checks if your database is configured
2. **Setup Wizard Appears** - If tables are missing, you'll see a step-by-step wizard
3. **Run SQL Script** - Copy and run `supabase/init-schema.sql` in Supabase SQL Editor
4. **Verify & Continue** - The app confirms setup is complete

That's it! The application handles the rest automatically.

## Changing Supabase Credentials

To switch to a different Supabase project:

1. **Update `.env`** with new credentials
2. **Restart the dev server** (Ctrl+C, then `npm run dev`)
3. **Automatic Detection** - The app detects the new database
4. **Follow Setup Wizard** - If needed, run the initialization script

The app automatically detects when credentials change and guides you through setup.

## Docker Deployment

### Using Docker Compose

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

Access at: `http://localhost:3000`

### Quick Deploy Script

```bash
# Interactive deployment menu
./deploy.sh
```

For detailed Docker instructions, see [DOCKER_README.md](DOCKER_README.md)

## Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Comprehensive setup and credential management
- **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - Detailed database configuration
- **[DOCKER_README.md](DOCKER_README.md)** - Docker deployment guide

## Project Structure

```
project-tracker/
├── src/
│   ├── components/        # React components
│   │   ├── Dashboard.tsx
│   │   ├── SetupWizard.tsx
│   │   └── ...
│   ├── hooks/            # Custom React hooks
│   │   ├── useSchemaCheck.ts
│   │   ├── useTrackerData.ts
│   │   └── useConfig.ts
│   ├── contexts/         # React contexts
│   ├── lib/             # Utilities and Supabase client
│   └── types/           # TypeScript type definitions
├── supabase/
│   ├── init-schema.sql  # Complete database initialization
│   └── migrations/      # Individual migration files
├── Dockerfile           # Docker build configuration
├── docker-compose.yml   # Docker Compose setup
└── nginx.conf          # Production web server config
```

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Docker + Nginx

## Key Features

### Automatic Setup System

The application includes an intelligent setup wizard that:
- Detects missing database tables on startup
- Provides step-by-step setup instructions
- Links directly to Supabase SQL Editor
- Verifies configuration automatically
- Works seamlessly when changing credentials

### Multiple Dashboard Views

1. **Timeline View** - Gantt-style timeline with task dependencies
2. **Calendar View** - Month/week/day calendar with milestones
3. **Kanban Board** - Drag-and-drop task management
4. **Gantt Chart** - Visual project timeline
5. **Task List** - Detailed task list with filtering
6. **User Breakdown** - Task distribution by team member
7. **User Performance** - Performance metrics and analytics
8. **Task Delays** - Identify and track delayed tasks
9. **History** - Complete audit log of all changes
10. **Resources** - Workload and capacity analysis

### Task Hierarchy

```
Task (e.g., "Frontend Development")
├── Subtask (e.g., "UI Components")
│   ├── Sub-subtask (e.g., "Button Component")
│   │   └── Milestones (e.g., "Dev Complete", "Tested")
│   └── Sub-subtask (e.g., "Form Component")
└── Subtask (e.g., "State Management")
```

### Customization

- **Themes**: Dark, Blue, Green, Purple
- **Categories**: Dev, Test, Infra, Support (with custom colors)
- **Milestones**: Configurable status options
- **Row Colors**: Customizable planned vs actual colors

## Development

### Build for Production

```bash
npm run build
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

## Database Schema

The application uses these tables:
- `users` - User profiles and roles
- `tasks` - Main project tasks
- `subtasks` - Task breakdowns
- `sub_subtasks` - Detailed work items
- `milestones` - Progress tracking points
- `app_config` - Application configuration
- `action_history` - Audit log

All tables have:
- Row Level Security (RLS) enabled
- Public access policies (for simplified auth)
- Proper indexes for performance
- Foreign key constraints

## Security Notes

This application uses public access policies on database tables for simplicity. For production use with sensitive data:

1. Enable Supabase Authentication
2. Update RLS policies to check `auth.uid()`
3. Implement proper user authentication flow
4. Restrict access based on user roles

See migration files in `supabase/migrations/` for policy examples.

## Troubleshooting

### Setup Wizard Appears Every Time
- Ensure all tables were created successfully
- Check Supabase SQL Editor for error messages
- Verify the complete `init-schema.sql` script ran

### Connection Errors
- Verify Supabase credentials in `.env`
- Check that your Supabase project is active
- Ensure network connectivity

### Docker Build Fails
- Verify `.env` file exists with valid credentials
- Clear Docker cache: `docker-compose build --no-cache`
- Check Docker logs: `docker-compose logs`

## Contributing

This is a self-contained project tracker. Feel free to customize it for your needs:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - Feel free to use this project for personal or commercial purposes.

## Support

For issues or questions:
- Check the documentation files in the project root
- Review the setup wizard instructions
- Examine the Supabase logs for database errors

---

Built with React, TypeScript, and Supabase | Docker-ready | Auto-configuring
