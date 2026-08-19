import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { r as getSql } from "./db-pSBplLb4.mjs";
import { t as authMiddleware } from "./middleware-Dlwe3HMV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/scores-3rxUH38U.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var submitScore_createServerFn_handler = createServerRpc({
	id: "4acb619768901da9f9c8c18040dfcf74cbb036b3c33bbc3d17e69fbee1085fc8",
	name: "submitScore",
	filename: "src/lib/scores.ts"
}, (opts) => submitScore.__executeServer(opts));
var submitScore = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => ({
	score: Math.max(0, Math.min(9999999, Math.floor(data.score))),
	stage: Math.max(1, Math.min(99, Math.floor(data.stage)))
})).handler(submitScore_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`
      insert into scores (id, user_id, score, stage)
      values (${crypto.randomUUID()}, ${context.userId}, ${data.score}, ${data.stage})
    `;
	return { ok: true };
});
var listTopScores_createServerFn_handler = createServerRpc({
	id: "60ee5fa860848cdde9f3f1cd8fb56f89eff113c8b124c51b8c043a2776ff05a5",
	name: "listTopScores",
	filename: "src/lib/scores.ts"
}, (opts) => listTopScores.__executeServer(opts));
var listTopScores = createServerFn({ method: "GET" }).handler(listTopScores_createServerFn_handler, async () => {
	return (await getSql())`
    select coalesce(u."name", 'Comandante') as name, s.score, s.stage
    from scores s
    left join "user" u on u.id = s.user_id
    order by s.score desc
    limit 8
  `;
});
//#endregion
export { listTopScores_createServerFn_handler, submitScore_createServerFn_handler };
