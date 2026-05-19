import { Heart } from 'lucide-react';

export default function CreatorBadge() {
  return (
    <footer className="w-full flex justify-center py-6 mt-4">
      <div
        className="inline-flex items-center gap-2 px-5 py-2.5 select-none"
        style={{
          background: 'linear-gradient(135deg, #fce7f3 0%, #fdf2f8 50%, #fce7f3 100%)',
          border: '1.5px solid #f9a8d4',
          borderRadius: '999px',
          boxShadow: '0 2px 12px rgba(236,72,153,0.12), 0 1px 3px rgba(236,72,153,0.08)',
        }}
      >
        <Heart
          className="w-3.5 h-3.5 flex-shrink-0"
          style={{ color: '#ec4899', fill: '#ec4899' }}
        />
        <span
          className="text-xs font-medium tracking-wide"
          style={{ color: '#be185d' }}
        >
          Créé par
        </span>
        <span
          className="text-xs font-semibold"
          style={{ color: '#9d174d' }}
        >
          Jérôme Joly
        </span>
        <span
          className="text-xs"
          style={{ color: '#db2777', opacity: 0.6 }}
        >
          —
        </span>
        <span
          className="text-xs italic"
          style={{ color: '#be185d' }}
        >
          éducateur social
        </span>
        <Heart
          className="w-3.5 h-3.5 flex-shrink-0"
          style={{ color: '#ec4899', fill: '#ec4899' }}
        />
      </div>
    </footer>
  );
}
