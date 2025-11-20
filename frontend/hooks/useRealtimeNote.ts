import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface User {
  userId: string;
  userName: string;
  userEmail: string;
}

interface NoteUpdate {
  noteId: string;
  userId: string;
  title?: string;
  content?: string;
  cursorPosition?: number;
  timestamp: number;
}

interface UseRealtimeNoteOptions {
  noteId: string;
  userId: string;
  userName: string;
  userEmail: string;
  onNoteUpdate?: (update: NoteUpdate) => void;
  onUserJoined?: (user: User) => void;
  onUserLeft?: (user: User) => void;
}

export function useRealtimeNote({
  noteId,
  userId,
  userName,
  userEmail,
  onNoteUpdate,
  onUserJoined,
  onUserLeft,
}: UseRealtimeNoteOptions) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    
    const newSocket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      
      // Join the note room
      newSocket.emit('join-note', {
        noteId,
        userId,
        userName,
        userEmail,
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('active-users', (data: { users: User[] }) => {
      setActiveUsers(data.users);
    });

    newSocket.on('user-joined', (user: User) => {
      setActiveUsers((prev) => [...prev, user]);
      onUserJoined?.(user);
    });

    newSocket.on('user-left', (user: User) => {
      setActiveUsers((prev) => prev.filter((u) => u.userId !== user.userId));
      onUserLeft?.(user);
    });

    newSocket.on('note-updated', (update: NoteUpdate) => {
      onNoteUpdate?.(update);
    });

    newSocket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      newSocket.emit('leave-note', { noteId });
      newSocket.close();
    };
  }, [noteId, userId, userName, userEmail]);

  // Send note update (debounced)
  const sendNoteUpdate = useCallback(
    (title: string, content: string, cursorPosition?: number) => {
      if (!socket || !isConnected) return;

      // Clear existing timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      // Debounce updates by 300ms
      updateTimeoutRef.current = setTimeout(() => {
        socket.emit('note-update', {
          noteId,
          userId,
          title,
          content,
          cursorPosition,
        });
      }, 300);
    },
    [socket, isConnected, noteId, userId]
  );

  // Send cursor position
  const sendCursorMove = useCallback(
    (position: number) => {
      if (!socket || !isConnected) return;
      socket.emit('cursor-move', {
        noteId,
        userId,
        position,
      });
    },
    [socket, isConnected, noteId, userId]
  );

  // Send typing indicator
  const sendTypingIndicator = useCallback(
    (isTyping: boolean) => {
      if (!socket || !isConnected) return;
      socket.emit('typing-indicator', {
        noteId,
        userId,
        isTyping,
      });
    },
    [socket, isConnected, noteId, userId]
  );

  return {
    activeUsers,
    isConnected,
    sendNoteUpdate,
    sendCursorMove,
    sendTypingIndicator,
  };
}

