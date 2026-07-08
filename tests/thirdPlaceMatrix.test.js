import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

describe('Third Place Matrix', () => {
    it('third_place_matrix_2026.json exists and has 495 combinations', () => {
        expect(fs.existsSync(path.join(dataDir, 'third_place_matrix_2026.json'))).toBe(true);
        const matrix = JSON.parse(fs.readFileSync(path.join(dataDir, 'third_place_matrix_2026.json'), 'utf8'));
        const keys = Object.keys(matrix);
        expect(keys.length).toBe(495);
        
        // Random check
        const sample = matrix['ABCDEFGH'];
        expect(sample).toBeDefined();
    });
});
