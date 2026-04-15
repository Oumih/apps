import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kvsvhyxhvgzjxhzqaajc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2c3ZoeXhodmd6anhoenFhYWpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNzMyMDM5MSwiZXhwIjoxNzQ4ODU2MzkxfQ.XKkXEfV7JcU8CfVN0o9qJwXHu1PVvvLfBJ8dPLwZz_w';
const userId = '66361d3d-6f24-46b8-a027-60a7988e4164';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log('🌱 Seeding test data...\n');

  try {
    // 1. Store を作成
    console.log('📍 Creating store...');
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .insert({
        owner_id: userId,
        name: 'Club Princess Time',
        address: '東京都新宿区歌舞伎町1-1-1',
        lat: 35.6938,
        lng: 139.7034,
        phone: '03-XXXX-XXXX',
        open_time: '20:00',
        close_time: '05:00',
      })
      .select()
      .single();

    if (storeError) throw storeError;
    console.log('✅ Store created:', store.id);

    // 2. Profile を作成
    console.log('\n👤 Creating profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        store_id: store.id,
        role: 'owner',
        name: 'オーナー',
      });

    if (profileError) throw profileError;
    console.log('✅ Profile created');

    // 3. Casts を作成
    console.log('\n✨ Creating casts...');
    const castsData = [
      { name: '蒼月 雪人', kana: 'そうつき せつと', profile: '甘いマスクと落ち着いた話し方が人気。', joined_at: '2022-04-01' },
      { name: '紅葉 凌', kana: 'もみじ りょう', profile: '関西出身。明るいキャラクターが人気。', joined_at: '2022-09-15' },
      { name: '銀河 颯', kana: 'ぎんが はやて', profile: '元バンドマン。音楽の話なら何時間でも。', joined_at: '2023-01-10' },
      { name: '星空 蓮', kana: 'ほしぞら れん', profile: '最年少ながら急成長中の新星キャスト。', joined_at: '2023-06-01' },
    ];

    const { data: casts, error: castsError } = await supabase
      .from('casts')
      .insert(
        castsData.map((c) => ({
          store_id: store.id,
          name: c.name,
          kana: c.kana,
          profile: c.profile,
          joined_at: c.joined_at,
          is_active: true,
        }))
      )
      .select();

    if (castsError) throw castsError;
    console.log('✅ Created', casts.length, 'casts');

    // 4. Sales を作成
    console.log('\n💴 Creating sales data...');
    const salesData = [];
    const today = new Date();

    // 過去3日分のデータを作成
    for (let daysAgo = 2; daysAgo >= 0; daysAgo--) {
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);
      const dateStr = date.toISOString().split('T')[0];

      // 各キャストに複数の売上を追加
      casts.forEach((cast, idx) => {
        const baseAmount = [380000, 240000, 180000, 120000][idx];
        const variance = Math.floor(Math.random() * 100000) - 50000;
        const amount = Math.max(50000, baseAmount + variance);

        salesData.push({
          store_id: store.id,
          cast_id: cast.id,
          amount,
          date: dateStr,
          note: daysAgo === 0 ? 'テスト売上' : null,
        });
      });
    }

    const { error: salesError } = await supabase
      .from('sales')
      .insert(salesData);

    if (salesError) throw salesError;
    console.log('✅ Created', salesData.length, 'sales records');

    console.log('\n🎉 Seeding complete!\n');
    console.log('📊 Data summary:');
    console.log('  - Store ID:', store.id);
    console.log('  - Casts:', casts.length);
    console.log('  - Sales records:', salesData.length);
    console.log('\n✨ You can now log in and see the data in the app!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seed();
