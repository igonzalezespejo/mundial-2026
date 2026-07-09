import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

describe('Extraction Results (Phase 1C)', () => {
  it('should have valid JSON files', () => {
    expect(fs.existsSync(path.join(DATA_DIR, 'participants.json'))).toBe(true);
    expect(fs.existsSync(path.join(DATA_DIR, 'matches.json'))).toBe(true);
    expect(fs.existsSync(path.join(DATA_DIR, 'predictions.json'))).toBe(true);
    expect(fs.existsSync(path.join(DATA_DIR, 'results.json'))).toBe(true);
    expect(fs.existsSync(path.join(DATA_DIR, 'scoring_validation.json'))).toBe(true);
    expect(fs.existsSync(path.join(DATA_DIR, 'extraction_warnings.json'))).toBe(true);
  });

  describe('Data Integrity', () => {
    let participants, matches, predictions, results, validation, warnings;

    it('reads all files successfully', () => {
      participants = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'participants.json'), 'utf8'));
      matches = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'matches.json'), 'utf8'));
      predictions = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'predictions.json'), 'utf8'));
      results = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'results.json'), 'utf8'));
      validation = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'scoring_validation.json'), 'utf8'));
      warnings = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'extraction_warnings.json'), 'utf8'));
    });

    it('has participants', () => {
      expect(participants.length).toBeGreaterThan(0);
    });

    it('has exactly 72 structural group matches with proper IDs', () => {
      expect(matches.length).toBe(72);
      const matchIds = matches.map(m => m.matchId);
      
      for (let i = 1; i <= 72; i++) {
        const expectedId = `MATCH-${String(i).padStart(3, '0')}`;
        expect(matchIds).toContain(expectedId);
      }
      
      const ids = new Set(matchIds);
      expect(ids.size).toBe(72); // No duplicates
    });

    it('preserves timestamps correctly', () => {
      const matchWithTime = matches.find(m => m.kickoffTime !== null);
      if (matchWithTime) {
        expect(matchWithTime.kickoffDateTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
      }
    });

    it('extraction_warnings.json is an array and has no structural errors', () => {
      expect(Array.isArray(warnings)).toBe(true);
      // We expect 0 structural warnings for now. If there are any, the test should fail
      // to flag the misalignment to the developer.
      const structuralWarnings = warnings.filter(w => w.type === 'MATCH_STRUCTURE_MISMATCH');
      expect(structuralWarnings.length).toBe(0);
    });

    it('each participant has exactly 72 predictions', () => {
      for (const p of participants) {
        const participantPreds = predictions.filter(pred => pred.participantId === p.participantId);
        expect(participantPreds.length).toBe(72);
      }
    });

    it('each group match has exactly 1 prediction per participant', () => {
      for (const m of matches) {
        const matchPreds = predictions.filter(pred => pred.matchId === m.matchId);
        expect(matchPreds.length).toBe(participants.length);
      }
    });
    
    it('perMatchDiscrepancies exists and is 0', () => {
       expect(validation.summary.perMatchDiscrepancies).toBeDefined();
       expect(validation.summary.perMatchDiscrepancies).toBe(0);
    });
  });
});
