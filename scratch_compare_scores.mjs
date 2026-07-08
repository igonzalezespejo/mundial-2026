import fs from 'fs';

const userList = `
1	Juan Ruiz Torres	España	425	500
2	La_Gran_Porra_De_Isra	Francia	375	470
3	Antequera	España	325	500
4	JMA	España	385	440
5	Francisco Carrasco	Brasil	310	510
6	Javier Alcala	España	290	490
7	Si Se Puede!	España	330	450
8	Maripatri	España	250	530
9	AMG	España	300	500
10	La Italiana	Portugal	330	430
11	Kamikaze	España	325	470
12	Pablo López Ríos	España	305	490
13	Er Nómina	Portugal	320	470
14	Brioso	España	300	490
15	La Ceja de Carleto	España	280	510
16	Cristóbal López	España	355	470
17	Manucostcorron	Brasil	355	470
18	Sporting La Carlota	Brasil	360	420
19	estefania.becerra@iwac.com.sa	Portugal	330	470
20	GUARDIOLISMO	Francia	375	420
21	Chema3D	España	305	400
22	Frente Perolete	Portugal	340	400
23	Jugada Ganadora	España	330	410
24	Jordim22	España	355	420
25	José Manuel Álvarez de la Fuente	Portugal	295	440
26	The Water MBA	España	295	440
27	raul pizarroso	España	330	440
28	PAULA	Francia	280	440
29	La mejor de electricidad	Portugal	315	400
30	Luigi "EL EXTERNO"	Portugal	260	450
31	SPO	España	260	450
32	Menuda_Porra_la_de_AHR	Portugal	320	410
33	Amadeo Carboni	España	310	410
34	COPASO	Francia	300	420
35	SISEPUEDE2	Francia	280	380
36	Blanca	España	265	390
37	JOAQUIN	Francia	305	380
38	Los lunares	Argentina	305	380
39	Ana	España	240	400
40	Jose Maria Diaz Antunez	España	240	430
41	Fran Delineación	España	240	420
42	Pablo Molina Díaz	España	285	370
43	BMR	España	250	400
44	IreBetis	España	250	380
45	Omar	Francia	260	370
46	PP	España	240	350
`;

const ranking = JSON.parse(fs.readFileSync('data/ranking.json', 'utf8'));

const lines = userList.trim().split('\n');
const expected = {};
for (const line of lines) {
    if (!line.trim() || line.startsWith('Pos')) continue;
    
    // In some cases, email is split onto a new line, let's just match using regex or tabs
    const parts = line.split('\t');
    if (parts.length >= 5) {
        let name = parts[1].trim();
        const expectedGroup = parseInt(parts[3].trim());
        const expectedR32 = parseInt(parts[4].trim());
        expected[name] = { group: expectedGroup, r32: expectedR32 };
    }
}

expected['estefania.becerra@iwac.com.sa'] = { group: 330, r32: 470 };

const discrepancies = [];

for (const [name, exp] of Object.entries(expected)) {
    // Find in ranking
    const entry = ranking.find(r => r.participantId === name || r.displayName === name);
    if (!entry) {
        discrepancies.push({ name, error: 'Not found in ranking.json' });
        continue;
    }
    
    const actualGroup = entry.groupPoints;
    const actualR32 = entry.roundPoints['R32'] || 0;
    
    if (actualGroup !== exp.group || actualR32 !== exp.r32) {
        discrepancies.push({
            name,
            expected: exp,
            actual: { group: actualGroup, r32: actualR32 }
        });
    }
}

console.log("Total discrepancies found:", discrepancies.length);
if (discrepancies.length > 0) {
    console.log(JSON.stringify(discrepancies, null, 2));
}
