import { useCallback, useMemo } from 'react';
import { subscribeBoardInvites } from '@/services/invites';
import { subscribeGroups } from '@/services/groups';
import { subscribeActiveTasks, subscribeCompletedTasks } from '@/services/tasks';
import { useSubscription } from './useSubscription';

export function useGroups(boardId) {
  const source = useMemo(
    () => (boardId ? (onData, onError) => subscribeGroups(boardId, onData, onError) : null),
    [boardId],
  );
  return useSubscription(source);
}

export function useActiveTasks(boardId) {
  const source = useCallback(
    (onData, onError) => subscribeActiveTasks(boardId, onData, onError),
    [boardId],
  );
  return useSubscription(source);
}

export function useCompletedTasks(boardId, max) {
  const source = useCallback(
    (onData, onError) => subscribeCompletedTasks(boardId, max, onData, onError),
    [boardId, max],
  );
  return useSubscription(source);
}

export function useBoardInvites(boardId, uid) {
  const source = useCallback(
    (onData, onError) => subscribeBoardInvites(boardId, uid, onData, onError),
    [boardId, uid],
  );
  return useSubscription(source);
}
