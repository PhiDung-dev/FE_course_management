interface BadgeProps {
  children: React.ReactNode;
  variant: 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'orange';
}

const variantMap: Record<BadgeProps['variant'], string> = {
  green:  'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  red:    'bg-red-50 text-red-700 ring-1 ring-red-200',
  yellow: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200',
  blue:   'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  gray:   'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
  orange: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
};

export default function Badge({ children, variant }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variantMap[variant]}`}>
      {children}
    </span>
  );
}
