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

const childAgeOptions = ['0歳', '1歳', '2歳', '3歳', '4歳', '5歳', '6歳', '7歳', '8歳', '9歳', '10歳', '11歳', '12歳', '13歳以上'];
const maxVisibleAgeFields = 12;

const purposes = {
  nature: '自然を楽しむ',
  animals: '動物とふれあう',
  onsen: '温泉でのんびり',
  sea: '海・水遊び',
  food: '食事を楽しむ',
  rainy: '雨でも遊べる'
};

const budgets = {
  under20: '〜2万円',
  under40: '〜4万円',
  under60: '〜6万円',
  under80: '〜8万円',
  under100: '〜10万円',
  '100to150': '10〜15万円',
  '150to200': '15〜20万円',
  over200: 'それ以上'
};

const budgetAdvice = {
  under20: '無料や低価格の公園、道の駅、公共施設を軸に、食事は名物を1回だけ入れると満足度を保ちやすいです。',
  under40: '移動費を抑えながら、有料スポットを1つに絞ると無理がありません。',
  under60: '体験、食事、温泉のうち2つをしっかり入れられる現実的な予算感です。',
  under80: '宿の選択肢が広がるため、休憩しやすい和室や大浴場付きも狙えます。',
  under100: '移動の快適さや個室食、雨の日施設まで余裕を持って組み込めます。',
  '100to150': '宿の滞在時間を長めに取り、食事や体験を少し上質にできます。',
  '150to200': '移動時間の短縮、温泉宿、屋内体験を組み合わせやすい予算です。',
  over200: '宿、食事、移動の快適性を優先して、予定を詰め込まない贅沢な設計が向いています。'
};

const departurePlans = {
  '大阪': [
    {
      name: '淡路島の海辺リゾートゆったり旅',
      area: '兵庫・淡路島',
      tags: ['sea', 'food', 'nature'],
      concept: '海、公園、道の駅を短い移動でつなぐ、子どものペース優先の1泊2日。',
      reason: '大阪から車で向かいやすく、海沿いの公園や屋内寄りの立ち寄り先も選べます。食事も海鮮、淡路牛、うどんなど取り分けしやすい候補が多いです。',
      day1: { morning: '明石海峡大橋を渡り、淡路サービスエリアで景色とトイレ休憩', lunch: '淡路島産玉ねぎを使ったハンバーグやうどんのランチ', afternoon: '国営明石海峡公園または淡路島公園で短めに遊ぶ', lodging: '洲本温泉または海沿いホテルで早めにチェックイン' },
      day2: { morning: 'のじまスコーラ周辺で買い物とカフェ休憩', lunch: '道の駅あわじで海鮮丼、しらす丼、キッズ向け麺類', afternoon: '橋を望む海辺で写真を撮り、渋滞前に出発', returnTrip: '夕方前に大阪方面へ。眠くなる時間を帰路に合わせる' },
      rest: '淡路SA、道の駅あわじ、海沿い公園のベンチを固定休憩にします。',
      meals: 'しらす丼、淡路牛ハンバーグ、玉ねぎうどん、ジェラート。',
      rainy: '淡路夢舞台の屋内動線、ホテル滞在長め、買い物中心に切り替え。',
      caution: '週末は橋周辺が混みやすいため、帰路は早めが安心です。',
      fit: '海を見たいけれど、移動と予定を詰め込みたくない家族。'
    },
    {
      name: '奈良公園と温泉でのんびり旅',
      area: '奈良・奈良市〜天理',
      tags: ['animals', 'onsen', 'food'],
      concept: '鹿とのふれあいを短時間に絞り、午後は宿や温浴施設で休む近場旅。',
      reason: '大阪から近く、子どもの疲れが出たら予定を減らしやすい距離感です。観光、食事、休憩の切り替えがしやすいのも魅力です。',
      day1: { morning: '奈良公園を短めに散策し、鹿せんべいは混雑の少ない場所で体験', lunch: 'ならまち周辺で釜飯、うどん、定食ランチ', afternoon: '東大寺は外観中心にして、カフェで休憩', lodging: '奈良市内ホテルまたは天理方面の温浴付き宿' },
      day2: { morning: '平城宮跡歴史公園で広く歩くか、屋内展示を見学', lunch: '道の駅レスティ唐古・鍵で軽めのランチ', afternoon: 'お土産購入後、早めに帰路へ', returnTrip: '阪奈道路や第二阪奈の混雑前に大阪へ戻る' },
      rest: '奈良公園周辺の観光案内所、商業施設、平城宮跡の屋内施設。',
      meals: '釜飯、柿の葉寿司、三輪そうめん、和スイーツ。',
      rainy: '奈良国立博物館、平城宮いざない館、商業施設中心に変更。',
      caution: '鹿に近づきすぎないこと、ベビーカーは人混みの少ない道を選ぶこと。',
      fit: '動物体験を少し入れつつ、近場で安心して泊まりたい家族。'
    },
    {
      name: '有馬温泉ごほうびステイ',
      area: '兵庫・有馬温泉',
      tags: ['onsen', 'rainy', 'food'],
      concept: '観光は控えめ、宿の温泉と食事を主役にする休息重視プラン。',
      reason: '大阪から短時間で行きやすく、雨でも宿時間を楽しめます。小さな子ども連れでも予定を削りやすい構成です。',
      day1: { morning: '午前はゆっくり出発し、有馬温泉街へ', lunch: '温泉街でそば、うどん、洋食など食べやすい昼食', afternoon: '温泉街を30〜60分だけ散策して宿へ', lodging: '家族風呂や大浴場のある宿で早めに休憩' },
      day2: { morning: '朝風呂後、チェックアウトまで宿でのんびり', lunch: '神戸三田方面でベーカリーやフードコートランチ', afternoon: 'めんたいパーク神戸三田など屋内施設に寄る', returnTrip: '午後の早い時間に大阪へ戻る' },
      rest: '宿ロビー、温泉街の足湯、三田の商業施設。',
      meals: '温泉まんじゅう、そば、神戸三田のベーカリー、宿の会席。',
      rainy: '温泉街散策を短縮し、宿滞在と屋内施設を長めに。',
      caution: '坂道が多いので、ベビーカーより抱っこひもが便利な場面があります。',
      fit: '観光よりも温泉、昼寝、食事を優先したい家族。'
    }
  ],
  '高槻': [
    {
      name: 'びわ湖テラスと湖畔ステイ',
      area: '滋賀・大津〜湖西',
      tags: ['nature', 'sea', 'food'],
      concept: '湖の景色と広い公園を組み合わせる、開放感のある近距離旅。',
      reason: '高槻から京都東方面へ出やすく、琵琶湖周辺は休憩場所を取りやすいです。自然を感じながら移動負担を抑えられます。',
      day1: { morning: '湖西方面へ移動し、道の駅や湖畔で休憩', lunch: '琵琶湖周辺で近江牛コロッケ、定食、キッズ対応カフェ', afternoon: 'びわ湖バレイまたは湖畔公園で景色を楽しむ', lodging: '大津またはおごと温泉の宿で早めにチェックイン' },
      day2: { morning: 'びわ湖こどもの国や湖畔散歩を短時間', lunch: '道の駅藤樹の里あどがわなどで軽めに食事', afternoon: '湖岸道路を走りながら休憩を挟む', returnTrip: '京都東ICや湖西道路の混雑を見て高槻へ' },
      rest: '湖畔公園、道の駅、宿のロビーを休憩の軸にします。',
      meals: '近江牛コロッケ、湖魚料理、ちゃんぽん、ベーカリー。',
      rainy: '琵琶湖博物館、ピエリ守山、宿滞在中心に変更。',
      caution: '山上施設は天候で体感温度が変わるため羽織りが必要です。',
      fit: '自然の景色を見たい、でも長距離運転は避けたい家族。'
    },
    {
      name: '嵐山と湯の花温泉の近場旅',
      area: '京都・嵐山〜亀岡',
      tags: ['onsen', 'nature', 'food'],
      concept: '午前は京都らしい景色、午後は温泉宿で休むゆったり旅。',
      reason: '高槻からアクセスしやすく、観光を短時間に絞れば子連れでも動きやすい距離です。',
      day1: { morning: '嵐山で渡月橋周辺を短めに散策', lunch: '湯豆腐、うどん、和カフェなど取り分けしやすい昼食', afternoon: 'トロッコ列車または亀岡方面へ移動', lodging: '湯の花温泉で早めにチェックイン' },
      day2: { morning: '宿周辺で朝の散歩、または京都鉄道博物館へ', lunch: '亀岡の道の駅または京都駅周辺でランチ', afternoon: 'お土産を買って無理なく帰る', returnTrip: '夕方の市街地混雑前に高槻へ' },
      rest: '嵐山駅周辺、道の駅ガレリアかめおか、宿。',
      meals: '湯豆腐、京うどん、だし巻き、和スイーツ。',
      rainy: '京都鉄道博物館、水族館、宿滞在へ切り替え。',
      caution: '嵐山は混雑しやすいので、散策範囲を最初から絞ります。',
      fit: '京都感と温泉の両方を少しずつ楽しみたい家族。'
    },
    {
      name: '神戸どうぶつ王国と港町ホテル',
      area: '兵庫・神戸',
      tags: ['animals', 'rainy', 'food'],
      concept: '屋内外の動物体験と港町グルメを組み合わせる天候に強い旅。',
      reason: '屋内エリアが多く、雨や暑さの日でも予定を大きく崩さず遊べます。',
      day1: { morning: '神戸どうぶつ王国へ直行し、午前の元気な時間に見学', lunch: '施設内または三宮周辺でキッズ対応ランチ', afternoon: 'ホテルへ移動し、港周辺を短く散歩', lodging: '三宮またはハーバーランド周辺ホテル' },
      day2: { morning: '神戸海洋博物館やatoaなど屋内施設を選択', lunch: '南京町またはハーバーランドで取り分けランチ', afternoon: 'お土産購入後、早めに帰路へ', returnTrip: '名神や阪神高速の渋滞前に高槻へ' },
      rest: '動物王国の休憩席、商業施設、ホテル。',
      meals: '洋食、パン、中華まん、フードコート。',
      rainy: 'どうぶつ王国、atoa、umie中心で屋内完結。',
      caution: '人気施設は午前中に入り、午後は休憩を長めに取ります。',
      fit: '動物好き、雨でも満足できる行き先を探す家族。'
    }
  ],
  '京都': [
    {
      name: '丹後の海と温泉リセット旅',
      area: '京都・天橋立〜夕日ヶ浦',
      tags: ['sea', 'onsen', 'food'],
      concept: '海辺の景色、温泉、海鮮を楽しむ京都発の王道1泊2日。',
      reason: '京都市内から北へ向かえば、非日常感のある海旅になります。観光を絞ると子連れでも動きやすいです。',
      day1: { morning: '天橋立へ移動し、途中の道の駅で休憩', lunch: '宮津周辺で海鮮丼、うどん、定食ランチ', afternoon: '天橋立ビューランドまたは砂浜散歩を短時間', lodging: '夕日ヶ浦または天橋立温泉の宿' },
      day2: { morning: '朝の海辺散歩、または宿でゆっくり', lunch: '丹後王国食のみやこでランチと買い物', afternoon: '子どもの疲れに合わせて休憩しながら南下', returnTrip: '夕方前に京都市内へ戻る' },
      rest: '道の駅、丹後王国、宿のラウンジ。',
      meals: '海鮮丼、へしこ茶漬け、丹後ばら寿司、ジェラート。',
      rainy: '丹後王国、智恩寺周辺の短時間散策、宿滞在に変更。',
      caution: '移動が長めなので、午前出発と車内おやつの準備が大切です。',
      fit: '京都から海を見に行きたい、温泉も重視したい家族。'
    },
    {
      name: '滋賀ブルーメの丘と近江八幡',
      area: '滋賀・日野〜近江八幡',
      tags: ['animals', 'nature', 'food'],
      concept: '動物、遊具、町歩きを一度に楽しむ、ほどよい外遊び旅。',
      reason: '京都から車で行きやすく、子どもが体を動かせる時間を作りやすいです。',
      day1: { morning: '滋賀農業公園ブルーメの丘で動物ふれあい', lunch: '園内レストランでソーセージやカレー', afternoon: '遊具や季節の花を見て、疲れる前に宿へ', lodging: '近江八幡または守山周辺のホテル' },
      day2: { morning: '近江八幡の水郷周辺を短く散策', lunch: 'ラ コリーナ近江八幡周辺で軽食やスイーツ', afternoon: 'お土産購入とカフェ休憩', returnTrip: '名神方面で京都へ戻る' },
      rest: '園内休憩所、ラ コリーナ、ホテル。',
      meals: '近江牛コロッケ、バームクーヘン、カレー、うどん。',
      rainy: 'ラ コリーナ、琵琶湖博物館、ショッピング施設に切り替え。',
      caution: '屋外時間が長いので、夏は午前中心、冬は防寒を意識します。',
      fit: '動物や外遊びを入れたい、食事やスイーツも楽しみたい家族。'
    },
    {
      name: '京都鉄道博物館と梅小路ステイ',
      area: '京都・梅小路〜京都駅',
      tags: ['rainy', 'food', 'animals'],
      concept: '移動を最小限にして、屋内施設を中心に遊ぶ安心プラン。',
      reason: '雨の日でも成立しやすく、乳幼児連れでも休憩場所を確保しやすいエリアです。',
      day1: { morning: '京都鉄道博物館で展示と体験を楽しむ', lunch: '梅小路公園周辺のカフェやフードホール', afternoon: '京都水族館または公園を短時間', lodging: '京都駅または梅小路周辺ホテル' },
      day2: { morning: 'ホテルでゆっくり朝食後、京都駅周辺で買い物', lunch: '駅ビルで子どもが食べやすいランチ', afternoon: '体力があれば東寺周辺を短く散策', returnTrip: '荷物を増やしすぎず帰宅' },
      rest: '博物館内、駅ビル、ホテル。',
      meals: '駅ビルの和食、洋食、ラーメン、ベーカリー。',
      rainy: '鉄道博物館と水族館を中心にして屋内移動を優先。',
      caution: '近場でも歩数が増えやすいので、午後は予定を1つだけにします。',
      fit: '雨対策を重視し、移動短めで子どもを飽きさせたくない家族。'
    }
  ],
  '新潟': [
    {
      name: '越後湯沢の温泉と雪国体験',
      area: '新潟・越後湯沢',
      tags: ['onsen', 'nature', 'food'],
      concept: '駅近で動きやすく、温泉と屋内外の体験を選べる旅。',
      reason: '新潟県内から向かいやすく、天候に合わせてロープウェイ、温泉、屋内施設を組み替えられます。',
      day1: { morning: '越後湯沢へ移動し、駅周辺で休憩', lunch: '駅ナカでへぎそば、魚沼産コシヒカリのおにぎり', afternoon: '湯沢高原ロープウェイまたは駅周辺散策', lodging: '越後湯沢温泉の宿で早めに入浴' },
      day2: { morning: '宿で朝風呂後、雪国館や屋内施設へ', lunch: '道の駅または駅周辺で定食ランチ', afternoon: 'お土産を買い、休憩を挟みながら帰路へ', returnTrip: '眠くなる時間を移動に合わせて新潟方面へ' },
      rest: '越後湯沢駅、宿、道の駅。',
      meals: 'へぎそば、笹団子、魚沼米おにぎり、定食。',
      rainy: '雪国館、駅ナカ、宿の温泉時間を長めに。',
      caution: '冬は道路状況と防寒、夏は山上の天候変化を確認します。',
      fit: '温泉と新潟らしい食事を無理なく楽しみたい家族。'
    },
    {
      name: '弥彦神社と寺泊グルメ旅',
      area: '新潟・弥彦〜寺泊',
      tags: ['food', 'nature', 'sea'],
      concept: '参道散策、海鮮、海辺を短い区間でつなぐ食重視プラン。',
      reason: '新潟市方面からも行きやすく、食事候補が豊富です。海と山の両方を少しずつ楽しめます。',
      day1: { morning: '弥彦神社周辺を短く散策し、参道で休憩', lunch: '弥彦周辺で釜飯、そば、定食', afternoon: '弥彦山ロープウェイまたは公園遊び', lodging: '岩室温泉または弥彦温泉の宿' },
      day2: { morning: '寺泊魚の市場通りで買い物', lunch: '海鮮丼、焼き魚、子ども向け麺類', afternoon: '海辺で写真を撮り、早めに帰る', returnTrip: '夕方の混雑前に新潟方面へ' },
      rest: '弥彦公園、参道カフェ、寺泊の休憩所。',
      meals: '海鮮丼、浜焼き、そば、温泉まんじゅう。',
      rainy: '市場通りで買い物、宿滞在、カフェ休憩中心に変更。',
      caution: '市場は混雑しやすいので、子どもと手をつなぎやすい時間帯を選びます。',
      fit: '食事を楽しみつつ、温泉と軽い散策も入れたい家族。'
    },
    {
      name: '上越水族館とうみがたり旅',
      area: '新潟・上越',
      tags: ['sea', 'rainy', 'animals'],
      concept: '水族館を主役に、雨でも成立する海辺の1泊2日。',
      reason: '屋内滞在を長く取れるため、天候や年齢差があっても調整しやすいです。',
      day1: { morning: '上越方面へ移動し、途中でサービスエリア休憩', lunch: '直江津周辺で海鮮、ラーメン、定食', afternoon: '上越市立水族博物館うみがたりを見学', lodging: '上越市内ホテルまたは近隣温泉宿' },
      day2: { morning: '高田城址公園や屋内施設を選択', lunch: '道の駅あらいでランチと買い物', afternoon: '子どもの疲れを見て短めに出発', returnTrip: '休憩を挟みながら新潟方面へ' },
      rest: '水族館内、道の駅あらい、ホテル。',
      meals: '海鮮、妙高とん汁ラーメン、定食、ジェラート。',
      rainy: '水族館滞在を長めにし、道の駅とホテル中心に。',
      caution: '新潟県内でも移動距離があるため、2日目は早め帰路が安心です。',
      fit: '水族館や海の生き物が好きで、雨対策も重視したい家族。'
    }
  ],
  'その他': [
    {
      name: '近場温泉と道の駅リラックス旅',
      area: '出発地から片道1〜2時間の温泉地',
      tags: ['onsen', 'food', 'rainy'],
      concept: '観光を増やさず、温泉宿と道の駅を軸にする疲れにくい旅。',
      reason: '出発地がどこでも組み立てやすく、子どもの年齢や天気に合わせて調整しやすいです。',
      day1: { morning: '自宅を遅めに出発し、道の駅で休憩', lunch: '地元食材の定食や麺類', afternoon: '温泉街を短く散策して宿へ', lodging: '家族風呂や和室のある温泉宿' },
      day2: { morning: '朝風呂と宿周辺の散歩', lunch: '道の駅または駅ビルで軽めに食事', afternoon: 'お土産購入のみで予定を詰めない', returnTrip: '昼寝時間に合わせて帰路へ' },
      rest: '道の駅、宿、駅ビルや商業施設。',
      meals: '地元定食、うどん、カレー、ソフトクリーム。',
      rainy: '宿滞在、道の駅、屋内資料館に寄せます。',
      caution: '宿は子ども用食器、添い寝、貸切風呂の条件を確認します。',
      fit: 'まずは無理のない家族旅行を試したい家族。'
    },
    {
      name: '大型公園と屋内ミュージアム旅',
      area: '近隣県の公園・博物館エリア',
      tags: ['nature', 'rainy', 'animals'],
      concept: '晴れなら公園、雨なら屋内施設に切り替える安心プラン。',
      reason: '天候に左右されにくく、年齢差のあるきょうだいでも満足しやすい構成です。',
      day1: { morning: '大型公園または動物公園へ移動', lunch: '園内カフェや持ち込み弁当で昼食', afternoon: '遊具や芝生で短時間遊び、早めに宿へ', lodging: '近隣ホテルまたは温浴施設付き宿' },
      day2: { morning: '体験型ミュージアムや科学館へ', lunch: '商業施設のフードコート', afternoon: '買い物と休憩だけにして帰路へ', returnTrip: '夕方前に帰宅できる時間配分' },
      rest: '公園の屋根付きベンチ、科学館、商業施設。',
      meals: '弁当、フードコート、ベーカリー、地域の定食。',
      rainy: '1日目から科学館や水族館中心に変更。',
      caution: '公園は広すぎることがあるため、入口近くのエリアに絞ります。',
      fit: '外遊びも屋内遊びも保険として持っておきたい家族。'
    },
    {
      name: '駅近ホテルで食べ歩き旅',
      area: '主要駅周辺の観光・グルメエリア',
      tags: ['food', 'rainy', 'sea'],
      concept: '車なしでも動きやすい駅近滞在で、食事と短い観光を楽しむ旅。',
      reason: '荷物をホテルに預けやすく、雨や疲れが出たときにすぐ休めます。',
      day1: { morning: '主要駅へ移動し、ホテルに荷物を預ける', lunch: '駅ビルや商店街で名物ランチ', afternoon: '徒歩圏の観光スポットを1つだけ見る', lodging: '駅近ホテルで早めに休憩' },
      day2: { morning: '朝食後、屋内施設や市場を短時間', lunch: '取り分けしやすい定食や麺類', afternoon: '駅でお土産を買って帰路へ', returnTrip: '乗り換えに余裕を持って帰宅' },
      rest: 'ホテル、駅ビル、百貨店、観光案内所。',
      meals: 'ご当地麺、定食、ベーカリー、スイーツ。',
      rainy: '駅ビル、商業施設、屋内ミュージアム中心に。',
      caution: '混雑時間帯を避け、ベビーカー利用時はエレベーター動線を確認します。',
      fit: '公共交通で移動し、食事と休憩のしやすさを重視する家族。'
    }
  ]
};

const suggestionModes = {
  shorter: { label: 'もっと移動短め', priority: ['rainy', 'onsen', 'food'], note: '移動を短くするため、駅近・宿滞在・近場休憩を優先しました。' },
  nature: { label: 'もっと自然多め', priority: ['nature', 'sea', 'animals'], note: '自然を感じる時間を増やし、公園や湖畔、海辺の散策を厚めにしました。' },
  onsen: { label: 'もっと温泉重視', priority: ['onsen', 'food', 'rainy'], note: '宿で休む時間と温泉の入りやすさを優先しました。' },
  rainy: { label: '雨の日向けにする', priority: ['rainy', 'food', 'onsen'], note: '雨でも崩れにくい屋内施設、駅近、宿滞在を優先しました。' }
};

let currentInput = null;
let currentMode = null;

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
  renderSuggestions();
});

result.addEventListener('click', (event) => {
  const button = event.target.closest('[data-mode]');
  if (!button || !currentInput) return;
  currentMode = button.dataset.mode;
  renderSuggestions();
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
    note.textContent = `${maxVisibleAgeFields}人目まで年齢を選択できます。残りは自由入力欄に補足してください。`;
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
    departure: data.departure,
    purpose: data.purpose,
    purposeNote: data.purposeNote.trim(),
    adultTotal: getSelectedCount(adultCount, adultCustom),
    childTotal,
    childAges: ages,
    budget: data.budget
  };
}

function renderSuggestions() {
  const plans = choosePlans(currentInput, currentMode);
  const modeNote = currentMode ? suggestionModes[currentMode].note : '入力条件から、移動・休憩・天候変更のしやすさを見て3案を選びました。';

  result.innerHTML = `
    <div class="result-toolbar">
      <div>
        <span class="plan-area">相談メモ</span>
        <h2>${escapeHtml(currentInput.departure)}発・大人${currentInput.adultTotal}人・子ども${currentInput.childTotal}人の旅行提案</h2>
        <p>${escapeHtml(modeNote)} ${escapeHtml(budgetAdvice[currentInput.budget])}</p>
      </div>
      <div class="mode-buttons" aria-label="再提案">
        ${Object.entries(suggestionModes).map(([key, mode]) => `<button type="button" class="secondary-button${currentMode === key ? ' is-active' : ''}" data-mode="${key}">${mode.label}</button>`).join('')}
      </div>
    </div>
    ${currentInput.purposeNote ? `<p class="request-note">自由入力メモ：${escapeHtml(currentInput.purposeNote)}</p>` : ''}
    <div class="plan-list">
      ${plans.map((plan, index) => renderPlan(plan, index)).join('')}
    </div>
  `;
  result.classList.remove('is-hidden');
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function choosePlans(input, mode) {
  const pool = [...departurePlans[input.departure]];
  const priority = mode ? suggestionModes[mode].priority : [input.purpose, 'rainy', 'onsen', 'food', 'nature', 'sea', 'animals'];

  return pool
    .map((plan, index) => ({
      ...plan,
      score: scorePlan(plan, input, priority) - index * 0.01
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function scorePlan(plan, input, priority) {
  let score = 0;
  if (plan.tags.includes(input.purpose)) score += 8;
  priority.forEach((tag, index) => {
    if (plan.tags.includes(tag)) score += 5 - index;
  });
  if (input.childTotal > 0 && plan.tags.includes('rainy')) score += 1;
  if (input.budget === 'under20' || input.budget === 'under40') {
    if (plan.tags.includes('nature') || plan.tags.includes('food')) score += 1;
  }
  if (input.budget === '150to200' || input.budget === 'over200') {
    if (plan.tags.includes('onsen')) score += 2;
  }
  return score;
}

function renderPlan(plan, index) {
  const label = index === 0 ? '本命プラン' : `別案 ${index}`;
  return `
    <article class="trip-plan${index === 0 ? ' featured-plan' : ''}">
      <div class="plan-title-row">
        <span class="plan-label">${label}</span>
        <h3>${escapeHtml(plan.name)}</h3>
      </div>
      ${detail('おすすめエリア', plan.area)}
      ${detail('コンセプト', plan.concept)}
      ${detail('おすすめ理由', appendPersonalReason(plan.reason))}
      <div class="itinerary-grid">
        ${dayBlock('1日目', plan.day1, ['morning', 'lunch', 'afternoon', 'lodging'], ['午前', '昼食', '午後', '宿・温泉'])}
        ${dayBlock('2日目', plan.day2, ['morning', 'lunch', 'afternoon', 'returnTrip'], ['午前', '昼食', '午後', '帰路'])}
      </div>
      ${detail('子連れ休憩ポイント', plan.rest)}
      ${detail('食事候補', plan.meals)}
      ${detail('雨の日代替案', plan.rainy)}
      ${detail('注意点', plan.caution)}
      ${detail('このプランが向いている家族', plan.fit)}
    </article>
  `;
}

function appendPersonalReason(reason) {
  const ages = currentInput.childAges.length ? `子どもの年齢は${currentInput.childAges.join('、')}想定。` : '子どもなし、または年齢入力なしの想定。';
  const note = currentInput.purposeNote ? `希望メモ「${currentInput.purposeNote}」も踏まえると、休憩を固定して予定を増やしすぎないのが合います。` : '休憩を固定して予定を増やしすぎないのが合います。';
  return `${reason} ${ages}${note}`;
}

function dayBlock(title, items, keys, labels) {
  return `
    <section class="day-card">
      <h4>${title}</h4>
      <dl>
        ${keys.map((key, index) => `<div><dt>${labels[index]}</dt><dd>${escapeHtml(items[key])}</dd></div>`).join('')}
      </dl>
    </section>
  `;
}

function detail(title, body) {
  return `
    <section class="detail-row">
      <h4>${title}</h4>
      <p>${escapeHtml(body)}</p>
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
