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
        
        const quality = results.rSquared >= 0.9 ? 'отличная' : 
                       results.rSquared >= 0.7 ? 'хорошая' : 
                       results.rSquared >= 0.5 ? 'удовлетворительная' : 'низкая';
        
        container.innerHTML = `
            <div class="chart-container">
                <canvas id="approximationChart"></canvas>
            </div>
            <div class="report-content">
                <h3>Отчет по аппроксимации</h3>
                <p><strong>Тип функции:</strong> ${this.getFunctionName(functionType)}</p>
                <p><strong>Формула:</strong> ${results.formula}</p>
                <p><strong>Коэффициенты:</strong> ${results.coefficients.map((c,i) => `a${i} = ${c.toFixed(6)}`).join(', ')}</p>
                <p><strong>Точность R²:</strong> ${results.rSquared.toFixed(6)} (${quality})</p>
                <p><strong>Точек данных:</strong> ${data.length}</p>
            </div>
        `;

        this.drawChart(data, results, functionType);
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
                        label: 'Данные',
                        data: data,
                        backgroundColor: 'rgba(0, 0, 255, 0.3)',
                        borderColor: 'blue',
                        pointRadius: 2,
                        pointBorderWidth: 1
                    },
                    {
                        label: 'Аппроксимация',
                        data: this.generateCurvePoints(data, results.coefficients, functionType),
                        borderColor: 'red',
                        showLine: true,
                        pointRadius: 0
                    }
                ]
            }
        });
    }

        generateCurvePoints(data, coefficients, functionType) {
        const points = [];
        const xs = data.map(p => p.x);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        
        if (minX === maxX) {
            const centerX = minX;
            for (let x = centerX - 2; x <= centerX + 2; x += 0.1) {
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
        } else {
            const padding = (maxX - minX) * 0.1;
            const startX = minX - padding;
            const endX = maxX + padding;
            const step = Math.max((endX - startX) / 50, 0.1);

            for (let x = startX; x <= endX; x += step) {
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
        }
        
        return points;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new ApproximationApp();
});
