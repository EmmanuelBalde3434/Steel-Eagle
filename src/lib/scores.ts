import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";

export const submitScore = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { score: number; stage: number }) => ({
    score: Math.max(0, Math.min(9_999_999, Math.floor(data.score))),
    stage: Math.max(1, Math.min(99, Math.floor(data.stage))),
  }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into scores (id, user_id, score, stage)
      values (${crypto.randomUUID()}, ${context.userId}, ${data.score}, ${data.stage})
    `;
    return { ok: true as const };
  });

export const listTopScores = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql<{ name: string; score: number; stage: number }>`
    select coalesce(u."name", 'Comandante') as name, s.score, s.stage
    from scores s
    left join "user" u on u.id = s.user_id
    order by s.score desc
    limit 8
  `;
});
