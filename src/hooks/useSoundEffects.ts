import { useEffect, useRef } from 'react';
import { useGameState } from '../contexts/GameStateContext';

declare global {
  interface Window {
    zzfx: (...parameters: any[]) => void;
  }
}

export function useSoundEffects() {
  const { state } = useGameState();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Ship online sound effect
  const playShipOnlineSound = () => {
    // zzfx(...[1.1,,80,.01,.01,.02,2,3.9,,,-257,.4,,,1,-0.1,.3,.83,.03,,183]); // ON
    window.zzfx(1.1, 0, 80, 0.01, 0.01, 0.02, 2, 3.9, 0, 0, -257, 0.4, 0, 0, 1, -0.1, 0.3, 0.83, 0.03, 0, 183);
  };

  useEffect(() => {
    // When spaceship comes online, play the sound immediately and start the interval
    if (state.spaceshipOnline && !intervalRef.current) {
      playShipOnlineSound();

      // Set up interval to play every 60 seconds
      intervalRef.current = setInterval(() => {
        if (state.spaceshipOnline) { // Double-check the ship is still online
          playShipOnlineSound();
        }
      }, 60000); // 60 seconds
    }

    // When spaceship goes offline, clear the interval
    if (!state.spaceshipOnline && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.spaceshipOnline]);

  // Return functions for manual sound triggering if needed
  return {
    playShipOnlineSound
  };
}