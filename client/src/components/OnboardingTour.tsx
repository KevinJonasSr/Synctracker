import { useEffect } from 'react';
import introJs from 'intro.js';
import 'intro.js/introjs.css';

interface OnboardingTourProps {
  enabled: boolean;
  onExit: () => void;
}

const tourSteps = [
  {
    element: '#dashboard-overview',
    intro: 'Welcome to the SyncTracker Dashboard! Here you can get an overview of your sync licensing deals, revenue metrics, and recent activity.',
    position: 'bottom' as const
  },
  {
    element: '#add-song-button',
    intro: 'Use this button to add new songs to your catalog with all the metadata you need.',
    position: 'right' as const
  },
  {
    element: '#add-deal-button',
    intro: 'Click here to create a new pitch or deal. Track your licensing opportunities from start to finish.',
    position: 'right' as const
  },
  {
    element: '#add-template-button',
    intro: 'Add industry contacts here. Build and maintain relationships with music supervisors, producers, and other professionals.',
    position: 'right' as const
  }
];

export default function OnboardingTour({ enabled, onExit }: OnboardingTourProps) {
  useEffect(() => {
    if (!enabled) return;

    const intro = introJs.tour();
    
    intro.setOptions({
      steps: tourSteps,
      exitOnOverlayClick: false,
      showStepNumbers: true,
      showBullets: false,
      showProgress: true,
      scrollToElement: true,
      overlayOpacity: 0.5,
    });

    intro.onexit(onExit);
    intro.start();

    return () => {
      intro.exit(false);
    };
  }, [enabled, onExit]);

  return null;
}
