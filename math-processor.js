class MathProcessor {
    constructor() {
        this.coefficients = [];
        this.rSquared = 0;
        this.formula = '';
    }

    // Основной метод аппроксимации
    approximate(data, functionType) {
        if (!data || data.length < 2) {
            throw new Error('Недостаточно данных для аппроксимации');
        }

        try {
            switch (functionType) {
                case 'linear':
                    return this.linearApproximation(data);
                case 'quadratic':
                    return this.quadraticApproximation(data);
                case 'cubic':
                    return this.cubicApproximation(data);
                case 'exponential':
                    return this.exponentialApproximation(data);
                default:
                    throw new Error('Неизвестный тип функции');
            }
        } catch (error) {
            console.error('Approximation error:', error);
            throw new Error(`Ошибка вычислений: ${error.message}`);
        }
    }

    // Линейная аппроксимация y = ax + b
    linearApproximation(data) {
        const n = data.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

        data.forEach(point => {
            sumX += point.x;
            sumY += point.y;
            sumXY += point.x * point.y;
            sumX2 += point.x * point.x;
        });

        const denominator = n * sumX2 - sumX * sumX;
        if (Math.abs(denominator) < 1e-10) {
            throw new Error('Система уравнений вырождена');
        }

        const a = (n * sumXY - sumX * sumY) / denominator;
        const b = (sumY * sumX2 - sumX * sumXY) / denominator;

        this.coefficients = [a, b];
        this.formula = `y = ${a.toFixed(4)}x ${b >= 0 ? '+' : ''} ${b.toFixed(4)}`;
        this.rSquared = this.calculateRSquared(data, (x) => a * x + b);

        return {
            coefficients: this.coefficients,
            formula: this.formula,
            rSquared: this.rSquared,
            functionType: 'linear'
        };
    }

    // Квадратичная аппроксимация y = ax² + bx + c
    quadraticApproximation(data) {
        const n = data.length;
        if (n < 3) {
            throw new Error('Для квадратичной аппроксимации нужно минимум 3 точки');
        }

        let sumX = 0, sumY = 0, sumX2 = 0, sumX3 = 0, sumX4 = 0, sumXY = 0, sumX2Y = 0;

        data.forEach(point => {
            const x = point.x;
            const x2 = x * x;
            const x3 = x2 * x;
            const x4 = x3 * x;

            sumX += x;
            sumY += point.y;
            sumX2 += x2;
            sumX3 += x3;
            sumX4 += x4;
            sumXY += x * point.y;
            sumX2Y += x2 * point.y;
        });

        // Решение системы методом Крамера
        const matrix = [
            [n, sumX, sumX2],
            [sumX, sumX2, sumX3],
            [sumX2, sumX3, sumX4]
        ];

        const vector = [sumY, sumXY, sumX2Y];

        const det = this.determinant3x3(matrix);
        if (Math.abs(det) < 1e-10) {
            throw new Error('Система уравнений вырождена');
        }

        const matrixA = [
            [vector[0], matrix[0][1], matrix[0][2]],
            [vector[1], matrix[1][1], matrix[1][2]],
            [vector[2], matrix[2][1], matrix[2][2]]
        ];

        const matrixB = [
            [matrix[0][0], vector[0], matrix[0][2]],
            [matrix[1][0], vector[1], matrix[1][2]],
            [matrix[2][0], vector[2], matrix[2][2]]
        ];

        const matrixC = [
            [matrix[0][0], matrix[0][1], vector[0]],
            [matrix[1][0], matrix[1][1], vector[1]],
            [matrix[2][0], matrix[2][1], vector[2]]
        ];

        const c = this.determinant3x3(matrixA) / det;
        const b = this.determinant3x3(matrixB) / det;
        const a = this.determinant3x3(matrixC) / det;

        this.coefficients = [a, b, c];
        this.formula = `y = ${a.toFixed(4)}x² ${b >= 0 ? '+' : ''} ${b.toFixed(4)}x ${c >= 0 ? '+' : ''} ${c.toFixed(4)}`;
        this.rSquared = this.calculateRSquared(data, (x) => a * x * x + b * x + c);

        return {
            coefficients: this.coefficients,
            formula: this.formula,
            rSquared: this.rSquared,
            functionType: 'quadratic'
        };
    }

    // Кубическая аппроксимация y = ax³ + bx² + cx + d
    cubicApproximation(data) {
        const n = data.length;
        if (n < 4) {
            throw new Error('Для кубической аппроксимации нужно минимум 4 точки');
        }

        // Используем math.js для решения системы 4x4
        let sumX = 0, sumY = 0, sumX2 = 0, sumX3 = 0, sumX4 = 0, sumX5 = 0, sumX6 = 0;
        let sumXY = 0, sumX2Y = 0, sumX3Y = 0;

        data.forEach(point => {
            const x = point.x;
            const x2 = x * x;
            const x3 = x2 * x;
            const x4 = x3 * x;
            const x5 = x4 * x;
            const x6 = x5 * x;

            sumX += x;
            sumY += point.y;
            sumX2 += x2;
            sumX3 += x3;
            sumX4 += x4;
            sumX5 += x5;
            sumX6 += x6;
            sumXY += x * point.y;
            sumX2Y += x2 * point.y;
            sumX3Y += x3 * point.y;
        });

        const matrix = [
            [n, sumX, sumX2, sumX3],
            [sumX, sumX2, sumX3, sumX4],
            [sumX2, sumX3, sumX4, sumX5],
            [sumX3, sumX4, sumX5, sumX6]
        ];

        const vector = [sumY, sumXY, sumX2Y, sumX3Y];

        try {
            const solution = math.lusolve(matrix, vector);
            const d = solution[0][0];
            const c = solution[1][0];
            const b = solution[2][0];
            const a = solution[3][0];

            this.coefficients = [a, b, c, d];
            this.formula = `y = ${a.toFixed(4)}x³ ${b >= 0 ? '+' : ''} ${b.toFixed(4)}x² ${c >= 0 ? '+' : ''} ${c.toFixed(4)}x ${d >= 0 ? '+' : ''} ${d.toFixed(4)}`;
            this.rSquared = this.calculateRSquared(data, (x) => a * x * x * x + b * x * x + c * x + d);

            return {
                coefficients: this.coefficients,
                formula: this.formula,
                rSquared: this.rSquared,
                functionType: 'cubic'
            };
        } catch (error) {
            throw new Error('Не удалось решить систему уравнений');
        }
    }

    // Экспоненциальная аппроксимация y = aeᵇˣ
    exponentialApproximation(data) {
        const n = data.length;
        
        // Проверяем, что все y > 0
        if (data.some(point => point.y <= 0)) {
            throw new Error('Для экспоненциальной аппроксимации все значения Y должны быть положительными');
        }

        // Линеаризация: ln(y) = ln(a) + bx
        const linearizedData = data.map(point => ({
            x: point.x,
            y: Math.log(point.y)
        }));

        // Выполняем линейную аппроксимацию для линеаризованных данных
        const linearResult = this.linearApproximation(linearizedData);
        
        const b = linearResult.coefficients[0];
        const lnA = linearResult.coefficients[1];
        const a = Math.exp(lnA);

        this.coefficients = [a, b];
        this.formula = `y = ${a.toFixed(4)}e^(${b.toFixed(4)}x)`;
        this.rSquared = this.calculateRSquared(data, (x) => a * Math.exp(b * x));

        return {
            coefficients: this.coefficients,
            formula: this.formula,
            rSquared: this.rSquared,
            functionType: 'exponential'
        };
    }

    // Расчет коэффициента детерминации R²
    calculateRSquared(data, regressionFunction) {
        const yMean = data.reduce((sum, point) => sum + point.y, 0) / data.length;
        
        let totalSumSquares = 0;
        let residualSumSquares = 0;

        data.forEach(point => {
            const predictedY = regressionFunction(point.x);
            totalSumSquares += Math.pow(point.y - yMean, 2);
            residualSumSquares += Math.pow(point.y - predictedY, 2);
        });

        return 1 - (residualSumSquares / totalSumSquares);
    }

    // Вспомогательная функция для вычисления определителя 3x3
    determinant3x3(matrix) {
        return matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
               matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
               matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]);
    }

    // Получение значения функции в точке x
    getFunctionValue(x) {
        if (!this.coefficients.length) return 0;

        switch (this.coefficients.length) {
            case 2: // linear: y = ax + b
                return this.coefficients[0] * x + this.coefficients[1];
            case 3: // quadratic: y = ax² + bx + c
                return this.coefficients[0] * x * x + this.coefficients[1] * x + this.coefficients[2];
            case 4: // cubic: y = ax³ + bx² + cx + d
                return this.coefficients[0] * x * x * x + this.coefficients[1] * x * x + 
                       this.coefficients[2] * x + this.coefficients[3];
            default:
                return 0;
        }
    }

    getResults() {
        return {
            coefficients: this.coefficients,
            formula: this.formula,
            rSquared: this.rSquared
        };
    }
}
