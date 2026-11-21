import { haversineKm } from '@/lib/cities';
import { areaForAddress } from '@/lib/cityCatalogue';
import { toiletDisplayName, type Toilet } from '@/lib/supabase';

/**
 * Data-driven copy for toilet detail pages.
 *
 * Every sentence here is built from the toilet's own fields (fee,
 * hours, accessibility, notes, area, nearest alternatives), so two
 * pages only read alike when the toilets really are alike. Nothing is
 * stated that the data doesn't support — unknowns are left out rather
 * than guessed.
 */

type Yn = 'yes' | 'no' | null;

export function yn(v: string | null | undefined): Yn {
  const s = (v ?? '').trim().toLowerCase();
  if (s === 'yes' || s === 'true') return 'yes';
  if (s === 'no' || s === 'false') return 'no';
  return null;
}

export interface FeeInfo {
  /** true = free, false = paid, null = unknown. */
  free: boolean | null;
  /** Short label for the facilities list. */
  label: string;
}

/// Fee is usually yes/no, but some sources store free text
/// ("20p but turnstiles may be opened during events"). Show that text
/// instead of the old "Fee not known".
export function feeInfo(fee: string | null | undefined, paymentDetails?: string | null): FeeInfo {
  const raw = (fee ?? '').trim();
  const s = raw.toLowerCase();
  const details = (paymentDetails ?? '').trim();
  if (s === 'no' || s === 'free' || s === 'false') return { free: true, label: 'Free to use' };
  if (s === 'yes' || s === 'true') {
    return { free: false, label: details ? `Paid: ${details}` : 'Paid entry' };
  }
  if (raw) {
    const looksPaid = /£\s?\d|\d+\s?p\b|pence|charge|contactless|card/i.test(raw);
    return { free: looksPaid ? false : null, label: `Fee: ${raw}` };
  }
  return { free: null, label: 'Fee not known' };
}

function isPostcodeLike(s: string): boolean {
  return /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(s.trim()) || /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i.test(s);
}

/// A short "where in the city" label: London borough when we know it,
/// otherwise a clean first address part (street / district) that isn't
/// just the city, a postcode or a house number.
export function toiletLocality(
  t: { name?: string | null; address?: string | null },
  citySlug: string,
  cityName: string,
): string | null {
  const borough = areaForAddress(t.address ?? null, citySlug);
  if (borough) return borough;
  const parts = (t.address ?? '').split(',').map((p) => p.trim()).filter(Boolean);
  const first = parts[0];
  if (!first) return null;
  if (first.length < 4 || first.length > 40) return null;
  if (/^\d+[a-z]?$/i.test(first)) return null;
  if (isPostcodeLike(first)) return null;
  const f = first.toLowerCase();
  if (f === cityName.toLowerCase() || f === 'united kingdom' || f === 'uk') return null;
  if (toiletDisplayName(t).toLowerCase().includes(f)) return null;
  return first;
}

export interface NearbyWithDistance {
  toilet: Toilet;
  metres: number;
}

export function withDistances(origin: { latitude: number; longitude: number }, list: Toilet[]): NearbyWithDistance[] {
  return list
    .map((t) => ({
      toilet: t,
      metres: Math.round(
        haversineKm(
          { lat: origin.latitude, lng: origin.longitude },
          { lat: t.latitude, lng: t.longitude },
        ) * 1000,
      ),
    }))
    .sort((a, b) => a.metres - b.metres);
}

export function formatDistance(metres: number): string {
  if (metres < 1000) return `${Math.max(10, Math.round(metres / 10) * 10)} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}

/// Cleaned listing notes, or null. Collapses whitespace and caps the
/// length so one huge paste can't swamp the page.
export function cleanNotes(notes: string | null | undefined): string | null {
  const s = (notes ?? '').replace(/\s+/g, ' ').trim();
  if (s.length < 8) return null;
  return s.length > 600 ? `${s.slice(0, 597).trimEnd()}…` : s;
}

/// The fee text without our "Paid: " / "Fee: " prefix.
function feeDetail(fee: FeeInfo): string | null {
  const d = fee.label.replace(/^(Paid: |Fee: )/, '').trim();
  return d && d !== 'Paid entry' ? d.replace(/[.!?]+$/, '') : null;
}

function sentence(s: string): string {
  const t = s.trim();
  return /[.!?…]$/.test(t) ? t : `${t}.`;
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

export interface ToiletSummaryInput {
  toilet: Toilet;
  cityName: string;
  locality: string | null;
  hoist?: string | null;
  nearest?: NearbyWithDistance | null;
  nearbyCount: number;
}

/// 2–4 plain sentences describing this specific toilet.
export function toiletSummary({ toilet, cityName, locality, hoist, nearest, nearbyCount }: ToiletSummaryInput): string[] {
  const name = toiletDisplayName(toilet);
  const where = locality ? `${locality}, ${cityName}` : cityName;
  const fee = feeInfo(toilet.fee, toilet.payment_details);

  const traits: string[] = [];
  if (fee.free === true) traits.push('free');
  if (yn(toilet.wheelchair) === 'yes') traits.push('wheelchair-accessible');
  const kind = traits.length > 0 ? `${traits.join(', ')} ` : '';
  // A council block reads "X is a public toilet"; a café or shop is a
  // venue whose toilet is listed, not itself a toilet.
  const isToiletItself = /toilet|\bwc\b|convenience|\bloo\b|lavator|restroom|washroom/i.test(name);
  const out: string[] = [
    isToiletItself
      ? `${name} is a ${kind}public toilet in ${where}.`
      : `${name} in ${where} has a ${kind}toilet listed for public use.`,
  ];

  const has: string[] = [];
  if (yn(toilet.baby_changing) === 'yes') has.push('baby changing');
  if (yn(hoist ?? toilet.hoist) === 'yes') has.push('a Changing Places hoist');
  if (yn(toilet.unisex) === 'yes' || yn(toilet.gender_neutral) === 'yes') has.push('unisex facilities');
  if (yn(toilet.attended) === 'yes') has.push('an attendant');
  if (has.length > 0) out.push(`It has ${joinList(has)}.`);

  if (yn(toilet.radar_key) === 'yes') {
    out.push('The accessible toilet is locked with a RADAR key (National Key Scheme).');
  }
  if (fee.free === false) {
    const detail = feeDetail(fee);
    out.push(detail ? `There is a charge to use it (${detail}).` : 'There is a charge to use it.');
  } else if (fee.free === null && fee.label !== 'Fee not known') {
    out.push(`${sentence(fee.label)}`);
  }
  if (toilet.opening_hours) {
    out.push(sentence(`Listed opening hours: ${toilet.opening_hours.trim()}`));
  }
  if (nearest) {
    const n = toiletDisplayName(nearest.toilet);
    out.push(
      nearbyCount > 1
        ? `The closest alternative is ${n}, about ${formatDistance(nearest.metres)} away, and there are ${nearbyCount} other toilets within 1.5 km.`
        : `The closest alternative is ${n}, about ${formatDistance(nearest.metres)} away.`,
    );
  }
  return out;
}

export interface QuickAnswer {
  q: string;
  a: string;
}

/// Visible Q&A built only from fields we actually know.
export function quickAnswers(input: ToiletSummaryInput): QuickAnswer[] {
  const { toilet, nearest } = input;
  const name = toiletDisplayName(toilet);
  const out: QuickAnswer[] = [];
  const fee = feeInfo(toilet.fee, toilet.payment_details);
  if (fee.free === true) out.push({ q: `Is ${name} free to use?`, a: 'Yes, it is listed as free to use.' });
  else if (fee.free === false) {
    const detail = feeDetail(fee);
    out.push({ q: `Do you have to pay to use ${name}?`, a: detail ? sentence(`Yes: ${detail}`) : 'Yes, there is a charge.' });
  }

  const w = yn(toilet.wheelchair);
  if (w) {
    out.push({
      q: `Is ${name} wheelchair accessible?`,
      a: w === 'yes'
        ? `Yes, it is listed as wheelchair accessible${yn(toilet.radar_key) === 'yes' ? ' (RADAR key needed for the accessible cubicle)' : ''}.`
        : 'No, it is not listed as wheelchair accessible. Check the nearby toilets below for an accessible option.',
    });
  }
  const b = yn(toilet.baby_changing);
  if (b) {
    out.push({
      q: `Does ${name} have baby changing?`,
      a: b === 'yes' ? 'Yes, baby changing facilities are listed here.' : 'No baby changing is listed here.',
    });
  }
  if (toilet.opening_hours) {
    out.push({ q: `When is ${name} open?`, a: `Listed hours: ${toilet.opening_hours.trim()}. Hours can change, so check locally if it matters.` });
  }
  if (nearest) {
    out.push({
      q: `What is the nearest other toilet to ${name}?`,
      a: `${toiletDisplayName(nearest.toilet)}, about ${formatDistance(nearest.metres)} away.`,
    });
  }
  return out;
}

/// Meta description built from the same facts (≤ ~160 chars).
export function toiletMetaDescription(toilet: Toilet, cityName: string, locality: string | null): string {
  const where = locality ? `${locality}, ${cityName}` : cityName;
  const fee = feeInfo(toilet.fee, toilet.payment_details);
  const bits: string[] = [];
  if (fee.free === true) bits.push('Free');
  else if (fee.free === false) bits.push('Paid');
  if (yn(toilet.wheelchair) === 'yes') bits.push('wheelchair accessible');
  if (yn(toilet.baby_changing) === 'yes') bits.push('baby changing');
  if (yn(toilet.radar_key) === 'yes') bits.push('RADAR key');
  const facts = bits.length > 0 ? `${bits.join(', ')}. ` : '';
  const hours = toilet.opening_hours ? `Hours: ${toilet.opening_hours.trim()}. ` : '';
  const base = `Public toilet in ${where}. ${facts}${hours}`;
  const tail = 'Directions and nearby alternatives on Where To Wee.';
  const full = `${base}${tail}`;
  if (full.length <= 165) return full;
  return base.length <= 160 ? base.trim() : `${base.slice(0, 157).trimEnd()}…`;
}
