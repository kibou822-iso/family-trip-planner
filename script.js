const form = document.querySelector('#tripForm');
const result = document.querySelector('#result');

const plans = {
  nature: {
    area: '高原・湖畔エリア',
    concept: '広い公園や湖畔散歩を中心に、移動を詰め込みすぎない深呼吸旅。',
    highlights: ['芝生広場でピクニック', '遊歩道を短めに散策', '夕方は早めに宿で休憩'],
    meals: ['道の駅の地元野菜ランチ', '子ども椅子のあるカジュアルレストラン', 'テイクアウト弁当で湖畔ごはん']
  },
  animals: {
    area: '牧場・動物公園エリア',
    concept: '午前中に動物ふれあいを楽しみ、午後はカフェ休憩を挟むわくわく旅。',
    highlights: ['動物へのえさやり体験', '屋内休憩所でおやつ時間', '小さな遊具エリアで自由時間'],
    meals: ['牧場レストランのプレートランチ', 'ベビーカーで入りやすいフードコート', 'ソフトクリーム休憩']
  },
  onsen: {
    area: '近場の温泉街エリア',
    concept: '観光は少なめにして、貸切風呂や早めのチェックインを重視するのんびり旅。',
    highlights: ['温泉街を短時間散策', '足湯で休憩', '宿でボードゲームや絵本時間'],
    meals: ['個室または座敷の和食店', '宿の子ども向け夕食', '温泉まんじゅう食べ歩き']
  },
  sea: {
    area: '海辺・水族館エリア',
    concept: '海風を感じながら、水族館や短時間の砂浜遊びを組み合わせる開放感のある旅。',
    highlights: ['水族館を午前中に見学', '砂浜で短時間遊ぶ', '夕焼けスポットで家族写真'],
    meals: ['海鮮丼を取り分けできる食堂', 'キッズメニューのあるカフェ', '港のベーカリー']
  },
  food: {
    area: '食べ歩き・道の駅エリア',
    concept: 'ご当地グルメを少しずつ楽しみ、休憩を多めに入れるおいしい旅。',
    highlights: ['市場や道の駅で買い物', '短い観光スポットを1〜2か所', '午後はスイーツ休憩'],
    meals: ['ご当地うどん・ラーメン', '取り分けしやすい定食', 'フルーツパフェやジェラート']
  },
  rainy: {
    area: '屋内ミュージアム・大型公園エリア',
    concept: '雨でも予定変更しやすい屋内スポット中心の安心旅。',
    highlights: ['体験型ミュージアム', '屋内キッズスペース', '天気が良ければ公園を追加'],
    meals: ['施設内レストラン', '駅ビルのファミリー向け店舗', '予約不要のカフェ']
  }
};

const budgetText = {
  low: '無料公園・道の駅・テイクアウトを活用して費用を抑える',
  standard: '有料スポットと休憩時間のバランスを取る',
  relaxed: '個室食事や体験メニューを入れて少しゆったり過ごす'
};

const transportText = {
  car: '車移動なので、サービスエリアや道の駅をこまめに挟む',
  train: '駅近スポットを中心にして、荷物を少なめにする',
  plane: '到着日は詰め込まず、空港から近いエリアで過ごす',
  bus: '乗車前後に長めのトイレ休憩と軽食時間を確保する'
};

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const data = Object.fromEntries(new FormData(form).entries());
  const plan = plans[data.purpose];
  const days = Number(data.days);
  const travelTime = Number(data.travelTime);

  result.innerHTML = buildPlan(data, plan, days, travelTime);
  result.classList.remove('is-hidden');
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

function buildPlan(data, plan, days, travelTime) {
  const itinerary = createItinerary(days, plan.highlights);
  const caution = createCautions(data, travelTime);

  return `
    <div class="plan-heading">
      <span class="plan-area">おすすめエリア：${plan.area}</span>
      <h2>${escapeHtml(data.departure)}発のサンプル家族旅行プラン</h2>
      <p>${plan.concept}</p>
    </div>
    <div class="plan-grid">
      ${section('旅行コンセプト', `<p>${plan.concept}<br>${budgetText[data.budget]}プランです。</p>`)}
      ${section('ざっくり旅程', `<ol>${itinerary.map(item => `<li>${item}</li>`).join('')}</ol>`)}
      ${section('子連れ休憩ポイント', `<ul><li>${transportText[data.transport]}</li><li>午前と午後に1回ずつ、15〜30分の休憩を固定で入れます。</li><li>眠くなる時間帯は移動か宿休憩にすると安心です。</li></ul>`)}
      ${section('食事候補', `<ul>${plan.meals.map(meal => `<li>${meal}</li>`).join('')}</ul>`)}
      ${section('注意点', `<ul>${caution.map(item => `<li>${item}</li>`).join('')}</ul>`)}
      ${section('このプランが向いている家族', `<p>${escapeHtml(data.family)}、子どもの年齢が${escapeHtml(data.ages)}の家族におすすめです。移動時間を抑えつつ、目的に合う体験を1日1〜2個に絞りたい家族に向いています。</p>`)}
    </div>
  `;
}

function createItinerary(days, highlights) {
  if (days === 1) {
    return [`午前：${highlights[0]}`, `昼：子どもが食べやすいお店でランチ`, `午後：${highlights[1]}、早めに帰路へ`];
  }

  const items = [`1日目午前：出発後、休憩を挟みながら現地へ`, `1日目午後：${highlights[0]}、夕方は宿でゆっくり`, `2日目午前：${highlights[1]}`, `2日目午後：${highlights[2]}、余裕を持って帰路へ`];
  if (days >= 3) {
    items.splice(3, 0, '追加日：天候や子どもの疲れに合わせて、屋内スポットか公園を選びます');
  }
  return items;
}

function createCautions(data, travelTime) {
  const cautions = ['ベビーカー可否、授乳室、おむつ替えスペースを事前に確認しましょう。'];
  if (travelTime <= 1) cautions.push('近場中心のため、目的地を増やしすぎず滞在時間を長めに取ると満足度が上がります。');
  if (travelTime >= 3) cautions.push('片道移動が長めなので、出発前に軽食・飲み物・暇つぶしグッズを準備しましょう。');
  if (data.transport === 'car') cautions.push('渋滞を避けるため、朝早めの出発または昼前後の移動がおすすめです。');
  if (data.transport === 'train') cautions.push('駅から遠いスポットはタクシーや送迎の有無を確認しましょう。');
  return cautions;
}

function section(title, body) {
  return `<section class="plan-section"><h3>${title}</h3>${body}</section>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[char]));
}
