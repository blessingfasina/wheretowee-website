import type { Metadata } from 'next';
import Link from 'next/link';
import { Download, Mail, FileText, Image, Quote, BarChart3, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Press Kit - Where To Wee',
  description:
    'Press kit for Where To Wee - the UK toilet finder app. Download brand assets, read our founder story, and access key statistics for media coverage.',
  openGraph: {
    title: 'Press Kit - Where To Wee',
    description: 'Download brand assets, read our founder story, and access key statistics for media coverage.',
    url: 'https://wheretowee.uk/press',
  },
  alternates: {
    canonical: 'https://wheretowee.uk/press',
  },
};

export default function PressPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy-600 text-white py-16 md:py-24">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block bg-mint-500/20 text-mint-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Press & Media
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Press Kit
            </h1>
            <p className="text-lg text-gray-300">
              Everything you need to write about Where To Wee – our story, brand assets, and key statistics.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 bg-gray-50 border-b">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#story" className="text-navy-600 hover:text-mint-600 font-medium">Founder Story</a>
            <span className="text-gray-300">•</span>
            <a href="#stats" className="text-navy-600 hover:text-mint-600 font-medium">Key Statistics</a>
            <span className="text-gray-300">•</span>
            <a href="#quotes" className="text-navy-600 hover:text-mint-600 font-medium">Quotes</a>
            <span className="text-gray-300">•</span>
            <a href="#assets" className="text-navy-600 hover:text-mint-600 font-medium">Brand Assets</a>
            <span className="text-gray-300">•</span>
            <a href="#contact" className="text-navy-600 hover:text-mint-600 font-medium">Media Contact</a>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="section">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-navy-800 mb-6">Company Overview</h2>
            <div className="bg-gray-50 p-6 rounded-xl">
              <dl className="grid md:grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm text-gray-500 mb-1">Company Name</dt>
                  <dd className="font-semibold text-navy-800">Where To Wee</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 mb-1">Launched</dt>
                  <dd className="font-semibold text-navy-800">January 2026</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 mb-1">Founder</dt>
                  <dd className="font-semibold text-navy-800">Blessing Fasina</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 mb-1">Headquarters</dt>
                  <dd className="font-semibold text-navy-800">Bournemouth, United Kingdom</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 mb-1">Website</dt>
                  <dd className="font-semibold text-mint-600">wheretowee.uk</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-sm text-gray-500 mb-1">One-Line Description</dt>
                  <dd className="font-semibold text-navy-800">
                    The UK&apos;s community-powered toilet finder — 15,000+ mapped toilets across 400+ towns and cities, free on iOS, Android and the web.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Story */}
      <section id="story" className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-navy-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-navy-600" />
              </div>
              <h2 className="text-3xl font-bold text-navy-800">Founder Story</h2>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="prose prose-lg text-gray-700 space-y-6">
                <h3 className="text-xl font-bold text-navy-800 mt-0">The Spark</h3>
                <p>
                  Where To Wee started with a frustration our founder, Blessing Fasina, knows all too well. Blessing
                  moved to the UK from Nigeria in 2023 to study for his Master&apos;s degree — and quickly discovered
                  that finding a public toilet when you&apos;re out is far harder than it should be.
                </p>
                <p>
                  Picture this: you&apos;re out in the cold, miles from home, and you desperately need the loo. You look 
                  around. Nothing. You check your phone. The results are outdated, closed, or paid facilities you 
                  can&apos;t access. Blessing found himself asking a corner shop owner if he could use their 
                  toilet. He said yes, thankfully, but the whole experience felt unnecessarily stressful.
                </p>
                <p className="font-semibold text-navy-700">
                  And it kept happening. Again and again.
                </p>

                <h3 className="text-xl font-bold text-navy-800">&quot;Is It Just Me?&quot;</h3>
                <p>
                  We started asking people – friends, colleagues, anyone who&apos;d listen. <em>&quot;Do you find it hard 
                  to find toilets when you&apos;re out?&quot;</em> Without exception, everyone had stories. The panic at 
                  a train station. The &quot;customers only&quot; rejection at a café. The 50p they didn&apos;t have at a paid facility.
                </p>
                <p>
                  But we wanted data, not just anecdotes. So we went to where honest conversations happen: Reddit.
                </p>
                <p>
                  In subreddits like r/AskUK, r/london, and r/uktravels, we found thread after thread of people 
                  sharing the exact same frustrations:
                </p>
                <ul>
                  <li><em>&quot;We all know the UK severely lacks public toilets&quot;</em></li>
                  <li><em>&quot;Why are public toilets so hard to find in the UK?&quot;</em></li>
                  <li><em>&quot;I&apos;m visiting London – where can I actually find a toilet?&quot;</em></li>
                </ul>
                <p>
                  This wasn&apos;t a niche complaint. It was a universal frustration that people had simply accepted 
                  as &quot;just how it is.&quot; Even the BBC covered it – reporting on calls for greater access to 
                  public toilets across the country.
                </p>

                <h3 className="text-xl font-bold text-navy-800">The Data That Changed Everything</h3>
                <p>
                  As developers, we think in systems and data. So we did what any curious problem-solver 
                  would do: we researched the market. What we found was eye-opening:
                </p>
                <p>
                  Keyword research showed that <strong>&quot;toilet near me&quot;</strong> and closely related searches add up
                  to over <strong>1.5 million searches every single month</strong> in the UK – from people who need a
                  toilet and can&apos;t find one. The Royal Society for Public Health has found there is just one public
                  toilet for every 15,481 people in England.
                </p>

                <h3 className="text-xl font-bold text-navy-800">Building the Solution</h3>
                <p>
                  That&apos;s when the idea crystallised. What if there was a single, reliable place to find every 
                  public toilet in the UK? Not just the council-run ones, but the ones in shopping centres, 
                  supermarkets, train stations, parks – everywhere.
                </p>
                <p>
                  And more importantly, what if it was community-powered? Users adding toilets, rating cleanliness, 
                  confirming accessibility features, flagging closures in real-time.
                </p>
                <p className="text-xl font-bold text-navy-700">
                  Where To Wee was born.
                </p>
                <p>
                  We&apos;re not just building an app – we&apos;re building a movement. Because access to a toilet 
                  isn&apos;t a luxury. It&apos;s a basic human need. And in 2026, no one should have to panic trying to find one.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Statistics */}
      <section id="stats" className="section">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-mint-600" />
              </div>
              <h2 className="text-3xl font-bold text-navy-800">Key Statistics</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-mint-500 to-emerald-500 text-white p-8 rounded-2xl">
                <div className="text-5xl font-bold mb-2">1.5M+</div>
                <div className="text-white/90 text-lg">Monthly searches for public toilets in the UK</div>
                <div className="mt-4 text-sm text-white/70">Source: Keyword research data</div>
              </div>
              
              <div className="bg-gradient-to-br from-navy-500 to-navy-700 text-white p-8 rounded-2xl">
                <div className="text-5xl font-bold mb-2">18,000+</div>
                <div className="text-white/90 text-lg">People using Where To Wee across iOS, Android and the web</div>
                <div className="mt-4 text-sm text-white/70">Source: Google Analytics, 2026</div>
              </div>
              
              <div className="bg-white border-2 border-gray-200 p-8 rounded-2xl">
                <div className="text-5xl font-bold text-navy-800 mb-2">15,481</div>
                <div className="text-gray-600 text-lg">People for every public toilet in England</div>
                <div className="mt-4 text-sm text-gray-500">Source: Royal Society for Public Health</div>
              </div>
              
              <div className="bg-white border-2 border-gray-200 p-8 rounded-2xl">
                <div className="text-5xl font-bold text-navy-800 mb-2">15,000+</div>
                <div className="text-gray-600 text-lg">Toilets mapped across the UK</div>
                <div className="mt-4 text-sm text-gray-500">Source: Where To Wee database</div>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-amber-50 rounded-xl border border-amber-200">
              <h3 className="text-lg font-bold text-amber-900 mb-3">As Featured In</h3>
              <ul className="text-amber-800 space-y-2">
                <li>
                  <strong>BBC News</strong> –
                  <a
                    href="https://www.bbc.co.uk/news/articles/c2k2jpn4dpyo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-700 underline hover:text-amber-900 ml-1"
                  >
                    &quot;Meet the loo guru – mapping places to pee&quot;
                    <ExternalLink className="w-3 h-3 inline ml-1" />
                  </a>{' '}
                  (May 2026)
                </li>
                <li>
                  <strong>BBC Radio Solent</strong> – two live interviews with founder Blessing Fasina (May and July 2026)
                </li>
                <li>
                  <strong>Bournemouth Daily Echo</strong> –
                  <a
                    href="https://www.bournemouthecho.co.uk/news/26090176.bournemouth-man-creates-app-helps-find-public-toilets/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-700 underline hover:text-amber-900 ml-1"
                  >
                    &quot;Bournemouth man creates app that helps find public toilets&quot;
                    <ExternalLink className="w-3 h-3 inline ml-1" />
                  </a>{' '}
                  (print and online, May 2026)
                </li>
                <li>
                  <strong>The Week Junior</strong> – &quot;Creating a useful app&quot;, People section (16 May 2026 issue)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Quotes */}
      <section id="quotes" className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Quote className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-navy-800">Ready-to-Use Quotes</h2>
            </div>
            
            <div className="space-y-6">
              <blockquote className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-mint-500">
                <p className="text-xl text-gray-700 italic mb-4">
                  &quot;There are over 1.5 million searches for a toilet in the UK every month. Where To Wee exists 
                  because no one should have to panic about finding one.&quot;
                </p>
                <cite className="text-gray-500 not-italic">— Blessing Fasina, Founder of Where To Wee</cite>
              </blockquote>
              
              <blockquote className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-navy-500">
                <p className="text-xl text-gray-700 italic mb-4">
                  &quot;When I arrived in the UK and went out, I couldn&apos;t find a toilet when I needed one. 
                  That anxiety became the spark for Where To Wee.&quot;
                </p>
                <cite className="text-gray-500 not-italic">— Blessing Fasina, Founder of Where To Wee</cite>
              </blockquote>
              
              <blockquote className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-amber-500">
                <p className="text-xl text-gray-700 italic mb-4">
                  &quot;Access to a toilet isn&apos;t a luxury – it&apos;s a basic human need. We&apos;re not just building 
                  an app; we&apos;re building a movement.&quot;
                </p>
                <cite className="text-gray-500 not-italic">— Blessing Fasina, Founder of Where To Wee</cite>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Assets */}
      <section id="assets" className="section">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Image className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-3xl font-bold text-navy-800">Brand Assets</h2>
            </div>
            
            {/* Brand Colors */}
            <div className="mb-12">
              <h3 className="text-xl font-bold text-navy-800 mb-4">Brand Colours</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="h-20 bg-navy-600 rounded-lg mb-2"></div>
                  <p className="font-medium text-navy-800">Navy Primary</p>
                  <p className="text-sm text-gray-500">#1e3a5f</p>
                </div>
                <div>
                  <div className="h-20 bg-mint-500 rounded-lg mb-2"></div>
                  <p className="font-medium text-navy-800">Mint Green</p>
                  <p className="text-sm text-gray-500">#4ade80</p>
                </div>
                <div>
                  <div className="h-20 bg-emerald-500 rounded-lg mb-2"></div>
                  <p className="font-medium text-navy-800">Emerald</p>
                  <p className="text-sm text-gray-500">#10b981</p>
                </div>
                <div>
                  <div className="h-20 bg-gray-100 rounded-lg mb-2 border"></div>
                  <p className="font-medium text-navy-800">Off White</p>
                  <p className="text-sm text-gray-500">#f8fafc</p>
                </div>
              </div>
            </div>
            
            {/* Logo Downloads */}
            <div className="mb-12">
              <h3 className="text-xl font-bold text-navy-800 mb-4">Logos & Icons</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* App Icon - Light Background */}
                <div className="bg-gray-50 p-8 rounded-xl text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src="/icon-512.png"
                      alt="Where To Wee App Icon"
                      width={128}
                      height={128}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-navy-800 font-medium mb-2">App Icon (Dark)</p>
                  <p className="text-sm text-gray-500 mb-4">PNG, 512x512 • For light backgrounds</p>
                  <a href="/icon-512.png" download className="inline-flex items-center gap-2 text-mint-600 hover:text-mint-700 font-medium">
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
                
                {/* App Icon - Dark Background Preview */}
                <div className="bg-navy-600 p-8 rounded-xl text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg bg-white/10 flex items-center justify-center">
                    <img
                      src="/icon-512.png"
                      alt="Where To Wee App Icon on Dark Background"
                      width={128}
                      height={128}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-white/90 font-medium mb-2">App Icon Preview</p>
                  <p className="text-sm text-white/60 mb-4">How it looks on dark backgrounds</p>
                  <a href="/icon-512.png" download className="inline-flex items-center gap-2 text-mint-400 hover:text-mint-300 font-medium">
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
              </div>
            </div>
            
            {/* Usage Guidelines */}
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-navy-800 mb-3">Usage Guidelines</h3>
              <ul className="text-gray-700 space-y-2">
                <li>✓ Use our official brand colours</li>
                <li>✓ Maintain clear space around logos</li>
                <li>✓ Use the full name &quot;Where To Wee&quot; on first reference</li>
                <li>✗ Don&apos;t alter colours or proportions</li>
                <li>✗ Don&apos;t place logos on busy backgrounds</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Media Contact */}
      <section id="contact" className="section bg-navy-600 text-white">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Media Enquiries</h2>
            <p className="text-gray-300 mb-8">
              For press enquiries, interview requests, or additional information, please contact:
            </p>
            <a 
              href="mailto:hello@wheretowee.uk?subject=Press%20Enquiry" 
              className="inline-flex items-center gap-2 bg-mint-500 text-navy-800 px-8 py-4 rounded-full font-bold hover:bg-mint-400 transition-colors text-lg"
            >
              <Mail className="w-5 h-5" />
              hello@wheretowee.uk
            </a>
            <p className="mt-8 text-gray-400 text-sm">
              We typically respond to media enquiries within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <div className="relative bg-gradient-to-br from-mint-500 via-mint-400 to-emerald-500 rounded-3xl p-8 md:p-12 text-white overflow-hidden">
              {/* Background decorations */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Try Where To Wee
                </h2>
                <p className="text-white/90 mb-8 text-lg">
                  Experience the app yourself — available free on the App Store and Google Play.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/map" 
                    className="inline-flex items-center justify-center px-8 py-3 bg-white text-mint-600 font-bold rounded-full hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    🗺️ Try Web Map
                  </Link>
                  <Link 
                    href="/download" 
                    className="inline-flex items-center justify-center px-8 py-3 bg-white/20 text-white font-bold rounded-full hover:bg-white/30 transition-all border-2 border-white/50"
                  >
                    📱 Download App
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
