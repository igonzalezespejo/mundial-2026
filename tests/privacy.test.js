import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');

describe('Privacy Check (Phase 1D)', () => {
  it('docs/privacy_report.md exists and has no cleartext emails', () => {
    const reportPath = path.join(DOCS_DIR, 'privacy_report.md');
    expect(fs.existsSync(reportPath)).toBe(true);
    
    const content = fs.readFileSync(reportPath, 'utf8');
    const emailMatches = content.match(/[^\s@]+@[^\s@]+\.[^\s@]+/g) || [];
    const unredactedEmails = emailMatches.filter(m => !m.includes('<redacted'));
    
    expect(unredactedEmails.length).toBe(0);
  });

  it('data/public_privacy_check.json exists and status is not BLOCKED', () => {
    const checkPath = path.join(DATA_DIR, 'public_privacy_check.json');
    // Ensure the privacy script was run and created the file
    expect(fs.existsSync(checkPath)).toBe(true);
    
    const result = JSON.parse(fs.readFileSync(checkPath, 'utf8'));
    expect(result.status).not.toBe('BLOCKED');
    expect(result.criticalFindings.length).toBe(0);
  });
});
