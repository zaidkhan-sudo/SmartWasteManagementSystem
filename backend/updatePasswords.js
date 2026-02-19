const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function updatePasswords() {
  try {
    console.log('🔄 Updating user passwords...');

    // Hash the passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const collectorPassword = await bcrypt.hash('collector123', 10);
    const citizenPassword = await bcrypt.hash('citizen123', 10);

    // Update admin password
    await db.query(
      'UPDATE users SET password = ? WHERE email = ?',
      [adminPassword, 'admin@smartwaste.com']
    );
    console.log('✅ Admin password updated');

    // Update collector password
    await db.query(
      'UPDATE users SET password = ? WHERE email = ?',
      [collectorPassword, 'collector@smartwaste.com']
    );
    console.log('✅ Collector password updated');

    // Update citizen password
    await db.query(
      'UPDATE users SET password = ? WHERE email = ?',
      [citizenPassword, 'citizen@smartwaste.com']
    );
    console.log('✅ Citizen password updated');

    console.log('\n🎉 All passwords updated successfully!');
    console.log('\nYou can now login with:');
    console.log('Admin: admin@smartwaste.com / admin123');
    console.log('Collector: collector@smartwaste.com / collector123');
    console.log('Citizen: citizen@smartwaste.com / citizen123');

    return 0;
  } catch (error) {
    console.error('❌ Error updating passwords:', error);
    return 1;
  }
}

updatePasswords()
  .then((exitCode) => {
    process.exit(exitCode);
  });
