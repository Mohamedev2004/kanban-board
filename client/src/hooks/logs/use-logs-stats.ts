import { useState, useCallback } from "react"
import type { LogCounts } from "@/api/types/logs.types"
import type { Filters } from "@/types/logs"

export function useLogsStats(
  isFetching: boolean,
  filteredTotal: number,
  counts: LogCounts,
  filters: Filters,
  searchQuery: string
) {
  const [globalTotal, setGlobalTotal] = useState<number | null>(null)
  const [globalCounts, setGlobalCounts] = useState<LogCounts | null>(null)

  const isUnfiltered =
    !isFetching &&
    filters.level.length === 0 &&
    filters.status.length === 0 &&
    filters.status_code.length === 0 &&
    filters.duration.length === 0 &&
    !searchQuery

  const captureBaseline = useCallback(
    (total: number, logCounts: LogCounts) => {
      setGlobalTotal(total)
      setGlobalCounts(logCounts)
    },
    []
  )

  if (isUnfiltered && globalTotal === null && filteredTotal > 0) {
    captureBaseline(filteredTotal, counts)
  }

  return {
    globalTotal,
    globalCounts,
  }
}
