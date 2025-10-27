class ChartRenderer {
    constructor() {
        this.chart = null;
        this.ctx = document.getElementById('approximationChart').getContext('2d');
    }

    renderChart(data, approximationResults, functionType) {
        // Уничтожаем предыдущий график если существует
        if (this.chart) {
            this.chart.destroy();
        }

        if (!data || data.length === 0 || !approximationResults) {
            this.renderEmptyChart();
            return;
        }

        const { coefficients, formula, rSquared } = approximationResults;
        
        // Подготавливаем данные для графика
        const chartData = this.prepareChartData(data, coefficients, functionType);
        
        this.chart = new Chart(this.ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'Экспериментальные данные',
                        data: data.map(point => ({ x: point.x, y: point.y })),
                        backgroundColor: 'rgba(54, 162, 235, 0.8)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        showLine: false
                    },
                    {
                        label: `Аппроксимация: ${formula}`,
                        data: chartData.regressionPoints,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 2,
                        pointRadius: 0,
                        showLine: true,
                        fill: false,
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Аппроксимация функции (R² = ${rSquared.toFixed(4)})`,
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += `(${context.parsed.x.toFixed(2)}, ${context.parsed.y.toFixed(2)})`;
                                return label;
                            }
                        }
                    },
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'X',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Y',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    prepareChartData(data, coefficients, functionType) {
        if (!data.length || !coefficients.length) {
            return { regressionPoints: [] };
        }

        // Находим минимальное и максимальное X
        const xValues = data.map(point => point.x);
        const minX = Math.min(...xValues);
        const maxX = Math.max(...xValues);
        
        // Добавляем отступы для лучшего отображения графика
        const padding = (maxX - minX) * 0.1;
        const startX = minX - padding;
        const endX = maxX + padding;
        
        // Создаем точки для гладкой кривой
        const step = (endX - startX) / 100;
        const regressionPoints = [];
        
        const mathProcessor = new MathProcessor();
        mathProcessor.coefficients = coefficients;

        for (let x = startX; x <= endX; x += step) {
            let y;
            
            switch (functionType) {
                case 'linear':
                    y = coefficients[0] * x + coefficients[1];
                    break;
                case 'quadratic':
                    y = coefficients[0] * x * x + coefficients[1] * x + coefficients[2];
                    break;
                case 'cubic':
                    y = coefficients[0] * x * x * x + coefficients[1] * x * x + coefficients[2] * x + coefficients[3];
                    break;
                case 'exponential':
                    y = coefficients[0] * Math.exp(coefficients[1] * x);
                    break;
                default:
                    y = 0;
            }
            
            // Проверяем на конечные значения
            if (isFinite(y)) {
                regressionPoints.push({ x: x, y: y });
            }
        }

        return { regressionPoints };
    }

    renderEmptyChart() {
        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(this.ctx, {
            type: 'scatter',
            data: {
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'График аппроксимации',
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'X'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Y'
                        }
                    }
                }
            }
        });
    }

    updateChart(data, approximationResults, functionType) {
        this.renderChart(data, approximationResults, functionType);
    }

    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}
