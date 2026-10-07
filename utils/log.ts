export type LogLevel = 'info' | 'warn' | 'error'

export type LogFields = Record<string, unknown>

/**
 * Emit one log entry. Every server log goes through here so that each entry
 * has the same shape: timestamp, padded level, event name, then `key=value`
 * fields.
 *
 *   2026-10-07T12:00:00.000Z INFO  request method=GET path=/ status=200
 *
 * `event` is a short, stable, dot-separated name (e.g. `server.listening`,
 * `hn_comments.refresh_failed`) suitable for grepping. Values containing
 * spaces or quotes are quoted, and undefined fields are omitted. `Error`
 * values are summarized inline, with their stack traces (and those of any
 * causes) indented on the lines that follow.
 */
export const logEvent = (
  level: LogLevel,
  event: string,
  fields: LogFields = {},
) => {
  const entries = Object.entries(fields).filter(([, value]) =>
    value !== undefined
  )

  const line = [
    new Date().toISOString(),
    level.toUpperCase().padEnd(5),
    event,
    ...entries.map(([key, value]) => `${key}=${formatValue(value)}`),
  ].join(' ')

  const stacks = entries
    .filter(([, value]) => value instanceof Error)
    .map(([, error]) => formatStack(error as Error))

  const output = [line, ...stacks].join('\n')

  if (level === 'error') {
    console.error(output)
  } else if (level === 'warn') {
    console.warn(output)
  } else {
    console.log(output)
  }
}

const formatValue = (value: unknown): string =>
  value instanceof Error
    ? quoteIfNeeded(`${value.name}: ${value.message}`)
    : typeof value === 'string'
    ? quoteIfNeeded(value)
    : typeof value === 'object' && value !== null
    ? JSON.stringify(value)
    : String(value)

const quoteIfNeeded = (str: string) =>
  str === '' || /[\s"=]/.test(str) ? JSON.stringify(str) : str

const formatStack = (error: Error): string =>
  stackWithCauses(error)
    .split('\n')
    .map((l) => '    ' + l)
    .join('\n')

const stackWithCauses = (error: Error): string =>
  [
    error.stack ?? `${error.name}: ${error.message}`,
    ...(error.cause instanceof Error
      ? [`Caused by: ${stackWithCauses(error.cause)}`]
      : error.cause === undefined
      ? []
      : [`Caused by: ${formatValue(error.cause)}`]),
  ].join('\n')
