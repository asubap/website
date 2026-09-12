import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/auth/authProvider';

interface PageResponse<T> { content: T | null; version: number }

export function usePageContent<T>(slug: 'about' | 'membership', defaults: T) {
  const { role, session, isAuthenticated } = useAuth();
  const canEdit = isAuthenticated && role === 'e-board';
  const [published, setPublished] = useState(defaults);
  const [draft, setDraft] = useState(defaults);
  const [version, setVersion] = useState(0);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [reload, setReload] = useState(0);
  const savePending = useRef(false);
  const endpoint = `${import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '')}/page-content/${slug}`;
  const isEditing = canEdit && editing;
  const dirty = isEditing && JSON.stringify(published) !== JSON.stringify(draft);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError('');
    fetch(endpoint, { signal: controller.signal, cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error('Saved content could not be loaded. Retry before editing.');
        return response.json() as Promise<PageResponse<T>>;
      })
      .then(data => {
        if (controller.signal.aborted) return;
        setPublished(data.content ?? defaults);
        setDraft(data.content ?? defaults);
        setVersion(data.version);
      })
      .catch(error => { if (!controller.signal.aborted) setLoadError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [endpoint, defaults, reload]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    // Existing navigation uses ordinary links. Protect those as well as refresh/close.
    const protectNavigation = (event: MouseEvent) => {
      const anchor = (event.target as Element).closest('a[href]');
      if (anchor && !window.confirm('Leave this page and discard your unsaved changes?')) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    document.addEventListener('click', protectNavigation, true);
    return () => {
      window.removeEventListener('beforeunload', warn);
      document.removeEventListener('click', protectNavigation, true);
    };
  }, [dirty]);

  const save = async () => {
    if (!canEdit || !session?.access_token || savePending.current) return;
    savePending.current = true;
    setSaving(true);
    setError('');
    try {
      const response = await fetch(endpoint, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ content: draft, version }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Changes could not be saved.');
      setPublished(data.content);
      setDraft(data.content);
      setVersion(data.version);
      setEditing(false);
      setMessage('Changes saved. Everyone can now see the updated page.');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Changes could not be saved. Please try again.');
    } finally {
      savePending.current = false;
      setSaving(false);
    }
  };

  return {
    content: isEditing ? draft : published, setDraft, canEdit, isEditing, loading, saving, dirty,
    error, loadError, message, save,
    startEditing: () => { setDraft(published); setError(''); setMessage(''); setEditing(true); },
    cancel: () => { setDraft(published); setError(''); setEditing(false); },
    retry: () => setReload(value => value + 1),
  };
}
