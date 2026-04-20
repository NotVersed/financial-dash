"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AddNoteForm({ clientId }: { clientId: number }) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    if (!note.trim()) return

    setLoading(true)

    try {
      await fetch(`/api/clients/${clientId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: note }),
      })

      setNote("")
      setOpen(false)

      // refresh page data
      //window.location.reload()
      router.refresh()
    } catch (err) {
      console.error("Failed to add note", err)
    } finally {
      setLoading(false)
    }
  }

  return (
  <div className="min-w-[250px]">
    {!open ? (
      <button
        onClick={() => setOpen(true)}
        className="w-full h-full rounded-lg border border-dashed border-slate-300 p-4 flex items-center justify-center text-slate-900 hover:bg-slate-50 transition"
      >
        + Add Note
      </button>
    ) : (
      <div className="rounded-lg border border-slate-200 p-4 bg-white shadow-sm flex flex-col gap-2">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write a note..."
          className="border rounded-md px-2 py-1 text-sm text-slate-600"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-500"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    )}
  </div>
)
}