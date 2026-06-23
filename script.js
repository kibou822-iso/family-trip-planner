const form = document.querySelector('#tripForm');
const result = document.querySelector('#result');
const historyPanel = document.querySelector('#history');
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
const lodgingPriceNotice = '宿泊料金は時期・曜日・人数・部屋タイプで大きく変わります。正確な料金、空室、子ども料金、食事条件は公式サイトや予約サイトで確認してください。';
const historyStorageKey = 'familyTripPlanner.searchHistory.v2';
const maxHistoryItems = 10;
const resultCount = 3;

const budgetLimits = {
  under20: { min: 0, max: 20000 },
  under40: { min: 20000, max: 40000 },
  under60: { min: 40000, max: 60000 },
  under80: { min: 60000, max: 80000 },
  under100: { min: 80000, max: 100000 },
  '100to150': { min: 100000, max: 150000 },
  '150to200': { min: 150000, max: 200000 },
  over200: { min: 200000, max: 300000 }
};

const originLabels = {
  'kansai-osaka-kyoto': '関西・大阪京都圏',
  'shiga-kyoto': '滋賀・京都圏',
  hyogo: '兵庫圏',
  nara: '奈良圏',
  niigata: '新潟圏',
  generic: 'その他・将来拡張エリア'
};

const conditionLabels = {
  within: '条件内の候補',
  expanded: '条件を少し広げた候補',
  overtime: '目的重視の移動時間オーバー候補'
};

const gachaActions = {
  search: '今回の候補',
  more: 'もっと候補',
  alternate: '別候補',
  gacha: '旅行先ガチャ',
  mode: '再提案'
};

const lodgingPriceBands = {
  low: {
    lowSeason: { adult: [6000, 12000], family: [25000, 60000] },
    highSeason: { adult: [10000, 18000], family: [45000, 90000] }
  },
  standard: {
    lowSeason: { adult: [14000, 26000], family: [60000, 130000] },
    highSeason: { adult: [24000, 42000], family: [100000, 210000] }
  },
  high: {
    lowSeason: { adult: [25000, 45000], family: [80000, 180000] },
    highSeason: { adult: [45000, 75000], family: [130000, 300000] }
  }
};

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
    id: 'fukui-wakasa-obama',
    areaName: '福井・若狭・小浜方面',
    departureCategoryLabel: '滋賀・京都・関西発',
    departureCategories: ['kansai'],
    estimatedMinutes: { kansai: 135, niigata: 430, generic: 170 },
    durations: ['daytrip', '1night', '2nights'],
    transports: ['car', 'train'],
    purposeKeywords: ['海', '海鮮', '自然', '市場', '道の駅', '子どもが遊べる', '近場'],
    childFriendlyPoints: ['道の駅や海沿い施設で休憩を挟みやすい', '海鮮と短時間散策を組み合わせやすい', '滋賀・京都側から比較的動きやすい'],
    rainyFriendly: true,
    onsen: true,
    nature: true,
    seafood: true,
    lodgeFocus: false,
    spots: ['若狭フィッシャーマンズ・ワーフ', '道の駅若狭おばま', '蘇洞門めぐり周辺', '御食国若狭おばま食文化館', '若狭和田ビーチ周辺'],
    meals: ['若狭フィッシャーマンズ・ワーフ', '道の駅若狭おばま', '小浜港周辺の海鮮食堂', '若狭ぐじ・鯖料理'],
    lodging: {
      high: ['若狭湾沿いの料理宿', '個室食相談がしやすい小規模宿', '海鮮会席重視の旅館'],
      standard: ['小浜・若狭のホテル', '和洋室のある宿', '駐車場つき旅館'],
      low: ['日帰り温泉', '公共の宿', '道の駅と市場中心の日帰り']
    },
    rainyAlternatives: ['御食国若狭おばま食文化館', '若狭フィッシャーマンズ・ワーフ', '道の駅若狭おばま'],
    cautions: ['冬の日本海側は天候を確認する', '海沿い移動は風が強い日がある'],
    concept: '滋賀・京都側から海鮮と海沿い散策を狙いやすい、近めの日本海プラン。',
    theme: 'near-seafood',
    areaGroup: 'kansai-fukui-sea',
    childFocus: ['preschool', 'school'],
    budgetFit: ['low', 'standard']
  },
  {
    id: 'echizen-coast',
    areaName: '越前海岸方面',
    departureCategoryLabel: '関西・滋賀・京都発',
    departureCategories: ['kansai'],
    estimatedMinutes: { kansai: 170, niigata: 390, generic: 210 },
    durations: ['1night', '2nights', '3nights'],
    transports: ['car'],
    purposeKeywords: ['海', '海鮮', 'カニ', '温泉', '自然', 'ドライブ', '高級旅館'],
    childFriendlyPoints: ['海岸ドライブを休憩多めに調整できる', '越前がにミュージアムなど屋内候補がある', '宿の食事時間を旅の中心にしやすい'],
    rainyFriendly: true,
    onsen: true,
    nature: true,
    seafood: true,
    lodgeFocus: true,
    spots: ['越前海岸', '越前がにミュージアム', '道の駅越前', '呼鳥門周辺', '越前温泉'],
    meals: ['道の駅越前', '越前がにミュージアム周辺の食事処', '越前海岸沿いの海鮮食堂', '旅館の海鮮会席'],
    lodging: {
      high: ['越前海岸の料理旅館', '海鮮会席重視の温泉宿', '貸切風呂相談がしやすい宿'],
      standard: ['越前温泉周辺の宿', '和洋室のある旅館', '駐車場つき宿'],
      low: ['公共の宿', '日帰り温泉と近隣ホテル', '道の駅中心の旅程']
    },
    rainyAlternatives: ['越前がにミュージアム', '道の駅越前', '宿の温泉時間を長めにする'],
    cautions: ['冬は道路と天候に余裕を持つ', 'カニ目的は季節で価格が大きく変わる'],
    concept: '日本海の海鮮と温泉宿を目的重視で楽しむ、食事中心の海岸プラン。',
    theme: 'sea-ryokan',
    areaGroup: 'kansai-fukui-sea',
    childFocus: ['preschool', 'school'],
    budgetFit: ['standard', 'high']
  },
  {
    id: 'tottori-iwami',
    areaName: '鳥取砂丘・岩美方面',
    departureCategoryLabel: '関西発',
    departureCategories: ['kansai'],
    estimatedMinutes: { kansai: 210, niigata: 620, generic: 260 },
    durations: ['1night', '2nights', '3nights'],
    transports: ['car', 'train'],
    purposeKeywords: ['海', '自然', '砂丘', '水族館', '海鮮', '子どもが遊べる', '体験'],
    childFriendlyPoints: ['砂丘は短時間でも非日常感が出る', '砂の美術館など屋内候補を入れやすい', '2泊なら移動負担を分散できる'],
    rainyFriendly: true,
    onsen: true,
    nature: true,
    seafood: true,
    lodgeFocus: false,
    spots: ['鳥取砂丘', '砂の美術館', '浦富海岸', '鳥取港海鮮市場かろいち', 'わらべ館'],
    meals: ['鳥取港海鮮市場かろいち', '砂丘会館周辺の食事処', '浦富海岸周辺の海鮮食堂', '旅館の会席料理'],
    lodging: {
      high: ['岩美・鳥取周辺の料理宿', '温泉つき旅館', '広めの和洋室がある宿'],
      standard: ['鳥取市内ホテル', '温泉宿', '駐車場つきホテル'],
      low: ['ビジネスホテル', '公共の宿', '市場と砂丘中心の旅程']
    },
    rainyAlternatives: ['砂の美術館', 'わらべ館', '鳥取港海鮮市場かろいち'],
    cautions: ['砂丘は暑さ・風・足元対策が必要', '日帰りより1泊以上が動きやすい'],
    concept: '砂丘と海鮮で非日常感を出せる、候補ガチャ向きの広域プラン。',
    theme: 'sand-sea',
    areaGroup: 'kansai-tottori-sea',
    childFocus: ['preschool', 'school'],
    budgetFit: ['standard', 'high']
  },
  {
    id: 'ako-himeji',
    areaName: '赤穂・姫路方面',
    departureCategoryLabel: '関西・兵庫発',
    departureCategories: ['kansai'],
    estimatedMinutes: { kansai: 150, niigata: 560, generic: 190 },
    durations: ['daytrip', '1night', '2nights'],
    transports: ['car', 'train'],
    purposeKeywords: ['海', '温泉', '城', '水族館', '自然', '子どもが遊べる', '海鮮'],
    childFriendlyPoints: ['姫路セントラルパークや城周辺に切り替えやすい', '赤穂温泉で宿滞在を作りやすい', '移動時間が広域候補の中では短め'],
    rainyFriendly: true,
    onsen: true,
    nature: true,
    seafood: true,
    lodgeFocus: true,
    spots: ['姫路城周辺', '姫路市立水族館', '姫路セントラルパーク', '赤穂温泉', '道の駅みつ'],
    meals: ['道の駅みつ', '姫路駅周辺の食事処', '赤穂温泉周辺の海鮮店', '旅館の会席料理'],
    lodging: {
      high: ['赤穂温泉の海沿い旅館', '料理重視の温泉宿', '貸切風呂相談がしやすい宿'],
      standard: ['姫路市内ホテル', '赤穂温泉の宿', '駐車場つきホテル'],
      low: ['ビジネスホテル', '日帰り温泉', '水族館と城中心の日帰り']
    },
    rainyAlternatives: ['姫路市立水族館', '姫路城周辺の屋内施設', '宿の温泉時間を増やす'],
    cautions: ['姫路城周辺は歩く距離が長くなりやすい', '赤穂温泉宿は早めに料金確認する'],
    concept: '海沿い温泉と姫路の屋内・動物系スポットを組み替えやすい兵庫西部プラン。',
    theme: 'castle-sea-onsen',
    areaGroup: 'kansai-hyogo-west',
    childFocus: ['preschool', 'school'],
    budgetFit: ['low', 'standard', 'high']
  },
  {
    id: 'hida-takayama',
    areaName: '飛騨高山方面',
    departureCategoryLabel: '関西・滋賀・京都発',
    departureCategories: ['kansai'],
    estimatedMinutes: { kansai: 240, niigata: 330, generic: 260 },
    durations: ['2nights', '3nights', 'longer'],
    transports: ['car', 'train'],
    purposeKeywords: ['自然', '温泉', '高級旅館', '町歩き', '食事', '牧場', '子どもが遊べる'],
    childFriendlyPoints: ['2泊以上なら移動を分散できる', '高山の町歩きと牧場系を組み合わせやすい', '宿滞在を長めに取れる'],
    rainyFriendly: true,
    onsen: true,
    nature: true,
    seafood: false,
    lodgeFocus: true,
    spots: ['高山古い町並', '飛騨の里', '牧歌の里方面', '奥飛騨温泉郷', '道の駅ななもり清見'],
    meals: ['高山古い町並周辺の食事処', '飛騨牛料理店', '道の駅ななもり清見', '旅館の会席料理'],
    lodging: {
      high: ['奥飛騨温泉郷の旅館', '飛騨牛会席重視の宿', '貸切風呂のある温泉宿'],
      standard: ['高山市内ホテル', '温泉宿', '和洋室のある宿'],
      low: ['ビジネスホテル', '公共の宿', '町歩き中心の旅程']
    },
    rainyAlternatives: ['飛騨の里', '古い町並の店舗巡り', '宿の温泉時間を長めにする'],
    cautions: ['関西からは移動が長く2泊以上向き', '冬は雪道や規制情報を確認する'],
    concept: '海ではなく山と温泉を広域に広げたいときの、2泊以上向きガチャ候補。',
    theme: 'mountain-onsen',
    areaGroup: 'kansai-hida',
    childFocus: ['preschool', 'school'],
    budgetFit: ['standard', 'high']
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

const routeMinuteOverrides = {
  'shiga-kyoto': {
    'kyotango-taiza': 200,
    'awaji-sumoto': 150,
    'kinosaki-kasumi': 205,
    'ise-shima-toba': 170,
    'shirahama-nanki': 230,
    'nagahama-hikone-biwako': 75,
    'nara-yoshino-soni': 95,
    'arima-kobe': 105,
    'tanba-sasayama': 95,
    'wakayama-marina-city': 120,
    'fukui-wakasa-obama': 120,
    'echizen-coast': 165,
    'tottori-iwami': 230,
    'ako-himeji': 170,
    'hida-takayama': 240
  },
  'kansai-osaka-kyoto': {
    'kyotango-taiza': 190,
    'awaji-sumoto': 130,
    'kinosaki-kasumi': 190,
    'ise-shima-toba': 170,
    'shirahama-nanki': 210,
    'nagahama-hikone-biwako': 95,
    'nara-yoshino-soni': 95,
    'arima-kobe': 80,
    'tanba-sasayama': 75,
    'wakayama-marina-city': 100,
    'fukui-wakasa-obama': 150,
    'echizen-coast': 190,
    'tottori-iwami': 210,
    'ako-himeji': 150,
    'hida-takayama': 250
  },
  hyogo: {
    'kyotango-taiza': 190,
    'awaji-sumoto': 90,
    'kinosaki-kasumi': 150,
    'ise-shima-toba': 210,
    'shirahama-nanki': 230,
    'nagahama-hikone-biwako': 150,
    'nara-yoshino-soni': 120,
    'arima-kobe': 45,
    'tanba-sasayama': 65,
    'wakayama-marina-city': 120,
    'fukui-wakasa-obama': 190,
    'echizen-coast': 220,
    'tottori-iwami': 180,
    'ako-himeji': 80,
    'hida-takayama': 270
  },
  nara: {
    'kyotango-taiza': 220,
    'awaji-sumoto': 150,
    'kinosaki-kasumi': 230,
    'ise-shima-toba': 150,
    'shirahama-nanki': 190,
    'nagahama-hikone-biwako': 130,
    'nara-yoshino-soni': 60,
    'arima-kobe': 110,
    'tanba-sasayama': 120,
    'wakayama-marina-city': 95,
    'fukui-wakasa-obama': 170,
    'echizen-coast': 220,
    'tottori-iwami': 240,
    'ako-himeji': 170,
    'hida-takayama': 270
  }
};

const mealFacilityOverrides = {
  'kyotango-taiza': [
    mealFacility('道の駅てんきてんき丹後', '京丹後・丹後町', '海鮮丼、地魚定食、軽食', '駐車場とトイレ休憩を兼ねやすい', '営業時間と混雑時間を確認'),
    mealFacility('丹後王国「食のみやこ」', '京丹後・弥栄町', '地元食材のレストラン、軽食、スイーツ', '屋内休憩を作りやすい', '営業日が季節で変わることがある'),
    mealFacility('間人・網野周辺の海鮮食堂', '間人・網野', '地魚、カニ、海鮮定食', '昼を早めにすると待ち時間を減らしやすい', '店名と営業日は現地で確認'),
    mealFacility('旅館の会席料理', '宿泊宿', '地魚会席、カニ料理', '移動後に個室食や部屋食を相談しやすい', '子ども食とアレルギー条件を要確認')
  ],
  'awaji-sumoto': [
    mealFacility('淡路サービスエリア', '淡路市', 'しらす丼、玉ねぎ料理、軽食', '到着前後の休憩に使いやすい', '休日は駐車場が混みやすい'),
    mealFacility('道の駅うずしお周辺', '南あわじ', '淡路バーガー、海鮮、玉ねぎ料理', '短時間で食べやすい候補が多い', '橋方面からは移動時間を確認'),
    mealFacility('洲本温泉周辺の海鮮店', '洲本', '海鮮定食、淡路牛、会席料理', '宿の近くで夕食候補にしやすい', '個室や座敷は事前確認'),
    mealFacility('淡路島牧場周辺の軽食', '南あわじ', '乳製品、ソフトクリーム、軽食', '子どもの気分転換に向く', '屋外中心なので天候注意')
  ],
  'kinosaki-kasumi': [
    mealFacility('城崎温泉街の食事処', '城崎温泉', '海鮮、そば、甘味', '温泉街散策と組み合わせやすい', 'ベビーカーは道幅と混雑に注意'),
    mealFacility('城崎マリンワールド周辺', '日和山海岸', '海鮮、軽食、館内レストラン', '雨の日や水族館滞在と相性がよい', '館内混雑時は時間をずらす'),
    mealFacility('道の駅あまるべ', '香美町', '海鮮、定食、軽食', '帰路前の休憩に使いやすい', '冬季は道路状況を確認'),
    mealFacility('香住漁港周辺の食事処', '香住', 'カニ、地魚、海鮮定食', '食事重視の家族に向く', '季節で価格差が大きい')
  ],
  'ise-shima-toba': [
    mealFacility('おかげ横丁', '伊勢', '伊勢うどん、てこね寿司、甘味', '食べ歩きと短い休憩を作りやすい', '混雑日は早めの時間が安心'),
    mealFacility('鳥羽駅周辺の海鮮店', '鳥羽駅周辺', '海鮮丼、焼き貝、定食', '水族館前後に寄りやすい', '座敷や子ども椅子は要確認'),
    mealFacility('鳥羽水族館周辺の食事処', '鳥羽', '軽食、定食、子ども向けメニュー', '雨の日に動線を短くできる', '昼時は混みやすい'),
    mealFacility('伊勢シーパラダイス周辺', '二見', '麺類、海鮮、軽食', '短時間で切り上げやすい', '施設営業日を確認')
  ],
  'shirahama-nanki': [
    mealFacility('とれとれ市場', '白浜', '海鮮丼、寿司、和歌山土産', '食事と買い物をまとめられる', '昼時は混雑しやすい'),
    mealFacility('アドベンチャーワールド内レストラン', '白浜', 'カレー、麺類、キッズ向けメニュー', '子どものペースで休憩しやすい', '入園日以外は使えない'),
    mealFacility('白浜温泉街周辺の食事処', '白浜', '海鮮、和歌山ラーメン、定食', '宿の近くで夕食候補にしやすい', '人気店は事前確認'),
    mealFacility('ホテルのビュッフェ', '白浜周辺', '和洋食、子ども向け料理', '子連れで取り分けしやすい', '宿泊プラン条件を確認')
  ],
  'nagahama-hikone-biwako': [
    mealFacility('道の駅湖北みずどりステーション', '長浜・湖北', '定食、軽食、地元野菜', '湖岸ドライブの休憩に使いやすい', '湖岸は風が強い日がある'),
    mealFacility('黒壁スクエア周辺の食事処', '長浜', '近江牛、カフェ、郷土料理', '散策を短く区切りやすい', '休日は駐車場を先に確認'),
    mealFacility('彦根城周辺の食事処', '彦根', '近江牛、麺類、甘味', '城周辺観光と組み合わせやすい', '坂や歩行距離に注意'),
    mealFacility('琵琶湖周辺の道の駅', '湖北・湖岸', '軽食、弁当、地元食材', '子どもの気分転換に向く', '営業時間を確認')
  ],
  'nara-yoshino-soni': [
    mealFacility('曽爾高原ファームガーデン', '曽爾', '定食、パン、乳製品', '高原散策前後に休憩しやすい', '季節営業や混雑を確認'),
    mealFacility('道の駅宇陀路大宇陀', '宇陀', '定食、軽食、地元野菜', '車移動の休憩に使いやすい', '高原方面との移動時間を確認'),
    mealFacility('奈良公園周辺の食事処', '奈良市', '柿の葉寿司、麺類、甘味', '雨の日の代替にしやすい', '観光地価格と混雑に注意'),
    mealFacility('吉野山周辺の食事処', '吉野', '葛料理、柿の葉寿司、定食', '自然散策と組み合わせやすい', '季節で営業が変わる')
  ],
  'arima-kobe': [
    mealFacility('有馬温泉街の食事処', '有馬温泉', 'そば、釜飯、甘味、軽食', '宿の前後に短く寄りやすい', '坂道と混雑に注意'),
    mealFacility('神戸ハーバーランドumie周辺', '神戸', 'フードコート、洋食、カフェ', '屋内で子どもと休憩しやすい', '駐車場と移動時間を確認'),
    mealFacility('神戸どうぶつ王国周辺', 'ポートアイランド', '館内軽食、周辺レストラン', '雨の日の動線を短くできる', '施設営業日を確認'),
    mealFacility('有馬温泉宿の会席料理', '宿泊宿', '会席、神戸牛、季節料理', '部屋食や個室食を相談しやすい', '子ども食を事前確認')
  ],
  'tanba-sasayama': [
    mealFacility('道の駅 丹波おばあちゃんの里', '丹波', '定食、パン、地元野菜', '休憩と買い物をまとめやすい', '週末は混みやすい'),
    mealFacility('篠山城下町周辺の食事処', '丹波篠山', '黒豆料理、そば、カフェ', '短い町歩きと相性がよい', '定休日を確認'),
    mealFacility('こんだ薬師温泉周辺', '丹波篠山', '定食、軽食、温泉後の食事', '入浴と休憩を組み合わせやすい', '温泉営業日を確認'),
    mealFacility('里山カフェ', '丹波篠山周辺', 'スイーツ、軽食、地元食材', '子どものおやつ休憩に向く', '席数が少ない店は注意')
  ],
  'wakayama-marina-city': [
    mealFacility('黒潮市場', '和歌山マリーナシティ', '海鮮丼、寿司、浜焼き', '市場と食事をまとめられる', '昼時は混雑しやすい'),
    mealFacility('ポルトヨーロッパ周辺', '和歌山マリーナシティ', '軽食、カフェ、フードコート', '子どもの遊び時間に合わせやすい', '遊園地営業日を確認'),
    mealFacility('和歌山マリーナシティホテル周辺', '和歌浦', 'ビュッフェ、洋食、和食', '宿泊時に移動を短くできる', '予約条件を確認'),
    mealFacility('和歌山市内のラーメン店', '和歌山市', '和歌山ラーメン', '帰路前の昼食に組みやすい', '行列店は避けると子連れ向き')
  ],
  'fukui-wakasa-obama': [
    mealFacility('若狭フィッシャーマンズ・ワーフ', '小浜', '海鮮、寿司、土産', '食事と買い物をまとめやすい', '遊覧船運航日は要確認'),
    mealFacility('道の駅若狭おばま', '小浜', '定食、鯖料理、軽食', '車移動の休憩に使いやすい', '昼時は混みやすい'),
    mealFacility('小浜港周辺の海鮮食堂', '小浜港', '海鮮丼、地魚定食', '海重視の昼食候補になる', '営業日と座敷を確認'),
    mealFacility('御食国若狭おばま食文化館周辺', '小浜', '郷土料理、軽食', '雨の日の屋内候補と合わせやすい', '施設営業日を確認')
  ],
  'echizen-coast': [
    mealFacility('道の駅越前', '越前町', '海鮮、定食、軽食', '海岸ドライブの休憩に使いやすい', '冬季は道路状況を確認'),
    mealFacility('越前がにミュージアム周辺', '越前町', 'カニ、海鮮、定食', '屋内施設と組み合わせやすい', 'カニ時期は価格変動が大きい'),
    mealFacility('越前海岸沿いの海鮮食堂', '越前海岸', '地魚、カニ、刺身定食', '食事重視の旅に向く', '店名と営業時間を事前確認'),
    mealFacility('旅館の海鮮会席', '越前温泉周辺', 'カニ会席、地魚会席', '宿でゆっくり食べやすい', '子ども食と個室条件を確認')
  ],
  'tottori-iwami': [
    mealFacility('鳥取港海鮮市場かろいち', '鳥取港', '海鮮丼、寿司、定食', '市場と休憩をまとめやすい', '昼時は混雑しやすい'),
    mealFacility('砂丘会館周辺の食事処', '鳥取砂丘', '定食、軽食、梨スイーツ', '砂丘観光と動線が短い', '砂丘散策後は水分補給を多めに'),
    mealFacility('浦富海岸周辺の海鮮食堂', '岩美', '地魚、海鮮定食', '海沿いドライブと相性がよい', '営業日を確認'),
    mealFacility('旅館の会席料理', '鳥取・岩美周辺', '海鮮、鳥取和牛、会席', '移動後に宿で休みやすい', '料金と食事条件を確認')
  ],
  'ako-himeji': [
    mealFacility('道の駅みつ', 'たつの', '海鮮、定食、軽食', '海沿い休憩に使いやすい', '休日は駐車場に注意'),
    mealFacility('姫路駅周辺の食事処', '姫路', '洋食、和食、麺類', '電車移動でも寄りやすい', '混雑時間をずらす'),
    mealFacility('赤穂温泉周辺の海鮮店', '赤穂', '牡蠣、海鮮、会席', '宿泊前後の食事候補になる', '牡蠣は季節で内容が変わる'),
    mealFacility('姫路市立水族館周辺', '姫路', '軽食、定食、カフェ', '雨の日の代替と合わせやすい', '施設営業日を確認')
  ],
  'hida-takayama': [
    mealFacility('高山古い町並周辺の食事処', '高山', '飛騨牛、そば、みたらし団子', '町歩きの途中で休憩しやすい', '混雑日は早めが安心'),
    mealFacility('道の駅ななもり清見', '高山周辺', '定食、飛騨牛、軽食', '車移動の休憩に使いやすい', '冬季は道路情報を確認'),
    mealFacility('飛騨の里周辺の食事処', '高山', '郷土料理、軽食', '屋内観光と組み合わせやすい', '営業時間を確認'),
    mealFacility('旅館の会席料理', '奥飛騨・高山', '飛騨牛、山の幸、会席', '宿滞在を長く取りやすい', '子ども料理を確認')
  ],
  'tsukioka-shibata': [
    mealFacility('月岡わくわくファーム', '月岡', '軽食、ジェラート、地元食材', '短時間休憩に向く', '営業日を確認'),
    mealFacility('月岡温泉街の食事処', '月岡温泉', '温泉街グルメ、甘味、定食', '宿の前後に寄りやすい', '夜営業は要確認'),
    mealFacility('道の駅加治川', '新発田', '定食、軽食、地元野菜', '車移動の休憩に使いやすい', '冬季の道路状況を確認'),
    mealFacility('温泉旅館の会席料理', '月岡温泉', '会席料理、地元食材', '個室食を相談しやすい', '子ども食を確認')
  ],
  'yahiko-teradomari': [
    mealFacility('寺泊魚の市場通り', '寺泊', '浜焼き、寿司、海鮮丼', '海鮮目的に分かりやすい', '昼時は混雑しやすい'),
    mealFacility('道の駅国上', '燕市', '定食、軽食、足湯周辺', '休憩と軽食に使いやすい', '足湯利用条件を確認'),
    mealFacility('弥彦神社周辺の食事処', '弥彦', 'そば、甘味、定食', '散策と組み合わせやすい', '参拝混雑に注意'),
    mealFacility('弥彦温泉宿の会席料理', '弥彦温泉', '会席、地元食材', '温泉宿でゆっくり食べやすい', '食事場所を確認')
  ],
  'nagaoka-echigo-park': [
    mealFacility('道の駅ながおか花火館', '長岡', 'フードコート、定食、土産', '屋内休憩に強い', 'イベント日は混雑確認'),
    mealFacility('国営越後丘陵公園周辺', '長岡', '軽食、弁当、テイクアウト', '遊び時間に合わせやすい', '季節で営業が変わる'),
    mealFacility('長岡駅周辺の食事処', '長岡', 'へぎそば、ラーメン、和食', '電車移動でも組みやすい', '駐車場を確認'),
    mealFacility('悠久山公園周辺の軽食', '長岡', '軽食、テイクアウト', '公園遊びと合わせやすい', '天候で滞在時間を調整')
  ],
  'joetsu-myoko': [
    mealFacility('道の駅あらい', '妙高', '定食、ラーメン、土産', '車移動の休憩に使いやすい', '休日は混みやすい'),
    mealFacility('上越市立水族博物館うみがたり周辺', '上越', '海鮮、軽食、館内レストラン', '雨の日の動線が短い', '館内混雑を確認'),
    mealFacility('上越妙高駅周辺の食事処', '上越妙高', 'そば、定食、カフェ', '電車移動で寄りやすい', '駅周辺の営業時間を確認'),
    mealFacility('赤倉温泉宿の食事', '妙高', '会席、郷土料理', '宿でゆっくり休める', '冬季の移動条件を確認')
  ],
  'senami-murakami': [
    mealFacility('村上町屋通り周辺の食事処', '村上', '鮭料理、村上牛、甘味', '短い町歩きと相性がよい', '定休日を確認'),
    mealFacility('瀬波温泉海岸周辺', '瀬波温泉', '海鮮、会席、軽食', '宿の近くで移動を減らせる', '海沿いの風に注意'),
    mealFacility('道の駅神林', '村上', '定食、地元食材、軽食', '車移動の休憩に使いやすい', '営業時間を確認'),
    mealFacility('温泉旅館の会席料理', '瀬波温泉', '海鮮会席、村上牛、鮭料理', '宿重視の旅に向く', '子ども食を確認')
  ],
  'uonuma-yuzawa': [
    mealFacility('越後湯沢駅構内施設', '越後湯沢', 'へぎそば、米どころの定食、土産', '電車でも車でも休憩しやすい', '繁忙期は混雑する'),
    mealFacility('魚沼の里', '南魚沼', '定食、カフェ、スイーツ', '屋内休憩を作りやすい', '施設営業日を確認'),
    mealFacility('道の駅南魚沼', '南魚沼', '定食、軽食、地元食材', '車移動の休憩に向く', '冬季道路を確認'),
    mealFacility('越後湯沢温泉宿の会席料理', '湯沢', '会席、米どころの料理', '宿で温泉と食事をまとめられる', '子ども料金を確認')
  ],
  sado: [
    mealFacility('佐渡汽船ターミナル周辺', '両津港', '軽食、海鮮、弁当', '船の時間に合わせやすい', 'フェリー時刻を優先'),
    mealFacility('両津港周辺の食事処', '佐渡・両津', '海鮮、寿司、定食', '到着後すぐ食べやすい', '営業日を確認'),
    mealFacility('佐渡金山周辺の食事処', '相川', '定食、軽食、地元料理', '屋内観光と合わせやすい', '移動時間に余裕を持つ'),
    mealFacility('島内宿の会席料理', '佐渡島内', '地魚、郷土料理、会席', '2泊以上でゆっくり食べやすい', '宿の送迎条件を確認')
  ],
  'niigata-city-coast': [
    mealFacility('ピアBandai', '新潟市中央区', '寿司、海鮮、地元食材', '市場感があり昼食を選びやすい', '昼時は混雑しやすい'),
    mealFacility('新潟ふるさと村', '新潟市西区', 'へぎそば、定食、土産、軽食', '屋内休憩と買い物をまとめやすい', 'イベント日は混雑確認'),
    mealFacility('マリンピア日本海周辺', '新潟市中央区', '軽食、カフェ、周辺食事処', '水族館前後に動線を短くできる', '館内営業時間を確認'),
    mealFacility('万代シテイ周辺', '新潟市中央区', 'フードコート、ラーメン、カフェ', '雨の日でも使いやすい', '駐車場と移動距離を確認')
  ]
};

let currentInput = null;
let currentMode = null;
let currentPlanSet = null;
let currentPlans = [];
let selectedPlanId = null;
let currentRound = 0;
let currentConditionKey = null;
let shownDestinationIds = [];
let searchHistory = loadHistory();

setupCountSelect(adultCount, 1, 9, 2);
setupCountSelect(childCount, 0, 9, 0);
updateCustomCountVisibility();
updateAgeFields();
renderHistory();

adultCount.addEventListener('change', updateCustomCountVisibility);
childCount.addEventListener('change', () => {
  updateCustomCountVisibility();
  updateAgeFields();
});
childCustom.addEventListener('input', updateAgeFields);

form.addEventListener('submit', (event) => {
  event.preventDefault();
  startSearchFromForm('search');
});

result.addEventListener('click', (event) => {
  const gachaButton = event.target.closest('[data-action]');
  if (gachaButton && currentInput) {
    generateNextPlanSet(gachaButton.dataset.action);
    return;
  }

  const modeButton = event.target.closest('[data-mode]');
  if (modeButton && currentInput) {
    currentInput = readForm();
    currentMode = modeButton.dataset.mode;
    currentRound = 1;
    currentConditionKey = makeConditionKey(currentInput, currentMode);
    shownDestinationIds = [];
    createAndRenderPlanSet('mode');
    return;
  }

  const planButton = event.target.closest('[data-plan-id]');
  if (planButton) {
    selectedPlanId = planButton.dataset.planId;
    renderSuggestions({ keepScroll: true });
  }
});

historyPanel.addEventListener('click', (event) => {
  const clearButton = event.target.closest('[data-clear-history]');
  if (clearButton) {
    searchHistory = [];
    saveHistory();
    renderHistory();
    return;
  }

  const historyButton = event.target.closest('[data-history-id]');
  if (!historyButton) return;

  const historyItem = searchHistory.find((item) => item.id === historyButton.dataset.historyId);
  if (!historyItem) return;
  restoreHistoryItem(historyItem);
});

function startSearchFromForm(action) {
  currentInput = readForm();
  currentMode = null;
  selectedPlanId = null;
  currentRound = 1;
  currentConditionKey = makeConditionKey(currentInput, currentMode);
  shownDestinationIds = [];
  createAndRenderPlanSet(action);
}

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

function generateNextPlanSet(action) {
  if (!currentInput) return;
  currentInput = readForm();
  const nextConditionKey = makeConditionKey(currentInput, currentMode);
  if (nextConditionKey !== currentConditionKey) {
    currentRound = 1;
    shownDestinationIds = [];
    currentConditionKey = nextConditionKey;
  } else {
    currentRound += 1;
  }
  selectedPlanId = null;
  createAndRenderPlanSet(action);
}

function createAndRenderPlanSet(action) {
  currentPlanSet = buildPlanSet(currentInput, {
    mode: currentMode,
    action,
    round: currentRound,
    shownIds: shownDestinationIds
  });
  currentPlans = currentPlanSet.plans;
  shownDestinationIds = unique(shownDestinationIds.concat(currentPlans.map((plan) => plan.id)));
  currentPlanSet.shownDestinationIds = shownDestinationIds;
  selectedPlanId = currentPlans.length ? currentPlans[0].id : null;
  addHistoryItem(currentPlanSet);
  renderSuggestions();
  renderHistory();
}

function renderSuggestions(options = {}) {
  if (!currentPlanSet) return;
  currentPlans = currentPlanSet.plans;
  if (!selectedPlanId || !currentPlans.some((plan) => plan.id === selectedPlanId)) {
    selectedPlanId = currentPlans.length ? currentPlans[0].id : null;
  }

  const selectedPlan = currentPlans.find((plan) => plan.id === selectedPlanId);
  const modeNote = currentMode ? suggestionModes[currentMode].tone : '入力条件に合わせて、条件に合う候補プールから3候補を出しました。';
  const roundLabel = `${currentPlanSet.actionLabel} ${currentPlanSet.round}回目`;

  result.innerHTML = `
    <div class="result-toolbar">
      <div>
        <span class="plan-area">${escapeHtml(roundLabel)}</span>
        <h2>${escapeHtml(currentInput.departure)}発・${escapeHtml(durations[currentInput.duration].label)}の候補プラン</h2>
        <p>${escapeHtml(modeNote)} ${escapeHtml(budgetAdvice[currentInput.budget])}</p>
        ${renderNoticeList(currentPlanSet.notices)}
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
      <div class="summary-heading">
        <div>
          <h3 id="summary-title">候補プラン一覧</h3>
          <p>${escapeHtml(currentPlanSet.poolSummary)}</p>
        </div>
        <div class="gacha-buttons" aria-label="候補ガチャ">
          <button type="button" class="secondary-button" data-action="alternate">別の候補を出す</button>
          <button type="button" class="secondary-button" data-action="more">もっと候補を見る</button>
          <button type="button" class="secondary-button gacha-button" data-action="gacha">旅行先ガチャ</button>
        </div>
      </div>
      ${renderPlanGroups(currentPlans)}
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

function buildPlanSet(input, options) {
  const scored = buildScoredEntries(input, options.mode);
  const selectedEntries = options.action === 'search' || options.action === 'mode'
    ? selectDistinctDestinations(scored, resultCount)
    : selectWeightedDestinations(scored, resultCount, options.shownIds, options.action);
  const actionLabel = gachaActions[options.action] || gachaActions.gacha;
  const plans = selectedEntries.map((entry, index) => createPlan(entry, input, index, actionLabel, options.round));
  const exhausted = scored.length > 0 && scored.every((entry) => options.shownIds.includes(entry.destination.id));
  const originProfile = normalizeDeparture(input.departure, input.purpose);

  return {
    id: createHistoryId(),
    createdAt: new Date().toISOString(),
    input: cloneInput(input),
    mode: options.mode,
    action: options.action,
    actionLabel,
    round: options.round,
    conditionKey: makeConditionKey(input, options.mode),
    originLabel: originProfile.label,
    plans,
    notices: buildSearchNotices(input, scored, plans, originProfile, exhausted),
    poolSummary: buildPoolSummary(scored, plans, originProfile)
  };
}

function buildScoredEntries(input, mode) {
  const originProfile = normalizeDeparture(input.departure, input.purpose);
  return destinationCatalog
    .filter((destination) => isDestinationAllowedForOrigin(destination, originProfile, input))
    .map((destination) => scoreDestination(destination, input, mode, originProfile))
    .filter((entry) => isEntryUsable(entry, input))
    .sort((a, b) => b.score - a.score);
}

function scoreDestination(destination, input, mode, originProfile = normalizeDeparture(input.departure, input.purpose)) {
  const originCategory = originProfile.catalogCategory;
  const signals = analyzePurpose(input.purpose);
  const budgetLevel = getBudgetLevel(input.budget);
  const childProfile = getChildProfile(input);
  const estimatedMinutes = getEstimatedMinutes(destination, originProfile);
  const maxMinutes = travelTimes[input.travelTime].minutes;
  const timeBucket = getTimeBucket(estimatedMinutes, maxMinutes);
  const purposeScore = scorePurpose(destination, signals);
  let score = 0;

  if (destination.departureCategories.includes(originCategory)) {
    score += 55;
  } else if (originCategory === 'generic') {
    score += 12;
  } else {
    score -= 120;
  }

  if (maxMinutes >= 999) {
    score += estimatedMinutes <= 300 ? 22 : 4;
  } else if (estimatedMinutes <= maxMinutes) {
    score += 34 + Math.max(0, (maxMinutes - estimatedMinutes) / 16);
  } else if (timeBucket === 'expanded') {
    score += 6 - (estimatedMinutes - maxMinutes) / 18;
  } else {
    score -= Math.min(70, (estimatedMinutes - maxMinutes) / 6);
    if (purposeScore >= 24) score += 20;
  }

  if (maxMinutes <= 30 && estimatedMinutes <= 35) score += 16;
  if (maxMinutes <= 60 && estimatedMinutes <= 75) score += 12;
  if (maxMinutes <= 60 && estimatedMinutes > 150) score -= 34;
  if (maxMinutes >= 180 && estimatedMinutes >= 120 && destination.departureCategories.includes(originCategory)) score += 10;
  if (maxMinutes >= 999 && estimatedMinutes >= 120 && destination.departureCategories.includes(originCategory)) score += 14;

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

  score += purposeScore;
  score += scoreBudget(destination, budgetLevel, estimatedMinutes);
  score += scoreChildren(destination, childProfile, estimatedMinutes);
  score += scoreMode(destination, mode, estimatedMinutes);

  return {
    destination,
    score,
    estimatedMinutes,
    timeBucket,
    originCategory,
    originProfile,
    signals,
    budgetLevel,
    childProfile,
    purposeScore
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

function isDestinationAllowedForOrigin(destination, originProfile, input) {
  if (originProfile.catalogCategory === 'generic') return true;
  if (destination.departureCategories.includes(originProfile.catalogCategory)) return true;
  if (originProfile.catalogCategory === 'kansai') return mentionsRemoteArea(input.purpose, 'niigata');
  if (originProfile.catalogCategory === 'niigata') return mentionsRemoteArea(input.purpose, 'kansai');
  return false;
}

function isEntryUsable(entry, input) {
  if (travelTimes[input.travelTime].minutes >= 999) return entry.score > -40;
  if (entry.timeBucket === 'within') return entry.score > -50;
  if (entry.timeBucket === 'expanded') return entry.score > -30;
  return entry.purposeScore >= 24 && entry.score > -35;
}

function getTimeBucket(estimatedMinutes, maxMinutes) {
  if (maxMinutes >= 999 || estimatedMinutes <= maxMinutes) return 'within';
  const tolerance = maxMinutes <= 60 ? 45 : maxMinutes <= 120 ? 60 : 75;
  if (estimatedMinutes <= maxMinutes + tolerance) return 'expanded';
  return 'overtime';
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
    if (!sameTheme) selected.push(entry);
  });

  scored.forEach((entry) => {
    if (selected.length >= count) return;
    if (!selected.some((selectedEntry) => selectedEntry.destination.id === entry.destination.id)) selected.push(entry);
  });

  return selected.slice(0, count);
}

function selectWeightedDestinations(scored, count, shownIds, action) {
  const selected = [];
  const pool = scored.slice(0, Math.max(8, scored.length));
  const seenSet = new Set(shownIds);
  const minScore = pool.reduce((min, entry) => Math.min(min, entry.score), pool[0]?.score || 0);

  while (selected.length < count && selected.length < pool.length) {
    const candidates = pool.filter((entry) => !selected.some((selectedEntry) => selectedEntry.destination.id === entry.destination.id));
    const weighted = candidates.map((entry, index) => {
      const alreadySeen = seenSet.has(entry.destination.id);
      const topCandidate = index === 0;
      let weight = Math.max(1, entry.score - minScore + 12);
      if (alreadySeen) weight *= topCandidate ? 0.65 : 0.18;
      if (action === 'gacha') weight *= entry.timeBucket === 'within' ? 1 : 1.18;
      if (action === 'more' && !alreadySeen) weight *= 1.45;
      return { entry, weight };
    });
    selected.push(weightedPick(weighted));
  }

  return selected;
}

function weightedPick(weighted) {
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  let cursor = Math.random() * total;
  for (const item of weighted) {
    cursor -= item.weight;
    if (cursor <= 0) return item.entry;
  }
  return weighted[weighted.length - 1].entry;
}

function createPlan(entry, input, index, actionLabel = gachaActions.search, round = 1) {
  const destination = entry.destination;
  const lodgingTypes = chooseLodgingTypes(destination, entry.budgetLevel, input.purpose);
  const meals = chooseMeals(destination, input);
  const mealOptions = chooseMealOptions(destination, input);
  const lodgingExamples = buildLodgingExamples(destination, entry.budgetLevel, input.purpose, input);
  const costEstimate = buildCostEstimate(destination, input, entry);
  const selectionReasons = buildSelectionReasons(destination, entry, input);

  return {
    id: destination.id,
    label: `${actionLabel} ${round}回目`,
    rankLabel: index === 0 ? '本命候補' : `別案${index + 1}`,
    timeBucket: entry.timeBucket,
    timeBucketLabel: conditionLabels[entry.timeBucket],
    name: `${destination.areaName} ${buildPlanSuffix(destination, entry, input)}`,
    area: buildRecommendedArea(destination),
    concept: destination.concept,
    shortReason: buildShortReason(destination, entry, input),
    reason: buildReason(destination, entry, input),
    selectionReasons,
    estimatedMinutes: entry.estimatedMinutes,
    itinerary: buildItinerary(destination, input, mealOptions, lodgingTypes),
    spots: destination.spots,
    meals,
    mealOptions,
    lodgingTypes,
    lodgingExamples,
    costEstimate,
    rest: buildRestPoints(destination, input, entry.childProfile),
    rainy: destination.rainyAlternatives,
    caution: destination.cautions.concat(officialNotice, lodgingPriceNotice),
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
  const timeText = entry.timeBucket === 'within'
    ? `希望の${travelTimes[input.travelTime].label}に収まり`
    : entry.timeBucket === 'expanded'
      ? `希望より少し長い${formatMinutes(entry.estimatedMinutes)}目安ですが`
      : `移動時間オーバーの${formatMinutes(entry.estimatedMinutes)}目安ですが`;
  return `${transports[input.transport]}で${timeText}、${matches}を具体的に組み込みやすいからです。`;
}

function buildReason(destination, entry, input) {
  const durationLabel = durations[input.duration].label;
  const originLabel = getOriginLabel(entry.originProfile);
  const childNote = buildChildReason(entry.childProfile);
  const timeNote = entry.timeBucket === 'within'
    ? `希望移動時間内の${formatMinutes(entry.estimatedMinutes)}が目安です。`
    : entry.timeBucket === 'expanded'
      ? `希望より少し広げると${formatMinutes(entry.estimatedMinutes)}目安で現実的です。`
      : `希望移動時間は${travelTimes[input.travelTime].label}ですが、目的との相性が高いため移動時間オーバー候補として${formatMinutes(entry.estimatedMinutes)}目安で表示しています。`;
  return `${originLabel}として判定しました。${input.departure}発の${transports[input.transport]}移動で、${timeNote}${durationLabel}なら${destination.spots[0]}、${destination.spots[1]}、${destination.spots[2]}を無理なく分けられ、${chooseMealOptions(destination, input).slice(0, 2).map((meal) => meal.name).join('や')}も入れやすいです。${childNote}`;
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
  const meal = (index) => (meals[index] || meals[meals.length - 1]).name;
  const lodging = lodgingTypes[0];

  if (input.duration === 'daytrip') {
    return [
      itineraryRow('日帰り', '午前', '出発・休憩', `${input.departure} → ${spot(0)}`, '途中でSA・道の駅・駅トイレ休憩を1回入れる'),
      itineraryRow('日帰り', '昼', '昼食', meal(0), '混雑前に入り、子ども椅子や座敷を確認する'),
      itineraryRow('日帰り', '午後', 'メイン観光', spot(1), '滞在を60〜90分で区切り、疲れたら短縮する'),
      itineraryRow('日帰り', '夕方', '帰路', `${spot(2)} → 自宅方面`, '夕方の渋滞前に出発し、最後に休憩を入れる')
    ];
  }

  if (input.duration === '1night') {
    return [
      itineraryRow('1日目', '午前', '出発・休憩', `${input.departure} → ${destination.areaName}`, '途中でSA・道の駅休憩を入れる'),
      itineraryRow('1日目', '昼', '昼食', meal(0), '子どもメニューや座敷を確認する'),
      itineraryRow('1日目', '午後', 'メイン観光', `${spot(0)}・${spot(1)}`, '滞在時間を短めに区切る'),
      itineraryRow('1日目', '夕方', '宿へ', lodging, '早めにチェックインして温泉や部屋で休む'),
      itineraryRow('2日目', '午前', '軽めの観光', spot(2), '疲れが出る前に短時間で切り上げる'),
      itineraryRow('2日目', '昼', '昼食', meal(1), '混雑前に入店する'),
      itineraryRow('2日目', '午後', '帰路', `${spot(3)}・道の駅 → 自宅方面`, '途中休憩を入れて無理なく帰る')
    ];
  }

  if (input.duration === '2nights') {
    return [
      itineraryRow('1日目', '午前', '出発・休憩', `${input.departure} → ${destination.areaName}`, '移動中に2回ほど休憩を挟む'),
      itineraryRow('1日目', '昼', '昼食', meal(0), '到着直後は待ち時間が短い施設を優先する'),
      itineraryRow('1日目', '午後', '軽めの観光', spot(0), '初日は詰め込みすぎない'),
      itineraryRow('1日目', '夕方', '宿へ', lodging, '早めにチェックインする'),
      itineraryRow('2日目', '午前', 'メイン観光', spot(1), '2日目は帰路に向かわず、しっかり遊ぶ日にする'),
      itineraryRow('2日目', '昼', '昼食', meal(1), '昼寝や休憩を前提に席を確保する'),
      itineraryRow('2日目', '午後', '追加観光', `${spot(2)}・${spot(3)}`, '疲れたら宿や屋内休憩へ切り替える'),
      itineraryRow('2日目', '夕方', '宿で休む', '2泊目の宿', '温泉・部屋時間を長めに取る'),
      itineraryRow('3日目', '午前', '軽めの観光', spot(4), '買い物や短い散策にする'),
      itineraryRow('3日目', '昼', '昼食', meal(2), '混雑前に食べて帰路に備える'),
      itineraryRow('3日目', '午後', '帰路', '自宅方面', '途中休憩を多めに入れる')
    ];
  }

  if (input.duration === '3nights') {
    return [
      itineraryRow('1日目', '午前', '出発・移動', `${input.departure} → ${destination.areaName}`, '移動負担を見て早め出発にする'),
      itineraryRow('1日目', '午後', '軽めの観光', spot(0), '初日は短めにして宿で休む'),
      itineraryRow('2日目', '午前', 'メイン観光', spot(1), '子どもの体力がある時間に入れる'),
      itineraryRow('2日目', '昼', '昼食', meal(0), '昼食後に休憩時間を確保する'),
      itineraryRow('2日目', '午後', '追加観光', spot(2), '雨なら屋内施設へ差し替える'),
      itineraryRow('3日目', '午前', '自然・体験', spot(3), '短時間で達成感のある体験にする'),
      itineraryRow('3日目', '昼', '昼食', meal(1), '移動しすぎず近場で済ませる'),
      itineraryRow('3日目', '午後', '宿・周辺散策', spot(4), '荷物整理と休憩を入れる'),
      itineraryRow('4日目', '午前', '買い物・軽食', meal(2), '道の駅や市場で短く過ごす'),
      itineraryRow('4日目', '午後', '帰路', '自宅方面', '余裕を持って帰る')
    ];
  }

  return [
    itineraryRow('初日', '午後', '到着・軽めの観光', `${spot(0)}・${spot(1)}`, '長旅後は短時間で切り上げる'),
    itineraryRow('中日', '午前', 'メイン観光', `${spot(2)}・${spot(3)}`, '天気と体力で選ぶ'),
    itineraryRow('中日', '昼', '昼食', `${meal(0)}・${meal(1)}`, '何もしない半日も作る'),
    itineraryRow('最終日', '午前', '買い物・休憩', spot(4), '道の駅や市場で短く過ごす'),
    itineraryRow('最終日', '午後', '帰路', '自宅方面', '無理をせず帰る')
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
  return normalizeDeparture(departure).catalogCategory;
}

function getOriginLabel(originProfile) {
  if (typeof originProfile === 'string') {
    if (originProfile === 'kansai') return '関西圏発の候補';
    if (originProfile === 'niigata') return '新潟圏発の候補';
  }
  if (originProfile?.catalogCategory === 'kansai') return `${originProfile.label}発の候補`;
  if (originProfile?.catalogCategory === 'niigata') return '新潟圏発の候補';
  return '一般的な近郊旅行の候補';
}

function getEstimatedMinutes(destination, originProfile) {
  if (typeof originProfile === 'string') {
    return destination.estimatedMinutes[originProfile] || destination.estimatedMinutes.generic;
  }
  const routeOverride = routeMinuteOverrides[originProfile.id]?.[destination.id];
  if (routeOverride) return routeOverride;
  return destination.estimatedMinutes[originProfile.catalogCategory] || destination.estimatedMinutes.generic;
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

function itineraryRow(day, time, action, place, memo) {
  return { day, time, action, place, memo };
}

function mealFacility(name, area, food, familyMemo, caution) {
  return { name, area, food, familyMemo, caution };
}

function chooseMealOptions(destination, input) {
  const options = mealFacilityOverrides[destination.id] || destination.meals.map((meal) => (
    mealFacility(meal, destination.areaName, meal, '行程に合わせて短時間で使いやすい候補です', '営業日と席条件を確認')
  ));
  const extras = [];
  if (input.childTotal > 0) {
    extras.push(mealFacility('道の駅・フードコート', destination.areaName, '定食、軽食、テイクアウト', '子どもの機嫌に合わせて短時間で済ませやすい', '混雑時間をずらす'));
  }
  return uniqueObjectsByName(options.concat(extras)).slice(0, 5);
}

function buildLodgingExamples(destination, budgetLevel, purpose, input) {
  const wantsLuxury = hasAny(purpose, purposeSignalWords.luxury) || hasAny(purpose, purposeSignalWords.onsen);
  const level = wantsLuxury && budgetLevel !== 'low' ? 'high' : budgetLevel;
  const types = chooseLodgingTypes(destination, level, purpose);
  const priceBand = lodgingPriceBands[level] || lodgingPriceBands.standard;
  const nights = Math.max(1, durations[input.duration].nights || 1);
  const familyMultiplier = nights;
  const examples = types.slice(0, 3).map((type, index) => ({
    name: `宿タイプ例：${type}`,
    area: destination.areaName,
    type,
    reason: buildLodgingReason(destination, type, index, level),
    lowSeason: `大人1人1泊 ${formatYenRange(priceBand.lowSeason.adult)} / 家族総額 ${formatYenRange(multiplyRange(priceBand.lowSeason.family, familyMultiplier))}程度`,
    highSeason: `大人1人1泊 ${formatYenRange(priceBand.highSeason.adult)} / 家族総額 ${formatYenRange(multiplyRange(priceBand.highSeason.family, familyMultiplier))}程度`,
    familyTotal: `大人${input.adultTotal}人・子ども${input.childTotal}人・${durations[input.duration].label}で ${formatYenRange(multiplyRange(priceBand.lowSeason.family, familyMultiplier))}〜${formatYen(multiplyRange(priceBand.highSeason.family, familyMultiplier)[1])}程度`,
    caution: '実在宿名を断定せず宿タイプ例として表示しています。予約前に公式サイトや予約サイトで条件を確認してください。'
  }));

  while (examples.length < 3) {
    examples.push({
      name: `宿タイプ例：${destination.lodging.standard[examples.length % destination.lodging.standard.length]}`,
      area: destination.areaName,
      type: '比較用の宿タイプ',
      reason: '予算や空室に合わせて比較しやすい補助候補です',
      lowSeason: `大人1人1泊 ${formatYenRange(lodgingPriceBands.standard.lowSeason.adult)} / 家族総額 ${formatYenRange(lodgingPriceBands.standard.lowSeason.family)}程度`,
      highSeason: `大人1人1泊 ${formatYenRange(lodgingPriceBands.standard.highSeason.adult)} / 家族総額 ${formatYenRange(lodgingPriceBands.standard.highSeason.family)}程度`,
      familyTotal: `大人${input.adultTotal}人・子ども${input.childTotal}人で ${formatYenRange(lodgingPriceBands.standard.lowSeason.family)}〜${formatYen(lodgingPriceBands.standard.highSeason.family[1])}程度`,
      caution: '宿タイプ例です。実際の宿名、料金、子ども条件は予約前に確認してください。'
    });
  }

  return examples;
}

function buildLodgingReason(destination, type, index, level) {
  if (level === 'high' && destination.seafood) return '料理重視・海鮮重視の目的と相性がよく、宿滞在そのものを旅の中心にできます';
  if (level === 'high' && destination.onsen) return '温泉と部屋で休む時間を確保しやすく、子連れでも予定を詰め込みすぎずに済みます';
  if (level === 'low') return '宿泊費を抑え、食事や観光費に予算を回しやすい選択肢です';
  if (index === 0) return '家族で動きやすい立地と休憩時間を取りやすい宿タイプです';
  return '予算・空室・食事条件に合わせて比較しやすい宿タイプです';
}

function buildCostEstimate(destination, input, entry) {
  const nights = durations[input.duration].nights;
  const budgetLevel = entry.budgetLevel;
  const baseLevel = budgetLevel === 'low' ? 'low' : budgetLevel === 'high' || destination.lodgeFocus ? 'high' : 'standard';
  const lodging = lodgingPriceBands[baseLevel];
  const nightMultiplier = Math.max(1, nights || 1);
  const lodgingLow = nights ? multiplyRange(lodging.lowSeason.family, nightMultiplier) : [0, 0];
  const lodgingHigh = nights ? multiplyRange(lodging.highSeason.family, nightMultiplier) : [0, 0];
  const mealLow = multiplyRange([15000, 25000], Math.max(1, durations[input.duration].days / 2));
  const mealHigh = multiplyRange([20000, 35000], Math.max(1, durations[input.duration].days / 2));
  const transportLow = estimateTransportRange(entry.estimatedMinutes, input.transport, false);
  const transportHigh = estimateTransportRange(entry.estimatedMinutes, input.transport, true);
  const activityLow = multiplyRange([5000, 12000], Math.max(1, durations[input.duration].days / 2));
  const activityHigh = multiplyRange([8000, 18000], Math.max(1, durations[input.duration].days / 2));

  const lowSeason = {
    lodging: lodgingLow,
    meals: mealLow,
    transport: transportLow,
    activity: activityLow,
    total: sumRanges([lodgingLow, mealLow, transportLow, activityLow])
  };
  const highSeason = {
    lodging: lodgingHigh,
    meals: mealHigh,
    transport: transportHigh,
    activity: activityHigh,
    total: sumRanges([lodgingHigh, mealHigh, transportHigh, activityHigh])
  };

  return {
    lowSeason,
    highSeason,
    budgetNote: buildBudgetGapNote(input.budget, lowSeason.total, highSeason.total)
  };
}

function estimateTransportRange(minutes, transport, highSeason) {
  if (transport === 'train' || transport === 'shinkansen') {
    const base = minutes > 180 ? [18000, 42000] : minutes > 90 ? [10000, 24000] : [5000, 14000];
    return highSeason ? multiplyRange(base, 1.15) : base;
  }
  if (transport === 'flight') return highSeason ? [80000, 180000] : [60000, 140000];
  if (minutes > 180) return highSeason ? [14000, 26000] : [10000, 20000];
  if (minutes > 90) return highSeason ? [10000, 18000] : [8000, 15000];
  return highSeason ? [7000, 13000] : [5000, 10000];
}

function buildBudgetGapNote(budget, lowTotal, highTotal) {
  const limit = budgetLimits[budget];
  if (!limit) return '';
  if (lowTotal[0] <= limit.max) return '';
  return '入力予算内に収めるなら、宿ランクを下げる・平日やローシーズンにする・食事を昼中心にするのがおすすめです。';
}

function buildSelectionReasons(destination, entry, input) {
  const reasons = [];
  const matches = summarizeMatches(destination, entry, input);
  if (matches.length) reasons.push(`目的一致：${matches.slice(0, 3).join('・')}に合う`);
  reasons.push(`移動時間：${entry.timeBucket === 'within' ? `希望${travelTimes[input.travelTime].label}に近い` : `${formatMinutes(entry.estimatedMinutes)}目安の${conditionLabels[entry.timeBucket]}`}`);
  if (input.childTotal > 0) reasons.push(`子連れ：${destination.childFriendlyPoints[0]}`);
  reasons.push(`予算：${budgets[input.budget]}なら${entry.budgetLevel === 'high' ? '宿重視で組みやすい' : entry.budgetLevel === 'low' ? '低予算寄りに調整しやすい' : '食事と宿のバランスを取りやすい'}`);
  if (destination.rainyFriendly) reasons.push(`雨の日：${destination.rainyAlternatives[0]}に差し替えやすい`);
  return reasons;
}

function renderPlanGroups(plans) {
  const order = ['within', 'expanded', 'overtime'];
  return order.map((key) => {
    const grouped = plans.filter((plan) => plan.timeBucket === key);
    if (!grouped.length) return '';
    return `
      <section class="candidate-group">
        <h4>${escapeHtml(conditionLabels[key])}</h4>
        <div class="plan-card-list">
          ${grouped.map((plan) => renderPlanCard(plan)).join('')}
        </div>
      </section>
    `;
  }).join('');
}

function renderNoticeList(notices) {
  if (!notices.length) return '';
  return `
    <ul class="notice-list">
      ${notices.map((notice) => `<li>${escapeHtml(notice)}</li>`).join('')}
    </ul>
  `;
}

function buildSearchNotices(input, scored, plans, originProfile, exhausted) {
  const notices = [];
  const signals = analyzePurpose(input.purpose);
  const maxMinutes = travelTimes[input.travelTime].minutes;
  const withinCount = scored.filter((entry) => entry.timeBucket === 'within').length;
  const hasOvertime = plans.some((plan) => plan.timeBucket === 'overtime');

  if (originProfile.catalogCategory === 'kansai') {
    notices.push(`${originProfile.label}発として判定し、新潟方面の候補は目的欄に新潟・佐渡などが明示されない限り通常除外しています。`);
  }
  if (originProfile.catalogCategory === 'niigata') {
    notices.push('新潟圏発として判定し、関西方面の候補は目的欄に関西・京都・大阪などが明示されない限り通常除外しています。');
  }
  if (maxMinutes <= 60 && signals.has('sea') && (signals.has('luxury') || signals.has('seafood'))) {
    notices.push(`${travelTimes[input.travelTime].label}で海と高級旅館・海鮮を両立できる候補は少なめです。近場重視なら有馬温泉・おごと温泉・琵琶湖周辺、海重視なら淡路島・京丹後・伊勢志摩まで移動時間を広げると候補が増えます。`);
  }
  if (withinCount === 0 && scored.length) {
    notices.push(`希望移動時間内の候補が少ないため、条件を少し広げた候補と目的重視の候補を分けて表示しています。`);
  }
  if (hasOvertime) {
    notices.push(`希望移動時間は${travelTimes[input.travelTime].label}ですが、目的との相性が高い候補は移動時間オーバー候補として明示しています。`);
  }
  if (exhausted) {
    notices.push('条件に合う候補を一巡しました。移動時間や目的を広げると別候補が出やすくなります。');
  }
  return unique(notices);
}

function buildPoolSummary(scored, plans, originProfile) {
  const within = scored.filter((entry) => entry.timeBucket === 'within').length;
  const expanded = scored.filter((entry) => entry.timeBucket === 'expanded').length;
  const overtime = scored.filter((entry) => entry.timeBucket === 'overtime').length;
  const shown = plans.map((plan) => plan.name.replace(/\s.+$/, '')).join('、');
  return `${originProfile.label}から候補プール${scored.length}件（条件内${within}件・少し広げた候補${expanded}件・目的重視${overtime}件）を評価し、今回は${shown}を表示しています。`;
}

function normalizeDeparture(departure, purpose = '') {
  const text = normalizeText(departure);
  if (hasAny(text, ['大津', '大津市', '草津', '守山', '滋賀'])) return originProfile('shiga-kyoto', 'kansai');
  if (hasAny(text, ['上牧', '上牧駅', '高槻', '大阪', '京都', '茨木', '枚方', '吹田', '関西', '堺'])) return originProfile('kansai-osaka-kyoto', 'kansai');
  if (hasAny(text, ['神戸', '西宮', '明石', '兵庫'])) return originProfile('hyogo', 'kansai');
  if (hasAny(text, ['奈良', '生駒', '橿原'])) return originProfile('nara', 'kansai');
  if (hasAny(text, ['新潟', '新潟市', '長岡', '燕三条', '新発田', '燕', '三条', '上越', '妙高', '村上', '魚沼', '湯沢', '佐渡'])) return originProfile('niigata', 'niigata');
  return originProfile('generic', 'generic');
}

function originProfile(id, catalogCategory) {
  return { id, catalogCategory, label: originLabels[id] || originLabels.generic };
}

function mentionsRemoteArea(purpose, area) {
  const text = normalizeText(purpose);
  if (area === 'niigata') return hasAny(text, ['新潟', '佐渡', '越後', '月岡', '瀬波', '弥彦', '寺泊']);
  if (area === 'kansai') return hasAny(text, ['関西', '大阪', '京都', '滋賀', '神戸', '奈良', '淡路', '伊勢', '白浜', '城崎']);
  return false;
}

function makeConditionKey(input, mode) {
  return JSON.stringify({ ...cloneInput(input), mode: mode || '' });
}

function cloneInput(input) {
  return {
    departure: input.departure,
    duration: input.duration,
    transport: input.transport,
    travelTime: input.travelTime,
    purpose: input.purpose,
    adultTotal: input.adultTotal,
    childTotal: input.childTotal,
    childAges: [...input.childAges],
    budget: input.budget
  };
}

function createHistoryId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(historyStorageKey) || '[]');
    return Array.isArray(parsed) ? parsed.slice(0, maxHistoryItems) : [];
  } catch (error) {
    return [];
  }
}

function saveHistory() {
  localStorage.setItem(historyStorageKey, JSON.stringify(searchHistory.slice(0, maxHistoryItems)));
}

function addHistoryItem(planSet) {
  const item = {
    ...planSet,
    summary: planSet.plans.map((plan) => plan.name.split(' ')[0]).join('、')
  };
  searchHistory = [item, ...searchHistory.filter((historyItem) => historyItem.conditionKey !== item.conditionKey || historyItem.round !== item.round || historyItem.action !== item.action)].slice(0, maxHistoryItems);
  saveHistory();
}

function restoreHistoryItem(historyItem) {
  currentInput = cloneInput(historyItem.input);
  currentMode = historyItem.mode || null;
  currentRound = historyItem.round;
  currentConditionKey = historyItem.conditionKey;
  shownDestinationIds = historyItem.shownDestinationIds || historyItem.plans.map((plan) => plan.id);
  currentPlanSet = historyItem;
  currentPlans = historyItem.plans;
  selectedPlanId = currentPlans[0]?.id || null;
  applyInputToForm(currentInput);
  renderSuggestions();
}

function applyInputToForm(input) {
  form.elements.departure.value = input.departure;
  form.elements.duration.value = input.duration;
  form.elements.transport.value = input.transport;
  form.elements.travelTime.value = input.travelTime;
  form.elements.purpose.value = input.purpose;
  form.elements.budget.value = input.budget;
  setCountSelect(adultCount, adultCustom, input.adultTotal);
  setCountSelect(childCount, childCustom, input.childTotal);
  updateCustomCountVisibility();
  updateAgeFields();
  input.childAges.slice(0, maxVisibleAgeFields).forEach((age, index) => {
    const select = form.elements[`childAge${index + 1}`];
    if (select) select.value = age;
  });
}

function setCountSelect(select, customInput, value) {
  if (value > 9) {
    select.value = 'custom';
    customInput.value = value;
  } else {
    select.value = String(value);
  }
}

function renderHistory() {
  if (!searchHistory.length) {
    historyPanel.innerHTML = `
      <div class="history-heading">
        <h2 id="history-title">検索履歴</h2>
        <p>検索や候補ガチャを回すと、ここから前の候補に戻れます。</p>
      </div>
    `;
    historyPanel.classList.remove('is-hidden');
    return;
  }

  historyPanel.innerHTML = `
    <div class="history-heading">
      <div>
        <h2 id="history-title">検索履歴</h2>
        <p>最新10件まで保存します。クリックするとその候補一覧と詳細に戻れます。</p>
      </div>
      <button type="button" class="secondary-button clear-history-button" data-clear-history>履歴を消す</button>
    </div>
    <div class="history-list">
      ${searchHistory.map((item, index) => renderHistoryItem(item, index)).join('')}
    </div>
  `;
  historyPanel.classList.remove('is-hidden');
}

function renderHistoryItem(item, index) {
  const input = item.input;
  const ageLabel = index === 0 ? '最新' : `${index}回前`;
  const time = new Date(item.createdAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  return `
    <button type="button" class="history-item" data-history-id="${escapeHtml(item.id)}">
      <span class="history-item__time">${escapeHtml(ageLabel)}・${escapeHtml(time)}・${escapeHtml(item.actionLabel)} ${escapeHtml(String(item.round))}回目</span>
      <span class="history-item__conditions">${escapeHtml(input.departure)}発 / ${escapeHtml(durations[input.duration].label)} / ${escapeHtml(travelTimes[input.travelTime].label)} / ${escapeHtml(input.purpose)}</span>
      <span class="history-item__summary">${escapeHtml(item.summary || item.plans.map((plan) => plan.name).join('、'))}</span>
    </button>
  `;
}

function renderItineraryTable(rows) {
  return `
    <div class="table-wrap">
      <table class="itinerary-table">
        <thead>
          <tr>
            <th>日</th>
            <th>時間帯</th>
            <th>行動</th>
            <th>場所・エリア</th>
            <th>子連れメモ</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => `
            <tr>
              <td>${escapeHtml(row.day)}</td>
              <td>${escapeHtml(row.time)}</td>
              <td>${escapeHtml(row.action)}</td>
              <td>${escapeHtml(row.place)}</td>
              <td>${escapeHtml(row.memo)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderMealOptions(meals) {
  return `
    <section class="detail-row">
      <h4>食事候補</h4>
      <div class="info-card-grid">
        ${meals.slice(0, 4).map((meal) => `
          <article class="mini-card">
            <h5>${escapeHtml(meal.name)}</h5>
            <p><strong>エリア：</strong>${escapeHtml(meal.area)}</p>
            <p><strong>食べられるもの：</strong>${escapeHtml(meal.food)}</p>
            <p><strong>子連れメモ：</strong>${escapeHtml(meal.familyMemo)}</p>
            <p><strong>注意点：</strong>${escapeHtml(meal.caution)}</p>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderLodgingExamples(examples) {
  return `
    <section class="detail-row">
      <h4>宿例・価格幅</h4>
      <div class="info-card-grid">
        ${examples.map((example) => `
          <article class="mini-card">
            <h5>${escapeHtml(example.name)}</h5>
            <p><strong>エリア：</strong>${escapeHtml(example.area)}</p>
            <p><strong>宿タイプ：</strong>${escapeHtml(example.type)}</p>
            <p><strong>向いている理由：</strong>${escapeHtml(example.reason)}</p>
            <p><strong>ローシーズン目安：</strong>${escapeHtml(example.lowSeason)}</p>
            <p><strong>ハイシーズン目安：</strong>${escapeHtml(example.highSeason)}</p>
            <p><strong>家族旅行総額の目安：</strong>${escapeHtml(example.familyTotal)}</p>
            <p><strong>注意書き：</strong>${escapeHtml(example.caution)}</p>
          </article>
        `).join('')}
      </div>
      <p class="field-note">${escapeHtml(lodgingPriceNotice)}</p>
    </section>
  `;
}

function renderCostEstimate(cost) {
  return `
    <section class="detail-row">
      <h4>旅行総額の目安</h4>
      <div class="table-wrap">
        <table class="cost-table">
          <thead>
            <tr>
              <th>項目</th>
              <th>ローシーズン</th>
              <th>ハイシーズン</th>
            </tr>
          </thead>
          <tbody>
            ${costRow('宿泊費', cost.lowSeason.lodging, cost.highSeason.lodging)}
            ${costRow('食事代', cost.lowSeason.meals, cost.highSeason.meals)}
            ${costRow('移動費', cost.lowSeason.transport, cost.highSeason.transport)}
            ${costRow('観光・入場料', cost.lowSeason.activity, cost.highSeason.activity)}
            ${costRow('合計目安', cost.lowSeason.total, cost.highSeason.total)}
          </tbody>
        </table>
      </div>
      ${cost.budgetNote ? `<p class="budget-note">${escapeHtml(cost.budgetNote)}</p>` : ''}
    </section>
  `;
}

function costRow(label, low, high) {
  return `
    <tr>
      <th>${escapeHtml(label)}</th>
      <td>${escapeHtml(formatYenRange(low))}</td>
      <td>${escapeHtml(formatYenRange(high))}</td>
    </tr>
  `;
}

function renderStructuredList(title, items) {
  return `
    <section class="detail-row">
      <h4>${escapeHtml(title)}</h4>
      <ul class="reason-list">
        ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    </section>
  `;
}

function uniqueObjectsByName(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.name)) return false;
    seen.add(item.name);
    return true;
  });
}

function multiplyRange(range, multiplier) {
  return range.map((value) => Math.round(value * multiplier));
}

function sumRanges(ranges) {
  return ranges.reduce((sum, range) => [sum[0] + range[0], sum[1] + range[1]], [0, 0]);
}

function formatYenRange(range) {
  return `${formatYen(range[0])}〜${formatYen(range[1])}`;
}

function formatYen(value) {
  return `${Math.round(value).toLocaleString('ja-JP')}円`;
}

function renderPlanCard(plan) {
  const isSelected = plan.id === selectedPlanId;
  return `
    <button type="button" class="plan-summary-card${isSelected ? ' is-selected' : ''}" data-plan-id="${plan.id}" aria-pressed="${isSelected}">
      <span class="plan-label">${escapeHtml(plan.label)}</span>
      <span class="plan-card-badges">
        <span>${escapeHtml(plan.rankLabel)}</span>
        <span>${escapeHtml(plan.timeBucketLabel)}</span>
        <span>${escapeHtml(formatMinutes(plan.estimatedMinutes))}目安</span>
      </span>
      <span class="plan-card-title">${escapeHtml(plan.name)}</span>
      <span class="plan-card-area">おすすめエリア：${escapeHtml(plan.area)}</span>
      <span class="plan-card-concept">${escapeHtml(plan.concept)}</span>
      <span class="plan-card-reason">${escapeHtml(plan.shortReason)}</span>
      <span class="plan-card-reason">選定理由：${escapeHtml(plan.selectionReasons.slice(0, 2).join(' / '))}</span>
    </button>
  `;
}

function renderPlanDetail(plan) {
  return `
    <article class="trip-plan">
      <div class="plan-title-row">
        <span class="plan-label">${escapeHtml(plan.label)}</span>
        <h3>${escapeHtml(plan.name)}</h3>
        <p class="field-note">${escapeHtml(plan.rankLabel)} / ${escapeHtml(plan.timeBucketLabel)} / 移動${escapeHtml(formatMinutes(plan.estimatedMinutes))}目安</p>
      </div>
      ${detailText('おすすめエリア', plan.area)}
      ${detailText('コンセプト', plan.concept)}
      ${detailText('おすすめ理由', plan.reason)}
      ${renderStructuredList('選定理由', plan.selectionReasons)}
      <section class="detail-row">
        <h4>日数に応じた旅程</h4>
        ${renderItineraryTable(plan.itinerary)}
      </section>
      ${detailList('代表的な立ち寄りスポット', plan.spots)}
      ${renderMealOptions(plan.mealOptions)}
      ${renderLodgingExamples(plan.lodgingExamples)}
      ${renderCostEstimate(plan.costEstimate)}
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
