-- migrations/002_paypal.sql
-- 添加 PayPal 支付相关字段和表

-- 给 users 表添加 paypal_subscription_id 字段
ALTER TABLE users ADD COLUMN paypal_subscription_id TEXT;

-- 创建支付记录表
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  paypal_order_id TEXT UNIQUE,           -- 积分包: PayPal 订单 ID
  paypal_capture_id TEXT,               -- 积分包: 捕获 ID
  paypal_subscription_id TEXT,          -- 订阅: 订阅 ID
  user_id TEXT NOT NULL,                -- Google ID
  type TEXT NOT NULL CHECK(type IN ('credits', 'subscription')),
  plan TEXT,                            -- 订阅套餐名（pro/business）
  credits INTEGER DEFAULT 0,           -- 充值积分数
  amount_usd REAL DEFAULT 0,           -- 金额（USD）
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_paypal_subscription_id ON payments(paypal_subscription_id);
