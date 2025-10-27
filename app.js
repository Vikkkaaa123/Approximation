class ApproximationApp {
    constructor() {
        this.dataManager = new DataManager();
        this.mathProcessor = new MathProcessor();
        this.chart = null;
        
        this.setupEvents();
        this.init();
    }

    setupEvents() {
        document.getElementById('calculateBtn').addEventListener('click', () => this.calculate());
        document.getElementById('addRowBtn').addEventListener('click', () => this.dataManager.addRow());
        document.getElementById('clearDataBtn').addEventListener('click', () => this.dataManager.clearData());
    }

    init() {
        for (let i = 0; i < 3; i++) {
            this.dataManager.addRow();
        }
        this.createEmptyChart();
    }

    calculate() {
        if (!this.dataManager.isValid()) {
            alert('Нужно минимум 2 точки с числами!');
            return;
        }

        const data = this.dataManager.getData();
        const functionType = document.getElementById('functionType').value;

        try {
            const results = this.mathProcessor.approximate(data, functionType);
            this.showReport(data, results, functionType);
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    }

    showReport(data, results, functionType) {
        const container = document.getElementById('reportContainer');
        
        this.drawChart(data, results, functionType);
        
        const quality = results.rSquared >= 0.9 ? 'отличная' : 
                       results.rSquared >= 0.7 ? 'хорошая' : 
                       results.rSquared >= 0.5 ? 'удовлетворительная' : 'низкая';
        
        container.innerHTML = `
            <div class="report-content">
                <h3>Отчет по аппроксимации</h3>
                <div class="report-section">
                    <h4>Результаты расчета</h4>
                    <p><strong>Тип функции:</strong> ${this.getFunctionName(functionType)}</p>
                    <p><strong>Аппроксимирующая функция:</strong> ${results.formula}</p>
                    <p><strong>Коэффициенты:</strong> ${results.coefficients.map((c,i) => `a${i} = ${c.toFixed(6)}`).join(', ')}</p>
                    <p><strong>Точность аппроксимации R²:</strong> ${results.rSquared.toFixed(6)} (${quality})</p>
                    <p><strong>Количество точек данных:</strong> ${data.length}</p>
                </div>
            </div>
        `;
    }

    getFunctionName(type) {
        const names = {
            'linear': 'Линейная',
            'quadratic': 'Квадратичная',
            'cubic': 'Кубическая',
            'exponential': 'Экспоненциальная'
        };
        return names[type] || type;
    }

    drawChart(data, results, functionType) {
        const ctx = document.getElementById('approximationChart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'Экспериментальные данные',
                        data: data,
                        backgroundColor: 'blue',
                        pointRadius: 6
                    },
                    {
                        label: 'Аппроксимация',
                        data: this.generateCurvePoints(data, results.coefficients, functionType),
                        borderColor: 'red',
                        showLine: true,
                        pointRadius: 0,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `График аппроксимации (R² = ${results.rSquared.toFixed(4)})`
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

    generateCurvePoints(data, coefficients, functionType) {
        const points = [];
        const xs = data.map(p => p.x);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        
        const padding = (maxX - minX) * 0.1;
        const startX = minX - padding;
        const endX = maxX + padding;

        for (let x = startX; x <= endX; x += (endX - startX) / 50) {
            let y;
            
            if (functionType === 'linear') {
                y = coefficients[0] * x + coefficients[1];
            } else if (functionType === 'quadratic') {
                y = coefficients[0] * x * x + coefficients[1] * x + coefficients[2];
            } else if (functionType === 'cubic') {
                y = coefficients[0] * x * x * x + coefficients[1] * x * x + coefficients[2] * x + coefficients[3];
            } else if (functionType === 'exponential') {
                y = coefficients[0] * Math.exp(coefficients[1] * x);
            }
            
            if (!isNaN(y) && isFinite(y)) {
                points.push({x: x, y: y});
            }
        }
        
        return points;
    }

    createEmptyChart() {
        const ctx = document.getElementById('approximationChart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
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
                        text: 'График аппроксимации'
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
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new ApproximationApp();
});
