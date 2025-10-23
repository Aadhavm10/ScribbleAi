'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ConversationalSearch from '../../../components/ConversationalSearch';

export default function SearchPage() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          AI Search
        </h1>
        <p className="text-gray-600">Ask questions about your notes using natural language</p>
      </div>

      <div className="h-[calc(100vh-250px)]">
        <ConversationalSearch
          userId={user?.id || 'demo-user'}
          onNoteClick={(noteId) => router.push(`/notes?note=${noteId}`)}
        />
      </div>
    </div>
  );
}

