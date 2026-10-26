import React from 'react';
import {
  Brain,
  Smile,
  Flame,
  Heart,
  Sparkles,
  Coffee,
  Eye,
  Compass,
  Layers,
} from 'lucide-react';

const MOOD_ICONS = {
  'mind-bending': Brain,
  'feel-good': Smile,
  'dark-and-intense': Flame,
  'emotional': Heart,
  'uplifting': Sparkles,
  'cozy': Coffee,
  'suspenseful': Eye,
  'adventurous': Compass,
};

export const MOODS_LIST = [
  {
    id: 'mind-bending',
    label: 'Mind-bending',
    color: '#8B5CF6',
    ruleHint: 'Science Fiction, Mystery genres',
  },
  {
    id: 'feel-good',
    label: 'Feel-good',
    color: '#F59E0B',
    ruleHint: 'Comedy, Family, Animation genres',
  },
  {
    id: 'dark-and-intense',
    label: 'Dark & intense',
    color: '#EF4444',
    ruleHint: 'Thriller, Crime, Horror genres',
  },
  {
    id: 'emotional',
    label: 'Emotional',
    color: '#EC4899',
    ruleHint: 'Drama, Romance genres',
  },
  {
    id: 'uplifting',
    label: 'Uplifting',
    color: '#10B981',
    ruleHint: 'Family, Animation, Music genres',
  },
  {
    id: 'cozy',
    label: 'Cozy',
    color: '#F97316',
    ruleHint: 'Family, Animation, Romance genres',
  },
  {
    id: 'suspenseful',
    label: 'Suspenseful',
    color: '#06B6D4',
    ruleHint: 'Thriller, Mystery, Crime genres',
  },
  {
    id: 'adventurous',
    label: 'Adventurous',
    color: '#3B82F6',
    ruleHint: 'Adventure, Fantasy genres',
  },
];

export function MoodChips({ selectedMood, onSelectMood }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-rose-400" />
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-300">
            Filter by Desired Mood
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Rule-derived labels from TMDB metadata
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {/* All Movies Chip */}
        <button
          onClick={() => onSelectMood(null)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
            !selectedMood
              ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-lg shadow-rose-500/20 ring-1 ring-white/20'
              : 'bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Films</span>
        </button>

        {/* 8 Mood Chips */}
        {MOODS_LIST.map((mood) => {
          const Icon = MOOD_ICONS[mood.id] || Sparkles;
          const isSelected = selectedMood === mood.id;

          return (
            <button
              key={mood.id}
              onClick={() => onSelectMood(isSelected ? null : mood.id)}
              title={`Rule: Derived from ${mood.ruleHint}`}
              className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                isSelected
                  ? 'text-white border-transparent shadow-lg'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800/90 border-white/5'
              }`}
              style={{
                backgroundColor: isSelected ? `${mood.color}25` : undefined,
                borderColor: isSelected ? mood.color : undefined,
                boxShadow: isSelected ? `0 0 20px -3px ${mood.color}40` : undefined,
              }}
            >
              <Icon
                className="w-3.5 h-3.5 transition-transform group-hover:scale-110"
                style={{ color: mood.color }}
              />
              <span>{mood.label}</span>

              {isSelected && (
                <span
                  className="w-1.5 h-1.5 rounded-full animate-ping"
                  style={{ backgroundColor: mood.color }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
