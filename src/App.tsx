import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { CalendarDashboard } from './components/CalendarDashboard';
import { EngineerBreakdownDashboard } from './components/EngineerBreakdownDashboard';
import { KanbanDashboard } from './components/KanbanDashboard';
import { EngineerPerformanceDashboard } from './components/EngineerPerformanceDashboard';
import { TaskDelayDashboard } from './components/TaskDelayDashboard';
import { GanttChartDashboard } from './components/GanttChartDashboard';
import { TaskListDashboard } from './components/TaskListDashboard';
import { ConfigDashboard } from './components/ConfigDashboard';
import { HistoryDashboard } from './components/HistoryDashboard';
import { ResourceAnalysisDashboard } from './components/ResourceAnalysisDashboard';
import { ThemeSelector } from './components/ThemeSelector';
import { SetupWizard } from './components/SetupWizard';
import { useAuth } from './contexts/AuthContext';
import { useSchemaCheck } from './hooks/useSchemaCheck';
import { LayoutGrid, CalendarDays, Users, Kanban, TrendingDown, AlertCircle, Settings, BarChart3, List, History, UserCheck } from 'lucide-react';
import { useTheme } from './contexts/ThemeContext';

type ViewMode = 'timeline' | 'calendar' | 'engineer' | 'kanban' | 'engineer-performance' | 'task-delay' | 'gantt' | 'task-list' | 'history' | 'resource-analysis' | 'config';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const { colors } = useTheme();
  const { userProfile } = useAuth();
  const { isSetup, loading: schemaLoading, missingTables, checkSchema } = useSchemaCheck();

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';

  if (schemaLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <div className="text-white text-xl">Checking database setup...</div>
        </div>
      </div>
    );
  }

  if (!isSetup) {
    return <SetupWizard missingTables={missingTables} onRetry={checkSchema} supabaseUrl={supabaseUrl} />;
  }

  return (
    <div className={`min-h-screen ${colors.bg}`}>
      <div className={`${colors.headerBg} border-b ${colors.border} px-6 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'timeline'
                ? `${colors.accent} text-white`
                : `${colors.bgTertiary} ${colors.textSecondary} hover:bg-opacity-80`
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Timeline View
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'calendar'
                ? `${colors.accent} text-white`
                : `${colors.bgTertiary} ${colors.textSecondary} hover:bg-opacity-80`
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Calendar View
          </button>
          <button
            onClick={() => setViewMode('engineer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'engineer'
                ? `${colors.accent} text-white`
                : `${colors.bgTertiary} ${colors.textSecondary} hover:bg-opacity-80`
            }`}
          >
            <Users className="w-4 h-4" />
            User Breakdown
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'kanban'
                ? `${colors.accent} text-white`
                : `${colors.bgTertiary} ${colors.textSecondary} hover:bg-opacity-80`
            }`}
          >
            <Kanban className="w-4 h-4" />
            Kanban Board
          </button>
          <button
            onClick={() => setViewMode('gantt')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'gantt'
                ? `${colors.accent} text-white`
                : `${colors.bgTertiary} ${colors.textSecondary} hover:bg-opacity-80`
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Gantt Chart
          </button>
          <button
            onClick={() => setViewMode('task-list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'task-list'
                ? `${colors.accent} text-white`
                : `${colors.bgTertiary} ${colors.textSecondary} hover:bg-opacity-80`
            }`}
          >
            <List className="w-4 h-4" />
            Task List
          </button>
          <button
            onClick={() => setViewMode('engineer-performance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'engineer-performance'
                ? `${colors.accent} text-white`
                : `${colors.bgTertiary} ${colors.textSecondary} hover:bg-opacity-80`
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            User Performance
          </button>
          <button
            onClick={() => setViewMode('task-delay')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'task-delay'
                ? `${colors.accent} text-white`
                : `${colors.bgTertiary} ${colors.textSecondary} hover:bg-opacity-80`
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Task Delays
          </button>
          <button
            onClick={() => setViewMode('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'history'
                ? `${colors.accent} text-white`
                : `${colors.bgTertiary} ${colors.textSecondary} hover:bg-opacity-80`
            }`}
          >
            <History className="w-4 h-4" />
            History
          </button>
          <button
            onClick={() => setViewMode('resource-analysis')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'resource-analysis'
                ? `${colors.accent} text-white`
                : `${colors.bgTertiary} ${colors.textSecondary} hover:bg-opacity-80`
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Resources
          </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-white text-sm">
              {userProfile?.full_name} <span className="text-gray-400">({userProfile?.role})</span>
            </div>
            <ThemeSelector />
            <button
              onClick={() => setViewMode('config')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'config'
                  ? `${colors.accent} text-white`
                  : `${colors.bgTertiary} ${colors.textSecondary} hover:bg-opacity-80`
              }`}
            >
              <Settings className="w-4 h-4" />
              Config
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'timeline' && <Dashboard />}
      {viewMode === 'calendar' && <CalendarDashboard />}
      {viewMode === 'engineer' && <EngineerBreakdownDashboard />}
      {viewMode === 'kanban' && <KanbanDashboard />}
      {viewMode === 'gantt' && <GanttChartDashboard />}
      {viewMode === 'task-list' && <TaskListDashboard />}
      {viewMode === 'engineer-performance' && <EngineerPerformanceDashboard />}
      {viewMode === 'task-delay' && <TaskDelayDashboard />}
      {viewMode === 'history' && <HistoryDashboard />}
      {viewMode === 'resource-analysis' && <ResourceAnalysisDashboard />}
      {viewMode === 'config' && <ConfigDashboard />}
    </div>
  );
}

export default App;
