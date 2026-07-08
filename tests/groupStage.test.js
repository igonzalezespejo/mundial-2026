import { describe, it, expect } from 'vitest';
import { scoreGroupMatch, getSign } from '../src/scoring/groupStage.js';

describe('Group Stage Scoring', () => {
  it('getSign works correctly', () => {
    expect(getSign(2, 1)).toBe('HOME');
    expect(getSign(1, 2)).toBe('AWAY');
    expect(getSign(1, 1)).toBe('DRAW');
    expect(getSign(0, 0)).toBe('DRAW');
  });

  describe('scoreGroupMatch', () => {
    it('Real 2-1 / apuesta 2-1 -> 15 (Exact no empate)', () => {
      const pred = { predictedHomeGoals: 2, predictedAwayGoals: 1 };
      const res = { homeGoals: 2, awayGoals: 1 };
      const score = scoreGroupMatch(pred, res);
      expect(score.points).toBe(15);
      expect(score.status).toBe('SCORED');
    });

    it('Real 1-1 / apuesta 1-1 -> 20 (Exact empate)', () => {
      const pred = { predictedHomeGoals: 1, predictedAwayGoals: 1 };
      const res = { homeGoals: 1, awayGoals: 1 };
      const score = scoreGroupMatch(pred, res);
      expect(score.points).toBe(20);
    });

    it('Real 2-1 / apuesta 3-0 -> 5 (Signo ganador no exacto)', () => {
      const pred = { predictedHomeGoals: 3, predictedAwayGoals: 0 };
      const res = { homeGoals: 2, awayGoals: 1 };
      const score = scoreGroupMatch(pred, res);
      expect(score.points).toBe(5);
    });

    it('Real 1-1 / apuesta 2-2 -> 10 (Empate no exacto)', () => {
      const pred = { predictedHomeGoals: 2, predictedAwayGoals: 2 };
      const res = { homeGoals: 1, awayGoals: 1 };
      const score = scoreGroupMatch(pred, res);
      expect(score.points).toBe(10);
    });

    it('Real 2-1 / apuesta 1-2 -> 0 (Fallo absoluto)', () => {
      const pred = { predictedHomeGoals: 1, predictedAwayGoals: 2 };
      const res = { homeGoals: 2, awayGoals: 1 };
      const score = scoreGroupMatch(pred, res);
      expect(score.points).toBe(0);
    });

    it('Resultado pendiente -> 0 puntos, status PENDING', () => {
      const pred = { predictedHomeGoals: 1, predictedAwayGoals: 2 };
      const res = { homeGoals: null, awayGoals: null };
      const score = scoreGroupMatch(pred, res);
      expect(score.points).toBe(0);
      expect(score.status).toBe('PENDING');
    });

    it('Apuesta vacía -> 0 puntos, status WARNING', () => {
      const pred = { predictedHomeGoals: null, predictedAwayGoals: null };
      const res = { homeGoals: 2, awayGoals: 1 };
      const score = scoreGroupMatch(pred, res);
      expect(score.points).toBe(0);
      expect(score.status).toBe('WARNING');
    });
  });
});
