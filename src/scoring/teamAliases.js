export function normalizeTeamName(name) {
    if (!name) return name;
    const n = name.trim();
    const aliases = {
        "Bosnia y Herz.": "Bosnia y Herzegovina",
        "Bosnia y Herzegovina": "Bosnia y Herzegovina",
        "DR Congo": "RD Congo",
        "R.D. Congo": "RD Congo",
        "RD Congo": "RD Congo",
        "Ivory Coast": "Costa de Marfil",
        "Costa de Marfil": "Costa de Marfil",
        "Netherlands": "Países Bajos",
        "Países Bajos": "Países Bajos"
    };
    return aliases[n] || n;
}
