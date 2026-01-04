import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Heart, Users, Shield, Mail, ChevronRight, Lightbulb, Search, TrendingUp, Rocket } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Where To Wee - Our Story & Mission',
  description:
    'Discover the story behind Where To Wee - born from a real struggle to find toilets in the UK. Learn how one frustrating experience led to a solution for millions.',
  openGraph: {
    title: 'About Where To Wee - The Story Behind the App',
    description: 'Born from a real struggle to find toilets in the UK, Where To Wee helps over 1.5 million monthly searchers find the nearest loo.',
  },
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy-600 text-white py-16 md:py-24">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block bg-mint-500/20 text-mint-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Our Story
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Born From a <span className="text-mint-400">Cold, Desperate</span> Search for a Toilet
            </h1>
            <p className="text-lg text-gray-300">
              Where To Wee started with a simple question: why is it so hard to find a public toilet in the UK?
            </p>
          </div>
        </div>
      </section>

      {/* The Spark */}
      <section className="section">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="text-3xl font-bold text-navy-800">The Spark</h2>
            </div>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                In September 2023, I arrived in the UK full of excitement for a new chapter. What I didn&apos;t expect 
                was how something so basic – finding a toilet when you&apos;re out – would become a recurring challenge.
              </p>
              <p>
                Picture this: You&apos;re out in the cold, miles from home, and you desperately need the loo. You look 
                around. Nothing. You check your phone. The results are outdated, closed, or paid facilities you 
                can&apos;t access. In desperation, I found myself asking a corner shop owner if I could use their 
                toilet. He said yes, thankfully, but the whole experience felt unnecessarily stressful.
              </p>
              <p className="text-xl font-semibold text-navy-700 italic">
                And it kept happening. Again and again.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Validation */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-navy-800">&quot;Is It Just Me?&quot;</h2>
            </div>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                I started asking people – friends, colleagues, people I&apos;d just met. <em>&quot;Do you find it hard 
                to find toilets when you&apos;re out?&quot;</em> Without exception, everyone had stories. The panic at 
                a train station. The &quot;customers only&quot; rejection at a café. The 50p they didn&apos;t have at a paid facility.
              </p>
              <p>
                But I wanted data, not just anecdotes. So I went to where honest conversations happen: <strong>Reddit</strong>.
              </p>
            </div>
            
            {/* Reddit quotes */}
            <div className="mt-8 space-y-4">
              <div className="bg-white p-6 rounded-xl border-l-4 border-orange-500 shadow-sm">
                <p className="text-gray-700 italic">&quot;We all know the UK severely lacks public toilets&quot;</p>
                <span className="text-sm text-gray-500 mt-2 block">— r/AskUK</span>
              </div>
              <div className="bg-white p-6 rounded-xl border-l-4 border-orange-500 shadow-sm">
                <p className="text-gray-700 italic">&quot;Why are public toilets so hard to find in the UK?&quot;</p>
                <span className="text-sm text-gray-500 mt-2 block">— r/london</span>
              </div>
              <div className="bg-white p-6 rounded-xl border-l-4 border-orange-500 shadow-sm">
                <p className="text-gray-700 italic">&quot;I&apos;m visiting London – where can I actually find a toilet?&quot;</p>
                <span className="text-sm text-gray-500 mt-2 block">— r/uktravels</span>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-blue-50 rounded-xl">
              <p className="text-gray-700">
                This wasn&apos;t a niche complaint. It was a <strong>universal frustration</strong> that people had 
                simply accepted as &quot;just how it is.&quot; Even the BBC covered it – 
                <a 
                  href="https://www.bbc.co.uk/news/articles/cr43g34rny1o" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-mint-600 hover:underline font-medium"
                > reporting on calls for greater access to public toilets</a> across the country.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Data */}
      <section className="section">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-bold text-navy-800">The Data That Changed Everything</h2>
            </div>
            <div className="prose prose-lg text-gray-600 mb-8">
              <p>
                I&apos;m a builder by nature – I think in systems and data. So I did what any curious 
                problem-solver would do: I researched the market. What I found shocked me:
              </p>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-mint-500 to-emerald-500 text-white p-8 rounded-2xl text-center">
                <div className="text-4xl font-bold mb-2">500K+</div>
                <div className="text-white/90">monthly searches for</div>
                <div className="font-semibold">&quot;toilet near me&quot;</div>
              </div>
              <div className="bg-gradient-to-br from-navy-500 to-navy-700 text-white p-8 rounded-2xl text-center">
                <div className="text-4xl font-bold mb-2">500K+</div>
                <div className="text-white/90">monthly searches for</div>
                <div className="font-semibold">&quot;public toilets close to me&quot;</div>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white p-8 rounded-2xl text-center">
                <div className="text-4xl font-bold mb-2">500K+</div>
                <div className="text-white/90">monthly searches for</div>
                <div className="font-semibold">&quot;public restroom near me&quot;</div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-2xl font-bold text-navy-800">
                That&apos;s over <span className="text-mint-600">1.5 million searches every month</span> from people 
                desperately trying to solve the same problem I&apos;d faced.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center">
                <Rocket className="w-6 h-6 text-mint-600" />
              </div>
              <h2 className="text-3xl font-bold text-navy-800">Building the Solution</h2>
            </div>
            <div className="prose prose-lg text-gray-600 space-y-4">
              <p>
                That&apos;s when the idea crystallised. What if there was a single, reliable place to find every 
                public toilet in the UK? Not just the council-run ones, but the ones in shopping centres, 
                supermarkets, train stations, parks – everywhere.
              </p>
              <p>
                And more importantly, what if it was <strong>community-powered</strong>? Users adding toilets, 
                rating cleanliness, confirming accessibility features, flagging closures in real-time.
              </p>
              <p className="text-xl font-semibold text-navy-700">
                Where To Wee was born.
              </p>
              <p>
                We&apos;re not just building an app – we&apos;re building a movement. Because access to a toilet 
                isn&apos;t a luxury. It&apos;s a basic human need. And in 2025, no one should have to panic trying to find one.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-navy-800 text-center mb-12">What We Stand For</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-16 h-16 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-mint-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-800 mb-2">Accessibility First</h3>
              <p className="text-gray-600">
                We prioritise accessibility information because everyone deserves to know if they can 
                use a facility before they arrive.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-mint-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-800 mb-2">Privacy Matters</h3>
              <p className="text-gray-600">
                We don&apos;t require accounts or track your movements. Your location data stays on your 
                device and is only used to find nearby toilets.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-mint-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-800 mb-2">Community Driven</h3>
              <p className="text-gray-600">
                Our database grows through user contributions. Every rating, review, and new toilet 
                submission helps others in need.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-navy-800 mb-6">Our Data</h2>
            <div className="prose prose-lg text-gray-600">
              <p>Our toilet database is compiled from multiple sources:</p>
              <ul>
                <li>
                  <strong>OpenStreetMap</strong> – Community-maintained geographic data
                </li>
                <li>
                  <strong>Local Council Data</strong> – Official public toilet locations
                </li>
                <li>
                  <strong>User Submissions</strong> – Toilets added by our growing community
                </li>
                <li>
                  <strong>Verified Locations</strong> – Shopping centres, train stations, and more
                </li>
              </ul>
              <p>
                We regularly update our database and verify information through user reports and 
                ratings. If you find incorrect information, please let us know!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="section">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-navy-800 mb-6">Get in Touch</h2>
            <p className="text-gray-600 mb-8">
              Have questions, feedback, or want to partner with us? We&apos;d love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:hello@wheretowee.uk"
                className="btn btn-primary"
              >
                <Mail className="w-5 h-5" />
                hello@wheretowee.uk
              </a>
              <Link href="/contact" className="btn btn-secondary">
                Contact Form
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Press Kit CTA */}
      <section className="section bg-navy-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Press & Media</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Writing about Where To Wee? Download our press kit with the full founder story, 
            brand assets, and key statistics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/press" className="btn btn-mint btn-lg">
              View Press Kit
            </Link>
            <Link href="/download" className="btn bg-white/10 text-white hover:bg-white/20 btn-lg">
              Join Waitlist
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
