import Header from "@/components/Header";
import { 
  HeroSection, 
  FeaturesSection, 
  HowItWorksSection, 
  SavingsSection, 
  TestimonialsSection,
  CTASection, 
  FooterSection 
} from "@/components/HomePage";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <SavingsSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <FooterSection />
    </div>
  );
}
