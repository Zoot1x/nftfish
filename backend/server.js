import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Get current directory (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(bodyParser.json());

// Serve archives directory
const archivesPath = path.join(__dirname, '..', 'admin-bot', 'archives');
console.log(`📦 Serving archives from: ${archivesPath}`);
console.log(`📦 Archives directory exists: ${fs.existsSync(archivesPath)}`);

app.use('/archives', express.static(archivesPath, {
  dotfiles: 'allow'
}));

/**
 * Выполнить Python скрипт
 */
function runPythonScript(action, args = []) {
  return new Promise((resolve, reject) => {
    const python = spawn('python3', ['auth.py', action, ...args]);
    let output = '';
    let error = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      error += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(error || `Python script exited with code ${code}`));
      } else {
        try {
          resolve(JSON.parse(output));
        } catch (e) {
          reject(new Error(`Failed to parse Python output: ${output}`));
        }
      }
    });
  });
}

/**
 * GET /archives-debug
 * Проверить доступность архивов
 */
app.get('/archives-debug', (req, res) => {
  try {
    const files = fs.readdirSync(archivesPath);
    res.json({
      status: 'ok',
      path: archivesPath,
      exists: fs.existsSync(archivesPath),
      files: files.filter(f => !f.startsWith('.'))
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      path: archivesPath,
      error: error.message
    });
  }
});

/**
 * POST /api/auth/send-code
 * Отправить код подтверждения
 */
app.post('/api/auth/send-code', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const result = await runPythonScript('send_code', [phone]);
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/auth/verify-code
 * Проверить код подтверждения
 */
app.post('/api/auth/verify-code', async (req, res) => {
  try {
    const { phone, code, phone_code_hash } = req.body;

    if (!phone || !code || !phone_code_hash) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await runPythonScript('verify_code', [phone, code, phone_code_hash]);
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/auth/verify-password
 * Проверить пароль 2FA
 */
app.post('/api/auth/verify-password', async (req, res) => {
  try {
    const { phone, password, phone_code_hash, code } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await runPythonScript('verify_password', [
      phone,
      password,
      phone_code_hash,
      code,
    ]);
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

/**
 * GET /api/tdata/status
 * Получить статус доступных TData файлов
 */
app.get('/api/tdata/status', (req, res) => {
  try {
    const tdatasDir = path.join(__dirname, '..', 'admin-bot', 'tdatas');
    
    if (!fs.existsSync(tdatasDir)) {
      return res.json({ countries: {}, total_folders: 0 });
    }
    
    const countries = {};
    let totalFolders = 0;
    
    fs.readdirSync(tdatasDir).forEach(countryCode => {
      const countryPath = path.join(tdatasDir, countryCode);
      if (fs.statSync(countryPath).isDirectory()) {
        const folders = fs.readdirSync(countryPath).filter(f => 
          fs.statSync(path.join(countryPath, f)).isDirectory()
        );
        countries[countryCode] = folders.length;
        totalFolders += folders.length;
      }
    });
    
    res.json({ countries, total_folders: totalFolders });
  } catch (error) {
    console.error('Error getting tdata status:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`📱 Auth API available at http://localhost:${PORT}/api/auth`);
  console.log(`📦 TData API available at http://localhost:${PORT}/api/tdata`);
});
