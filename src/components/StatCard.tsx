interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'violet' | 'amber' | 'rose';
  sub?: string;
}

const colorMap: Record<StatCardProps['color'], { bg: string; text: string; icon: string }> = {
  blue:    { bg: 'bg-blue-50',   text: 'text-blue-600',   icon: 'bg-blue-100 text-blue-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'bg-emerald-100 text-emerald-600' },
  violet:  { bg: 'bg-violet-50', text: 'text-violet-600',  icon: 'bg-violet-100 text-violet-600' },
  amber:   { bg: 'bg-amber-50',  text: 'text-amber-600',   icon: 'bg-amber-100 text-amber-600' },
  rose:    { bg: 'bg-rose-50',   text: 'text-rose-600',    icon: 'bg-rose-100 text-rose-600' },
};

export default function StatCard({ label, value, icon, color, sub }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={`${c.bg} rounded-2xl p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl ${c.icon} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
