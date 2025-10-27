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
            
            this.showResults(results);
            this.drawChart(data, results, functionType);
            
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    }

    showResults(results) {
        const container = document.getElementById('resultsContainer');
        
        container.innerHTML = `
            <div class="result-item">
                <h4>Функция:</h4>
                <div>${results.formula}</div>
            </div>
            <div class="result-item">
                <h4>Коэффициенты:</h4>
                ${results.coefficients.map((coef, i) => 
                    `<div>a${i} = ${coef.toFixed(4)}</div>`
                ).join('')}
            </div>
            <div class="result-item">
                <h4>Точность R²:</h4>
                <div>${results.rSquared.toFixed(4)}</div>
            </div>
        `;
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
                        backgroundColor: 'blue'
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
    
    const padding = (maxX - minX) * 0.1;
    const startX = minX - padding;
    const endX = maxX + padding;

    for (let x = startX; x <= endX; x += (endX - startX) / 50) {
        let y;
        
        if (functionType === 'linear') {
            // y = ax + b
            y = coefficients[0] * x + coefficients[1];
        } else if (functionType === 'quadratic') {
            // y = ax² + bx + c  
            y = coefficients[0] * x * x + coefficients[1] * x + coefficients[2];
        } else if (functionType === 'cubic') {
            // y = ax³ + bx² + cx + d
            y = coefficients[0] * x * x * x + coefficients[1] * x * x + coefficients[2] * x + coefficients[3];
        } else if (functionType === 'exponential') {
            // y = aeᵇˣ
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
        this.chart = new Chart(ctx, {
            type: 'scatter',
            data: { datasets: [] }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new ApproximationApp();
});
