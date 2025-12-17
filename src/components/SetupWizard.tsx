import React, { useState } from 'react';
import { Database, Copy, CheckCircle, RefreshCw, ExternalLink } from 'lucide-react';

interface SetupWizardProps {
  missingTables: string[];
  onRetry: () => void;
  supabaseUrl: string;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ missingTables, onRetry, supabaseUrl }) => {
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(1);

  const sqlScript = `-- Project Tracker - Quick Setup Script
-- Copy and paste this into your Supabase SQL Editor

${missingTables.length === 0 ? '-- All tables already exist!' : `-- Missing tables: ${missingTables.join(', ')}`}

-- Run the complete initialization script
-- Go to: ${supabaseUrl}/project/_/sql
-- Then copy the contents of: supabase/init-schema.sql
-- Or use the SQL below (abbreviated version):

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'admin')) DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

-- See supabase/init-schema.sql for the complete setup script
`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || '';
  const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectId}/sql`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <Database className="w-12 h-12" />
              <div>
                <h1 className="text-3xl font-bold">Database Setup Required</h1>
                <p className="text-blue-100 mt-1">Let's get your Project Tracker ready in 3 easy steps</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="space-y-6">
              <div className={`flex items-start gap-4 p-6 rounded-lg border-2 transition-all ${
                step >= 1 ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-700/20'
              }`}>
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                  step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'
                }`}>
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">Open Supabase SQL Editor</h3>
                  <p className="text-gray-300 mb-4">
                    Navigate to your Supabase project's SQL Editor to run the initialization script.
                  </p>
                  <a
                    href={sqlEditorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    onClick={() => setStep(Math.max(step, 2))}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open SQL Editor
                  </a>
                </div>
              </div>

              <div className={`flex items-start gap-4 p-6 rounded-lg border-2 transition-all ${
                step >= 2 ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-700/20'
              }`}>
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                  step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'
                }`}>
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">Run Initialization Script</h3>
                  <p className="text-gray-300 mb-4">
                    Copy the complete SQL script from <code className="bg-gray-700 px-2 py-1 rounded text-blue-400">supabase/init-schema.sql</code> and paste it into the SQL Editor.
                  </p>

                  {missingTables.length > 0 && (
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Missing tables:</span>
                        <span className="text-sm text-red-400 font-mono">{missingTables.join(', ')}</span>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-900 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
                      <span className="text-sm text-gray-400 font-mono">supabase/init-schema.sql</span>
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {copied ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy Path
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-4 text-sm text-gray-300 font-mono overflow-x-auto">
                      <p className="text-green-400">-- Open this file in your project:</p>
                      <p className="text-blue-400">supabase/init-schema.sql</p>
                      <p className="text-gray-500 mt-2">-- Copy all contents and paste into Supabase SQL Editor</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(Math.max(step, 3))}
                    className="mt-4 inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    I've run the script
                  </button>
                </div>
              </div>

              <div className={`flex items-start gap-4 p-6 rounded-lg border-2 transition-all ${
                step >= 3 ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-700/20'
              }`}>
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                  step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'
                }`}>
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">Verify Setup</h3>
                  <p className="text-gray-300 mb-4">
                    Click the button below to verify that all tables were created successfully.
                  </p>
                  <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Verify & Continue
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gray-900 border border-gray-700 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-400" />
                Quick Reference
              </h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p><span className="text-gray-500">•</span> Script location: <code className="bg-gray-800 px-2 py-1 rounded text-blue-400">supabase/init-schema.sql</code></p>
                <p><span className="text-gray-500">•</span> SQL Editor: <code className="bg-gray-800 px-2 py-1 rounded text-blue-400">{sqlEditorUrl}</code></p>
                <p><span className="text-gray-500">•</span> Tables to create: users, tasks, subtasks, sub_subtasks, milestones, app_config, action_history</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Need help? Check <code className="bg-gray-800 px-2 py-1 rounded">DATABASE_SETUP.md</code> for detailed instructions
          </p>
        </div>
      </div>
    </div>
  );
};
