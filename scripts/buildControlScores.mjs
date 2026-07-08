import fs from 'fs';

const rawTable = `Participante|Campeón|Grupos|R32|R16|QF|SF|THIRD_PLACE|FINAL|CHAMPION|TOTAL
Juan Ruiz Torres|España|425|500|80|0|0|0|0|0|1005
La_Gran_Porra_De_Isra|Francia|375|470|80|0|0|0|0|0|925
Antequera|España|325|500|80|0|0|0|0|0|905
JMA|España|385|440|80|0|0|0|0|0|905
Francisco Carrasco|Brasil|310|510|80|0|0|0|0|0|900
Javier Alcala|España|290|490|120|0|0|0|0|0|900
Si Se Puede!|España|330|450|120|0|0|0|0|0|900
Maripatri|España|250|530|120|0|0|0|0|0|900
AMG|España|300|500|80|0|0|0|0|0|880
La Italiana|Portugal|330|430|120|0|0|0|0|0|880
Kamikaze|España|325|470|80|0|0|0|0|0|875
Pablo López Ríos|España|305|490|80|0|0|0|0|0|875
Er Nómina|Portugal|320|470|80|0|0|0|0|0|870
Brioso|España|300|490|80|0|0|0|0|0|870
La Ceja de Carleto|España|280|510|80|0|0|0|0|0|870
Cristóbal López|España|355|470|40|0|0|0|0|0|865
Manucostcorron|Brasil|355|470|40|0|0|0|0|0|865
Sporting La Carlota|Brasil|360|420|80|0|0|0|0|0|860
Estefania Becerra Garcia|Portugal|330|470|40|0|0|0|0|0|840
GUARDIOLISMO|Francia|375|420|40|0|0|0|0|0|835
Chema3D|España|305|400|120|0|0|0|0|0|825
Frente Perolete|Portugal|340|400|80|0|0|0|0|0|820
Jugada Ganadora|España|330|410|80|0|0|0|0|0|820
Jordim22|España|355|420|40|0|0|0|0|0|815
José Manuel Álvarez de la Fuente|Portugal|295|440|80|0|0|0|0|0|815
The Water MBA|España|295|440|80|0|0|0|0|0|815
raul pizarroso|España|330|440|40|0|0|0|0|0|810
PAULA|Francia|280|440|80|0|0|0|0|0|800
La mejor de electricidad|Portugal|315|400|80|0|0|0|0|0|795
Luigi "EL EXTERNO"|Portugal|260|450|80|0|0|0|0|0|790
SPO|España|260|450|80|0|0|0|0|0|790
Menuda_Porra_la_de_AHR|Portugal|320|410|40|0|0|0|0|0|770
Amadeo Carboni|España|310|410|40|0|0|0|0|0|760
COPASO|Francia|300|420|40|0|0|0|0|0|760
SISEPUEDE2|Francia|280|380|80|0|0|0|0|0|740
Blanca|España|265|390|80|0|0|0|0|0|735
JOAQUIN|Francia|305|380|40|0|0|0|0|0|725
Los lunares|Argentina|305|380|40|0|0|0|0|0|725
Ana|España|240|400|80|0|0|0|0|0|720
Jose Maria Diaz Antunez|España|240|430|40|0|0|0|0|0|710
Fran Delineación|España|240|420|40|0|0|0|0|0|700
Pablo Molina Díaz|España|285|370|40|0|0|0|0|0|695
BMR|España|250|400|40|0|0|0|0|0|690
IreBetis|España|250|380|40|0|0|0|0|0|670
Omar|Francia|260|370|40|0|0|0|0|0|670
PP|España|240|350|80|0|0|0|0|0|670`;

const lines = rawTable.trim().split('\n');
const headers = lines[0].split('|');
const data = lines.slice(1).map(line => {
    const parts = line.split('|');
    return {
        participantId: parts[0],
        displayName: parts[0],
        champion: parts[1],
        expected: {
            groupPoints: parseInt(parts[2], 10),
            R32: parseInt(parts[3], 10),
            R16: parseInt(parts[4], 10),
            QF: parseInt(parts[5], 10),
            SF: parseInt(parts[6], 10),
            THIRD_PLACE: parseInt(parts[7], 10),
            FINAL: parseInt(parts[8], 10),
            CHAMPION: parseInt(parts[9], 10),
            totalPoints: parseInt(parts[10], 10)
        }
    };
});

fs.writeFileSync('data/control_scores_valid.json', JSON.stringify(data, null, 2));
console.log('Generated control_scores_valid.json with ' + data.length + ' participants');
