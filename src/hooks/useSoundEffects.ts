import { useEffect, useRef, useState } from 'react';
import { useGameState } from '../contexts/GameStateContext';

declare global {
  interface Window {
    zzfx: (...parameters: any[]) => void;
  }
}

export function useSoundEffects() {
  const { state } = useGameState();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const engineStartupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const engineRunningIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Engine startup sounds
  const engineStartupSounds = [
    [1.7,,13,.03,.02,.04,2,1.1,,,,,.03,,40,,,.59,,.4],
    [.6,,100,.03,.03,.001,2,2.6,,24,23,.14,,,,,,.73,.01,,-1497],
    [1.8,,118,,.02,.04,3,.8,39,,,,.01,,21,,.04,.9,.01,.18],
    [1.1,,189,.03,.06,.03,1,,,,,,,1.1,21,.5,,.47,.02],
    [.9,,929,,.02,.04,3,2,,,,,,,43,,.14,.82,,,180],
    [5,,276,.02,.04,.13,1,1.2,-1,-63,,,,.2,21,,.1,.74,.03,,387],
    [1.1,,33,.02,.15,.17,1,0,,,-18,,,.1,.7,,.18,.85,.1,.37,896],
    [,,301,.07,.3,.17,,2.9,,,-109,.1,,.5,,,,.74,.25]
  ];

  // Engine online sounds (successful startup)
  const engineOnlineSounds = [
    [1.1,,33,.02,.15,.17,1,0,,,-18,,,.1,.7,,.18,.85,.1,.37,896],
    [1.1,,89,.02,.15,.17,1,0,,,-18,.01,,.1,.7,,.18,.85,.09,.36,896],
    [1.1,,89,.02,.15,.17,1,0,,,-18,.01,,.1,.7,,.18,.85,.09,.36,896],
    [1.1,,89,.02,.15,.16,2,.9,,,-68,.01,,.1,.7,,.19,.85,1,.36,896],
    [.9,,96,.03,.01,.31,5,.1,,,,,,,17,,.03,.92,.02,.04,-1459],
    [.9,,96,.03,.01,.31,5,.1,,,,,,,17,,.03,.92,.02,.04,-1459],
    [.9,,96,.03,.01,.31,5,.1,,,,,,,17,,.03,.92,.02,.04,-1459],
    [.9,,69,.03,.01,.31,5,.1,,,7,,,6,17,,.03,.92,1,.04,-1459],
    [1.1,,89,.02,.15,.16,1,0,,1,-68,.01,,.1,.7,,.3,.85,1,.36,896]
  ];

  // Ship online sound effect
  const playShipOnlineSound = () => {
    // zzfx(...[1.1,,80,.01,.01,.02,2,3.9,,,-257,.4,,,1,-0.1,.3,.83,.03,,183]); // ON
    window.zzfx(1.1, 0, 80, 0.01, 0.01, 0.02, 2, 3.9, 0, 0, -257, 0.4, 0, 0, 1, -0.1, 0.3, 0.83, 0.03, 0, 183);
  };

  // Engine startup sound effect
  const playEngineStartupSound = () => {
    const randomSound = engineStartupSounds[Math.floor(Math.random() * engineStartupSounds.length)];
    window.zzfx(...randomSound);
  };

  // Engine online sound effect (successful startup - 16 second pattern)
  const playEngineOnlineSound = (soundIndex: number) => {
    console.log('Playing engine online sound:', soundIndex);
    if (soundIndex < engineOnlineSounds.length) {
      window.zzfx(...engineOnlineSounds[soundIndex]);
    }
  };

  // Spaceship online sound disabled - was playing on nav3 screen entry
  // useEffect(() => {
  //   // When spaceship comes online, play the sound immediately and start the interval
  //   if (state.spaceshipOnline && !intervalRef.current) {
  //     playShipOnlineSound();

  //     // Set up interval to play every 60 seconds
  //     intervalRef.current = setInterval(() => {
  //       if (state.spaceshipOnline) { // Double-check the ship is still online
  //         playShipOnlineSound();
  //       }
  //     }, 60000); // 60 seconds
  //   }

  //   // When spaceship goes offline, clear the interval
  //   if (!state.spaceshipOnline && intervalRef.current) {
  //     clearInterval(intervalRef.current);
  //     intervalRef.current = null;
  //   }

  //   // Cleanup on unmount
  //   return () => {
  //     if (intervalRef.current) {
  //       clearInterval(intervalRef.current);
  //     }
  //   };
  // }, [state.spaceshipOnline]);

  // Engine startup sound effects
  useEffect(() => {
    if (state.systems.engineStarting && !engineStartupIntervalRef.current) {
      // Play startup sound immediately
      playEngineStartupSound();

      // Set up interval to play startup sounds during the 5-second startup
      engineStartupIntervalRef.current = setInterval(() => {
        if (state.systems.engineStarting) {
          playEngineStartupSound();
        }
      }, 300); // Play every 0.3 seconds during startup
    }

    // When engine stops starting, clear the interval
    if (!state.systems.engineStarting && engineStartupIntervalRef.current) {
      clearInterval(engineStartupIntervalRef.current);
      engineStartupIntervalRef.current = null;
    }

    // Cleanup on unmount
    return () => {
      if (engineStartupIntervalRef.current) {
        clearInterval(engineStartupIntervalRef.current);
      }
    };
  }, [state.systems.engineStarting]);

  // Engine online sound effects (16-second tapering pattern)
  const [engineSoundsStarted, setEngineSoundsStarted] = useState(false);

  useEffect(() => {
    // Start engine sounds when engines come online, but don't restart on console visits
    if (state.systems.engines && !engineRunningIntervalRef.current && !engineSoundsStarted) {
      setEngineSoundsStarted(true);
      let soundIndex = 0;
      let cycleCount = 0;
      const startTime = Date.now();

      const playNextSound = () => {
        const elapsed = Date.now() - startTime;

        // Stop after 30 seconds (single playthrough)
        if (elapsed >= 30000) {
          return; // End the sequence
        }

        // Determine which phase we're in
        let maxSoundsInPhase: number;
        let interval: number;

        if (elapsed < 7500) { // First 7.5 seconds - dense (9 sounds)
          maxSoundsInPhase = 9;
          interval = 200; // 0.2 seconds
        } else if (elapsed < 15000) { // Next 7.5 seconds - medium (6 sounds)
          maxSoundsInPhase = 6;
          interval = 400; // 0.4 seconds
        } else if (elapsed < 22500) { // Next 7.5 seconds - sparse (4 sounds)
          maxSoundsInPhase = 4;
          interval = 800; // 0.8 seconds
        } else { // Last 7.5 seconds - very sparse (2 sounds)
          maxSoundsInPhase = 2;
          interval = 1600; // 1.6 seconds
        }

        // Play the sound and increment index
        playEngineOnlineSound(soundIndex);
        soundIndex = (soundIndex + 1) % maxSoundsInPhase;

        // Schedule next sound
        engineRunningIntervalRef.current = setTimeout(playNextSound, interval);
      };

      // Start the pattern
      playNextSound();
    }

    // When engine stops running, clear the timeout and reset flag
    if (!state.systems.engines && engineRunningIntervalRef.current) {
      clearTimeout(engineRunningIntervalRef.current);
      engineRunningIntervalRef.current = null;
      setEngineSoundsStarted(false);
    }

    // Cleanup on unmount
    return () => {
      if (engineRunningIntervalRef.current) {
        clearTimeout(engineRunningIntervalRef.current);
      }
    };
  }, [state.systems.engines]);

  // Return functions for manual sound triggering if needed
  return {
    playShipOnlineSound,
    playEngineStartupSound,
    playEngineOnlineSound
  };
}