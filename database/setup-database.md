# Database Setup Guide

## Prerequisites
- MySQL Server 8.0.43 is installed ✅
- MySQL service is running

## Setup Steps

### Option 1: Using MySQL Command Line (Recommended)

1. **Open PowerShell/Command Prompt**

2. **Login to MySQL:**
   ```powershell
   mysql -u root -p
   ```
   Or if not in PATH:
   ```powershell
   & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
   ```

3. **Run the schema file:**
   Once logged in, execute:
   ```sql
   source C:/Users/Mohnish/OneDrive/Desktop/dbms project/smart-waste-management/database/schema.sql
   ```
   
   **Note:** Use forward slashes (/) in the path when inside MySQL prompt

4. **Verify database creation:**
   ```sql
   SHOW DATABASES;
   USE smart_waste_db;
   SHOW TABLES;
   ```

5. **Exit MySQL:**
   ```sql
   exit;
   ```

### Option 2: Using PowerShell Direct Import

Run this command in PowerShell (replace YOUR_PASSWORD):
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p"YOUR_PASSWORD" < "C:\Users\Mohnish\OneDrive\Desktop\dbms project\smart-waste-management\database\schema.sql"
```

### Option 3: Using MySQL Workbench (GUI)

1. Open MySQL Workbench
2. Connect to your local MySQL instance
3. Go to File → Open SQL Script
4. Select: `C:\Users\Mohnish\OneDrive\Desktop\dbms project\smart-waste-management\database\schema.sql`
5. Click Execute (⚡ icon)

## Update Environment Variables

Make sure your `.env` file has the correct credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_NAME=smart_waste_db
DB_PORT=3306
```

## Database Structure

After setup, you'll have:
- **Database:** `smart_waste_db`
- **Tables:**
  - `users` (with 3 sample users)
  - `bins` (with 8 sample bins)
  - `schedules` (with 2 sample schedules)
  - `reports`

## Default Login Credentials

**Admin:**
- Email: admin@smartwaste.com
- Password: admin123

**Collector:**
- Email: collector@smartwaste.com
- Password: collector123

**Citizen:**
- Email: citizen@smartwaste.com
- Password: citizen123

## Verify Installation

Run this query in MySQL to check data:
```sql
USE smart_waste_db;
SELECT * FROM users;
SELECT * FROM bins;
```

## Test Backend Connection

1. Navigate to backend folder:
   ```powershell
   cd "C:\Users\Mohnish\OneDrive\Desktop\dbms project\smart-waste-management\backend"
   ```

2. Install dependencies (if not done):
   ```powershell
   npm install
   ```

3. Start the server:
   ```powershell
   npm start
   ```

4. You should see: `✅ Database connected successfully`

## Troubleshooting

### Error: "Access denied for user 'root'@'localhost'"
- Check your password in `.env` file
- Verify MySQL root password

### Error: "Can't connect to MySQL server"
- Check if MySQL service is running:
  ```powershell
  Get-Service -Name MySQL*
  ```
- Start MySQL service if stopped:
  ```powershell
  Start-Service -Name "MySQL80"
  ```

### Error: "Database does not exist"
- Make sure you ran the schema.sql file
- Check database name is `smart_waste_db` (not `smart_waste_management`)
