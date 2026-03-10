import LandingSection from "./_common/landing-section";
import Testimonials from "./_common/testimonials";
import HowItWorks from "./_common/how-it-works";
import FeaturesHighlights from "./_common/features-highlights";

export default function Home() {
  return (
    <div>
      <LandingSection />
      <HowItWorks />
      <FeaturesHighlights />
      <Testimonials />
    </div>
  );
}
