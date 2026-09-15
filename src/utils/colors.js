// src/utils/colors.js

const COLOR_PALETTE = [
  {
    text: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  {
    text: 'text-sky-400',
    badgeBg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
  },
  {
    text: 'text-amber-400',
    badgeBg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  {
    text: 'text-purple-400',
    badgeBg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  {
    text: 'text-rose-400',
    badgeBg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
  },
  {
    text: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
  },
];

export function getUserColor(user) {
  if (!user || !user.id) return COLOR_PALETTE[0];
  
  // Hash user ID to get a consistent index
  const hash = String(user.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = Math.abs(hash) % COLOR_PALETTE.length;
  
  return COLOR_PALETTE[index];
}

export function getUserInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}