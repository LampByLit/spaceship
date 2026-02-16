import { useEffect, useRef, useState } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { soundEffects } from '../utils/soundUtils';

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
  const engineHeartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);


  // Sound effect functions from soundUtils
  const playShipOnlineSound = soundEffects.playShipOnlineSound;
  const playMasterPowerSound = soundEffects.playMasterPowerSound;
  const playEngineReadySound = soundEffects.playEngineReadySound;
  const playEngineOnlineSound = soundEffects.playEngineOnlineSound;
  const playEngineHeartbeatSound = soundEffects.playEngineHeartbeatSound;

  // Spaceship online sound - plays when ship comes online and repeats every 60 seconds
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

  // Engine startup sound effects - use engine online sounds during startup
  useEffect(() => {
    if (state.systems.engineStarting && !engineStartupIntervalRef.current) {
      let sequenceIndex = 0;

      // Play first engine online sound immediately
      playEngineOnlineSound(sequenceIndex);

      // Set up rapid interval to cycle through all 9 engine online sounds repeatedly
      engineStartupIntervalRef.current = setInterval(() => {
        if (state.systems.engineStarting) {
          sequenceIndex = (sequenceIndex + 1) % 9; // Cycle through all 9 sounds
          playEngineOnlineSound(sequenceIndex);
        }
      }, 200); // Play every 0.2 seconds for rapid repetition
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

  // Engine ready sound effect
  const [previousEngineState, setPreviousEngineState] = useState({ engines: false, engineReady: false });

  useEffect(() => {
    // Play ready sound when engines become ready (initial priming)
    if (state.systems.engineReady && !state.systems.engines && !state.systems.engineStarting &&
        !previousEngineState.engineReady) {
      playEngineReadySound();
    }

    // Play ready sound when engines are turned off but remain in ready mode
    if (state.systems.engineReady && !state.systems.engines && !state.systems.engineStarting &&
        previousEngineState.engines && !previousEngineState.engineReady) {
      playEngineReadySound();
    }

    // Update previous state
    setPreviousEngineState({
      engines: state.systems.engines,
      engineReady: state.systems.engineReady
    });
  }, [state.systems.engineReady, state.systems.engines, state.systems.engineStarting]);

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

  // Engine heartbeat sound - plays every minute when engines are online
  useEffect(() => {
    if (state.systems.engines && !engineHeartbeatIntervalRef.current) {
      // Set up interval to play heartbeat sound every 60 seconds (1 minute)
      engineHeartbeatIntervalRef.current = setInterval(() => {
        if (state.systems.engines) { // Double-check engines are still online
          playEngineHeartbeatSound();
        }
      }, 60000); // 60 seconds = 1 minute
    }

    // When engines go offline, clear the heartbeat interval
    if (!state.systems.engines && engineHeartbeatIntervalRef.current) {
      clearInterval(engineHeartbeatIntervalRef.current);
      engineHeartbeatIntervalRef.current = null;
    }

    // Cleanup on unmount
    return () => {
      if (engineHeartbeatIntervalRef.current) {
        clearInterval(engineHeartbeatIntervalRef.current);
      }
    };
  }, [state.systems.engines]);

  // Return functions for manual sound triggering if needed
  return {
    playShipOnlineSound,
    playEngineReadySound,
    playEngineOnlineSound,
    playEngineHeartbeatSound,
    playMasterPowerSound
  };
}