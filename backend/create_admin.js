const { query } = require('./config/db');
const bcrypt = require('bcrypt');

// Creates (or updates) an admin user.
// Credentials come from env vars so nothing is hardcoded in the repo:
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=your_password node create_admin.js
async function createAdmin() {
  try {
    const email    = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name     = process.env.ADMIN_NAME || 'Stock Simulator Admin';
    const role     = 'ADMIN';

    if (!email || !password) {
      console.error('❌ Set ADMIN_EMAIL and ADMIN_PASSWORD, e.g.:');
      console.error('   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=your_password node create_admin.js');
      process.exit(1);
    }

    console.log('🚀 Creating admin user...');

    const hash = await bcrypt.hash(password, 10);

    await query(`
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email)
      DO UPDATE SET password = $3, role = $4, name = $1
    `, [name, email, hash, role]);

    console.log(`✅ Admin user created/updated: ${email}`);
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
  } finally {
    process.exit();
  }
}

createAdmin();
