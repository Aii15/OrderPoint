import { MenuItem, formatIDR } from '@/lib/menu-data';
import { FlavorMeter } from './FlavorMeter';

interface ProductDetailProps {
  item: MenuItem;
  onPrev: () => void;
  onNext: () => void;
  onOrder: () => void;
  /** Diameter of the product image, in pixels. */
  imageSize?: number;
}

export function ProductDetail({
  item,
  onPrev,
  onNext,
  onOrder,
  imageSize = 320,
}: ProductDetailProps) {
  return (
    <section className="grid grid-cols-1 gap-10 px-16 py-12 lg:grid-cols-[1fr_1.1fr_1fr]">
      <div className="flex flex-col gap-8">
        <div className="min-h-[168px]">
          <h1 className="font-serif text-6xl leading-none text-ink">{item.name}</h1>
          <p className="mt-6 line-clamp-3 max-w-sm text-[15px] leading-relaxed text-ink/80">
            {item.description}
          </p>
        </div>

        <div className="min-h-[132px]">
          <h2 className="mb-2 text-base font-bold text-ink">Composition</h2>
          <ul className="space-y-1 text-[15px] text-ink/80">
            {item.composition.map((line) => (
              <li key={line} className="flex items-start gap-1.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink/80" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex min-h-[108px] flex-col gap-3">
          {item.meters.map((meter) => (
            <FlavorMeter key={meter.label} label={meter.label} value={meter.value} />
          ))}
        </div>

        <div className="min-h-[112px]">
          <h2 className="mb-2 text-base font-bold text-ink">Serving Details</h2>
          <ul className="space-y-1 text-[15px] text-ink/80">
            {item.servingDetails.map((line) => (
              <li key={line} className="flex items-start gap-1.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink/80" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative flex items-center justify-center">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous item"
          className="absolute -left-8 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-[#F2D8AE] shadow-[6px_6px_14px_rgba(122,74,38,0.3),-4px_-4px_10px_rgba(255,255,255,0.85)] transition active:scale-90"
        >
          <img src="/images/icons/arrow-left.png" alt="Previous item" className="h-4 w-4" />
        </button>

        <div className="relative flex flex-col items-center">
          <img
            src={`/images/${item.id}.png`}
            alt={item.imageAlt}
            style={{ width: imageSize, height: imageSize }}
          />
        </div>

        <button
          type="button"
          onClick={onNext}
          aria-label="Next item"
          className="absolute -right-8 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-[#F2D8AE] shadow-[6px_6px_14px_rgba(122,74,38,0.3),-4px_-4px_10px_rgba(255,255,255,0.85)] transition active:scale-90"
        >
          <img src="/images/icons/arrow-right.png" alt="Next item" className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col items-end justify-between text-right">
        <dl className="flex min-h-[320px] flex-col gap-5">
          {item.attributes.map((attr) => (
            <div key={attr.label}>
              <dt className="text-base font-bold text-ink">{attr.label}</dt>
              <dd className="text-[15px] text-ink/80">{attr.value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-col items-end gap-3">
          <div>
            <p className="font-serif text-3xl text-ink">IDR {formatIDR(item.price)}</p>
            <p className="text-sm font-semibold text-ink/80">{item.availability}</p>
          </div>
          <button
            type="button"
            onClick={onOrder}
            className="rounded-full bg-latte px-8 py-4 text-[15px] font-semibold text-cream transition active:scale-95"
          >
            Click to Order
          </button>
        </div>
      </div>
    </section>
  );
}