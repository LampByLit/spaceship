declare global {
  interface Window {
    zzfx: (...parameters: any[]) => void;
  }
}

// Sound effect functions that don't depend on React state
export const soundEffects = {
  // Ship online sound effect
  playShipOnlineSound: () => {
    window.zzfx(1.1, 0, 80, 0.01, 0.01, 0.02, 2, 3.9, 0, 0, -257, 0.4, 0, 0, 1, -0.1, 0.3, 0.83, 0.03, 0, 183);
  },

  // Master power toggle sound effect
  playMasterPowerSound: () => {
    // Use a loud, clear beep sound
    window.zzfx(1, 0, 220, 0.1, 0.1, 0.1, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  },

  // Primary/secondary power button sound effect
  playMainPowerSound: () => {
    // Primary/secondary power button sound: zzfx(...[1.2,,15,,.04,.03,1,3.3,,,,,,,,,,.85,.01,,149])
    window.zzfx(...[1.2,,15,,.04,.03,1,3.3,,,,,,,,,,.85,.01,,149]);
  },

  // Backup/auxiliary power button sound effect
  playBackupPowerSound: () => {
    // Backup/auxiliary power button sound: zzfx(...[2,,317,.01,.03,.04,,2.5,-1,,82,.21,,,37,,.03,.6,.02])
    window.zzfx(...[2,,317,.01,.03,.04,,2.5,-1,,82,.21,,,37,,.03,.6,.02]);
  },

  // Console power button sound effect
  playConsolePowerSound: () => {
    // Blip 865 sound: zzfx(...[,,228,.02,.01,.02,,3,,1,,,,,,,,.7,.01])
    window.zzfx(...[,,228,.02,.01,.02,,3,,1,,,,,,,,.7,.01]);
  },

  // Engine ready sound effect (priming complete)
  playEngineReadySound: () => {
    window.zzfx(...[2.3,,228,.02,.03,.006,1,2.6,4,,-361,.01,,,97,.4,.09,.95,.02,,120]);
  },

  // Engine online sound effect (successful startup)
  playEngineOnlineSound: (soundIndex: number) => {
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
    if (soundIndex < engineOnlineSounds.length) {
      window.zzfx(...engineOnlineSounds[soundIndex]);
    }
  },

  // Engine running heartbeat sound (plays every minute when engines are online)
  playEngineHeartbeatSound: () => {
    window.zzfx(...[,,90,.04,2,.2,5,1.8,,,,,,,5.2,,,.84,1]);
  }
};