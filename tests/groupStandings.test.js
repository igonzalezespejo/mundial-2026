import { describe, it, expect } from 'vitest';
import { computeGroupStandings } from '../src/scoring/groupStandings.js';

describe('Group Standings', () => {
    it('Computes standings correctly and resolves ties', () => {
        const groupMatches = [
            { matchId: 'GROUP-001', homeTeam: 'A', awayTeam: 'B', group: 'A' },
            { matchId: 'GROUP-002', homeTeam: 'C', awayTeam: 'D', group: 'A' },
            { matchId: 'GROUP-003', homeTeam: 'A', awayTeam: 'C', group: 'A' },
            { matchId: 'GROUP-004', homeTeam: 'B', awayTeam: 'D', group: 'A' },
            { matchId: 'GROUP-005', homeTeam: 'A', awayTeam: 'D', group: 'A' },
            { matchId: 'GROUP-006', homeTeam: 'B', awayTeam: 'C', group: 'A' },
            // Add a padding to 72 matches to avoid out of bounds in test
            ...Array.from({length: 66}).map((_, i) => ({ matchId: `GROUP-${String(i+7).padStart(3,'0')}`, homeTeam: 'X', awayTeam: 'Y', group: 'X'}))
        ];

        const preds = [
            { matchId: 'GROUP-001', predictedHomeGoals: 2, predictedAwayGoals: 1 }, // A wins 2-1
            { matchId: 'GROUP-002', predictedHomeGoals: 1, predictedAwayGoals: 1 }, // C and D draw 1-1
            { matchId: 'GROUP-003', predictedHomeGoals: 0, predictedAwayGoals: 0 }, // A and C draw 0-0
            { matchId: 'GROUP-004', predictedHomeGoals: 0, predictedAwayGoals: 2 }, // D wins 2-0 vs B
            { matchId: 'GROUP-005', predictedHomeGoals: 1, predictedAwayGoals: 0 }, // A wins 1-0 vs D
            { matchId: 'GROUP-006', predictedHomeGoals: 0, predictedAwayGoals: 1 }  // C wins 1-0 vs B
        ];
        
        // A: 7 pts, GF 3, GA 1, GD 2
        // C: 5 pts, GF 2, GA 1, GD 1
        // D: 4 pts, GF 3, GA 2, GD 1
        // B: 0 pts, GF 1, GA 5, GD -4
        
        const standings = computeGroupStandings(preds, groupMatches, null, null);
        const groupA = standings.filter(s => s.group === 'A');
        expect(groupA.length).toBe(4);
        
        expect(groupA[0].team).toBe('A');
        expect(groupA[0].position).toBe('1A');
        expect(groupA[1].team).toBe('C');
        expect(groupA[1].position).toBe('2A');
        expect(groupA[2].team).toBe('D');
        expect(groupA[2].position).toBe('3A');
        expect(groupA[3].team).toBe('B');
        expect(groupA[3].position).toBe('4A');
    });

    it('Uses knockout extraction as fallback for ties', () => {
        const groupMatches = [
            { matchId: 'GROUP-001', homeTeam: 'A', awayTeam: 'B', group: 'A' },
            { matchId: 'GROUP-002', homeTeam: 'C', awayTeam: 'D', group: 'A' },
            { matchId: 'GROUP-003', homeTeam: 'A', awayTeam: 'C', group: 'A' },
            { matchId: 'GROUP-004', homeTeam: 'B', awayTeam: 'D', group: 'A' },
            { matchId: 'GROUP-005', homeTeam: 'A', awayTeam: 'D', group: 'A' },
            { matchId: 'GROUP-006', homeTeam: 'B', awayTeam: 'C', group: 'A' },
            ...Array.from({length: 66}).map((_, i) => ({ matchId: `GROUP-${String(i+7).padStart(3,'0')}`, homeTeam: 'X', awayTeam: 'Y', group: 'X'}))
        ];

        // Everyone draws 0-0!
        const preds = [
            { matchId: 'GROUP-001', predictedHomeGoals: 0, predictedAwayGoals: 0 },
            { matchId: 'GROUP-002', predictedHomeGoals: 0, predictedAwayGoals: 0 },
            { matchId: 'GROUP-003', predictedHomeGoals: 0, predictedAwayGoals: 0 },
            { matchId: 'GROUP-004', predictedHomeGoals: 0, predictedAwayGoals: 0 },
            { matchId: 'GROUP-005', predictedHomeGoals: 0, predictedAwayGoals: 0 },
            { matchId: 'GROUP-006', predictedHomeGoals: 0, predictedAwayGoals: 0 }
        ];
        
        // Let's say participant put B in 1A and D in 2A
        const bracketTemplate = [
            { slotId: 'R32-01', homeSource: '1A', awaySource: '2B' },
            { slotId: 'R32-02', homeSource: '2A', awaySource: '2C' }
        ];
        const koPreds = [
            { round: 'R32', slotId: 'R32-01', predictedHomeTeam: 'B' },
            { round: 'R32', slotId: 'R32-02', predictedHomeTeam: 'D' }
        ];
        
        const standings = computeGroupStandings(preds, groupMatches, koPreds, bracketTemplate);
        const groupA = standings.filter(s => s.group === 'A');
        
        expect(groupA[0].team).toBe('B');
        expect(groupA[0].tieBreakSource).toBe('extracted_knockout_slot');
        expect(groupA[1].team).toBe('D');
        expect(groupA[1].tieBreakSource).toBe('extracted_knockout_slot');
    });
});
