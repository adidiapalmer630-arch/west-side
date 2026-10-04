import { useEffect, useMemo, useState } from 'react';

const emptyAuthForm = {
  fullName: '',
  username: '',
  email: '',
  password: '',
  phone: ''
};

const currencyFormatter = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  maximumFractionDigits: 0
});

const API_BASE = import.meta.env.VITE_API_URL || '';

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('westside_token');
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'The request could not be completed.');
  }

  return data;
}

function App() {
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState(emptyAuthForm);
  const [token, setToken] = useState(() => localStorage.getItem('westside_token') || '');
  const [user, setUser] = useState(null);
  const [fixtures, setFixtures] = useState([]);
  const [slip, setSlip] = useState([]);
  const [stake, setStake] = useState(100);
  const [wallet, setWallet] = useState(0);
  const [bets, setBets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState({ type: 'info', text: 'Demo mode ready.' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFixtures();
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setWallet(0);
      setLoading(false);
      return;
    }

    loadSession();
  }, [token]);

  const totalOdds = useMemo(
    () => slip.reduce((total, item) => total * Number(item.odds || 1), 1),
    [slip]
  );

  const potentialReturn = stake * totalOdds || 0;

  const loadFixtures = async () => {
    try {
      const data = await apiFetch('/api/fixtures');
      const normalized = (data.fixtures || []).map((fixture) => {
        const budgetList = Array.isArray(fixture.budgets)
          ? fixture.budgets
          : (fixture.market_data && typeof fixture.market_data === 'object' && Array.isArray(fixture.market_data.budgets)
            ? fixture.market_data.budgets
            : []);

        return {
          id: fixture.id,
          match: fixture.match_name,
          league: fixture.league,
          status: fixture.status,
          budgets: budgetList,
          odds: (fixture.market_data || []).map((market) => ({
            label: market.market,
            value: Number(market.odds)
          }))
        };
      });
      setFixtures(normalized);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const loadSession = async () => {
    try {
      const me = await apiFetch('/api/me');
      const [betsData, txsData] = await Promise.all([
        apiFetch('/api/bets'),
        apiFetch('/api/transactions')
      ]);
      setUser(me.user);
      setWallet(Number(me.user.walletBalance || 0));
      setBets(betsData.bets || []);
      setTransactions(txsData.transactions || []);
      setMessage({ type: 'success', text: `Welcome back, ${me.user.fullName || me.user.username}.` });
    } catch (error) {
      localStorage.removeItem('westside_token');
      setToken('');
      setUser(null);
      setMessage({ type: 'error', text: 'Session expired. Please log in again.' });
    } finally {
      setLoading(false);
    }
  };

  const addToSlip = (match, market, odds) => {
    const exists = slip.some((item) => item.match === match && item.market === market);
    if (!exists) {
      setSlip((current) => [...current, { id: `${match}-${market}`, match, market, odds }]);
    }
  };

  const removeFromSlip = (id) => {
    setSlip((current) => current.filter((item) => item.id !== id));
  };

  const handleAuth = async (event) => {
    event.preventDefault();

    try {
      const payload =
        authMode === 'login'
          ? { username: authForm.username || authForm.email, password: authForm.password }
          : {
              fullName: authForm.fullName,
              username: authForm.username,
              email: authForm.email,
              password: authForm.password,
              phone: authForm.phone
            };

      const data = await apiFetch(`/api/${authMode === 'login' ? 'login' : 'register'}`, {
        method: 'POST',
        body: payload
      });

      setToken(data.token);
      localStorage.setItem('westside_token', data.token);
      setUser(data.user);
      setWallet(Number(data.user.walletBalance || 0));
      setAuthForm(emptyAuthForm);
      setMessage({
        type: 'success',
        text: authMode === 'login' ? 'Login successful.' : 'Account created successfully.'
      });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('westside_token');
    setToken('');
    setUser(null);
    setWallet(0);
    setSlip([]);
    setBets([]);
    setTransactions([]);
    setMessage({ type: 'info', text: 'Logged out successfully.' });
  };

  const handleWalletAction = async (action) => {
    if (!user) {
      setMessage({ type: 'error', text: 'Please log in to manage your wallet.' });
      return;
    }

    const rawAmount = Number(prompt(action === 'deposit' ? 'Enter deposit amount' : 'Enter withdrawal amount'));
    const amount = Number(rawAmount || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage({ type: 'error', text: 'Enter a valid amount greater than zero.' });
      return;
    }

    try {
      const data = await apiFetch(`/api/${action}`, {
        method: 'POST',
        body: { amount }
      });
      setWallet(Number(data.balance || 0));
      const txsData = await apiFetch('/api/transactions');
      setTransactions(txsData.transactions || []);
      setMessage({ type: 'success', text: data.message || 'Wallet updated.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const confirmBet = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'Please log in before placing a bet.' });
      return;
    }

    if (!slip.length) {
      setMessage({ type: 'error', text: 'Add at least one selection to your bet slip.' });
      return;
    }

    if (stake < 10) {
      setMessage({ type: 'error', text: 'Stake must be at least KES 10.' });
      return;
    }

    try {
      const data = await apiFetch('/api/bets', {
        method: 'POST',
        body: {
          stake,
          selections: slip.map((item) => ({ match: item.match, market: item.market, odds: item.odds }))
        }
      });

      const me = await apiFetch('/api/me');
      setWallet(Number(me.user.walletBalance || 0));
      const betData = await apiFetch('/api/bets');
      setBets(betData.bets || []);
      setSlip([]);
      setMessage({
        type: 'success',
        text: `Bet placed successfully. Potential return: ${currencyFormatter.format(Number(data.payout || 0))}`
      });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <span className="brand-mark" aria-hidden="true">W</span>
          <span className="brand-wordmark">WEST SIDE</span>
        </div>

        <nav className="nav">
          <a href="#" className="active">Home</a>
          <a href="#">Sports</a>
          <a href="#">My Bets</a>
          <a href="#">Wallet</a>
          <a href="#">Admin</a>
        </nav>

        <div className="header-actions">
          {user ? (
            <>
              <span className="user-pill">{user.fullName || user.username}</span>
              <button className="btn btn-secondary" type="button" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary" type="button" onClick={() => setAuthMode('login')}>Log in</button>
              <button className="btn btn-primary" type="button" onClick={() => setAuthMode('register')}>Join now</button>
            </>
          )}
        </div>
      </header>

      <main className="content">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Live betting platform</p>
            <h1>Smart picks for every headline match.</h1>
            <p>
              Built for modern sportsbook customers who want live odds, secure wallet controls,
              and a polished experience across desktop and mobile.
            </p>
            <div className="action-row">
              <button className="btn btn-primary" type="button">Explore odds</button>
              <button className="btn btn-secondary" type="button">My dashboard</button>
            </div>
          </div>

          <div className="hero-panel">
            <div className="panel-card stat-card wide">
              <div className="panel-head">
                <span>{user ? 'Wallet balance' : 'Demo wallet'}</span>
                <span className="pill live">Live</span>
              </div>
              <h2>{currencyFormatter.format(wallet || 25000)}</h2>
              <div className="mini-odds">
                <span>Arsenal 1.85</span>
                <span>Draw 3.45</span>
                <span>Chelsea 4.10</span>
              </div>
            </div>
          </div>
        </section>

        <section className="metrics">
          <div className="metric-box">
            <strong>24/7</strong>
            <span>Live markets</span>
          </div>
          <div className="metric-box">
            <strong>{fixtures.length || 320}</strong>
            <span>Matches daily</span>
          </div>
          <div className="metric-box">
            <strong>4.9/5</strong>
            <span>User trust</span>
          </div>
          <div className="metric-box accent">
            <strong>{currencyFormatter.format(wallet || 25000)}</strong>
            <span>Available funds</span>
          </div>
        </section>

        {message.text && (
          <div className={`notice notice-${message.type}`}>
            {message.text}
          </div>
        )}

        {user ? (
          <section className="dashboard-grid">
            <div className="dashboard-card">
              <h3>Wallet</h3>
              <div className="wallet-amount">{currencyFormatter.format(wallet || 0)}</div>
              <div className="wallet-actions">
                <button type="button" className="btn btn-primary" onClick={() => handleWalletAction('deposit')}>Deposit</button>
                <button type="button" className="btn btn-secondary" onClick={() => handleWalletAction('withdraw')}>Withdraw</button>
              </div>
            </div>
            <div className="dashboard-card">
              <h3>Recent activity</h3>
              <ul className="list">
                {(transactions.length ? transactions : [{ label: 'No transactions yet', amount: 0, type: 'info' }]).map((item, index) => (
                  <li key={`${item.label}-${index}`}>
                    <span>{item.label}</span>
                    <strong className={item.type === 'credit' ? 'credit' : 'debit'}>
                      {item.type === 'credit' ? '+' : '-'}{currencyFormatter.format(Number(item.amount || 0))}
                    </strong>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : (
          <section className="auth-panel">
            <form className="auth-form" onSubmit={handleAuth}>
              <h3>{authMode === 'login' ? 'Welcome back' : 'Create account'}</h3>
              {authMode === 'register' && (
                <input
                  type="text"
                  placeholder="Full name"
                  value={authForm.fullName}
                  onChange={(event) => setAuthForm({ ...authForm, fullName: event.target.value })}
                />
              )}
              <input
                type="text"
                placeholder={authMode === 'login' ? 'Username or email' : 'Username'}
                value={authForm.username}
                onChange={(event) => setAuthForm({ ...authForm, username: event.target.value })}
              />
              {authMode === 'register' && (
                <>
                  <input
                    type="email"
                    placeholder="Email"
                    value={authForm.email}
                    onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={authForm.phone}
                    onChange={(event) => setAuthForm({ ...authForm, phone: event.target.value })}
                  />
                </>
              )}
              <input
                type="password"
                placeholder="Password"
                value={authForm.password}
                onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
              />
              <button type="submit" className="btn btn-primary wide">
                {authMode === 'login' ? 'Log in' : 'Create account'}
              </button>
              <button
                type="button"
                className="btn btn-secondary wide"
                onClick={() => setAuthMode((current) => (current === 'login' ? 'register' : 'login'))}
              >
                {authMode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Log in'}
              </button>
            </form>
          </section>
        )}

        <section className="main-grid">
          <div className="left-column">
            <div className="section-header">
              <h2>Featured matches</h2>
              <a href="#">View all</a>
            </div>

            {loading ? (
              <div className="fixture-card">Loading fixtures...</div>
            ) : (
              fixtures.map((fixture) => (
                <article key={fixture.id} className="fixture-card">
                  <div className="fixture-topline">
                    <span className="league-tag">{fixture.league}</span>
                    <span className="pill status">{fixture.status}</span>
                  </div>

                  <div className="fixture-name">{fixture.match}</div>

                  {fixture.budgets?.length ? (
                    <div className="budget-row">
                      {fixture.budgets.map((budget) => (
                        <span className="budget-pill" key={`${fixture.id}-${budget.team}`}>
                          <strong>{budget.team}</strong> {budget.value}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="odds-grid">
                    {fixture.odds.map((odd) => (
                      <button
                        key={`${fixture.id}-${odd.label}`}
                        className="odds-button"
                        onClick={() => addToSlip(fixture.match, odd.label, odd.value)}
                        type="button"
                      >
                        {odd.label}
                        <strong>{odd.value}</strong>
                      </button>
                    ))}
                  </div>
                </article>
              ))
            )}
          </div>

          <aside className="bet-slip">
            <div className="bet-slip-header">
              <h3>Bet slip</h3>
              <span>{slip.length} pick{slip.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="slip-list">
              {slip.length === 0 ? (
                <p className="empty">Your selections will appear here.</p>
              ) : (
                slip.map((item) => (
                  <div key={item.id} className="slip-item">
                    <div>
                      <strong>{item.match}</strong>
                      <small>{item.market}</small>
                    </div>
                    <div className="slip-meta">
                      <span>{item.odds}</span>
                      <button type="button" onClick={() => removeFromSlip(item.id)}>Remove</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <label className="stake-label">
              Stake
              <div className="stake-box">
                <span>KES</span>
                <input
                  type="number"
                  min="10"
                  value={stake}
                  onChange={(event) => setStake(Number(event.target.value) || 0)}
                />
              </div>
            </label>

            <div className="payout-row">
              <span>Potential return</span>
              <strong>{currencyFormatter.format(potentialReturn)}</strong>
            </div>

            <button className="btn btn-primary wide" type="button" onClick={confirmBet}>
              Place bet
            </button>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default App;
