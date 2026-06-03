import { Chair } from '../types';

interface Props {
  chairs: Chair[];
  selectedChairId?: number;
  onSelectChair: (chair: Chair) => void;
}

function BarberChairIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect x="24" y="6" width="16" height="8" rx="3" fill="#111827" />
      <rect x="18" y="12" width="28" height="22" rx="4" fill="#1f2937" />
      <rect x="22" y="16" width="20" height="4" rx="1.5" fill="#374151" />
      <rect x="22" y="22" width="20" height="4" rx="1.5" fill="#374151" />
      <rect x="10" y="30" width="44" height="6" rx="2" fill="#111827" />
      <rect x="14" y="34" width="36" height="10" rx="3" fill="#1f2937" />
      <rect x="29" y="44" width="6" height="10" fill="#111827" />
      <ellipse cx="32" cy="56" rx="18" ry="3.5" fill="#111827" />
      <rect x="14" y="54" width="36" height="3" rx="1.5" fill="#374151" />
    </svg>
  );
}

const statusTone: Record<Chair['status'], string> = {
  EMPTY: 'border-[#BFD7F2] bg-white hover:bg-[#E8F0FB]',
  OCCUPIED: 'border-red-200 bg-red-50',
  RESERVED: 'border-amber-200 bg-amber-50',
  CLEANING: 'border-blue-200 bg-blue-50',
  DISABLED: 'border-gray-200 bg-gray-100'
};

const statusBadge: Record<Chair['status'], string> = {
  EMPTY: 'bg-[#E8F0FB] text-[#3A7BC2]',
  OCCUPIED: 'bg-red-100 text-red-700',
  RESERVED: 'bg-amber-100 text-amber-700',
  CLEANING: 'bg-blue-100 text-blue-700',
  DISABLED: 'bg-gray-200 text-gray-700'
};

export function ChairGrid({ chairs, selectedChairId, onSelectChair }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {chairs.map((chair) => {
        const disabled = chair.status !== 'EMPTY';
        const selected = selectedChairId === chair.id;
        return (
          <button
            key={chair.id}
            disabled={disabled}
            onClick={() => onSelectChair(chair)}
            className={`rounded-lg p-4 text-left border transition shadow-sm
              ${statusTone[chair.status]}
              ${disabled ? 'cursor-not-allowed opacity-90' : 'hover:shadow'}
              ${selected ? 'ring-2 ring-[#569DE6] border-[#569DE6]' : ''}`}
          >
            <BarberChairIcon className="w-16 h-16 mx-auto mb-2" />
            <div className="text-sm font-semibold text-[#393A3D]">Chair {chair.chairNumber}</div>
            <div className="text-xs text-gray-500 truncate">{chair.name}</div>
            {chair.assignedBarber && (
              <div className="text-xs text-gray-700 mt-1 truncate">{chair.assignedBarber.displayName}</div>
            )}
            <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${statusBadge[chair.status]}`}>
              {chair.status}
            </span>
          </button>
        );
      })}
      {chairs.length === 0 && <div className="text-gray-500 text-sm">No chairs configured.</div>}
    </div>
  );
}
