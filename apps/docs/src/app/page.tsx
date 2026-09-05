import { FeatureGrid } from './feature-grid';
import { HeroSection } from './hero-section';
import { InstallSection } from './install-section';
import { TerminalPreview } from './terminal-preview';

export default function HomePage() {
  return (
    <div className="py-12 sm:py-20 space-y-24">
      <HeroSection />
      <InstallSection />
      <TerminalPreview />
      <FeatureGrid />
    </div>
  );
}
