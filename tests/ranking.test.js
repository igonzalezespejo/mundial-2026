import { describe, it, expect } from 'vitest';
import { calculateGlobalRanking } from '../src/scoring/ranking.js';

describe('Global Ranking', () => {
    it('Sums group and knockout points correctly', () => {
        const participants = [
            { participantId: 'P1', displayName: 'Player 1' }
        ];
        
        // P1 predicts 1 correct group match exact score (3 pts)
        const groupPreds = [
            { participantId: 'P1', matchId: 'G1', predictedHomeGoals: 2, predictedAwayGoals: 1 }
        ];
        const groupResults = [
            { matchId: 'G1', status: 'FINISHED', homeGoals: 2, awayGoals: 1 }
        ];
        
        // P1 predicts R32 exact match (60 pts)
        const koPreds = [
            { participantId: 'P1', round: 'R32', slotId: 'R32-1', predictedHomeTeam: 'A', predictedAwayTeam: 'B', predictedHomeGoals: 1, predictedAwayGoals: 0 }
        ];
        const actualContext = {
            matches: {
                'R32-1': { slotId: 'R32-1', status: 'FINISHED', homeTeam: 'A', awayTeam: 'B', homeGoals: 1, awayGoals: 0 }
            },
            teamsByRound: { 'R32': new Set(['A', 'B']) }
        };
        
        const ranking = calculateGlobalRanking(participants, groupPreds, groupResults, koPreds, actualContext);
        
        expect(ranking.length).toBe(1);
        expect(ranking[0].groupPoints).toBe(15);
        expect(ranking[0].knockoutPoints).toBe(60);
        expect(ranking[0].totalPoints).toBe(75);
    });

    it('Ranking con eliminatorias pendientes solo suma grupos', () => {
        const participants = [
            { participantId: 'P1', displayName: 'Player 1' }
        ];
        
        const groupPreds = [
            { participantId: 'P1', matchId: 'G1', predictedHomeGoals: 2, predictedAwayGoals: 1 }
        ];
        const groupResults = [
            { matchId: 'G1', status: 'FINISHED', homeGoals: 2, awayGoals: 1 }
        ];
        
        const koPreds = [
            { participantId: 'P1', round: 'R32', slotId: 'R32-1', predictedHomeTeam: 'A', predictedAwayTeam: 'B', predictedHomeGoals: 1, predictedAwayGoals: 0 }
        ];
        const actualContext = {
            matches: {
                // Pending status
                'R32-1': { slotId: 'R32-1', status: 'PENDING' }
            },
            teamsByRound: {}
        };
        
        const ranking = calculateGlobalRanking(participants, groupPreds, groupResults, koPreds, actualContext);
        
        expect(ranking[0].groupPoints).toBe(15);
        expect(ranking[0].knockoutPoints).toBe(0);
        expect(ranking[0].totalPoints).toBe(15);
    });
});
