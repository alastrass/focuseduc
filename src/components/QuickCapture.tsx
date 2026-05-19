import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { supabase, QuickNote } from '../lib/supabase';

export default function QuickCapture() {
  const [notes, setNotes] = useState<QuickNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (userId) loadNotes();
  }, [userId]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);
  };

  const loadNotes = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('quick_notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setNotes(data);
  };

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !userId) return;
    const { data } = await supabase
      .from('quick_notes')
      .insert({ content: newNote.trim(), user_id: userId })
      .select()
      .single();
    if (data) {
      setNotes([data, ...notes]);
      setNewNote('');
    }
  };

  const deleteNote = async (id: string) => {
    await supabase.from('quick_notes').delete().eq('id', id);
    setNotes(notes.filter((n) => n.id !== id));
  };

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        padding: '16px',
        boxShadow: 'var(--shadow)',
      }}
    >
      <form onSubmit={addNote} className="mb-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Note rapide..."
            style={{
              flex: 1,
              padding: '8px 12px',
              background: 'var(--input-bg)',
              color: 'var(--text)',
              border: '1px solid var(--input-border)',
              borderRadius: 'var(--radius-sm)',
              outline: 'none',
              fontSize: '14px',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--input-focus)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--input-border)')}
          />
          <button
            type="submit"
            disabled={!userId}
            className="btn-primary px-4 py-2 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-text)',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </form>

      {notes.length > 0 && (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {notes.map((note) => (
            <div
              key={note.id}
              className="flex items-start gap-2 p-2"
              style={{
                background: 'var(--surface-2)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
              }}
            >
              <p className="flex-1 text-sm" style={{ color: 'var(--text)' }}>
                {note.content}
              </p>
              <button
                onClick={() => deleteNote(note.id)}
                className="p-1 transition-all hover:opacity-70"
                style={{ color: 'var(--text-faint)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
