import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

describe('Bracket Template', () => {
    it('bracket_template_2026.json exists', () => {
        expect(fs.existsSync(path.join(dataDir, 'bracket_template_2026.json'))).toBe(true);
    });

    it('R32 has 16 slots with matchNo, homeSource, awaySource', () => {
        const template = JSON.parse(fs.readFileSync(path.join(dataDir, 'bracket_template_2026.json'), 'utf8'));
        const r32 = template.filter(s => s.round === 'R32');
        expect(r32.length).toBe(16);
        
        for (const slot of r32) {
            expect(slot.matchNo).toBeDefined();
            expect(slot.homeSource).toBeDefined();
            expect(slot.awaySource).toBeDefined();
            // No team names
            expect(['México', 'España', 'Francia'].includes(slot.homeSource)).toBe(false);
        }
    });

    it('M74 is 1E vs 3ABCDF', () => {
        const template = JSON.parse(fs.readFileSync(path.join(dataDir, 'bracket_template_2026.json'), 'utf8'));
        const m74 = template.find(s => s.matchNo === 74);
        expect(m74.homeSource).toBe('1E');
        expect(m74.awaySource).toBe('3ABCDF');
    });
});
