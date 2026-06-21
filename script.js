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
  '30m': '30分以内',
  '1h': '1時間以内',
  '2h': '2時間以内',
  '3h': '3時間以内',
  '4h': '4時間以内',
  '4hplus': '4時間以上も可'
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
  under20: '無料または低価格の公園、道の駅、公共施設を軸にし、食事は地元の定食や持ち込みも組み合わせます。',
  under40: '移動費を抑えながら、ひとつだけ有料体験を入れると満足度を上げやすい予算感です。',
  under60: '体験、食事、休憩をバランスよく入れやすく、子連れの無理を避けた設計に向いています。',
  under80: '宿や食事の選択肢が広がるため、休みやすい和室や大浴場付きも狙えます。',
  under100: '移動の快適さや個室食、屋内施設まで含めて余裕を持った計画にできます。',
  '100to150': '宿の滞在時間を長めに取り、食事や体験を少し上質にしやすい予算です。',
  '150to200': '移動短縮、温泉宿、屋内体験を組み合わせ、疲れにくさを優先できます。',
  over200: '宿、食事、移動の快適性を優先し、予約を詰め込みすぎない計画が向いています。'
};

const suggestionModes = {
  shorter: {
    label: 'もっと移動短め',
    tone: '移動時間を短くして、近場と休憩の比率を増やしました。',
    emphasis: ['駅近', '近場', '休憩', '短時間']
  },
  nature: {
    label: 'もっと自然多め',
    tone: '公園、海、山、川など外でのびのび過ごせる時間を増やしました。',
    emphasis: ['自然', '公園', '海', '山', '川']
  },
  onsen: {
    label: 'もっと温泉重視',
    tone: '宿や温浴施設で休む時間を増やし、移動と観光を詰め込みすぎない形にしました。',
    emphasis: ['温泉', '宿', '大浴場', '休憩']
  },
  rainy: {
    label: '雨の日向けにする',
    tone: '屋内施設、駅近、宿滞在を中心にして、天気に左右されにくい形にしました。',
    emphasis: ['雨', '屋内', '水族館', '博物館', '駅近']
  }
};

const planTemplates = [
  {
    label: '本命',
    title: '近場で満足ファミリー定番プラン',
    areaType: '出発地から行きやすい近郊エリア',
    concept: '移動を抑えつつ、遊び・食事・休憩をバランスよく入れる',
    fit: '小さな子ども連れや、初めての家族旅行でも調整しやすいです。',
    tags: ['近場', '休憩', '公園', '屋内', '食事']
  },
  {
    label: '別案',
    title: '目的重視の体験たっぷりプラン',
    areaType: '目的に合う観光・体験スポットの多いエリア',
    concept: '入力した目的を中心に、思い出に残る体験をひとつ強めに入れる',
    fit: 'やりたいことがはっきりしている家族に向いています。',
    tags: ['体験', '自然', '温泉', '海鮮', '雨']
  },
  {
    label: '別案',
    title: '天気に強いゆったり滞在プラン',
    areaType: '駅近または宿周辺で完結しやすいエリア',
    concept: '屋内施設と休憩を多めにして、当日の天気や疲れに合わせやすくする',
    fit: '年齢差がある子ども連れや、雨の日も安心したい家族に合います。',
    tags: ['雨', '屋内', '宿', '駅近', '休憩']
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
  const modeNote = currentMode ? suggestionModes[currentMode].tone : '入力内容から、目的・日数・移動手段・希望移動時間を反映した候補を3つ作りました。';
  const selectedPlan = currentPlans.find((plan) => plan.id === selectedPlanId);

  result.innerHTML = `
    <div class="result-toolbar">
      <div>
        <span class="plan-area">提案メモ</span>
        <h2>${escapeHtml(currentInput.departure)}発・${durations[currentInput.duration].label}の候補プラン</h2>
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
      ${selectedPlan ? renderPlanDetail(selectedPlan) : '<p class="empty-detail">気になる候補をクリックすると、詳しい旅程を表示します。</p>'}
    </div>
  `;

  result.classList.remove('is-hidden');
  if (!options.keepScroll) {
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function buildPlans(input, mode) {
  const keywords = normalizeKeywords(input.purpose);
  const templates = [...planTemplates].sort((a, b) => scoreTemplate(b, keywords, mode) - scoreTemplate(a, keywords, mode));

  return templates.map((template, index) => {
    const area = buildArea(input, template, index);
    const transportNote = getTransportNote(input.transport);
    const timeNote = getTravelTimeNote(input.travelTime);
    const childNote = getChildNote(input);
    const modeExtra = mode ? suggestionModes[mode].emphasis.join('・') : input.purpose;

    return {
      id: `plan-${index}`,
      label: index === 0 ? '本命' : '別案',
      name: customizeName(template.title, input, mode, index),
      area,
      concept: `${template.concept}。テーマは「${input.purpose}」です。`,
      shortReason: `${travelTimes[input.travelTime]}と${transports[input.transport]}を前提に、${modeExtra}を無理なく入れやすい候補です。`,
      reason: `${template.fit} ${transportNote} ${timeNote} ${childNote}`,
      itinerary: buildItinerary(input, template, index),
      meals: buildMeals(input.purpose, input.budget),
      rest: buildRestPoints(input),
      rainy: buildRainyPlan(input, mode),
      caution: buildCaution(input),
      fit: buildFamilyFit(input, template)
    };
  });
}

function scoreTemplate(template, keywords, mode) {
  let score = 0;
  keywords.forEach((keyword) => {
    if (template.tags.some((tag) => keyword.includes(tag) || tag.includes(keyword))) score += 3;
  });
  if (mode) {
    suggestionModes[mode].emphasis.forEach((word) => {
      if (template.tags.includes(word)) score += 2;
    });
  }
  return score;
}

function normalizeKeywords(text) {
  return text
    .split(/[、,\s]+/)
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

function customizeName(baseName, input, mode, index) {
  if (mode === 'shorter') return index === 0 ? '移動短め・近場満足プラン' : baseName;
  if (mode === 'nature') return index === 0 ? '自然多めの外遊びプラン' : baseName;
  if (mode === 'onsen') return index === 0 ? '温泉ゆったり滞在プラン' : baseName;
  if (mode === 'rainy') return index === 0 ? '雨の日でも安心プラン' : baseName;
  if (/温泉/.test(input.purpose) && index === 1) return '温泉と食事を楽しむプラン';
  if (/海|海鮮/.test(input.purpose) && index === 1) return '海辺と海鮮を楽しむプラン';
  if (/自然|公園|山|川/.test(input.purpose) && index === 1) return '自然でのびのび遊ぶプラン';
  return baseName;
}

function buildArea(input, template, index) {
  const range = {
    '30m': 'すぐ行ける近場',
    '1h': '1時間圏内',
    '2h': '半日で行きやすい近郊',
    '3h': '少し足を伸ばせる周辺県',
    '4h': '遠出感のあるエリア',
    '4hplus': '遠方の人気エリア'
  }[input.travelTime];
  return `${input.departure}から${range}の${template.areaType}`;
}

function getTransportNote(transport) {
  const notes = {
    car: '車移動なので、道の駅、サービスエリア、駐車場のあるスポットを休憩軸にします。',
    train: '電車移動なので、駅近スポット、荷物の少なさ、乗り換え負担の少なさを重視します。',
    shinkansen: '新幹線移動なので、主要駅から近い宿や観光地を選び、乗り換えを減らします。',
    flight: '飛行機移動なので、空港からの移動と初日の余裕を優先します。',
    bus: 'バス移動なので、停留所から歩きやすい場所と待ち時間の少ない行程にします。',
    'walk-bike': '徒歩・自転車移動なので、距離を絞り、休憩できる場所を細かく入れます。',
    other: '移動手段に合わせて、乗り換えや待ち時間を詰め込みすぎない設計にします。'
  };
  return notes[transport];
}

function getTravelTimeNote(travelTime) {
  if (travelTime === '30m' || travelTime === '1h') return '希望移動時間が短めなので、近場中心で滞在時間を長く取ります。';
  if (travelTime === '4h' || travelTime === '4hplus') return '長めの移動も許容できるため、遠方候補も含めつつ初日を軽めにします。';
  return '移動と観光のバランスを取り、子どもの疲れが出る前に休める流れにします。';
}

function getChildNote(input) {
  if (input.childTotal < 1) return '大人だけでも休憩を挟み、食事と移動に余裕を持たせます。';
  const ages = input.childAges.length ? `年齢は${input.childAges.join('、')}を想定します。` : '年齢未入力の子どもがいる想定です。';
  return `子ども${input.childTotal}人、${ages} 昼寝、トイレ、屋内退避を入れやすくします。`;
}

function buildItinerary(input, template, index) {
  const duration = durations[input.duration];
  if (duration.days === 1) {
    return [
      { day: '日帰り', items: ['午前は移動と最初の目的地を短めに設定', `昼は${input.purpose}に寄せた食事候補へ`, '午後はメイン体験と休憩をセットにする', '夕方前に帰路へ向かい、疲れを残しにくくする'] }
    ];
  }

  const plans = [
    { day: '1日目', items: ['午前は余裕を持って出発', '昼は移動先で食べやすい店を選ぶ', `午後は${template.concept}流れでメイン体験へ`, '早めに宿または滞在拠点へ入る'] },
    { day: '2日目', items: ['朝は宿周辺か駅近で軽く散策', '昼は地元名物や子ども向けメニューのある店へ', '午後は短時間の観光または屋内施設へ', '混雑前に帰路へ向かう'] }
  ];

  if (duration.days >= 3) {
    plans.splice(1, 0, { day: '中日', items: ['移動を少なめにして、目的に合う体験を長めに確保', '昼寝やカフェ休憩を予定に組み込む', '夕方は宿の温泉や周辺散歩で整える'] });
  }

  if (duration.days >= 4) {
    plans.splice(plans.length - 1, 0, { day: '追加日', items: ['遠方スポットや自然エリアを半日単位で追加', '天気が悪ければ屋内施設へ差し替え', '洗濯、荷物整理、早寝の時間を確保'] });
  }

  if (input.duration === 'longer') {
    plans.splice(plans.length - 1, 0, { day: '長期滞在日', items: ['連泊拠点を作り、日ごとに近場を回る', '何もしない半日を作って疲れをリセット', '目的に合う体験を予約制と自由行動に分ける'] });
  }

  return plans;
}

function buildMeals(purpose, budget) {
  const ideas = [];
  if (/海|海鮮|魚|寿司/.test(purpose)) ideas.push('海鮮丼、回転寿司、浜焼きなど取り分けしやすい店');
  if (/温泉/.test(purpose)) ideas.push('宿の会席、定食、温泉街の軽食');
  if (/自然|公園|山|川/.test(purpose)) ideas.push('ベーカリー、道の駅、テイクアウト弁当');
  if (!ideas.length) ideas.push('地元定食、うどん、カレー、フードコートなど子どもが選びやすい店');
  if (budget === 'under20' || budget === 'under40') ideas.push('昼食をメインにして、夕食は軽めにすると調整しやすいです');
  return ideas.join('。');
}

function buildRestPoints(input) {
  const base = input.childTotal > 0 ? '授乳室、トイレ、ベンチ、屋内休憩所を事前に確認します。' : 'カフェや駅ビルなど、予定を立て直せる休憩場所を入れます。';
  if (input.transport === 'car') return `${base} 車なら道の駅、サービスエリア、広めの駐車場を固定休憩にします。`;
  if (input.transport === 'train' || input.transport === 'shinkansen') return `${base} 電車系なら駅近施設とコインロッカーを前提にします。`;
  if (input.transport === 'flight') return `${base} 空港内で食事、トイレ、荷物整理の時間を長めに取ります。`;
  return base;
}

function buildRainyPlan(input, mode) {
  const core = '水族館、科学館、屋内遊び場、駅ビル、宿の温浴施設に差し替えます。';
  if (mode === 'rainy') return `${core} 最初から屋内中心にして、屋外は晴れたら追加する扱いにします。`;
  if (/雨/.test(input.purpose)) return `${core} 入力目的が雨の日寄りなので、屋外スポットは短時間にします。`;
  return `${core} 予約が必要な施設は前日までに候補を2つ持っておくと安心です。`;
}

function buildCaution(input) {
  const pieces = ['食事時間とチェックイン時刻を詰め込みすぎないこと。'];
  if (input.transport === 'car') pieces.push('駐車場の満空、渋滞、チャイルドシート休憩を確認してください。');
  if (input.transport === 'train' || input.transport === 'shinkansen') pieces.push('乗り換え回数、エレベーター位置、荷物量を確認してください。');
  if (input.transport === 'flight') pieces.push('空港到着後の移動は初日に詰め込まず、遅延時の余白を残してください。');
  if (input.travelTime === '4hplus') pieces.push('遠方候補は初日と最終日を軽くするのが安全です。');
  return pieces.join(' ');
}

function buildFamilyFit(input, template) {
  if (input.childTotal > 0) {
    return `${input.childTotal}人の子ども連れで、${input.purpose}を楽しみたい家族。${template.fit}`;
  }
  return `${input.purpose}を大人中心に楽しみつつ、移動と食事に余裕を持ちたい家族。`;
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
      ${detail('おすすめエリア', plan.area)}
      ${detail('コンセプト', plan.concept)}
      ${detail('おすすめ理由', plan.reason)}
      <section class="detail-row">
        <h4>日数に応じた旅程</h4>
        <div class="itinerary-grid">
          ${plan.itinerary.map((day) => dayBlock(day.day, day.items)).join('')}
        </div>
      </section>
      ${detail('食事候補', plan.meals)}
      ${detail('子連れ休憩ポイント', plan.rest)}
      ${detail('雨の日代替案', plan.rainy)}
      ${detail('注意点', plan.caution)}
      ${detail('このプランが向いている家族', plan.fit)}
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

function detail(title, body) {
  return `
    <section class="detail-row">
      <h4>${escapeHtml(title)}</h4>
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
