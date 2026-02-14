import { useGameState } from '../../contexts/GameStateContext'
import { useState, useEffect } from 'react'
import { CircularSlider } from '../CircularSlider'
import { PowerButton } from '../PowerButton'
import { JellyfishToggle } from '../JellyfishToggle'

export function Nav3Console() {
  const { state, dispatch } = useGameState()

  // Engine performance states
  const [thrustLevel, setThrustLevel] = useState(0)
  const [engineTemp, setEngineTemp] = useState(0)
  const [fuelEfficiency, setFuelEfficiency] = useState(0)
  const [powerOutput, setPowerOutput] = useState(0)

  // Update circular progress indicators
  useEffect(() => {
    const updateCircularProgress = (sliderId: string, value: number, min: number, max: number) => {
      const progressCircle = document.getElementById(`${sliderId}-progress`) as SVGCircleElement;
      if (progressCircle) {
        const normalizedValue = (value - min) / (max - min);
        const circumference = 2 * Math.PI * 40;
        const dashOffset = (1 - normalizedValue) * circumference;
        progressCircle.style.strokeDashoffset = dashOffset.toString();
      }
    };

    updateCircularProgress('engine-thrust', thrustLevel, 0, 100);
    updateCircularProgress('engine-temp', engineTemp, 0, 1000);
    updateCircularProgress('fuel-eff', fuelEfficiency, 0, 100);
    updateCircularProgress('power-out', powerOutput, 0, 100);
  }, [thrustLevel, engineTemp, fuelEfficiency, powerOutput]);

  // Add JS class to body for styled range inputs
  useEffect(() => {
    document.documentElement.classList.add('js');
    return () => {
      document.documentElement.classList.remove('js');
    };
  }, []);

  const isEnginesOnline = state.systems.engines
  const isPropulsionOnline = state.systems.propulsion

  // Power Supply Panel Logic
  const isEngineMasterOn = state.controls['engine-master']
  const isEngineReady = state.systems.engineReady

  // Engine indicator logic
  const getEngineIndicatorState = () => {
    if (isEnginesOnline) return 'green' // Engine is online
    if (isEngineReady) return 'amber' // Engine primed/ready
    return 'red' // Engine off
  }

  const engineIndicatorState = getEngineIndicatorState()

  return (
    <>
      {/* Panel 1: Power Supply */}
      <section className="control-cluster cluster-left">
        <div className="cluster-title">POWER SUPPLY</div>
        <div className="power-supply-panel">
          {/* Master Switch */}
          <div className="master-switch-section">
            <div className="switch">
              <input
                type="checkbox"
                id="engine-master"
                checked={isEngineMasterOn}
                onChange={() => dispatch({ type: 'TOGGLE_CONTROL', controlId: 'engine-master' })}
              />
              <label htmlFor="engine-master">
                <i></i>
              </label>
            </div>
            <div className="switch-label">ENGINE MASTER</div>
          </div>

          {/* Support Power Buttons */}
          <div className="support-power-section">
            <div className="power-buttons-row">
              <PowerButton id="engine-pwr-1" label="PWR.A" dark size={0.9} />
              <PowerButton id="engine-pwr-2" label="PWR.B" dark size={0.9} />
            </div>
          </div>

          {/* Engine Ready Toggles */}
          <div className="engine-ready-section">
            <div className="ready-toggles">
              <JellyfishToggle key="engine-ready-1" id="engine-ready-1" label="READY.1" />
              <JellyfishToggle key="engine-ready-2" id="engine-ready-2" label="READY.2" />
              <JellyfishToggle key="engine-ready-3" id="engine-ready-3" label="READY.3" />
              <JellyfishToggle key="engine-ready-4" id="engine-ready-4" label="READY.4" />
              <JellyfishToggle key="engine-ready-5" id="engine-ready-5" label="READY.5" />
              <JellyfishToggle key="engine-ready-6" id="engine-ready-6" label="READY.6" />
            </div>
          </div>

          {/* Engine Status Indicator */}
          <div className="engine-indicator-section">
            <div className="engine-indicator">
              <div className="indicator-light-large">
                <div className={`light red ${!isEngineReady && !isEnginesOnline ? 'active' : ''}`}></div>
                <div className={`light amber ${isEngineReady && !isEnginesOnline ? 'active' : ''}`}></div>
                <div className={`light green ${isEnginesOnline ? 'active' : ''}`}></div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Panel 2: Fuel Systems */}
      <section className="control-cluster cluster-center-left">
        <div className="cluster-title">FUEL SYSTEMS</div>
        <div className="fuel-systems-panel">
          <div className="fuel-metrics">
            <div className="fuel-gauge">
              <div className="gauge-label">MAIN FUEL</div>
              <div className="gauge-bar">
                <div
                  className="gauge-fill"
                  style={{ width: `${state.systems.fuelLevel}%` }}
                ></div>
              </div>
              <div className="gauge-value">{state.systems.fuelLevel.toFixed(1)}%</div>
            </div>

            <div className="fuel-gauge">
              <div className="gauge-label">RESERVE FUEL</div>
              <div className="gauge-bar">
                <div
                  className="gauge-fill reserve"
                  style={{ width: `${Math.max(0, state.systems.fuelLevel - 20)}%` }}
                ></div>
              </div>
              <div className="gauge-value">{Math.max(0, state.systems.fuelLevel - 20).toFixed(1)}%</div>
            </div>
          </div>

          <div className="fuel-efficiency">
            <CircularSlider
              id="fuel-eff"
              label="EFFICIENCY"
              value={fuelEfficiency}
              min={0}
              max={100}
              onChange={setFuelEfficiency}
              size={100}
            />
          </div>
        </div>
      </section>

      {/* Panel 3: Temperature & Cooling */}
      <section className="control-cluster cluster-center-right">
        <div className="cluster-title">TEMPERATURE & COOLING</div>
        <div className="temperature-panel">
          <div className="temp-readings">
            <div className="temp-row">
              <span className="temp-label">REACTOR CORE:</span>
              <span className={`temp-value ${state.systems.reactorTemperature > 800 ? 'temp-critical' :
                state.systems.reactorTemperature > 600 ? 'temp-warning' : 'temp-normal'}`}>
                {state.systems.reactorTemperature}°C
              </span>
            </div>
            <div className="temp-row">
              <span className="temp-label">ENGINE TEMP:</span>
              <span className={`temp-value ${engineTemp > 800 ? 'temp-critical' :
                engineTemp > 600 ? 'temp-warning' : 'temp-normal'}`}>
                {engineTemp}°C
              </span>
            </div>
            <div className="temp-row">
              <span className="temp-label">COOLING STATUS:</span>
              <span className={state.controls['pwr-10'] ? "status-good" : "status-caution"}>
                {state.controls['pwr-10'] ? "ACTIVE" : "OFFLINE"}
              </span>
            </div>
          </div>

          <div className="temp-control">
            <CircularSlider
              id="engine-temp"
              label="TARGET TEMP"
              value={engineTemp}
              min={0}
              max={1000}
              onChange={setEngineTemp}
              size={120}
            />
          </div>
        </div>
      </section>

      {/* Panel 4: Propulsion Controls */}
      <section className="control-cluster cluster-right">
        <div className="cluster-title">PROPULSION CONTROLS</div>
        <div className="propulsion-panel">
          <div className="propulsion-status">
            <div className="control-row">
              <span className="control-label">THRUST DIRECTION:</span>
              <div className="direction-controls">
                <button
                  className={`direction-btn ${state.controls['forward'] ? 'active' : ''}`}
                  onClick={() => {
                    dispatch({ type: 'TOGGLE_CONTROL', controlId: 'forward' })
                    dispatch({ type: 'TOGGLE_CONTROL', controlId: 'reverse' }) // Turn off reverse if forward is on
                  }}
                >
                  FORWARD
                </button>
                <button
                  className={`direction-btn ${state.controls['reverse'] ? 'active' : ''}`}
                  onClick={() => {
                    dispatch({ type: 'TOGGLE_CONTROL', controlId: 'reverse' })
                    dispatch({ type: 'TOGGLE_CONTROL', controlId: 'forward' }) // Turn off forward if reverse is on
                  }}
                >
                  REVERSE
                </button>
              </div>
            </div>

            <div className="control-row">
              <span className="control-label">POWER OUTPUT:</span>
              <CircularSlider
                id="power-out"
                label="POWER %"
                value={powerOutput}
                min={0}
                max={100}
                onChange={setPowerOutput}
                size={100}
              />
            </div>
          </div>

          <div className="propulsion-metrics">
            <div className="metric-row">
              <span className="metric-label">CURRENT SPEED:</span>
              <span className="metric-value">{state.systems.speed.toFixed(2)} LY/h</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">MISSION TIME:</span>
              <span className="metric-value">{Math.floor(state.systems.missionTime / 3600)}h {Math.floor((state.systems.missionTime % 3600) / 60)}m</span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}