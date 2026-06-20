const form = document.querySelector('#tripForm');
const result = document.querySelector('#result');
const adultCount = document.querySelector('#adultCount');
const childCount = document.querySelector('#childCount');
const adultCustomWrap = document.querySelector('#adultCustomWrap');
const childCustomWrap = document.querySelector('#childCustomWrap');
const adultCustom = document.querySelector('#adultCustom');
const childCustom = document.querySelector('#childCustom');
const childAgesWrap = document.querySelector('#childAgesWrap');
const childAges = document.querySelector('#childAges');
const formFields = form.elements;

let lastCondition = null;
let currentMode = 'balanced';

const countOptions = [...Array(9)].map((_, index) => index + 1);
const childCountOptions = [0, ...countOptions];
const ageOptions = [...Array(13)].map((_, index) => `${index}歳`).concat('13歳以上');

const tripSeeds = {
  '大阪': [
    area('滋賀・近江八幡', '水郷と琵琶湖をゆっくり楽しむ近場旅', 'ラ コリーナ近江八幡と八幡堀散策を軸に、移動を短めにして甘いもの休憩も取りやすいです。'),
    area('淡路島', '海辺の公園と温泉宿を組み合わせる開放感旅', '明石海峡を渡るだけで非日常感があり、海鮮・公園・温泉を1泊2日にまとめやすいです。'),
    area('奈良・生駒', '動物と歴史に触れるゆる学び旅', '奈良公園や屋内施設を混ぜられるので、小さな子にも小学生にも調整しやすいです。'),
    area('三重・伊勢志摩', '水族館と海鮮を楽しむ少し遠出旅', '鳥羽水族館や海沿いの宿を入れると、雨でも満足度の高い家族旅行になります。')
  ],
  '高槻': [
    area('滋賀・大津〜草津', '琵琶湖畔で遊び、早めに宿へ入る安心旅', '高槻から車でも電車でも行きやすく、湖畔公園・水族展示・温泉を無理なく組めます。'),
    area('京都北部・丹波〜亀岡', '自然と道の駅を楽しむ里山旅', '移動負担を抑えながら、渓谷、トロッコ、道の駅など子どもが飽きにくい要素を入れられます。'),
    area('奈良・明日香〜橿原', '広い公園と歴史体験ののびのび旅', '走り回れる公園と短い歴史スポットを組み合わせ、年齢差がある家族でも過ごしやすいです。'),
    area('淡路島', '海と大きな公園でリフレッシュする旅', '少し遠出感があり、海鮮・公園・温泉の満足度を上げやすい別案です。'),
    area('三重・伊賀〜鈴鹿', '忍者・乗り物・温泉を組み合わせる体験旅', '小学生以上の体験欲を満たしつつ、幼児は短時間施設で調整できます。')
  ],
  '京都': [
    area('滋賀・湖西', '湖畔と山景色を楽しむ近場リセット旅', '京都から近く、混雑しやすい市内観光を避けて自然の中で過ごせます。'),
    area('丹後・天橋立', '海景色と温泉で家族写真を残す旅', '海鮮、展望、温泉を組み合わせられ、予算に余裕があれば満足度が高いです。'),
    area('奈良・宇治〜生駒', '短距離で学びと遊びを両立する旅', '電車でも動きやすく、雨天時は屋内博物館へ切り替えやすいです。')
  ],
  '新潟': [
    area('月岡温泉', '温泉街と公園を楽しむ王道のんびり旅', '移動が短く、温泉・足湯・地元食材の食事で大人も休みやすいです。'),
    area('弥彦・寺泊', '神社と海鮮を組み合わせる新潟らしい旅', '弥彦公園やロープウェイ、寺泊の魚料理を入れられ、祖父母同行にも向きます。'),
    area('長岡・越後丘陵公園', '広い公園で思い切り遊ぶ低負担旅', '子どもが走り回れる場所を中心にしつつ、雨なら屋内施設に切り替えられます。'),
    area('上越・妙高', '水族館と高原を楽しむアクティブ旅', 'うみがたりや妙高の自然を組み合わせ、小学生以上の体験にも向いています。')
  ],
  'その他': [
    area('近場の温泉街', '移動を抑えて宿時間を長くする安心旅', '初めての家族旅行でも崩れにくく、昼寝や休憩を優先できます。'),
    area('県内の大型公園・道の駅', '低予算でも満足しやすい日帰り〜1泊旅', '公園、道の駅、公共施設を中心にすれば費用と疲れを抑えられます。'),
    area('駅近の水族館・博物館', '雨でも予定変更しにくい屋内旅', '天候に左右されにくく、ベビーカーや授乳室を確認しやすいです。')
  ]
};


const areaGuides = [
  guide(/近江八幡/, 'ラ コリーナ近江八幡で焼きたて菓子を買い、八幡堀を30分だけ散策', '琵琶湖沿いの公園かカフェで休憩して、夕方は早めに宿へ', '近江牛系の定食、クラブハリエの軽食、湖畔カフェ', '雨ならラ コリーナ、屋内型の水族展示、道の駅を中心にして八幡堀は車窓や短時間散歩にします。'),
  guide(/淡路島/, '淡路サービスエリアで休憩後、国営明石海峡公園や海辺の遊具へ', '淡路島公園、海沿いカフェ、温泉宿のチェックインを早めに設定', 'しらす丼、淡路牛ハンバーグ、玉ねぎ料理', '雨なら屋内キッズ施設、道の駅、ホテル内温泉を中心にして海辺散歩は写真だけにします。'),
  guide(/奈良|明日香|生駒/, '奈良公園・明日香の広場・生駒山上周辺から年齢に合わせて1か所選ぶ', '鹿や歴史スポットは短時間にして、広い公園やカフェ休憩を長めに確保', '柿の葉寿司、三輪そうめん、子ども向け定食', '雨なら奈良国立博物館周辺、屋内遊び場、駅近商業施設へ切り替えます。'),
  guide(/伊勢|志摩|鳥羽/, '鳥羽水族館を午前の主役にして、混む前に人気エリアから回る', '海沿いの展望スポットか宿の温泉でゆっくり過ごす', '海鮮丼、伊勢うどん、焼き貝', '雨でも鳥羽水族館や屋内土産店で成立するため、屋外展望は天気が良い時だけにします。'),
  guide(/大津|草津|湖西|琵琶湖/, '琵琶湖博物館や湖畔公園を午前のメインにする', '湖岸の芝生で遊び、早めに温泉・宿・駅近ホテルへ移動', '近江牛コロッケ、湖魚料理、道の駅ランチ', '雨なら琵琶湖博物館、ショッピングモール、屋内カフェを軸にします。'),
  guide(/丹波|亀岡|京都北部/, '道の駅で地元野菜を見て、渓谷やトロッコ周辺を短く楽しむ', '里山カフェ、温泉、宿の広い部屋で休む時間を確保', '丹波黒豆メニュー、そば、地元野菜ランチ', '雨なら道の駅、屋内工房、トロッコ周辺の短時間観光に寄せます。'),
  guide(/伊賀|鈴鹿/, '忍者体験や乗り物系施設を午前に入れて、集中力がある時間に楽しむ', '午後は温泉・サービスエリア・短時間の公園で疲れを調整', '伊賀牛コロッケ、サービスエリアごはん、取り分け定食', '雨なら忍者博物館や屋内展示、鈴鹿周辺の屋内施設を優先します。'),
  guide(/月岡/, '月岡温泉街の足湯や広場をゆっくり回り、移動より宿時間を重視', '早めに旅館へ入り、貸切風呂や大浴場、売店時間を楽しむ', '新潟米の定食、温泉まんじゅう、地元食材の宿ごはん', '雨でも温泉街の屋内売店、宿の温泉、足湯を短時間で回せます。'),
  guide(/弥彦|寺泊/, '弥彦神社を短く参拝し、ロープウェイか公園を天候で選ぶ', '寺泊で海鮮を食べ、魚市場は短時間で切り上げる', '寺泊の浜焼き、海鮮丼、へぎそば', '雨なら弥彦の屋内休憩所、寺泊の市場、日帰り温泉を中心にします。'),
  guide(/長岡|丘陵/, '越後丘陵公園で午前中に思い切り遊ぶ', '午後は屋内休憩、道の駅、お土産購入にして帰路を早める', '道の駅ランチ、長岡生姜醤油ラーメン、取り分け定食', '雨なら屋内遊び場、科学館、ショッピング施設へ変更します。'),
  guide(/上越|妙高/, '上越市立水族博物館うみがたりを午前に回る', '妙高方面の高原散策や温泉を午後に入れる', '海鮮、笹寿司、高原カフェごはん', '雨ならうみがたりと温泉を中心にして、高原散策は車窓と短時間休憩にします。')
];

const modeText = {
  balanced: '条件に合うバランス重視',
  short: '移動短め・休憩多め',
  nature: '自然多め',
  onsen: '温泉重視',
  rainy: '雨の日向け'
};

setupCountSelect(adultCount, countOptions, 2);
setupCountSelect(childCount, childCountOptions, 0);
updateCustomFields();
updateChildAgeFields();

adultCount.addEventListener('change', updateCustomFields);
childCount.addEventListener('change', () => { updateCustomFields(); updateChildAgeFields(); });
childCustom.addEventListener('input', updateChildAgeFields);
adultCustom.addEventListener('input', updateCustomFields);
form.addEventListener('submit', event => {
  event.preventDefault();
  currentMode = 'balanced';
  lastCondition = readCondition();
  renderPlans();
});

function setupCountSelect(select, numbers, initial) {
  select.innerHTML = numbers.map(num => `<option value="${num}"${num === initial ? ' selected' : ''}>${num}人</option>`).join('') + '<option value="10plus">10人以上</option>';
}

function updateCustomFields() {
  adultCustomWrap.classList.toggle('is-hidden', adultCount.value !== '10plus');
  childCustomWrap.classList.toggle('is-hidden', childCount.value !== '10plus');
}

function updateChildAgeFields() {
  const count = getCount(childCount.value, childCustom.value, 10);
  childAgesWrap.classList.toggle('is-hidden', count < 1);
  childAges.innerHTML = '';
  if (count < 1) return;
  const limitedCount = Math.min(count, 10);
  for (let index = 0; index < limitedCount; index += 1) {
    childAges.insertAdjacentHTML('beforeend', `<label>${index + 1}人目<select name="childAge">${ageOptions.map(age => `<option value="${age}">${age}</option>`).join('')}</select></label>`);
  }
  if (count > 10) childAges.insertAdjacentHTML('beforeend', '<p class="note">10人を超える場合は、年齢が低い子から10人分を入力してください。</p>');
}

function readCondition() {
  return {
    departure: formFields.departure.value,
    days: Number(formFields.days.value),
    transport: formFields.transport.value,
    travelTime: Number(formFields.travelTime.value),
    adultCount: getCount(adultCount.value, adultCustom.value, 10),
    childCount: getCount(childCount.value, childCustom.value, 10),
    ages: [...form.querySelectorAll('[name="childAge"]')].map(select => select.value),
    purpose: formFields.purpose.value,
    purposeFree: formFields.purposeFree.value.trim(),
    budget: Number(formFields.budget.value),
    budgetLabel: formFields.budget.selectedOptions[0].textContent
  };
}

function getCount(value, customValue, fallback) {
  if (value === '10plus') return Math.max(Number(customValue) || fallback, 10);
  return Number(value);
}

function renderPlans() {
  if (!lastCondition) return;
  const plans = buildPlans(lastCondition, currentMode);
  result.innerHTML = `
    <section class="card">
      <h2>${escapeHtml(lastCondition.departure)}発：${modeText[currentMode]}の旅行提案</h2>
      <p>「${escapeHtml(lastCondition.purpose)}${lastCondition.purposeFree ? ` / ${escapeHtml(lastCondition.purposeFree)}` : ''}」を重視し、予算${escapeHtml(lastCondition.budgetLabel)}・片道${lastCondition.travelTime}時間目安で、本命1案＋別案2案以上を作りました。</p>
      <p class="consult-note">相談メモ：${escapeHtml(buildConsultNote(lastCondition))}</p>
      <div class="result-actions">
        <button type="button" data-mode="short">もっと移動短め</button>
        <button type="button" data-mode="nature">もっと自然多め</button>
        <button type="button" data-mode="onsen">もっと温泉重視</button>
        <button type="button" data-mode="rainy">雨の日向けにする</button>
      </div>
    </section>
    ${plans.map((plan, index) => renderPlan(plan, index)).join('')}
  `;
  result.classList.remove('is-hidden');
  result.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => { currentMode = button.dataset.mode; renderPlans(); }));
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function buildConsultNote(condition) {
  const childSummary = condition.childCount > 0 ? `子ども${condition.childCount}人（${condition.ages.join('、') || '年齢未選択'}）` : '子どもなし・大人中心';
  return `${condition.departure}発、${condition.adultCount}人の大人と${childSummary}で、移動負担と食事時間を先に整える方針です。`;
}

function buildPlans(condition, mode) {
  const seeds = [...tripSeeds[condition.departure]];
  const ranked = rankSeeds(seeds, condition, mode).slice(0, 3);
  return ranked.map((seed, index) => createPlan(seed, condition, mode, index === 0));
}

function rankSeeds(seeds, condition, mode) {
  const keyword = `${condition.purpose} ${condition.purposeFree}`;
  return seeds.map((seed, index) => {
    let score = 100 - index;
    if (mode === 'short' && /近場|大津|月岡|長岡|奈良|県内/.test(seed.area + seed.concept)) score += 25;
    if (mode === 'nature' && /湖|自然|高原|公園|里山|妙高/.test(seed.area + seed.concept)) score += 25;
    if (mode === 'onsen' && /温泉|月岡|丹後|淡路/.test(seed.area + seed.concept)) score += 25;
    if (mode === 'rainy' && /水族館|博物館|屋内|伊勢|上越|奈良/.test(seed.area + seed.reason)) score += 25;
    if (/温泉/.test(keyword) && /温泉|月岡|淡路|丹後/.test(seed.area + seed.concept)) score += 20;
    if (/自然|川|牧場|走り回れる|公園/.test(keyword) && /自然|公園|湖|里山|高原/.test(seed.area + seed.concept)) score += 20;
    if (/海|魚|海鮮|水族館/.test(keyword) && /海|水族館|寺泊|伊勢|淡路|丹後|上越/.test(seed.area + seed.concept)) score += 20;
    if (condition.budget <= 40000 && /近場|公園|道の駅|県内/.test(seed.concept + seed.reason)) score += 15;
    if (condition.budget >= 100000 && /温泉|遠出|海鮮|宿/.test(seed.concept + seed.reason)) score += 15;
    return { ...seed, score };
  }).sort((a, b) => b.score - a.score);
}

function createPlan(seed, condition, mode, best) {
  const guidePlan = getAreaGuide(seed.area);
  const ageAdvice = getAgeAdvice(condition.ages);
  const budgetAdvice = getBudgetAdvice(condition.budget);
  const transportAdvice = getTransportAdvice(condition.transport);
  const free = condition.purposeFree ? `自由入力の「${condition.purposeFree}」も意識して、立ち寄り先は現地で1つ追加できる余白を残します。` : '目的に合わせて、無理に詰め込まず家族のペースを優先します。';
  const short = mode === 'short' || condition.travelTime <= 1;
  const rainy = mode === 'rainy' || condition.purpose === '雨でも楽しめる';
  const onsen = mode === 'onsen' || condition.purpose === '温泉でのんびり';
  const nature = mode === 'nature' || condition.purpose === '自然を楽しむ';
  return {
    name: `${best ? '本命：' : '別案：'}${seed.area} ${onsen ? '温泉ゆったり' : nature ? '自然満喫' : rainy ? '雨でも安心' : '家族旅'}プラン`,
    area: seed.area,
    concept: `${seed.concept} ${condition.adultCount}人の大人と${condition.childCount}人の子どもで動きやすいよう、休憩を先に確保する構成です。`,
    reason: `${seed.reason} ${ageAdvice.reason} ${budgetAdvice} ${free}`,
    day1: {
      morning: short ? `朝は遅めに出発し、${guidePlan.morning}。到着後はトイレと飲み物を確保してから動きます。` : `午前中に出発し、途中休憩を1回入れて現地へ。${guidePlan.morning}。`,
      lunch: `昼食は${mealIdea(condition, seed)}。混雑前に入れるよう11時台を目安にします。`,
      afternoon: rainy ? `午後は屋内展示や道の駅を中心にし、${guidePlan.afternoon}。` : nature ? `${guidePlan.afternoon}。小さい子はベンチ休憩、大きい子は体験や観察を入れます。` : `${guidePlan.afternoon}。疲れが見えたらカフェ休憩へ切り替えます。`,
      stay: onsen ? '宿は温泉・大浴場・貸切風呂のある施設を優先。夕食前に入浴して、夜は早めに寝られる流れにします。' : '宿は駐車場や駅から近く、和室または靴を脱げる部屋を優先。夕方以降は予定を入れすぎません。'
    },
    day2: {
      morning: condition.days === 1 ? '日帰りの場合は、午前の内容を午後に寄せず、帰宅時間から逆算して短く楽しみます。' : '朝食後はチェックアウト前後に短い散歩か売店タイム。子どもの機嫌が良い午前中に軽い体験を入れます。',
      lunch: `昼食は${condition.budget >= 100000 ? '少し良い地元料理店や個室店' : '道の駅、駅ビル、ファミリー向け食堂'}を候補にし、取り分けやすさを重視します。`,
      afternoon: condition.days >= 3 ? '午後は追加の観光日として、天候に合わせて屋外遊びと屋内施設を選べるようにします。' : '午後はお土産購入と短時間スポットだけにして、子どもが眠くなる前に帰路へ向かいます。',
      returnTrip: `${transportAdvice} 帰りは夕方の混雑前に出るか、あえて早めの夕食後に移動する二択で考えると崩れにくいです。`
    },
    breaks: [ageAdvice.break, '駐車場・駅・施設入口でトイレを済ませ、次の移動前に飲み物を補充します。', condition.childCount > 0 ? '子どもが飽きた時用に、短い散歩・売店・ベンチ休憩を各日1回ずつ確保します。' : '大人旅寄りなら、カフェや温泉休憩を長めに取ると満足度が上がります。'],
    meals: [mealIdea(condition, seed), condition.purposeFree.includes('日本酒') ? '大人は地酒の試飲や酒蔵ショップ、子どもは甘味やソフトドリンクで同じ場所を楽しむ' : '子ども用椅子・座敷・取り分けメニューがある店', condition.purpose.includes('食事') || condition.purposeFree.includes('海鮮') ? '夕食は地元食材や魚料理を主役にした店・宿を優先' : '夕食は宿周辺で早めに済ませ、夜の移動を減らす'],
    rainyAlt: rainy ? `最初から屋内施設を軸にします。${guidePlan.rainy}` : guidePlan.rainy,
    cautions: [ageAdvice.caution, condition.budget <= 40000 ? '低予算では有料体験を増やしすぎず、公園・道の駅・公共施設を中心にします。' : '予算に余裕があっても、体験予約を詰め込みすぎると子どもの疲れが出やすいです。', '実際の営業時間、定休日、授乳室・おむつ替えスペース、駐車場は出発前に確認してください。'],
    fit: `${condition.purpose}${condition.purposeFree ? `や${condition.purposeFree}` : ''}を楽しみたい家族、移動より現地での余裕を大切にしたい家族に向いています。${ageAdvice.fit}`
  };
}

function area(name, concept, reason) { return { area: name, concept, reason }; }

function guide(pattern, morning, afternoon, meal, rainy) { return { pattern, morning, afternoon, meal, rainy }; }

function getAreaGuide(areaName) {
  return areaGuides.find(item => item.pattern.test(areaName)) || guide(/.*/, '最初のスポットは現地で一番行きたい場所に絞る', '道の駅、公園、温泉、カフェから家族の疲れに合わせて1つ選ぶ', '地元定食、取り分けしやすい麺類、カフェごはん', '雨なら屋内施設、道の駅、ホテル内休憩を中心にして屋外は短時間にします。');
}

function getAgeAdvice(ages) {
  const nums = ages.map(age => age === '13歳以上' ? 13 : Number(age.replace('歳', '')));
  if (!nums.length) return { reason: '子どもなし、または大人中心でも楽しめるよう、食事と景色の満足度を高めます。', break: '休憩はカフェ・温泉・景色の良い場所でゆっくり取ります。', caution: '大人中心でも移動を詰めすぎず、食事時間に余裕を持ちましょう。', fit: '大人だけの下見旅行や三世代旅行の計画にも使いやすいです。' };
  if (nums.some(age => age <= 2)) return { reason: '0〜2歳がいるため、移動短め・授乳・おむつ替え・昼寝の余白を優先します。', break: '授乳室、おむつ替え台、ベビーカーで入れる休憩所を各日2回以上候補にします。', caution: '昼寝時間に移動を合わせ、夕方以降の予定は入れすぎないでください。', fit: '赤ちゃん連れで初めて1泊旅行を試したい家族に向いています。' };
  if (nums.some(age => age <= 6)) return { reason: '3〜6歳がいるため、公園、動物、乗り物、短時間で達成感のある施設を重視します。', break: '遊具・芝生・売店など、短く気分転換できる場所をこまめに挟みます。', caution: '待ち時間が長い施設は避け、チケット購入や食事は早めの時間に寄せましょう。', fit: '未就学児が飽きずに過ごせる、短い体験中心の旅をしたい家族向けです。' };
  if (nums.some(age => age <= 12)) return { reason: '7〜12歳がいるため、自然遊び、学び、ものづくりなど記憶に残る体験を入れます。', break: '体験の前後に自由時間を入れ、子どもが自分で選べる売店や観察時間を作ります。', caution: 'アクティビティは安全条件と所要時間を確認し、雨天時の代替も用意しましょう。', fit: '小学生が学びながら遊べる旅行を探している家族に向いています。' };
  return { reason: '13歳以上がいるため、景色、食事、温泉、少し本格的な体験も入れやすいです。', break: '写真スポットやカフェを休憩にして、家族それぞれの楽しみを作ります。', caution: '大人寄りにしすぎず、自由時間と集合時間を決めておくと満足度が上がります。', fit: '中高生も退屈しにくい、食事や景色重視の家族旅行に向いています。' };
}

function getBudgetAdvice(budget) {
  if (budget <= 40000) return '予算を抑えるため、日帰りや近場、公園、道の駅、公共施設を中心に組みます。';
  if (budget <= 80000) return '標準予算として、温泉、食事、体験をほどよく1つずつ入れると満足度が上がります。';
  return '高めの予算なので、温泉宿、食事重視、少し遠出のスポットも候補に入れます。';
}

function getTransportAdvice(transport) {
  return { car: '車移動なら道の駅やサービスエリアを休憩地点にします。', train: '電車移動なら駅近スポットと荷物を預けられる場所を優先します。', plane: '飛行機移動なら到着日は空港近くで短く過ごします。', bus: 'バス移動なら乗車前後にトイレと軽食時間を確保します。' }[transport];
}

function mealIdea(condition, seed) {
  const guidePlan = getAreaGuide(seed.area);
  if (/海|寺泊|淡路|丹後|伊勢|上越/.test(seed.area) || condition.purposeFree.includes('海鮮')) return guidePlan.meal;
  if (condition.purposeFree.includes('道の駅') || condition.budget <= 40000) return '道の駅の定食、地元野菜ランチ、テイクアウトのお弁当';
  if (condition.purpose.includes('食事')) return '地元食材の定食、予約しやすい個室店、子ども椅子のあるレストラン';
  return `${guidePlan.meal}、子どもが食べやすいうどん・定食・カフェランチ`;
}

function renderPlan(plan, index) {
  return `
    <article class="plan-card ${index === 0 ? 'best' : ''}">
      <span class="plan-label">${index === 0 ? 'この条件ならまずはこれが本命' : `別案 ${index}`}</span>
      <h2>${escapeHtml(plan.name)}</h2>
      <span class="plan-area">おすすめエリア：${escapeHtml(plan.area)}</span>
      <p class="plan-lead">${escapeHtml(plan.concept)}</p>
      ${section('このプランをおすすめする理由', `<p>${escapeHtml(plan.reason)}</p>`)}
      ${daySection('1日目の旅程', plan.day1, ['午前', '昼食', '午後', '宿・温泉'])}
      ${daySection('2日目の旅程', plan.day2, ['午前', '昼食', '午後', '帰路'])}
      ${listSection('子連れ向けの休憩ポイント', plan.breaks)}
      ${listSection('食事候補', plan.meals)}
      ${section('雨の日の代替案', `<p>${escapeHtml(plan.rainyAlt)}</p>`)}
      ${listSection('注意点', plan.cautions)}
      ${section('このプランが向いている家族', `<p>${escapeHtml(plan.fit)}</p>`)}
    </article>`;
}

function daySection(title, day, labels) {
  const values = Object.values(day);
  return section(title, `<div class="day-grid">${values.map((value, index) => `<div class="time-block"><strong>${labels[index]}</strong>${escapeHtml(value)}</div>`).join('')}</div>`);
}

function listSection(title, items) {
  return section(title, `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`);
}

function section(title, body) {
  return `<section class="plan-section"><h3>${title}</h3>${body}</section>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}
