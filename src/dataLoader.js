const DATA_BASE = './data/';

const REQUIRED_FILES = [
    'ranking.json',
    'participants.json',
    'matches.json',
    'results.json',
    'predictions.json',
    'knockout_predictions.json',
    'bracket_template_2026.json',
    'group_standings_predictions.json',
    'actual_knockout_bracket.json',
    'knockout_scoring_validation.json'
];

export const appData = {};

export async function loadAllData(onProgress) {
    try {
        const fetchPromises = REQUIRED_FILES.map(async (filename) => {
            const res = await fetch(`${DATA_BASE}${filename}`);
            if (!res.ok) {
                throw new Error(`Error loading ${filename}: ${res.status}`);
            }
            const data = await res.json();
            const key = filename.split('.')[0]; // e.g. ranking
            appData[key] = data;
            if (onProgress) onProgress(filename);
            return data;
        });

        await Promise.all(fetchPromises);
        return true;
    } catch (error) {
        console.error("DataLoader Error:", error);
        return false;
    }
}
