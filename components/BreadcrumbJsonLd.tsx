/**
 * Renders a `BreadcrumbList` JSON-LD `<script>` for a single page.
 *
 * Sprinkled across content pages (FAQ, Blog index, Map, Accessibility,
 * etc.) so Google can build a clean site-tree representation. Cheap
 * to render server-side, no client JS, no visual footprint.
 *
 * Pass a list of crumbs (excluding Home — that's prepended for you).
 *
 * @example
 *   <BreadcrumbJsonLd
 *     trail={[
 *       { name: 'Blog', url: 'https://wheretowee.uk/blog' },
 *     ]}
 *   />
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export default function BreadcrumbJsonLd({ trail }: { trail: BreadcrumbItem[] }) {
  const items = [
    { name: 'Home', url: 'https://wheretowee.uk' },
    ...trail,
  ];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((it, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: it.name,
            item: it.url,
          })),
        }),
      }}
    />
  );
}
