-- migrations/003_history.sql
-- 添加图片处理历史记录表

CREATE TABLE IF NOT EXISTS history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,                       -- Google ID
  r2_key TEXT NOT NULL,                        -- R2 对象 key
  original_filename TEXT,                      -- 原始文件名
  file_size INTEGER,                           -- 原始文件大小（字节）
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_history_user_id ON history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON history(created_at);
