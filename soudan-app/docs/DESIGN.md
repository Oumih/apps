# soudan-app 設計書

## Context
「ちょい相談マッチングアプリ」のMVP。Next.js (App Router) + Supabase構成。  
認証: メール/パスワード。実装範囲: 設計書のみ（コード生成なし）。

---

## 1. データベース設計（SQL）

### テーブル定義

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
```

### トリガー: サインアップ時にprofilesを自動作成

```sql
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
```

### RLSポリシー

```sql
alter table public.profiles    enable row level security;
alter table public.posts       enable row level security;
alter table public.participants enable row level security;
alter table public.comments    enable row level security;

-- profiles
create policy "profiles: public read"  on public.profiles for select using (true);
create policy "profiles: owner update" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- posts
create policy "posts: public read"          on public.posts for select using (true);
create policy "posts: authenticated insert" on public.posts for insert to authenticated
  with check (auth.uid() = user_id);
create policy "posts: owner delete"         on public.posts for delete to authenticated
  using (auth.uid() = user_id);

-- participants
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

-- comments（コアルール: 参加者のみ投稿可）
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

---

## 2. ディレクトリ構成

```
soudan-app/
├── docs/
│   └── DESIGN.md              # この設計書
├── middleware.ts              # ルートガード（未ログインを /login へリダイレクト）
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── package.json
├── .env.local                 # NEXT_PUBLIC_SUPABASE_URL / ANON_KEY
│
├── app/
│   ├── globals.css
│   ├── layout.tsx             # ルートレイアウト（AuthProviderでラップ）
│   ├── (auth)/                # 認証ページグループ（ナビなし）
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/                # 認証済みページグループ（ナビあり）
│   │   ├── layout.tsx         # Navbar + {children}
│   │   └── posts/
│   │       ├── page.tsx       # 投稿一覧（Server Component）
│   │       ├── new/page.tsx   # 投稿作成フォーム
│   │       └── [id]/page.tsx  # 投稿詳細（Server Component）
│   └── actions/               # Server Actions（'use server'）
│       ├── auth.ts
│       ├── posts.ts
│       ├── participants.ts
│       └── comments.ts
│
├── lib/
│   ├── supabase-browser.ts    # createBrowserClient（クライアント用）
│   └── supabase-server.ts     # createServerClient with cookies()（サーバー用）
│
├── contexts/
│   └── AuthContext.tsx        # セッション状態管理、useAuth() hook
│
├── components/
│   ├── Navbar.tsx
│   ├── PostCard.tsx
│   ├── PostList.tsx
│   ├── ParticipateButton.tsx
│   ├── CommentList.tsx
│   └── CommentForm.tsx
│
└── types/
    └── database.types.ts
```

**主要パッケージ**:
- `@supabase/supabase-js`
- `@supabase/ssr`（Next.js App RouterでのCookie管理に必須）

---

## 3. 認可: 参加者のみコメント可能（3層防御）

### 第1層: DBレベル（RLS） — 唯一の真の防衛線
`comments` テーブルのRLSポリシーが `participants` へのEXISTSサブクエリで確認。  
有効なJWTを持つ悪意のあるクライアントでもDBレベルで拒否される。

### 第2層: Server Action — 早期リジェクト
`createComment` Server Action内で参加確認してからINSERT。  
適切なエラーメッセージを返す。

```
呼び出し → getSession() → participants確認 → 未参加なら即 return error → 参加済みなら INSERT
```

### 第3層: UIレベル — UX向上
投稿詳細の Server Component で `isParticipant` を判定し、  
未参加者にはコメントフォーム自体を送信しない。

```
isParticipant === true  → <CommentForm> 表示
isParticipant === false → <ParticipateButton> or "満席です" 表示
```

---

## 4. 主要ページのデータフロー

### 投稿一覧 (`/posts`)
```typescript
const { data: posts } = await supabase
  .from('posts')
  .select(`
    id, title, tag, max_participants, created_at,
    profiles!posts_user_id_fkey ( display_name ),
    participants ( count ),
    comments ( count )
  `)
  .order('created_at', { ascending: false })

// 未回答優先ソート（コメント0件を上位に）
posts.sort((a, b) => {
  const aComments = a.comments[0]?.count ?? 0
  const bComments = b.comments[0]?.count ?? 0
  if (aComments === 0 && bComments > 0) return -1
  if (bComments === 0 && aComments > 0) return 1
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
})
```
タグフィルタは `?tag=恋愛` URLクエリパラメータで管理。

### 投稿詳細 (`/posts/[id]`)
```typescript
// 3クエリを Promise.all で並列実行
const [postResult, commentsResult, participationResult] = await Promise.all([
  supabase.from('posts').select(`*, profiles(...), participants(count)`).eq('id', id).single(),
  supabase.from('comments').select(`*, profiles(...)`).eq('post_id', id).order('created_at'),
  session
    ? supabase.from('participants').select('id').eq('post_id', id).eq('user_id', userId).maybeSingle()
    : Promise.resolve({ data: null })
])

const isFull = participantCount >= post.max_participants
const isParticipant = participation !== null
const isAuthor = session?.user.id === post.user_id
```

---

## 5. Supabaseクライアントパターン

### サーバー用（Server Components / Server Actions）
```typescript
// lib/supabase-server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) {
        try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) }
        catch {} // Server Componentからの呼び出しは無視
      },
    },
  })
}
```

### ブラウザ用（Client Components）
```typescript
// lib/supabase-browser.ts
import { createBrowserClient } from '@supabase/ssr'
export const supabase = createBrowserClient(url, anonKey)
```

---

## 実装順序

1. Supabaseプロジェクト作成 → SQLスキーマ実行 → RLS動作確認
2. `npx create-next-app@latest soudan-app --typescript --tailwind --app`
3. `npm install @supabase/supabase-js @supabase/ssr`
4. `.env.local` に URL と ANON_KEY を設定
5. `lib/` — Supabaseクライアント2種
6. `contexts/AuthContext.tsx` — セッション管理
7. 認証ページ（login / register）+ Server Actions
8. `middleware.ts` — ルートガード
9. `(main)/layout.tsx` + Navbar
10. 投稿一覧ページ + PostCard / PostList
11. 投稿作成ページ + createPost action
12. 投稿詳細ページ + ParticipateButton + joinPost action
13. CommentForm + createComment action

## 検証方法

1. Supabase SQLエディタでRLSポリシーを直接テスト
2. 未参加ユーザーが直接 `comments.insert` → 403 を確認
3. ブラウザで全フロー確認:
   - 登録 → ログイン → 投稿作成 → 別アカウントで参加 → コメント投稿
   - 未参加アカウントでコメント試みて拒否されることを確認
   - 満席後に参加できないことを確認
