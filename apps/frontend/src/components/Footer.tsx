import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-navy-dark py-12 border-t-4 border-brass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <h3 className="text-brass font-bold text-lg mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Kraken Gaming
            </h3>
            <p className="text-sail-white/80 mb-4" style={{fontFamily: 'Crimson Text, serif'}}>
              His Majesty's Naval Service - Elite squadron commanding the Caribbean waters in Naval Action.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://discord.gg/krakengaming"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brass hover:text-brass-bright transition-colors"
                title="Join our Discord"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-brass font-semibold mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/gallery"
                  className="text-sail-white/80 hover:text-brass transition-colors"
                  style={{fontFamily: 'Crimson Text, serif'}}
                >
                  Gallery
                </Link>
              </li>
              <li>
                <Link
                  href="/port-battles"
                  className="text-sail-white/80 hover:text-brass transition-colors"
                  style={{fontFamily: 'Crimson Text, serif'}}
                >
                  Port Battles
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/naval-map"
                  className="text-sail-white/80 hover:text-brass transition-colors"
                  style={{fontFamily: 'Crimson Text, serif'}}
                >
                  Naval Map
                </Link>
              </li>
              <li>
                <Link
                  href="/apply"
                  className="text-sail-white/80 hover:text-brass transition-colors"
                  style={{fontFamily: 'Crimson Text, serif'}}
                >
                  Join the Fleet
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-brass font-semibold mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Support
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/bugs"
                  className="text-sail-white/80 hover:text-brass transition-colors"
                  style={{fontFamily: 'Crimson Text, serif'}}
                >
                  🐛 Report Bugs
                </Link>
              </li>
              <li>
                <a
                  href="https://discord.gg/krakengaming"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sail-white/80 hover:text-brass transition-colors"
                  style={{fontFamily: 'Crimson Text, serif'}}
                >
                  Discord Support
                </a>
              </li>
              <li>
                <Link
                  href="/legal"
                  className="text-sail-white/80 hover:text-brass transition-colors"
                  style={{fontFamily: 'Crimson Text, serif'}}
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-brass-dark pt-6 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-brass text-sm" style={{fontFamily: 'Cinzel, serif'}}>
              © 2025 Kraken Gaming. All rights reserved.
            </p>
            <p className="text-sail-white/60 text-sm mt-2 md:mt-0" style={{fontFamily: 'Crimson Text, serif'}}>
              Rule the Caribbean waters with honor and strategy.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
