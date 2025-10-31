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
    intro: 'Welcome to the SyncTracker Dashboard! Here you can get an overview of songs, deals, and tasks.',
    position: 'bottom' as const
  },
  {
    element: '#add-song-button',
    intro: 'Use this button to add a new song.',
    position: 'right' as const
  },
  {
    element: '#add-deal-button',
    intro: 'Click here to create a new deal.',
    position: 'right' as const
  },
  {
    element: '#add-template-button',
    intro: 'Templates help you streamline email campaigns—create one here.',
    position: 'right' as const
  }
];

export default function OnboardingTour({ enabled, onExit }: OnboardingTourProps) {
  useEffect(() => {
    if (!enabled) return;

    const intro = introJs();
    
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
