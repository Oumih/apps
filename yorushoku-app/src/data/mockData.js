// モックデータ

export const store = {
  id: 1,
  name: 'Club Princess Time',
  address: '東京都新宿区歌舞伎町1-1-1',
  lat: 35.6938,
  lng: 139.7034,
  phone: '03-XXXX-XXXX',
  openTime: '20:00',
  closeTime: '05:00',
};

export const casts = [
  {
    id: 1,
    name: '蒼月 雪人',
    kana: 'そうつき せつと',
    rank: 'No.1',
    profile: '甘いマスクと落ち着いた話し方が人気。得意なお酒はウイスキー。',
    joinedAt: '2022-04-01',
    sales: {
      total: 8400000,
      monthly: [
        { month: '2024-01', amount: 650000 },
        { month: '2024-02', amount: 720000 },
        { month: '2024-03', amount: 810000 },
        { month: '2024-04', amount: 680000 },
        { month: '2024-05', amount: 750000 },
        { month: '2024-06', amount: 790000 },
      ],
    },
    himes: [
      { id: 1, name: '桜井 美月', visitCount: 42 },
      { id: 2, name: '中村 奈々', visitCount: 28 },
      { id: 3, name: '田中 葵', visitCount: 19 },
    ],
  },
  {
    id: 2,
    name: '紅葉 凌',
    kana: 'もみじ りょう',
    rank: 'No.2',
    profile: '関西出身。明るいキャラクターで場を盛り上げるのが得意。',
    joinedAt: '2022-09-15',
    sales: {
      total: 6200000,
      monthly: [
        { month: '2024-01', amount: 480000 },
        { month: '2024-02', amount: 520000 },
        { month: '2024-03', amount: 610000 },
        { month: '2024-04', amount: 540000 },
        { month: '2024-05', amount: 590000 },
        { month: '2024-06', amount: 460000 },
      ],
    },
    himes: [
      { id: 4, name: '鈴木 梨花', visitCount: 35 },
      { id: 5, name: '伊藤 結衣', visitCount: 22 },
    ],
  },
  {
    id: 3,
    name: '銀河 颯',
    kana: 'ぎんが はやて',
    rank: 'No.3',
    profile: '元バンドマン。音楽と酒の話なら何時間でも。クールな外見と熱い内面のギャップが魅力。',
    joinedAt: '2023-01-10',
    sales: {
      total: 4800000,
      monthly: [
        { month: '2024-01', amount: 380000 },
        { month: '2024-02', amount: 410000 },
        { month: '2024-03', amount: 450000 },
        { month: '2024-04', amount: 390000 },
        { month: '2024-05', amount: 420000 },
        { month: '2024-06', amount: 550000 },
      ],
    },
    himes: [
      { id: 6, name: '高橋 沙耶', visitCount: 18 },
    ],
  },
  {
    id: 4,
    name: '星空 蓮',
    kana: 'ほしぞら れん',
    rank: 'No.4',
    profile: '最年少ながら急成長中。笑顔が武器の新星キャスト。',
    joinedAt: '2023-06-01',
    sales: {
      total: 2900000,
      monthly: [
        { month: '2024-01', amount: 210000 },
        { month: '2024-02', amount: 250000 },
        { month: '2024-03', amount: 320000 },
        { month: '2024-04', amount: 290000 },
        { month: '2024-05', amount: 350000 },
        { month: '2024-06', amount: 480000 },
      ],
    },
    himes: [
      { id: 7, name: '山田 ひとみ', visitCount: 12 },
      { id: 8, name: '小林 真奈', visitCount: 9 },
    ],
  },
];

export const customers = [
  {
    id: 1,
    name: '桜井 美月',
    kana: 'さくらい みつき',
    since: '2022-05-10',
    favoriteCast: '蒼月 雪人',
    totalSpent: 3200000,
    visitCount: 42,
    memo: 'シャンパンが好き。誕生日は3月15日。',
  },
  {
    id: 2,
    name: '中村 奈々',
    kana: 'なかむら なな',
    since: '2022-07-22',
    favoriteCast: '蒼月 雪人',
    totalSpent: 2100000,
    visitCount: 28,
    memo: '毎週土曜来店。ワインが好き。',
  },
  {
    id: 3,
    name: '鈴木 梨花',
    kana: 'すずき りか',
    since: '2022-10-05',
    favoriteCast: '紅葉 凌',
    totalSpent: 1800000,
    visitCount: 35,
    memo: '',
  },
  {
    id: 4,
    name: '伊藤 結衣',
    kana: 'いとう ゆい',
    since: '2023-01-18',
    favoriteCast: '紅葉 凌',
    totalSpent: 1200000,
    visitCount: 22,
    memo: '大阪から月1で来店。',
  },
  {
    id: 5,
    name: '田中 葵',
    kana: 'たなか あおい',
    since: '2023-03-30',
    favoriteCast: '蒼月 雪人',
    totalSpent: 950000,
    visitCount: 19,
    memo: '',
  },
  {
    id: 6,
    name: '高橋 沙耶',
    kana: 'たかはし さや',
    since: '2023-08-14',
    favoriteCast: '銀河 颯',
    totalSpent: 720000,
    visitCount: 18,
    memo: 'ロックが好き。バンドの話で盛り上がる。',
  },
  {
    id: 7,
    name: '山田 ひとみ',
    kana: 'やまだ ひとみ',
    since: '2023-09-01',
    favoriteCast: '星空 蓮',
    totalSpent: 480000,
    visitCount: 12,
    memo: '',
  },
  {
    id: 8,
    name: '小林 真奈',
    kana: 'こばやし まな',
    since: '2024-01-20',
    favoriteCast: '星空 蓮',
    totalSpent: 280000,
    visitCount: 9,
    memo: '新規顧客。将来的なVIP候補。',
  },
];

// 売上データ（日別）
export const dailySales = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2024, 5, i + 1);
  const day = date.getDay();
  const isWeekend = day === 0 || day === 6;
  const base = isWeekend ? 1200000 : 600000;
  const variance = Math.floor(Math.random() * 400000) - 200000;
  return {
    date: `6/${i + 1}`,
    amount: Math.max(200000, base + variance),
  };
});

// 売上データ（月別）
export const monthlySales = [
  { month: '1月', amount: 8200000 },
  { month: '2月', amount: 7800000 },
  { month: '3月', amount: 9500000 },
  { month: '4月', amount: 8900000 },
  { month: '5月', amount: 10200000 },
  { month: '6月', amount: 9800000 },
  { month: '7月', amount: 11500000 },
  { month: '8月', amount: 12000000 },
  { month: '9月', amount: 10800000 },
  { month: '10月', amount: 9600000 },
  { month: '11月', amount: 11200000 },
  { month: '12月', amount: 14500000 },
];

// 売上データ（年別）
export const yearlySales = [
  { year: '2021', amount: 85000000 },
  { year: '2022', amount: 98000000 },
  { year: '2023', amount: 112000000 },
  { year: '2024', amount: 124000000 },
];
