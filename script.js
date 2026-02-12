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
  { value: '歡迎邀約', label: '🎉 歡迎邀約' },
  { value: '陪家人', label: '🏠 陪家人' },
  { value: 'custom', label: '✎ 自行輸入' },
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

// ----- Location Searchable Dropdown -----
function buildLocationSearch(id) {
  return `
    <div class="location-search-wrapper">
      <input type="text" class="location-search-input" id="${id}" placeholder="📍 地點" readonly>
      <div class="location-dropdown" id="dd-${id}"></div>
    </div>
  `;
}

function initLocationDropdown(input) {
  const ddId = 'dd-' + input.id;
  const dropdown = document.getElementById(ddId);

  function renderDropdown(filter = '') {
    let html = '';
    LOCATIONS.forEach(group => {
      const filtered = group.items.filter(item =>
        !filter || item.includes(filter)
      );
      if (filtered.length > 0) {
        html += `<div class="location-dropdown-group-label">${group.group}</div>`;
        filtered.forEach(item => {
          html += `<div class="location-dropdown-item" data-value="${item}">${item}</div>`;
        });
      }
    });
    if (!html) {
      html = '<div class="location-dropdown-item" style="color:var(--text-muted)">無符合結果</div>';
    }
    dropdown.innerHTML = html;

    // Bind click
    dropdown.querySelectorAll('.location-dropdown-item[data-value]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        input.value = el.dataset.value;
        input.style.color = 'var(--gold-bright)';
        dropdown.classList.remove('show');
        input.readOnly = true;
      });
    });
  }

  // Click to open
  input.addEventListener('click', (e) => {
    e.stopPropagation();
    // Close all other dropdowns first
    document.querySelectorAll('.location-dropdown.show').forEach(d => {
      if (d.id !== ddId) d.classList.remove('show');
    });
    input.readOnly = false;
    input.value = '';
    input.style.color = 'var(--text-primary)';
    renderDropdown();
    dropdown.classList.add('show');
    input.focus();
  });

  // Type to filter
  input.addEventListener('input', () => {
    renderDropdown(input.value.trim());
  });

  // On blur - restore previous value or clear
  input.addEventListener('blur', () => {
    setTimeout(() => {
      dropdown.classList.remove('show');
      if (!ALL_LOCATIONS.includes(input.value)) {
        if (input.value.trim() && ALL_LOCATIONS.some(l => l.includes(input.value.trim()))) {
          const match = ALL_LOCATIONS.find(l => l.includes(input.value.trim()));
          input.value = match;
          input.style.color = 'var(--gold-bright)';
        } else if (input.value.trim()) {
          input.value = '';
          input.style.color = '';
        }
      }
      input.readOnly = true;
    }, 200);
  });
}

// Close dropdowns when clicking outside
document.addEventListener('click', () => {
  document.querySelectorAll('.location-dropdown.show').forEach(d => {
    d.classList.remove('show');
  });
});

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

  await new Promise(r => setTimeout(r, 100));

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
  watermark.textContent = '2026 春節行程規劃 ✦ Lunar New Year Planner';
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
        // Hide all dropdowns in clone
        clonedDoc.querySelectorAll('.location-dropdown').forEach(d => {
          d.style.display = 'none';
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
