import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Task, Subtask, SubSubtask, Milestone, User, GroupedData } from '../types';

export const useTrackerData = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [subSubtasks, setSubSubtasks] = useState<SubSubtask[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [tasksRes, subtasksRes, subSubtasksRes, milestonesRes, usersRes] = await Promise.all([
        supabase.from('tasks').select('*').order('category', { ascending: true }),
        supabase.from('subtasks').select('*'),
        supabase.from('sub_subtasks').select('*').order('order_index', { ascending: true }),
        supabase.from('milestones').select('*'),
        supabase.from('users').select('*')
      ]);

      if (tasksRes.error) {
        console.warn('Error fetching tasks:', tasksRes.error);
        setError('Unable to connect to database. Please ensure the database schema is set up correctly.');
      }
      if (subtasksRes.error) console.warn('Error fetching subtasks:', subtasksRes.error);
      if (subSubtasksRes.error) console.warn('Error fetching sub-subtasks:', subSubtasksRes.error);
      if (milestonesRes.error) console.warn('Error fetching milestones:', milestonesRes.error);
      if (usersRes.error) console.warn('Error fetching users:', usersRes.error);

      setTasks(tasksRes.data || []);
      setSubtasks(subtasksRes.data || []);
      setSubSubtasks(subSubtasksRes.data || []);
      setMilestones(milestonesRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err: any) {
      const errorMessage = 'Database connection error. Please check your Supabase configuration and ensure all migrations have been applied.';
      setError(errorMessage);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const tasksSubscription = supabase
      .channel('tasks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchData)
      .subscribe();

    const subtasksSubscription = supabase
      .channel('subtasks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subtasks' }, fetchData)
      .subscribe();

    const subSubtasksSubscription = supabase
      .channel('sub_subtasks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sub_subtasks' }, fetchData)
      .subscribe();

    const milestonesSubscription = supabase
      .channel('milestones_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'milestones' }, fetchData)
      .subscribe();

    return () => {
      tasksSubscription.unsubscribe();
      subtasksSubscription.unsubscribe();
      subSubtasksSubscription.unsubscribe();
      milestonesSubscription.unsubscribe();
    };
  }, []);

  const groupedData: GroupedData[] = tasks.map(task => ({
    task,
    subtasks: subtasks
      .filter(st => st.task_id === task.id)
      .map(subtask => ({
        subtask,
        assignedUser: users.find(u => u.id === subtask.assigned_to) || null,
        milestones: milestones.filter(m => m.subtask_id === subtask.id),
        subSubtasks: subSubtasks
          .filter(sst => sst.subtask_id === subtask.id)
          .map(subSubtask => ({
            subSubtask,
            assignedUser: users.find(u => u.id === subSubtask.assigned_to) || null,
            milestones: milestones.filter(m => m.sub_subtask_id === subSubtask.id)
          }))
      }))
  }));

  return { tasks, subtasks, milestones, users, groupedData, loading, error, refetch: fetchData };
};
