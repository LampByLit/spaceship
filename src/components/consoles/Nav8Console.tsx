import { useGameState } from '../../contexts/GameStateContext'
import { LogEntry } from '../../contexts/GameStateContext'

export function Nav8Console() {
  const { state, dispatch } = useGameState()

  // Filter logs based on emergency toggle state
  const filteredLogs = state.controls.emergency as boolean
    ? state.logs // Show all logs when emergency is active
    : state.logs.filter(log => log.level === 'critical' || log.level === 'error' || log.level === 'system') // Show critical, error, and system logs otherwise

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  const getLogLevelClass = (level: LogEntry['level']) => {
    switch (level) {
      case 'critical': return 'log-critical'
      case 'error': return 'log-error'
      case 'warning': return 'log-warning'
      case 'info': return 'log-info'
      case 'system': return 'log-system'
      default: return 'log-default'
    }
  }

  const clearLogs = () => {
    // For now, we'll just add a log about clearing (in a real system we'd clear the logs)
    dispatch({
      type: 'ADD_LOG',
      log: {
        timestamp: Date.now(),
        level: 'system',
        message: 'Log buffer cleared by operator',
        source: 'Navigation Console'
      }
    })
  }

  return (
    <main className="control-interface">
      {/* Main log display */}
      <section className="control-cluster cluster-main">
        <div className="log-console">
          <div className="log-header">
            <span>SYSTEM LOG READOUT</span>
            <button onClick={clearLogs} className="clear-logs-btn">
              CLEAR LOGS
            </button>
          </div>
          <div className="log-entries">
            {filteredLogs.length === 0 ? (
              <div className="log-entry log-system">
                [SYSTEM] No critical events logged. Emergency protocols inactive.
              </div>
            ) : (
              filteredLogs.slice(-50).reverse().map((log, index) => (
                <div key={index} className={`log-entry ${getLogLevelClass(log.level)}`}>
                  <span className="log-timestamp">[{formatTimestamp(log.timestamp)}]</span>
                  <span className="log-level">[{log.level.toUpperCase()}]</span>
                  <span className="log-source">[{log.source}]</span>
                  <span className="log-message">{log.message}</span>
                  {log.data && (
                    <span className="log-data">{JSON.stringify(log.data)}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

    </main>
  )
}