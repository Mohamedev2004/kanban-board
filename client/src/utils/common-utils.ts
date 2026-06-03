/**
 * Common pure utility functions.
 * 
 * Responsibility: Provide generic helper functions without side effects.
 * Layer: Utils
 */

/**
 * Replaces {key} placeholders in a template string with values from payload.
 * e.g. interpolate("Hello {username}!", { username: "Sara" }) → "Hello Sara!"
 */
export function interpolate(
  template: string,
  payload?: Record<string, unknown>
): string {
  if (!payload) return template
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in payload ? String(payload[key]) : `{${key}}`
  )
}

