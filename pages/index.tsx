import Head from 'next/head'
import { Inter, Crimson_Text } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const crimsonText = Crimson_Text({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700'],
  variable: '--font-crimson'
})

export default function Home() {
  return (
    <>
      <Head>
        <title>FlavorWheel - Taste the World, One Sip at a Time</title>
        <meta name="description" content="The world's most pivotal tasting app for coffee and drinks. Discover, analyze, and share your tasting experiences with our user-friendly platform." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <main className={`${inter.variable} ${crimsonText.variable} min-h-screen bg-background-app font-body`}>
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-subtle opacity-60"></div>
          
          {/* Content Container */}
          <div className="relative z-10 px-md py-2xl mx-auto max-w-4xl text-center">
            {/* Logo/Brand Area */}
            <div className="mb-lg">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-md bg-gradient-primary rounded-full shadow-primary">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              
              {/* App Name */}
              <h1 className="font-heading font-bold text-h1 text-text-primary mb-sm">
                FlavorWheel
              </h1>
              
              {/* Tagline */}
              <p className="text-h3 text-text-secondary font-medium mb-xs">
                Taste the World, One Sip at a Time
              </p>
              
              {/* Subtitle */}
              <p className="text-body text-text-muted max-w-2xl mx-auto leading-body">
                The world's most pivotal tasting app for coffee and drinks. 
                Discover, analyze, and share your tasting experiences with our intuitive platform 
                designed for everyone from casual enthusiasts to industry professionals.
              </p>
            </div>
            
            {/* Key Features Preview */}
            <div className="grid grid-cols-1 tablet:grid-cols-3 gap-md mb-xl max-w-3xl mx-auto">
              <div className="card-tasting p-md text-center">
                <div className="w-12 h-12 bg-flavor-fruity rounded-full mx-auto mb-sm flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 11H7v9a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9h-2m-7 2v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16"/>
                  </svg>
                </div>
                <h3 className="font-heading font-semibold text-h3 text-text-primary mb-xs">
                  Quick Tasting
                </h3>
                <p className="text-small text-text-secondary">
                  On-the-fly solo tastings with simple, subjective inputs
                </p>
              </div>
              
              <div className="card-tasting p-md text-center">
                <div className="w-12 h-12 bg-flavor-vegetal rounded-full mx-auto mb-sm flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h3 className="font-heading font-semibold text-h3 text-text-primary mb-xs">
                  Create Tastings
                </h3>
                <p className="text-small text-text-secondary">
                  Customizable study sessions and competitions for groups
                </p>
              </div>
              
              <div className="card-tasting p-md text-center">
                <div className="w-12 h-12 bg-flavor-roasted rounded-full mx-auto mb-sm flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h3 className="font-heading font-semibold text-h3 text-text-primary mb-xs">
                  Flavor Wheels
                </h3>
                <p className="text-small text-text-secondary">
                  AI-generated visualizations from your tasting data
                </p>
              </div>
            </div>
            
            {/* Call to Action */}
            <div className="space-y-sm">
              <button className="btn-primary mx-auto block tablet:inline-block">
                Get Started
              </button>
              
              <p className="text-caption text-text-muted">
                Join thousands of tasters discovering new flavors every day
              </p>
            </div>
          </div>
        </div>
        
        {/* Value Proposition Section */}
        <section className="py-2xl px-md">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-heading font-bold text-h2 text-text-primary mb-lg">
              Why FlavorWheel?
            </h2>
            
            <div className="grid grid-cols-1 tablet:grid-cols-2 gap-lg max-w-3xl mx-auto">
              <div className="text-left">
                <h3 className="font-heading font-semibold text-h3 text-primary mb-sm">
                  For Everyone
                </h3>
                <p className="text-body text-text-secondary leading-body">
                  Whether you're a casual coffee lover or an industry professional, 
                  FlavorWheel adapts to your needs with intuitive design and powerful customization.
                </p>
              </div>
              
              <div className="text-left">
                <h3 className="font-heading font-semibold text-h3 text-primary mb-sm">
                  Data-Driven Insights
                </h3>
                <p className="text-body text-text-secondary leading-body">
                  Transform your subjective tasting notes into beautiful, shareable visualizations 
                  that reveal patterns and preferences you never knew existed.
                </p>
              </div>
              
              <div className="text-left">
                <h3 className="font-heading font-semibold text-h3 text-primary mb-sm">
                  Social & Collaborative
                </h3>
                <p className="text-body text-text-secondary leading-body">
                  Connect with fellow tasters, share your discoveries, and learn from 
                  a community passionate about flavor exploration.
                </p>
              </div>
              
              <div className="text-left">
                <h3 className="font-heading font-semibold text-h3 text-primary mb-sm">
                  Cross-Industry
                </h3>
                <p className="text-body text-text-secondary leading-body">
                  From coffee and wine to spirits and olive oil, FlavorWheel supports 
                  tastings across all industries with customizable templates.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="bg-primary text-white py-xl px-md">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="font-heading font-bold text-h3 mb-sm">
              Ready to Transform Your Tasting Experience?
            </h3>
            <p className="text-body mb-lg opacity-90">
              Join the FlavorWheel community and discover the world of flavor like never before.
            </p>
            <button className="btn-secondary">
              Start Tasting Today
            </button>
            
            <div className="mt-xl pt-lg border-t border-white/20">
              <p className="text-small opacity-70">
                © 2025 FlavorWheel. Taste the World, One Sip at a Time.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}