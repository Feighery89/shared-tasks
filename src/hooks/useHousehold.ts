import { useState, useCallback } from 'react'
import { api } from '../lib/api'
import type { Household, UserBrief } from '../lib/api'

export function useHousehold() {
  const [household, setHousehold] = useState<Household | null>(null)
  const [members, setMembers] = useState<UserBrief[]>([])
  const [loading, setLoading] = useState(false)

  const fetchHousehold = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getCurrentHousehold()
      setHousehold(data)
      setMembers(data.members)
    } catch {
      setHousehold(null)
      setMembers([])
    } finally {
      setLoading(false)
    }
  }, [])

  const createHousehold = async (name: string) => {
    try {
      const data = await api.createHousehold(name)
      setHousehold(data)
      setMembers(data.members)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  const joinHousehold = async (inviteCode: string) => {
    try {
      const data = await api.joinHousehold(inviteCode)
      setHousehold(data)
      setMembers(data.members)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  const leaveHousehold = async () => {
    try {
      await api.leaveHousehold()
      setHousehold(null)
      setMembers([])
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  return {
    household,
    members,
    loading,
    fetchHousehold,
    createHousehold,
    joinHousehold,
    leaveHousehold,
  }
}
