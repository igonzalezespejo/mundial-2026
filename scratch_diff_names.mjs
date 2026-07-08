import fs from 'fs';

const userList = `
1	Juan Ruiz Torres
2	La_Gran_Porra_De_Isra
3	Antequera
4	JMA
5	Francisco Carrasco
6	Javier Alcala
7	Si Se Puede!
8	Maripatri
9	AMG
10	La Italiana
11	Kamikaze
12	Pablo López Ríos
13	Er Nómina
14	Brioso
15	La Ceja de Carleto
16	Cristóbal López
17	Manucostcorron
18	Sporting La Carlota
19	estefania.becerra@iwac.com.sa
20	GUARDIOLISMO
21	Chema3D
22	Frente Perolete
23	Jugada Ganadora
24	Jordim22
25	José Manuel Álvarez de la Fuente
26	The Water MBA
27	raul pizarroso
28	PAULA
29	La mejor de electricidad
30	Luigi "EL EXTERNO"
31	SPO
32	Menuda_Porra_la_de_AHR
33	Amadeo Carboni
34	COPASO
35	SISEPUEDE2
36	Blanca
37	JOAQUIN
38	Los lunares
39	Ana
40	Jose Maria Diaz Antunez
41	Fran Delineación
42	Pablo Molina Díaz
43	BMR
44	IreBetis
45	Omar
46	PP
`;

const ranking = JSON.parse(fs.readFileSync('data/ranking.json', 'utf8'));
const actualNames = ranking.map(r => r.participantId);

const expectedNames = userList.trim().split('\n').map(l => l.split('\t')[1]?.trim()).filter(Boolean);
expectedNames[18] = 'Estefania Becerra Garcia';
expectedNames[24] = 'José Manuel Álvarez de la Fuent';

console.log("Expected length:", expectedNames.length);
console.log("Actual length:", actualNames.length);

for (const name of expectedNames) {
    if (!actualNames.includes(name) && name !== 'Maripatri') {
        console.log("MISSING:", name);
    }
}
