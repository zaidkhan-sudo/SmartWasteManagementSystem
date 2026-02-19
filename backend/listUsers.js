const db = require('./config/database');

async function listUsers() {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role FROM users ORDER BY id'
    );

    if (users.length === 0) {
      // console.log('❌ No users found!');
    } else {
      users.forEach(user => {
        // console.log(`${user.id}. ${user.name} (${user.email}) - ${user.role}`);
      });
    }

    // console.log(`\nTotal users: ${users.length}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

listUsers();
