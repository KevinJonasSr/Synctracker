import Header from "@/components/layout/header";
import SmartPitchMatching from "@/components/smart-pitch-matching";

export default function SmartPitch() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Header 
        title="Smart Pitch Matching" 
        description="AI-powered song recommendations for sync licensing opportunities"
      />
      <SmartPitchMatching />
    </div>
  );
}