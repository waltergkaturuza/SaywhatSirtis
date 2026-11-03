"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"

type ThreadMessage = {
  id: string
  body: string
  senderId: string | null
  senderName: string
  mine: boolean
  createdAt: string
}

type Thread = {
  threadId: string
  title: string
  employeeName: string
  department: string
  updatedAt: string
  unread: number
  messages: ThreadMessage[]
}

type Person = { id: string; name: string; department: string }

export function PerformanceMessages({
  topic,
  summary
}: {
  topic: "plan" | "appraisal"
  summary?: { label: string; action: string; onAction: () => void }
}) {
  const { data: session } = useSession()
  const [threads, setThreads] = useState<Thread[]>([])
  const [canSend, setCanSend] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [reply, setReply] = useState("")
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [draft, setDraft] = useState("")
  const [audience, setAudience] = useState<"all" | "department" | "selected">("all")
  const [department, setDepartment] = useState("")
  const [departments, setDepartments] = useState<string[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [picked, setPicked] = useState<string[]>([])
  const [personQuery, setPersonQuery] = useState("")

  const load = async () => {
    const response = await fetch(`/api/hr/performance/messages?topic=${topic}`)
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || "Failed to load messages")
    setThreads(Array.isArray(data.threads) ? data.threads : [])
    setCanSend(Boolean(data.canSend))
    return Boolean(data.canSend)
  }

  useEffect(() => {
    if (!session?.user) return
    let cancelled = false
    setLoading(true)
    load()
      .then(async (allowed) => {
        if (cancelled || !allowed) return
        const response = await fetch(`/api/hr/performance/messages?topic=${topic}&lookups=1`)
        const data = await response.json().catch(() => ({}))
        if (!response.ok || cancelled) return
        setDepartments(data.directory?.departments || [])
        setPeople(data.directory?.employees || [])
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load messages")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [session?.user?.id, topic])

  const openThread = async (thread: Thread) => {
    setOpenId(thread.threadId)
    setReply("")
    if (thread.unread > 0) {
      await fetch("/api/hr/performance/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read", topic, threadId: thread.threadId })
      }).catch(() => null)
      setThreads((current) => current.map((item) => item.threadId === thread.threadId ? { ...item, unread: 0 } : item))
    }
  }

  const sendNew = async () => {
    setSending(true)
    setError(null)
    setNotice(null)
    try {
      const response = await fetch("/api/hr/performance/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          title,
          message: draft,
          audience,
          department,
          employeeIds: picked
        })
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Failed to send message")
      setDraft("")
      setTitle("")
      setPicked([])
      setNotice(`Sent to ${data.sent} ${data.sent === 1 ? "person" : "people"}.`)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const sendReply = async (threadId: string) => {
    setSending(true)
    setError(null)
    try {
      const response = await fetch("/api/hr/performance/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, threadId, message: reply })
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Failed to send reply")
      setReply("")
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reply")
    } finally {
      setSending(false)
    }
  }

  const visiblePeople = useMemo(() => {
    const query = personQuery.trim().toLowerCase()
    if (!query) return people.slice(0, 40)
    return people.filter((person) => `${person.name} ${person.department}`.toLowerCase().includes(query)).slice(0, 40)
  }, [people, personQuery])

  const open = threads.find((thread) => thread.threadId === openId) || null
  const subject = topic === "appraisal" ? "appraisals" : "plans"

  return (
    <div className="space-y-3">
      {summary && (
        <div className="flex items-center justify-between gap-3 bg-white border rounded-md px-3 py-2">
          <p className="text-sm text-gray-700">{summary.label}</p>
          <button type="button" onClick={summary.onAction} className="text-sm text-orange-600 hover:text-orange-700 whitespace-nowrap">
            {summary.action}
          </button>
        </div>
      )}

      {canSend && (
        <div className="bg-white border rounded-md p-3 space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Message employees</h3>
          <p className="text-xs text-gray-500">Remind people about their {subject}, or ask for a correction. It shows in their notification area, and they can reply here.</p>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={topic === "appraisal" ? "Appraisal reminder" : "Performance plan reminder"}
            className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
          />
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={3}
            placeholder="Write the reminder or correction..."
            className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
          />
          <div className="flex flex-wrap gap-2">
            {(["all", "department", "selected"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setAudience(option)}
                className={`px-2 py-1 rounded-md text-xs border ${audience === option ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-700 border-gray-300"}`}
              >
                {option === "all" ? "Everyone" : option === "department" ? "Department" : "Choose people"}
              </button>
            ))}
          </div>
          {audience === "department" && (
            <select value={department} onChange={(event) => setDepartment(event.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm">
              <option value="">Select department</option>
              {departments.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          )}
          {audience === "selected" && (
            <div className="border rounded-md">
              <input
                value={personQuery}
                onChange={(event) => setPersonQuery(event.target.value)}
                placeholder="Search name or department"
                className="w-full px-2 py-1.5 border-b text-sm"
              />
              <div className="max-h-36 overflow-y-auto">
                {visiblePeople.map((person) => (
                  <label key={person.id} className="flex items-center gap-2 px-2 py-1 text-sm text-gray-800">
                    <input
                      type="checkbox"
                      checked={picked.includes(person.id)}
                      onChange={(event) => {
                        setPicked((current) => event.target.checked ? [...current, person.id] : current.filter((id) => id !== person.id))
                      }}
                    />
                    <span className="truncate">{person.name}</span>
                    <span className="ml-auto text-xs text-gray-500 truncate">{person.department}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-gray-500">{audience === "selected" ? `${picked.length} selected` : ""}</p>
            <button
              type="button"
              onClick={sendNew}
              disabled={sending || !draft.trim()}
              className="px-3 py-1.5 text-sm bg-orange-500 text-white rounded-md disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      )}

      {notice && <p className="text-sm text-gray-700">{notice}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="bg-white border rounded-md">
        <div className="px-3 py-2 border-b">
          <h3 className="text-sm font-medium text-gray-900">{canSend ? "Sent messages and replies" : "Your messages"}</h3>
        </div>
        {loading ? (
          <p className="px-3 py-4 text-sm text-gray-500">Loading messages...</p>
        ) : threads.length === 0 ? (
          <p className="px-3 py-4 text-sm text-gray-500">{canSend ? "No messages sent yet." : "No messages for you yet."}</p>
        ) : (
          <ul className="divide-y">
            {threads.map((thread) => (
              <li key={thread.threadId}>
                <button type="button" onClick={() => openThread(thread)} className="w-full text-left px-3 py-2 hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-900 truncate">{canSend ? thread.employeeName : thread.title}</span>
                    {thread.unread > 0 && <span className="text-xs bg-orange-500 text-white rounded-full px-1.5">{thread.unread}</span>}
                    <span className="ml-auto text-xs text-gray-500 whitespace-nowrap">{new Date(thread.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{thread.messages[thread.messages.length - 1]?.body}</p>
                </button>
                {open?.threadId === thread.threadId && (
                  <div className="px-3 pb-3 space-y-2">
                    <div className="max-h-64 overflow-y-auto space-y-2 bg-gray-50 rounded-md p-2">
                      {thread.messages.map((item) => (
                        <div key={item.id} className={`max-w-[85%] rounded-md px-2 py-1.5 ${item.mine ? "ml-auto bg-orange-500 text-white" : "bg-white border text-gray-900"}`}>
                          <p className={`text-xs ${item.mine ? "text-orange-100" : "text-gray-500"}`}>{item.senderName}</p>
                          <p className="text-sm whitespace-pre-wrap">{item.body}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={reply}
                        onChange={(event) => setReply(event.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1 min-w-0 px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => sendReply(thread.threadId)}
                        disabled={sending || !reply.trim()}
                        className="px-3 py-1.5 text-sm bg-orange-500 text-white rounded-md disabled:opacity-50"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
