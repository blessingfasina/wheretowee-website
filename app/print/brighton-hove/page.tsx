import type { Metadata } from 'next';
import Link from 'next/link';
import { getCouncilPrintToilets } from '@/lib/supabase';
import {
  PRINT_MAP,
  PRINT_AREA_ORDER,
  compactHours,
  findingNote,
  pinOnMap,
  printArea,
} from '@/lib/printMap';
import PrintButton from './PrintButton';
import { AccessLegend, toiletSigns } from './AccessSigns';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Printable public toilet map — Brighton & Hove',
  description:
    'Download or print a Where To Wee map of Brighton & Hove City Council public toilets, with accessibility information, opening hours and how to find each one.',
  robots: { index: true, follow: true },
};

const OPERATOR = 'Brighton & Hove City Council';

export default async function BrightonHovePrintPage() {
  const toilets = await getCouncilPrintToilets(OPERATOR);
  const numbered = toilets.map((t, i) => ({
    ...t,
    n: i + 1,
    area: printArea(t),
    pin: pinOnMap(t.latitude, t.longitude),
  }));
  const grouped = PRINT_AREA_ORDER.map((area) => ({
    area,
    items: numbered.filter((t) => t.area === area),
  })).filter((g) => g.items.length > 0);

  const mapSrc = `/api/staticmap?lat=${PRINT_MAP.lat}&lng=${PRINT_MAP.lng}&zoom=${PRINT_MAP.zoom}&w=${PRINT_MAP.width}&h=${PRINT_MAP.height}&pins=0`;
  const updated = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 8mm 8mm 9mm 8mm; }
          html, body { background: white !important; }
        }
      `}</style>

      <div className="bg-navy-600 text-white print:hidden">
        <div className="container-custom py-10 md:py-12">
          <p className="text-sm text-mint-200 font-semibold mb-2">
            Data partner · Brighton &amp; Hove City Council
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Printable public toilet map
          </h1>
          <p className="text-gray-200 max-w-2xl mb-6">
            A paper map of council public toilets in Brighton &amp; Hove — for
            noticeboards, libraries, community centres, and anyone who prefers
            not to use a smartphone. It prints as <strong>A4 landscape</strong>;
            choose “Save as PDF” in your browser’s print dialog if you need a
            file to share.
          </p>
          <div className="flex flex-wrap gap-3">
            <PrintButton />
            <Link href="/toilets/brighton" className="btn btn-secondary">
              Brighton listings
            </Link>
            <Link href="/map?lat=50.8225&lng=-0.1372" className="btn btn-secondary">
              Open live map
            </Link>
          </div>
        </div>
      </div>

      <article className="bg-white text-gray-900 px-4 py-6 md:px-8 print:px-0 print:py-0 max-w-6xl mx-auto">
        <header className="hidden print:flex items-start justify-between gap-4 mb-3 border-b-2 border-navy-600 pb-2">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-navy-600">
              Where To Wee · Brighton &amp; Hove City Council
            </p>
            <h1 className="text-xl font-bold text-navy-800 leading-tight">
              Public toilets in Brighton &amp; Hove
            </h1>
            <p className="text-xs text-gray-600 mt-0.5">
              {numbered.length} council toilets · all free to use · updated {updated}
            </p>
          </div>
          <p className="text-xs text-right text-gray-600 leading-snug">
            Live map &amp; app
            <br />
            <span className="font-semibold text-navy-700">wheretowee.uk</span>
          </p>
        </header>

        <div className="print:hidden mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-xl font-bold text-navy-800">Preview</h2>
          <p className="text-sm text-gray-500">
            {numbered.length} toilets · updated {updated}
          </p>
        </div>

        <div className="relative rounded-xl overflow-hidden border border-gray-200 print:rounded-none print:border print:border-gray-400">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mapSrc}
            alt="Map of Brighton and Hove showing numbered council public toilets"
            width={PRINT_MAP.width}
            height={PRINT_MAP.height}
            className="w-full h-auto block"
          />
          {numbered.map((t) =>
            t.pin.onMap ? (
              <span
                key={t.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full text-[9px] font-bold leading-[18px] text-center border border-white shadow-sm bg-rose-600 text-white"
                style={{ left: t.pin.left, top: t.pin.top }}
                title={`${t.n}. ${t.name}`}
              >
                {t.n}
              </span>
            ) : null,
          )}
        </div>
        <p className="text-[10px] text-gray-500 mt-1 print:text-[8pt]">
          Numbers match the list below. Map © OpenStreetMap contributors.
          {numbered.some((t) => !t.pin.onMap)
            ? ' A numbered site just off this map view is listed in the directory.'
            : ''}
        </p>

        <AccessLegend />

        {grouped.map((g) => (
          <section key={g.area} className="mt-3 print:mt-2 break-inside-avoid">
            <h2 className="text-sm font-bold text-navy-800 border-b border-navy-200 pb-0.5 mb-1 print:text-[9pt]">
              {g.area}
            </h2>
            <ol className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-4 print:grid-cols-3">
              {g.items.map((t) => {
                const signs = toiletSigns(t);
                return (
                <li
                  key={t.id}
                  className="text-[12px] print:text-[7.5pt] leading-snug py-1 border-b border-gray-100 print:border-gray-200 print:break-inside-avoid"
                >
                  <div className="flex gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full text-[10px] font-bold leading-5 text-center print:w-4 print:h-4 print:leading-4 print:text-[8px] bg-rose-600 text-white">
                      {t.n}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-navy-900">
                        {t.name}
                        {!t.pin.onMap && (
                          <span className="ml-1.5 text-[10px] print:text-[7.5pt] font-medium text-gray-500">
                            (just off the map)
                          </span>
                        )}
                      </p>
                      <p className="text-gray-600">{t.address}</p>
                      <p className="text-gray-700 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                        <span>{compactHours(t.opening_hours)}</span>
                        {signs.length > 0 && (
                          <span className="inline-flex items-center gap-0.5">
                            {signs.map((s) => (
                              <span key={s.key}>{s.node}</span>
                            ))}
                          </span>
                        )}
                      </p>
                      {findingNote(t.notes) && (
                        <p className="text-gray-500 italic">
                          {findingNote(t.notes)}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
                );
              })}
            </ol>
          </section>
        ))}

        <footer className="mt-4 pt-2 border-t border-gray-200 text-[10px] print:text-[7.5pt] text-gray-500 leading-snug">
          <p>
            Produced by Where To Wee with data from Brighton &amp; Hove City
            Council. All listed council toilets are free to use. Opening hours
            can change; Christmas Day closures apply. Check the free Where To Wee
            app or{' '}
            <span className="font-semibold text-navy-700">wheretowee.uk</span>
            {' '}for live closures and updates.
          </p>
        </footer>
      </article>
    </>
  );
}
