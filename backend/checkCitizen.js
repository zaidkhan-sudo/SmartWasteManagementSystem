const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function checkCitizen() {
  try {
    // Get citizen user
    const [users] = await db.query(
      'SELECT id, name, email, password, role FROM users WHERE email = ?',
      ['citizen@smartwaste.com']
    );

    if (users.length === 0 || users[0].length === 0) {
      console.log('Citizen user not found, please create one.');
      return;
    }

    const user = users[0][0];

    const testPassword = 'citizen123';
    const isValid = await bcrypt.compare(testPassword, user.password);

    if (!isValid) {
      console.log('Updating password...');
      const newHash = await bcrypt.hash(testPassword, 10);
      await db.query(
        'UPDATE users SET password = ? WHERE email = ?',
        [newHash, 'citizen@smartwaste.com']
      );
      console.log('Password updated successfully!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkCitizen();
