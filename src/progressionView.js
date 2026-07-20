import { appData } from './dataLoader.js';

let chartInstance = null;

// Ajusta la altura del contenedor al espacio visible restante de la ventana,
// para que la gráfica entera quepa en pantalla sin necesidad de hacer scroll.
function fitContainerToViewport(container) {
    const rect = container.getBoundingClientRect();
    const bottomMargin = 24; // aire debajo de la gráfica
    const availableHeight = window.innerHeight - rect.top - bottomMargin;
    container.style.height = `${Math.max(320, availableHeight)}px`;
}

export function initProgressionView() {
    const container = document.getElementById('echarts-container');
    if (!container) return;

    const participants = appData.ranking || [];
    fitContainerToViewport(container);

    if (chartInstance) {
        chartInstance.dispose();
    }

    // Iniciar con tema por defecto (nulo) para que tome nuestros colores personalizados
    chartInstance = echarts.init(container, null, { renderer: 'canvas' });

    // Tamaño de fuente de las etiquetas finales según el espacio vertical disponible,
    // para que quepan tantos nombres como sea posible sin forzar la altura del gráfico.
    const endLabelFontSize = Math.max(9, Math.min(14, Math.floor(container.clientHeight / Math.max(participants.length, 1)) - 2));

    // 1. Recopilar y ordenar TODOS los partidos jugados o por jugar
    const playedMatches = [];
    
    // Partidos de grupos
    if (appData.matches) {
        appData.matches.forEach(m => {
            playedMatches.push({
                id: m.matchId,
                name: `M${m.matchNo} (${m.homeTeam} - ${m.awayTeam})`,
                matchNo: m.matchNo,
                type: 'GROUP',
                round: 'GROUP'
            });
        });
    }

    // Eliminatorias
    if (appData.actual_knockout_bracket && appData.actual_knockout_bracket.matches) {
        appData.actual_knockout_bracket.matches.forEach(m => {
            const hTeam = m.homeTeam || 'TBD';
            const aTeam = m.awayTeam || 'TBD';
            playedMatches.push({
                id: m.slotId, // En el ranking, los puntos eliminatoria se guardan con slotId
                name: `${m.round} (${hTeam} - ${aTeam})`,
                matchNo: m.matchNo,
                type: 'KNOCKOUT',
                round: m.round
            });
        });
    }

    if (appData.actual_knockout_bracket && appData.actual_knockout_bracket.champion) {
        playedMatches.push({
            id: 'CHAMPION',
            name: `Campeón (${appData.actual_knockout_bracket.champion})`,
            matchNo: 999, // Siempre al final
            type: 'KNOCKOUT',
            round: 'CHAMPION'
        });
    }

    // Dividir en 6 bloques para el eje X
    const blockMatches = [[], [], [], [], [], []];
    playedMatches.sort((a, b) => a.matchNo - b.matchNo);

    playedMatches.forEach(m => {
        if (m.type === 'GROUP') blockMatches[0].push(m);
        else if (m.round === 'R32') blockMatches[1].push(m);
        else if (m.round === 'R16') blockMatches[2].push(m);
        else if (m.round === 'QF') blockMatches[3].push(m);
        else if (m.round === 'CHAMPION') blockMatches[5].push(m);
        else blockMatches[4].push(m);
    });

    // Calcular coordenada X (0 a 500, bloques de 100 de ancho)
    blockMatches.forEach((block, bIndex) => {
        const n = block.length;
        if (n === 0) return;
        block.forEach((m, i) => {
            m.x = (bIndex * 100) + (100 * (i + 1) / n);
        });
    });

    // Ordenar por x
    playedMatches.sort((a, b) => a.x - b.x);

    // 3. Preparar las series para cada participante
    const series = [];

    participants.forEach((p, index) => {
        let currentPoints = 0;
        const dataPoints = [{ value: [0, 0], name: 'Inicio' }]; // Puntos al inicio

        // Calcular color del degradado: Paleta Turbo
        const maxIndex = Math.max(1, participants.length - 1);
        const t = index / maxIndex;
        const palette = ['#7A0403', '#D23105', '#FB8022', '#EDD03A', '#A3FD3D', '#31F199', '#29BBEC', '#466BE3', '#30123B'];
        const pos = t * (palette.length - 1);
        const i1 = Math.floor(pos);
        const i2 = Math.min(Math.ceil(pos), palette.length - 1);
        const fraction = pos - i1;
        
        const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
        };
        const c1 = hexToRgb(palette[i1]);
        const c2 = hexToRgb(palette[i2]);
        const r = Math.round(c1[0] + fraction * (c2[0] - c1[0]));
        const g = Math.round(c1[1] + fraction * (c2[1] - c1[1]));
        const b = Math.round(c1[2] + fraction * (c2[2] - c1[2]));
        const lineColor = `rgb(${r}, ${g}, ${b})`;

        // Calcular grosor de línea: Desde 4.5px (el primero) hasta 1px (el último)
        const lineWidth = 1 + (1 - t) * 3.5;

        playedMatches.forEach(m => {
            let pts = 0;
            if (m.type === 'GROUP') {
                pts = (p.groupMatchPoints && p.groupMatchPoints[m.id]) || 0;
            } else if (m.type === 'KNOCKOUT') {
                pts = (p.knockoutMatchPoints && p.knockoutMatchPoints[m.id]) || 0;
            }
            currentPoints += pts;
            dataPoints.push({
                value: [m.x, currentPoints],
                name: m.name
            });
        });

        series.push({
            name: p.displayName,
            type: 'line',
            data: dataPoints,
            smooth: true,
            itemStyle: {
                color: lineColor
            },
            symbol: 'circle',
            symbolSize: 4,
            showSymbol: false,
            emphasis: {
                focus: 'series',
                blurScope: 'coordinateSystem',
                lineStyle: {
                    width: 4,
                    shadowBlur: 10,
                    shadowColor: 'rgba(0,0,0,0.5)'
                }
            },
            endLabel: {
                show: true,
                formatter: '{a}',
                distance: 10,
                fontSize: endLabelFontSize,
                fontFamily: 'Noto Sans',
                color: '#020F2A', // Color principal de texto
                textBorderWidth: 0,
                textBorderColor: 'transparent',
                textShadowBlur: 0,
                textShadowColor: 'transparent'
            },
            labelLayout: {
                moveOverlap: 'shiftY',
                hideOverlap: true
            },
            lineStyle: {
                width: lineWidth,
                opacity: 0.85
            }
        });
    });

    // 4. Configurar ECharts
    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'item',
            formatter: function (params) {
                return `<strong>${params.seriesName}</strong><br/>
                        Partido: ${params.data.name}<br/>
                        Puntos Acumulados: ${params.value[1]}`;
            }
        },
        grid: {
            left: '3%',
            right: '20%', // Aumentado para dar más espacio a los nombres
            bottom: '5%',
            top: '5%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            min: 0,
            max: 600,
            interval: 100,
            axisLabel: {
                formatter: function (value) {
                    if (value === 0) return 'Inicio';
                    if (value === 100) return 'Grupos';
                    if (value === 200) return '16avos';
                    if (value === 300) return '8avos';
                    if (value === 400) return '4tos';
                    if (value === 500) return 'Finales';
                    if (value === 600) return 'Campeón';
                    return '';
                },
                color: '#64748b',
                fontFamily: 'Noto Sans'
            },
            axisLine: {
                show: true,
                lineStyle: {
                    color: '#cbd5e1'
                }
            },
            axisTick: {
                show: true
            },
            splitLine: {
                show: true,
                lineStyle: {
                    type: 'dashed',
                    color: '#e2e8f0'
                }
            }
        },
        yAxis: {
            type: 'value',
            splitLine: {
                lineStyle: {
                    color: '#e2e8f0'
                }
            },
            axisLabel: {
                color: '#64748b',
                fontFamily: 'Noto Sans'
            }
        },
        series: series
    };

    chartInstance.setOption(option);

    // Ajustar si cambia el tamaño de la ventana
    window.addEventListener('resize', () => {
        if (chartInstance) {
            fitContainerToViewport(container);
            chartInstance.resize();
        }
    });
}
