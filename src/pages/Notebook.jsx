import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import { Card, PageHeader, EmptyState, ConfirmButton } from '../components/ui'
import { BookIcon, PlusIcon, TrashIcon } from '../components/Icons'

const DEFAULT_FOLDERS = ['General', 'Lessons', 'Setups', 'Mistakes', 'Ideas']

export default function Notebook() {
  const { notes, addNote, updateNote, deleteNote } = useData()
  const [activeId, setActiveId] = useState(null)
  const [folderFilter, setFolderFilter] = useState('')
  const [query, setQuery] = useState('')

  const folders = useMemo(() => {
    const set = new Set(DEFAULT_FOLDERS)
    notes.forEach((n) => n.folder && set.add(n.folder))
    return [...set]
  }, [notes])

  const filtered = useMemo(() => {
    return notes
      .filter((n) => (folderFilter ? n.folder === folderFilter : true))
      .filter((n) =>
        query ? (n.title + ' ' + n.body).toLowerCase().includes(query.toLowerCase()) : true
      )
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  }, [notes, folderFilter, query])

  const active = notes.find((n) => n.id === activeId) || null

  function newNote() {
    const n = addNote({ folder: folderFilter || 'General' })
    setActiveId(n.id)
  }

  return (
    <div>
      <PageHeader
        title="Notebook"
        subtitle="Lessons, setups, mistakes, ideas — everything that doesn't fit a single day."
        actions={
          <button className="btn-primary" onClick={newNote}>
            <PlusIcon className="h-4 w-4" /> New note
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Note list */}
        <div>
          <div className="mb-3 space-y-2">
            <input className="input" placeholder="Search notes…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <select className="input" value={folderFilter} onChange={(e) => setFolderFilter(e.target.value)}>
              <option value="">All folders</option>
              {folders.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          {filtered.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-400 dark:border-neutral-700">
              {notes.length ? 'No notes match.' : 'No notes yet — hit “New note”.'}
            </p>
          ) : (
            <div className="max-h-[65vh] space-y-2 overflow-y-auto pr-1">
              {filtered.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-1 rounded-xl border p-3 transition ${
                    n.id === activeId
                      ? 'border-brand-400 bg-brand-50 dark:border-brand-600 dark:bg-brand-900/20'
                      : 'border-slate-200 bg-white hover:border-brand-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-brand-700'
                  }`}
                >
                  <button onClick={() => setActiveId(n.id)} className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{n.title || 'Untitled note'}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{n.body || '—'}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
                      {n.folder} · {new Date(n.updatedAt).toLocaleDateString()}
                    </p>
                  </button>
                  <ConfirmButton
                    className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/20"
                    confirmLabel={<span className="text-[11px] font-semibold text-rose-500">Sure?</span>}
                    onConfirm={() => {
                      deleteNote(n.id)
                      if (activeId === n.id) setActiveId(null)
                    }}
                    title="Delete note"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </ConfirmButton>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Editor */}
        <div>
          {active ? (
            <Card className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  className="input flex-1 text-lg font-semibold"
                  value={active.title}
                  onChange={(e) => updateNote(active.id, { title: e.target.value })}
                  placeholder="Note title"
                />
                <input
                  className="input w-40"
                  list="folder-list"
                  value={active.folder}
                  onChange={(e) => updateNote(active.id, { folder: e.target.value })}
                  placeholder="Folder"
                />
                <datalist id="folder-list">
                  {folders.map((f) => (
                    <option key={f} value={f} />
                  ))}
                </datalist>
              </div>
              <textarea
                className="input min-h-[50vh] resize-y leading-relaxed"
                value={active.body}
                onChange={(e) => updateNote(active.id, { body: e.target.value })}
                placeholder="Write freely — saved automatically as you type."
              />
              <p className="text-right text-xs text-slate-400">
                Saved · {new Date(active.updatedAt).toLocaleString()}
              </p>
            </Card>
          ) : (
            <EmptyState
              icon={BookIcon}
              title="Select a note"
              message="Pick a note on the left, or create a new one."
              action={
                <button className="btn-primary" onClick={newNote}>
                  <PlusIcon className="h-4 w-4" /> New note
                </button>
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}
