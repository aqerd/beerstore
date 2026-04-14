import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'

export function useManagementReport(params: { storeId?: string; startDate?: string; endDate?: string }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchReport = async () => {
    try {
      setLoading(true)
      setError(null)
      const report = await api.reports.getManagement(params)
      setData(report)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [params.storeId, params.startDate, params.endDate])

  return { data, loading, error, refresh: fetchReport }
}
