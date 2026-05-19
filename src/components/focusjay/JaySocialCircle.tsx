import { useState } from 'react';
import { Plus, Phone, Cake, Trash2, CreditCard as Edit2, Check, AlertCircle } from 'lucide-react';
import { supabase, JaySocialPerson } from '../../lib/supabase';

type Props = {
  people: JaySocialPerson[];
  userId: string;
  onUpdate: () => void;
};

function daysSinceContact(lastContact: string | null): number | null {
  if (!lastContact) return null;
  return Math.floor((Date.now() - new Date(lastContact).getTime()) / (1000 * 60 * 60 * 24));
}

function upcomingBirthday(birthday: string | null): { days: number; label: string } | null {
  if (!birthday) return null;
  const today = new Date();
  const bday = new Date(birthday);
  const next = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  const days = Math.floor((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (days > 60) return null;
  return { days, label: days === 0 ? "Aujourd'hui !" : days === 1 ? 'Demain' : `Dans ${days} j.` };
}

type FormState = {
  name: string;
  birthday: string;
  last_contact: string;
  note: string;
  contact_frequency_days: number;
};

const EMPTY_FORM: FormState = {
  name: '',
  birthday: '',
  last_contact: new Date().toISOString().split('T')[0],
  note: '',
  contact_frequency_days: 30,
};

export default function JaySocialCircle({ people, userId, onUpdate }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const sortedPeople = [...people].sort((a, b) => {
    const da = daysSinceContact(a.last_contact) ?? 9999;
    const db = daysSinceContact(b.last_contact) ?? 9999;
    return db - da;
  });

  const save = async () => {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      birthday: form.birthday || null,
      last_contact: form.last_contact || null,
      note: form.note || null,
      contact_frequency_days: form.contact_frequency_days,
      user_id: userId,
      updated_at: new Date().toISOString(),
    };
    if (editId) {
      await supabase.from('jay_social_circle').update(payload).eq('id', editId);
    } else {
      await supabase.from('jay_social_circle').insert(payload);
    }
    setForm(EMPTY_FORM);
    setShowForm(false);
    setEditId(null);
    onUpdate();
  };

  const markContacted = async (id: string) => {
    await supabase.from('jay_social_circle').update({
      last_contact: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    }).eq('id', id);
    onUpdate();
  };

  const deletePerson = async (id: string) => {
    await supabase.from('jay_social_circle').delete().eq('id', id);
    onUpdate();
  };

  const startEdit = (p: JaySocialPerson) => {
    setForm({
      name: p.name,
      birthday: p.birthday ?? '',
      last_contact: p.last_contact ?? '',
      note: p.note ?? '',
      contact_frequency_days: p.contact_frequency_days,
    });
    setEditId(p.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {people.length} proche{people.length !== 1 ? 's' : ''} dans ton cercle
        </p>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm(EMPTY_FORM); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all hover:opacity-80"
          style={{ background: 'var(--primary)', color: 'var(--primary-text)' }}
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {showForm && (
        <div
          className="p-5 rounded-3xl space-y-3"
          style={{ background: 'var(--surface)', border: '1.5px solid var(--primary)', boxShadow: 'var(--shadow-lg)' }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Prénom / Nom</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nom..."
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)' }}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Anniversaire</label>
              <input
                type="date"
                value={form.birthday}
                onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)' }}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Dernier contact</label>
              <input
                type="date"
                value={form.last_contact}
                onChange={(e) => setForm({ ...form, last_contact: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)' }}
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>
                Fréquence de contact souhaitée (jours)
              </label>
              <input
                type="number"
                min={1}
                max={365}
                value={form.contact_frequency_days}
                onChange={(e) => setForm({ ...form, contact_frequency_days: parseInt(e.target.value) || 30 })}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)' }}
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Note</label>
              <textarea
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Détails, sujets importants..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)' }}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM); }}
              className="px-4 py-2 rounded-xl text-sm transition-all hover:opacity-70"
              style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
            >
              Annuler
            </button>
            <button
              onClick={save}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80 flex items-center gap-1.5"
              style={{ background: 'var(--primary)', color: 'var(--primary-text)' }}
            >
              <Check className="w-4 h-4" />
              {editId ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {sortedPeople.length === 0 && !showForm && (
          <div className="text-center py-12" style={{ color: 'var(--text-faint)' }}>
            <p className="text-sm">Ajoute des proches pour maintenir le lien sans effort</p>
          </div>
        )}
        {sortedPeople.map((p) => {
          const daysSince = daysSinceContact(p.last_contact);
          const bday = upcomingBirthday(p.birthday);
          const isOverdue = daysSince !== null && daysSince >= p.contact_frequency_days;

          return (
            <div
              key={p.id}
              className="p-4 rounded-2xl transition-all"
              style={{
                background: 'var(--surface)',
                border: `1.5px solid ${isOverdue ? '#fca5a5' : 'var(--border)'}`,
                boxShadow: isOverdue ? '0 2px 8px rgba(239,68,68,0.1)' : 'none',
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}
                >
                  {p.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm" style={{ color: 'var(--text)' }}>{p.name}</span>
                    {bday && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: '#fef3c7', color: '#b45309' }}>
                        <Cake className="w-3 h-3" />
                        {bday.label}
                      </span>
                    )}
                    {isOverdue && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: '#fee2e2', color: '#dc2626' }}>
                        <AlertCircle className="w-3 h-3" />
                        À contacter
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--text-faint)' }}>
                    {daysSince !== null && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {daysSince === 0 ? "Aujourd'hui" : `Il y a ${daysSince}j`}
                      </span>
                    )}
                    {!p.last_contact && <span>Pas encore contacté</span>}
                    {p.note && <span className="italic truncate max-w-[180px]">{p.note}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => markContacted(p.id)}
                    title="Marquer comme contacté aujourd'hui"
                    className="p-2 rounded-xl transition-all hover:scale-110"
                    style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => startEdit(p)}
                    className="p-2 rounded-xl opacity-50 hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deletePerson(p.id)}
                    className="p-2 rounded-xl opacity-25 hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
