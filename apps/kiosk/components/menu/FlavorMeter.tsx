interface FlavorMeterProps {
  label: string;
  value: number; // 1-5
  max?: number;
}

export function FlavorMeter({ label, value, max = 5 }: FlavorMeterProps) {
  const dots = Array.from({ length: max }, (_, i) => i < value);

  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-sm font-semibold text-ink">{label}</span>
      <div className="flex items-center gap-1.5" role="img" aria-label={`${label}: ${value} of ${max}`}>
        {dots.map((filled, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full ${filled ? 'bg-latte' : 'bg-latte/25'}`}
          />
        ))}
      </div>
    </div>
  );
}