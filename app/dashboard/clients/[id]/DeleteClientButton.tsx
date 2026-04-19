'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type DeleteClientButtonProps = {
  clientId: number
  clientName: string
}

export default function DeleteClientButton({ clientId, clientName }: DeleteClientButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${clientName}? This action cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to delete client')
      }

      router.push('/dashboard/clients')
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete client'
      window.alert(message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-block rounded-md border border-red-200 bg-red-50 px-4 py-2 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isDeleting ? 'Deleting...' : 'Delete Client'}
    </button>
  )
}
