-- ============================================================
-- Princess Time - DB Schema
-- ============================================================


-- ============================================================
-- 1. stores（店舗）
-- ============================================================
CREATE TABLE stores (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  name       TEXT NOT NULL,
  address    TEXT,
  lat        FLOAT8,
  lng        FLOAT8,
  phone      TEXT,
  open_time  TIME,
  close_time TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stores_owner_id ON stores(owner_id);


-- ============================================================
-- 2. profiles（ユーザーのロール・所属店舗）
-- ============================================================
CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id   UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('owner', 'admin')),
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_store_id ON profiles(store_id);


-- ============================================================
-- 3. casts（キャスト）
-- ============================================================
CREATE TABLE casts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id   UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  kana       TEXT,
  profile    TEXT,
  joined_at  DATE,
  is_active  BOOL NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_casts_store_id ON casts(store_id);


-- ============================================================
-- 4. sales（売上記録）
-- ============================================================
CREATE TABLE sales (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id   UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  cast_id    UUID NOT NULL REFERENCES casts(id) ON DELETE CASCADE,
  amount     INT NOT NULL CHECK (amount >= 0),
  date       DATE NOT NULL DEFAULT CURRENT_DATE,
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sales_store_id ON sales(store_id);
CREATE INDEX idx_sales_cast_id  ON sales(cast_id);
CREATE INDEX idx_sales_date     ON sales(date);


-- ============================================================
-- 5. RLS（Row Level Security）ポリシー
-- ============================================================

ALTER TABLE stores   ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE casts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales    ENABLE ROW LEVEL SECURITY;

-- ログインユーザーの store_id を返すヘルパー関数
CREATE OR REPLACE FUNCTION my_store_id()
RETURNS UUID AS $$
  SELECT store_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- ログインユーザーの role を返すヘルパー関数
CREATE OR REPLACE FUNCTION my_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;


-- stores: オーナーのみ操作可能
CREATE POLICY "stores: owner only" ON stores
  FOR ALL USING (owner_id = auth.uid());

-- profiles: 自分のレコードのみ参照可能
CREATE POLICY "profiles: own record only" ON profiles
  FOR ALL USING (id = auth.uid());

-- casts: 自分の店舗のキャストのみ操作可能
CREATE POLICY "casts: own store only" ON casts
  FOR ALL USING (store_id = my_store_id());

-- sales: 読みは全ロール可、書き込みは owner/admin のみ
CREATE POLICY "sales: read own store" ON sales
  FOR SELECT USING (store_id = my_store_id());

CREATE POLICY "sales: write owner and admin" ON sales
  FOR INSERT WITH CHECK (
    store_id = my_store_id()
    AND my_role() IN ('owner', 'admin')
  );

CREATE POLICY "sales: update owner and admin" ON sales
  FOR UPDATE USING (
    store_id = my_store_id()
    AND my_role() IN ('owner', 'admin')
  );

CREATE POLICY "sales: delete owner and admin" ON sales
  FOR DELETE USING (
    store_id = my_store_id()
    AND my_role() IN ('owner', 'admin')
  );
