import type { ReactNode } from 'react';
import type { Toilet } from '@/lib/supabase';

type SignProps = { label?: string; className?: string };

function SignBox({ label, className = '', children }: SignProps & { children: ReactNode }) {
  return (
    <span
      title={label}
      aria-label={label}
      className={`inline-flex items-center justify-center shrink-0 w-[14px] h-[14px] print:w-[11px] print:h-[11px] rounded-[2px] bg-navy-800 text-white ${className}`}
    >
      {children}
    </span>
  );
}

/** International Symbol of Access (wheelchair). */
export function WheelchairSign({ label = 'Wheelchair accessible' }: SignProps) {
  return (
    <SignBox label={label}>
      <svg viewBox="0 0 24 24" className="w-[86%] h-[86%]" aria-hidden="true">
        <circle cx="14.2" cy="4.2" r="2.1" fill="currentColor" />
        <path
          fill="currentColor"
          d="M13.2 7.1h-2.4l-1.7 3.6H6.2v1.7h3.5l.7-1.5 1.4 3.2H8.4a4.4 4.4 0 1 0 4.3 5.4l1.6-.5A6 6 0 1 1 8.4 12h1.3l1.6-3.3h2.5L16.8 15h1.8l-3.1-7.3a1.6 1.6 0 0 0-1.5-1z"
        />
      </svg>
    </SignBox>
  );
}

/** Baby-changing pictogram. */
export function BabyChangeSign({ label = 'Baby changing' }: SignProps) {
  return (
    <SignBox label={label}>
      <svg viewBox="0 0 24 24" className="w-[90%] h-[90%]" aria-hidden="true">
        <circle cx="7.5" cy="6.2" r="2" fill="currentColor" />
        <path
          fill="currentColor"
          d="M9.2 9.1H5.8c-.8 0-1.4.6-1.4 1.4v2.2h1.5v5.6h2.2v-5.6h1.1V10.5c0-.8-.6-1.4-1.4-1.4zm9.6 1.4-1.7-1.7-1.1 1.1 1.1 1.1H13.4v1.6h2.2l-.9.9 1.1 1.1 1.7-1.7 1.7 1.7 1.1-1.1-.9-.9h2.1v-1.6h-3.6l1.1-1.1-1.1-1.1zM12.2 17.2c0-1.6 1.1-3 2.6-3.4v-1.5c-2.4.4-4.2 2.5-4.2 4.9 0 .6.1 1.1.2 1.6h1.6c-.1-.5-.2-1-.2-1.6z"
        />
      </svg>
    </SignBox>
  );
}

/** Changing Places: adult changing bench with hoist. */
export function ChangingPlacesSign({ label = 'Changing Places' }: SignProps) {
  return (
    <SignBox label={label}>
      <svg viewBox="0 0 24 24" className="w-[90%] h-[90%]" aria-hidden="true">
        <path
          fill="currentColor"
          d="M8.2 4.2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6zM4.5 9.2h8.2v1.6H11l.7 2.2h5.6V11h1.6v7.6h-1.6v-1.8H11.4L10 19.8H4.2l1.4-4.2H4.5V9.2zm3.2 1.6v2.4h2.2l.6-2.4H7.7zM6.8 20.4h3.4v1.4H6.8zm8.8 0h3.4v1.4h-3.4z"
        />
      </svg>
    </SignBox>
  );
}

/** National Key Scheme / RADAR key. */
export function RadarKeySign({ label = 'RADAR key' }: SignProps) {
  return (
    <SignBox label={label}>
      <svg viewBox="0 0 24 24" className="w-[86%] h-[86%]" aria-hidden="true">
        <path
          fill="currentColor"
          d="M10.2 4.2a5.2 5.2 0 0 0-1.5 10.2v1.4H7.4v1.6h1.3v1.4H7.4v1.6h4.4v-4.4a5.2 5.2 0 0 0-1.6-10.2zm0 2a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4zm8.2 3.4-2.4 2.4 1.1 1.1-1.1 1.1 1.1 1.1-1.1 1.1 1.1 1.1 2.4-2.4 1.5 1.5 1.1-1.1-4.1-4.1-1.5 1.5z"
        />
      </svg>
    </SignBox>
  );
}

export function toiletSigns(toilet: Toilet) {
  const signs: Array<{ key: string; node: ReactNode }> = [];
  if (toilet.wheelchair === 'yes' || toilet.wheelchair === 'limited') {
    signs.push({
      key: 'w',
      node: (
        <WheelchairSign
          label={
            toilet.wheelchair === 'limited'
              ? 'Limited wheelchair access'
              : 'Wheelchair accessible'
          }
        />
      ),
    });
  }
  if (toilet.baby_changing === 'yes') {
    signs.push({ key: 'b', node: <BabyChangeSign /> });
  }
  if (toilet.hoist === 'yes' || toilet.adult_changing === 'yes') {
    signs.push({ key: 'cp', node: <ChangingPlacesSign /> });
  }
  if (toilet.radar_key === 'yes') {
    signs.push({ key: 'r', node: <RadarKeySign /> });
  }
  return signs;
}

export function AccessLegend() {
  const items = [
    { node: <WheelchairSign />, text: 'Wheelchair accessible' },
    { node: <BabyChangeSign />, text: 'Baby changing' },
    { node: <ChangingPlacesSign />, text: 'Changing Places' },
    { node: <RadarKeySign />, text: 'RADAR key' },
  ];
  return (
    <div className="mt-3 mb-2 text-[11px] print:text-[8pt] text-gray-700 flex flex-wrap gap-x-4 gap-y-1.5">
      {items.map((item) => (
        <span key={item.text} className="inline-flex items-center gap-1.5">
          {item.node}
          {item.text}
        </span>
      ))}
    </div>
  );
}
