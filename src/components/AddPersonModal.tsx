import React, { useState } from 'react';
import { X, UserPlus, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { logAction } from '../lib/actionLogger';
import type { User } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onSuccess?: () => void;
}

export const AddPersonModal: React.FC<AddPersonModalProps> = ({ isOpen, onClose, users, onSuccess }) => {
  const { colors } = useTheme();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const finalEmail = email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@example.com`;

      const { data: userData, error: insertError } = await supabase
        .from('users')
        .insert({
          full_name: fullName,
          email: finalEmail,
          role
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (userData) {
        await logAction({
          actionType: 'create',
          entityType: 'user',
          entityId: userData.id,
          entityName: fullName,
          details: {
            email: finalEmail,
            role
          },
        });
      }

      setFullName('');
      setEmail('');
      setRole('user');
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
      <div className={`${colors.cardBg} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col`}>
        <div className={`flex items-center justify-between p-6 border-b ${colors.border}`}>
          <div className="flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-blue-500" />
            <h3 className={`text-xl font-semibold ${colors.text}`}>Manage Users/Admins</h3>
          </div>
          <button onClick={onClose} className={`${colors.textSecondary} hover:${colors.text}`}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {users.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className={`w-5 h-5 ${colors.textSecondary}`} />
                <h4 className={`text-lg font-semibold ${colors.text}`}>Existing Team Members ({users.length})</h4>
              </div>
              <div className={`${colors.bgTertiary} rounded-lg border ${colors.border} max-h-64 overflow-y-auto`}>
                <div className={`divide-y ${colors.border}`}>
                  {users.map((user) => (
                    <div key={user.id} className="px-4 py-3 hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`font-medium ${colors.text}`}>{user.full_name}</div>
                          <div className={`text-sm ${colors.textSecondary}`}>{user.email}</div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-purple-900/50 text-purple-300 border border-purple-700'
                            : 'bg-blue-900/50 text-blue-300 border border-blue-700'
                        }`}>
                          {user.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div>
            <h4 className={`text-lg font-semibold ${colors.text} mb-4`}>Add New Team Member</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="e.g., John Doe"
              className={`w-full px-4 py-2 ${colors.bgSecondary} border ${colors.border} rounded-lg ${colors.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
              Email (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., john.doe@company.com"
              className={`w-full px-4 py-2 ${colors.bgSecondary} border ${colors.border} rounded-lg ${colors.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
              Role
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={role === 'user'}
                  onChange={(e) => setRole(e.target.value as 'user')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className={colors.text}>User</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={(e) => setRole(e.target.value as 'admin')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className={colors.text}>Admin</span>
              </label>
            </div>
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
                  className={`flex-1 px-4 py-2 ${colors.bgSecondary} hover:opacity-80 ${colors.text} rounded-lg transition-colors`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {loading ? 'Adding...' : 'Add Person'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
