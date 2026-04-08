// =============================================
// script.js — GitHub Profile Finder v2
// Features: Search + History + Language Chart + Compare
// =============================================


// ── Language colours (for chart + legend) ──
const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python:     '#3572A5',
  Java:       '#b07219', 'C++':      '#f34b7d', C:          '#555555',
  Go:         '#00ADD8', Rust:       '#dea584', Ruby:       '#701516',
  PHP:        '#4F5D95', Swift:      '#F05138', Kotlin:     '#A97BFF',
  HTML:       '#e34c26', CSS:        '#563d7c', Shell:      '#89e051',
  Vue:        '#41b883', Dart:       '#00B4AB', 'C#':       '#178600',
};

function getLangColor(lang) {
  return LANG_COLORS[lang] || '#8b949e';
}


// ══════════════════════════════════════════
// 1. SEARCH HISTORY  (stored in localStorage)
// ══════════════════════════════════════════
const HISTORY_KEY = 'gh_search_history'; // key used in localStorage
const MAX_HISTORY = 6;                   // keep last 6 searches

// Read history array from localStorage (or empty array if nothing saved yet)
function getHistory() {
  return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
}

// Save a new username to history
function saveToHistory(username) {
  let history = getHistory();
  // Remove it if it already exists (we'll re-add at front)
  history = history.filter(u => u.toLowerCase() !== username.toLowerCase());
  // Add to front
  history.unshift(username);
  // Keep only last MAX_HISTORY items
  history = history.slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  renderHistory(); // refresh the chips on screen
}

// Remove one item from history
function removeFromHistory(username) {
  let history = getHistory().filter(u => u !== username);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  renderHistory();
}

// Clear all history
function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
}

// Draw the history chips in the #history-wrap div
function renderHistory() {
  const wrap = document.getElementById('history-wrap');
  const history = getHistory();

  if (history.length === 0) {
    wrap.innerHTML = ''; // nothing to show
    return;
  }

  // Build HTML: a label + one chip per username + a clear button
  const chipsHTML = history.map(u => `
    <span class="history-chip" onclick="searchFromHistory('${u}')">
      @${u}
      <span class="remove" onclick="event.stopPropagation(); removeFromHistory('${u}')">×</span>
    </span>
  `).join('');

  wrap.innerHTML = `
    <span class="history-label">Recent:</span>
    ${chipsHTML}
    <button class="clear-history" onclick="clearHistory()">Clear all</button>
  `;
}

// When user clicks a history chip, fill input and search
function searchFromHistory(username) {
  document.getElementById('username-input').value = username;
  doSearch();
}


// ══════════════════════════════════════════
// 2. TAB SWITCHING (Search vs Compare)
// ══════════════════════════════════════════
function switchTab(tab) {
  // Toggle panel visibility
  document.getElementById('panel-single').style.display  = tab === 'single'  ? 'block' : 'none';
  document.getElementById('panel-compare').style.display = tab === 'compare' ? 'block' : 'none';

  // Toggle active class on tab buttons
  document.getElementById('tab-single').classList.toggle('active',  tab === 'single');
  document.getElementById('tab-compare').classList.toggle('active', tab === 'compare');
}


// ══════════════════════════════════════════
// 3. SINGLE USER SEARCH
// ══════════════════════════════════════════
function doSearch() {
  const username = document.getElementById('username-input').value.trim();
  if (!username) return;
  fetchAndShowProfile(username, 'result');
}

// Enter key triggers search
document.getElementById('username-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch();
});

// ── Fetch profile + repos for a username ──
async function fetchAndShowProfile(username, resultDivId) {
  const resultDiv = document.getElementById(resultDivId);
  resultDiv.innerHTML = `<div class="message"><div class="spinner"></div>Fetching @${username}...</div>`;

  try {
    // Fire both requests at the same time (faster than one after another)
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=stars`)
    ]);

    if (userRes.status === 404) {
      resultDiv.innerHTML = showMsg('❌', 'User not found', `No GitHub account: <b>${username}</b>`);
      return null; // return null so compare knows it failed
    }

    if (!userRes.ok) {
      resultDiv.innerHTML = showMsg('⚠️', 'API limit reached', 'GitHub allows 60 searches/hour for unauthenticated users. Wait a minute and try again.');
      return null;
    }

    const user  = await userRes.json();
    const repos = reposRes.ok ? await reposRes.json() : [];

    // Save to history (only for the main search panel, not compare)
    if (resultDivId === 'result') {
      saveToHistory(user.login);
    }

    // Render the profile card into the result div
    renderProfile(user, repos, resultDivId);

    return { user, repos }; // return data so compare can use it

  } catch (err) {
    resultDiv.innerHTML = showMsg('🌐', 'Network error', 'Check your internet connection.');
    return null;
  }
}


// ── Build and inject the full profile card ──
function renderProfile(user, repos, targetId) {
  const joined     = new Date(user.created_at).getFullYear();
  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const top6repos  = repos.slice(0, 6);

  // Build meta line (location, blog, company)
  const metaParts = [];
  if (user.location) metaParts.push(`📍 ${user.location}`);
  if (user.company)  metaParts.push(`🏢 ${user.company}`);
  if (user.blog)     metaParts.push(`🔗 <a href="${user.blog.startsWith('http') ? user.blog : 'https://' + user.blog}" target="_blank" style="color:#58a6ff">${user.blog}</a>`);

  document.getElementById(targetId).innerHTML = `
    <div class="profile-card">

      <!-- Avatar + name + bio -->
      <div class="card-top">
        <img src="${user.avatar_url}" alt="${user.login}" />
        <div>
          <div class="profile-name">${user.name || user.login}</div>
          <div class="profile-username">@${user.login} · joined ${joined}</div>
          ${user.bio ? `<div class="profile-bio">${user.bio}</div>` : ''}
          ${metaParts.length ? `<div class="profile-meta">${metaParts.join(' &nbsp;·&nbsp; ')}</div>` : ''}
        </div>
      </div>

      <!-- Stats: repos / followers / stars -->
      <div class="stats">
        <div class="stat-item">
          <div class="stat-number">${formatNum(user.public_repos)}</div>
          <div class="stat-label">Repos</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${formatNum(user.followers)}</div>
          <div class="stat-label">Followers</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${formatNum(totalStars)}</div>
          <div class="stat-label">Total Stars</div>
        </div>
      </div>

      <!-- Language chart (built separately after inserting HTML) -->
      <div class="chart-section">
        <div class="section-title">Languages Used</div>
        <div class="chart-wrap">
          <canvas id="chart-${user.login}"></canvas>
          <div class="lang-legend" id="legend-${user.login}"></div>
        </div>
      </div>

      <!-- Top repos -->
      <div class="repos-section">
        <div class="section-title">Top Repositories</div>
        <div class="repos-grid">
          ${top6repos.map(repoCard).join('') || '<p style="color:#8b949e;font-size:14px">No public repos.</p>'}
        </div>
      </div>

    </div>
  `;

  // Now build the chart (has to run AFTER the canvas is in the DOM)
  buildLanguageChart(repos, user.login);
}


// ══════════════════════════════════════════
// 4. LANGUAGE CHART  (Chart.js doughnut)
// ══════════════════════════════════════════
function buildLanguageChart(repos, login) {
  // Count how many repos use each language
  const counts = {};
  repos.forEach(repo => {
    if (repo.language) {
      counts[repo.language] = (counts[repo.language] || 0) + 1;
    }
  });

  // If no language data at all
  if (Object.keys(counts).length === 0) {
    document.getElementById(`chart-${login}`).closest('.chart-wrap').innerHTML =
      '<p style="color:#8b949e;font-size:13px">No language data available.</p>';
    return;
  }

  // Sort by count descending, take top 6
  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const total  = sorted.reduce((s, [, v]) => s + v, 0);
  const labels = sorted.map(([lang]) => lang);
  const values = sorted.map(([, count]) => count);
  const colors = labels.map(getLangColor);

  // Build the doughnut chart using Chart.js
  const ctx = document.getElementById(`chart-${login}`).getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: '#161b22',   // gap colour between slices
        borderWidth: 3,
        hoverOffset: 6,
      }]
    },
    options: {
      responsive: false,
      cutout: '65%',            // makes it a doughnut (hole in centre)
      plugins: {
        legend: { display: false },  // we build our own legend below
        tooltip: {
          callbacks: {
            // Show "JavaScript: 12 repos (34%)" in tooltip
            label: ctx => ` ${ctx.label}: ${ctx.raw} repos (${Math.round(ctx.raw / total * 100)}%)`
          }
        }
      }
    }
  });

  // Build the custom legend to the right of the chart
  const legendEl = document.getElementById(`legend-${login}`);
  legendEl.innerHTML = sorted.map(([lang, count]) => {
    const pct = Math.round(count / total * 100);
    return `
      <div class="lang-row">
        <span class="lang-dot" style="background:${getLangColor(lang)}"></span>
        <span class="lang-name">${lang}</span>
        <span class="lang-percent">${pct}%</span>
      </div>
      <div class="lang-bar-track">
        <div class="lang-bar-fill" style="width:${pct}%; background:${getLangColor(lang)}"></div>
      </div>
    `;
  }).join('');
}


// ══════════════════════════════════════════
// 5. COMPARE TWO USERS
// ══════════════════════════════════════════
async function doCompare() {
  const u1 = document.getElementById('compare-input-1').value.trim();
  const u2 = document.getElementById('compare-input-2').value.trim();

  if (!u1 || !u2) {
    document.getElementById('compare-result').innerHTML =
      showMsg('✏️', 'Enter both usernames', 'Fill in both fields above to compare.');
    return;
  }

  if (u1.toLowerCase() === u2.toLowerCase()) {
    document.getElementById('compare-result').innerHTML =
      showMsg('🤔', 'Same username', 'Enter two different GitHub usernames to compare.');
    return;
  }

  document.getElementById('compare-result').innerHTML =
    `<div class="message"><div class="spinner"></div>Fetching both profiles...</div>`;

  // Fetch both users simultaneously
  const [d1, d2] = await Promise.all([
    fetchUserData(u1),
    fetchUserData(u2),
  ]);

  if (!d1 || !d2) {
    document.getElementById('compare-result').innerHTML =
      showMsg('❌', 'Could not fetch', 'One or both usernames were not found on GitHub.');
    return;
  }

  renderCompare(d1, d2);
}

// Fetch user + repos without showing anything (just returns data)
async function fetchUserData(username) {
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100`)
    ]);
    if (!userRes.ok) return null;
    const user  = await userRes.json();
    const repos = reposRes.ok ? await reposRes.json() : [];
    return { user, repos };
  } catch {
    return null;
  }
}

// Render the side-by-side compare result
function renderCompare(d1, d2) {
  const u1 = d1.user, r1 = d1.repos;
  const u2 = d2.user, r2 = d2.repos;

  // Calculate scores for comparison
  const stars1 = r1.reduce((s, r) => s + r.stargazers_count, 0);
  const stars2 = r2.reduce((s, r) => s + r.stargazers_count, 0);

  // Score = weighted sum of followers + stars + repos
  const score1 = u1.followers * 2 + stars1 * 3 + u1.public_repos;
  const score2 = u2.followers * 2 + stars2 * 3 + u2.public_repos;

  const winner = score1 > score2 ? u1.login : score2 > score1 ? u2.login : null;

  // Which side "wins" each stat? (for green/grey highlighting)
  function winClass(v1, v2, isLeft) {
    if (v1 === v2) return '';
    return (isLeft ? v1 > v2 : v2 > v1) ? 'winner' : 'loser';
  }

  document.getElementById('compare-result').innerHTML = `

    ${winner
      ? `<div class="winner-banner">🏆 @${winner} wins this comparison!</div>`
      : `<div class="winner-banner" style="color:#8b949e;border-color:#30363d;background:transparent">🤝 It's a tie!</div>`
    }

    <div class="compare-grid">

      <!-- LEFT: User 1 -->
      <div class="profile-card">
        <div class="compare-profile-top">
          <img src="${u1.avatar_url}" alt="${u1.login}" />
          <div class="compare-name">${u1.name || u1.login}</div>
          <div class="compare-login">@${u1.login}</div>
        </div>
        <div class="stats">
          <div class="stat-item">
            <div class="stat-number ${winClass(u1.public_repos, u2.public_repos, true)}">${formatNum(u1.public_repos)}</div>
            <div class="stat-label">Repos</div>
          </div>
          <div class="stat-item">
            <div class="stat-number ${winClass(u1.followers, u2.followers, true)}">${formatNum(u1.followers)}</div>
            <div class="stat-label">Followers</div>
          </div>
          <div class="stat-item">
            <div class="stat-number ${winClass(stars1, stars2, true)}">${formatNum(stars1)}</div>
            <div class="stat-label">Stars</div>
          </div>
        </div>
        <div class="chart-section">
          <div class="section-title">Languages</div>
          <div class="chart-wrap">
            <canvas id="chart-cmp-${u1.login}"></canvas>
            <div class="lang-legend" id="legend-cmp-${u1.login}"></div>
          </div>
        </div>
      </div>

      <!-- RIGHT: User 2 -->
      <div class="profile-card">
        <div class="compare-profile-top">
          <img src="${u2.avatar_url}" alt="${u2.login}" />
          <div class="compare-name">${u2.name || u2.login}</div>
          <div class="compare-login">@${u2.login}</div>
        </div>
        <div class="stats">
          <div class="stat-item">
            <div class="stat-number ${winClass(u2.public_repos, u1.public_repos, true)}">${formatNum(u2.public_repos)}</div>
            <div class="stat-label">Repos</div>
          </div>
          <div class="stat-item">
            <div class="stat-number ${winClass(u2.followers, u1.followers, true)}">${formatNum(u2.followers)}</div>
            <div class="stat-label">Followers</div>
          </div>
          <div class="stat-item">
            <div class="stat-number ${winClass(stars2, stars1, true)}">${formatNum(stars2)}</div>
            <div class="stat-label">Stars</div>
          </div>
        </div>
        <div class="chart-section">
          <div class="section-title">Languages</div>
          <div class="chart-wrap">
            <canvas id="chart-cmp-${u2.login}"></canvas>
            <div class="lang-legend" id="legend-cmp-${u2.login}"></div>
          </div>
        </div>
      </div>

    </div>
  `;

  // Build language charts for both users
  buildLanguageChart(r1, `cmp-${u1.login}`);
  buildLanguageChart(r2, `cmp-${u2.login}`);
}


// ══════════════════════════════════════════
// 6. HELPER FUNCTIONS
// ══════════════════════════════════════════

// Format big numbers: 1200 → "1.2k"
function formatNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n;
}

// Build a single repo card HTML
function repoCard(repo) {
  return `
    <a class="repo-card" href="${repo.html_url}" target="_blank">
      <div class="repo-name">${repo.name}</div>
      <div class="repo-desc">${repo.description || 'No description provided.'}</div>
      <div class="repo-footer">
        <span>★ ${repo.stargazers_count}</span>
        <span>⑂ ${repo.forks_count}</span>
        ${repo.language ? `<span>${repo.language}</span>` : ''}
      </div>
    </a>
  `;
}

// Build a simple message/error box HTML string
function showMsg(icon, title, text) {
  return `
    <div class="message">
      <div class="icon">${icon}</div>
      <div class="title">${title}</div>
      <div>${text}</div>
    </div>
  `;
}


// ══════════════════════════════════════════
// 7. ON PAGE LOAD
// ══════════════════════════════════════════
renderHistory(); // show any saved search history on startup