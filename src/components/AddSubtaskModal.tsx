import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { logAction } from '../lib/actionLogger';
import { User } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface AddSubtaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskName: string;
  users: User[];
  onSuccess?: () => void;
}

export const AddSubtaskModal: React.FC<AddSubtaskModalProps> = ({
  isOpen,
  onClose,
  taskId,
  taskName,
  users,
  onSuccess
}) => {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const { data: subtaskData, error: insertError } = await supabase
        .from('subtasks')
        .insert({
          task_id: taskId,
          name,
          assigned_to: assignedTo || null,
          created_by: null
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (subtaskData && name.toUpperCase() === 'PLANNED') {
        const assignedUser = users.find(u => u.id === assignedTo);
        await logAction({
          actionType: 'create',
          entityType: 'subtask',
          entityId: subtaskData.id,
          entityName: name,
          details: {
            task_name: taskName,
            assigned_to: assignedUser?.full_name || 'Unassigned'
          },
        });
      }

      setName('');
      setAssignedTo('');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${colors.cardBg} rounded-lg shadow-xl w-full max-w-md`}>
        <div className={`flex items-center justify-between p-6 border-b ${colors.border}`}>
          <h3 className={`text-xl font-semibold ${colors.text}`}>Add Subtask to {taskName}</h3>
          <button onClick={onClose} className={`${colors.textSecondary} hover:${colors.text}`}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
              Subtask Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., UI, Backend, PLANNED"
              className={`w-full px-4 py-2 ${colors.bgSecondary} border ${colors.border} rounded-lg ${colors.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
              Assign To
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className={`w-full px-4 py-2 ${colors.bgSecondary} border ${colors.border} rounded-lg ${colors.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Unassigned</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 ${colors.bgSecondary}  ${colors.text} rounded-lg `}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg "
            >
              {loading ? 'Adding...' : 'Add Subtask'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
