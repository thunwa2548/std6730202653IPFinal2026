require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3060;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory Mock Data (ตามข้อกำหนดของโจทย์ Final Exam)
let inMemoryEmployees = [
  { id: "1", name: "John Doe", position: "Software Engineer", status: "Active", salary: 45000 },
  { id: "2", name: "Jane Smith", position: "Senior Solution Architect", status: "Active", salary: 85000 },
  { id: "3", name: "Somchai Jaidee", position: "Junior Frontend Developer", status: "Active", salary: 20000 },
  { id: "4", name: "Alice Johnson", position: "HR Specialist", status: "On Leave", salary: 35000 },
  { id: "5", name: "Bob Wilson", position: "DevOps Engineer", status: "Active", salary: 50000 },
  { id: "6", name: "Kanya Srisuk", position: "IT Support Intern", status: "Active", salary: 17000 },
  { id: "7", name: "David Brown", position: "Engineering Director", status: "Active", salary: 95000 }
];

let isDbConnected = false;
let pool = null;

// ชื่อตารางเริ่มต้น (รองรับทั้ง thunwa_* และชื่อปกติ)
let tableEmployees = 'thunwa_employees';
let tableUsers = 'thunwa_em_user';

let colMap = {
  id: 'employees_id',
  name: 'employees_name',
  position: 'employees_position',
  status: 'employees_status',
  salary: 'employees_salary'
};

// พยายามเชื่อมต่อ MySQL ทุกช่องทางที่เป็นไปได้บน Linux Server
async function connectDatabase() {
  const configs = [
    { label: 'TCP 127.0.0.1:3306', host: '127.0.0.1', port: 3306 },
    { label: 'Localhost', host: 'localhost', port: 3306 },
    { label: 'Unix Socket /var/run/mysqld/mysqld.sock', socketPath: '/var/run/mysqld/mysqld.sock' },
    { label: 'Unix Socket /tmp/mysql.sock', socketPath: '/tmp/mysql.sock' },
    { label: `DB_HOST (${process.env.DB_HOST || '119.59.102.161'})`, host: process.env.DB_HOST || '119.59.102.161', port: Number(process.env.DB_PORT) || 3306 }
  ];

  console.log('🔄 Connecting to MySQL Database...');

  // ป้องกันกรณี dotenv ตัดข้อความหลัง # ในรหัสผ่าน Lz#5pKqV
  let dbPass = process.env.DB_PASSWORD;
  if (!dbPass || dbPass === 'Lz' || dbPass.trim() === '') {
    dbPass = 'Lz#5pKqV';
  }

  for (const cfg of configs) {
    try {
      const connConfig = {
        user: process.env.DB_USER || 'std6730202653',
        password: dbPass,
        database: process.env.DB_NAME || 'it_std6730202653',
        waitForConnections: true,
        connectionLimit: 10,
        connectTimeout: 5000
      };

      if (cfg.socketPath) {
        connConfig.socketPath = cfg.socketPath;
      } else {
        connConfig.host = cfg.host;
        connConfig.port = cfg.port;
      }

      const testPool = mysql.createPool(connConfig);
      const connection = await testPool.getConnection();
      console.log(`✅ Connected to MySQL Database successfully via [${cfg.label}]!`);

      // ตรวจสอบชื่อตารางใน Database อัตโนมัติ (thunwa_employees หรือ employees)
      try {
        const [tables] = await connection.query('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);

        if (tableNames.includes('thunwa_employees')) {
          tableEmployees = 'thunwa_employees';
        } else if (tableNames.includes('employees')) {
          tableEmployees = 'employees';
        }

        if (tableNames.includes('thunwa_em_user')) {
          tableUsers = 'thunwa_em_user';
        } else if (tableNames.includes('em_user')) {
          tableUsers = 'em_user';
        } else if (tableNames.includes('users')) {
          tableUsers = 'users';
        }

        console.log(`📌 Using Tables: employees="${tableEmployees}", users="${tableUsers}"`);

        // ตรวจสอบชื่อคอลัมน์ในตาราง employees
        const [columns] = await connection.query(`SHOW COLUMNS FROM ${tableEmployees}`);
        const fields = columns.map(c => c.Field);
        if (fields.includes('employees_id')) {
          colMap = {
            id: 'employees_id',
            name: 'employees_name',
            position: 'employees_position',
            status: 'employees_status',
            salary: 'employees_salary'
          };
        } else if (fields.includes('id')) {
          colMap = {
            id: 'id',
            name: 'name',
            position: 'position',
            status: 'status',
            salary: 'salary'
          };
        }
        console.log(`📌 Using Column Mapping in ${tableEmployees}: id=${colMap.id}, name=${colMap.name}, salary=${colMap.salary}`);
      } catch (tableErr) {
        console.warn('⚠️ Table inspect warning:', tableErr.message);
      }

      connection.release();
      pool = testPool;
      isDbConnected = true;
      return;
    } catch (err) {
      console.error(`❌ Failed via [${cfg.label}]: ${err.code || err.message}`);
    }
  }

  console.warn('⚠️ All MySQL connection attempts failed. Using In-Memory Mode fallback.');
}
connectDatabase();

// 1D K-Means Clustering Algorithm (k = 3)
function calculateSalaryClusters(salaries, k = 3, maxIterations = 100) {
  if (!salaries || salaries.length === 0) {
    return Array.from({ length: k }, (_, i) => ({
      group: `Tier ${i + 1}`,
      centroid: 0,
      count: 0
    }));
  }

  const sorted = [...salaries].sort((a, b) => a - b);

  let centroids = [];
  if (sorted.length < k) {
    for (let i = 0; i < k; i++) centroids.push(sorted[i % sorted.length]);
  } else {
    centroids = [
      sorted[0],
      sorted[Math.floor(sorted.length / 2)],
      sorted[sorted.length - 1]
    ];
  }

  let clusters = Array.from({ length: k }, () => []);

  for (let iter = 0; iter < maxIterations; iter++) {
    clusters = Array.from({ length: k }, () => []);

    for (const salary of sorted) {
      let minDistance = Infinity;
      let clusterIndex = 0;
      for (let i = 0; i < centroids.length; i++) {
        const distance = Math.abs(salary - centroids[i]);
        if (distance < minDistance) {
          minDistance = distance;
          clusterIndex = i;
        }
      }
      clusters[clusterIndex].push(salary);
    }

    let converged = true;
    const nextCentroids = [];
    for (let i = 0; i < k; i++) {
      if (clusters[i].length > 0) {
        const sum = clusters[i].reduce((acc, curr) => acc + curr, 0);
        const mean = sum / clusters[i].length;
        if (Math.abs(mean - centroids[i]) > 0.001) converged = false;
        nextCentroids.push(mean);
      } else {
        nextCentroids.push(centroids[i]);
      }
    }
    centroids = nextCentroids;
    if (converged) break;
  }

  const clusterData = clusters.map((items, idx) => {
    const count = items.length;
    const mean = count > 0 ? items.reduce((a, b) => a + b, 0) / count : centroids[idx];
    return { rawCentroid: mean, centroid: Math.round(mean), count };
  });

  clusterData.sort((a, b) => a.rawCentroid - b.rawCentroid);

  return clusterData.map((c, index) => ({
    group: `Tier ${index + 1}`,
    centroid: c.centroid,
    count: c.count
  }));
}

// -------------------------------------------------------------
// Routes
// -------------------------------------------------------------

app.get('/', (req, res) => {
  res.status(200).json({
    message: "HR Manager & Salary Analytics API is running",
    mode: isDbConnected ? `MySQL Cloud Database (${tableEmployees})` : "In-Memory Array",
    port: PORT
  });
});

/**
 * 1. POST /api/login
 * Body: { username, password }
 */
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(`🔑 [POST /api/login] Attempt for username: "${username}"`);

  // 1. ตรวจสอบจากตาราง Users ใน Cloud MySQL (รองรับ thunwa_em_user / em_user)
  if (isDbConnected && pool) {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM ${tableUsers} WHERE username = ? AND password = ?`,
        [username, password]
      );
      if (rows && rows.length > 0) {
        console.log(`✅ [POST /api/login] SUCCESS via database table "${tableUsers}" for: ${username}`);
        return res.status(200).json({
          success: true,
          token: "mock-jwt-token",
          user: {
            username: rows[0].username,
            role: rows[0].role || 'admin'
          }
        });
      }
    } catch (err) {
      console.warn(`⚠️ [POST /api/login] Query ${tableUsers} error:`, err.message);
    }
  }

  // 2. ตรวจสอบตามเกณฑ์ข้อสอบ (admin / password123 หรือ naikub2548)
  if (username === 'admin' && (password === 'password123' || password === 'naikub2548')) {
    console.log(`✅ [POST /api/login] SUCCESS via Default Credentials for: ${username}`);
    return res.status(200).json({
      success: true,
      token: "mock-jwt-token"
    });
  }

  console.log(`❌ [POST /api/login] FAILED for username: "${username}"`);
  return res.status(401).json({
    success: false,
    message: "Invalid username or password"
  });
});

/**
 * Phase 2: GET /api/employees/salary-clusters
 */
app.get('/api/employees/salary-clusters', async (req, res) => {
  console.log('🧠 [GET /api/employees/salary-clusters] Request received');
  try {
    let salaries = [];

    if (isDbConnected && pool) {
      try {
        const [rows] = await pool.query(`SELECT ${colMap.salary} AS salary FROM ${tableEmployees}`);
        salaries = rows.map(r => Number(r.salary)).filter(s => !isNaN(s));
        console.log(`📊 [salary-clusters] Extracted ${salaries.length} salaries from MySQL table "${tableEmployees}"`);
      } catch (dbErr) {
        console.warn('⚠️ [salary-clusters] DB query error, using in-memory:', dbErr.message);
        salaries = inMemoryEmployees.map(e => Number(e.salary)).filter(s => !isNaN(s));
      }
    } else {
      salaries = inMemoryEmployees.map(e => Number(e.salary)).filter(s => !isNaN(s));
      console.log(`📊 [salary-clusters] Extracted ${salaries.length} salaries from in-memory`);
    }

    const clusters = calculateSalaryClusters(salaries, 3);
    console.log('✅ [salary-clusters] Clusters calculated:', JSON.stringify(clusters));
    return res.status(200).json({
      success: true,
      clusters: clusters
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error calculating salary clusters",
      error: error.message
    });
  }
});

/**
 * 2. GET /api/employees
 */
app.get('/api/employees', async (req, res) => {
  console.log('📥 [GET /api/employees] Request received');
  if (isDbConnected && pool) {
    try {
      const sql = `
        SELECT 
          CAST(${colMap.id} AS CHAR) AS id,
          ${colMap.name} AS name,
          ${colMap.position} AS position,
          ${colMap.status} AS status,
          CAST(${colMap.salary} AS SIGNED) AS salary
        FROM ${tableEmployees}
        ORDER BY ${colMap.id} ASC
      `;
      const [rows] = await pool.query(sql);
      console.log(`📋 [GET /api/employees] Returned ${rows.length} records from MySQL table "${tableEmployees}"`);
      return res.status(200).json(rows);
    } catch (error) {
      console.warn('⚠️ [GET /api/employees] DB query failed, fallback to in-memory:', error.message);
    }
  }

  console.log(`📋 [GET /api/employees] Returned ${inMemoryEmployees.length} records from In-Memory`);
  return res.status(200).json(inMemoryEmployees);
});

/**
 * 3. POST /api/employees
 */
app.post('/api/employees', async (req, res) => {
  const { name, position, salary } = req.body;
  console.log(`➕ [POST /api/employees] Adding: Name="${name}", Position="${position}", Salary=${salary}`);

  if (!name || !position || salary === undefined || salary === null || salary === "") {
    return res.status(400).json({
      success: false,
      message: "Bad Request: 'name', 'position', and 'salary' fields are all required."
    });
  }

  const numericSalary = Number(salary);
  if (isNaN(numericSalary)) {
    return res.status(400).json({
      success: false,
      message: "Bad Request: 'salary' must be a valid number."
    });
  }

  if (isDbConnected && pool) {
    try {
      const sql = `
        INSERT INTO ${tableEmployees} (${colMap.name}, ${colMap.position}, ${colMap.status}, ${colMap.salary})
        VALUES (?, ?, 'Active', ?)
      `;
      const [result] = await pool.query(sql, [
        String(name).trim(),
        String(position).trim(),
        numericSalary
      ]);

      const newEmp = {
        id: String(result.insertId),
        name: String(name).trim(),
        position: String(position).trim(),
        status: "Active",
        salary: numericSalary
      };
      console.log(`✅ [POST /api/employees] Saved to MySQL table "${tableEmployees}" with ID: ${newEmp.id}`);
      return res.status(201).json(newEmp);
    } catch (error) {
      console.warn('⚠️ [POST /api/employees] DB insert failed, fallback to in-memory:', error.message);
    }
  }

  // In-memory insert
  const newEmp = {
    id: String(Date.now()),
    name: String(name).trim(),
    position: String(position).trim(),
    status: "Active",
    salary: numericSalary
  };
  inMemoryEmployees.push(newEmp);
  console.log(`✅ [POST /api/employees] Saved to In-Memory with ID: ${newEmp.id}`);
  return res.status(201).json(newEmp);
});

/**
 * 4. PUT /api/employees/:id/status
 */
app.put('/api/employees/:id/status', async (req, res) => {
  const { id } = req.params;
  console.log(`🔄 [PUT /api/employees/:id/status] Toggling ID: ${id}`);

  if (isDbConnected && pool) {
    try {
      const [rows] = await pool.query(
        `SELECT ${colMap.status} AS status FROM ${tableEmployees} WHERE ${colMap.id} = ?`,
        [id]
      );

      if (rows.length > 0) {
        const currentStatus = rows[0].status;
        const newStatus = currentStatus === 'Active' ? 'On Leave' : 'Active';

        await pool.query(
          `UPDATE ${tableEmployees} SET ${colMap.status} = ? WHERE ${colMap.id} = ?`,
          [newStatus, id]
        );

        const [updatedRows] = await pool.query(
          `SELECT 
            CAST(${colMap.id} AS CHAR) AS id,
            ${colMap.name} AS name,
            ${colMap.position} AS position,
            ${colMap.status} AS status,
            CAST(${colMap.salary} AS SIGNED) AS salary
          FROM ${tableEmployees} WHERE ${colMap.id} = ?`,
          [id]
        );

        console.log(`✅ [PUT status] Updated ID ${id} to "${newStatus}" in MySQL table "${tableEmployees}"`);
        return res.status(200).json(updatedRows[0]);
      }
    } catch (error) {
      console.warn('⚠️ [PUT status] DB update failed, fallback to in-memory:', error.message);
    }
  }

  // In-memory update
  const employee = inMemoryEmployees.find(emp => String(emp.id) === String(id));
  if (!employee) {
    return res.status(404).json({
      success: false,
      message: `Employee with ID '${id}' not found.`
    });
  }

  employee.status = employee.status === "Active" ? "On Leave" : "Active";
  console.log(`✅ [PUT status] Updated ID ${id} to "${employee.status}" in In-Memory`);
  return res.status(200).json(employee);
});

/**
 * PUT /api/employees/:id (Update Full Employee: name, position, salary, status)
 */
app.put('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  const { name, position, salary, status } = req.body;
  console.log(`✏️ [PUT /api/employees/:id] Updating ID ${id}:`, req.body);

  if (!name || !position || salary === undefined || salary === null || salary === "") {
    return res.status(400).json({
      success: false,
      message: "Bad Request: 'name', 'position', and 'salary' fields are all required."
    });
  }

  const numericSalary = Number(salary);
  if (isNaN(numericSalary)) {
    return res.status(400).json({
      success: false,
      message: "Bad Request: 'salary' must be a valid number."
    });
  }

  const validStatus = status === 'On Leave' ? 'On Leave' : 'Active';

  if (isDbConnected && pool) {
    try {
      const sql = `
        UPDATE ${tableEmployees} 
        SET ${colMap.name} = ?, ${colMap.position} = ?, ${colMap.salary} = ?, ${colMap.status} = ?
        WHERE ${colMap.id} = ?
      `;
      const [result] = await pool.query(sql, [
        String(name).trim(),
        String(position).trim(),
        numericSalary,
        validStatus,
        id
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: `Employee with ID '${id}' not found.`
        });
      }

      const updatedEmp = {
        id: String(id),
        name: String(name).trim(),
        position: String(position).trim(),
        status: validStatus,
        salary: numericSalary
      };
      console.log(`✅ [PUT /api/employees/:id] Updated ID ${id} in MySQL table "${tableEmployees}"`);
      return res.status(200).json(updatedEmp);
    } catch (error) {
      console.warn('⚠️ [PUT /api/employees/:id] DB update failed, fallback to in-memory:', error.message);
    }
  }

  // In-memory update
  const employee = inMemoryEmployees.find(emp => String(emp.id) === String(id));
  if (!employee) {
    return res.status(404).json({
      success: false,
      message: `Employee with ID '${id}' not found.`
    });
  }

  employee.name = String(name).trim();
  employee.position = String(position).trim();
  employee.salary = numericSalary;
  employee.status = validStatus;

  console.log(`✅ [PUT /api/employees/:id] Updated ID ${id} in In-Memory`);
  return res.status(200).json(employee);
});

/**
 * 5. DELETE /api/employees/:id
 */
app.delete('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ [DELETE /api/employees/:id] Deleting ID: ${id}`);

  if (isDbConnected && pool) {
    try {
      const [result] = await pool.query(
        `DELETE FROM ${tableEmployees} WHERE ${colMap.id} = ?`,
        [id]
      );

      if (result.affectedRows > 0) {
        console.log(`✅ [DELETE] Deleted ID ${id} from MySQL table "${tableEmployees}"`);
        return res.status(200).json({
          success: true,
          message: `Employee with ID '${id}' removed successfully.`
        });
      }
    } catch (error) {
      console.warn('⚠️ [DELETE] DB delete failed, fallback to in-memory:', error.message);
    }
  }

  // In-memory delete
  const index = inMemoryEmployees.findIndex(emp => String(emp.id) === String(id));
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Employee with ID '${id}' not found.`
    });
  }

  inMemoryEmployees.splice(index, 1);
  console.log(`✅ [DELETE] Deleted ID ${id} from In-Memory`);
  return res.status(200).json({
    success: true,
    message: `Employee with ID '${id}' removed successfully.`
  });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🚀 HR Manager Backend Server running on port ${PORT}`);
  console.log(`📡 Base API URL: http://localhost:${PORT}/api`);
  console.log(`====================================================`);
});
