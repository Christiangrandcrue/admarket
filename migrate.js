const https = require('https');
const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'visoxfhymssvunyazgsl';
const SECRET_TOKEN = 'sb_secret_KPRw135ET2w1taWcQCBgRg_-pG6LQRD';
const MIGRATION_FILE = '/home/user/webapp/supabase/migrations/20251127000001_create_creator_videos.sql';

const sql = fs.readFileSync(MIGRATION_FILE, 'utf8');

const data = JSON.stringify({ query: sql });

const options = {
  hostname: 'api.supabase.com',
  path: `/v1/projects/${PROJECT_REF}/database/query`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SECRET_TOKEN}`,
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('Migration Success:', body);
    } else {
      console.error('Migration Failed:', res.statusCode, body);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('Request Error:', error);
  process.exit(1);
});

req.write(data);
req.end();
