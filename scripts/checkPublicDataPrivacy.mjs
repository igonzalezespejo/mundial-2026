import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');

const piiRegexes = {
  email: /[^\s@]+@[^\s@]+\.[^\s@]+/g,
  phone: /\+?[\d\s-]{9,20}/g,
  url: /https?:\/\/[^\s]+/g
};

// Exclude certain known safe texts that might match loosely
const excludePhone = (str) => {
  if (str.length < 9) return true;
  if (/^202[0-9]-/.test(str)) return true; // dates are not phones
  if (/^\d{1,4}-\d{1,4}-\d{1,4}/.test(str)) return true; // timestamps / generic numbers
  if (str.includes("T00:00:00")) return true;
  return false;
};

async function checkPrivacy() {
  const criticalFindings = [];
  const reviewFindings = [];

  const filesToScan = [
    ...fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json')).map(f => path.join(DATA_DIR, f)),
    ...fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.md')).map(f => path.join(DOCS_DIR, f)),
    path.join(ROOT_DIR, 'README.md')
  ];

  for (const filePath of filesToScan) {
    if (!fs.existsSync(filePath)) continue;
    if (path.basename(filePath) === 'public_privacy_check.json') continue; // Don't self-scan output
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if docs/privacy_report.md has redacted terms correctly
    if (path.basename(filePath) === 'privacy_report.md') {
      const hasEmailInClear = piiRegexes.email.test(content);
      const emailMatches = content.match(piiRegexes.email) || [];
      const unredactedEmails = emailMatches.filter(m => !m.includes('<redacted'));
      
      if (unredactedEmails.length > 0) {
        criticalFindings.push(`[EMAIL] unredacted in ${path.basename(filePath)}: ${unredactedEmails[0]}`);
      }
      continue; // Skip full raw matching for privacy report itself unless unredacted
    }

    const emailMatches = content.match(piiRegexes.email) || [];
    for (const match of emailMatches) {
        criticalFindings.push(`[EMAIL] in ${path.basename(filePath)}`);
    }

    const urlMatches = content.match(piiRegexes.url) || [];
    for (const match of urlMatches) {
        if (!match.includes('github.com') && !match.includes('github.io') && !match.includes('localhost') && !match.includes('127.0.0.1')) { // ignore safe URLs
            criticalFindings.push(`[URL] in ${path.basename(filePath)}: ${match}`);
        }
    }
  }

  let status = 'OK';
  if (criticalFindings.length > 0) {
      status = 'BLOCKED';
  } else if (reviewFindings.length > 0) {
      status = 'OK_WITH_REVIEW';
  }

  const result = {
      criticalFindings,
      reviewFindings,
      status
  };

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, 'public_privacy_check.json'), JSON.stringify(result, null, 2));

  console.log(`Privacy Scan Complete. Status: ${status}`);
  if (status === 'BLOCKED') {
      console.error("Critical PII found! Check data/public_privacy_check.json");
      process.exit(1);
  }
}

checkPrivacy().catch(console.error);
