import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { soundEffects } from '../utils/soundUtils';

// Define all control types
export type ControlId =
  // Power & Gain Panel
  | 'pwr-1' | 'pwr-2' | 'pwr-5' | 'pwr-6' | 'pwr-7' | 'pwr-8' | 'pwr-9' | 'pwr-10'
  | 'master-toggle'
  // Console Readout Toggles
  | 'aux-pwr' | 'prim-pwr' | 'sec-pwr' | 'override' | 'auto-cal' | 'manual'
  | 'feed-1' | 'feed-2' | 'feed-3' | 'sync' | 'lock' | 'release'
  | 'shield' | 'isolate' | 'latch' | 'emergency' | 'reset' | 'standby'
  | 'forward' | 'reverse' | 'active' | 'record' | 'monitor' | 'mute'
  | 'distribute' | 'reserve' | 'boost' | 'margin' | 'clear' | 'execute'
  | 'digital-1' | 'digital-2' | 'analog' | 'cache' | 'flush' | 'buffer'
  | 'limit' | 'thresh' | 'gate' | 'comp' | 'low-freq' | 'mid-freq' | 'hi-freq'
  // Footer Toggles
  | 'f0' | 'f1' | 'f2' | 'f3' | 'f4' | 'f5' | 'f6' | 'f7' | 'f8' | 'f9' | 'f10' | 'f11' | 'f12' | 'f13'
  // Battery Control Toggles
  | 'config-1' | 'config-2' | 'config-3' | 'config-4'
  | 'charge-mode'
  // Battery Control Knobs (values 0-100)
  | 'out-1' | 'out-2' | 'mon-1' | 'mon-2' | 'cue-1'
  // Engine Power Supply Controls
  | 'engine-master' | 'engine-pwr-1' | 'engine-pwr-2' | 'engine-ready-1' | 'engine-ready-2'
  // Navigation Console Controls
  | 'nav-thrust' | 'nav-vector'
  // Communications Console Controls
  | 'comms-master' | 'comms-pwr-1' | 'comms-pwr-2'
  // Outernet Connection Toggles
  | 'conn-satellite' | 'conn-radio' | 'conn-laser' | 'conn-quantum'
  | 'conn-microwave' | 'conn-infrared' | 'conn-plasma' | 'conn-neural'
  | 'conn-gravitic' | 'conn-psionic' | 'conn-temporal' | 'conn-dimensional'
  | 'conn-subspace' | 'conn-hyperwave' | 'conn-tachyon' | 'conn-darkmatter';

// Enhanced spaceship systems with real state
export interface SpaceshipSystems {
  power: boolean;
  hullIntegrity: number; // 0-100
  batteryPower: number; // 0-100
  powerSystems: boolean;
  lifeSupport: boolean;
  engines: boolean;
  engineReady: boolean; // Engine power supply primed and ready for engagement
  engineStarting: boolean; // Engine is currently in startup process
  engineStartupProgress: number; // 0-100 during startup
  engineStartupStartTime: number; // timestamp when startup began
  starterDamage: number; // percentage chance of startup failure (0-100)
  navigation: boolean;
  shields: boolean;
  weapons: boolean;
  coreSystems: boolean;
  communications: boolean;
  sensors: boolean;
  defensiveArray: boolean;
  propulsion: boolean;
  cargoSystems: boolean;
  maintenance: boolean;
  emergencyProtocols: boolean;
  // New real spaceship properties
  position: { x: number; y: number; z: number }; // coordinates in space
  velocity: { x: number; y: number; z: number }; // velocity vector
  heading: number; // degrees, 0-360
  speed: number; // current speed in light years per hour
  fuelLevel: number; // 0-100 (legacy - now used for main fuel)
  mainFuel: number; // 0-100
  reserveFuel: number; // 0-100
  boostFuel: number; // 0-100
  emergencyFuel: number; // 0-100
  coolantFuel: number; // 0-100
  auxiliaryFuel: number; // 0-100
  maneuverFuel: number; // 0-100
  scramFuel: number; // 0-100
  reactorTemperature: number; // 0-1000 (degrees)
  shieldStrength: number; // 0-100
  weaponCharge: number; // 0-100
  lastDamage: string; // description of last damage taken
  missionTime: number; // seconds since mission start
  alertStatus: 'normal' | 'caution' | 'warning' | 'critical';
}

// Game state interface
export interface GameState {
  controls: Record<ControlId, boolean | number>;
  systems: SpaceshipSystems;
  spaceshipOnline: boolean;
  spaceshipStandby: boolean;
  criticalControlsMet: boolean;
  errors: string[];
  startupSequence: {
    powerGainPanelComplete: boolean;
    footerCriticalComplete: boolean;
  };
  currentConsole: 'nav1' | 'nav2' | 'nav3' | 'nav4' | 'nav5' | 'nav6' | 'nav7' | 'nav8';
  // New persistent state properties
  logs: LogEntry[];
  lastSaved: number; // timestamp
  // Navigation command activation
  navigationCommandActivated: boolean;
  // Navigation command history
  navigationCommandHistory: string[];
}

// Log entry interface
export interface LogEntry {
  timestamp: number;
  level: 'info' | 'warning' | 'error' | 'critical' | 'system';
  message: string;
  source: string;
  data?: any;
}

// Action types
type GameAction =
  | { type: 'TOGGLE_CONTROL'; controlId: ControlId }
  | { type: 'SET_CONTROL_VALUE'; controlId: ControlId; value: number }
  | { type: 'SET_SYSTEM_STATUS'; system: keyof SpaceshipSystems; status: boolean | number }
  | { type: 'ADD_ERROR'; error: string }
  | { type: 'CLEAR_ERROR'; error: string }
  | { type: 'CHECK_CRITICAL_CONTROLS' }
  | { type: 'CHECK_STARTUP_SEQUENCE' }
  | { type: 'SET_SPACESHIP_ONLINE'; online: boolean }
  | { type: 'SET_CONSOLE'; console: 'nav1' | 'nav2' | 'nav3' | 'nav4' | 'nav5' | 'nav6' | 'nav7' | 'nav8' }
  | { type: 'ADD_LOG'; log: LogEntry }
  | { type: 'LOAD_STATE'; state: GameState }
  | { type: 'SAVE_STATE' }
  | { type: 'RESET_GAME' }
  | { type: 'SET_NAVIGATION_COMMAND'; activated: boolean }
  | { type: 'ADD_NAVIGATION_COMMAND'; command: string }
  | { type: 'CONSUME_FUEL'; amount: number };

// Critical controls that must be on for spaceship to operate
const CRITICAL_CONTROLS: ControlId[] = [
  // Power & Gain Panel - all buttons must be on
  'pwr-1', 'pwr-2', 'pwr-5', 'pwr-6', 'pwr-7', 'pwr-8', 'pwr-9', 'pwr-10',
  'master-toggle',
  // First 4 footer toggles: SAFE, ARM, LOCK, KEY
  'f0', 'f1', 'f2', 'f3'
];

// Initial state
const initialState: GameState = {
  controls: {
    // Power & Gain Panel
    'pwr-1': false, 'pwr-2': false, 'pwr-5': false, 'pwr-6': false,
    'pwr-7': false, 'pwr-8': false, 'pwr-9': false, 'pwr-10': false,
    'master-toggle': false,
    // Console Readout Toggles
    'aux-pwr': false, 'prim-pwr': false, 'sec-pwr': false, 'override': false,
    'auto-cal': false, 'manual': false, 'feed-1': false, 'feed-2': false,
    'feed-3': false, 'sync': false, 'lock': false, 'release': false,
    'shield': false, 'isolate': false, 'latch': false, 'emergency': false,
    'reset': false, 'standby': false, 'forward': false, 'reverse': false,
    'active': false, 'record': false, 'monitor': false, 'mute': false,
    'distribute': false, 'reserve': false, 'boost': false, 'margin': false,
    'clear': false, 'execute': false, 'digital-1': false, 'digital-2': false,
    'analog': false, 'cache': false, 'flush': false, 'buffer': false,
    'limit': false, 'thresh': false, 'gate': false, 'comp': false,
    'low-freq': false, 'mid-freq': false, 'hi-freq': false,
    // Footer Toggles
    'f0': false, 'f1': false, 'f2': false, 'f3': false, 'f4': true,  // NAV.1 on by default
    'f5': false, 'f6': false, 'f7': false, 'f8': false, 'f9': false,
    'f10': false, 'f11': false, 'f12': false, 'f13': false,
    // Battery Control Toggles
    'config-1': false, 'config-2': false, 'config-3': false, 'config-4': false,
    'charge-mode': false,
    // Battery Control Knobs (start at 0%)
    'out-1': 0, 'out-2': 0, 'mon-1': 0, 'mon-2': 0, 'cue-1': 0,
    // Engine Power Supply Controls
    'engine-master': false, 'engine-pwr-1': false, 'engine-pwr-2': false,
    'engine-ready-1': false, 'engine-ready-2': false,
    // Navigation Console Controls (start at 0%)
    'nav-thrust': 0, 'nav-vector': 0,
    // Communications Console Controls
    'comms-master': false, 'comms-pwr-1': false, 'comms-pwr-2': false,
    // Outernet Connection Toggles (start OFF by default)
    'conn-satellite': false, 'conn-radio': false, 'conn-laser': false, 'conn-quantum': false,
    'conn-microwave': false, 'conn-infrared': false, 'conn-plasma': false, 'conn-neural': false,
    'conn-gravitic': false, 'conn-psionic': false, 'conn-temporal': false, 'conn-dimensional': false,
    'conn-subspace': false, 'conn-hyperwave': false, 'conn-tachyon': false, 'conn-darkmatter': false
  },
  systems: {
    power: false,
    hullIntegrity: 98.7,
    batteryPower: 98.7,
    powerSystems: false,
    lifeSupport: false,
    engines: false,
    engineReady: false,
    engineStarting: false,
    engineStartupProgress: 0,
    engineStartupStartTime: 0,
    starterDamage: 50,
    navigation: false,
    shields: false,
    weapons: false,
    coreSystems: false,
    communications: false,
    sensors: false,
    defensiveArray: false,
    propulsion: false,
    cargoSystems: false,
    maintenance: false,
    emergencyProtocols: false,
    // New spaceship properties
    position: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    heading: 0,
    speed: 0,
    fuelLevel: 100,
    mainFuel: 100,
    reserveFuel: 100,
    boostFuel: 100,
    emergencyFuel: 100,
    coolantFuel: 100,
    auxiliaryFuel: 100,
    maneuverFuel: 100,
    scramFuel: 100,
    reactorTemperature: 150,
    shieldStrength: 0,
    weaponCharge: 0,
    lastDamage: 'None',
    missionTime: 0,
    alertStatus: 'normal'
  },
  spaceshipOnline: false,
  spaceshipStandby: false,
  criticalControlsMet: false,
  errors: [],
  startupSequence: {
    powerGainPanelComplete: false,
    footerCriticalComplete: false
  },
  currentConsole: 'nav1',
  logs: [],
  lastSaved: Date.now(),
  navigationCommandActivated: false,
  navigationCommandHistory: []
};

// Reducer function
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'TOGGLE_CONTROL': {
      let newControls = { ...state.controls };
      let logsToAdd: LogEntry[] = [];

      // Special handling for NAV toggles (f4-f11) - make them mutually exclusive
      if (action.controlId.startsWith('f') && parseInt(action.controlId.slice(1)) >= 4 && parseInt(action.controlId.slice(1)) <= 11) {
        // Turn off all NAV toggles first
        for (let i = 4; i <= 11; i++) {
          newControls[`f${i}` as ControlId] = false;
        }
        // Turn on the selected NAV toggle
        newControls[action.controlId] = true;

        // Map NAV toggle to console
        const navIndex = parseInt(action.controlId.slice(1)) - 4 + 1; // f4 = nav1, f5 = nav2, etc.
        const consoleId = `nav${navIndex}` as 'nav1' | 'nav2' | 'nav3' | 'nav4' | 'nav5' | 'nav6' | 'nav7' | 'nav8';

        logsToAdd.push(createLog('info', `Switched to navigation console ${consoleId.toUpperCase()}`, 'Navigation'));

        return {
          ...state,
          controls: newControls,
          currentConsole: consoleId,
          logs: [...state.logs, ...logsToAdd].slice(-100)
        };
      } else {
        // Normal toggle for non-NAV controls
        newControls[action.controlId] = !state.controls[action.controlId];
        const newValue = newControls[action.controlId];

        // Add comprehensive logging for all controls
        if (action.controlId === 'master-toggle') {
          logsToAdd.push(createLog(
            newValue ? 'system' : 'warning',
            `MASTER POWER ${newValue ? 'ENGAGED' : 'DISENGAGED'} - Main power distribution ${newValue ? 'active' : 'offline'}`,
            'Power Systems'
          ));
        } else if (action.controlId.startsWith('pwr-')) {
          // Enhanced logging for all power buttons
          const powerLabels: Record<string, string> = {
            'pwr-1': 'PRIMARY REACTOR',
            'pwr-2': 'SECONDARY REACTOR',
            'pwr-5': 'BACKUP SYSTEMS',
            'pwr-6': 'AUXILIARY POWER',
            'pwr-7': 'EMERGENCY POWER',
            'pwr-8': 'SHUTDOWN SYSTEMS',
            'pwr-9': 'REACTOR CORE',
            'pwr-10': 'COOLING SYSTEMS'
          };
          const label = powerLabels[action.controlId] || action.controlId.toUpperCase();
          logsToAdd.push(createLog(
            newValue ? 'system' : 'warning',
            `${label} ${newValue ? 'ONLINE' : 'OFFLINE'} - Power distribution ${newValue ? 'engaged' : 'disengaged'}`,
            'Power Systems'
          ));
        } else if (action.controlId === 'aux-pwr') {
          logsToAdd.push(createLog(
            newValue ? 'system' : 'warning',
            `AUXILIARY POWER ${newValue ? 'ENGAGED' : 'OFFLINE'} - Backup power systems ${newValue ? 'active' : 'inactive'}`,
            'Power Distribution'
          ));
        } else if (action.controlId === 'prim-pwr') {
          logsToAdd.push(createLog(
            newValue ? 'system' : 'warning',
            `PRIMARY POWER ${newValue ? 'ENGAGED' : 'OFFLINE'} - Main power grid ${newValue ? 'active' : 'inactive'}`,
            'Power Distribution'
          ));
        } else if (action.controlId === 'sec-pwr') {
          logsToAdd.push(createLog(
            newValue ? 'system' : 'warning',
            `SECONDARY POWER ${newValue ? 'ENGAGED' : 'OFFLINE'} - Secondary power grid ${newValue ? 'active' : 'inactive'}`,
            'Power Distribution'
          ));
        } else if (action.controlId === 'emergency') {
          logsToAdd.push(createLog(
            newValue ? 'critical' : 'warning',
            `EMERGENCY PROTOCOLS ${newValue ? 'ACTIVATED' : 'DEACTIVATED'} - All safety systems ${newValue ? 'engaged' : 'standby'}`,
            'Emergency Systems'
          ));
        } else if (action.controlId === 'f13') {
          logsToAdd.push(createLog(
            newValue ? 'critical' : 'warning',
            `ABORT SEQUENCE ${newValue ? 'INITIATED' : 'CANCELLED'} - Mission abort protocols ${newValue ? 'active' : 'standby'}`,
            'Emergency Systems'
          ));
        } else if (action.controlId === 'shield') {
          logsToAdd.push(createLog(
            newValue ? 'info' : 'warning',
            `SHIELD SYSTEMS ${newValue ? 'ACTIVATED' : 'DEACTIVATED'} - Defensive energy field ${newValue ? 'online' : 'offline'}`,
            'Defensive Systems'
          ));
        } else if (action.controlId.startsWith('config-')) {
          const configLabels: Record<string, string> = {
            'config-1': 'AUTO-RECHARGE',
            'config-2': 'BOOST MODE',
            'config-3': 'REGENERATION',
            'config-4': 'STANDBY MODE'
          };
          const label = configLabels[action.controlId] || action.controlId.toUpperCase();
          logsToAdd.push(createLog(
            'info',
            `BATTERY CONFIG: ${label} ${newValue ? 'ENABLED' : 'DISABLED'} - Power management updated`,
            'Battery Configuration'
          ));
        } else if (action.controlId === 'charge-mode') {
          logsToAdd.push(createLog(
            newValue ? 'system' : 'info',
            `CHARGE MODE ${newValue ? 'ACTIVATED' : 'DEACTIVATED'} - Battery charging ${newValue ? 'engaged' : 'standby'}`,
            'Battery Systems'
          ));
        } else if (action.controlId === 'feed-1' || action.controlId === 'feed-2' || action.controlId === 'feed-3') {
          const feedLabels: Record<string, string> = {
            'feed-1': 'PRIMARY FEED',
            'feed-2': 'SECONDARY FEED',
            'feed-3': 'AUXILIARY FEED'
          };
          const label = feedLabels[action.controlId] || action.controlId.toUpperCase();
          logsToAdd.push(createLog(
            newValue ? 'system' : 'warning',
            `ENGINE POWER ${label} ${newValue ? 'ENGAGED' : 'OFFLINE'} - Propulsion power ${newValue ? 'connected' : 'disconnected'}`,
            'Engine Power Systems'
          ));
        } else if (action.controlId === 'forward' || action.controlId === 'reverse') {
          const direction = action.controlId === 'forward' ? 'FORWARD' : 'REVERSE';
          logsToAdd.push(createLog(
            newValue ? 'info' : 'warning',
            `THRUST DIRECTION: ${direction} ${newValue ? 'ENGAGED' : 'OFFLINE'} - Engine thrust vector ${newValue ? 'active' : 'neutral'}`,
            'Propulsion Control'
          ));
        } else if (action.controlId === 'engine-master') {
          logsToAdd.push(createLog(
            newValue ? 'system' : 'warning',
            `ENGINE MASTER POWER ${newValue ? 'ENGAGED' : 'DISENGAGED'} - Engine power distribution ${newValue ? 'active' : 'offline'}`,
            'Engine Power Supply'
          ));
        } else if (action.controlId === 'engine-pwr-1' || action.controlId === 'engine-pwr-2') {
          const powerLabel = action.controlId === 'engine-pwr-1' ? 'ENGINE POWER A' : 'ENGINE POWER B';
          logsToAdd.push(createLog(
            newValue ? 'system' : 'warning',
            `${powerLabel} ${newValue ? 'ONLINE' : 'OFFLINE'} - Engine auxiliary power ${newValue ? 'engaged' : 'disengaged'}`,
            'Engine Power Supply'
          ));
        } else if (action.controlId === 'engine-ready-1' || action.controlId === 'engine-ready-2') {
          const readyLabel = action.controlId === 'engine-ready-1' ? 'ENGINE READY 1' : 'ENGINE READY 2';
          logsToAdd.push(createLog(
            newValue ? 'info' : 'warning',
            `${readyLabel} ${newValue ? 'ENGAGED' : 'STANDBY'} - Engine priming sequence ${newValue ? 'active' : 'incomplete'}`,
            'Engine Priming'
          ));
        } else if (action.controlId.startsWith('f') && parseInt(action.controlId.slice(1)) >= 0 && parseInt(action.controlId.slice(1)) <= 3) {
          // Critical footer toggles: SAFE, ARM, LOCK, KEY
          const footerLabels: Record<string, string> = {
            'f0': 'SAFE',
            'f1': 'ARM',
            'f2': 'LOCK',
            'f3': 'KEY'
          };
          const label = footerLabels[action.controlId] || action.controlId.toUpperCase();
          logsToAdd.push(createLog(
            newValue ? 'system' : 'warning',
            `SAFETY SYSTEM: ${label} ${newValue ? 'ENGAGED' : 'DISENGAGED'} - ${newValue ? 'Safety protocol activated' : 'Safety protocol deactivated'}`,
            'Safety Systems'
          ));
        } else if (action.controlId === 'distribute') {
          logsToAdd.push(createLog(
            newValue ? 'info' : 'warning',
            `POWER DISTRIBUTION ${newValue ? 'ACTIVE' : 'OFFLINE'} - ${newValue ? 'Power routing engaged' : 'Power routing disabled'}`,
            'Power Distribution'
          ));
        } else if (action.controlId === 'reserve') {
          logsToAdd.push(createLog(
            newValue ? 'info' : 'warning',
            `POWER RESERVE ${newValue ? 'ENGAGED' : 'OFFLINE'} - ${newValue ? 'Emergency power available' : 'Emergency power disconnected'}`,
            'Power Reserve'
          ));
        } else if (action.controlId === 'boost') {
          logsToAdd.push(createLog(
            newValue ? 'warning' : 'info',
            `POWER BOOST ${newValue ? 'ACTIVATED' : 'OFFLINE'} - ${newValue ? 'Overload protection disabled' : 'Normal power limits restored'}`,
            'Power Systems'
          ));
        } else if (action.controlId === 'margin') {
          logsToAdd.push(createLog(
            newValue ? 'info' : 'warning',
            `POWER MARGIN ${newValue ? 'ENGAGED' : 'OFFLINE'} - ${newValue ? 'Power reserve buffer active' : 'Power reserve buffer disabled'}`,
            'Power Management'
          ));
        } else if (action.controlId === 'clear') {
          logsToAdd.push(createLog(
            'info',
            `SYSTEM CLEAR ${newValue ? 'EXECUTED' : 'CANCELLED'} - ${newValue ? 'System cache flushed' : 'Clear operation aborted'}`,
            'System Control'
          ));
        } else if (action.controlId === 'execute') {
          logsToAdd.push(createLog(
            newValue ? 'system' : 'warning',
            `COMMAND EXECUTE ${newValue ? 'ENGAGED' : 'STANDBY'} - ${newValue ? 'System command processing active' : 'Command execution paused'}`,
            'System Control'
          ));
        }
      }

      let newState = { ...state, controls: newControls, logs: [...state.logs, ...logsToAdd].slice(-100) };

      // Check for emergency reset condition (both emergency and abort engaged)
      if (newControls.f12 === true && newControls.f13 === true) {
        // Add warning log before reset
        logsToAdd.push(createLog(
          'critical',
          'EMERGENCY + ABORT SEQUENCE DETECTED - Initiating complete system reset and page refresh',
          'Emergency Systems'
        ));

        // Reset the game
        newState = gameReducer(newState, { type: 'RESET_GAME' });

        // Turn off emergency and abort toggles after reset
        newState.controls.f12 = false;
        newState.controls.f13 = false;

        // Schedule page refresh after state update to ensure clean reset
        setTimeout(() => {
          window.location.reload();
        }, 100);

        return newState;
      }

      // Check critical controls and startup sequence after any toggle
      newState = checkCriticalControls(newState);
      newState = checkStartupSequence(newState);

      return newState;
    }

    case 'SET_CONTROL_VALUE': {
      const newControls = {
        ...state.controls,
        [action.controlId]: action.value
      };

      // Add logging for power-related value changes
      let logsToAdd: LogEntry[] = [];

      if (action.controlId.startsWith('out-')) {
        const side = action.controlId === 'out-1' ? 'PORT' : 'STARBOARD';
        logsToAdd.push(createLog(
          'info',
          `${side} BATTERY OUTPUT set to ${action.value}% - Power distribution adjusted`,
          'Battery Systems'
        ));
      } else if (action.controlId.startsWith('mon-')) {
        const side = action.controlId === 'mon-1' ? 'PORT' : 'STARBOARD';
        logsToAdd.push(createLog(
          'info',
          `${side} BATTERY MONITOR level: ${action.value}% - System monitoring updated`,
          'Battery Monitoring'
        ));
      } else if (action.controlId === 'cue-1') {
        logsToAdd.push(createLog(
          action.value > 50 ? 'warning' : 'info',
          `ALERT SYSTEM level: ${action.value}% - ${action.value > 50 ? 'High alert condition' : 'Normal monitoring'}`,
          'Alert Systems'
        ));
      } else if (action.controlId === 'nav-thrust') {
        logsToAdd.push(createLog(
          'info',
          `THRUST CONTROL set to ${action.value}% - Propulsion thrust vector adjusted`,
          'Navigation Control'
        ));
      } else if (action.controlId === 'nav-vector') {
        logsToAdd.push(createLog(
          'info',
          `VECTOR CONTROL set to ${action.value}% - Engine vector control updated`,
          'Navigation Control'
        ));
      }

      return { ...state, controls: newControls, logs: [...state.logs, ...logsToAdd].slice(-100) };
    }

    case 'SET_SYSTEM_STATUS': {
      const oldStatus = state.systems[action.system];
      const newSystems = {
        ...state.systems,
        [action.system]: action.status
      };

      // Generate log for system status change
      const systemLog = createSystemStatusLog(action.system, action.status as boolean | number, oldStatus as boolean | number);
      const logsToAdd = systemLog ? [systemLog] : [];

      return {
        ...state,
        systems: newSystems,
        logs: [...state.logs, ...logsToAdd].slice(-100)
      };
    }

    case 'ADD_ERROR': {
      return {
        ...state,
        errors: [...state.errors, action.error]
      };
    }

    case 'CLEAR_ERROR': {
      return {
        ...state,
        errors: state.errors.filter(error => error !== action.error)
      };
    }

    case 'CHECK_CRITICAL_CONTROLS': {
      return checkCriticalControls(state);
    }

    case 'CHECK_STARTUP_SEQUENCE': {
      return checkStartupSequence(state);
    }

    case 'SET_SPACESHIP_ONLINE': {
      return {
        ...state,
        spaceshipOnline: action.online,
        // When spaceship goes offline, also deactivate navigation command
        navigationCommandActivated: action.online ? state.navigationCommandActivated : false
      };
    }

    case 'SET_CONSOLE': {
      return { ...state, currentConsole: action.console };
    }

    case 'ADD_LOG': {
      const newLogs = [...state.logs, action.log].slice(-100); // Keep last 100 logs
      return { ...state, logs: newLogs };
    }

    case 'LOAD_STATE': {
      return action.state;
    }

    case 'SAVE_STATE': {
      // Save to localStorage
      try {
        const stateToSave = { ...state, lastSaved: Date.now() };
        localStorage.setItem('spaceship-state', JSON.stringify(stateToSave));
        return stateToSave;
      } catch (error) {
        console.error('Failed to save spaceship state:', error);
        return state;
      }
    }

    case 'RESET_GAME': {
      // Clear localStorage
      try {
        localStorage.removeItem('spaceship-state');
      } catch (error) {
        console.error('Failed to clear spaceship state:', error);
      }

      // Add critical log about reset
      const resetLog = createLog(
        'critical',
        'EMERGENCY SYSTEM RESET EXECUTED - All systems returned to initial state, mission data cleared',
        'Emergency Systems'
      );

      // Return initial state with reset log
      return {
        ...initialState,
        logs: [resetLog],
        lastSaved: Date.now()
      };
    }

    case 'SET_NAVIGATION_COMMAND': {
      return {
        ...state,
        navigationCommandActivated: action.activated
      };
    }

    case 'ADD_NAVIGATION_COMMAND': {
      const newHistory = [...state.navigationCommandHistory, action.command].slice(-8); // Keep last 8 commands
      return {
        ...state,
        navigationCommandHistory: newHistory
      };
    }

    case 'CONSUME_FUEL': {
      const newSystems = { ...state.systems };
      let amountLeft = action.amount;

      // Consume fuel in order: main → reserve → boost → emergency → coolant → auxiliary → maneuver → scram
      const fuelTanks = [
        'mainFuel', 'reserveFuel', 'boostFuel', 'emergencyFuel',
        'coolantFuel', 'auxiliaryFuel', 'maneuverFuel', 'scramFuel'
      ] as const;

      for (const tank of fuelTanks) {
        if (amountLeft <= 0) break;

        const currentFuel = newSystems[tank];
        if (currentFuel > 0) {
          const consumeAmount = Math.min(amountLeft, currentFuel);
          newSystems[tank] = Math.max(0, currentFuel - consumeAmount);
          amountLeft -= consumeAmount;
        }
      }

      return {
        ...state,
        systems: newSystems
      };
    }

    default:
      return state;
  }
}

// Helper functions
function createLog(level: LogEntry['level'], message: string, source: string, data?: any): LogEntry {
  return {
    timestamp: Date.now(),
    level,
    message,
    source,
    data
  };
}

function createSystemStatusLog(system: keyof SpaceshipSystems, newStatus: boolean | number, oldStatus: boolean | number): LogEntry {
  const systemLabels: Record<keyof SpaceshipSystems, string> = {
    power: 'MAIN POWER',
    hullIntegrity: 'HULL INTEGRITY',
    batteryPower: 'BATTERY POWER',
    powerSystems: 'POWER SYSTEMS',
    lifeSupport: 'LIFE SUPPORT',
    engines: 'ENGINE SYSTEMS',
    engineReady: 'ENGINE PRIMING',
    navigation: 'NAVIGATION SYSTEMS',
    shields: 'DEFENSIVE SHIELDS',
    weapons: 'WEAPON SYSTEMS',
    coreSystems: 'CORE SYSTEMS',
    communications: 'COMMUNICATIONS',
    sensors: 'SENSOR ARRAY',
    defensiveArray: 'DEFENSIVE ARRAY',
    propulsion: 'PROPULSION SYSTEMS',
    cargoSystems: 'CARGO SYSTEMS',
    maintenance: 'MAINTENANCE SYSTEMS',
    emergencyProtocols: 'EMERGENCY PROTOCOLS',
    position: 'SHIP POSITION',
    velocity: 'SHIP VELOCITY',
    heading: 'SHIP HEADING',
    speed: 'SHIP SPEED',
    fuelLevel: 'FUEL LEVEL',
    reactorTemperature: 'REACTOR TEMPERATURE',
    shieldStrength: 'SHIELD STRENGTH',
    weaponCharge: 'WEAPON CHARGE',
    lastDamage: 'DAMAGE STATUS',
    missionTime: 'MISSION TIME',
    alertStatus: 'ALERT STATUS'
  };

  const label = systemLabels[system] || system.toString().toUpperCase();

  // Handle boolean status changes
  if (typeof newStatus === 'boolean') {
    const oldBool = oldStatus as boolean;
    if (newStatus === oldBool) return null as any; // No change, no log

    const level: LogEntry['level'] = newStatus ? 'system' : 'warning';
    const statusText = newStatus ? 'ENGAGED' : 'OFFLINE';
    const message = `${label} ${statusText} - ${newStatus ? 'System activated and operational' : 'System deactivated or failed'}`;

    return createLog(level, message, 'Ship Systems');
  }

  // Handle numeric status changes
  const oldNum = oldStatus as number;
  const newNum = newStatus as number;
  if (Math.abs(newNum - oldNum) < 0.01) return null as any; // No significant change

  let level: LogEntry['level'] = 'info';
  let message = '';

  // Special handling for different numeric systems
  switch (system) {
    case 'hullIntegrity':
      level = newNum < 20 ? 'critical' : newNum < 50 ? 'error' : newNum < 80 ? 'warning' : 'info';
      message = `${label} at ${newNum.toFixed(1)}% - ${newNum < 50 ? 'Critical structural damage' : newNum < 80 ? 'Hull integrity compromised' : 'Structural integrity nominal'}`;
      break;
    case 'batteryPower':
      level = newNum < 20 ? 'warning' : 'info';
      message = `${label} at ${newNum.toFixed(1)}% - ${newNum < 20 ? 'Low power reserves' : 'Power reserves adequate'}`;
      break;
    case 'fuelLevel':
      level = newNum < 10 ? 'critical' : newNum < 25 ? 'warning' : 'info';
      message = `${label} at ${newNum.toFixed(1)}% - ${newNum < 10 ? 'Critical fuel reserves' : newNum < 25 ? 'Low fuel warning' : 'Fuel reserves adequate'}`;
      break;
    case 'reactorTemperature':
      level = newNum > 800 ? 'critical' : newNum > 600 ? 'error' : newNum > 400 ? 'warning' : 'info';
      message = `${label} at ${newNum}°C - ${newNum > 800 ? 'Critical overheating' : newNum > 600 ? 'Temperature critical' : newNum > 400 ? 'Temperature elevated' : 'Temperature nominal'}`;
      break;
    case 'shieldStrength':
      level = newNum < 20 ? 'critical' : newNum < 50 ? 'warning' : 'info';
      message = `${label} at ${newNum.toFixed(1)}% - ${newNum < 20 ? 'Shield failure imminent' : newNum < 50 ? 'Shield weakening' : 'Shield integrity maintained'}`;
      break;
    case 'weaponCharge':
      level = newNum > 90 ? 'warning' : 'info';
      message = `${label} at ${newNum.toFixed(1)}% - ${newNum > 90 ? 'Weapons charged and ready' : 'Weapons charging'}`;
      break;
    case 'speed':
      message = `${label} ${newNum.toFixed(2)} LY/h - Current velocity`;
      break;
    case 'missionTime':
      message = `${label} ${Math.floor(newNum / 3600)}h ${Math.floor((newNum % 3600) / 60)}m elapsed`;
      break;
    case 'heading':
      message = `${label} ${newNum.toFixed(1)}° - Course updated`;
      break;
    default:
      message = `${label} changed to ${typeof newNum === 'number' && newNum % 1 !== 0 ? newNum.toFixed(1) : newNum}`;
  }

  return createLog(level, message, 'Ship Systems');
}

function checkCriticalControls(state: GameState): GameState {
  const criticalControlsMet = CRITICAL_CONTROLS.every(controlId =>
    state.controls[controlId] === true
  );

  return { ...state, criticalControlsMet };
}

function checkStartupSequence(state: GameState): GameState {
  // Power & Gain panel complete (all power buttons and master toggle)
  const powerGainControls: ControlId[] = [
    'pwr-1', 'pwr-2', 'pwr-5', 'pwr-6', 'pwr-7', 'pwr-8', 'pwr-9', 'pwr-10', 'master-toggle'
  ];
  const powerGainPanelComplete = powerGainControls.every(controlId =>
    state.controls[controlId] === true
  );

  // Footer critical complete (first 4 toggles: SAFE, ARM, LOCK, KEY)
  const footerCriticalControls: ControlId[] = ['f0', 'f1', 'f2', 'f3'];
  const footerCriticalComplete = footerCriticalControls.every(controlId =>
    state.controls[controlId] === true
  );

  // Determine spaceship status
  // Online = power on AND all subcritical controls (f0-f3) on
  const spaceshipOnline = powerGainPanelComplete && footerCriticalComplete;
  // Standby = power on but subcritical controls not all on
  const spaceshipStandby = powerGainPanelComplete && !footerCriticalComplete;

  // Add comprehensive logging for power status changes
  let logsToAdd: LogEntry[] = [];

  if (spaceshipOnline && !state.spaceshipOnline) {
    logsToAdd.push(createLog(
      'system',
      'SPACESHIP STATUS: FULLY ONLINE - All power systems engaged, core initialization complete, ship ready for operation',
      'Ship Power Core'
    ));
  } else if (spaceshipStandby && !state.spaceshipStandby) {
    logsToAdd.push(createLog(
      'warning',
      'SPACESHIP STATUS: STANDBY MODE - Power systems active but safety protocols not fully engaged',
      'Ship Power Core'
    ));
  } else if (!spaceshipOnline && !spaceshipStandby && (state.spaceshipOnline || state.spaceshipStandby)) {
    logsToAdd.push(createLog(
      'critical',
      'SPACESHIP STATUS: COMPLETE POWER FAILURE - All systems offline, emergency protocols recommended',
      'Ship Power Core'
    ));
  }

  // Log power gain panel status changes
  if (powerGainPanelComplete !== state.startupSequence.powerGainPanelComplete) {
    logsToAdd.push(createLog(
      powerGainPanelComplete ? 'system' : 'critical',
      `POWER GAIN PANEL: ${powerGainPanelComplete ? 'COMPLETE' : 'INCOMPLETE'} - ${powerGainPanelComplete ? 'All power controls engaged' : 'Power distribution compromised'}`,
      'Power Gain Systems'
    ));
  }

  // Log footer critical controls status changes
  if (footerCriticalComplete !== state.startupSequence.footerCriticalComplete) {
    logsToAdd.push(createLog(
      footerCriticalComplete ? 'system' : 'warning',
      `SAFETY PROTOCOLS: ${footerCriticalComplete ? 'ENGAGED' : 'STANDBY'} - ${footerCriticalComplete ? 'SAFE/ARM/LOCK/KEY sequence complete' : 'Safety systems not fully initialized'}`,
      'Safety Systems'
    ));
  }

  return {
    ...state,
    startupSequence: {
      powerGainPanelComplete,
      footerCriticalComplete
    },
    spaceshipOnline,
    spaceshipStandby,
    logs: [...state.logs, ...logsToAdd].slice(-100)
  };
}

// Context
const GameStateContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

// Load state from localStorage
function loadStateFromStorage(): GameState {
  try {
    const savedState = localStorage.getItem('spaceship-state');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      // Merge with current initial state to handle any new properties
      return {
        ...initialState,
        ...parsedState,
        systems: { ...initialState.systems, ...parsedState.systems }
      };
    }
  } catch (error) {
    console.error('Failed to load spaceship state:', error);
  }
  return initialState;
}

// Provider component
export function GameStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, loadStateFromStorage());

  // Custom dispatch that can trigger sound effects
  const enhancedDispatch = (action: GameAction) => {
    // Play sound effects based on actions
    if (action.type === 'TOGGLE_CONTROL' && (
      action.controlId === 'master-toggle' ||
      action.controlId === 'engine-master' ||
      action.controlId === 'comms-master'
    )) {
      soundEffects.playMasterPowerSound();
    } else if (action.type === 'TOGGLE_CONTROL' && (
      // Main power buttons (primary/secondary reactors)
      action.controlId === 'pwr-1' ||
      action.controlId === 'pwr-2'
    )) {
      soundEffects.playMainPowerSound();
    } else if (action.type === 'TOGGLE_CONTROL' && (
      // Backup/auxiliary power buttons
      action.controlId === 'pwr-5' ||
      action.controlId === 'pwr-6' ||
      action.controlId === 'pwr-7' ||
      action.controlId === 'pwr-8' ||
      action.controlId === 'pwr-9' ||
      action.controlId === 'pwr-10'
    )) {
      soundEffects.playBackupPowerSound();
    } else if (action.type === 'TOGGLE_CONTROL' && (
      action.controlId === 'engine-pwr-1' ||
      action.controlId === 'engine-pwr-2' ||
      action.controlId === 'engine-ready-1' ||
      action.controlId === 'engine-ready-2' ||
      action.controlId === 'comms-pwr-1' ||
      action.controlId === 'comms-pwr-2' ||
      // Battery control toggles
      action.controlId === 'config-1' ||
      action.controlId === 'config-2' ||
      action.controlId === 'config-3' ||
      action.controlId === 'config-4' ||
      action.controlId === 'charge-mode' ||
      // Footer toggles (f0-f13)
      action.controlId.startsWith('f') && parseInt(action.controlId.slice(1)) >= 0 && parseInt(action.controlId.slice(1)) <= 13
    )) {
      soundEffects.playConsolePowerSound();
    }

    // Dispatch the action
    dispatch(action);
  };

  // Auto-save state periodically and on changes
  React.useEffect(() => {
    const saveInterval = setInterval(() => {
      dispatch({ type: 'SAVE_STATE' });
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, []);

  // Save on window unload
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      dispatch({ type: 'SAVE_STATE' });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <GameStateContext.Provider value={{ state, dispatch: enhancedDispatch }}>
      {children}
    </GameStateContext.Provider>
  );
}

// Hook to use game state
export function useGameState() {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
}