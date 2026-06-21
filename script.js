const form = document.querySelector('#tripForm');
const result = document.querySelector('#result');
const adultCount = document.querySelector('#adultCount');
const childCount = document.querySelector('#childCount');
const adultCustomWrap = document.querySelector('#adultCustomWrap');
const childCustomWrap = document.querySelector('#childCustomWrap');
const adultCustom = document.querySelector('#adultCustom');
const childCustom = document.querySelector('#childCustom');
const childAges = document.querySelector('#childAges');
const ageInputs = document.querySelector('#ageInputs');

const childAgeOptions = Array.from({ length: 13 }, (_, index) => `${index}歳`).concat('13歳以上');
const maxVisibleAgeFields = 12;
const officialNotice = '営業時間、休館日、料金、予約可否は公式サイトで確認してください。';

const durations = {
  daytrip: { label: '日帰り', days: 1, nights: 0 },
  '1night': { label: '1泊2日', days: 2, nights: 1 },
  '2nights': { label: '2泊3日', days: 3, nights: 2 },
  '3nights': { label: '3泊4日', days: 4, nights: 3 },
  longer: { label: 'それ以上', days: 5, nights: 4 }
};

const transports = {
  car: '車',
  train: '電車',
  shinkansen: '新幹線',
  flight: '飛行機',
  bus: 'バス',
  'walk-bike': '徒歩・自転車',
  other: 'その他'
};

const travelTimes = {
  '30m': { label: '30分以内', minutes: 30 },
  '1h': { label: '1時間以内', minutes: 60 },
  '2h': { label: '2時間以内', minutes: 120 },
  '3h': { label: '3時間以内', minutes: 180 },
  '4h': { label: '4時間以内', minutes: 240 },
  '4hplus': { label: '4時間以上も可', minutes: 999 }
};

const budgets = {
  under20: '2万円未満',
  under40: '2〜4万円',
  under60: '4〜6万円',
  under80: '6〜8万円',
  under100: '8〜10万円',
  '100to150': '10〜15万円',
  '150to200': '15〜20万円',
  over200: '20万円以上'
};

const budgetAdvice = {
  under20: '低予算なので、日帰り、道の駅、公園、公共施設、短い移動を優先します。',
  under40: '低予算寄りなので、入場料を抑えやすい公園や市場、フードコートを組み込みます。',
  under60: '標準予算として、体験、食事、休憩のバランスを取りやすい候補を選びます。',
  under80: '標準予算として、子連れ歓迎の宿や温泉、ゆったりした食事を入れやすい候補を選びます。',
  under100: '宿と食事の選択肢を少し広げ、移動の負担が少ない旅程にします。',
  '100to150': '宿重視、食事重視、温泉旅館寄りの候補を強めに評価します。',
  '150to200': '料理重視の宿、貸切風呂、部屋食・個室食などを含めやすい候補を優先します。',
  over200: '移動の快適さ、宿の滞在時間、食事内容まで余裕を持って組める候補を優先します。'
};

const suggestionModes = {
  shorter: {
    label: '近場で再提案',
    tone: '移動時間を短めにし、休憩と立ち寄りやすさを重視して再提案しました。',
    emphasis: ['近い', '休憩', '日帰り', '道の駅']
  },
  nature: {
    label: '自然多め',
    tone: '公園、海、湖、高原、牧場など、外で過ごしやすい時間を増やしました。',
    emphasis: ['自然', '公園', '海', '高原', '牧場']
  },
  onsen: {
    label: '温泉宿重視',
    tone: '温泉、料理、宿で休む時間を厚めにした候補へ寄せました。',
    emphasis: ['温泉', '高級旅館', '料理旅館', '宿重視', 'のんびり']
  },
  rainy: {
    label: '雨の日向け',
    tone: '水族館、屋内施設、市場、宿滞在など、天気に左右されにくい候補を優先しました。',
    emphasis: ['雨', '屋内', '水族館', '市場', '博物館']
  }
};

const purposeSignalWords = {
  sea: ['海', '海辺', '海沿い', '海水浴', 'オーシャン', 'ビーチ'],
  seafood: ['海鮮', '魚', '寿司', '鮨', 'カニ', '蟹', '地魚', '浜焼き', '市場'],
  luxury: ['高級', '高級旅館', '料理旅館', '部屋食', '個室食', '宿重視', '贅沢'],
  onsen: ['温泉', '露天', '貸切風呂', '家族風呂', 'のんびり', 'ゆっくり'],
  nature: ['自然', '公園', '高原', '山', '川', '湖', '牧場', '散策'],
  kids: ['子ども', '子供', 'こども', '遊べる', '動物', '乗り物', '体験', '水族館'],
  rainy: ['雨', '屋内', '博物館', '水族館', '科学館']
};

const destinationCatalog = [
  {
    id: 'kyotango-taiza',
    areaName: '京丹後・間人方面',
    departureCategoryLabel: '関西・大阪・高槻・上牧・京都発',
    departureCategories: ['kansai'],
    estimatedMinutes: { kansai: 180, niigata: 520, generic: 210 },
    durations: ['1night', '2nights', '3nights'],
    transports: ['car', 'train'],
    purposeKeywords: ['海', '海鮮', '温泉', '高級旅館', '料理旅館', '自然', 'カニ', '地魚', 'のんびり'],
    childFriendlyPoints: ['道の駅で休憩しやすい', '海沿い散策を短時間に区切れる', '宿の滞在時間を長く取りやすい'],
    rainyFriendly: true,
    onsen: true,
    nature: true,
    seafood: true,
    lodgeFocus: true,
    spots: ['立岩周辺', '道の駅てんきてんき丹後', '丹後王国「食のみやこ」', '琴引浜周辺', '天橋立方面'],
    meals: ['海鮮ランチ', 'カニ・地魚料理', '旅館の会席', '道の駅の軽食'],
    lodging: {
      high: ['海沿いの温泉旅館', '部屋食または個室食がある料理旅館', '貸切風呂や家族風呂がある宿'],
      standard: ['温泉宿', '和洋室のある宿', '駐車場つき旅館'],
      low: ['公共の宿', '日帰り温泉と近隣ホテルの組み合わせ']
    },
    rainyAlternatives: ['丹後王国「食のみやこ」の屋内休憩', '天橋立方面の屋内施設', '宿の温泉時間を長めにする'],
    cautions: ['冬の日本海側は天候と道路状況に余裕を持つ', '海沿い散策は風が強い日を避ける'],
    concept: '日本海の地魚と温泉旅館を軸に、海沿いをゆっくり味わう宿重視プラン。',
    theme: 'sea-ryokan',
    areaGroup: 'kansai-north-sea',
    childFocus: ['preschool', 'school'],
    budgetFit: ['standard', 'high']
  },
  {
    id: 'awaji-sumoto',
    areaName: '淡路島・洲本方面',
    departureCategoryLabel: '関西・大阪・高槻・上牧・京都発',
    departureCategories: ['kansai'],
    estimatedMinutes: { kansai: 120, niigata: 560, generic: 150 },
    durations: ['daytrip', '1night', '2nights'],
    transports: ['car', 'bus'],
    purposeKeywords: ['海', '自然', '公園', '牧場', '子どもが遊べる', '海鮮', '温泉', 'ドライブ'],
    childFriendlyPoints: ['淡路サービスエリアで早めに休憩できる', '公園や牧場を短時間で回れる', 'フードコートや道の駅を使いやすい'],
    rainyFriendly: true,
    onsen: true,
    nature: true,
    seafood: true,
    lodgeFocus: true,
    spots: ['淡路サービスエリア', '国営明石海峡公園', '淡路島牧場', '道の駅あわじ', '洲本温泉'],
    meals: ['しらす丼', '淡路牛', '玉ねぎ料理', '海鮮ランチ', 'サービスエリアのフードコート'],
    lodging: {
      high: ['洲本温泉の海沿い旅館', '部屋食または個室食がある温泉宿', 'オーシャンビューのホテル'],
      standard: ['子連れ歓迎のホテル', '和洋室のある温泉宿', '駐車場つきホテル'],
      low: ['日帰り温泉', '公共の宿', 'サービスエリアと公園中心の日帰り']
    },
    rainyAlternatives: ['屋内体験施設', '道の駅や産直市場', 'ホテル内の温泉やキッズスペース'],
    cautions: ['連休は明石海峡大橋周辺が混みやすい', '屋外中心の日は暑さと風対策を用意する'],
    concept: '移動しやすさと海、公園、牧場を組み合わせる子連れ向きプラン。',
    theme: 'island-park',
    areaGroup: 'kansai-island',
    childFocus: ['toddler', 'preschool', 'school'],
    budgetFit: ['low', 'standard', 'high']
  },
  {
    id: 'kinosaki-kasumi',
    areaName: '城崎温泉・香住方面',
    departureCategoryLabel: '関西・大阪・高槻・上牧・京都発',
    departureCategories: ['kansai'],
    estimatedMinutes: { kansai: 190, niigata: 500, generic: 230 },
    durations: ['1night', '2nights', '3nights'],
    transports: ['car', 'train'],
    purposeKeywords: ['温泉', '海鮮', 'カニ', '地魚', '高級旅館', '水族館', 'のんびり'],
    childFriendlyPoints: ['城崎マリンワールドを旅程に入れやすい', '温泉街散策を短く区切れる', '宿で休む時間を長めに取れる'],
    rainyFriendly: true,
    onsen: true,
    nature: true,
    seafood: true,
    lodgeFocus: true,
    spots: ['城崎温泉街', '城崎マリンワールド', '玄武洞公園', '香住海岸', '道の駅あまるべ'],
    meals: ['カニ・地魚料理', '海鮮ランチ', '温泉旅館の会席', '駅前の食堂'],
    lodging: {
      high: ['城崎温泉の料理旅館', '個室食のある温泉宿', '貸切風呂つき旅館'],
      standard: ['温泉宿', '和洋室のある旅館', '駅や温泉街に近い宿'],
      low: ['素泊まり宿と外食', '公共の宿', '日帰り温泉を組み合わせた近隣ホテル']
    },
    rainyAlternatives: ['城崎マリンワールド中心にする', '温泉街の屋内休憩を多めにする', '宿のチェックインを早める'],
    cautions: ['冬は道路状況と積雪情報を確認する', '温泉街はベビーカーより抱っこひもの方が動きやすい場所がある'],
    concept: '温泉街、海鮮、屋内水族館を組み合わせる料理と宿の満足度重視プラン。',
    theme: 'onsen-seafood',
    areaGroup: 'kansai-north-sea',
    childFocus: ['preschool', 'school'],
    budgetFit: ['standard', 'high']
  },
  {
    id: 'ise-shima-toba',
    areaName: '伊勢志摩・鳥羽方面',
    departureCategoryLabel: '関西・大阪・高槻・上牧・京都発',
    departureCategories: ['kansai'],
    estimatedMinutes: { kansai: 170, niigata: 560, generic: 210 },
    durations: ['1night', '2nights', '3nights'],
    transports: ['car', 'train'],
    purposeKeywords: ['海', '海鮮', '水族館', '温泉', '高級旅館', 'おかげ横丁', '子どもが遊べる'],
    childFriendlyPoints: ['鳥羽水族館や伊勢シーパラダイスで天気に左右されにくい', '食事処が多く昼食を調整しやすい', '短い散策と屋内施設を組み合わせやすい'],
    rainyFriendly: true,
    onsen: true,
    nature: true,
    seafood: true,
    lodgeFocus: true,
    spots: ['鳥羽水族館', '伊勢シーパラダイス', 'おかげ横丁', '志摩スペイン村', '賢島周辺'],
    meals: ['伊勢うどん', 'てこね寿司', '鳥羽周辺の海鮮食堂', '子どもメニューがありそうな食堂'],
    lodging: {
      high: ['志摩の温泉宿', '海を望む料理旅館', '部屋食または個室食がある宿'],
      standard: ['鳥羽・志摩の子連れ歓迎ホテル', '和洋室のある温泉宿', '駐車場つきホテル'],
      low: ['ビジネスホテル', '公共の宿', '水族館中心の日帰り寄り旅程']
    },
    rainyAlternatives: ['鳥羽水族館を長めにする', '伊勢シーパラダイス中心にする', 'おかげ横丁の屋根つき店舗を短く回る'],
    cautions: ['伊勢神宮周辺は混雑日を避けると子連れで歩きやすい', '水族館は昼食時間をずらすと動きやすい'],
    concept: '水族館、海鮮、温泉宿を具体的に組める、雨の日にも強い海の旅。',
    theme: 'aquarium-sea',
    areaGroup: 'kansai-mie-sea',
    childFocus: ['toddler', 'preschool', 'school'],
    budgetFit: ['standard', 'high']
  },
  {
    id: 'shirahama-nanki',
    areaName: '白浜・南紀方面',
    departureCategoryLabel: '関西・大阪・高槻・上牧・京都発',
    departureCategories: ['kansai'],
    estimatedMinutes: { kansai: 190, niigata: 600, generic: 230 },
    durations: ['1night', '2nights', '3nights'],
    transports: ['car', 'train'],
    purposeKeywords: ['海', '温泉', '動物', '水族館', '海鮮', '子どもが遊べる', '自然'],
    childFriendlyPoints: ['アドベンチャーワールドをメインにできる', '白良浜の散策を短時間にしやすい', '市場やホテルで休憩しやすい'],
    rainyFriendly: true,
    onsen: true,
    nature: true,
    seafood: true,
    lodgeFocus: true,
    spots: ['アドベンチャーワールド', '白良浜', 'とれとれ市場', '千畳敷', '円月島'],
    meals: ['とれとれ市場の海鮮', '和歌山ラーメン', 'ホテルのビュッフェ', 'テイクアウトの軽食'],
    lodging: {
      high: ['白浜温泉の海沿い旅館', '露天風呂つき客室のある宿', '料理重視の温泉宿'],
      standard: ['子連れ歓迎ホテル', '和洋室のある温泉宿', '駐車場つきホテル'],
      low: ['ビジネスホテル', '日帰り温泉', '市場と公園中心の日帰り']
    },
    rainyAlternatives: ['アドベンチャーワールドの屋内展示を中心にする', 'とれとれ市場で昼食と買い物をまとめる', '宿の温泉時間を増やす'],
    cautions: ['関西北部からは移動が長めになる', '夏の白良浜は混雑と暑さ対策が必要'],
    concept: '動物、海、温泉をまとめて楽しめる、子どもの満足度が高い南紀プラン。',
    theme: 'animal-sea',
    areaGroup: 'kansai-wakayama-sea',
    childFocus: ['toddler', 'preschool', 'school'],
    budgetFit: ['standard', 'high']
  },
  {
    id: 'nagahama-hikone-biwako',
    areaName: '長浜・彦根・琵琶湖方面',
    departureCategoryLabel: '関西・大阪・高槻・上牧・京都発',
    departureCategories: ['kansai'],
    estimatedMinutes: { kansai: 85, niigata: 430, generic: 120 },
    durations: ['daytrip', '1night', '2nights'],
    transports: ['car', 'train'],
    purposeKeywords: ['自然', '湖', '散策', '城', '公園', '雨の日', '近場', '食事'],
    childFriendlyPoints: ['移動が短く昼寝時間を守りやすい', '黒壁スクエアや琵琶湖沿いを短く散策できる', '博物館や屋内施設に切り替えやすい'],
    rainyFriendly: true,
    onsen: false,
    nature: true,
    seafood: false,
    lodgeFocus: false,
    spots: ['黒壁スクエア', '彦根城周辺', '琵琶湖沿い', '道の駅湖北みずどりステーション', '長浜鉄道スクエア'],
    meals: ['近江牛', '湖魚料理', '黒壁周辺のカフェ', 'ベーカリーやテイクアウト'],
    lodging: {
      high: ['琵琶湖を望むホテル', '個室食のある宿', 'ゆったりした和洋室の宿'],
      standard: ['子連れ歓迎ホテル', '駐車場つきホテル', '駅近ホテル'],
      low: ['ビジネスホテル', '公共の宿', '日帰り中心の道の駅・公園旅程']
    },
    rainyAlternatives: ['長浜鉄道スクエア', '博物館や屋内施設', '黒壁周辺のカフェ休憩'],
    cautions: ['彦根城周辺は坂や砂利道がある', '湖岸は風が強い日がある'],
    concept: '移動短めで、湖、城下町、カフェ、博物館を組み合わせる近場プラン。',
    theme: 'lake-town',
    areaGroup: 'kansai-lake',
    childFocus: ['toddler', 'preschool', 'school'],
    budgetFit: ['low', 'standard']
  },
  {
    id: 'nara-yoshino-soni',
    areaName: '奈良・吉野・曽爾高原方面',
    departureCategoryLabel: '関西・大阪・高槻・上牧・京都発',
    departureCategories: ['kansai'],
    estimatedMinutes: { kansai: 110, niigata: 540, generic: 150 },
    durations: ['daytrip', '1night', '2nights'],
    transports: ['car', 'train'],
    purposeKeywords: ['自然', '高原', '公園', '山', '温泉', '子どもが遊べる', '散策'],
    childFriendlyPoints: ['高原や公園で体を動かしやすい', '道の駅で休憩を挟める', '短時間の自然散策にしやすい'],
    rainyFriendly: false,
    onsen: true,
    nature: true,
    seafood: false,
    lodgeFocus: false,
    spots: ['曽爾高原', '曽爾高原ファームガーデン', '吉野山周辺', '道の駅宇陀路大宇陀', '奈良公園'],
    meals: ['柿の葉寿司', '三輪そうめん', '道の駅の定食', 'ベーカリーやテイクアウト'],
    lodging: {
      high: ['自然に近い温泉宿', '一棟貸しや広めの和洋室', '料理重視の里山宿'],
      standard: ['温泉宿', '公共の宿', '駐車場つき宿'],
      low: ['日帰り温泉', '道の駅と公園中心の日帰り', '公共の宿']
    },
    rainyAlternatives: ['奈良市内の博物館に切り替える', '道の駅と温泉中心にする', '宿で休む時間を増やす'],
    cautions: ['高原は天候と気温差に注意する', 'ベビーカーより歩きやすい靴が向く場所が多い'],
    concept: '高原、里山、温泉を短めの移動で楽しむ自然重視プラン。',
    theme: 'highland-nature',
    areaGroup: 'kansai-nara-nature',
    childFocus: ['preschool', 'school'],
    budgetFit: ['low', 'standard']
  },
  {
    id: 'arima-kobe',
    areaName: '有馬温泉・神戸方面',
    departureCategoryLabel: '関西・大阪・高槻・上牧・京都発',
    departureCategories: ['kansai'],
    estimatedMinutes: { kansai: 70, niigata: 520, generic: 120 },
    durations: ['daytrip', '1night', '2nights'],
    transports: ['car', 'train', 'bus'],
    purposeKeywords: ['温泉', '高級旅館', '近場', '動物', '神戸', '雨の日', 'のんびり'],
    childFriendlyPoints: ['移動が短く昼寝を崩しにくい', '神戸どうぶつ王国や屋内施設に切り替えやすい', '温泉宿で早めに休める'],
    rainyFriendly: true,
    onsen: true,
    nature: true,
    seafood: false,
    lodgeFocus: true,
    spots: ['有馬温泉街', '六甲山牧場', '神戸どうぶつ王国', '神戸ハーバーランド', '有馬玩具博物館'],
    meals: ['神戸牛ランチ', '温泉街の軽食', 'ベーカリー', 'ホテルのビュッフェ'],
    lodging: {
      high: ['有馬温泉の高級旅館', '部屋食または個室食のある宿', '貸切風呂や家族風呂がある宿'],
      standard: ['温泉宿', '子連れ歓迎ホテル', '和洋室のある宿'],
      low: ['日帰り温泉', '神戸市内のホテル', '公共交通での日帰り']
    },
    rainyAlternatives: ['神戸どうぶつ王国', '有馬玩具博物館', 'ハーバーランドの屋内施設'],
    cautions: ['有馬温泉街は坂が多い', '人気宿は早めの予約確認が必要'],
    concept: '近場の温泉宿と神戸の屋内スポットを組み合わせる休みやすいプラン。',
    theme: 'near-onsen',
    areaGroup: 'kansai-kobe',
    childFocus: ['toddler', 'preschool', 'school'],
    budgetFit: ['standard', 'high']
  },
  {
    id: 'tanba-sasayama',
    areaName: '丹波篠山方面',
    departureCategoryLabel: '関西・大阪・高槻・上牧・京都発',
    departureCategories: ['kansai'],
    estimatedMinutes: { kansai: 75, niigata: 510, generic: 120 },
    durations: ['daytrip', '1night'],
    transports: ['car', 'train'],
    purposeKeywords: ['自然', '里山', '食事', 'カフェ', '近場', '公園', '体験'],
    childFriendlyPoints: ['里山の公園や道の駅を使いやすい', '移動が短く小さい子でも疲れにくい', 'カフェやテイクアウトで食事調整しやすい'],
    rainyFriendly: true,
    onsen: true,
    nature: true,
    seafood: false,
    lodgeFocus: false,
    spots: ['篠山城下町', '丹波並木道中央公園', '道の駅 丹波おばあちゃんの里', 'こんだ薬師温泉', '黒豆スイーツ店'],
    meals: ['黒豆料理', '丹波栗スイーツ', '里山カフェ', '道の駅の定食'],
    lodging: {
      high: ['古民家宿', '料理重視の小さな宿', '家族風呂のある宿'],
      standard: ['公共の宿', '駐車場つきホテル', '温泉つき宿'],
      low: ['日帰り温泉', '道の駅と公園中心の日帰り', 'ビジネスホテル']
    },
    rainyAlternatives: ['城下町の屋内店舗', 'カフェ休憩', 'こんだ薬師温泉'],
    cautions: ['城下町散策は店の定休日に注意する', '秋の味覚シーズンは混みやすい'],
    concept: '里山、公園、カフェ、温泉を短い移動で楽しむ低負担プラン。',
    theme: 'satoyama-food',
    areaGroup: 'kansai-tanba',
    childFocus: ['toddler', 'preschool'],
    budgetFit: ['low', 'standard']
  },
  {
    id: 'wakayama-marina-city',
    areaName: '和歌山マリーナシティ周辺',
    departureCategoryLabel: '関西・大阪・高槻・上牧・京都発',
    departureCategories: ['kansai'],
    estimatedMinutes: { kansai: 100, niigata: 570, generic: 140 },
    durations: ['daytrip', '1night', '2nights'],
    transports: ['car', 'train'],
    purposeKeywords: ['海', '海鮮', '市場', '遊園地', '子どもが遊べる', '雨の日', '近場'],
    childFriendlyPoints: ['黒潮市場とポルトヨーロッパを近くで組める', 'フードコートやテイクアウトが使いやすい', '日帰りでも宿泊でも調整しやすい'],
    rainyFriendly: true,
    onsen: true,
    nature: true,
    seafood: true,
    lodgeFocus: false,
    spots: ['ポルトヨーロッパ', '黒潮市場', '紀三井寺周辺', '片男波公園', '和歌山城'],
    meals: ['黒潮市場の海鮮', '和歌山ラーメン', 'フードコート', 'テイクアウトの軽食'],
    lodging: {
      high: ['海沿いホテル', '温泉つきリゾートホテル', '広めの和洋室がある宿'],
      standard: ['子連れ歓迎ホテル', '駐車場つきホテル', '温泉つき宿'],
      low: ['日帰り温泉', 'ビジネスホテル', '市場と公園中心の日帰り']
    },
    rainyAlternatives: ['黒潮市場中心にする', 'ホテルや温泉で休憩する', '和歌山市内の屋内施設へ切り替える'],
    cautions: ['遊園地利用日は天候で滞在時間が変わる', '市場の混雑時間をずらすと子連れで動きやすい'],
    concept: '市場、海、遊園地を近い範囲でまとめる、短め移動の海プラン。',
    theme: 'market-sea',
    areaGroup: 'kansai-wakayama-sea',
    childFocus: ['toddler', 'preschool', 'school'],
    budgetFit: ['low', 'standard']
  },
  {
    id: 'tsukioka-shibata',
    areaName: '月岡温泉・新発田方面',
    departureCategoryLabel: '新潟発',
    departureCategories: ['niigata'],
    estimatedMinutes: { kansai: 520, niigata: 45, generic: 120 },
    durations: ['daytrip', '1night', '2nights'],
    transports: ['car', 'train'],
    purposeKeywords: ['温泉', '高級旅館', 'のんびり', '公園', '食事', '雨の日'],
    childFriendlyPoints: ['移動が短く小さい子でも疲れにくい', '月岡わくわくファームで短時間休憩できる', '宿で早めに休める'],
    rainyFriendly: true,
    onsen: true,
    nature: true,
    seafood: false,
    lodgeFocus: true,
    spots: ['月岡温泉街', '月岡わくわくファーム', '新発田城址公園', '瓢湖', '道の駅加治川'],
    meals: ['新潟の寿司', 'へぎそば', '温泉旅館の会席', '笹団子などの甘味'],
    lodging: {
      high: ['月岡温泉の高級旅館', '部屋食または個室食のある宿', '貸切風呂や家族風呂がある宿'],
      standard: ['温泉宿', '和洋室のある宿', '駐車場つきホテル'],
      low: ['日帰り温泉', '新発田周辺のホテル', '公共の宿']
    },
    rainyAlternatives: ['月岡温泉街の屋内店舗', '宿の温泉時間を長めにする', '道の駅や産直で休憩'],
    cautions: ['温泉街散策は店の営業時間を確認する', '冬は道路状況に余裕を持つ'],
    concept: '新潟市周辺から近く、温泉宿で休む時間をたっぷり取れるプラン。',
    theme: 'near-onsen',
    areaGroup: 'niigata-onsen',
    childFocus: ['toddler', 'preschool'],
    budgetFit: ['standard', 'high']
  },
  {
    id: 'yahiko-teradomari',
    areaName: '弥彦・寺泊方面',
    departureCategoryLabel: '新潟発',
    departureCategories: ['niigata'],
    estimatedMinutes: { kansai: 520, niigata: 70, generic: 130 },
    durations: ['daytrip', '1night', '2nights'],
    transports: ['car', 'train'],
    purposeKeywords: ['海', '海鮮', '市場', '神社', '自然', 'ロープウェイ', '子どもが遊べる'],
    childFriendlyPoints: ['寺泊魚の市場通りで食事を決めやすい', '道の駅国上で休憩できる', '弥彦公園で短い散策ができる'],
    rainyFriendly: true,
    onsen: true,
    nature: true,
    seafood: true,
    lodgeFocus: false,
    spots: ['弥彦神社', '弥彦公園', '寺泊魚の市場通り', '弥彦山ロープウェイ', '道の駅国上'],
    meals: ['寺泊の海鮮', '寿司', '浜焼き', '道の駅の軽食'],
    lodging: {
      high: ['弥彦温泉の料理宿', '個室食のある温泉宿', '家族風呂のある宿'],
      standard: ['温泉宿', '和洋室のある宿', '駐車場つきホテル'],
      low: ['日帰り温泉', '道の駅と市場中心の日帰り', '近隣のビジネスホテル']
    },
    rainyAlternatives: ['寺泊魚の市場通り中心にする', '道の駅国上で休憩を増やす', '温泉立ち寄りに切り替える'],
    cautions: ['市場は昼時に混みやすい', 'ロープウェイは天候に左右される'],
    concept: '寺泊の海鮮と弥彦の自然・温泉を短め移動で組める新潟近場プラン。',
    theme: 'market-sea',
    areaGroup: 'niigata-coast',
    childFocus: ['preschool', 'school'],
    budgetFit: ['low', 'standard']
  },
  {
    id: 'nagaoka-echigo-park',
    areaName: '長岡・国営越後丘陵公園方面',
    departureCategoryLabel: '新潟発',
    departureCategories: ['niigata'],
    estimatedMinutes: { kansai: 500, niigata: 75, generic: 130 },
    durations: ['daytrip', '1night', '2nights'],
    transports: ['car', 'train'],
    purposeKeywords: ['自然', '公園', '子どもが遊べる', '屋内', '学び', '近場'],
    childFriendlyPoints: ['国営越後丘陵公園で年齢に合わせて遊べる', '道の駅ながおか花火館で屋内休憩できる', '移動時間が短く日帰りにしやすい'],
    rainyFriendly: true,
    onsen: false,
    nature: true,
    seafood: false,
    lodgeFocus: false,
    spots: ['国営越後丘陵公園', '道の駅ながおか花火館', '長岡花火ミュージアム', '寺泊方面への寄り道', '悠久山公園'],
    meals: ['へぎそば', '長岡生姜醤油ラーメン', '道の駅のフードコート', 'ベーカリーやテイクアウト'],
    lodging: {
      high: ['広めの客室があるホテル', '温泉つき近隣宿', '食事つきのゆったり宿'],
      standard: ['駐車場つきホテル', '子連れ歓迎ホテル', '駅近ホテル'],
      low: ['日帰り中心', 'ビジネスホテル', '公共施設と公園中心の旅程']
    },
    rainyAlternatives: ['道の駅ながおか花火館', '長岡花火ミュージアム', '屋内遊び場への切り替え'],
    cautions: ['公園は季節と天候で遊べる範囲が変わる', '夏は熱中症対策をする'],
    concept: '大きな公園と屋内休憩を組み合わせる、子どもが遊びやすい新潟近場プラン。',
    theme: 'big-park',
    areaGroup: 'niigata-park',
    childFocus: ['toddler', 'preschool', 'school'],
    budgetFit: ['low', 'standard']
  },
  {
    id: 'joetsu-myoko',
    areaName: '上越・妙高方面',
    departureCategoryLabel: '新潟発',
    departureCategories: ['niigata'],
    estimatedMinutes: { kansai: 460, niigata: 130, generic: 180 },
    durations: ['1night', '2nights', '3nights'],
    transports: ['car', 'train', 'shinkansen'],
    purposeKeywords: ['自然', '高原', '水族館', '温泉', 'アクティビティ', '子どもが遊べる'],
    childFriendlyPoints: ['上越市立水族博物館うみがたりで雨でも過ごせる', '妙高高原で自然遊びができる', '温泉宿で休憩を取りやすい'],
    rainyFriendly: true,
    onsen: true,
    nature: true,
    seafood: true,
    lodgeFocus: true,
    spots: ['妙高高原', '上越市立水族博物館うみがたり', '高田城址公園', '赤倉温泉', '道の駅あらい'],
    meals: ['妙高のそば', '上越の海鮮', '道の駅あらいの食事', 'ホテルのビュッフェ'],
    lodging: {
      high: ['赤倉温泉のリゾート宿', '貸切風呂のある温泉宿', '料理重視の高原ホテル'],
      standard: ['温泉宿', '子連れ歓迎ホテル', '和洋室のある宿'],
      low: ['道の駅と公園中心', 'ビジネスホテル', '日帰り温泉']
    },
    rainyAlternatives: ['上越市立水族博物館うみがたり', '道の駅あらい', '宿の温泉時間を増やす'],
    cautions: ['冬は雪道運転に注意する', '高原エリアは朝夕の気温差が大きい'],
    concept: '高原、水族館、温泉を組み合わせる、自然遊びと雨の日対応を両立するプラン。',
    theme: 'highland-aquarium',
    areaGroup: 'niigata-myoko',
    childFocus: ['preschool', 'school'],
    budgetFit: ['standard', 'high']
  },
  {
    id: 'senami-murakami',
    areaName: '瀬波温泉・村上方面',
    departureCategoryLabel: '新潟発',
    departureCategories: ['niigata'],
    estimatedMinutes: { kansai: 560, niigata: 85, generic: 150 },
    durations: ['1night', '2nights'],
    transports: ['car', 'train'],
    purposeKeywords: ['海', '温泉', '海鮮', '高級旅館', '村上', 'のんびり', '雨の日'],
    childFriendlyPoints: ['海沿いの宿で移動を減らしやすい', '町屋通りを短時間散策にできる', 'イヨボヤ会館で屋内時間を作れる'],
    rainyFriendly: true,
    onsen: true,
    nature: true,
    seafood: true,
    lodgeFocus: true,
    spots: ['瀬波温泉海岸', '村上町屋通り', 'イヨボヤ会館', '笹川流れ', '道の駅神林'],
    meals: ['村上牛', '鮭料理', '海鮮ランチ', '温泉旅館の会席'],
    lodging: {
      high: ['瀬波温泉の海沿い旅館', '部屋食または個室食のある宿', '夕日が見える温泉宿'],
      standard: ['温泉宿', '和洋室のある宿', '駐車場つきホテル'],
      low: ['日帰り温泉', '村上周辺のホテル', '道の駅と町歩き中心']
    },
    rainyAlternatives: ['イヨボヤ会館', '村上町屋通りの屋内店舗', '宿の温泉時間を長めにする'],
    cautions: ['海沿いは風が強い日がある', '笹川流れ方面は移動時間に余裕を持つ'],
    concept: '夕日の海、温泉旅館、村上の食をゆっくり楽しむ宿重視プラン。',
    theme: 'sea-ryokan',
    areaGroup: 'niigata-coast',
    childFocus: ['toddler', 'preschool', 'school'],
    budgetFit: ['standard', 'high']
  },
  {
    id: 'uonuma-yuzawa',
    areaName: '魚沼・湯沢方面',
    departureCategoryLabel: '新潟発',
    departureCategories: ['niigata'],
    estimatedMinutes: { kansai: 470, niigata: 120, generic: 170 },
    durations: ['1night', '2nights', '3nights'],
    transports: ['car', 'train', 'shinkansen'],
    purposeKeywords: ['温泉', '自然', '高原', '体験', '雪遊び', 'のんびり', '宿'],
    childFriendlyPoints: ['湯沢高原や道の駅で休憩しやすい', '年齢に合わせて自然遊びや雪遊びを選べる', '駅近ホテルを使いやすい'],
    rainyFriendly: true,
    onsen: true,
    nature: true,
    seafood: false,
    lodgeFocus: true,
    spots: ['越後湯沢温泉街', '湯沢高原', '魚沼の里', '清津峡', '道の駅南魚沼'],
    meals: ['へぎそば', '魚沼産コシヒカリの定食', '駅ナカの食事', '笹団子'],
    lodging: {
      high: ['越後湯沢の温泉旅館', '貸切風呂のある宿', '食事重視の高原ホテル'],
      standard: ['駅近温泉宿', '子連れ歓迎ホテル', '和洋室のある宿'],
      low: ['ビジネスホテル', '日帰り温泉', '道の駅中心の日帰り寄り旅程']
    },
    rainyAlternatives: ['魚沼の里', '駅ナカ施設', '宿の温泉や屋内遊び場'],
    cautions: ['冬は雪道と装備を確認する', '清津峡など人気スポットは混雑に注意する'],
    concept: '温泉、米どころの食事、自然体験を組み合わせる山側の滞在プラン。',
    theme: 'mountain-onsen',
    areaGroup: 'niigata-mountain',
    childFocus: ['preschool', 'school'],
    budgetFit: ['standard', 'high']
  },
  {
    id: 'sado',
    areaName: '佐渡方面',
    departureCategoryLabel: '新潟発',
    departureCategories: ['niigata'],
    estimatedMinutes: { kansai: 620, niigata: 240, generic: 260 },
    durations: ['2nights', '3nights', 'longer'],
    transports: ['car', 'train', 'bus'],
    purposeKeywords: ['海', '自然', '体験', '学び', '海鮮', '船', 'ゆっくり'],
    childFriendlyPoints: ['船移動を旅のイベントにできる', '自然体験や学びの要素が多い', '2泊以上で余裕を持ちやすい'],
    rainyFriendly: true,
    onsen: false,
    nature: true,
    seafood: true,
    lodgeFocus: false,
    spots: ['佐渡汽船', 'トキの森公園', '佐渡金山', '尖閣湾', 'たらい舟体験'],
    meals: ['佐渡の海鮮', '寿司', '地魚定食', 'テイクアウトの軽食'],
    lodging: {
      high: ['海沿いの料理宿', '広めの和洋室がある宿', '食事重視の旅館'],
      standard: ['島内ホテル', '民宿', '駐車場つき宿'],
      low: ['民宿', '公共の宿', '食堂と観光中心の滞在']
    },
    rainyAlternatives: ['佐渡金山', 'トキの森公園', '屋内展示施設'],
    cautions: ['フェリー時刻に旅程が左右される', '2泊以上で組むと子連れの負担が少ない'],
    concept: '船、海、自然、学びをセットで楽しむ、2泊以上向きの島旅プラン。',
    theme: 'island-learning',
    areaGroup: 'niigata-island',
    childFocus: ['school'],
    budgetFit: ['standard', 'high']
  },
  {
    id: 'niigata-city-coast',
    areaName: '新潟市内・水族館・海沿いエリア',
    departureCategoryLabel: '新潟発',
    departureCategories: ['niigata'],
    estimatedMinutes: { kansai: 520, niigata: 30, generic: 90 },
    durations: ['daytrip', '1night'],
    transports: ['car', 'train', 'bus'],
    purposeKeywords: ['水族館', '海', '雨の日', '近場', '子どもが遊べる', '食事', '市場'],
    childFriendlyPoints: ['移動が短く0〜2歳でも調整しやすい', 'マリンピア日本海で屋内時間を作れる', 'フードコートやテイクアウトを使いやすい'],
    rainyFriendly: true,
    onsen: false,
    nature: true,
    seafood: true,
    lodgeFocus: false,
    spots: ['マリンピア日本海', '新潟ふるさと村', 'ピアBandai', 'やすらぎ堤', '万代シテイ'],
    meals: ['寿司', '海鮮', 'へぎそば', '笹団子', 'フードコート'],
    lodging: {
      high: ['市内の上質ホテル', '広めの客室があるホテル', '朝食重視のホテル'],
      standard: ['子連れ歓迎ホテル', '駅近ホテル', '駐車場つきホテル'],
      low: ['日帰り中心', 'ビジネスホテル', '公共施設と水族館中心']
    },
    rainyAlternatives: ['マリンピア日本海', '新潟ふるさと村', '万代シテイの屋内施設'],
    cautions: ['市街地は駐車場の場所を先に決めると動きやすい', '地酒は大人向けの楽しみとして扱う'],
    concept: '水族館、市場、海沿い散策を短い移動でまとめる新潟市内プラン。',
    theme: 'city-aquarium',
    areaGroup: 'niigata-city',
    childFocus: ['toddler', 'preschool', 'school'],
    budgetFit: ['low', 'standard']
  }
];

let currentInput = null;
let currentMode = null;
let currentPlans = [];
let selectedPlanId = null;

setupCountSelect(adultCount, 1, 9, 2);
setupCountSelect(childCount, 0, 9, 0);
updateCustomCountVisibility();
updateAgeFields();

adultCount.addEventListener('change', updateCustomCountVisibility);
childCount.addEventListener('change', () => {
  updateCustomCountVisibility();
  updateAgeFields();
});
childCustom.addEventListener('input', updateAgeFields);

form.addEventListener('submit', (event) => {
  event.preventDefault();
  currentInput = readForm();
  currentMode = null;
  selectedPlanId = null;
  renderSuggestions();
});

result.addEventListener('click', (event) => {
  const modeButton = event.target.closest('[data-mode]');
  if (modeButton && currentInput) {
    currentMode = modeButton.dataset.mode;
    selectedPlanId = null;
    renderSuggestions();
    return;
  }

  const planButton = event.target.closest('[data-plan-id]');
  if (planButton) {
    selectedPlanId = planButton.dataset.planId;
    renderSuggestions({ keepScroll: true });
  }
});

function setupCountSelect(select, min, max, initial) {
  for (let value = min; value <= max; value += 1) {
    const option = document.createElement('option');
    option.value = String(value);
    option.textContent = `${value}人`;
    option.selected = value === initial;
    select.append(option);
  }

  const custom = document.createElement('option');
  custom.value = 'custom';
  custom.textContent = '10人以上';
  select.append(custom);
}

function updateCustomCountVisibility() {
  adultCustomWrap.classList.toggle('is-hidden', adultCount.value !== 'custom');
  childCustomWrap.classList.toggle('is-hidden', childCount.value !== 'custom');
}

function updateAgeFields() {
  const count = getSelectedCount(childCount, childCustom);
  ageInputs.innerHTML = '';
  childAges.classList.toggle('is-hidden', count < 1);
  if (count < 1) return;

  const visibleCount = Math.min(count, maxVisibleAgeFields);
  for (let index = 1; index <= visibleCount; index += 1) {
    const label = document.createElement('label');
    label.textContent = `${index}人目`;
    const select = document.createElement('select');
    select.name = `childAge${index}`;
    select.required = true;

    childAgeOptions.forEach((age) => {
      const option = document.createElement('option');
      option.value = age;
      option.textContent = age;
      select.append(option);
    });

    label.append(select);
    ageInputs.append(label);
  }

  if (count > maxVisibleAgeFields) {
    const note = document.createElement('p');
    note.className = 'field-note';
    note.textContent = `${maxVisibleAgeFields}人目まで年齢を選択できます。残りは目的欄に補足してください。`;
    ageInputs.append(note);
  }
}

function getSelectedCount(select, customInput) {
  if (select.value === 'custom') {
    return Math.max(10, Number(customInput.value) || 10);
  }
  return Number(select.value);
}

function readForm() {
  const data = Object.fromEntries(new FormData(form).entries());
  const childTotal = getSelectedCount(childCount, childCustom);
  const ages = [];
  for (let index = 1; index <= Math.min(childTotal, maxVisibleAgeFields); index += 1) {
    ages.push(data[`childAge${index}`]);
  }

  return {
    departure: data.departure.trim(),
    duration: data.duration,
    transport: data.transport,
    travelTime: data.travelTime,
    purpose: data.purpose.trim(),
    adultTotal: getSelectedCount(adultCount, adultCustom),
    childTotal,
    childAges: ages,
    budget: data.budget
  };
}

function renderSuggestions(options = {}) {
  currentPlans = buildPlans(currentInput, currentMode);
  if (!selectedPlanId || !currentPlans.some((plan) => plan.id === selectedPlanId)) {
    selectedPlanId = currentPlans.length ? currentPlans[0].id : null;
  }

  const selectedPlan = currentPlans.find((plan) => plan.id === selectedPlanId);
  const modeNote = currentMode ? suggestionModes[currentMode].tone : '入力条件に合わせて、具体的な地名・スポット・食事・宿タイプが違う3候補を作りました。';

  result.innerHTML = `
    <div class="result-toolbar">
      <div>
        <span class="plan-area">提案メモ</span>
        <h2>${escapeHtml(currentInput.departure)}発・${escapeHtml(durations[currentInput.duration].label)}の候補プラン</h2>
        <p>${escapeHtml(modeNote)} ${escapeHtml(budgetAdvice[currentInput.budget])}</p>
      </div>
      <div class="mode-buttons" aria-label="再提案">
        ${Object.entries(suggestionModes).map(([key, mode]) => `
          <button type="button" class="secondary-button${currentMode === key ? ' is-active' : ''}" data-mode="${key}">
            ${escapeHtml(mode.label)}
          </button>
        `).join('')}
      </div>
    </div>

    <section class="summary-panel" aria-labelledby="summary-title">
      <h3 id="summary-title">候補プラン一覧</h3>
      <div class="plan-card-list">
        ${currentPlans.map((plan) => renderPlanCard(plan)).join('')}
      </div>
    </section>

    <div id="planDetail" class="detail-panel">
      ${selectedPlan ? renderPlanDetail(selectedPlan) : '<p class="empty-detail">条件に合う候補を作れませんでした。目的や移動時間を少し広げてください。</p>'}
    </div>
  `;

  result.classList.remove('is-hidden');
  if (!options.keepScroll) {
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function buildPlans(input, mode) {
  const scored = destinationCatalog
    .map((destination) => scoreDestination(destination, input, mode))
    .sort((a, b) => b.score - a.score);

  return selectDistinctDestinations(scored, 3).map((entry, index) => createPlan(entry, input, index));
}

function scoreDestination(destination, input, mode) {
  const originCategory = getOriginCategory(input.departure);
  const signals = analyzePurpose(input.purpose);
  const budgetLevel = getBudgetLevel(input.budget);
  const childProfile = getChildProfile(input);
  const estimatedMinutes = getEstimatedMinutes(destination, originCategory);
  const maxMinutes = travelTimes[input.travelTime].minutes;
  let score = 0;

  if (destination.departureCategories.includes(originCategory)) {
    score += 45;
  } else if (originCategory === 'generic') {
    score += 12;
  } else {
    score -= 30;
  }

  if (maxMinutes >= 999) {
    score += estimatedMinutes <= 300 ? 14 : -4;
  } else if (estimatedMinutes <= maxMinutes) {
    score += 28 + Math.max(0, (maxMinutes - estimatedMinutes) / 20);
  } else if (estimatedMinutes <= maxMinutes + 45) {
    score += 8 - (estimatedMinutes - maxMinutes) / 15;
  } else {
    score -= Math.min(40, (estimatedMinutes - maxMinutes) / 10);
  }

  if (maxMinutes <= 60 && estimatedMinutes <= 75) score += 10;
  if (maxMinutes >= 180 && estimatedMinutes >= 120 && destination.departureCategories.includes(originCategory)) score += 7;

  if (destination.durations.includes(input.duration)) {
    score += 18;
  } else if (input.duration === 'daytrip') {
    score -= 18;
  } else if (durations[input.duration].days >= 3 && destination.durations.includes('2nights')) {
    score += 8;
  } else {
    score -= 4;
  }

  if (destination.transports.includes(input.transport)) {
    score += 12;
  } else if (input.transport === 'other') {
    score += 4;
  } else if (input.transport === 'flight') {
    score -= 12;
  } else {
    score -= 4;
  }

  score += scorePurpose(destination, signals);
  score += scoreBudget(destination, budgetLevel, estimatedMinutes);
  score += scoreChildren(destination, childProfile, estimatedMinutes);
  score += scoreMode(destination, mode, estimatedMinutes);

  return {
    destination,
    score,
    estimatedMinutes,
    originCategory,
    signals,
    budgetLevel,
    childProfile
  };
}

function scorePurpose(destination, signals) {
  let score = 0;
  if (signals.has('sea')) score += destination.purposeKeywords.includes('海') || destination.seafood ? 16 : -6;
  if (signals.has('seafood')) score += destination.seafood ? 18 : -6;
  if (signals.has('luxury')) {
    score += destination.lodgeFocus ? 18 : -7;
    if (destination.purposeKeywords.includes('料理旅館')) score += 10;
    if (signals.has('sea') && destination.theme === 'sea-ryokan') score += 8;
  }
  if (signals.has('onsen')) score += destination.onsen ? 15 : -5;
  if (signals.has('nature')) score += destination.nature ? 15 : -4;
  if (signals.has('kids')) score += destination.childFocus.length ? 12 : 0;
  if (signals.has('rainy')) score += destination.rainyFriendly ? 12 : -8;

  return score;
}

function scoreBudget(destination, budgetLevel, estimatedMinutes) {
  if (budgetLevel === 'high') {
    let score = destination.budgetFit.includes('high') ? 9 : 0;
    if (destination.lodgeFocus) score += 14;
    if (destination.onsen) score += 6;
    if (destination.seafood) score += 6;
    return score;
  }

  if (budgetLevel === 'low') {
    let score = destination.budgetFit.includes('low') ? 12 : -4;
    if (estimatedMinutes <= 90) score += 7;
    if (destination.lodgeFocus && !destination.budgetFit.includes('low')) score -= 6;
    return score;
  }

  return destination.budgetFit.includes('standard') ? 8 : 0;
}

function scoreChildren(destination, childProfile, estimatedMinutes) {
  if (!childProfile.hasChildren) return 0;
  let score = 0;
  if (destination.childFocus.includes(childProfile.stage)) score += 12;
  if (childProfile.stage === 'toddler') {
    if (estimatedMinutes <= 120) score += 8;
    if (estimatedMinutes > 180) score -= 8;
    if (destination.rainyFriendly) score += 5;
  }
  if (childProfile.stage === 'preschool') {
    if (hasAny(destination.spots.join('、'), ['公園', '牧場', '動物', '水族館', '遊園地', '道の駅'])) score += 8;
  }
  if (childProfile.stage === 'school') {
    if (hasAny(destination.purposeKeywords.join('、'), ['体験', '自然', '学び', '高原', '水族館'])) score += 8;
  }
  return score;
}

function scoreMode(destination, mode, estimatedMinutes) {
  if (!mode) return 0;
  if (mode === 'shorter') return Math.max(0, 18 - estimatedMinutes / 12) + (destination.budgetFit.includes('low') ? 5 : 0);
  if (mode === 'nature') return destination.nature ? 18 : -6;
  if (mode === 'onsen') return (destination.onsen ? 14 : -6) + (destination.lodgeFocus ? 10 : 0);
  if (mode === 'rainy') return destination.rainyFriendly ? 18 : -10;
  return 0;
}

function selectDistinctDestinations(scored, count) {
  const selected = [];

  scored.forEach((entry) => {
    if (selected.length >= count) return;
    if (!selected.length) {
      selected.push(entry);
      return;
    }

    const sameTheme = selected.some((selectedEntry) => selectedEntry.destination.theme === entry.destination.theme);
    const sameAreaGroup = selected.some((selectedEntry) => selectedEntry.destination.areaGroup === entry.destination.areaGroup);
    if (!sameTheme && !sameAreaGroup) selected.push(entry);
  });

  scored.forEach((entry) => {
    if (selected.length >= count) return;
    if (!selected.some((selectedEntry) => selectedEntry.destination.id === entry.destination.id)) selected.push(entry);
  });

  return selected.slice(0, count);
}

function createPlan(entry, input, index) {
  const destination = entry.destination;
  const lodgingTypes = chooseLodgingTypes(destination, entry.budgetLevel, input.purpose);
  const meals = chooseMeals(destination, input);

  return {
    id: destination.id,
    label: index === 0 ? '本命' : '別案',
    name: `${destination.areaName} ${buildPlanSuffix(destination, entry, input)}`,
    area: buildRecommendedArea(destination),
    concept: destination.concept,
    shortReason: buildShortReason(destination, entry, input),
    reason: buildReason(destination, entry, input),
    itinerary: buildItinerary(destination, input, meals, lodgingTypes),
    spots: destination.spots,
    meals,
    lodgingTypes,
    rest: buildRestPoints(destination, input, entry.childProfile),
    rainy: destination.rainyAlternatives,
    caution: destination.cautions.concat(officialNotice),
    fit: buildFamilyFit(destination, input, entry)
  };
}

function buildPlanSuffix(destination, entry, input) {
  if (entry.budgetLevel === 'high' && destination.lodgeFocus) return '宿と食事を楽しむプラン';
  if (entry.signals.has('seafood') || entry.signals.has('sea')) return '海と食事を楽しむプラン';
  if (entry.signals.has('nature')) return '自然で遊ぶプラン';
  if (input.childTotal > 0) return '子連れで動きやすいプラン';
  return '家族で過ごしやすいプラン';
}

function buildRecommendedArea(destination) {
  return `${destination.areaName}（${destination.spots.slice(0, 3).join('、')}周辺）`;
}

function buildShortReason(destination, entry, input) {
  const matches = summarizeMatches(destination, entry, input).slice(0, 3).join('・');
  return `${transports[input.transport]}で${formatMinutes(entry.estimatedMinutes)}目安に収まり、${matches}を具体的に組み込みやすいからです。`;
}

function buildReason(destination, entry, input) {
  const durationLabel = durations[input.duration].label;
  const originLabel = getOriginLabel(entry.originCategory);
  const childNote = buildChildReason(entry.childProfile);
  return `${originLabel}として相性がよく、${input.departure}発の${transports[input.transport]}移動で${formatMinutes(entry.estimatedMinutes)}が目安です。${durationLabel}なら${destination.spots[0]}、${destination.spots[1]}、${destination.spots[2]}を無理なく分けられ、${chooseMeals(destination, input).slice(0, 2).join('や')}も入れやすいです。${childNote}`;
}

function summarizeMatches(destination, entry, input) {
  const matches = [];
  if (entry.signals.has('sea') && (destination.seafood || destination.purposeKeywords.includes('海'))) matches.push('海沿いの立ち寄り');
  if (entry.signals.has('seafood') && destination.seafood) matches.push('海鮮・地魚');
  if ((entry.signals.has('luxury') || entry.budgetLevel === 'high') && destination.lodgeFocus) matches.push('宿重視');
  if (entry.signals.has('onsen') && destination.onsen) matches.push('温泉');
  if (entry.signals.has('nature') && destination.nature) matches.push('自然遊び');
  if (input.childTotal > 0) matches.push('子連れ休憩');
  if (!matches.length) matches.push(destination.spots[0], destination.meals[0], destination.lodging[entry.budgetLevel][0]);
  return matches;
}

function buildChildReason(childProfile) {
  if (!childProfile.hasChildren) return '大人中心でも、食事と休憩を詰め込みすぎない流れにできます。';
  if (childProfile.stage === 'toddler') return '0〜2歳がいる場合は、昼寝、授乳、おむつ替え、屋内休憩を優先して組めます。';
  if (childProfile.stage === 'preschool') return '3〜6歳がいる場合は、公園、動物、水族館、短時間で楽しめるスポットを入れやすいです。';
  return '7〜12歳がいる場合は、体験、自然遊び、学びの要素を入れやすいです。';
}

function buildItinerary(destination, input, meals, lodgingTypes) {
  const spot = (index) => destination.spots[index] || destination.spots[destination.spots.length - 1];
  const meal = (index) => meals[index] || meals[meals.length - 1];
  const lodging = lodgingTypes[0];

  if (input.duration === 'daytrip') {
    return [
      { day: '午前', items: [`${input.departure}を出発し、${spot(0)}へ。途中でトイレ休憩を1回入れる。`, `${spot(1)}で短めに散策や遊び時間を取る。`] },
      { day: '昼食', items: [`${meal(0)}を候補にする。子連れならフードコート、道の駅、テイクアウトも見ておく。`] },
      { day: '午後', items: [`${spot(2)}へ移動し、天気や疲れに合わせて${spot(3)}へ差し替える。`, 'おやつ休憩を入れて、夕方前に切り上げる。'] },
      { day: '帰路', items: ['渋滞前に帰路へ。車なら道の駅やサービスエリアで最後の休憩を入れる。'] }
    ];
  }

  if (input.duration === '1night') {
    return [
      { day: '1日目', items: [`午前は${input.departure}を出発し、${spot(0)}へ。`, `昼食は${meal(0)}。午後は${spot(1)}を短めに楽しむ。`, `夕方は${lodging}に入り、温泉や部屋で休む時間を確保する。`] },
      { day: '2日目', items: [`朝は宿周辺を散策し、${spot(2)}へ。`, `昼食は${meal(1)}。午後は${spot(3)}か道の駅で休憩してから帰路へ。`] }
    ];
  }

  if (input.duration === '2nights') {
    return [
      { day: '1日目', items: [`午前は${input.departure}を出発し、休憩を挟みながら${spot(0)}へ。`, `昼食は${meal(0)}。午後は${spot(1)}をメインにして、夕方は${lodging}へ。`] },
      { day: '2日目', items: [`午前は${spot(2)}をゆっくり楽しむ。`, `昼食は${meal(1)}。午後は${spot(3)}や周辺散策にして、夕方は2泊目の宿で休む。`, '2日目は帰路に向かわず、昼寝や温泉時間を長めに取る。'] },
      { day: '3日目', items: [`午前は${spot(4)}か道の駅で軽く過ごす。`, `昼食は${meal(2)}。午後は混雑前に帰路へ向かう。`] }
    ];
  }

  if (input.duration === '3nights') {
    return [
      { day: '1日目', items: [`${input.departure}を出発し、${spot(0)}と${spot(1)}を無理なく回る。`, `夕方は${lodging}で早めに休む。`] },
      { day: '2日目', items: [`${spot(2)}をメインにして、昼食は${meal(0)}。`, `午後は${spot(3)}へ。疲れたら宿やカフェ休憩へ切り替える。`] },
      { day: '3日目', items: [`${spot(4)}や周辺の自然散策を追加する。`, `昼食は${meal(1)}。夕方は宿で荷物整理と休憩をする。`] },
      { day: '4日目', items: [`午前は道の駅や市場で買い物。`, `昼食は${meal(2)}。午後は余裕を持って帰路へ。`] }
    ];
  }

  return [
    { day: '初日', items: [`${input.departure}を出発し、${spot(0)}と${spot(1)}を軽めに回る。`, `夕方は${lodging}で休む。`] },
    { day: '中日', items: [`${spot(2)}、${spot(3)}、${spot(4)}から天気と体力に合わせて選ぶ。`, `昼食は${meal(0)}や${meal(1)}を候補にする。何もしない半日も作る。`] },
    { day: '最終日', items: [`道の駅や市場で買い物をして、昼食は${meal(2)}。`, '午後は無理をせず帰路へ。'] }
  ];
}

function chooseMeals(destination, input) {
  const meals = [...destination.meals];
  if (input.childTotal > 0) {
    meals.push('子どもメニューがありそうな店');
    meals.push('道の駅・フードコート');
    meals.push('テイクアウトやベーカリー');
  }
  if (getOriginCategory(input.departure) === 'niigata') {
    meals.push('笹団子');
    meals.push('地酒は大人向けの注記として扱う');
  }
  return unique(meals);
}

function chooseLodgingTypes(destination, budgetLevel, purpose) {
  const wantsLuxury = hasAny(purpose, purposeSignalWords.luxury) || hasAny(purpose, purposeSignalWords.onsen);
  if (budgetLevel === 'high' || wantsLuxury) return destination.lodging.high;
  if (budgetLevel === 'low') return destination.lodging.low;
  return destination.lodging.standard;
}

function buildRestPoints(destination, input, childProfile) {
  const points = [...destination.childFriendlyPoints];
  if (input.transport === 'car') points.push('サービスエリア、道の駅、広めの駐車場を休憩軸にする');
  if (input.transport === 'train' || input.transport === 'shinkansen') points.push('駅近施設、コインロッカー、駅ビルのトイレを先に確認する');
  if (childProfile.stage === 'toddler') points.push('授乳、おむつ替え、昼寝のために屋内休憩を長めに取る');
  if (childProfile.stage === 'preschool') points.push('公園、牧場、水族館など短時間で達成感がある場所を挟む');
  if (childProfile.stage === 'school') points.push('体験や学びの前後に、売店やカフェ休憩を入れる');
  return unique(points);
}

function buildFamilyFit(destination, input, entry) {
  const people = `大人${input.adultTotal}人、子ども${input.childTotal}人`;
  if (!input.childTotal) {
    return `${people}で、${destination.meals[0]}や${entry.budgetLevel === 'high' ? destination.lodging.high[0] : destination.lodging.standard[0]}を落ち着いて楽しみたい家族。`;
  }
  const childText = input.childAges.length ? `${input.childAges.join('・')}の子ども` : '子ども';
  if (entry.childProfile.stage === 'toddler') return `${people}で、${childText}の昼寝や屋内休憩を優先しながら、${destination.areaName}を短めに楽しみたい家族。`;
  if (entry.childProfile.stage === 'preschool') return `${people}で、${childText}が公園、水族館、牧場などを短時間で楽しめる旅にしたい家族。`;
  return `${people}で、${childText}に自然体験や学びの要素も入れたい家族。`;
}

function getOriginCategory(departure) {
  const text = normalizeText(departure);
  if (hasAny(text, ['新潟', '長岡', '新発田', '燕', '三条', '上越', '妙高', '村上', '魚沼', '湯沢', '佐渡'])) return 'niigata';
  if (hasAny(text, ['上牧', '高槻', '大阪', '京都', '関西', '枚方', '茨木', '吹田', '神戸', '兵庫', '奈良', '滋賀', '和歌山', '堺'])) return 'kansai';
  return 'generic';
}

function getOriginLabel(originCategory) {
  if (originCategory === 'kansai') return '関西・大阪・高槻・上牧・京都発の候補';
  if (originCategory === 'niigata') return '新潟発の候補';
  return '一般的な近郊旅行の候補';
}

function getEstimatedMinutes(destination, originCategory) {
  return destination.estimatedMinutes[originCategory] || destination.estimatedMinutes.generic;
}

function analyzePurpose(purpose) {
  const text = normalizeText(purpose);
  const signals = new Set();
  Object.entries(purposeSignalWords).forEach(([key, words]) => {
    if (hasAny(text, words)) signals.add(key);
  });
  return signals;
}

function getBudgetLevel(budget) {
  if (budget === 'under20' || budget === 'under40') return 'low';
  if (budget === '100to150' || budget === '150to200' || budget === 'over200') return 'high';
  return 'standard';
}

function getChildProfile(input) {
  if (input.childTotal < 1) return { hasChildren: false, stage: 'adult', ages: [] };
  const ages = input.childAges.map(parseAge).filter((age) => Number.isFinite(age));
  if (!ages.length) return { hasChildren: true, stage: 'preschool', ages: [] };
  if (ages.some((age) => age <= 2)) return { hasChildren: true, stage: 'toddler', ages };
  if (ages.some((age) => age <= 6)) return { hasChildren: true, stage: 'preschool', ages };
  return { hasChildren: true, stage: 'school', ages };
}

function parseAge(label) {
  const match = String(label).match(/\d+/);
  return match ? Number(match[0]) : NaN;
}

function formatMinutes(minutes) {
  if (minutes < 60) return `約${minutes}分`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `約${hours}時間${rest}分` : `約${hours}時間`;
}

function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/[、，,／/・\s]+/g, ' ');
}

function hasAny(text, words) {
  const normalized = normalizeText(text);
  return words.some((word) => normalized.includes(normalizeText(word)));
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function renderPlanCard(plan) {
  const isSelected = plan.id === selectedPlanId;
  return `
    <button type="button" class="plan-summary-card${isSelected ? ' is-selected' : ''}" data-plan-id="${plan.id}" aria-pressed="${isSelected}">
      <span class="plan-label">${escapeHtml(plan.label)}</span>
      <span class="plan-card-title">${escapeHtml(plan.name)}</span>
      <span class="plan-card-area">おすすめエリア：${escapeHtml(plan.area)}</span>
      <span class="plan-card-concept">${escapeHtml(plan.concept)}</span>
      <span class="plan-card-reason">${escapeHtml(plan.shortReason)}</span>
    </button>
  `;
}

function renderPlanDetail(plan) {
  return `
    <article class="trip-plan">
      <div class="plan-title-row">
        <span class="plan-label">${escapeHtml(plan.label)}</span>
        <h3>${escapeHtml(plan.name)}</h3>
      </div>
      ${detailText('おすすめエリア', plan.area)}
      ${detailText('コンセプト', plan.concept)}
      ${detailText('おすすめ理由', plan.reason)}
      <section class="detail-row">
        <h4>日数に応じた旅程</h4>
        <div class="itinerary-grid">
          ${plan.itinerary.map((day) => dayBlock(day.day, day.items)).join('')}
        </div>
      </section>
      ${detailList('代表的な立ち寄りスポット', plan.spots)}
      ${detailList('食事候補', plan.meals)}
      ${detailList('宿タイプ', plan.lodgingTypes)}
      ${detailList('子連れ休憩ポイント', plan.rest)}
      ${detailList('雨の日代替案', plan.rainy)}
      ${detailList('注意点', plan.caution)}
      ${detailText('このプランが向いている家族', plan.fit)}
    </article>
  `;
}

function dayBlock(title, items) {
  return `
    <section class="day-card">
      <h5>${escapeHtml(title)}</h5>
      <ul>
        ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    </section>
  `;
}

function detailText(title, body) {
  return `
    <section class="detail-row">
      <h4>${escapeHtml(title)}</h4>
      <p>${escapeHtml(body)}</p>
    </section>
  `;
}

function detailList(title, items) {
  return `
    <section class="detail-row">
      <h4>${escapeHtml(title)}</h4>
      <ul class="detail-list">
        ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    </section>
  `;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[char]));
}
