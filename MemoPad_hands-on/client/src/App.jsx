import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const API_BASE = 'http://localhost:3001/api'
const emptyMemo = { title: '', body: '', tagsText: '' }
const emptyUser = { userId: '', displayName: '', email: '', password: '', role: 'user', status: 'active' }
const initialFilters = { keyword: '', page: 1, limit: 10, sortBy: 'updatedAt', order: 'desc', favorite: false, tag: '' }

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const pad = (num) => String(num).padStart(2, '0')
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}


function formatSize(size) {
  if (!size) return '0 KB'
  if (size >= 1024 * 1024) return (size / 1024 / 1024).toFixed(1) + ' MB'
  return Math.max(1, Math.round(size / 1024)) + ' KB'
}

function getExtension(name) {
  const parts = String(name || '').split('.')
  return parts.length > 1 ? parts.pop().toLowerCase() : ''
}

function validateSelectedFiles(files, existingCount, type) {
  const errors = {}
  const list = Array.from(files || [])
  const isImage = type === 'image'
  const allowed = isImage ? ['jpg', 'jpeg', 'png', 'gif', 'webp'] : ['pdf', 'txt', 'csv', 'docx', 'xlsx']
  const maxCount = isImage ? 10 : 5
  const maxSize = isImage ? 5 * 1024 * 1024 : 10 * 1024 * 1024
  const key = isImage ? 'images' : 'attachments'
  if (existingCount + list.length > maxCount) errors[key] = isImage ? '画像は10枚以内で選択してください。' : '添付ファイルは5件以内で選択してください。'
  for (const file of list) {
    if (!allowed.includes(getExtension(file.name))) errors[key] = isImage ? 'アップロードできる画像形式は jpg, jpeg, png, gif, webp です。' : '添付できるファイル形式は pdf, txt, csv, docx, xlsx です。'
    if (file.size > maxSize) errors[key] = isImage ? '画像は1ファイル5MB以内で選択してください。' : '添付ファイルは1ファイル10MB以内で選択してください。'
  }
  return errors
}

function fileToUpload(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve({ name: file.name, type: file.type || 'application/octet-stream', size: file.size, content: reader.result })
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function validateMemo(form) {
  const errors = {}
  if (!form.title || form.title.trim().length === 0) errors.title = 'タイトルを入力してください。'
  else if (form.title.length > 100) errors.title = 'タイトルは100文字以内で入力してください。'
  if (!form.body || form.body.trim().length === 0) errors.body = '本文を入力してください。'
  else if (form.body.length > 2000) errors.body = '本文は2000文字以内で入力してください。'
  return errors
}

function validateLogin(form) {
  const errors = {}
  if (!form.userId.trim()) errors.userId = 'ユーザーIDを入力してください。'
  else if (!/^[a-zA-Z0-9_-]+$/.test(form.userId)) errors.userId = 'ユーザーIDは半角英数字、ハイフン、アンダースコアで入力してください。'
  else if (form.userId.length < 4 || form.userId.length > 20) errors.userId = 'ユーザーIDは4文字以上20文字以内で入力してください。'
  if (!form.password) errors.password = 'パスワードを入力してください。'
  else if (form.password.length < 8 || form.password.length > 64) errors.password = 'パスワードは8文字以上64文字以内で入力してください。'
  return errors
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('memoPadToken') || '')
  const [currentUser, setCurrentUser] = useState(null)
  const [loginForm, setLoginForm] = useState({ userId: 'admin', password: 'password123' })
  const [loginErrors, setLoginErrors] = useState({})
  const [memos, setMemos] = useState([])
  const [total, setTotal] = useState(0)
  const [selectedMemo, setSelectedMemo] = useState(null)
  const [memoForm, setMemoForm] = useState(emptyMemo)
  const [pendingAttachments, setPendingAttachments] = useState([])
  const [pendingImages, setPendingImages] = useState([])
  const [fileErrors, setFileErrors] = useState({})
  const [imageUrls, setImageUrls] = useState({})
  const [users, setUsers] = useState([])
  const [tags, setTags] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [userForm, setUserForm] = useState(emptyUser)
  const [userErrors, setUserErrors] = useState({})
  const [mode, setMode] = useState('list')
  const [displayMode, setDisplayMode] = useState('list')
  const [filters, setFilters] = useState(initialFilters)
  const [formErrors, setFormErrors] = useState({})
  const [message, setMessage] = useState('')
  const [globalError, setGlobalError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [draftStatus, setDraftStatus] = useState('')
  const [formTouched, setFormTouched] = useState(false)
  const autosaveTimerRef = useRef(null)
  const autosaveSeqRef = useRef(0)
  const lastDraftPayloadRef = useRef('')

  const authHeaders = useMemo(() => token ? { Authorization: `Bearer ${token}` } : {}, [token])
  const pageCount = Math.max(1, Math.ceil(total / filters.limit))

  const handleLoggedOut = () => {
    localStorage.removeItem('memoPadToken')
    setToken('')
    setCurrentUser(null)
    setMode('list')
  }

  const requestJson = async (path, options = {}) => {
    const response = await fetch(`${API_BASE}${path}`, { ...options, headers: { ...authHeaders, ...(options.headers || {}) } })
    const data = response.status === 204 ? null : await response.json().catch(() => null)
    if (!response.ok) {
      const error = new Error(data?.message || 'server')
      error.status = response.status
      error.data = data
      throw error
    }
    return data
  }

  const loadMemos = async () => {
    if (!token) return
    setIsLoading(true)
    setGlobalError('')
    try {
      const params = new URLSearchParams({ keyword: filters.keyword, page: String(filters.page), limit: String(filters.limit), sortBy: filters.sortBy, order: filters.order, favorite: String(filters.favorite), tag: filters.tag })
      const data = await requestJson(`/todos?${params.toString()}`)
      setMemos(data.items)
      setTotal(data.total)
      await loadTags()
    } catch (error) {
      if (error.status === 401) handleLoggedOut()
      else setGlobalError('通信に失敗しました。ネットワーク接続を確認してください。')
    } finally {
      setIsLoading(false)
    }
  }



  const loadTags = async () => {
    if (!token) return
    try { setTags(await requestJson('/tags')) }
    catch (error) { /* タグ取得失敗は一覧操作を優先する。 */ }
  }

  const loadUsers = async () => {
    setGlobalError('')
    try {
      setUsers(await requestJson('/users'))
    } catch (error) {
      if (error.status === 403) {
        setMode('list')
        setGlobalError('アクセス権限がありません。')
      } else setGlobalError('通信に失敗しました。ネットワーク接続を確認してください。')
    }
  }

  useEffect(() => {
    const loadMe = async () => {
      if (!token) return
      try {
        const data = await requestJson('/me')
        setCurrentUser(data.user)
      } catch (error) {
        handleLoggedOut()
      }
    }
    loadMe()
  }, [token])

  useEffect(() => { if (currentUser) loadMemos() }, [currentUser, filters])

  useEffect(() => {
    clearAutosaveTimer()
    if (!currentUser || !(mode === 'create' || mode === 'edit')) return
    let cancelled = false
    const loadDraft = async () => {
      setDraftStatus('')
      try {
        const data = await requestJson(draftPath)
        if (cancelled || !data?.draft) {
          lastDraftPayloadRef.current = serializeDraftPayload(buildDraftPayload())
          return
        }
        const staleMessage = data.draft.isStale ? '他のユーザーによって元のメモが更新されています。復元後は内容を確認してください。' : ''
        if (window.confirm(`${staleMessage}${staleMessage ? '\n' : ''}保存されていない下書きがあります。復元しますか？`)) {
          const restored = { title: data.draft.title, body: data.draft.body, tagsText: data.draft.tagsText }
          setMemoForm(restored)
          setDraftStatus('下書きを復元しました。')
          lastDraftPayloadRef.current = serializeDraftPayload({ memoId: draftMemoId, ...restored, baseUpdatedAt: selectedMemo?.updatedAt || null })
        } else {
          await deleteCurrentDraft()
          lastDraftPayloadRef.current = serializeDraftPayload(buildDraftPayload())
        }
        setFormTouched(false)
      } catch (error) {
        lastDraftPayloadRef.current = serializeDraftPayload(buildDraftPayload())
      }
    }
    loadDraft()
    return () => { cancelled = true; clearAutosaveTimer() }
  }, [currentUser, mode, selectedMemo?.id])

  useEffect(() => {
    clearAutosaveTimer()
    if (!currentUser || !(mode === 'create' || mode === 'edit') || isSaving || !formTouched) return
    if (mode === 'create' && !hasDraftContent(memoForm)) return
    const payload = buildDraftPayload()
    const serialized = serializeDraftPayload(payload)
    if (serialized === lastDraftPayloadRef.current) return
    autosaveTimerRef.current = setTimeout(async () => {
      const seq = autosaveSeqRef.current + 1
      autosaveSeqRef.current = seq
      try {
        const data = await requestJson('/drafts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (seq === autosaveSeqRef.current) {
          lastDraftPayloadRef.current = serialized
          setDraftStatus(data?.message || '下書きを保存しました。')
        }
      } catch (error) {
        if (seq === autosaveSeqRef.current) setDraftStatus('下書き保存に失敗しました。')
      }
    }, 3000)
    return clearAutosaveTimer
  }, [memoForm, mode, selectedMemo?.id, selectedMemo?.updatedAt, currentUser, isSaving, formTouched])


  useEffect(() => {
    let active = true
    const urls = []
    const loadImageUrls = async () => {
      const images = selectedMemo?.images || []
      if (images.length === 0) { setImageUrls({}); return }
      const entries = await Promise.all(images.map(async (file) => {
        try {
          const blob = await fetchFileBlob(file)
          const url = URL.createObjectURL(blob)
          urls.push(url)
          return [file.id, url]
        } catch (error) {
          return [file.id, '']
        }
      }))
      if (active) setImageUrls(Object.fromEntries(entries))
    }
    loadImageUrls()
    return () => { active = false; urls.forEach((url) => URL.revokeObjectURL(url)) }
  }, [selectedMemo?.id, selectedMemo?.images, token])

  const login = async (event) => {
    event.preventDefault()
    const errors = validateLogin(loginForm)
    setLoginErrors(errors)
    setGlobalError('')
    if (Object.keys(errors).length > 0) return
    setIsSaving(true)
    try {
      const response = await fetch(`${API_BASE}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginForm) })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.message || 'login')
      localStorage.setItem('memoPadToken', data.token)
      setToken(data.token)
      setCurrentUser(data.user)
      setMessage('ログインしました。')
    } catch (error) {
      setGlobalError('ユーザーIDまたはパスワードが正しくありません。')
    } finally {
      setIsSaving(false)
    }
  }

  const logout = async () => {
    try { if (token) await requestJson('/logout', { method: 'POST' }) } catch (error) { /* local logout first */ }
    handleLoggedOut()
    setMessage('')
  }

  const updateFilters = (patch) => setFilters((current) => ({ ...current, ...patch, page: patch.page || 1 }))
  const draftMemoId = mode === 'edit' && selectedMemo ? selectedMemo.id : null
  const draftPath = draftMemoId ? `/drafts/memos/${draftMemoId}` : '/drafts/new'
  const buildDraftPayload = () => ({ memoId: draftMemoId, title: memoForm.title, body: memoForm.body, tagsText: memoForm.tagsText, baseUpdatedAt: selectedMemo?.updatedAt || null })
  const serializeDraftPayload = (payload) => JSON.stringify(payload)
  const hasDraftContent = (form) => Boolean(form.title || form.body || form.tagsText)
  const setMemoField = (field, value) => { setMemoForm((current) => ({ ...current, [field]: value })); setFormTouched(true); setDraftStatus('') }
  const clearAutosaveTimer = () => { if (autosaveTimerRef.current) { clearTimeout(autosaveTimerRef.current); autosaveTimerRef.current = null } }
  const deleteCurrentDraft = async () => { try { await requestJson(draftPath, { method: 'DELETE' }) } catch (error) { /* 下書き削除失敗は画面遷移を優先する。 */ } }

  const fetchFileBlob = async (file) => {
    const response = await fetch(API_BASE + file.downloadUrl, { headers: authHeaders })
    if (!response.ok) throw new Error('download')
    return response.blob()
  }
  const downloadFile = async (file) => {
    try {
      const blob = await fetchFileBlob(file)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file.originalName
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      setGlobalError('通信に失敗しました。ネットワーク接続を確認してください。')
    }
  }
  const refreshSelectedMemo = async () => {
    if (!selectedMemo) return
    const memo = await requestJson('/todos/' + selectedMemo.id)
    setSelectedMemo(memo)
  }
  const deleteExistingFile = async (file) => {
    if (!window.confirm(file.originalName + ' を削除しますか？')) return
    try {
      await requestJson('/files/' + file.id, { method: 'DELETE' })
      await refreshSelectedMemo()
      setMessage('ファイルを削除しました。')
    } catch (error) {
      setGlobalError(error.message || '処理中にエラーが発生しました。時間をおいて再度お試しください。')
    }
  }
  const addPendingFiles = (event, type) => {
    const selected = Array.from(event.target.files || [])
    const isImage = type === 'image'
    const existingCount = isImage ? (selectedMemo?.images || []).length : (selectedMemo?.attachments || []).length
    const current = isImage ? pendingImages : pendingAttachments
    const next = [...current, ...selected]
    const errors = validateSelectedFiles(next, existingCount, type)
    const key = isImage ? 'images' : 'attachments'
    setFileErrors((currentErrors) => ({ ...currentErrors, [key]: errors[key] || '' }))
    if (isImage) setPendingImages(next)
    else setPendingAttachments(next)
    event.target.value = ''
  }
  const removePendingFile = (index, type) => {
    if (type === 'image') setPendingImages((current) => current.filter((_, i) => i !== index))
    else setPendingAttachments((current) => current.filter((_, i) => i !== index))
    setFileErrors({})
  }
  const clearFileInputs = () => { setPendingAttachments([]); setPendingImages([]); setFileErrors({}); setImageUrls({}) }

  const openUserList = async () => {
    if (currentUser.role !== 'admin') { setMode('list'); setGlobalError('アクセス権限がありません。'); return }
    setMode('users'); setMessage(''); setUserErrors({}); await loadUsers()
  }
  const startCreate = () => { clearAutosaveTimer(); setSelectedMemo(null); setMemoForm(emptyMemo); clearFileInputs(); setFormTouched(false); lastDraftPayloadRef.current = ''; setDraftStatus(''); setFormErrors({}); setMessage(''); setGlobalError(''); setMode('create') }
  const startEdit = async (memo) => { clearAutosaveTimer(); const fullMemo = memo.attachments ? memo : await requestJson('/todos/' + memo.id); setSelectedMemo(fullMemo); setMemoForm({ title: fullMemo.title, body: fullMemo.body, tagsText: (fullMemo.tags || []).join(', ') }); clearFileInputs(); setFormTouched(false); lastDraftPayloadRef.current = ''; setDraftStatus(''); setFormErrors({}); setMessage(''); setGlobalError(''); setMode('edit') }
  const showDetail = async (memo) => {
    setGlobalError('')
    try { setSelectedMemo(await requestJson(`/todos/${memo.id}`)); setMode('detail') }
    catch (error) { setGlobalError(error.message || '指定されたメモは存在しません。'); await loadMemos() }
  }
  const cancelMemoForm = async () => {
    const original = selectedMemo ? { title: selectedMemo.title, body: selectedMemo.body, tagsText: (selectedMemo.tags || []).join(', ') } : emptyMemo
    const changed = memoForm.title !== original.title || memoForm.body !== original.body || memoForm.tagsText !== original.tagsText
    if (changed && !window.confirm('入力内容は保存されていません。破棄しますか？')) return
    clearAutosaveTimer()
    if (changed || hasDraftContent(memoForm)) await deleteCurrentDraft()
    setMode('list'); setMemoForm(emptyMemo); clearFileInputs(); setFormTouched(false); setDraftStatus(''); setFormErrors({})
  }
  const saveMemo = async (event) => {
    event.preventDefault()
    const errors = validateMemo(memoForm)
    const attachmentErrors = validateSelectedFiles(pendingAttachments, selectedMemo?.attachments?.length || 0, 'attachment')
    const imageErrors = validateSelectedFiles(pendingImages, selectedMemo?.images?.length || 0, 'image')
    const nextFileErrors = { ...attachmentErrors, ...imageErrors }
    setFormErrors(errors); setFileErrors(nextFileErrors); setGlobalError(''); setMessage('')
    if (Object.keys(errors).length > 0 || Object.values(nextFileErrors).some(Boolean)) return
    clearAutosaveTimer()
    setIsSaving(true)
    try {
      const isEdit = mode === 'edit' && selectedMemo
      const attachments = await Promise.all(pendingAttachments.map(fileToUpload))
      const images = await Promise.all(pendingImages.map(fileToUpload))
      await requestJson('/todos' + (isEdit ? '/' + selectedMemo.id : ''), { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: memoForm.title, body: memoForm.body, tags: memoForm.tagsText, updatedAt: selectedMemo?.updatedAt, attachments, images }) })
      setMessage(isEdit ? 'メモを更新しました。' : 'メモを登録しました。')
      lastDraftPayloadRef.current = ''; clearFileInputs(); setFormTouched(false); setDraftStatus('')
      setMode('list'); setMemoForm(emptyMemo); setSelectedMemo(null); await loadMemos(); await loadTags()
    } catch (error) {
      if (error.data?.errors) setFormErrors(error.data.errors)
      setGlobalError(error.status === 409 ? error.message : '処理中にエラーが発生しました。時間をおいて再度お試しください。')
    } finally { setIsSaving(false) }
  }
  const deleteMemo = async (memo) => {
    if (!window.confirm('このメモを削除しますか？')) return
    try { await requestJson(`/todos/${memo.id}`, { method: 'DELETE' }); setMessage('メモを削除しました。'); setMode('list'); setSelectedMemo(null); await loadMemos() }
    catch (error) { setGlobalError(error.message || '処理中にエラーが発生しました。時間をおいて再度お試しください。') }
  }
  const toggleFavorite = async (memo) => {
    try { await requestJson(`/todos/${memo.id}/favorite`, { method: memo.isFavorite ? 'DELETE' : 'POST' }); await loadMemos() }
    catch (error) { setGlobalError('処理中にエラーが発生しました。時間をおいて再度お試しください。') }
  }

  const startUserCreate = () => { setSelectedUser(null); setUserForm(emptyUser); setUserErrors({}); setMode('userForm') }
  const startUserEdit = (user) => { setSelectedUser(user); setUserForm({ userId: user.userId, displayName: user.displayName, email: user.email, password: '', role: user.role, status: user.status }); setUserErrors({}); setMode('userForm') }
  const saveUser = async (event) => {
    event.preventDefault(); setIsSaving(true); setUserErrors({}); setGlobalError(''); setMessage('')
    try {
      const isEdit = Boolean(selectedUser)
      const data = await requestJson(`/users${isEdit ? `/${selectedUser.id}` : ''}`, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userForm) })
      setMessage(data.message); setMode('users'); await loadUsers()
    } catch (error) {
      if (error.data?.errors) setUserErrors(error.data.errors)
      else setGlobalError(error.message || '処理中にエラーが発生しました。時間をおいて再度お試しください。')
    } finally { setIsSaving(false) }
  }
  const disableUser = async (user) => {
    if (!window.confirm(`${user.userId} を無効化しますか？`)) return
    try { const data = await requestJson(`/users/${user.id}/disable`, { method: 'PATCH' }); setMessage(data.message); await loadUsers() }
    catch (error) { setGlobalError(error.message || '処理中にエラーが発生しました。時間をおいて再度お試しください。') }
  }

  if (!token || !currentUser) {
    return <main className="app-shell narrow"><section className="workspace form-panel"><p className="eyebrow">QA Exercise</p><h1>MemoPad ログイン</h1>{globalError && <div className="notice error">{globalError}</div>}<form onSubmit={login} noValidate><label className="field"><span>ユーザーID</span><input value={loginForm.userId} onChange={(e) => setLoginForm({ ...loginForm, userId: e.target.value })} />{loginErrors.userId && <strong className="field-error">{loginErrors.userId}</strong>}</label><label className="field"><span>パスワード</span><input type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />{loginErrors.password && <strong className="field-error">{loginErrors.password}</strong>}</label><button type="submit" className="primary-button" disabled={isSaving}>{isSaving ? 'ログイン中' : 'ログイン'}</button></form><p className="hint">初期ユーザー: admin / password123</p></section></main>
  }

  return (
    <main className="app-shell">
      <header className="app-header"><div><p className="eyebrow">{currentUser.displayName} / {currentUser.role === 'admin' ? '管理者' : '一般ユーザー'}</p><h1>MemoPad</h1></div><div className="header-actions"><button type="button" className="primary-button" onClick={startCreate}>新規作成</button>{currentUser.role === 'admin' && <button type="button" className="ghost-button" onClick={openUserList}>ユーザー管理</button>}<button type="button" className="ghost-button" onClick={logout}>ログアウト</button></div></header>
      {message && <div className="notice success">{message}</div>}{globalError && <div className="notice error">{globalError}</div>}

      {mode === 'users' && currentUser.role === 'admin' && <section className="workspace"><div className="section-heading"><h2>ユーザー管理</h2><div className="form-actions"><button type="button" className="primary-button" onClick={startUserCreate}>ユーザー作成</button><button type="button" className="ghost-button" onClick={() => setMode('list')}>メモ一覧へ戻る</button></div></div><div className="user-table"><div className="user-row user-head"><span>ユーザーID</span><span>表示名</span><span>メール</span><span>権限</span><span>状態</span><span>操作</span></div>{users.map((user) => <div className="user-row" key={user.id}><span>{user.userId}</span><span>{user.displayName}</span><span>{user.email}</span><span>{user.role === 'admin' ? '管理者' : '一般ユーザー'}</span><span>{user.status === 'active' ? '有効' : '無効'}</span><span className="row-actions"><button type="button" onClick={() => startUserEdit(user)}>編集</button><button type="button" className="danger-button" disabled={user.status === 'disabled'} onClick={() => disableUser(user)}>無効化</button></span></div>)}</div></section>}

      {mode === 'userForm' && currentUser.role === 'admin' && <section className="workspace form-panel"><div className="section-heading"><h2>{selectedUser ? 'ユーザー編集' : 'ユーザー作成'}</h2><button type="button" className="ghost-button" onClick={() => setMode('users')}>キャンセル</button></div><form onSubmit={saveUser} noValidate><label className="field"><span>ユーザーID</span><input value={userForm.userId} disabled={Boolean(selectedUser)} onChange={(e) => setUserForm({ ...userForm, userId: e.target.value })} />{userErrors.userId && <strong className="field-error">{userErrors.userId}</strong>}</label><label className="field"><span>表示名</span><input value={userForm.displayName} onChange={(e) => setUserForm({ ...userForm, displayName: e.target.value })} />{userErrors.displayName && <strong className="field-error">{userErrors.displayName}</strong>}</label><label className="field"><span>メールアドレス</span><input value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />{userErrors.email && <strong className="field-error">{userErrors.email}</strong>}</label><label className="field"><span>パスワード{selectedUser ? '（変更時のみ入力）' : ''}</span><input type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />{userErrors.password && <strong className="field-error">{userErrors.password}</strong>}</label><label className="field"><span>権限</span><select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}><option value="user">一般ユーザー</option><option value="admin">管理者</option></select>{userErrors.role && <strong className="field-error">{userErrors.role}</strong>}</label>{selectedUser && <label className="field"><span>状態</span><select value={userForm.status} onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}><option value="active">有効</option><option value="disabled">無効</option></select></label>}<div className="form-actions"><button type="submit" className="primary-button" disabled={isSaving}>{isSaving ? '保存中' : selectedUser ? '更新' : '登録'}</button><button type="button" className="ghost-button" onClick={() => setMode('users')}>キャンセル</button></div></form></section>}

      {mode === 'list' && <section className="workspace"><div className="toolbar stackable"><label className="search-field"><span>検索</span><input value={filters.keyword} onChange={(e) => updateFilters({ keyword: e.target.value })} placeholder="タイトル・本文を検索" /></label><label className="select-field"><span>表示件数</span><select value={filters.limit} onChange={(e) => updateFilters({ limit: Number(e.target.value) })}><option value="10">10件</option><option value="25">25件</option><option value="50">50件</option></select></label><label className="select-field"><span>並び替え</span><select value={filters.sortBy} onChange={(e) => updateFilters({ sortBy: e.target.value })}><option value="updatedAt">更新日時</option><option value="createdAt">作成日時</option><option value="title">タイトル</option></select></label><div className="segmented" aria-label="昇順降順"><button type="button" className={filters.order === 'desc' ? 'active' : ''} onClick={() => updateFilters({ order: 'desc' })}>降順</button><button type="button" className={filters.order === 'asc' ? 'active' : ''} onClick={() => updateFilters({ order: 'asc' })}>昇順</button></div></div><div className="toolbar compact-toolbar"><label className="check-field"><input type="checkbox" checked={filters.favorite} onChange={(e) => updateFilters({ favorite: e.target.checked })} /> お気に入りのみ</label><label className="select-field"><span>タグ</span><select value={filters.tag} onChange={(e) => updateFilters({ tag: e.target.value })}><option value="">すべて</option>{tags.map((tag) => <option key={tag.normalizedName} value={tag.normalizedName}>{tag.name}</option>)}</select></label><div className="segmented" aria-label="表示切り替え"><button type="button" className={displayMode === 'list' ? 'active' : ''} onClick={() => setDisplayMode('list')}>一覧</button><button type="button" className={displayMode === 'compact' ? 'active' : ''} onClick={() => setDisplayMode('compact')}>コンパクト</button></div></div>{isLoading && <p className="empty-state">読み込み中です。</p>}{!isLoading && total === 0 && !filters.keyword && !filters.favorite && <p className="empty-state">メモが登録されていません。</p>}{!isLoading && total === 0 && (filters.keyword || filters.favorite) && <p className="empty-state">条件に一致するメモがありません。</p>}<div className={displayMode === 'compact' ? 'memo-list compact' : 'memo-list'}>{memos.map((memo) => <article className="memo-item" key={memo.id}><div className="memo-main"><h2>{memo.title}</h2>{displayMode === 'list' && <p className="memo-preview">{memo.body.slice(0, 50)}</p>}{memo.tags?.length > 0 && <div className="tag-list">{memo.tags.map((tag) => <span className="tag-chip" key={tag}>{tag}</span>)}</div>}<p className="memo-date">更新日時 {formatDate(memo.updatedAt)}</p></div><div className="memo-actions"><button type="button" onClick={() => toggleFavorite(memo)}>{memo.isFavorite ? 'お気に入り解除' : 'お気に入り'}</button><button type="button" onClick={() => showDetail(memo)}>詳細</button><button type="button" onClick={() => startEdit(memo)}>編集</button><button type="button" className="danger-button" onClick={() => deleteMemo(memo)}>削除</button></div></article>)}</div><div className="pagination"><button type="button" disabled={filters.page <= 1} onClick={() => updateFilters({ page: filters.page - 1 })}>前へ</button><span>{filters.page} / {pageCount}</span><button type="button" disabled={filters.page >= pageCount} onClick={() => updateFilters({ page: filters.page + 1 })}>次へ</button></div></section>}

      {(mode === 'create' || mode === 'edit') && <section className="workspace form-panel"><div className="section-heading"><h2>{mode === 'create' ? 'メモ新規作成' : 'メモ編集'}</h2><button type="button" className="ghost-button" onClick={cancelMemoForm}>キャンセル</button></div><form onSubmit={saveMemo} noValidate><label className="field"><span>タイトル</span><input value={memoForm.title} maxLength={120} onChange={(e) => setMemoField('title', e.target.value)} /><small>{memoForm.title.length}/100</small>{formErrors.title && <strong className="field-error">{formErrors.title}</strong>}</label><label className="field"><span>本文</span><textarea value={memoForm.body} rows="12" maxLength={2100} onChange={(e) => setMemoField('body', e.target.value)} /><small>{memoForm.body.length}/2000</small>{formErrors.body && <strong className="field-error">{formErrors.body}</strong>}</label><label className="field"><span>タグ</span><input value={memoForm.tagsText} onChange={(e) => setMemoField('tagsText', e.target.value)} placeholder="例: 仕事, 重要" /><small>カンマ区切り、最大10個、各30文字以内</small>{formErrors.tags && <strong className="field-error">{formErrors.tags}</strong>}</label><div className="file-grid"><label className="field"><span>添付ファイル</span><input type="file" multiple accept=".pdf,.txt,.csv,.docx,.xlsx" onChange={(e) => addPendingFiles(e, 'attachment')} /><small>最大5件、1ファイル10MB以内</small>{fileErrors.attachments && <strong className="field-error">{fileErrors.attachments}</strong>}</label><label className="field"><span>画像</span><input type="file" multiple accept=".jpg,.jpeg,.png,.gif,.webp" onChange={(e) => addPendingFiles(e, 'image')} /><small>最大10枚、1ファイル5MB以内</small>{fileErrors.images && <strong className="field-error">{fileErrors.images}</strong>}</label></div>{selectedMemo?.attachments?.length > 0 && <div className="file-list"><h3>登録済み添付ファイル</h3>{selectedMemo.attachments.map((file) => <div className="file-row" key={file.id}><span>{file.originalName} ({formatSize(file.size)})</span><div className="row-actions"><button type="button" onClick={() => downloadFile(file)}>ダウンロード</button><button type="button" className="danger-button" onClick={() => deleteExistingFile(file)}>削除</button></div></div>)}</div>}{selectedMemo?.images?.length > 0 && <div className="image-grid"><h3>登録済み画像</h3>{selectedMemo.images.map((file) => <div className="image-card" key={file.id}>{imageUrls[file.id] ? <img src={imageUrls[file.id]} alt={file.originalName} /> : <div className="image-placeholder">プレビューできません</div>}<span>{file.originalName}</span><div className="row-actions"><button type="button" onClick={() => downloadFile(file)}>ダウンロード</button><button type="button" className="danger-button" onClick={() => deleteExistingFile(file)}>削除</button></div></div>)}</div>}{pendingAttachments.length > 0 && <div className="file-list"><h3>追加予定の添付ファイル</h3>{pendingAttachments.map((file, index) => <div className="file-row" key={file.name + '-' + index}><span>{file.name} ({formatSize(file.size)})</span><button type="button" className="danger-button" onClick={() => removePendingFile(index, 'attachment')}>削除</button></div>)}</div>}{pendingImages.length > 0 && <div className="image-grid"><h3>追加予定の画像</h3>{pendingImages.map((file, index) => <div className="image-card" key={file.name + '-' + index}><img src={URL.createObjectURL(file)} alt={file.name} /><span>{file.name}</span><button type="button" className="danger-button" onClick={() => removePendingFile(index, 'image')}>削除</button></div>)}</div>}{draftStatus && <p className="draft-status">{draftStatus}</p>}<div className="form-actions"><button type="submit" className="primary-button" disabled={isSaving}>{isSaving ? '保存中' : mode === 'create' ? '登録' : '更新'}</button><button type="button" className="ghost-button" onClick={cancelMemoForm}>キャンセル</button></div></form></section>}

      {mode === 'detail' && selectedMemo && <section className="workspace detail-panel"><div className="section-heading"><h2>{selectedMemo.title}</h2><button type="button" className="ghost-button" onClick={() => setMode('list')}>一覧へ戻る</button></div>{selectedMemo.tags?.length > 0 && <div className="tag-list detail-tags">{selectedMemo.tags.map((tag) => <span className="tag-chip" key={tag}>{tag}</span>)}</div>}{selectedMemo.attachments?.length > 0 && <div className="file-list"><h3>添付ファイル</h3>{selectedMemo.attachments.map((file) => <div className="file-row" key={file.id}><span>{file.originalName} ({formatSize(file.size)})</span><div className="row-actions"><button type="button" onClick={() => downloadFile(file)}>ダウンロード</button><button type="button" className="danger-button" onClick={() => deleteExistingFile(file)}>削除</button></div></div>)}</div>}{selectedMemo.images?.length > 0 && <div className="image-grid"><h3>画像</h3>{selectedMemo.images.map((file) => <div className="image-card" key={file.id}>{imageUrls[file.id] ? <img src={imageUrls[file.id]} alt={file.originalName} /> : <div className="image-placeholder">プレビューできません</div>}<span>{file.originalName}</span><div className="row-actions"><button type="button" onClick={() => downloadFile(file)}>ダウンロード</button><button type="button" className="danger-button" onClick={() => deleteExistingFile(file)}>削除</button></div></div>)}</div>}<p className="memo-body">{selectedMemo.body}</p><dl className="date-grid"><div><dt>作成日時</dt><dd>{formatDate(selectedMemo.createdAt)}</dd></div><div><dt>更新日時</dt><dd>{formatDate(selectedMemo.updatedAt)}</dd></div></dl><div className="form-actions"><button type="button" onClick={() => startEdit(selectedMemo)}>編集</button><button type="button" className="danger-button" onClick={() => deleteMemo(selectedMemo)}>削除</button></div></section>}
    </main>
  )
}

export default App



