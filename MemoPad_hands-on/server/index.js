const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const port = process.env.PORT || 3001;
const dataDir = path.join(__dirname, "..", "data");
const dbPath = path.join(dataDir, "memo.db");
const uploadDir = path.join(__dirname, "..", "uploads");
const attachmentDir = path.join(uploadDir, "attachments");
const imageDir = path.join(uploadDir, "images");

fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(attachmentDir, { recursive: true });
fs.mkdirSync(imageDir, { recursive: true });

const db = new Database(dbPath);
db.pragma("foreign_keys = ON");

const messages = {
  titleRequired: "タイトルを入力してください。",
  titleLength: "タイトルは100文字以内で入力してください。",
  bodyRequired: "本文を入力してください。",
  bodyLength: "本文は2000文字以内で入力してください。",
  memoNotFound: "指定されたメモは存在しません。",
  conflict: "他のユーザーによって更新されています。内容を確認して再度保存してください。",
  loginFailed: "ユーザーIDまたはパスワードが正しくありません。",
  serverError: "処理中にエラーが発生しました。時間をおいて再度お試しください。",
  accessDenied: "アクセス権限がありません。",
  userCreated: "ユーザーを登録しました。",
  userUpdated: "ユーザーを更新しました。",
  userDisabled: "ユーザーを無効化しました。",
  userIdRequired: "ユーザーIDを入力してください。",
  userIdFormat: "ユーザーIDは半角英数字、ハイフン、アンダースコアで入力してください。",
  userIdLength: "ユーザーIDは4文字以上20文字以内で入力してください。",
  userIdDuplicate: "このユーザーIDは既に使用されています。",
  displayNameRequired: "表示名を入力してください。",
  emailRequired: "メールアドレスを入力してください。",
  emailFormat: "メールアドレスの形式が正しくありません。",
  emailDuplicate: "このメールアドレスは既に使用されています。",
  passwordRequired: "パスワードを入力してください。",
  passwordLength: "パスワードは8文字以上64文字以内で入力してください。",
  roleRequired: "権限を選択してください。",
  tagLimit: "タグは10個以内で入力してください。",
  tagNameLength: "タグ名は30文字以内で入力してください。",
  draftSaved: "下書きを保存しました。",
  draftDeleted: "下書きを削除しました。",
  fileNotFound: "指定されたファイルは存在しません。",
  attachmentCount: "添付ファイルは5件以内で選択してください。",
  attachmentSize: "添付ファイルは1ファイル10MB以内で選択してください。",
  attachmentExtension: "添付できるファイル形式は pdf, txt, csv, docx, xlsx です。",
  imageCount: "画像は10枚以内で選択してください。",
  imageSize: "画像は1ファイル5MB以内で選択してください。",
  imageExtension: "アップロードできる画像形式は jpg, jpeg, png, gif, webp です。",
};

const nowIso = () => new Date().toISOString();
const hashPassword = (password) => crypto.createHash("sha256").update(password).digest("hex");
const normalizeUserId = (userId) => String(userId || "").trim().toLowerCase();

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
    status TEXT NOT NULL CHECK (status IN ('active', 'disabled')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS MEMO (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_user_id INTEGER,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    FOREIGN KEY (owner_user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS favorites (
    user_id INTEGER NOT NULL,
    memo_id INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (user_id, memo_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (memo_id) REFERENCES MEMO(id)
  );

  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    normalized_name TEXT UNIQUE,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS memo_tags (
    memo_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (memo_id, tag_id),
    FOREIGN KEY (memo_id) REFERENCES MEMO(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
  );
  CREATE TABLE IF NOT EXISTS drafts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    memo_id INTEGER,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    tags_text TEXT NOT NULL,
    base_updated_at TEXT,
    saved_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (memo_id) REFERENCES MEMO(id)
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_drafts_new ON drafts(user_id) WHERE memo_id IS NULL;
  CREATE UNIQUE INDEX IF NOT EXISTS idx_drafts_edit ON drafts(user_id, memo_id) WHERE memo_id IS NOT NULL;

  CREATE TABLE IF NOT EXISTS memo_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memo_id INTEGER NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('attachment', 'image')),
    original_name TEXT NOT NULL,
    stored_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    extension TEXT NOT NULL,
    size INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    deleted_at TEXT,
    FOREIGN KEY (memo_id) REFERENCES MEMO(id)
  );
`);

const columns = db.prepare("PRAGMA table_info(MEMO)").all().map((column) => column.name);
if (!columns.includes("owner_user_id")) db.prepare("ALTER TABLE MEMO ADD COLUMN owner_user_id INTEGER").run();
if (!columns.includes("deleted_at")) db.prepare("ALTER TABLE MEMO ADD COLUMN deleted_at TEXT").run();
const tagColumns = db.prepare("PRAGMA table_info(tags)").all().map((column) => column.name);
if (!tagColumns.includes("normalized_name")) db.prepare("ALTER TABLE tags ADD COLUMN normalized_name TEXT").run();
db.prepare("UPDATE tags SET normalized_name = LOWER(TRIM(name)) WHERE normalized_name IS NULL").run();
db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_normalized_name ON tags(normalized_name)").run();
const draftColumns = db.prepare("PRAGMA table_info(drafts)").all().map((column) => column.name);
if (!draftColumns.includes("base_updated_at")) db.prepare("ALTER TABLE drafts ADD COLUMN base_updated_at TEXT").run();

const seedAdmin = () => {
  const exists = db.prepare("SELECT id FROM users WHERE user_id = ?").get("admin");
  if (exists) return;
  const now = nowIso();
  db.prepare(`
    INSERT INTO users (user_id, display_name, email, password_hash, role, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run("admin", "管理者", "admin@example.com", hashPassword("password123"), "admin", "active", now, now);
};
seedAdmin();

const admin = db.prepare("SELECT id FROM users WHERE user_id = ?").get("admin");
if (admin) {
  db.prepare("UPDATE MEMO SET owner_user_id = ? WHERE owner_user_id IS NULL").run(admin.id);
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "80mb" }));

const getToken = (req) => {
  const auth = req.get("authorization") || "";
  if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return req.get("x-session-token") || "";
};

const getCurrentUser = (req) => {
  const token = getToken(req);
  if (!token) return null;
  const session = db.prepare(`
    SELECT users.id, users.user_id, users.display_name, users.email, users.role, users.status
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.id = ? AND sessions.expires_at > ? AND users.status = 'active'
  `).get(token, nowIso());
  return session || null;
};

const requireAuth = (req, res, next) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ message: messages.loginFailed });
  req.user = user;
  return next();
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: messages.accessDenied });
  return next();
};

const formatUser = (row) => ({
  id: row.id,
  userId: row.user_id,
  displayName: row.display_name,
  email: row.email,
  role: row.role,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const getMemoFiles = (memoId) => {
  const rows = db.prepare("SELECT id, file_type, original_name, mime_type, extension, size, created_at FROM memo_files WHERE memo_id = ? AND deleted_at IS NULL ORDER BY id").all(memoId);
  return {
    attachments: rows.filter((row) => row.file_type === "attachment").map(formatFile),
    images: rows.filter((row) => row.file_type === "image").map(formatFile),
  };
};

const formatTodo = (row, includeFiles = false) => ({
  id: row.id,
  title: row.title,
  body: row.body,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  isFavorite: Boolean(row.is_favorite),
  tags: row.tags ? row.tags.split(",").filter(Boolean) : [],
  ...(includeFiles ? getMemoFiles(row.id) : {}),
});

const formatDraft = (row, currentUpdatedAt = null) => ({
  id: row.id,
  memoId: row.memo_id,
  title: row.title,
  body: row.body,
  tagsText: row.tags_text,
  baseUpdatedAt: row.base_updated_at,
  currentUpdatedAt,
  isStale: Boolean(row.base_updated_at && currentUpdatedAt && row.base_updated_at !== currentUpdatedAt),
  savedAt: row.saved_at,
});

const validateTodo = ({ title, body }) => {
  const errors = {};
  if (typeof title !== "string" || title.trim().length === 0) errors.title = messages.titleRequired;
  else if (title.length > 100) errors.title = messages.titleLength;
  if (typeof body !== "string" || body.trim().length === 0) errors.body = messages.bodyRequired;
  else if (body.length > 2000) errors.body = messages.bodyLength;
  return errors;
};

const validateUser = (body, mode, currentId = null) => {
  const errors = {};
  const userId = normalizeUserId(body.userId);
  const displayName = String(body.displayName || "").trim();
  const email = String(body.email || "").trim();
  const password = String(body.password || "");
  const role = String(body.role || "");

  if (mode === "create") {
    if (!userId) errors.userId = messages.userIdRequired;
    else if (!/^[a-z0-9_-]+$/.test(userId)) errors.userId = messages.userIdFormat;
    else if (userId.length < 4 || userId.length > 20) errors.userId = messages.userIdLength;
  }

  if (!displayName) errors.displayName = messages.displayNameRequired;
  if (!email) errors.email = messages.emailRequired;
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = messages.emailFormat;
  if (mode === "create" && !password) errors.password = messages.passwordRequired;
  else if (password && (password.length < 8 || password.length > 64)) errors.password = messages.passwordLength;
  if (!["admin", "user"].includes(role)) errors.role = messages.roleRequired;

  if (mode === "create" && userId && !errors.userId) {
    const duplicate = db.prepare("SELECT id FROM users WHERE user_id = ?").get(userId);
    if (duplicate) errors.userId = messages.userIdDuplicate;
  }
  if (email && !errors.email) {
    const duplicate = db.prepare("SELECT id FROM users WHERE email = ? AND id <> ?").get(email, currentId || 0);
    if (duplicate) errors.email = messages.emailDuplicate;
  }

  return { errors, values: { userId, displayName, email, password, role } };
};


const attachmentExtensions = new Set(["pdf", "txt", "csv", "docx", "xlsx"]);
const imageExtensions = new Set(["jpg", "jpeg", "png", "gif", "webp"]);
const maxAttachmentSize = 10 * 1024 * 1024;
const maxImageSize = 5 * 1024 * 1024;

function formatFile(row) {
  return {
    id: row.id,
    fileType: row.file_type,
    originalName: row.original_name,
    mimeType: row.mime_type,
    extension: row.extension,
    size: row.size,
    createdAt: row.created_at,
    downloadUrl: "/api/files/" + row.id + "/download",
  };
}

const getExtension = (name) => {
  const parts = String(name || "").split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
};

const decodeUpload = (file) => {
  const base64 = String(file.content || "").includes(",") ? String(file.content).split(",").pop() : String(file.content || "");
  return Buffer.from(base64, "base64");
};

const validateUploadGroup = (incoming, existingCount, type) => {
  const files = Array.isArray(incoming) ? incoming : [];
  const errors = {};
  const isImage = type === "image";
  const limit = isImage ? 10 : 5;
  const maxSize = isImage ? maxImageSize : maxAttachmentSize;
  const allowed = isImage ? imageExtensions : attachmentExtensions;
  const countKey = isImage ? "images" : "attachments";
  if (existingCount + files.length > limit) errors[countKey] = isImage ? messages.imageCount : messages.attachmentCount;
  for (const file of files) {
    const extension = getExtension(file.name);
    const size = Number(file.size || 0);
    if (!extension || !allowed.has(extension)) errors[countKey] = isImage ? messages.imageExtension : messages.attachmentExtension;
    if (size > maxSize) errors[countKey] = isImage ? messages.imageSize : messages.attachmentSize;
  }
  return errors;
};

const saveUploads = (memoId, files, type) => {
  const rows = Array.isArray(files) ? files : [];
  const dir = type === "image" ? imageDir : attachmentDir;
  const insert = db.prepare("INSERT INTO memo_files (memo_id, file_type, original_name, stored_name, mime_type, extension, size, created_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)");
  for (const file of rows) {
    const extension = getExtension(file.name);
    const storedName = memoId + "-" + Date.now() + "-" + crypto.randomBytes(8).toString("hex") + "." + extension;
    const buffer = decodeUpload(file);
    fs.writeFileSync(path.join(dir, storedName), buffer);
    insert.run(memoId, type, String(file.name || "file"), storedName, String(file.type || "application/octet-stream"), extension, Number(file.size || buffer.length), nowIso());
  }
};

const countFiles = (memoId, type) => db.prepare("SELECT COUNT(*) AS count FROM memo_files WHERE memo_id = ? AND file_type = ? AND deleted_at IS NULL").get(memoId, type).count;

const parseTags = (input) => {
  const values = Array.isArray(input) ? input : String(input || "").split(",");
  const seen = new Set();
  const tags = [];
  for (const value of values) {
    const name = String(value || "").trim();
    if (!name) continue;
    const normalized = name.toLowerCase();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    tags.push({ name, normalized });
  }
  return tags;
};

const validateTags = (input) => {
  const tags = parseTags(input);
  const errors = {};
  if (tags.length > 10) errors.tags = messages.tagLimit;
  if (tags.some((tag) => tag.name.length > 30)) errors.tags = messages.tagNameLength;
  return { tags, errors };
};

const syncMemoTags = (memoId, tags) => {
  const insertTag = db.prepare("INSERT OR IGNORE INTO tags (name, normalized_name, created_at) VALUES (?, ?, ?)");
  const findTag = db.prepare("SELECT id FROM tags WHERE normalized_name = ?");
  const deleteLinks = db.prepare("DELETE FROM memo_tags WHERE memo_id = ?");
  const insertLink = db.prepare("INSERT OR IGNORE INTO memo_tags (memo_id, tag_id) VALUES (?, ?)");
  const tx = db.transaction(() => {
    deleteLinks.run(memoId);
    for (const tag of tags) {
      insertTag.run(tag.name, tag.normalized, nowIso());
      const row = findTag.get(tag.normalized);
      insertLink.run(memoId, row.id);
    }
  });
  tx();
};

const memoSelectSql = `
  SELECT m.id, m.owner_user_id, m.title, m.body, m.created_at, m.updated_at,
    CASE WHEN f.user_id IS NULL THEN 0 ELSE 1 END AS is_favorite,
    COALESCE(GROUP_CONCAT(t.name), '') AS tags
  FROM MEMO m
  LEFT JOIN favorites f ON f.memo_id = m.id AND f.user_id = @currentUserId
  LEFT JOIN memo_tags mt ON mt.memo_id = m.id
  LEFT JOIN tags t ON t.id = mt.tag_id
`;
const canAccessMemo = (user, memo) => user.role === "admin" || memo.owner_user_id === user.id;

app.post("/api/login", (req, res) => {
  const userId = normalizeUserId(req.body.userId);
  const password = String(req.body.password || "");
  const user = db.prepare("SELECT * FROM users WHERE user_id = ? AND status = 'active'").get(userId);
  if (!user || user.password_hash !== hashPassword(password)) {
    return res.status(401).json({ message: messages.loginFailed });
  }
  const token = crypto.randomBytes(32).toString("hex");
  const now = nowIso();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString();
  db.prepare("INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)").run(token, user.id, now, expires);
  return res.json({ token, user: formatUser(user) });
});

app.post("/api/logout", requireAuth, (req, res) => {
  db.prepare("DELETE FROM sessions WHERE id = ?").run(getToken(req));
  return res.status(204).send();
});

app.get("/api/me", requireAuth, (req, res) => res.json({ user: formatUser(req.user) }));

app.get("/api/users", requireAuth, requireAdmin, (req, res) => {
  const rows = db.prepare("SELECT id, user_id, display_name, email, role, status, created_at, updated_at FROM users ORDER BY id").all();
  res.json(rows.map(formatUser));
});

app.post("/api/users", requireAuth, requireAdmin, (req, res) => {
  const { errors, values } = validateUser(req.body, "create");
  if (Object.keys(errors).length > 0) return res.status(400).json({ errors });
  const now = nowIso();
  const result = db.prepare(`
    INSERT INTO users (user_id, display_name, email, password_hash, role, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'active', ?, ?)
  `).run(values.userId, values.displayName, values.email, hashPassword(values.password), values.role, now, now);
  const user = db.prepare("SELECT id, user_id, display_name, email, role, status, created_at, updated_at FROM users WHERE id = ?").get(result.lastInsertRowid);
  return res.status(201).json({ message: messages.userCreated, user: formatUser(user) });
});

app.put("/api/users/:id", requireAuth, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: "Invalid user id." });
  const existing = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ message: "指定されたユーザーは存在しません。" });
  const { errors, values } = validateUser(req.body, "edit", id);
  if (Object.keys(errors).length > 0) return res.status(400).json({ errors });
  const status = req.body.status === "disabled" ? "disabled" : "active";
  const now = nowIso();
  if (values.password) {
    db.prepare("UPDATE users SET display_name = ?, email = ?, role = ?, status = ?, password_hash = ?, updated_at = ? WHERE id = ?")
      .run(values.displayName, values.email, values.role, status, hashPassword(values.password), now, id);
  } else {
    db.prepare("UPDATE users SET display_name = ?, email = ?, role = ?, status = ?, updated_at = ? WHERE id = ?")
      .run(values.displayName, values.email, values.role, status, now, id);
  }
  if (status === "disabled") db.prepare("DELETE FROM sessions WHERE user_id = ?").run(id);
  const user = db.prepare("SELECT id, user_id, display_name, email, role, status, created_at, updated_at FROM users WHERE id = ?").get(id);
  return res.json({ message: messages.userUpdated, user: formatUser(user) });
});

app.patch("/api/users/:id/disable", requireAuth, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: "Invalid user id." });
  const target = db.prepare("SELECT id, role, status FROM users WHERE id = ?").get(id);
  if (!target) return res.status(404).json({ message: "指定されたユーザーは存在しません。" });
  if (target.role === "admin" && target.status === "active") {
    const activeAdmins = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'admin' AND status = 'active'").get().count;
    if (activeAdmins <= 1) return res.status(400).json({ message: "最後の管理者は無効化できません。" });
  }
  const now = nowIso();
  db.prepare("UPDATE users SET status = 'disabled', updated_at = ? WHERE id = ?").run(now, id);
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(id);
  return res.json({ message: messages.userDisabled });
});

const getAccessibleMemo = (user, memoId) => {
  const memo = db.prepare("SELECT id, owner_user_id, updated_at FROM MEMO WHERE id = ? AND deleted_at IS NULL").get(memoId);
  if (!memo || !canAccessMemo(user, memo)) return null;
  return memo;
};

const getDraftRow = (userId, memoId) => {
  if (memoId === null) return db.prepare("SELECT * FROM drafts WHERE user_id = ? AND memo_id IS NULL").get(userId);
  return db.prepare("SELECT * FROM drafts WHERE user_id = ? AND memo_id = ?").get(userId, memoId);
};

const deleteDraft = (userId, memoId) => {
  if (memoId === null) return db.prepare("DELETE FROM drafts WHERE user_id = ? AND memo_id IS NULL").run(userId);
  return db.prepare("DELETE FROM drafts WHERE user_id = ? AND memo_id = ?").run(userId, memoId);
};

app.get("/api/drafts/new", requireAuth, (req, res) => {
  const row = getDraftRow(req.user.id, null);
  return res.json({ draft: row ? formatDraft(row) : null });
});

app.get("/api/drafts/memos/:memoId", requireAuth, (req, res) => {
  const memoId = Number(req.params.memoId);
  if (!Number.isInteger(memoId) || memoId <= 0) return res.status(400).json({ message: "Invalid memo id." });
  const memo = getAccessibleMemo(req.user, memoId);
  if (!memo) return res.status(404).json({ message: messages.memoNotFound });
  const row = getDraftRow(req.user.id, memoId);
  return res.json({ draft: row ? formatDraft(row, memo.updated_at) : null });
});

app.post("/api/drafts", requireAuth, (req, res) => {
  const memoId = req.body.memoId === null || req.body.memoId === undefined ? null : Number(req.body.memoId);
  if (memoId !== null && (!Number.isInteger(memoId) || memoId <= 0)) return res.status(400).json({ message: "Invalid memo id." });
  let baseUpdatedAt = req.body.baseUpdatedAt || null;
  if (memoId !== null) {
    const memo = getAccessibleMemo(req.user, memoId);
    if (!memo) return res.status(404).json({ message: messages.memoNotFound });
    baseUpdatedAt = baseUpdatedAt || memo.updated_at;
  }
  const title = String(req.body.title || "");
  const body = String(req.body.body || "");
  const tagsText = String(req.body.tagsText || "");
  const savedAt = nowIso();
  if (memoId === null) {
    db.prepare(`
      INSERT INTO drafts (user_id, memo_id, title, body, tags_text, base_updated_at, saved_at)
      VALUES (?, NULL, ?, ?, ?, NULL, ?)
      ON CONFLICT(user_id) WHERE memo_id IS NULL DO UPDATE SET
        title = excluded.title,
        body = excluded.body,
        tags_text = excluded.tags_text,
        base_updated_at = NULL,
        saved_at = excluded.saved_at
    `).run(req.user.id, title, body, tagsText, savedAt);
  } else {
    db.prepare(`
      INSERT INTO drafts (user_id, memo_id, title, body, tags_text, base_updated_at, saved_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, memo_id) WHERE memo_id IS NOT NULL DO UPDATE SET
        title = excluded.title,
        body = excluded.body,
        tags_text = excluded.tags_text,
        base_updated_at = excluded.base_updated_at,
        saved_at = excluded.saved_at
    `).run(req.user.id, memoId, title, body, tagsText, baseUpdatedAt, savedAt);
  }
  const row = getDraftRow(req.user.id, memoId);
  return res.json({ message: messages.draftSaved, draft: formatDraft(row, memoId === null ? null : baseUpdatedAt) });
});

app.delete("/api/drafts/new", requireAuth, (req, res) => {
  deleteDraft(req.user.id, null);
  return res.json({ message: messages.draftDeleted });
});

app.delete("/api/drafts/memos/:memoId", requireAuth, (req, res) => {
  const memoId = Number(req.params.memoId);
  if (!Number.isInteger(memoId) || memoId <= 0) return res.status(400).json({ message: "Invalid memo id." });
  deleteDraft(req.user.id, memoId);
  return res.json({ message: messages.draftDeleted });
});
app.get("/api/tags", requireAuth, (req, res) => {
  const where = ["m.deleted_at IS NULL"];
  const params = {};
  if (req.user.role !== "admin") {
    where.push("m.owner_user_id = @userId");
    params.userId = req.user.id;
  }
  const rows = db.prepare(`
    SELECT DISTINCT t.id, t.name, t.normalized_name
    FROM tags t
    JOIN memo_tags mt ON mt.tag_id = t.id
    JOIN MEMO m ON m.id = mt.memo_id
    WHERE ${where.join(" AND ")}
    ORDER BY LOWER(t.name) ASC
  `).all(params);
  res.json(rows.map((row) => ({ id: row.id, name: row.name, normalizedName: row.normalized_name })));
});
app.get("/api/todos", requireAuth, (req, res) => {
  const keyword = String(req.query.keyword || "").trim().toLowerCase();
  const page = Math.max(Number.parseInt(req.query.page || "1", 10), 1);
  const requestedLimit = Number.parseInt(req.query.limit || "10", 10);
  const limit = [10, 25, 50].includes(requestedLimit) ? requestedLimit : 10;
  const sortMap = { createdAt: "m.created_at", updatedAt: "m.updated_at", title: "LOWER(m.title)" };
  const sortBy = sortMap[req.query.sortBy] ? req.query.sortBy : "updatedAt";
  const order = String(req.query.order || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
  const favoriteOnly = String(req.query.favorite || "false") === "true";
  const tag = String(req.query.tag || "").trim().toLowerCase();
  const where = ["m.deleted_at IS NULL"];
  const params = {};

  if (req.user.role !== "admin") {
    where.push("m.owner_user_id = @userId");
    params.userId = req.user.id;
  }
  if (keyword) {
    where.push("(LOWER(m.title) LIKE @keyword OR LOWER(m.body) LIKE @keyword)");
    params.keyword = `%${keyword}%`;
  }
  if (favoriteOnly) {
    where.push("f.user_id IS NOT NULL");
  }
  if (tag) {
    where.push("EXISTS (SELECT 1 FROM memo_tags mtf JOIN tags tf ON tf.id = mtf.tag_id WHERE mtf.memo_id = m.id AND tf.normalized_name = @tag)");
    params.tag = tag;
  }

  const whereSql = where.join(" AND ");
  const total = db.prepare(`
    SELECT COUNT(DISTINCT m.id) AS count
    FROM MEMO m
    LEFT JOIN favorites f ON f.memo_id = m.id AND f.user_id = @currentUserId
    WHERE ${whereSql}
  `).get({ ...params, currentUserId: req.user.id }).count;

  const rows = db.prepare(`
    ${memoSelectSql}
    WHERE ${whereSql}
    GROUP BY m.id
    ORDER BY ${sortMap[sortBy]} ${order}, m.id DESC
    LIMIT @limit OFFSET @offset
  `).all({ ...params, currentUserId: req.user.id, limit, offset: (page - 1) * limit });

  res.json({ items: rows.map(formatTodo), total, page, limit });
});

app.post("/api/todos", requireAuth, (req, res) => {
  const errors = validateTodo(req.body);
  const tagResult = validateTags(req.body.tags);
  Object.assign(errors, tagResult.errors);
  Object.assign(errors, validateUploadGroup(req.body.attachments, 0, "attachment"));
  Object.assign(errors, validateUploadGroup(req.body.images, 0, "image"));
  if (Object.keys(errors).length > 0) return res.status(400).json({ errors });
  const now = nowIso();
  const result = db.prepare(`
    INSERT INTO MEMO (owner_user_id, title, body, created_at, updated_at, deleted_at)
    VALUES (?, ?, ?, ?, ?, NULL)
  `).run(req.user.id, req.body.title, req.body.body, now, now);
  syncMemoTags(result.lastInsertRowid, tagResult.tags);
  saveUploads(result.lastInsertRowid, req.body.attachments, "attachment");
  saveUploads(result.lastInsertRowid, req.body.images, "image");
  deleteDraft(req.user.id, null);
  const row = db.prepare(`${memoSelectSql} WHERE m.id = @memoId GROUP BY m.id`).get({ currentUserId: req.user.id, memoId: result.lastInsertRowid });
  return res.status(201).json(formatTodo(row, true));
});

app.get("/api/todos/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: "Invalid todo id." });
  const row = db.prepare(`
    SELECT m.id, m.owner_user_id, m.title, m.body, m.created_at, m.updated_at,
      CASE WHEN f.user_id IS NULL THEN 0 ELSE 1 END AS is_favorite,
      COALESCE(GROUP_CONCAT(t.name), '') AS tags
    FROM MEMO m
    LEFT JOIN favorites f ON f.memo_id = m.id AND f.user_id = ?
    LEFT JOIN memo_tags mt ON mt.memo_id = m.id
    LEFT JOIN tags t ON t.id = mt.tag_id
    WHERE m.id = ? AND m.deleted_at IS NULL
    GROUP BY m.id
  `).get(req.user.id, id);
  if (!row || !canAccessMemo(req.user, row)) return res.status(404).json({ message: messages.memoNotFound });
  return res.json(formatTodo(row, true));
});

app.put("/api/todos/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: "Invalid todo id." });
  const existing = db.prepare("SELECT id, owner_user_id, updated_at FROM MEMO WHERE id = ? AND deleted_at IS NULL").get(id);
  if (!existing || !canAccessMemo(req.user, existing)) return res.status(404).json({ message: messages.memoNotFound });
  if (req.body.updatedAt && req.body.updatedAt !== existing.updated_at) return res.status(409).json({ message: messages.conflict });
  const errors = validateTodo(req.body);
  const tagResult = validateTags(req.body.tags);
  Object.assign(errors, tagResult.errors);
  Object.assign(errors, validateUploadGroup(req.body.attachments, countFiles(id, "attachment"), "attachment"));
  Object.assign(errors, validateUploadGroup(req.body.images, countFiles(id, "image"), "image"));
  if (Object.keys(errors).length > 0) return res.status(400).json({ errors });
  const now = nowIso();
  db.prepare("UPDATE MEMO SET title = ?, body = ?, updated_at = ? WHERE id = ?").run(req.body.title, req.body.body, now, id);
  syncMemoTags(id, tagResult.tags);
  saveUploads(id, req.body.attachments, "attachment");
  saveUploads(id, req.body.images, "image");
  deleteDraft(req.user.id, id);
  const row = db.prepare(`${memoSelectSql} WHERE m.id = @memoId GROUP BY m.id`).get({ currentUserId: req.user.id, memoId: id });
  return res.json(formatTodo(row, true));
});

app.delete("/api/todos/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: "Invalid todo id." });
  const existing = db.prepare("SELECT id, owner_user_id FROM MEMO WHERE id = ? AND deleted_at IS NULL").get(id);
  if (!existing || !canAccessMemo(req.user, existing)) return res.status(404).json({ message: messages.memoNotFound });
  db.prepare("UPDATE MEMO SET deleted_at = ?, updated_at = ? WHERE id = ?").run(nowIso(), nowIso(), id);
  return res.status(204).send();
});


app.delete("/api/files/:fileId", requireAuth, (req, res) => {
  const fileId = Number(req.params.fileId);
  if (!Number.isInteger(fileId) || fileId <= 0) return res.status(400).json({ message: "Invalid file id." });
  const file = db.prepare("SELECT mf.*, m.owner_user_id, m.deleted_at AS memo_deleted_at FROM memo_files mf JOIN MEMO m ON m.id = mf.memo_id WHERE mf.id = ? AND mf.deleted_at IS NULL").get(fileId);
  if (!file || file.memo_deleted_at || !canAccessMemo(req.user, file)) return res.status(404).json({ message: messages.fileNotFound });
  db.prepare("UPDATE memo_files SET deleted_at = ? WHERE id = ?").run(nowIso(), fileId);
  return res.json({ message: "ファイルを削除しました。" });
});

app.get("/api/files/:fileId/download", requireAuth, (req, res) => {
  const fileId = Number(req.params.fileId);
  if (!Number.isInteger(fileId) || fileId <= 0) return res.status(400).json({ message: "Invalid file id." });
  const file = db.prepare("SELECT mf.*, m.owner_user_id, m.deleted_at AS memo_deleted_at FROM memo_files mf JOIN MEMO m ON m.id = mf.memo_id WHERE mf.id = ? AND mf.deleted_at IS NULL").get(fileId);
  if (!file || file.memo_deleted_at || !canAccessMemo(req.user, file)) return res.status(404).json({ message: messages.fileNotFound });
  const dir = file.file_type === "image" ? imageDir : attachmentDir;
  const filePath = path.join(dir, file.stored_name);
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: messages.fileNotFound });
  res.setHeader("Content-Type", file.mime_type || "application/octet-stream");
  res.setHeader("Content-Disposition", "attachment; filename*=UTF-8''" + encodeURIComponent(file.original_name));
  return res.sendFile(filePath);
});

app.post("/api/todos/:id/favorite", requireAuth, (req, res) => {
  const memo = db.prepare("SELECT id, owner_user_id FROM MEMO WHERE id = ? AND deleted_at IS NULL").get(Number(req.params.id));
  if (!memo || !canAccessMemo(req.user, memo)) return res.status(404).json({ message: messages.memoNotFound });
  db.prepare("INSERT OR IGNORE INTO favorites (user_id, memo_id, created_at) VALUES (?, ?, ?)").run(req.user.id, memo.id, nowIso());
  return res.status(204).send();
});

app.delete("/api/todos/:id/favorite", requireAuth, (req, res) => {
  db.prepare("DELETE FROM favorites WHERE user_id = ? AND memo_id = ?").run(req.user.id, Number(req.params.id));
  return res.status(204).send();
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: messages.serverError });
});

app.listen(port, () => {
  console.log(`MemoPad API server running at http://localhost:${port}`);
});












