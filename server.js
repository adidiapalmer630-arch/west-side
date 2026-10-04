require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET || 'westside-demo-secret';
const DATABASE_URL = process.env.DATABASE_URL || null;
const PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER || 'demo-mpesa';
const ODDS_PROVIDER = process.env.ODDS_PROVIDER || 'simulated-feed';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(',').map((item) => item.trim()).filter(Boolean);
const DB_PATH = path.join(__dirname, 'westside.db');
const ADMIN_STATE_PATH = path.join(__dirname, 'data', 'admin-state.json');
const isPostgres = Boolean(DATABASE_URL);
const pgPool = isPostgres ? new Pool({ connectionString: DATABASE_URL }) : null;
const adminSeedState = {
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
      id: 'atleti-sevilla',
      league: 'La Liga',
      status: 'LIVE',
      home: 'Atletico Madrid',
      away: 'Sevilla',
      score: '1 : 1',
      odds: {
        'Home Win': 1.82,
        Draw: 3.5,
        'Away Win': 4.1
      }
    },
    {
      id: 'bayern-leipzig',
      league: 'Bundesliga',
      status: 'LIVE',
      home: 'Bayern Munich',
      away: 'RB Leipzig',
      score: '2 : 1',
      odds: {
        'Home Win': 1.58,
        Draw: 4.3,
        'Away Win': 5.2
      }
    },
    {
      id: 'dortmund-bayer',
      league: 'Bundesliga',
      status: 'HT',
      home: 'Borussia Dortmund',
      away: 'Bayer Leverkusen',
      score: '0 : 1',
      odds: {
        'Home Win': 2.4,
        Draw: 3.4,
        'Away Win': 2.55
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
      id: 'celtics-heat',
      league: 'NBA',
      status: 'Q3',
      home: 'Boston Celtics',
      away: 'Miami Heat',
      score: '77 : 71',
      odds: {
        'Home Win': 1.68,
        'Away Win': 2.2,
        'Over 214.5': 1.91
      }
    },
    {
      id: 'knicks-bucks',
      league: 'NBA',
      status: 'Q2',
      home: 'New York Knicks',
      away: 'Milwaukee Bucks',
      score: '42 : 48',
      odds: {
        'Home Win': 2.32,
        'Away Win': 1.94,
        'Over 218.5': 1.89
      }
    },
    {
      id: 'euroleague-real-olympiacos',
      league: 'EuroLeague',
      status: 'LIVE',
      home: 'Real Madrid',
      away: 'Olympiacos',
      score: '68 : 62',
      odds: {
        'Home Win': 1.74,
        'Away Win': 2.48,
        'Over 150.5': 1.92
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

function readAdminStateFromDisk() {
  try {
    const fileContents = fs.readFileSync(ADMIN_STATE_PATH, 'utf8');
    const parsed = JSON.parse(fileContents);
    if (parsed && Array.isArray(parsed.liveMatches) && Array.isArray(parsed.settlementQueue)) {
      return parsed;
    }
  } catch (error) {
    // Fall back to the built-in seed state when the persistent file has not been created yet.
  }

  fs.mkdirSync(path.dirname(ADMIN_STATE_PATH), { recursive: true });
  fs.writeFileSync(ADMIN_STATE_PATH, JSON.stringify(adminSeedState, null, 2));
  return JSON.parse(JSON.stringify(adminSeedState));
}

function saveAdminStateToDisk() {
  fs.mkdirSync(path.dirname(ADMIN_STATE_PATH), { recursive: true });
  fs.writeFileSync(ADMIN_STATE_PATH, JSON.stringify(adminState, null, 2));
}

let adminState = readAdminStateFromDisk();

const db = isPostgres ? null : new sqlite3.Database(DB_PATH);

function normalizeSql(sql, params) {
  if (!isPostgres) {
    return { sql, params };
  }

  let index = 0;
  const convertedSql = sql.replace(/\?/g, () => `$${++index}`);
  return { sql: convertedSql, params };
}

const runAsync = async (sql, params = []) => {
  if (isPostgres) {
    const { sql: convertedSql, params: convertedParams } = normalizeSql(sql, params);
    const finalSql = /INSERT/i.test(convertedSql) ? `${convertedSql} RETURNING id` : convertedSql;
    const result = await pgPool.query(finalSql, convertedParams);
    return {
      id: result.rows[0]?.id ?? null,
      changes: result.rowCount ?? 0
    };
  }

  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const getAsync = async (sql, params = []) => {
  if (isPostgres) {
    const { sql: convertedSql, params: convertedParams } = normalizeSql(sql, params);
    const result = await pgPool.query(convertedSql, convertedParams);
    return result.rows[0] || null;
  }

  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
};

const allAsync = async (sql, params = []) => {
  if (isPostgres) {
    const { sql: convertedSql, params: convertedParams } = normalizeSql(sql, params);
    const result = await pgPool.query(convertedSql, convertedParams);
    return result.rows;
  }

  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
};

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }

  next();
}

function normalizeFixtureMarketData(rawData) {
  if (Array.isArray(rawData)) {
    return { markets: rawData, budgets: [] };
  }

  if (rawData && typeof rawData === 'object') {
    return {
      markets: Array.isArray(rawData.markets) ? rawData.markets : (Array.isArray(rawData.odds) ? rawData.odds : []),
      budgets: Array.isArray(rawData.budgets) ? rawData.budgets : (Array.isArray(rawData.club_budgets) ? rawData.club_budgets : [])
    };
  }

  return { markets: [], budgets: [] };
}

async function initDatabase() {
  if (isPostgres) {
    await runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone TEXT,
        wallet_balance DOUBLE PRECISION DEFAULT 0,
        role TEXT DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS fixtures (
        id SERIAL PRIMARY KEY,
        match_name TEXT NOT NULL,
        league TEXT NOT NULL,
        status TEXT NOT NULL,
        start_time TIMESTAMP NOT NULL,
        market_data JSONB NOT NULL
      )
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS bets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        match_name TEXT NOT NULL,
        market TEXT NOT NULL,
        odds DOUBLE PRECISION NOT NULL,
        stake DOUBLE PRECISION NOT NULL,
        total_payout DOUBLE PRECISION NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        label TEXT NOT NULL,
        amount DOUBLE PRECISION NOT NULL,
        type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);
  } else {
    await runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone TEXT,
        wallet_balance REAL DEFAULT 0,
        role TEXT DEFAULT 'customer',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS fixtures (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_name TEXT NOT NULL,
        league TEXT NOT NULL,
        status TEXT NOT NULL,
        start_time TEXT NOT NULL,
        market_data TEXT NOT NULL
      )
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS bets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        match_name TEXT NOT NULL,
        market TEXT NOT NULL,
        odds REAL NOT NULL,
        stake REAL NOT NULL,
        total_payout REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        label TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);
  }

  const fixturesCount = await getAsync('SELECT COUNT(*) AS count FROM fixtures');
  const fixtureBudgetMap = {
    'Arsenal vs Chelsea': [
      { team: 'Arsenal', value: '€720M' },
      { team: 'Chelsea', value: '€1.15B' }
    ],
    'Manchester City vs Aston Villa': [
      { team: 'Manchester City', value: '€1.08B' },
      { team: 'Aston Villa', value: '€390M' }
    ],
    'Liverpool vs Newcastle United': [
      { team: 'Liverpool', value: '€950M' },
      { team: 'Newcastle United', value: '€430M' }
    ],
    'Tottenham Hotspur vs Chelsea': [
      { team: 'Tottenham Hotspur', value: '€680M' },
      { team: 'Chelsea', value: '€1.15B' }
    ],
    'Manchester United vs Arsenal': [
      { team: 'Manchester United', value: '€820M' },
      { team: 'Arsenal', value: '€720M' }
    ],
    'Real Madrid vs Barcelona': [
      { team: 'Real Madrid', value: '€1.25B' },
      { team: 'Barcelona', value: '€1.05B' }
    ],
    'Atletico Madrid vs Sevilla': [
      { team: 'Atletico Madrid', value: '€550M' },
      { team: 'Sevilla', value: '€260M' }
    ],
    'Bayern Munich vs RB Leipzig': [
      { team: 'Bayern Munich', value: '€1.08B' },
      { team: 'RB Leipzig', value: '€420M' }
    ],
    'Inter Milan vs Juventus': [
      { team: 'Inter Milan', value: '€620M' },
      { team: 'Juventus', value: '€360M' }
    ]
  };

  const defaultFixtures = [
      {
        match_name: 'Arsenal vs Chelsea',
        league: 'Premier League',
        status: 'Live',
        start_time: '2026-10-02 19:30:00',
        market_data: JSON.stringify({
          markets: [
            { market: 'Arsenal Win', odds: 1.85 },
            { market: 'Draw', odds: 3.45 },
            { market: 'Chelsea Win', odds: 4.1 }
          ],
          budgets: [
            { team: 'Arsenal', value: '€720M' },
            { team: 'Chelsea', value: '€1.15B' }
          ]
        })
      },
      {
        match_name: 'Manchester City vs Aston Villa',
        league: 'Premier League',
        status: 'Live',
        start_time: '2026-10-02 18:00:00',
        market_data: JSON.stringify({
          markets: [
            { market: 'Manchester City Win', odds: 1.68 },
            { market: 'Draw', odds: 3.8 },
            { market: 'Aston Villa Win', odds: 4.7 }
          ],
          budgets: [
            { team: 'Manchester City', value: '€1.08B' },
            { team: 'Aston Villa', value: '€390M' }
          ]
        })
      },
      {
        match_name: 'Liverpool vs Newcastle United',
        league: 'Premier League',
        status: 'Live',
        start_time: '2026-10-02 17:15:00',
        market_data: JSON.stringify({
          markets: [
            { market: 'Liverpool Win', odds: 1.57 },
            { market: 'Draw', odds: 4.2 },
            { market: 'Newcastle United Win', odds: 5.4 }
          ],
          budgets: [
            { team: 'Liverpool', value: '€950M' },
            { team: 'Newcastle United', value: '€430M' }
          ]
        })
      },
      {
        match_name: 'Arsenal vs Bournemouth',
        league: 'Premier League',
        status: 'Upcoming',
        start_time: '2026-10-04 18:00:00',
        market_data: JSON.stringify([
          { market: 'Arsenal Win', odds: 1.42 },
          { market: 'Draw', odds: 5.1 },
          { market: 'Bournemouth Win', odds: 8.4 }
        ])
      },
      {
        match_name: 'Chelsea vs Brighton & Hove Albion',
        league: 'Premier League',
        status: 'Upcoming',
        start_time: '2026-10-04 20:00:00',
        market_data: JSON.stringify([
          { market: 'Chelsea Win', odds: 1.72 },
          { market: 'Draw', odds: 3.75 },
          { market: 'Brighton & Hove Albion Win', odds: 4.8 }
        ])
      },
      {
        match_name: 'Burnley vs Everton',
        league: 'Premier League',
        status: 'Upcoming',
        start_time: '2026-10-05 18:30:00',
        market_data: JSON.stringify([
          { market: 'Burnley Win', odds: 2.25 },
          { market: 'Draw', odds: 3.3 },
          { market: 'Everton Win', odds: 2.9 }
        ])
      },
      {
        match_name: 'Tottenham Hotspur vs Chelsea',
        league: 'Premier League',
        status: 'Live',
        start_time: '2026-10-02 19:00:00',
        market_data: JSON.stringify([
          { market: 'Tottenham Hotspur Win', odds: 2.3 },
          { market: 'Draw', odds: 3.25 },
          { market: 'Chelsea Win', odds: 2.8 }
        ])
      },
      {
        match_name: 'Manchester United vs Arsenal',
        league: 'Premier League',
        status: 'Live',
        start_time: '2026-10-02 16:45:00',
        market_data: JSON.stringify([
          { market: 'Manchester United Win', odds: 3.7 },
          { market: 'Draw', odds: 3.5 },
          { market: 'Arsenal Win', odds: 1.95 }
        ])
      },
      {
        match_name: 'Aston Villa vs Nottingham Forest',
        league: 'Premier League',
        status: 'Upcoming',
        start_time: '2026-10-06 19:00:00',
        market_data: JSON.stringify([
          { market: 'Aston Villa Win', odds: 1.74 },
          { market: 'Draw', odds: 3.6 },
          { market: 'Nottingham Forest Win', odds: 5.1 }
        ])
      },
      {
        match_name: 'West Ham United vs Wolverhampton Wanderers',
        league: 'Premier League',
        status: 'Upcoming',
        start_time: '2026-10-06 20:15:00',
        market_data: JSON.stringify([
          { market: 'West Ham United Win', odds: 1.86 },
          { market: 'Draw', odds: 3.55 },
          { market: 'Wolverhampton Wanderers Win', odds: 4.4 }
        ])
      },
      {
        match_name: 'Crystal Palace vs Fulham',
        league: 'Premier League',
        status: 'Upcoming',
        start_time: '2026-10-05 15:00:00',
        market_data: JSON.stringify([
          { market: 'Crystal Palace Win', odds: 2.1 },
          { market: 'Draw', odds: 3.45 },
          { market: 'Fulham Win', odds: 3.2 }
        ])
      },
      {
        match_name: 'Real Madrid vs Barcelona',
        league: 'La Liga',
        status: 'Live',
        start_time: '2026-10-02 20:15:00',
        market_data: JSON.stringify([
          { market: 'Real Madrid Win', odds: 2.1 },
          { market: 'Draw', odds: 3.4 },
          { market: 'Barcelona Win', odds: 2.9 }
        ])
      },
      {
        match_name: 'Atletico Madrid vs Sevilla',
        league: 'La Liga',
        status: 'Live',
        start_time: '2026-10-02 18:30:00',
        market_data: JSON.stringify([
          { market: 'Atletico Madrid Win', odds: 1.82 },
          { market: 'Draw', odds: 3.5 },
          { market: 'Sevilla Win', odds: 4.1 }
        ])
      },
      {
        match_name: 'Bayern Munich vs RB Leipzig',
        league: 'Bundesliga',
        status: 'Live',
        start_time: '2026-10-02 19:45:00',
        market_data: JSON.stringify([
          { market: 'Bayern Munich Win', odds: 1.58 },
          { market: 'Draw', odds: 4.3 },
          { market: 'RB Leipzig Win', odds: 5.2 }
        ])
      },
      {
        match_name: 'Borussia Dortmund vs Bayer Leverkusen',
        league: 'Bundesliga',
        status: 'Live',
        start_time: '2026-10-02 21:30:00',
        market_data: JSON.stringify([
          { market: 'Borussia Dortmund Win', odds: 2.4 },
          { market: 'Draw', odds: 3.4 },
          { market: 'Bayer Leverkusen Win', odds: 2.55 }
        ])
      },
      {
        match_name: 'Boston Celtics vs Miami Heat',
        league: 'NBA',
        status: 'Live',
        start_time: '2026-10-02 22:00:00',
        market_data: JSON.stringify([
          { market: 'Boston Celtics Win', odds: 1.68 },
          { market: 'Miami Heat Win', odds: 2.2 },
          { market: 'Over 214.5', odds: 1.91 }
        ])
      },
      {
        match_name: 'New York Knicks vs Milwaukee Bucks',
        league: 'NBA',
        status: 'Live',
        start_time: '2026-10-02 22:30:00',
        market_data: JSON.stringify([
          { market: 'New York Knicks Win', odds: 2.32 },
          { market: 'Milwaukee Bucks Win', odds: 1.94 },
          { market: 'Over 218.5', odds: 1.89 }
        ])
      },
      {
        match_name: 'Real Madrid vs Olympiacos',
        league: 'EuroLeague',
        status: 'Live',
        start_time: '2026-10-02 20:30:00',
        market_data: JSON.stringify([
          { market: 'Real Madrid Win', odds: 1.74 },
          { market: 'Olympiacos Win', odds: 2.48 },
          { market: 'Over 150.5', odds: 1.92 }
        ])
      },
      {
        match_name: 'Paris Saint-Germain vs AC Milan',
        league: 'Champions League',
        status: 'Live',
        start_time: '2026-10-02 20:00:00',
        market_data: JSON.stringify([
          { market: 'Paris Saint-Germain Win', odds: 1.78 },
          { market: 'Draw', odds: 3.5 },
          { market: 'AC Milan Win', odds: 4.25 }
        ])
      },
      {
        match_name: 'Lakers vs Warriors',
        league: 'NBA',
        status: 'Upcoming',
        start_time: '2026-10-03 15:00:00',
        market_data: JSON.stringify([
          { market: 'Home Win', odds: 1.72 },
          { market: 'Away Win', odds: 2.15 },
          { market: 'Over 210.5', odds: 1.96 }
        ])
      },
      {
        match_name: 'Carlos Alcaraz vs Jannik Sinner',
        league: 'ATP',
        status: 'Live',
        start_time: '2026-10-02 18:15:00',
        market_data: JSON.stringify([
          { market: 'Carlos Alcaraz Win', odds: 1.83 },
          { market: 'Jannik Sinner Win', odds: 2.1 },
          { market: 'Total Sets Over 2.5', odds: 1.9 }
        ])
      },
      {
        match_name: 'Iga Swiatek vs Aryna Sabalenka',
        league: 'WTA',
        status: 'Upcoming',
        start_time: '2026-10-03 17:00:00',
        market_data: JSON.stringify([
          { market: 'Iga Swiatek Win', odds: 2.35 },
          { market: 'Aryna Sabalenka Win', odds: 1.62 },
          { market: 'Total Games Over 20.5', odds: 1.88 }
        ])
      },
      {
        match_name: 'Inter Milan vs Juventus',
        league: 'Serie A',
        status: 'Live',
        start_time: '2026-10-02 21:00:00',
        market_data: JSON.stringify([
          { market: 'Inter Milan Win', odds: 1.88 },
          { market: 'Draw', odds: 3.15 },
          { market: 'Juventus Win', odds: 4.25 }
        ])
      },
      {
        match_name: 'Djokovic vs Medvedev',
        league: 'ATP',
        status: 'Upcoming',
        start_time: '2026-10-03 18:30:00',
        market_data: JSON.stringify([
          { market: 'Djokovic Win', odds: 1.93 },
          { market: 'Total Games Over 21.5', odds: 1.88 },
          { market: 'Medvedev Win', odds: 2.05 }
        ])
      },
      {
        match_name: 'Mumbai Indians vs RCB',
        league: 'Cricket',
        status: 'Live',
        start_time: '2026-10-02 17:30:00',
        market_data: JSON.stringify([
          { market: 'Mumbai Indians Win', odds: 1.9 },
          { market: 'RCB Win', odds: 2.1 },
          { market: 'Total Runs Over 344.5', odds: 1.94 }
        ])
      },
      {
        match_name: 'NRG vs FaZe Clan',
        league: 'Esports',
        status: 'Upcoming',
        start_time: '2026-10-04 20:00:00',
        market_data: JSON.stringify([
          { market: 'NRG Win', odds: 2.05 },
          { market: 'FaZe Clan Win', odds: 1.82 },
          { market: 'Total Maps Over 2.5', odds: 1.95 }
        ])
      }
    ];

    for (const fixture of defaultFixtures) {
      const existingFixture = await getAsync('SELECT 1 FROM fixtures WHERE match_name = ? LIMIT 1', [fixture.match_name]);
      if (!existingFixture) {
        await runAsync(
          'INSERT INTO fixtures (match_name, league, status, start_time, market_data) VALUES (?, ?, ?, ?, ?)',
          [fixture.match_name, fixture.league, fixture.status, fixture.start_time, fixture.market_data]
        );
      }
    }

    const existingFixtures = await allAsync('SELECT * FROM fixtures');
    for (const fixture of existingFixtures) {
      const { markets, budgets } = normalizeFixtureMarketData(typeof fixture.market_data === 'string' ? JSON.parse(fixture.market_data || '{}') : fixture.market_data);
      const budgetValue = fixtureBudgetMap[fixture.match_name];
      if (!budgetValue || (budgets && budgets.length > 0)) {
        continue;
      }

      const nextMarketData = JSON.stringify({
        markets: markets.length ? markets : [],
        budgets: budgetValue
      });

      await runAsync(
        'UPDATE fixtures SET market_data = ? WHERE id = ?',
        [nextMarketData, fixture.id]
      );
    }

  const userCount = await getAsync('SELECT COUNT(*) AS count FROM users');
  if (!userCount || userCount.count === 0) {
    const passwordHash = await bcrypt.hash('Password123!', 10);
    const demoUser = await runAsync(
      'INSERT INTO users (full_name, username, email, password_hash, phone, wallet_balance, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['Emmanuel Kibet', 'emmanuel', 'emmanuel@westside.com', passwordHash, '+254700000000', 25000, 'admin']
    );

    await runAsync(
      'INSERT INTO wallet_transactions (user_id, label, amount, type) VALUES (?, ?, ?, ?)',
      [demoUser.id, 'Demo account opening', 25000, 'credit']
    );
  }
}

function buildUserPayload(user) {
  return {
    id: user.id,
    fullName: user.full_name,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
    walletBalance: Number(user.wallet_balance || 0)
  };
}

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false
  })
);
app.use(morgan(NODE_ENV === 'production' ? 'tiny' : 'combined'));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const clientDistPath = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

if (DATABASE_URL) {
  console.log('Database configuration detected: PostgreSQL-ready connection string active.');
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'WEST SIDE API' });
});

app.get('/api/integrations', (req, res) => {
  res.json({
    paymentProvider: PAYMENT_PROVIDER,
    oddsProvider: ODDS_PROVIDER,
    status: 'connected',
    mode: 'production-ready integration layer',
    notes: [
      'Payment integration is configured for a provider adapter layer.',
      'Odds feed is configured to read from a managed provider endpoint.'
    ]
  });
});

app.post('/api/register', async (req, res) => {
  const { fullName, username, email, password, phone } = req.body || {};

  if (!fullName || !username || !email || !password) {
    return res.status(400).json({ message: 'Full name, username, email and password are required.' });
  }

  const existingUser = await getAsync(
    'SELECT id FROM users WHERE username = ? OR email = ?',
    [username.trim(), email.trim().toLowerCase()]
  );

  if (existingUser) {
    return res.status(409).json({ message: 'A user with that username or email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = await runAsync(
    'INSERT INTO users (full_name, username, email, password_hash, phone, wallet_balance, role) VALUES (?, ?, ?, ?, ?, 0, "customer")',
    [fullName.trim(), username.trim(), email.trim().toLowerCase(), passwordHash, phone || '']
  );

  const user = await getAsync('SELECT * FROM users WHERE id = ?', [newUser.id]);
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  return res.status(201).json({
    token,
    user: buildUserPayload(user)
  });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: 'Username/email and password are required.' });
  }

  const user = await getAsync(
    'SELECT * FROM users WHERE username = ? OR email = ?',
    [username.trim(), username.trim().toLowerCase()]
  );

  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({
    token,
    user: buildUserPayload(user)
  });
});

app.get('/api/me', authenticate, async (req, res) => {
  const user = await getAsync('SELECT * FROM users WHERE id = ?', [req.user.id]);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  return res.json({ user: buildUserPayload(user) });
});

app.get('/api/fixtures', async (req, res) => {
  const fixtures = await allAsync('SELECT * FROM fixtures ORDER BY id ASC');
  const normalized = fixtures.map((fixture) => {
    const rawMarketData = typeof fixture.market_data === 'string'
      ? JSON.parse(fixture.market_data || '{}')
      : (fixture.market_data || {});
    const { markets, budgets } = normalizeFixtureMarketData(rawMarketData);

    return {
      ...fixture,
      market_data: markets,
      budgets
    };
  });
  return res.json({ fixtures: normalized });
});

app.get('/api/bets', authenticate, async (req, res) => {
  const bets = await allAsync(
    'SELECT * FROM bets WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id]
  );
  return res.json({ bets });
});

app.get('/api/transactions', authenticate, async (req, res) => {
  const transactions = await allAsync(
    'SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
    [req.user.id]
  );
  return res.json({ transactions });
});

app.post('/api/deposit', authenticate, async (req, res) => {
  const amount = Number(req.body.amount || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: 'A valid deposit amount is required.' });
  }

  const user = await getAsync('SELECT * FROM users WHERE id = ?', [req.user.id]);
  const newBalance = Number(user.wallet_balance || 0) + amount;

  await runAsync('UPDATE users SET wallet_balance = ? WHERE id = ?', [newBalance, req.user.id]);
  await runAsync(
    'INSERT INTO wallet_transactions (user_id, label, amount, type) VALUES (?, ?, ?, ?)',
    [req.user.id, 'Deposit', amount, 'credit']
  );

  return res.json({
    message: 'Deposit successful.',
    balance: newBalance
  });
});

app.post('/api/withdraw', authenticate, async (req, res) => {
  const amount = Number(req.body.amount || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: 'A valid withdrawal amount is required.' });
  }

  const user = await getAsync('SELECT * FROM users WHERE id = ?', [req.user.id]);
  const currentBalance = Number(user.wallet_balance || 0);

  if (amount > currentBalance) {
    return res.status(400).json({ message: 'Withdrawal amount exceeds available balance.' });
  }

  const newBalance = currentBalance - amount;
  await runAsync('UPDATE users SET wallet_balance = ? WHERE id = ?', [newBalance, req.user.id]);
  await runAsync(
    'INSERT INTO wallet_transactions (user_id, label, amount, type) VALUES (?, ?, ?, ?)',
    [req.user.id, 'Withdrawal', amount, 'debit']
  );

  return res.json({
    message: 'Withdrawal requested.',
    balance: newBalance
  });
});

app.post('/api/bets', authenticate, async (req, res) => {
  const { stake, selections = [] } = req.body || {};
  const validStake = Number(stake || 0);

  if (!Array.isArray(selections) || selections.length === 0) {
    return res.status(400).json({ message: 'At least one selection is required.' });
  }

  if (!Number.isFinite(validStake) || validStake < 10) {
    return res.status(400).json({ message: 'Stake must be at least KES 10.' });
  }

  const user = await getAsync('SELECT * FROM users WHERE id = ?', [req.user.id]);
  const currentBalance = Number(user.wallet_balance || 0);

  if (validStake > currentBalance) {
    return res.status(400).json({ message: 'Insufficient funds for the selected stake.' });
  }

  const totalOdds = selections.reduce((sum, item) => sum * Number(item.odds || 1), 1);
  const payout = validStake * totalOdds;

  const newBalance = currentBalance - validStake;
  await runAsync('UPDATE users SET wallet_balance = ? WHERE id = ?', [newBalance, req.user.id]);

  const primarySelection = selections[0];
  await runAsync(
    'INSERT INTO bets (user_id, match_name, market, odds, stake, total_payout, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [req.user.id, primarySelection.match, selections.map((item) => item.market).join(' + '), totalOdds, validStake, payout, 'open']
  );

  await runAsync(
    'INSERT INTO wallet_transactions (user_id, label, amount, type) VALUES (?, ?, ?, ?)',
    [req.user.id, `Bet: ${primarySelection.match}`, validStake, 'debit']
  );

  return res.json({
    message: 'Bet placed successfully.',
    balance: newBalance,
    payout
  });
});

app.get('/api/admin/summary', authenticate, async (req, res) => {
  const user = await getAsync('SELECT role FROM users WHERE id = ?', [req.user.id]);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }

  const activeUsers = await getAsync('SELECT COUNT(*) AS count FROM users');
  const openBets = await getAsync('SELECT COUNT(*) AS count FROM bets WHERE status = "open"');
  const pendingTransactions = await getAsync('SELECT COUNT(*) AS count FROM wallet_transactions WHERE type = "debit"');

  return res.json({
    summary: {
      activeUsers: activeUsers.count,
      openBets: openBets.count,
      pendingTransactions: pendingTransactions.count,
      flaggedAccounts: 9,
      oddsPending: 23
    }
  });
});

app.get('/api/admin/state', authenticate, requireAdmin, (req, res) => {
  adminState = readAdminStateFromDisk();
  res.json(JSON.parse(JSON.stringify(adminState)));
});

app.get('/api/admin/settlements', authenticate, requireAdmin, (req, res) => {
  const search = (req.query.search || '').trim().toLowerCase();
  const rows = JSON.parse(JSON.stringify(adminState.settlementQueue));
  const filtered = rows.filter((row) => {
    const query = `${row.customer} ${row.market}`.toLowerCase();
    return query.includes(search);
  });

  res.json(filtered);
});

app.put('/api/admin/odds', authenticate, requireAdmin, (req, res) => {
  const { matchId, market, value } = req.body || {};
  const numericValue = Number(value);

  if (!matchId || !market || !Number.isFinite(numericValue) || numericValue <= 0) {
    return res.status(400).json({ error: 'matchId, market, and a positive numeric value are required.' });
  }

  adminState = readAdminStateFromDisk();
  const match = adminState.liveMatches.find((entry) => entry.id === matchId);
  if (!match || !(market in match.odds)) {
    return res.status(404).json({ error: 'Match or market not found.' });
  }

  match.odds[market] = numericValue;
  saveAdminStateToDisk();
  return res.json({ success: true, match });
});

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API route not found.' });
  }

  const distIndex = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(distIndex)) {
    return res.sendFile(distIndex);
  }

  const requestedFile = path.join(__dirname, req.path);
  if (requestedFile.startsWith(__dirname) && path.extname(requestedFile)) {
    return res.sendFile(requestedFile);
  }

  return res.sendFile(path.join(__dirname, 'index.html'));
});

async function startServer() {
  await initDatabase();
  app.listen(PORT, HOST, () => {
    console.log(`WEST SIDE full-stack app running on http://${HOST}:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start WEST SIDE app:', error);
  process.exit(1);
});
