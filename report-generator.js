class ReportGenerator {
    constructor() {
        this.reportContainer = document.getElementById('reportContainer');
    }

    generateReport(data, approximationResults, functionType) {
        if (!data || !approximationResults) {
            this.showNoResults();
            return;
        }

        const { coefficients, formula, rSquared } = approximationResults;
        
        const reportHTML = `
            <div class="report-content">
                <div class="report-header">
                    <h3>Отчет по аппроксимации</h3>
                    <div class="report-meta">
                        <span>Тип функции: ${this.getFunctionTypeName(functionType)}</span>
                        <span>Количество точек: ${data.length}</span>
                        <span>Время генерации: ${new Date().toLocaleString()}</span>
                    </div>
                </div>

                <div class="report-section">
                    <h4>Результаты аппроксимации</h4>
                    <div class="result-item">
                        <strong>Аппроксимирующая функция:</strong>
                        <div class="formula-display">${formula}</div>
                    </div>
                    
                    <div class="result-item">
                        <strong>Коэффициенты функции:</strong>
                        <div class="coefficients-display">
                            ${this.formatCoefficients(coefficients, functionType)}
                        </div>
                    </div>
                </div>

                <div class="report-section">
                    <h4>Метрики точности</h4>
                    <div class="metrics-grid">
                        <div class="metric-item">
                            <span class="metric-label">Коэффициент детерминации R²:</span>
                            <span class="metric-value">${rSquared.toFixed(6)}</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Качество аппроксимации:</span>
                            <span class="metric-value ${this.getQualityClass(rSquared)}">
                                ${this.getQualityDescription(rSquared)}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="report-section">
                    <h4>Статистика данных</h4>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span>Минимальное X:</span>
                            <strong>${Math.min(...data.map(p => p.x)).toFixed(4)}</strong>
                        </div>
                        <div class="stat-item">
                            <span>Максимальное X:</span>
                            <strong>${Math.max(...data.map(p => p.x)).toFixed(4)}</strong>
                        </div>
                        <div class="stat-item">
                            <span>Минимальное Y:</span>
                            <strong>${Math.min(...data.map(p => p.y)).toFixed(4)}</strong>
                        </div>
                        <div class="stat-item">
                            <span>Максимальное Y:</span>
                            <strong>${Math.max(...data.map(p => p.y)).toFixed(4)}</strong>
                        </div>
                    </div>
                </div>

                ${this.generateAdditionalInfo(functionType, coefficients)}
            </div>
        `;

        this.reportContainer.innerHTML = reportHTML;
    }

    getFunctionTypeName(functionType) {
        const names = {
            'linear': 'Линейная',
            'quadratic': 'Квадратичная', 
            'cubic': 'Кубическая',
            'exponential': 'Экспоненциальная'
        };
        return names[functionType] || functionType;
    }

    formatCoefficients(coefficients, functionType) {
        const labels = this.getCoefficientLabels(functionType);
        
        return coefficients.map((coef, index) => `
            <div class="coefficient-item">
                <span class="coefficient-label">${labels[index]}:</span>
                <span class="coefficient-value">${coef.toFixed(6)}</span>
            </div>
        `).join('');
    }

    getCoefficientLabels(functionType) {
        switch (functionType) {
            case 'linear':
                return ['a (угловой коэффициент)', 'b (свободный член)'];
            case 'quadratic':
                return ['a (x²)', 'b (x)', 'c (свободный член)'];
            case 'cubic':
                return ['a (x³)', 'b (x²)', 'c (x)', 'd (свободный член)'];
            case 'exponential':
                return ['a (коэффициент)', 'b (показатель)'];
            default:
                return coefficients.map((_, i) => `Коэффициент ${i + 1}`);
        }
    }

    getQualityClass(rSquared) {
        if (rSquared >= 0.9) return 'quality-excellent';
        if (rSquared >= 0.7) return 'quality-good';
        if (rSquared >= 0.5) return 'quality-moderate';
        return 'quality-poor';
    }

    getQualityDescription(rSquared) {
        if (rSquared >= 0.9) return 'Отличное';
        if (rSquared >= 0.7) return 'Хорошее';
        if (rSquared >= 0.5) return 'Удовлетворительное';
        return 'Низкое';
    }

    generateAdditionalInfo(functionType, coefficients) {
        let additionalInfo = '';
        
        switch (functionType) {
            case 'linear':
                additionalInfo = `
                    <div class="report-section">
                        <h4>Интерпретация линейной модели</h4>
                        <div class="interpretation">
                            <p>Угловой коэффициент a = ${coefficients[0].toFixed(4)} показывает скорость изменения Y относительно X.</p>
                            <p>При увеличении X на 1 единицу, Y ${coefficients[0] >= 0 ? 'увеличивается' : 'уменьшается'} на ${Math.abs(coefficients[0]).toFixed(4)} единиц.</p>
                        </div>
                    </div>
                `;
                break;
            case 'exponential':
                additionalInfo = `
                    <div class="report-section">
                        <h4>Интерпретация экспоненциальной модели</h4>
                        <div class="interpretation">
                            <p>Показатель b = ${coefficients[1].toFixed(4)} определяет скорость роста/убывания функции.</p>
                            <p>При b > 0 функция возрастает, при b < 0 - убывает.</p>
                            <p>Время удвоения/полураспада: ${this.calculateDoublingTime(coefficients[1]).toFixed(4)} единиц X.</p>
                        </div>
                    </div>
                `;
                break;
        }
        
        return additionalInfo;
    }

    calculateDoublingTime(b) {
        if (b === 0) return Infinity;
        return Math.log(2) / b;
    }

    getReportText() {
        return this.reportContainer.innerText;
    }

    showNoResults() {
        this.reportContainer.innerHTML = `
            <div class="no-results">
                <p>Выполните расчет для отображения отчета</p>
            </div>
        `;
    }

    showError(message) {
        this.reportContainer.innerHTML = `
            <div class="error-message">
                <h4>Ошибка при формировании отчета</h4>
                <p>${message}</p>
            </div>
        `;
    }
}
