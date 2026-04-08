// functions/_lib/credits.js
// 用量控制核心逻辑：计划额度、用量检查、扣减、重置

// 各计划月度额度上限
export const PLAN_LIMITS = {
  free: 5,
  pro: 30,
  business: 100,
};

// 积分包额度（bonus credits，永不过期）
// 购买后直接写入 credits_bonus 字段

/**
 * 获取用户当月已用 + 剩余额度
 */
export async function getUserCredits(db, userId) {
  const user = await db
    .prepare(
      `SELECT plan, credits_used, credits_bonus, credits_reset_at FROM users WHERE google_id = ?`
    )
    .bind(userId)
    .first();

  if (!user) return null;

  const limit = PLAN_LIMITS[user.plan] ?? PLAN_LIMITS.free;
  const now = new Date();

  // 检查是否需要重置（每月1日）
  let creditsUsed = user.credits_used ?? 0;
  const resetAt = user.credits_reset_at ? new Date(user.credits_reset_at) : null;

  if (!resetAt || now >= resetAt) {
    // 重置月度用量，下次重置时间为下月1日
    const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    await db
      .prepare(
        `UPDATE users SET credits_used = 0, credits_reset_at = ? WHERE google_id = ?`
      )
      .bind(nextReset.toISOString(), userId)
      .run();
    creditsUsed = 0;
  }

  const bonusCredits = user.credits_bonus ?? 0;
  const monthlyRemaining = Math.max(0, limit - creditsUsed);
  const totalRemaining = monthlyRemaining + bonusCredits;

  return {
    plan: user.plan ?? "free",
    limit,
    used: creditsUsed,
    monthlyRemaining,
    bonusCredits,
    totalRemaining,
    canUse: totalRemaining > 0,
  };
}

/**
 * 扣减一次用量（优先扣月度，月度用完扣积分包）
 */
export async function consumeCredit(db, userId) {
  const credits = await getUserCredits(db, userId);
  if (!credits || !credits.canUse) return false;

  if (credits.monthlyRemaining > 0) {
    // 扣月度额度
    await db
      .prepare(`UPDATE users SET credits_used = credits_used + 1 WHERE google_id = ?`)
      .bind(userId)
      .run();
  } else {
    // 月度用完，扣积分包
    await db
      .prepare(
        `UPDATE users SET credits_bonus = credits_bonus - 1 WHERE google_id = ? AND credits_bonus > 0`
      )
      .bind(userId)
      .run();
  }

  return true;
}

/**
 * 访客 IP 限流（KV）：1次/月
 */
export const GUEST_MONTHLY_LIMIT = 1;

export async function checkGuestRateLimit(kv, ip) {
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM
  const key = `guest:${ip}:${month}`;

  const raw = await kv.get(key);
  const count = raw ? parseInt(raw) : 0;

  if (count >= GUEST_MONTHLY_LIMIT) {
    return { allowed: false, used: count, remaining: 0 };
  }

  // TTL 到下月1日
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const ttlSeconds = Math.floor((nextMonth - now) / 1000);

  await kv.put(key, String(count + 1), { expirationTtl: ttlSeconds });

  return { allowed: true, used: count + 1, remaining: GUEST_MONTHLY_LIMIT - count - 1 };
}
