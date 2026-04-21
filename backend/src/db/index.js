const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

let resolveReady;
const ready = new Promise((res) => { resolveReady = res; });

async function initDb() {
  try {
    await applySchema();
    resolveReady();
    console.log("  Database connected successfully to PostgreSQL");
  } catch (err) {
    console.error("  Database init failed:", err);
    process.exit(1);
  }
}

async function applySchema() {
  const schema = `
    CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS refresh_tokens (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, token TEXT NOT NULL UNIQUE, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS tags (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, name TEXT NOT NULL, color TEXT NOT NULL DEFAULT '#888780', UNIQUE(user_id, name));
    CREATE TABLE IF NOT EXISTS notes (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, title TEXT NOT NULL, content TEXT NOT NULL DEFAULT '', category TEXT NOT NULL DEFAULT 'general', pinned INTEGER NOT NULL DEFAULT 0, favorite INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS note_tags (note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE, tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE, PRIMARY KEY (note_id, tag_id));
    CREATE TABLE IF NOT EXISTS note_links (source_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE, target_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE, PRIMARY KEY (source_id, target_id));
    CREATE TABLE IF NOT EXISTS bookmarks (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, title TEXT NOT NULL, url TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS bookmark_tags (bookmark_id INTEGER NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE, tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE, PRIMARY KEY (bookmark_id, tag_id));
    CREATE TABLE IF NOT EXISTS materials (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, title TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'book', total_units INTEGER NOT NULL DEFAULT 1, current_unit INTEGER NOT NULL DEFAULT 0, unit_label TEXT NOT NULL DEFAULT 'chapter', created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP);
  `;
  await pool.query(schema);
}

function prepare(sql) {
  // Convert sqlite ? bindings to postgres $N bindings
  let counter = 1;
  const pgSql = sql.replace(/\?/g, () => `$${counter++}`);

  return {
    async get(...params) {
      const res = await pool.query(pgSql, params);
      return res.rows[0];
    },
    async all(...params) {
      const res = await pool.query(pgSql, params);
      return res.rows;
    },
    async run(...params) {
      let finalSql = pgSql;
      // SQLite returns lastInsertRowid. PostgreSQL needs RETURNING id.
      if (pgSql.trim().toUpperCase().startsWith("INSERT") && !pgSql.toUpperCase().includes("RETURNING")) {
        finalSql += " RETURNING id";
      }
      
      const res = await pool.query(finalSql, params);
      return { 
        changes: res.rowCount,
        lastInsertRowid: res.rows.length ? res.rows[0].id : null 
      };
    }
  };
}

async function exec(sql) {
  await pool.query(sql);
}

initDb();

module.exports = { prepare, exec, ready };
