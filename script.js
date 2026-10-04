const STORAGE_KEY = 'westside-demo-state';
const ADMIN_STORAGE_KEY = 'westside-admin-state';
const AUTH_TOKEN_KEY = 'westside-auth-token';
const AUTH_USER_KEY = 'westside-auth-user';

const defaultState = {
  wallet: 25000,
  pastTransactions: [
    { label: 'Deposit • M-Pesa', amount: 2000, type: 'credit' },
    { label: 'Bet settlement', amount: 1250, type: 'credit' },
    { label: 'Withdrawal request', amount: 800, type: 'debit' }
  ],
  bets: [
    { match: 'Arsenal vs Chelsea', market: 'Arsenal Win', odds: 1.85, stake: 500, status: 'Open' },
    { match: 'Barcelona vs Real Madrid', market: 'Draw', odds: 3.5, stake: 400, status: 'Won' },
    { match: 'Lakers vs Warriors', market: 'Over 210.5', odds: 1.96, stake: 300, status: 'Settled' }
  ]
};

const adminDefaultState = {
  liveMatches: [
    {
      id: 'arsenal-chelsea',
      league: 'Premier League',
      status: 'LIVE',
      home: 'Arsenal',
      away: 'Chelsea',
      score: '2 : 1',
      odds: {
        'Home Win': 1.85,
        Draw: 3.45,
        'Away Win': 4.1
      }
    },
    {
      id: 'city-villa',
      league: 'Premier League',
      status: 'LIVE',
      home: 'Manchester City',
      away: 'Aston Villa',
      score: '1 : 1',
      odds: {
        'Home Win': 1.68,
        Draw: 3.8,
        'Away Win': 4.7
      }
    },
    {
      id: 'liverpool-newcastle',
      league: 'Premier League',
      status: 'LIVE',
      home: 'Liverpool',
      away: 'Newcastle United',
      score: '2 : 0',
      odds: {
        'Home Win': 1.57,
        Draw: 4.2,
        'Away Win': 5.4
      }
    },
    {
      id: 'tottenham-chelsea',
      league: 'Premier League',
      status: 'LIVE',
      home: 'Tottenham Hotspur',
      away: 'Chelsea',
      score: '1 : 1',
      odds: {
        'Home Win': 2.3,
        Draw: 3.25,
        'Away Win': 2.8
      }
    },
    {
      id: 'manutd-arsenal',
      league: 'Premier League',
      status: 'LIVE',
      home: 'Manchester United',
      away: 'Arsenal',
      score: '0 : 2',
      odds: {
        'Home Win': 3.7,
        Draw: 3.5,
        'Away Win': 1.95
      }
    },
    {
      id: 'chelsea-brighton',
      league: 'Premier League',
      status: 'UPCOMING',
      home: 'Chelsea',
      away: 'Brighton & Hove Albion',
      score: '— : —',
      odds: {
        'Home Win': 1.72,
        Draw: 3.75,
        'Away Win': 4.8
      }
    },
    {
      id: 'wolves-westham',
      league: 'Premier League',
      status: 'UPCOMING',
      home: 'Wolverhampton Wanderers',
      away: 'West Ham United',
      score: '— : —',
      odds: {
        'Home Win': 3.1,
        Draw: 3.4,
        'Away Win': 2.05
      }
    },
    {
      id: 'real-barca',
      league: 'La Liga',
      status: 'LIVE',
      home: 'Real Madrid',
      away: 'Barcelona',
      score: '3 : 2',
      odds: {
        'Home Win': 2.1,
        Draw: 3.4,
        'Away Win': 2.9
      }
    },
    {
      id: 'psg-milan',
      league: 'Champions League',
      status: 'HT',
      home: 'Paris Saint-Germain',
      away: 'AC Milan',
      score: '1 : 0',
      odds: {
        'Home Win': 1.78,
        Draw: 3.5,
        'Away Win': 4.25
      }
    },
    {
      id: 'lakers-warriors',
      league: 'NBA',
      status: 'Q4',
      home: 'Lakers',
      away: 'Warriors',
      score: '104 : 108',
      odds: {
        'Home Win': 1.72,
        'Away Win': 2.15,
        'Over 210.5': 1.96
      }
    },
    {
      id: 'inter-juve',
      league: 'Serie A',
      status: 'HT',
      home: 'Inter Milan',
      away: 'Juventus',
      score: '1 : 0',
      odds: {
        'Home Win': 1.88,
        Draw: 3.15,
        'Away Win': 4.25
      }
    },
    {
      id: 'djokovic-medvedev',
      league: 'Tennis',
      status: 'SET 2',
      home: 'Djokovic',
      away: 'Medvedev',
      score: '6 : 4',
      odds: {
        'Djokovic Win': 1.93,
        'Medvedev Win': 2.05,
        'Total Games Over 21.5': 1.88
      }
    },
    {
      id: 'mumbai-rcb',
      league: 'Cricket',
      status: 'LIVE',
      home: 'Mumbai Indians',
      away: 'RCB',
      score: '172/4 : 168/7',
      odds: {
        'Mumbai Win': 1.9,
        'RCB Win': 2.1,
        'Total Runs Over 344.5': 1.94
      }
    },
    {
      id: 'nrg-vs-faze',
      league: 'Esports',
      status: 'MAP 2',
      home: 'NRG',
      away: 'FaZe Clan',
      score: '9 : 12',
      odds: {
        'NRG Win': 2.05,
        'FaZe Win': 1.82,
        'Total Maps Over 2.5': 1.95
      }
    }
  ],
  settlementQueue: [
    { customer: 'Emmanuel Kibet', market: 'Arsenal Win', amount: 3200, status: 'Ready' },
    { customer: 'Mary Wanjiku', market: 'Draw', amount: 1450, status: 'Review' },
    { customer: 'Joseph Otieno', market: 'Over 214.5', amount: 6800, status: 'Cleared' },
    { customer: 'Jane Muthoni', market: 'Lakers Win', amount: 2400, status: 'Ready' },
    { customer: 'Peter Ndungu', market: 'Manchester City Win', amount: 2750, status: 'Ready' },
    { customer: 'Grace Achieng', market: 'Real Madrid Win', amount: 1980, status: 'Review' },
    { customer: 'Cynthia Wairimu', market: 'Mumbai Win', amount: 4200, status: 'Ready' }
  ]
};

let adminState = loadAdminState();

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { ...defaultState };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      wallet: Number(parsed.wallet) || defaultState.wallet,
      pastTransactions: Array.isArray(parsed.pastTransactions) ? parsed.pastTransactions : defaultState.pastTransactions,
      bets: Array.isArray(parsed.bets) ? parsed.bets : defaultState.bets
    };
  } catch (error) {
    return { ...defaultState };
  }
}

function loadAdminState() {
  const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
  if (!raw) {
    return JSON.parse(JSON.stringify(adminDefaultState));
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      liveMatches: Array.isArray(parsed.liveMatches) ? parsed.liveMatches : adminDefaultState.liveMatches,
      settlementQueue: Array.isArray(parsed.settlementQueue) ? parsed.settlementQueue : adminDefaultState.settlementQueue
    };
  } catch (error) {
    return JSON.parse(JSON.stringify(adminDefaultState));
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function saveAdminState(adminState) {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminState));
}

function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY) || '';
}

function setAuthToken(token) {
  if (!token) {
    clearAuthSession();
    return;
  }

  localStorage.setItem(AUTH_TOKEN_KEY, token);
  sessionStorage.setItem(AUTH_TOKEN_KEY, token);
}

function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY) || sessionStorage.getItem(AUTH_USER_KEY) || 'null';
    return raw === 'null' ? null : JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function saveCurrentUser(user) {
  if (!user) {
    clearAuthSession();
    return;
  }

  const serialized = JSON.stringify(user);
  localStorage.setItem(AUTH_USER_KEY, serialized);
  sessionStorage.setItem(AUTH_USER_KEY, serialized);
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0
  }).format(value);
}

function formatOdds(value) {
  return Number(value).toFixed(2);
}

async function fetchJson(url, options = {}, requireAuth = false) {
  const headers = { ...(options.headers || {}) };
  if (requireAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, { ...options, headers });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || payload.error || 'Request failed.');
  }

  return payload;
}

async function syncUserSession() {
  const token = getAuthToken();
  if (!token) {
    syncAuthUi();
    return null;
  }

  try {
    const payload = await fetchJson('/api/me', {}, true);
    if (payload && payload.user) {
      saveCurrentUser(payload.user);
      state.wallet = Number(payload.user.walletBalance || state.wallet);
      syncWalletDisplay();
    }
    syncAuthUi();
    return payload && payload.user ? payload.user : null;
  } catch (error) {
    clearAuthSession();
    syncAuthUi();
    return null;
  }
}

function syncAuthUi() {
  const user = getCurrentUser();
  const topActions = document.querySelector('.top-actions');
  if (!topActions) return;

  const loginButton = topActions.querySelectorAll('button')[0];
  const joinButton = topActions.querySelectorAll('button')[1];

  if (!loginButton || !joinButton) return;

  if (user) {
    loginButton.textContent = user.fullName || user.username || 'Profile';
    loginButton.dataset.authAction = 'profile';
    loginButton.classList.add('is-user');
    joinButton.textContent = 'Logout';
    joinButton.dataset.authAction = 'logout';
    joinButton.classList.add('danger');
    return;
  }

  loginButton.textContent = 'Log in';
  loginButton.dataset.authAction = 'login';
  loginButton.classList.remove('is-user');
  joinButton.textContent = 'Join now';
  joinButton.dataset.authAction = 'register';
  joinButton.classList.remove('danger');
}

function ensureAuthModal() {
  if (document.getElementById('westside-auth-modal')) {
    return document.getElementById('westside-auth-modal');
  }

  const modal = document.createElement('div');
  modal.id = 'westside-auth-modal';
  modal.className = 'auth-modal hidden';
  modal.innerHTML = `
    <div class="auth-backdrop" data-auth-close="true"></div>
    <div class="auth-panel" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <button type="button" class="auth-close" aria-label="Close">×</button>
      <div class="auth-header">
        <p class="eyebrow">Member access</p>
        <h2 id="auth-title">Welcome to WEST SIDE</h2>
      </div>
      <div class="auth-tabs">
        <button type="button" class="auth-tab active" data-auth-tab="login">Log in</button>
        <button type="button" class="auth-tab" data-auth-tab="register">Join now</button>
      </div>
      <form class="auth-form" data-auth-form="login">
        <label>
          Username or email
          <input name="username" type="text" placeholder="emmanuel or emmanuel@westside.com" required />
        </label>
        <label>
          Password
          <input name="password" type="password" placeholder="••••••••" required />
        </label>
        <button type="submit" class="btn btn-primary full-width">Log in</button>
      </form>
      <form class="auth-form" data-auth-form="register" hidden>
        <label>
          Full name
          <input name="fullName" type="text" placeholder="Jane Doe" required />
        </label>
        <label>
          Username
          <input name="username" type="text" placeholder="janedoe" required />
        </label>
        <label>
          Email
          <input name="email" type="email" placeholder="jane@westside.com" required />
        </label>
        <label>
          Password
          <input name="password" type="password" placeholder="Create a password" required />
        </label>
        <label>
          Phone
          <input name="phone" type="tel" placeholder="+2547..." />
        </label>
        <button type="submit" class="btn btn-primary full-width">Create account</button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
  return modal;
}

function openAuthModal(mode = 'login') {
  const modal = ensureAuthModal();
  modal.classList.remove('hidden');
  const tabs = modal.querySelectorAll('.auth-tab');
  tabs.forEach((tab) => {
    const isActive = tab.dataset.authTab === mode;
    tab.classList.toggle('active', isActive);
  });

  const forms = modal.querySelectorAll('.auth-form');
  forms.forEach((form) => {
    const active = form.dataset.authForm === mode;
    form.hidden = !active;
  });
}

function closeAuthModal() {
  const modal = document.getElementById('westside-auth-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const mode = form.dataset.authForm;
  const formData = Object.fromEntries(new FormData(form).entries());

  try {
    const endpoint = mode === 'login' ? '/api/login' : '/api/register';
    const payload = mode === 'login'
      ? await fetchJson(endpoint, {
          method: 'POST',
          body: JSON.stringify({ username: formData.username, password: formData.password })
        })
      : await fetchJson(endpoint, {
          method: 'POST',
          body: JSON.stringify({
            fullName: formData.fullName,
            username: formData.username,
            email: formData.email,
            password: formData.password,
            phone: formData.phone || ''
          })
        });

    if (payload.token) {
      setAuthToken(payload.token);
      saveCurrentUser(payload.user);
      state.wallet = Number(payload.user.walletBalance || state.wallet);
      closeAuthModal();
      syncWalletDisplay();
      syncAuthUi();

      if (document.body.dataset.page === 'admin') {
        await initializeAdminPage();
      }
      return;
    }

    throw new Error('Authentication failed.');
  } catch (error) {
    alert(error.message || 'Unable to complete authentication.');
  }
}

const adminApi = {
  async getState() {
    try {
      return await fetchJson('/api/admin/state', {}, true);
    } catch (error) {
      return loadAdminState();
    }
  },

  async getSettlementQueue() {
    try {
      return await fetchJson('/api/admin/settlements', {}, true);
    } catch (error) {
      return loadAdminState().settlementQueue;
    }
  },

  async updateOdds(matchId, market, value) {
    try {
      const payload = await fetchJson('/api/admin/odds', {
        method: 'PUT',
        body: JSON.stringify({ matchId, market, value: Number(value) })
      }, true);

      const nextState = loadAdminState();
      const match = nextState.liveMatches.find((entry) => entry.id === matchId);
      if (match && market in match.odds) {
        match.odds[market] = Number(value);
        saveAdminState(nextState);
      }
      return payload.match || match;
    } catch (error) {
      const fallbackState = loadAdminState();
      const match = fallbackState.liveMatches.find((entry) => entry.id === matchId);
      if (!match || !(market in match.odds)) {
        throw error;
      }

      match.odds[market] = Number(value);
      saveAdminState(fallbackState);
      return match;
    }
  }
};

async function syncAdminStateFromServer() {
  const serverState = await adminApi.getState();
  if (serverState && Array.isArray(serverState.liveMatches) && Array.isArray(serverState.settlementQueue)) {
    saveAdminState(serverState);
    adminState = serverState;
  }
  return loadAdminState();
}

function syncWalletDisplay() {
  const walletValue = Number(getCurrentUser()?.walletBalance || state.wallet || 0);
  document.querySelectorAll('[data-wallet]').forEach((element) => {
    element.textContent = formatMoney(walletValue);
  });
}

function getStakeValue() {
  const input = document.getElementById('stake');
  if (!input) return 0;
  return Number(input.value) || 0;
}

function getSlipItems() {
  const slip = JSON.parse(sessionStorage.getItem('westside-slip') || '[]');
  return Array.isArray(slip) ? slip : [];
}

function setSlipItems(items) {
  sessionStorage.setItem('westside-slip', JSON.stringify(items));
}

function calculatePotentialReturn() {
  const stake = getStakeValue();
  const slip = getSlipItems();
  if (!slip.length || !stake) {
    return 0;
  }

  const totalOdds = slip.reduce((accumulator, item) => accumulator * Number(item.odds || 1), 1);
  return stake * totalOdds;
}

function renderSlip() {
  const slip = getSlipItems();
  const slipContainer = document.getElementById('slip-items');
  const slipCount = document.getElementById('slip-count');
  const returnValue = document.getElementById('potential-return');

  if (!slipContainer) return;

  if (!slip.length) {
    slipContainer.classList.add('empty-state');
    slipContainer.innerHTML = '<p>Your selections will appear here.</p>';
    if (slipCount) slipCount.textContent = '0 picks';
    if (returnValue) returnValue.textContent = 'KES 0';
    return;
  }

  slipContainer.classList.remove('empty-state');
  slipContainer.innerHTML = slip
    .map(
      (item) => `
        <div class="slip-item">
          <strong>${item.match}</strong>
          <span>${item.market} • ${item.odds}</span>
          <button class="btn btn-ghost small remove-slip" data-remove="${item.id}">Remove</button>
        </div>
      `
    )
    .join('');

  if (slipCount) slipCount.textContent = `${slip.length} pick${slip.length > 1 ? 's' : ''}`;
  if (returnValue) returnValue.textContent = formatMoney(calculatePotentialReturn());
}

function addSelection(button) {
  const match = button.dataset.match;
  const market = button.dataset.market;
  const odds = Number(button.dataset.odds || 1);

  if (!match || !market) return;

  const slip = getSlipItems();
  const exists = slip.some((item) => item.match === match && item.market === market);
  if (exists) {
    return;
  }

  const newItem = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    match,
    market,
    odds
  };

  slip.push(newItem);
  setSlipItems(slip);
  renderSlip();
}

function removeSelection(id) {
  const next = getSlipItems().filter((item) => item.id !== id);
  setSlipItems(next);
  renderSlip();
}

function renderTransactions() {
  const list = document.getElementById('transaction-list');
  if (!list) return;

  const entries = state.pastTransactions.map((entry) => {
    const sign = entry.type === 'credit' ? '' : '-';
    return `
      <li>
        <span>${entry.label}</span>
        <strong>${sign}${formatMoney(entry.amount)}</strong>
      </li>
    `;
  }).join('');

  list.innerHTML = entries;
}

function renderBetHistory() {
  const list = document.getElementById('bet-history');
  if (!list) return;

  const entries = state.bets.map((bet) => {
    const statusClass = bet.status === 'Open' ? 'status-open' : bet.status === 'Won' ? 'status-win' : 'status-closed';
    return `
      <li>
        <div>
          <strong>${bet.match}</strong>
          <small>${bet.market} • ${bet.odds} • ${formatMoney(bet.stake)}</small>
        </div>
        <span class="status-pill ${statusClass}">${bet.status}</span>
      </li>
    `;
  }).join('');

  list.innerHTML = entries;
}

async function placeBet() {
  const slip = getSlipItems();
  const stake = getStakeValue();

  if (!slip.length) {
    return alert('Please add at least one selection to the bet slip.');
  }

  if (!stake || stake < 10) {
    return alert('Please enter a valid stake amount of at least KES 10.');
  }

  const currentUser = getCurrentUser();
  const walletValue = Number(currentUser?.walletBalance || state.wallet || 0);

  if (walletValue < stake) {
    return alert('Insufficient demo balance. Please deposit more funds.');
  }

  try {
    if (getAuthToken()) {
      const response = await fetchJson('/api/bets', {
        method: 'POST',
        body: JSON.stringify({ stake, selections: slip })
      }, true);

      if (currentUser) {
        currentUser.walletBalance = Number(response.balance || walletValue);
        saveCurrentUser(currentUser);
      }
      state.wallet = Number(response.balance || walletValue);
      setSlipItems([]);
      saveState();
      renderSlip();
      syncWalletDisplay();
      renderBetHistory();
      renderTransactions();
      alert(`Bet placed successfully. Stake: ${formatMoney(stake)}. Potential payout: ${formatMoney(response.payout || 0)}`);
      return;
    }
  } catch (error) {
    alert(error.message || 'Bet placement failed.');
    return;
  }

  const totalOdds = slip.reduce((accumulator, item) => accumulator * Number(item.odds || 1), 1);
  const payout = stake * totalOdds;

  state.wallet -= stake;
  state.bets.unshift({
    match: slip[0].match,
    market: slip.map((item) => item.market).join(' + '),
    odds: Number(totalOdds.toFixed(2)),
    stake,
    status: 'Open',
    payout
  });

  state.pastTransactions.unshift({
    label: `Bet • ${slip[0].match}`,
    amount: stake,
    type: 'debit'
  });

  setSlipItems([]);
  saveState();
  renderSlip();
  syncWalletDisplay();
  renderBetHistory();
  renderTransactions();
  alert(`Bet placed successfully. Stake: ${formatMoney(stake)}. Potential payout: ${formatMoney(payout)}`);
}

async function handleDeposit(event) {
  event.preventDefault();
  const input = document.getElementById('deposit-amount');
  if (!input) return;
  const amount = Number(input.value);
  if (!amount || amount <= 0) {
    return alert('Please enter a valid deposit amount.');
  }

  try {
    if (getAuthToken()) {
      const response = await fetchJson('/api/deposit', {
        method: 'POST',
        body: JSON.stringify({ amount })
      }, true);
      const user = getCurrentUser();
      if (user) {
        user.walletBalance = Number(response.balance || user.walletBalance || 0);
        saveCurrentUser(user);
      }
      state.wallet = Number(response.balance || state.wallet || 0);
      saveState();
      syncWalletDisplay();
      renderTransactions();
      alert(`Deposit successful. ${formatMoney(amount)} added to wallet.`);
      return;
    }
  } catch (error) {
    alert(error.message || 'Deposit failed.');
    return;
  }

  state.wallet += amount;
  state.pastTransactions.unshift({
    label: 'Deposit • M-Pesa',
    amount,
    type: 'credit'
  });
  saveState();
  syncWalletDisplay();
  renderTransactions();
  alert(`Deposit successful. ${formatMoney(amount)} added to wallet.`);
}

async function handleWithdrawal(event) {
  event.preventDefault();
  const input = document.getElementById('withdraw-amount');
  if (!input) return;
  const amount = Number(input.value);
  if (!amount || amount <= 0) {
    return alert('Please enter a valid withdrawal amount.');
  }

  try {
    if (getAuthToken()) {
      const response = await fetchJson('/api/withdraw', {
        method: 'POST',
        body: JSON.stringify({ amount })
      }, true);
      const user = getCurrentUser();
      if (user) {
        user.walletBalance = Number(response.balance || user.walletBalance || 0);
        saveCurrentUser(user);
      }
      state.wallet = Number(response.balance || state.wallet || 0);
      saveState();
      syncWalletDisplay();
      renderTransactions();
      alert(`Withdrawal request submitted for ${formatMoney(amount)}.`);
      return;
    }
  } catch (error) {
    alert(error.message || 'Withdrawal request failed.');
    return;
  }

  if (state.wallet < amount) {
    return alert('Withdrawal exceeds the current balance.');
  }

  state.wallet -= amount;
  state.pastTransactions.unshift({
    label: 'Withdrawal request',
    amount,
    type: 'debit'
  });
  saveState();
  syncWalletDisplay();
  renderTransactions();
  alert(`Withdrawal request submitted for ${formatMoney(amount)}.`);
}

function renderSettlementTable() {
  const tableBody = document.getElementById('settlement-table-body');
  if (!tableBody) return;

  const searchInput = document.getElementById('settlement-search');
  const searchValue = (searchInput ? searchInput.value : '').trim().toLowerCase();
  const adminState = loadAdminState();

  const filteredRows = adminState.settlementQueue.filter((row) => {
    const query = `${row.customer} ${row.market}`.toLowerCase();
    return query.includes(searchValue);
  });

  if (!filteredRows.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4">No matching settlements found.</td>
      </tr>
    `;
    return;
  }

  const statusClassMap = {
    Ready: 'status-win',
    Review: 'status-open',
    Cleared: 'status-closed'
  };

  tableBody.innerHTML = filteredRows
    .map((row) => `
      <tr>
        <td>${row.customer}</td>
        <td>${row.market}</td>
        <td>${formatMoney(row.amount)}</td>
        <td><span class="status-pill ${statusClassMap[row.status] || 'status-open'}">${row.status}</span></td>
      </tr>
    `)
    .join('');
}

function renderLiveMatches() {
  const matchList = document.getElementById('live-match-list');
  if (!matchList) return;

  const adminState = loadAdminState();
  matchList.innerHTML = adminState.liveMatches
    .map((match) => {
      const oddsMarkup = Object.entries(match.odds)
        .map(([market, value]) => `
          <div class="odds-editor">
            <button
              class="odds-control"
              type="button"
              data-match-id="${match.id}"
              data-market="${market}"
              data-value="${value}"
            >${formatOdds(value)}</button>
            <div class="odds-stepper">
              <button class="odds-step" type="button" data-match-id="${match.id}" data-market="${market}" data-adjust="-0.05">-0.05</button>
              <button class="odds-step" type="button" data-match-id="${match.id}" data-market="${market}" data-adjust="0.05">+0.05</button>
            </div>
          </div>
        `)
        .join('');

      return `
        <div class="live-match-card">
          <div class="live-header">
            <span class="league-badge">${match.league}</span>
            <span class="status-pill ${match.status === 'LIVE' ? 'status-open' : match.status === 'SET 2' ? 'status-win' : 'status-closed'}">${match.status}</span>
          </div>
          <div class="live-score">
            <strong>${match.home}</strong>
            <span>${match.score}</span>
            <strong>${match.away}</strong>
          </div>
          <div class="odds-row">
            ${oddsMarkup}
          </div>
        </div>
      `;
    })
    .join('');
}

async function handleOddsAdjustment(event) {
  const stepButton = event.target.closest('.odds-step');
  if (!stepButton) return;

  const matchId = stepButton.dataset.matchId;
  const market = stepButton.dataset.market;
  const adjustment = Number(stepButton.dataset.adjust || 0);
  const adminState = loadAdminState();
  const match = adminState.liveMatches.find((entry) => entry.id === matchId);

  if (!match || !(market in match.odds)) {
    alert('Market not found.');
    return;
  }

  const nextValue = Number((match.odds[market] + adjustment).toFixed(2));
  if (!Number.isFinite(nextValue) || nextValue <= 0) {
    alert('Odds must remain greater than zero.');
    return;
  }

  try {
    await adminApi.updateOdds(matchId, market, nextValue);
    await syncAdminStateFromServer();
    renderLiveMatches();
    renderSettlementTable();
  } catch (error) {
    alert(error.message || 'Could not update odds.');
  }
}

async function initializeAdminPage() {
  const user = await syncUserSession();
  if (!user || user.role !== 'admin') {
    const list = document.getElementById('live-match-list');
    if (list) {
      list.innerHTML = '<div class="auth-warning">Admin access required. Log in with an admin account to manage odds and settlements.</div>';
    }
    const table = document.getElementById('settlement-table-body');
    if (table) {
      table.innerHTML = '<tr><td colspan="4">Admin access required.</td></tr>';
    }
    return;
  }

  await syncAdminStateFromServer();

  const searchInput = document.getElementById('settlement-search');
  if (searchInput) {
    searchInput.addEventListener('input', renderSettlementTable);
  }

  renderLiveMatches();
  renderSettlementTable();
}

function registerGlobalEvents() {
  document.body.addEventListener('click', async (event) => {
    const authAction = event.target.closest('[data-auth-action]');
    if (authAction) {
      const action = authAction.dataset.authAction;
      if (action === 'login') openAuthModal('login');
      if (action === 'register') openAuthModal('register');
      if (action === 'logout') {
        clearAuthSession();
        syncAuthUi();
        syncWalletDisplay();
        window.location.reload();
      }
      return;
    }

    if (event.target.closest('[data-auth-close="true"]')) {
      closeAuthModal();
      return;
    }

    if (event.target.closest('.auth-close')) {
      closeAuthModal();
      return;
    }

    if (event.target.closest('.auth-tab')) {
      openAuthModal(event.target.closest('.auth-tab').dataset.authTab);
      return;
    }

    const stepButton = event.target.closest('.odds-step');
    if (stepButton) {
      handleOddsAdjustment(event);
      return;
    }

    const pickButton = event.target.closest('.pick');
    if (pickButton) {
      addSelection(pickButton);
    }

    const removeButton = event.target.closest('.remove-slip');
    if (removeButton) {
      removeSelection(removeButton.dataset.remove);
    }
  });

  document.body.addEventListener('submit', async (event) => {
    const authForm = event.target.closest('[data-auth-form]');
    if (authForm) {
      await handleAuthSubmit(event);
      return;
    }

    const depositForm = document.getElementById('deposit-form');
    if (event.target === depositForm) {
      await handleDeposit(event);
    }

    const withdrawForm = document.getElementById('withdraw-form');
    if (event.target === withdrawForm) {
      await handleWithdrawal(event);
    }
  });

  const stakeInput = document.getElementById('stake');
  if (stakeInput) {
    stakeInput.addEventListener('input', () => {
      const returnValue = document.getElementById('potential-return');
      if (returnValue) {
        returnValue.textContent = formatMoney(calculatePotentialReturn());
      }
    });
  }

  const placeButton = document.getElementById('place-bet');
  if (placeButton) {
    placeButton.addEventListener('click', placeBet);
  }

  const quickDeposit = document.getElementById('quick-deposit');
  if (quickDeposit) {
    quickDeposit.addEventListener('click', () => {
      const input = document.getElementById('deposit-amount');
      if (input) {
        input.value = '1000';
      }
      const form = document.getElementById('deposit-form');
      if (form) form.dispatchEvent(new Event('submit'));
    });
  }

  const quickWithdraw = document.getElementById('quick-withdraw');
  if (quickWithdraw) {
    quickWithdraw.addEventListener('click', () => {
      const input = document.getElementById('withdraw-amount');
      if (input) {
        input.value = '500';
      }
      const form = document.getElementById('withdraw-form');
      if (form) form.dispatchEvent(new Event('submit'));
    });
  }
}

async function renderIntegrationStatus() {
  let target = document.getElementById('provider-status');

  if (!target) {
    target = document.createElement('div');
    target.id = 'provider-status';
    target.className = 'provider-status';
    const shell = document.querySelector('.page-shell') || document.body;
    shell.insertBefore(target, shell.firstChild);
  }

  try {
    const info = await fetchJson('/api/integrations');
    target.textContent = `Connected: ${info.oddsProvider} • ${info.paymentProvider}`;
  } catch (error) {
    target.textContent = 'Connected: demo providers';
  }
}

function getLeagueFilterGroup(card) {
  const badgeText = card?.querySelector('.league-badge')?.textContent || '';
  const text = badgeText.toLowerCase();

  if (['premier league', 'la liga', 'bundesliga', 'champions league', 'serie a', 'football'].some((value) => text.includes(value))) {
    return 'Football';
  }

  if (['nba', 'euroleague', 'basketball'].some((value) => text.includes(value))) {
    return 'Basketball';
  }

  if (['tennis', 'atp', 'wta'].some((value) => text.includes(value))) {
    return 'Tennis';
  }

  return 'All';
}

function applySportsFilters(selectedFilter = 'All') {
  const cards = document.querySelectorAll('.fixture-card, .match-card');

  cards.forEach((card) => {
    const group = getLeagueFilterGroup(card);
    const shouldShow = selectedFilter === 'All' || group === selectedFilter;
    card.classList.toggle('is-hidden', !shouldShow);
  });

  document.querySelectorAll('.filter-chip').forEach((chip) => {
    const isActive = (chip.dataset.filter || 'All') === selectedFilter;
    chip.classList.toggle('active', isActive);
  });
}

function initializePage() {
  syncAuthUi();
  syncWalletDisplay();
  renderSlip();
  renderTransactions();
  renderBetHistory();
  registerGlobalEvents();
  syncUserSession();
  renderIntegrationStatus();

  const filterChips = document.querySelectorAll('.filter-chip');
  if (filterChips.length) {
    filterChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        applySportsFilters(chip.dataset.filter || 'All');
      });
    });
    applySportsFilters('All');
  }

  if (document.body.dataset.page === 'admin') {
    initializeAdminPage();
  }
}

let state = loadState();
initializePage();
