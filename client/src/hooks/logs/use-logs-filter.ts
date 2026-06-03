import { useState, useCallback } from "react"
import type { Filters } from "@/types/logs"

export function useLogsFilter() {
  const [searchQuery, setSearchQueryRaw] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    level: [],
    status: [],
    status_code: [],
    duration: [],
  })
  const [page, setPage] = useState(1)
  const [perPage, setPerPageRaw] = useState(10)

  const setSearchQuery = useCallback((value: string) => {
    setSearchQueryRaw(value)
    setPage(1)
  }, [])

  const setPerPage = useCallback((value: number) => {
    setPerPageRaw(value)
    setPage(1)
  }, [])

  const activeFilters =
    filters.level.length +
    filters.status.length +
    filters.status_code.length +
    filters.duration.length

  const applyFilters = (next: Filters) => {
    setPage(1)
    setFilters({
      ...next,
      level: next.level.map((l) => l.toLowerCase()),
    })
  }

  const handleReset = () => {
    applyFilters({ level: [], status: [], status_code: [], duration: [] })
    setSearchQueryRaw("")
    setPage(1)
  }

  return {
    searchQuery,
    setSearchQuery,
    showFilters,
    setShowFilters,
    filters,
    setFilters,
    page,
    setPage,
    perPage,
    setPerPage,
    activeFilters,
    applyFilters,
    handleReset,
  }
}
