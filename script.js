// ============================================
// 2026 春節行程規劃器 — Script
// ============================================

// ----- Data -----
const DAYS = [
  { date: '2/14', label: '除夕-2', weekday: '六' },
  { date: '2/15', label: '小年夜', weekday: '日' },
  { date: '2/16', label: '除夕', weekday: '一' },
  { date: '2/17', label: '初一 走春', weekday: '二' },
  { date: '2/18', label: '初二 回娘家', weekday: '三' },
  { date: '2/19', label: '初三 睡飽飽', weekday: '四' },
  { date: '2/20', label: '初四 迎財神', weekday: '五' },
  { date: '2/21', label: '初五 收心操', weekday: '六' },
  { date: '2/22', label: '初六 收心操', weekday: '日' },
];

const LOCATIONS = [
  { group: '直轄市', items: ['台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市'] },
  { group: '市', items: ['基隆市', '新竹市', '嘉義市'] },
  { group: '縣', items: ['新竹縣', '苗栗縣', '彰化縣', '南投縣', '雲林縣', '嘉義縣', '屏東縣', '宜蘭縣', '花蓮縣', '台東縣', '澎湖縣', '金門縣', '連江縣'] },
  { group: '其他', items: ['國外'] },
];

const ALL_LOCATIONS = LOCATIONS.flatMap(g => g.items);

const ACTIVITY_OPTIONS = [
  { value: '', label: '選擇行程...' },
  { value: '歡迎邀約', label: '歡迎邀約' },
  { value: '陪家人', label: '陪家人' },
  { value: 'custom', label: '自行輸入' },
];

const TIME_SLOTS = [
  { key: 'morning', label: '上午', icon: 'fa-sun' },
  { key: 'afternoon', label: '下午', icon: 'fa-cloud-sun' },
  { key: 'evening', label: '晚上', icon: 'fa-moon' },
];

// ----- Build Calendar -----
function buildCalendar() {
  const container = document.getElementById('calendar-container');
  container.innerHTML = '';

  DAYS.forEach((day, i) => {
    const card = document.createElement('div');
    card.className = 'day-card';
    card.dataset.index = i;

    card.innerHTML = `
      <div class="card-header">
        <div class="card-date-info">
          <span class="date-badge">${day.date}</span>
          <span class="date-label">${day.label}</span>
        </div>
        <div class="toggle-group">
          <button class="toggle-btn active" data-mode="allday" onclick="toggleMode(${i}, 'allday')">整天</button>
          <button class="toggle-btn" data-mode="slots" onclick="toggleMode(${i}, 'slots')">分段</button>
        </div>
      </div>
      <div class="input-area">
        <!-- All-day row -->
        <div class="allday-row" id="allday-${i}">
          ${buildLocationSearch(`loc-allday-${i}`)}
          ${buildActivitySelect(`act-allday-${i}`)}
        </div>
        <!-- Time slots -->
        <div class="time-slots" id="slots-${i}">
          ${TIME_SLOTS.map(slot => `
            <div class="time-slot">
              <div class="slot-label">
                <i class="fa-solid ${slot.icon}"></i>
                ${slot.label}
              </div>
              ${buildLocationSearch(`loc-${slot.key}-${i}`)}
              ${buildActivitySelect(`act-${slot.key}-${i}`)}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  // Initialize all location dropdowns
  document.querySelectorAll('.location-search-input').forEach(input => {
    initLocationDropdown(input);
  });

  // Initialize all activity selects
  document.querySelectorAll('.activity-select').forEach(select => {
    initActivitySelect(select);
  });
}

// ----- Activity Select with Custom Input -----
function buildActivitySelect(id) {
  const options = ACTIVITY_OPTIONS.map(o =>
    `<option value="${o.value}">${o.label}</option>`
  ).join('');

  return `
    <div class="activity-wrapper">
      <select class="activity-select" id="${id}">
        ${options}
      </select>
      <input type="text" class="activity-custom-input" id="custom-${id}" placeholder="✎ 輸入自訂行程...">
    </div>
  `;
}

function initActivitySelect(select) {
  const customInput = document.getElementById('custom-' + select.id);

  select.addEventListener('change', () => {
    if (select.value === 'custom') {
      customInput.classList.add('show');
      customInput.focus();
    } else {
      customInput.classList.remove('show');
      customInput.value = '';
    }
  });
}

// ----- Location Select -----
function buildLocationSearch(id) {
  // Option groups
  const groups = LOCATIONS.map(group => {
    const options = group.items.map(item => `<option value="${item}">${item}</option>`).join('');
    return `<optgroup label="${group.group}">${options}</optgroup>`;
  }).join('');

  return `
    <div class="location-wrapper">
      <select class="location-select-native" id="${id}">
        <option value="" disabled selected>地點</option>
        ${groups}
      </select>
    </div>
  `;
}

// (Old dropdown init code removed since we now use native select)


// ----- Toggle Mode -----
function toggleMode(index, mode) {
  const card = document.querySelector(`.day-card[data-index="${index}"]`);
  const toggleBtns = card.querySelectorAll('.toggle-btn');
  const alldayRow = document.getElementById(`allday-${index}`);
  const slotsRow = document.getElementById(`slots-${index}`);

  toggleBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  if (mode === 'allday') {
    alldayRow.classList.remove('hide');
    slotsRow.classList.remove('show');
  } else {
    alldayRow.classList.add('hide');
    slotsRow.classList.add('show');
  }
}

// ----- Export Image -----
async function exportImage() {
  const overlay = document.getElementById('loadingOverlay');
  overlay.classList.add('show');

  // Wait for fonts to fully load
  await document.fonts.ready;
  await new Promise(r => setTimeout(r, 300));

  const container = document.getElementById('app-container');

  // Add export decorations
  const decoTop = document.createElement('div');
  decoTop.className = 'export-decoration-top';
  decoTop.style.display = 'block';
  container.insertBefore(decoTop, container.firstChild);

  const decoBottom = document.createElement('div');
  decoBottom.className = 'export-decoration-bottom';
  decoBottom.style.display = 'block';
  container.appendChild(decoBottom);

  const watermark = document.createElement('div');
  watermark.className = 'export-watermark';
  watermark.innerHTML = '2026 春節行程規劃 <i class="fa-solid fa-star" style="font-size:0.5rem;vertical-align:middle;margin:0 4px;"></i> Lunar New Year Planner';
  container.appendChild(watermark);

  try {
    const canvas = await html2canvas(container, {
      backgroundColor: '#1a0a0a',
      scale: 2,
      useCORS: true,
      logging: false,
      width: container.scrollWidth,
      height: container.scrollHeight,
      windowWidth: container.scrollWidth,
      windowHeight: container.scrollHeight,
      onclone: (clonedDoc) => {
        const clonedContainer = clonedDoc.getElementById('app-container');
        if (clonedContainer) {
          clonedContainer.style.overflow = 'visible';
          clonedContainer.style.height = 'auto';
        }

        // Fix: swap gradient-clip text to solid gold color for html2canvas
        const titleMain = clonedDoc.querySelector('.title-main');
        if (titleMain) {
          titleMain.style.background = 'none';
          titleMain.style.webkitBackgroundClip = 'unset';
          titleMain.style.webkitTextFillColor = '#d4a843';
          titleMain.style.backgroundClip = 'unset';
          titleMain.style.color = '#d4a843';
          titleMain.style.filter = 'none';
        }

        // Fix: make watermark text visible (no gradient issues)
        const bgWatermark = clonedDoc.querySelector('.bg-watermark');
        if (bgWatermark) {
          bgWatermark.style.color = 'rgba(212, 168, 67, 0.03)';
        }

        // Hide all dropdowns in clone
        clonedDoc.querySelectorAll('.location-dropdown').forEach(d => {
          d.style.display = 'none';
        });

        // Replace select elements with their displayed text for clean export
        clonedDoc.querySelectorAll('.activity-select').forEach(sel => {
          const selectedText = sel.options[sel.selectedIndex]?.text || '';
          const span = clonedDoc.createElement('span');
          span.style.cssText = `
            flex: 1; min-width: 0;
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(212,168,67,0.15);
            border-radius: 8px;
            color: ${sel.value ? '#f0d060' : '#8a7a6a'};
            font-size: 0.78rem;
            padding: 8px 10px;
            font-family: 'Noto Sans TC', sans-serif;
            display: block;
          `;
          // Remove emoji prefix for cleaner look
          span.textContent = selectedText;
          sel.parentNode.insertBefore(span, sel);
          sel.style.display = 'none';
        });
      }
    });

    // Create download link
    const link = document.createElement('a');
    link.download = '2026-春節行程.png';
    link.href = canvas.toDataURL('image/png');
    link.click();

  } catch (err) {
    console.error('Export failed:', err);
    alert('匯出失敗，請再試一次！');
  } finally {
    decoTop.remove();
    decoBottom.remove();
    watermark.remove();
    overlay.classList.remove('show');
  }
}

// ----- Init -----
document.addEventListener('DOMContentLoaded', buildCalendar);
