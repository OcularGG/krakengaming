import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bug Reports | KrakenGaming',
  description: 'View and report bugs for KrakenGaming platform',
  keywords: 'bug reports, issues, KrakenGaming, naval action, gaming',
};

export default function BugsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
