create table if not exists scores (
  id text primary key,
  user_id text not null,
  score integer not null,
  stage integer not null,
  created_at timestamptz not null default now()
);
create index if not exists scores_user_id_idx on scores (user_id);
create index if not exists scores_score_idx on scores (score desc);
