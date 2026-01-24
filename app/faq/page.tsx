import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions - Find Toilets Near Me',
  description:
    'Common questions about finding public toilets near you, accessible toilets in the UK, baby changing facilities, and using the Where To Wee app.',
  alternates: {
    canonical: 'https://wheretowee.uk/faq',
  },
  keywords: [
    'toilets near me',
    'public toilets near me',
    'toilet near me',
    'accessible toilets UK',
    'baby changing facilities near me',
    'wheelchair accessible toilets',
    'free public toilets',
  ],
  openGraph: {
    title: 'FAQ - Where To Wee',
    description: 'Common questions about finding public toilets near you in the UK.',
  },
};

const faqs = [
  {
    category: 'Finding Toilets',
    questions: [
      {
        q: 'How do I find toilets near me?',
        a: `Finding toilets near you is easy with Where To Wee. Simply visit our map page or download our free app, allow location access, and we'll show you the nearest public toilets. Our database includes over 18,000 toilets across the UK, including those in shopping centres, train stations, parks, and standalone public conveniences. You can filter results by accessibility, baby changing facilities, and whether they're free or paid.`,
      },
      {
        q: 'How accurate is the "toilets near me" feature?',
        a: `Our toilet finder uses your device's GPS to pinpoint your exact location and shows toilets sorted by distance. The distance shown is calculated as the crow flies, so actual walking distance may vary slightly. We regularly update our database with user reports to ensure accuracy. If you find any incorrect information, please report it through the app and we'll investigate promptly.`,
      },
      {
        q: 'Can I find public toilets close to me without the app?',
        a: `Yes! You can use our website's interactive map at wheretowee.uk/map to find public toilets close to you. The website works on any device with a browser. However, downloading the app gives you additional features like offline access, favourites, and notifications when you're near saved toilets.`,
      },
      {
        q: 'What information do you show for each toilet?',
        a: `For each toilet, we display: distance from your location, whether it's free or paid (including the fee if applicable), wheelchair accessibility, baby changing facilities, opening hours (where available), user ratings and reviews, and the operator name. This helps you choose the best option for your needs before making the journey.`,
      },
    ],
  },
  {
    category: 'Accessible Toilets',
    questions: [
      {
        q: 'How do I find accessible toilets in the UK?',
        a: `Where To Wee is committed to helping people find accessible toilets across the UK. Use the "Accessible" filter on our map to show only wheelchair-accessible toilets. We indicate the level of accessibility: "Yes" means fully wheelchair accessible with grab rails and adequate space, "Limited" means partially accessible, and "No" means not wheelchair accessible.`,
      },
      {
        q: 'What is a RADAR key and where can I get one?',
        a: `A RADAR key (also known as a National Key Scheme key) opens over 10,000 locked accessible toilets across the UK. These toilets are locked to prevent misuse and ensure they're available for those who need them. You can purchase a RADAR key from Disability Rights UK for around £5, or from many local councils and disability organisations. Some pharmacies also sell them.`,
      },
      {
        q: 'Do you show Changing Places toilets?',
        a: `Yes, we include Changing Places toilets in our database where data is available. Changing Places are larger accessible toilets with additional equipment including hoists, adult-sized changing benches, and more space for carers. They're essential for people with profound disabilities. Look for the Changing Places label in toilet details.`,
      },
      {
        q: 'How do I report an accessibility issue?',
        a: `If you find that accessibility information is incorrect - for example, a toilet marked as accessible isn't actually suitable for wheelchairs - please report it through our app or contact us at data@wheretowee.uk. We take accessibility seriously and will investigate all reports promptly.`,
      },
    ],
  },
  {
    category: 'Baby Changing',
    questions: [
      {
        q: 'How do I find baby changing facilities near me?',
        a: `Use the "Baby Change" filter on our map to show only toilets with baby changing facilities. This is particularly useful for parents and carers when out with young children. Many supermarkets, shopping centres, and newer public toilets include baby changing, and we try to keep this information as up-to-date as possible.`,
      },
      {
        q: "Are baby changing facilities in men's toilets?",
        a: "This varies by location. Traditionally, baby changing facilities were only in women's toilets, but this is changing. Many newer facilities have baby changing in both men's and women's toilets, or in a separate family/accessible toilet. We try to indicate where baby changing is located in our toilet details where this information is available.",
      },
    ],
  },
  {
    category: 'Free vs Paid Toilets',
    questions: [
      {
        q: 'How do I find free public toilets near me?',
        a: `Use the "Free" filter on our map to show only toilets that don't charge for entry. Free options typically include toilets in supermarkets, libraries, some shopping centres, and many council-run public conveniences. Paid toilets are common at train stations and some high-traffic locations, typically charging 20-50p.`,
      },
      {
        q: 'Why do some public toilets charge a fee?',
        a: `Toilet fees help cover maintenance and cleaning costs. With many councils facing budget cuts, charging fees helps keep toilets open that might otherwise close. The fee is typically 20-50p. Note that accessible (RADAR key) toilets are usually free to use, even in locations where standard toilets charge.`,
      },
    ],
  },
  {
    category: 'Using the App',
    questions: [
      {
        q: 'Is the Where To Wee app free?',
        a: `Yes, Where To Wee is completely free to download and use. There are no premium features, no subscriptions, and no ads. We believe everyone should have easy access to toilet information regardless of their budget.`,
      },
      {
        q: 'Does the app work offline?',
        a: `Yes! Once you've loaded toilets in an area, they're cached on your device and available offline. This is perfect for when you're in areas with poor signal or travelling abroad with limited data. Just make sure to open the app in your destination area while you have connectivity.`,
      },
      {
        q: "Can I add a toilet that's not on the map?",
        a: `Absolutely! We encourage users to submit toilets we've missed. Use the "Add a Loo" feature in the app to submit new toilets. Your submission will be reviewed by our team before being added to the database. Include as much information as possible about accessibility, baby changing, and fees to help other users.`,
      },
      {
        q: 'How can I rate a toilet?',
        a: `After visiting a toilet, you can rate it from 1 to 5 stars based on cleanliness, facilities, and overall condition. Your rating helps other users know what to expect. You can also leave a written review with more details. All ratings are anonymous and no account is required.`,
      },
    ],
  },
  {
    category: 'Privacy & Data',
    questions: [
      {
        q: 'Do you track my location?',
        a: `We only use your location when you're actively using the app to find nearby toilets. We don't track your movements or store your location history. Your location data stays on your device and is only used to calculate distances and show relevant results.`,
      },
      {
        q: 'Do I need to create an account?',
        a: `No account is required to use Where To Wee. You can find toilets, view details, and see ratings without signing up for anything. The only time you might optionally provide information is when submitting a new toilet or report, and even then, it's anonymous.`,
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy-600 text-white py-12 md:py-16">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-gray-300">
              Everything you need to know about finding public toilets near you, accessible
              facilities, and using Where To Wee.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="section">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {faqs.map((category) => (
              <div key={category.category} className="mb-12">
                <h2 className="text-2xl font-bold text-navy-800 mb-6 pb-2 border-b-2 border-mint-500">
                  {category.category}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((faq, index) => (
                    <details
                      key={index}
                      className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                      <summary className="flex items-center justify-between p-5 cursor-pointer list-none hover:bg-gray-50 transition-colors">
                        <h3 className="font-semibold text-navy-800 pr-4">{faq.q}</h3>
                        <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0" />
                      </summary>
                      <div className="px-5 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schema.org FAQ Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.flatMap((category) =>
              category.questions.map((faq) => ({
                '@type': 'Question',
                name: faq.q,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.a,
                },
              }))
            ),
          }),
        }}
      />

      {/* CTA */}
      <section className="section bg-mint-500 text-white">
        <div className="container-custom text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-white/90 mb-8 max-w-xl mx-auto">
            Can't find the answer you're looking for? Get in touch and we'll help you out.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn bg-white text-mint-600 hover:bg-gray-100">
              Contact Us
            </Link>
            <Link href="/map" className="btn bg-navy-600 text-white hover:bg-navy-700">
              Find Toilets Now
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
