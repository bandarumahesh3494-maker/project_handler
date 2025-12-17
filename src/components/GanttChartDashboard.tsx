import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Calendar } from 'lucide-react';
import { useTrackerData } from '../hooks/useTrackerData';
import { useConfig } from '../hooks/useConfig';
import { useTheme } from '../contexts/ThemeContext';

interface GanttTask {
  id: string;
  name: string;
  type: 'task' | 'subtask' | 'subsubtask';
  category?: string;
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
  duration?: number;
  progress?: number;
  children?: GanttTask[];
  taskId?: string;
}

export const GanttChartDashboard: React.FC = () => {
  const { groupedData, users, loading, error } = useTrackerData();
  const { colors } = useTheme();
  const { categoryColors, loading: configLoading } = useConfig();
  const [collapsedTasks, setCollapsedTasks] = useState<Set<string>>(new Set());
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);

  const toggleTask = (taskId: string) => {
    setCollapsedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const getCategoryColor = (category: string) => {
    const categoryKey = category as keyof typeof categoryColors;
    return categoryColors[categoryKey] || '#6b7280';
  };

  const ganttData = useMemo(() => {
    const tasks: GanttTask[] = [];

    groupedData.forEach(({ task, subtasks }) => {
      const taskMilestones: string[] = [];
      const subtaskChildren: GanttTask[] = [];

      subtasks.forEach(({ subtask, milestones, subSubtasks, assignedUser }) => {
        if (subtask.name.toUpperCase() === 'PLANNED') return;

        const subtaskMilestoneDates = milestones.map(m => m.milestone_date).sort();
        const subtaskStart = subtaskMilestoneDates[0];
        const subtaskEnd = subtaskMilestoneDates[subtaskMilestoneDates.length - 1];

        taskMilestones.push(...subtaskMilestoneDates);

        const subSubChildren: GanttTask[] = [];
        subSubtasks.forEach(({ subSubtask, milestones: subMilestones }) => {
          const subSubDates = subMilestones.map(m => m.milestone_date).sort();
          const subSubStart = subSubDates[0];
          const subSubEnd = subSubDates[subSubDates.length - 1];
          const duration = subSubStart && subSubEnd
            ? Math.ceil((new Date(subSubEnd).getTime() - new Date(subSubStart).getTime()) / (1000 * 60 * 60 * 24))
            : 0;

          const isClosed = subMilestones.some(m => m.milestone_text.toUpperCase() === 'CLOSED');
          const progress = isClosed ? 100 : 0;

          subSubChildren.push({
            id: subSubtask.id,
            name: subSubtask.name,
            type: 'subsubtask',
            assignedTo: assignedUser?.full_name,
            startDate: subSubStart,
            endDate: subSubEnd,
            duration,
            progress,
            taskId: task.id
          });
        });

        const duration = subtaskStart && subtaskEnd
          ? Math.ceil((new Date(subtaskEnd).getTime() - new Date(subtaskStart).getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        const isClosed = milestones.some(m => m.milestone_text.toUpperCase() === 'CLOSED');
        const progress = isClosed ? 100 : subSubChildren.length > 0
          ? Math.round(subSubChildren.reduce((sum, c) => sum + (c.progress || 0), 0) / subSubChildren.length)
          : 0;

        subtaskChildren.push({
          id: subtask.id,
          name: subtask.name,
          type: 'subtask',
          assignedTo: assignedUser?.full_name,
          startDate: subtaskStart,
          endDate: subtaskEnd,
          duration,
          progress,
          children: subSubChildren.length > 0 ? subSubChildren : undefined,
          taskId: task.id
        });
      });

      const allDates = taskMilestones.sort();
      const taskStart = allDates[0];
      const taskEnd = allDates[allDates.length - 1];
      const duration = taskStart && taskEnd
        ? Math.ceil((new Date(taskEnd).getTime() - new Date(taskStart).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const progress = subtaskChildren.length > 0
        ? Math.round(subtaskChildren.reduce((sum, s) => sum + (s.progress || 0), 0) / subtaskChildren.length)
        : 0;

      tasks.push({
        id: task.id,
        name: task.name,
        type: 'task',
        category: task.category,
        startDate: taskStart,
        endDate: taskEnd,
        duration,
        progress,
        children: subtaskChildren.length > 0 ? subtaskChildren : undefined
      });
    });

    return tasks;
  }, [groupedData]);

  const dateRange = useMemo(() => {
    const allDates: string[] = [];
    const collectDates = (tasks: GanttTask[]) => {
      tasks.forEach(task => {
        if (task.startDate) allDates.push(task.startDate);
        if (task.endDate) allDates.push(task.endDate);
        if (task.children) collectDates(task.children);
      });
    };
    collectDates(ganttData);

    if (allDates.length === 0) return [];

    const sortedDates = allDates.sort();
    const startDate = new Date(sortedDates[0]);
    const endDate = new Date(sortedDates[sortedDates.length - 1]);

    startDate.setDate(startDate.getDate() - 3);
    endDate.setDate(endDate.getDate() + 3);

    const dates: string[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  }, [ganttData]);

  const getTaskPosition = (startDate: string, endDate: string) => {
    const start = dateRange.indexOf(startDate);
    const end = dateRange.indexOf(endDate);
    if (start === -1 || end === -1) return null;

    const leftPercent = (start / dateRange.length) * 100;
    const widthPercent = ((end - start + 1) / dateRange.length) * 100;

    return { left: `${leftPercent}%`, width: `${widthPercent}%` };
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderTask = (task: GanttTask, level: number = 0) => {
    const isCollapsed = collapsedTasks.has(task.id);
    const hasChildren = task.children && task.children.length > 0;
    const position = task.startDate && task.endDate ? getTaskPosition(task.startDate, task.endDate) : null;

    return (
      <React.Fragment key={task.id}>
        <tr className={`${colors.cardBg} border-b ${colors.border} hover:bg-gray-800/50`}>
          <td className={`sticky left-0 z-10 ${colors.cardBg} border-r ${colors.border} px-3 py-2 w-[120px]`}>
            {task.type === 'task' && task.category && (
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: getCategoryColor(task.category) }}
                />
                <span className="text-sm font-medium uppercase">{task.category}</span>
              </div>
            )}
          </td>
          <td className={`sticky left-[120px] z-10 ${colors.cardBg} border-r ${colors.border} px-3 py-2 w-[250px]`}>
            {task.type === 'task' && (
              <div className="flex items-center gap-2">
                {hasChildren && (
                  <button onClick={() => toggleTask(task.id)} className={`${colors.textSecondary} hover:${colors.text}`}>
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}
                <span className="font-semibold truncate">{task.name}</span>
              </div>
            )}
          </td>
          <td className={`sticky left-[370px] z-10 ${colors.cardBg} border-r ${colors.border} px-3 py-2 w-[200px]`} style={{ paddingLeft: task.type !== 'task' ? `${(level - 1) * 20 + 12}px` : '12px' }}>
            {task.type !== 'task' && (
              <div className="flex items-center gap-2">
                {hasChildren && (
                  <button onClick={() => toggleTask(task.id)} className={`${colors.textSecondary} hover:${colors.text}`}>
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}
                {!hasChildren && task.type === 'subsubtask' && <div className="w-4" />}
                <span className={`${task.type === 'subtask' ? 'font-medium' : ''} truncate`}>{task.name}</span>
              </div>
            )}
          </td>
          <td className={`sticky left-[570px] z-10 ${colors.cardBg} border-r ${colors.border} px-3 py-2 w-[150px] text-sm`}>
            {task.assignedTo || '-'}
          </td>
          <td className="relative px-0 py-2 min-w-[800px]">
            <div className="relative h-8 flex">
              {dateRange.map((date, index) => {
                const isToday = date === new Date().toISOString().split('T')[0];
                return (
                  <div
                    key={date}
                    className={`flex-1 border-r ${colors.border} ${isToday ? 'bg-blue-500/20' : ''}`}
                    style={{ minWidth: '30px' }}
                  />
                );
              })}
              {position && (
                <div className="absolute inset-0 px-1">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 rounded h-6 flex items-center overflow-hidden cursor-pointer group shadow-md"
                    style={{
                      left: position.left,
                      width: position.width,
                      backgroundColor: task.category ? getCategoryColor(task.category) : '#3b82f6',
                      minWidth: '40px',
                      opacity: 0.9
                    }}
                    onMouseEnter={() => setHoveredTask(task.id)}
                    onMouseLeave={() => setHoveredTask(null)}
                  >
                    <div
                      className="h-full bg-white/30"
                      style={{ width: `${task.progress || 0}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center px-2 text-xs text-white font-semibold">
                      <span className="truncate">{task.progress !== undefined && `${task.progress}%`}</span>
                    </div>

                    {hoveredTask === task.id && (
                      <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 ${colors.cardBg} border-2 ${colors.border} rounded-lg shadow-2xl p-4 min-w-[280px] z-50 pointer-events-none`}>
                        <div className="space-y-2">
                          <div className={`font-bold text-base ${colors.text} border-b-2 ${colors.border} pb-2 mb-2`}>{task.name}</div>
                          {task.type === 'task' && task.category && (
                            <div className="flex items-center gap-2">
                              <span className={`${colors.textSecondary} text-sm font-medium`}>Category:</span>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded shadow"
                                  style={{ backgroundColor: getCategoryColor(task.category) }}
                                />
                                <span className="text-sm font-semibold uppercase">{task.category}</span>
                              </div>
                            </div>
                          )}
                          {task.assignedTo && (
                            <div className="flex items-center gap-2">
                              <span className={`${colors.textSecondary} text-sm font-medium`}>Assigned to:</span>
                              <span className="text-sm font-semibold">{task.assignedTo}</span>
                            </div>
                          )}
                          {task.startDate && (
                            <div className="flex items-center gap-2">
                              <span className={`${colors.textSecondary} text-sm font-medium`}>Start:</span>
                              <span className="text-sm font-semibold">{formatDate(task.startDate)}</span>
                            </div>
                          )}
                          {task.endDate && (
                            <div className="flex items-center gap-2">
                              <span className={`${colors.textSecondary} text-sm font-medium`}>End:</span>
                              <span className="text-sm font-semibold">{formatDate(task.endDate)}</span>
                            </div>
                          )}
                          {task.duration !== undefined && (
                            <div className="flex items-center gap-2">
                              <span className={`${colors.textSecondary} text-sm font-medium`}>Duration:</span>
                              <span className="text-sm font-semibold">{task.duration} day{task.duration !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                          {task.progress !== undefined && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className={`${colors.textSecondary} text-sm font-medium`}>Progress:</span>
                                <span className="text-sm font-bold">{task.progress}%</span>
                              </div>
                              <div className="w-full h-2.5 bg-gray-700 rounded-full overflow-hidden shadow-inner">
                                <div
                                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 shadow"
                                  style={{ width: `${task.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className={`absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent`} style={{ borderTopColor: colors.cardBg.includes('800') ? '#1f2937' : '#374151' }} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
        {!isCollapsed && hasChildren && task.children!.map(child => renderTask(child, level + 1))}
      </React.Fragment>
    );
  };

  if (loading || configLoading) {
    return (
      <div className={`min-h-screen ${colors.bg} ${colors.text} flex items-center justify-center`}>
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${colors.bg} ${colors.text} flex items-center justify-center`}>
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${colors.bg} ${colors.text}`}>
      <header className={`${colors.headerBg} border-b ${colors.border} px-6 py-4`}>
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-blue-500" />
          <h1 className="text-2xl font-bold">Gantt Chart</h1>
        </div>
      </header>

      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className={colors.headerBg}>
                <th className={`sticky left-0 z-20 ${colors.headerBg} border ${colors.border} px-3 py-3 text-left font-semibold w-[120px]`}>
                  Category
                </th>
                <th className={`sticky left-[120px] z-20 ${colors.headerBg} border ${colors.border} px-3 py-3 text-left font-semibold w-[250px]`}>
                  Task Name
                </th>
                <th className={`sticky left-[370px] z-20 ${colors.headerBg} border ${colors.border} px-3 py-3 text-left font-semibold w-[200px]`}>
                  Subtask
                </th>
                <th className={`sticky left-[570px] z-20 ${colors.headerBg} border ${colors.border} px-3 py-3 text-left font-semibold w-[150px]`}>
                  Engineer/Lead
                </th>
                <th className={`${colors.headerBg} border ${colors.border} px-0 py-3 font-semibold`}>
                  <div className="flex min-w-[1000px]">
                    {dateRange.map((date, index) => {
                      const showLabel = index % 5 === 0;
                      const isToday = date === new Date().toISOString().split('T')[0];
                      return (
                        <div
                          key={date}
                          className={`flex-1 text-center text-xs border-r ${colors.border} ${isToday ? 'bg-blue-500/20 font-bold' : ''}`}
                          style={{ minWidth: '30px' }}
                        >
                          {showLabel ? formatDate(date) : ''}
                        </div>
                      );
                    })}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {ganttData.map(task => renderTask(task))}
              {ganttData.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    No tasks with milestones to display
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
