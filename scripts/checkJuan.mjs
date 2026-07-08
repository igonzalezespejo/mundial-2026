import fs from 'fs';
import { scoreKnockoutParticipant } from './src/scoring/knockout.js';

const preds = JSON.parse(fs.readFileSync('data/knockout_predictions.json', 'utf8'));
const juanPreds = preds.filter(p => p.participantId === 'Juan Ruiz Torres');

const actuals = JSON.parse(fs.readFileSync('data/actual_knockout_bracket.json', 'utf8'));

const res = scoreKnockoutParticipant(juanPreds, actuals);
console.log(JSON.stringify(res.matchPoints, null, 2));
