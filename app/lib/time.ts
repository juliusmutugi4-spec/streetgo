/**
 * Converts a date string into a localized relative time string.
 */
export function formatRelativeTime(
  dateString: string,
  locale: string = typeof navigator !== "undefined"
    ? navigator.language
    : "en"
) {
  const targetDate = new Date(dateString)

  if (isNaN(targetDate.getTime())) {
    return ""
  }

  const elapsedSeconds = Math.floor(
    (Date.now() - targetDate.getTime()) / 1000
  )

  if (elapsedSeconds < 10) {
    return "Just now"
  }

  const units = [
    { unit: "year", amount: 31536000 },
    { unit: "month", amount: 2625600 },
    { unit: "week", amount: 604800 },
    { unit: "day", amount: 86400 },
    { unit: "hour", amount: 3600 },
    { unit: "minute", amount: 60 },
    { unit: "second", amount: 1 },
  ] as const

  const rtf = new Intl.RelativeTimeFormat(locale, {
    numeric: "auto",
    style: "long",
  })

  for (const { unit, amount } of units) {
    if (elapsedSeconds >= amount || unit === "second") {
      const value = Math.floor(elapsedSeconds / amount)
      return rtf.format(-value, unit)
    }
  }

  return "Just now"
}