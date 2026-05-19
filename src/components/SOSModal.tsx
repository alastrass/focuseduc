import { useState } from 'react';
import { Siren, X, ChevronDown, ChevronUp, Phone } from 'lucide-react';

type Protocol = {
  id: string;
  title: string;
  color: string;
  steps: string[];
};

type EmergencyNumber = {
  label: string;
  number: string;
  color: string;
};

const PROTOCOLS: Protocol[] = [
  {
    id: 'fugue',
    title: 'Protocole Fugue',
    color: 'bg-orange-50 border-orange-200',
    steps: [
      'Vérifier la dernière présence connue (registre, chambre, espaces communs)',
      'Informer immédiatement le chef de service ou l\'astreinte',
      'Contacter les personnes ressources de l\'habitant (famille, tuteur)',
      'Signaler à la police (dépôt de plainte ou main courante selon situation)',
      'Remplir le rapport d\'incident dans les 24h',
      'Rester disponible pour l\'habitant à son retour (sans jugement)',
    ],
  },
  {
    id: 'conflit',
    title: 'Gestion de conflit / Crise',
    color: 'bg-red-50 border-red-200',
    steps: [
      'Rester calme, voix basse et posture ouverte — ne pas s\'interposer physiquement seul',
      'Créer de l\'espace : s\'éloigner de la zone de tension si possible',
      'Appeler en renfort un collègue sans attirer l\'attention',
      'Écouter activement sans argumenter — valider les émotions',
      'Si danger immédiat : appeler le 17 (Police) ou le 15 (SAMU)',
      'Compléter le rapport d\'incident dans les 2h suivant l\'événement',
    ],
  },
  {
    id: 'medical',
    title: 'Urgence médicale',
    color: 'bg-blue-50 border-blue-200',
    steps: [
      'Appeler le 15 (SAMU) ou le 18 (Pompiers) immédiatement',
      'Rester avec la personne — ne pas la laisser seule',
      'Mettre en position latérale de sécurité si inconsciente et respire',
      'Commencer le massage cardiaque si arrêt respiratoire (30 compressions / 2 insufflations)',
      'Préparer les documents médicaux de l\'habitant pour les secours',
      'Prévenir le responsable d\'astreinte et la famille',
    ],
  },
  {
    id: 'suicide',
    title: 'Crise suicidaire',
    color: 'bg-purple-50 border-purple-200',
    steps: [
      'Rester présent, écouter sans minimiser ni dramatiser',
      'Poser la question directement : "Est-ce que tu penses à te faire du mal ?"',
      'Retirer discrètement les objets potentiellement dangereux si possible',
      'Appeler le 3114 (Numéro national de prévention du suicide) pour conseils',
      'Ne pas laisser la personne seule — organiser une surveillance renforcée',
      'Contacter le psychiatre de garde ou les urgences psychiatriques',
    ],
  },
  {
    id: 'agression',
    title: 'Agression / Violence',
    color: 'bg-rose-50 border-rose-200',
    steps: [
      'Mettre en sécurité immédiate les autres habitants et soi-même',
      'Appeler le 17 (Police) si danger immédiat',
      'Ne pas tenter de maîtriser physiquement seul — attendre les renforts',
      'Sécuriser les preuves (témoignages, vidéosurveillance)',
      'Prendre en charge les victimes — appeler le 15 si blessés',
      'Porter plainte et rédiger rapport d\'incident complet',
    ],
  },
];

const EMERGENCY_NUMBERS: EmergencyNumber[] = [
  { label: 'SAMU', number: '15', color: 'bg-red-500' },
  { label: 'Police', number: '17', color: 'bg-blue-600' },
  { label: 'Pompiers', number: '18', color: 'bg-orange-500' },
  { label: 'Prévention suicide', number: '3114', color: 'bg-purple-600' },
  { label: 'N° Astreinte', number: '', color: 'bg-emerald-600' },
];

export default function SOSModal({ onClose }: { onClose: () => void }) {
  const [openProtocol, setOpenProtocol] = useState<string | null>(null);
  const [astreinteNumber, setAstreinteNumber] = useState(
    () => localStorage.getItem('focuseduc_astreinte') || ''
  );

  const handleAstreinteChange = (val: string) => {
    setAstreinteNumber(val);
    localStorage.setItem('focuseduc_astreinte', val);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] flex flex-col">
        <div className="bg-red-500 px-5 py-4 rounded-t-2xl flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Siren className="w-5 h-5 text-white" />
            <h2 className="font-semibold text-white">Protocoles d'urgence</h2>
          </div>
          <button
            onClick={onClose}
            className="text-red-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          <div className="grid grid-cols-4 gap-2 mb-5">
            {EMERGENCY_NUMBERS.slice(0, 4).map((n) => (
              <a
                key={n.label}
                href={`tel:${n.number}`}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl text-white transition-all hover:opacity-90 active:scale-95 ${n.color}`}
              >
                <Phone className="w-4 h-4" />
                <span className="text-xs font-bold">{n.number}</span>
                <span className="text-[9px] text-center leading-tight opacity-90">{n.label}</span>
              </a>
            ))}
          </div>

          <div className="mb-5">
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">
              N° Astreinte (enregistré localement)
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={astreinteNumber}
                onChange={(e) => handleAstreinteChange(e.target.value)}
                placeholder="Ex: 06 12 34 56 78"
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              {astreinteNumber && (
                <a
                  href={`tel:${astreinteNumber}`}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors flex items-center gap-1"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {PROTOCOLS.map((protocol) => {
              const isOpen = openProtocol === protocol.id;
              return (
                <div
                  key={protocol.id}
                  className={`rounded-xl border-2 overflow-hidden transition-all ${protocol.color}`}
                >
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                    onClick={() => setOpenProtocol(isOpen ? null : protocol.id)}
                  >
                    <span className="font-medium text-slate-700 text-sm">{protocol.title}</span>
                    {isOpen
                      ? <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    }
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4">
                      <ol className="space-y-2">
                        {protocol.steps.map((step, idx) => (
                          <li key={idx} className="flex gap-3 text-sm text-slate-600">
                            <span
                              className="flex-shrink-0 w-5 h-5 rounded-full bg-white flex items-center justify-center text-xs font-bold text-slate-500 mt-0.5 border border-slate-200"
                            >
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
