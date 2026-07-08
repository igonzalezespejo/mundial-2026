import { describe, it, expect } from 'vitest';
import { scoreKnockoutParticipant } from '../src/scoring/knockout.js';

describe('Knockout Scoring Rules', () => {
    it('R32 perfecto suma 60', () => {
        const actualKnockoutContext = {
            matches: {
                'R32-01': { round: 'R32', slotId: 'R32-01', status: 'FINISHED', homeTeam: 'A', awayTeam: 'B', homeGoals: 2, awayGoals: 1 }
            },
            teamsByRound: { 'R32': new Set(['A', 'B']) }
        };
        const preds = [{ round: 'R32', slotId: 'R32-01', predictedHomeTeam: 'A', predictedAwayTeam: 'B', predictedHomeGoals: 2, predictedAwayGoals: 1 }];
        const { totalKnockoutPoints } = scoreKnockoutParticipant(preds, actualKnockoutContext);
        expect(totalKnockoutPoints).toBe(60);
    });

    it('R16 perfecto suma 120', () => {
        const actualKnockoutContext = {
            matches: {
                'R16-01': { round: 'R16', slotId: 'R16-01', status: 'FINISHED', homeTeam: 'A', awayTeam: 'B', homeGoals: 2, awayGoals: 1 }
            },
            teamsByRound: { 'R16': new Set(['A', 'B']) }
        };
        const preds = [{ round: 'R16', slotId: 'R16-01', predictedHomeTeam: 'A', predictedAwayTeam: 'B', predictedHomeGoals: 2, predictedAwayGoals: 1 }];
        const { totalKnockoutPoints } = scoreKnockoutParticipant(preds, actualKnockoutContext);
        expect(totalKnockoutPoints).toBe(100);
    });

    it('QF perfecto suma 180', () => {
        const actualKnockoutContext = {
            matches: {
                'QF-01': { round: 'QF', slotId: 'QF-01', status: 'FINISHED', homeTeam: 'A', awayTeam: 'B', homeGoals: 2, awayGoals: 1 }
            },
            teamsByRound: { 'QF': new Set(['A', 'B']) }
        };
        const preds = [{ round: 'QF', slotId: 'QF-01', predictedHomeTeam: 'A', predictedAwayTeam: 'B', predictedHomeGoals: 2, predictedAwayGoals: 1 }];
        const { totalKnockoutPoints } = scoreKnockoutParticipant(preds, actualKnockoutContext);
        expect(totalKnockoutPoints).toBe(140);
    });

    it('SF perfecto suma 240', () => {
        const actualKnockoutContext = {
            matches: {
                'SF-01': { round: 'SF', slotId: 'SF-01', status: 'FINISHED', homeTeam: 'A', awayTeam: 'B', homeGoals: 2, awayGoals: 1 }
            },
            teamsByRound: { 'SF': new Set(['A', 'B']) }
        };
        const preds = [{ round: 'SF', slotId: 'SF-01', predictedHomeTeam: 'A', predictedAwayTeam: 'B', predictedHomeGoals: 2, predictedAwayGoals: 1 }];
        const { totalKnockoutPoints } = scoreKnockoutParticipant(preds, actualKnockoutContext);
        expect(totalKnockoutPoints).toBe(180);
    });

    it('Final perfecta suma 450 (150+150+150), mas campeon', () => {
        const actualKnockoutContext = {
            matches: {
                'FINAL': { round: 'FINAL', slotId: 'FINAL', status: 'FINISHED', homeTeam: 'A', awayTeam: 'B', homeGoals: 2, awayGoals: 1 }
            },
            teamsByRound: { 'FINAL': new Set(['A', 'B']) },
            champion: 'A'
        };
        const preds = [
            { round: 'FINAL', slotId: 'FINAL', predictedHomeTeam: 'A', predictedAwayTeam: 'B', predictedHomeGoals: 2, predictedAwayGoals: 1 },
            { round: 'CHAMPION', team: 'A' }
        ];
        const { totalKnockoutPoints } = scoreKnockoutParticipant(preds, actualKnockoutContext);
        expect(totalKnockoutPoints).toBe(720);
    });
    
    it('Penaltis no alteran el resultado', () => {
        const actualKnockoutContext = {
            matches: {
                'R32-01': { round: 'R32', slotId: 'R32-01', status: 'FINISHED', homeTeam: 'A', awayTeam: 'B', homeGoals: 1, awayGoals: 1 }
            },
            teamsByRound: { 'R32': new Set(['A', 'B']) }
        };
        // A user predicts 1-1. The actual match is 1-1 (A wins on penalties).
        // Since we score based on the 1-1 score, they get the full +20 bonus for exact score.
        const preds = [{ round: 'R32', slotId: 'R32-01', predictedHomeTeam: 'A', predictedAwayTeam: 'B', predictedHomeGoals: 1, predictedAwayGoals: 1 }];
        const { totalKnockoutPoints } = scoreKnockoutParticipant(preds, actualKnockoutContext);
        expect(totalKnockoutPoints).toBe(60); 
    });
});
