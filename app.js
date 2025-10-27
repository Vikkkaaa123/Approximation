class ApproximationApp {
    constructor() {
        this.dataManager = new DataManager();
        this.mathProcessor = new MathProcessor();
        this.chartRenderer = new ChartRenderer();
        this.reportGenerator = new ReportGenerator();
        
        this.isCalculating = false;
        this.currentResults = null;
        
        this.initEventListeners();
        this.initializeApp();
    }

    initEventListeners() {
        // Кнопка расчета
        document.getElementById('calculateBtn').addEventListener('click', () => this.calculateApproximation());
        
        // Кнопка копирования результатов
        document.getElementById('copyResultsBtn').addEventListener('click', () => this.copyResultsToClipboard());
        
        // Автоматический пересчет при изменении типа функции
        document.getElementById('functionType').addEventListener('change', () => {
            if (this.currentResults) {
                this.recalculateWithNewFunction();
            }
        });
        
        // Обработка клавиши Enter в полях ввода
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.classList.contains('x-input')) {
                this.focusNextInput(e.target);
            }
        });
    }

    initializeApp() {
        console.log('Программа для аппроксимации функций инициализирована');
        this.chartRenderer.renderEmptyChart();
        this.reportGenerator.showNoResults();
    }

    async calculateApproximation() {
        if (this.isCalculating) return;
        
        // Проверяем валидность данных
        if (!this.dataManager.isValid()) {
            alert('Пожалуйста, проверьте введенные данные. Необходимо как минимум 2 корректные точки.');
            return;
        }

        this.isCalculating = true;
        this.updateCalculateButton(true);
        
        try {
            const data = this.dataManager.getData();
            const functionType = document.getElementById('functionType').value;
            
            // Выполняем аппроксимацию
            const results = this.mathProcessor.approximate(data, functionType);
            this.currentResults = { ...results, functionType };
            
            // Обновляем интерфейс
            this.displayResults(results);
            this.chartRenderer.renderChart(data, results, functionType);
            this.reportGenerator.generateReport(data, results, functionType);
            
        } catch (error) {
            this.handleCalculationError(error);
        } finally {
            this.isCalculating = false;
            this.updateCalculateButton(false);
        }
    }

    recalculateWithNewFunction() {
        if (!this.currentResults) return;
        
        const data = this.dataManager.getData();
        const newFunctionType = document.getElementById('functionType').value;
        
        try {
            const results = this.mathProcessor.approximate(data, newFunctionType);
            this.currentResults = { ...results, functionType: newFunctionType };
            
            this.displayResults(results);
            this.chartRenderer.updateChart(data, results, newFunctionType);
            this.reportGenerator.generateReport(data, results, newFunctionType);
            
        } catch (error) {
            this.handleCalculationError(error);
        }
    }

    displayResults(results) {
        const resultsContainer = document.getElementById('resultsContainer');
        
        resultsContainer.innerHTML = `
            <div class="results-content">
                <div class="result-item">
                    <h4>Аппроксимирующая функция</h4>
                    <div class="result-value formula">${results.formula}</div>
                </div>
                
                <div class="result-item">
                    <h4>Коэффициенты</h4>
                    <div class="coefficients">
                        ${results.coefficients.map((coef, index) => `
                            <div class="coefficient">
                                <span>a<sub>${index}</sub> = ${coef.toFixed(6)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="result-item">
                    <h4>Точность аппроксимации</h4>
                    <div class="accuracy">
                        <span class="r-squared">R² = ${results.rSquared.toFixed(6)}</span>
                        <span class="quality ${this.getQualityClass(results.rSquared)}">
                            (${this.getQualityDescription(results.rSquared)})
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    getQualityClass(rSquared) {
        if (rSquared >= 0.9) return 'excellent';
        if (rSquared >= 0.7) return 'good';
        if (rSquared >= 0.5) return 'moderate';
        return 'poor';
    }

    getQualityDescription(rSquared) {
        if (rSquared >= 0.9) return 'отличная';
        if (rSquared >= 0.7) return 'хорошая';
        if (rSquared >= 0.5) return 'удовлетворительная';
        return 'низкая';
    }

    updateCalculateButton(isCalculating) {
        const calculateBtn = document.getElementById('calculateBtn');
        
        if (isCalculating) {
            calculateBtn.textContent = 'Вычисление...';
            calculateBtn.disabled = true;
        } else {
            calculateBtn.textContent = 'Выполнить расчет';
            calculateBtn.disabled = false;
        }
    }

    handleCalculationError(error) {
        console.error('Calculation error:', error);
        
        const errorMessage = error.message || 'Произошла неизвестная ошибка при вычислениях';
        
        // Показываем ошибку в интерфейсе
        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.innerHTML = `
            <div class="error-message">
                <h4>Ошибка вычислений</h4>
                <p>${errorMessage}</p>
                <p class="error-hint">Проверьте введенные данные и попробуйте выбрать другой тип функции.</p>
            </div>
        `;
        
        this.reportGenerator.showError(errorMessage);
        
        // Показываем уведомление
        alert(`Ошибка: ${errorMessage}`);
    }

    async copyResultsToClipboard() {
        if (!this.currentResults) {
            alert('Нет результатов для копирования');
            return;
        }

        try {
            const reportText = this.reportGenerator.getReportText();
            await navigator.clipboard.writeText(reportText);
            
            // Показываем подтверждение
            this.showCopyConfirmation();
            
        } catch (error) {
            console.error('Copy failed:', error);
            alert('Не удалось скопировать результаты. Попробуйте выделить текст вручную.');
        }
    }

    showCopyConfirmation() {
        const copyBtn = document.getElementById('copyResultsBtn');
        const originalText = copyBtn.textContent;
        
        copyBtn.textContent = 'Скопировано!';
        copyBtn.style.background = '#27ae60';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
        }, 2000);
    }

    focusNextInput(currentInput) {
        const row = currentInput.closest('tr');
        const inputs = Array.from(row.querySelectorAll('input'));
        const currentIndex = inputs.indexOf(currentInput);
        
        if (currentIndex < inputs.length - 1) {
            inputs[currentIndex + 1].focus();
        } else {
            // Если это последнее поле в строке, добавляем новую строку
            this.dataManager.addRow();
            
            // Фокусируемся на первом поле новой строки
            const newRow = this.dataManager.tableBody.lastElementChild;
            const newInputs = newRow.querySelectorAll('input');
            if (newInputs.length > 0) {
                newInputs[0].focus();
            }
        }
    }

    // Публичные методы для тестирования
    getDataManager() {
        return this.dataManager;
    }

    getMathProcessor() {
        return this.mathProcessor;
    }

    getCurrentResults() {
        return this.currentResults;
    }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ApproximationApp();
});
