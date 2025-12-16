#!/bin/sh
set -e

echo "Starting Project Tracker application..."

# Display build version if available
if [ -f /usr/share/nginx/html/BUILD_VERSION_DATA.json ]; then
    echo "Build version information:"
    cat /usr/share/nginx/html/BUILD_VERSION_DATA.json
fi

# Check if Supabase configuration is available (optional, for debugging)
if [ -n "$VITE_SUPABASE_URL" ]; then
    echo "Supabase URL configured: $VITE_SUPABASE_URL"
else
    echo "Warning: VITE_SUPABASE_URL not set. Application may not function correctly."
fi

# Execute the CMD (nginx)
exec "$@"
