# Supabase セットアップガイド

## ステップ1: Supabase プロジェクト作成

1. [supabase.com](https://supabase.com) にアクセス
2. Sign In / Sign Up
3. 新規プロジェクト作成
   - Organization を選択（なければ作成）
   - Project name: `soudan-app`
   - Database password: 強力なパスワードを設定
   - Region: `Tokyo` を選択
4. プロジェクトが作成されるまで待機（3-5分）

## ステップ2: SQL スキーマ実行

Supabase ダッシュボードで以下を実行：

1. 左メニューの **SQL Editor** をクリック
2. 新規クエリを作成
3. 以下の SQL をすべてコピーして実行

```sql
-- プロフィール（auth.usersと1:1）
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at   timestamptz not null default now()
);

-- タグのenum型
create type public.post_tag as enum ('恋愛', '仕事', 'メンタル', 'その他');

-- 相談投稿
create table public.posts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  title            text not null check (char_length(title) between 1 and 100),
  content          text,
  tag              public.post_tag not null,
  max_participants int  not null check (max_participants in (1, 3, 5)),
  created_at       timestamptz not null default now()
);

-- 参加者（post ↔ user の中間テーブル）
create table public.participants (
  id        uuid primary key default gen_random_uuid(),
  post_id   uuid not null references public.posts(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  constraint participants_post_user_unique unique (post_id, user_id)
);

-- コメント
create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  content    text not null check (char_length(content) between 1 and 1000),
  created_at timestamptz not null default now()
);

-- インデックス（FKは自動作成されないため手動で）
create index idx_posts_user_id        on public.posts(user_id);
create index idx_posts_tag            on public.posts(tag);
create index idx_posts_created_at     on public.posts(created_at desc);
create index idx_participants_post_id on public.participants(post_id);
create index idx_participants_user_id on public.participants(user_id);
create index idx_comments_post_id     on public.comments(post_id);
create index idx_comments_created_at  on public.comments(created_at asc);

-- トリガー: サインアップ時にprofilesを自動作成
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLSを有効化
alter table public.profiles    enable row level security;
alter table public.posts       enable row level security;
alter table public.participants enable row level security;
alter table public.comments    enable row level security;

-- profiles ポリシー
create policy "profiles: public read"  on public.profiles for select using (true);
create policy "profiles: owner update" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- posts ポリシー
create policy "posts: public read"          on public.posts for select using (true);
create policy "posts: authenticated insert" on public.posts for insert to authenticated
  with check (auth.uid() = user_id);
create policy "posts: owner delete"         on public.posts for delete to authenticated
  using (auth.uid() = user_id);

-- participants ポリシー
create policy "participants: public read" on public.participants for select using (true);
create policy "participants: join"        on public.participants for insert to authenticated
  with check (
    auth.uid() = user_id
    and (select user_id from public.posts p where p.id = post_id) <> auth.uid()
    and (select count(*) from public.participants e where e.post_id = participants.post_id)
        < (select max_participants from public.posts p where p.id = post_id)
  );
create policy "participants: self delete" on public.participants for delete to authenticated
  using (auth.uid() = user_id);

-- comments ポリシー（コアルール: 参加者のみ投稿可）
create policy "comments: public read"              on public.comments for select using (true);
create policy "comments: participants only insert" on public.comments for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.participants p
      where p.post_id = comments.post_id and p.user_id = auth.uid()
    )
  );
```

## ステップ3: 認証設定

1. 左メニューの **Authentication** → **Providers** をクリック
2. Email がデフォルトで有効（確認）
3. 特に変更不要（デフォルト設定で OK）

## ステップ4: 環境変数取得

1. 左メニューの **Project Settings** → **API** をクリック
2. 以下をコピー：
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` キー → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## ステップ5: Next.js に設定

soudan-app ディレクトリで `.env.local` ファイルを作成：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

（値は Step4 でコピーしたものに置き換え）

## ステップ6: 動作確認

```bash
cd /Users/hmush/apps/soudan-app
npm run dev
```

ブラウザで http://localhost:3000 を開いて以下を確認：

1. 自動的に `/login` にリダイレクト
2. **Register** から新規アカウント作成
3. 登録完了後 `/posts` に移動
4. **+ 新しい相談** で投稿作成
5. 別のアカウントで参加してコメント投稿

すべて動作すれば完成です！
