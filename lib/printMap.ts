import type { Toilet } from './supabase';

export const PRINT_MAP = {
  lat: 50.828,
  lng: -0.138,
  zoom: 13,
  width: 1400,
  height: 520,
};

const TILE = 256;

export function globalPixels(
  lat: number,
  lng: number,
  zoom: number,
): { x: number; y: number } {
  const scale = TILE * Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * scale;
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const y =
    (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale;
  return { x, y };
}

export function pinOnMap(
  lat: number,
  lng: number,
  map = PRINT_MAP,
): { left: string; top: string; onMap: boolean } {
  const center = globalPixels(map.lat, map.lng, map.zoom);
  const point = globalPixels(lat, lng, map.zoom);
  const leftPx = point.x - (center.x - map.width / 2);
  const topPx = point.y - (center.y - map.height / 2);
  const pad = 8;
  const onMap =
    leftPx >= pad &&
    leftPx <= map.width - pad &&
    topPx >= pad &&
    topPx <= map.height - pad;
  return {
    left: `${(leftPx / map.width) * 100}%`,
    top: `${(topPx / map.height) * 100}%`,
    onMap,
  };
}

export function findingNote(notes: string | null | undefined): string | null {
  if (!notes) return null;
  const m = notes.match(/Finding it:\s*([^;]+)/i);
  return m ? m[1].trim() : null;
}

export function compactHours(hours: string | null | undefined): string {
  if (!hours) return 'See signage';
  return hours
    .replace(/Daily:\s*/gi, '')
    .replace(/Mon-Fri:\s*/gi, 'Weekdays ')
    .replace(/Sat-Sun:\s*/gi, 'Weekend ')
    .replace(/; /g, ' · ');
}

export type PrintArea =
  | 'Brighton seafront & centre'
  | 'Hove'
  | 'Portslade & west'
  | 'North Brighton'
  | 'Rottingdean, Saltdean & east';

export function printArea(toilet: Toilet): PrintArea {
  const hay = `${toilet.name} ${toilet.address || ''}`.toLowerCase();
  if (/portslade|vale park|easthill|greenleas|victoria/.test(hay)) {
    return 'Portslade & west';
  }
  // Specific north-brighton parks before the broad Hove match (Dyke Road /
  // Preston / Blakers were falling into Hove or seafront).
  if (
    /stanmer|wild park|hollingbury|dyke road|preston park|blakers|blaker[’']?s/.test(
      hay,
    )
  ) {
    return 'North Brighton';
  }
  // Lawn Memorial before generic "cemetery" (which is treated as Hove).
  if (
    /rottingdean|saltdean|ovingdean|woodingdean|lawn memorial/.test(hay)
  ) {
    return 'Rottingdean, Saltdean & east';
  }
  // Colonnade / Madeira Drive are seafront — avoid matching "Hove" inside
  // the address string "Brighton and Hove".
  if (/colonnade|madeira/.test(hay)) {
    return 'Brighton seafront & centre';
  }
  const hoveHay = hay.replace(/brighton and hove/g, ' ');
  if (
    /\bhove\b|goldstone|king alfred|esplanade|lagoon|sports hub|cemetery|st ann/.test(
      hoveHay,
    )
  ) {
    return 'Hove';
  }
  return 'Brighton seafront & centre';
}

export const PRINT_AREA_ORDER: PrintArea[] = [
  'Brighton seafront & centre',
  'Hove',
  'Portslade & west',
  'North Brighton',
  'Rottingdean, Saltdean & east',
];

export function isClosed(toilet: Toilet): boolean {
  return Boolean(toilet.public_note);
}

export function accessBits(toilet: Toilet): string[] {
  const bits: string[] = [];
  if (toilet.wheelchair === 'yes') bits.push('Wheelchair');
  if (toilet.wheelchair === 'limited') bits.push('Limited access');
  if (toilet.baby_changing === 'yes') bits.push('Baby change');
  if (toilet.hoist === 'yes' || toilet.adult_changing === 'yes') {
    bits.push('Changing Places');
  }
  if (toilet.unisex === 'yes' || toilet.gender_neutral === 'yes') {
    bits.push('Unisex');
  }
  if (toilet.radar_key === 'yes') bits.push('RADAR key');
  if (toilet.fee === 'no') bits.push('Free');
  return bits;
}
