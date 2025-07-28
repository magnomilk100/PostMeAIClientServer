import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building } from 'lucide-react';

export function WorkspaceIndicator() {
  const { data: currentWorkspace } = useQuery({
    queryKey: ['/api/workspace/current'],
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  if (!currentWorkspace) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      <div className="flex flex-col">
        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
          Current Workspace
        </span>
        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
          {currentWorkspace.name}
        </span>
      </div>
    </div>
  );
}