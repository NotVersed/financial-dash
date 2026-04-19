"use client"

import { useState } from "react"
import AddNoteForm from "./AddNoteForm"

type Note = {
  note_id: number
  note: string
  created_at: string
}

export default function NotesSection({
  notes,
  clientId,
}: {
  notes: Note[]
  clientId: number
}) {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  return (
    <>
      {/* Scroll container */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        <AddNoteForm clientId={clientId} />

        {notes.map((note) => (
          <div
            key={note.note_id}
            onClick={() => setSelectedNote(note)}
            className="min-w-[250px] cursor-pointer rounded-lg border border-slate-200 p-4 bg-white shadow-sm hover:shadow-md transition"
          >
            <p className="text-xs text-slate-400">
              {new Date(note.created_at).toLocaleDateString()}
            </p>

            {/* Truncated preview */}
            <p className="text-sm text-slate-700 mt-2 line-clamp-3">
              {note.note}
            </p>
          </div>
        ))}
      </div>

      {/* Popup Modal */}
      {selectedNote && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setSelectedNote(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs text-slate-400 mb-2">
              {new Date(selectedNote.created_at).toLocaleString()}
            </p>

            <p className="text-sm text-slate-800 whitespace-pre-wrap">
              {selectedNote.note}
            </p>

            <button
              onClick={() => setSelectedNote(null)}
              className="mt-4 text-sm text-blue-600 hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}