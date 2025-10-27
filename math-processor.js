class MathProcessor {
    
    approximate(data, functionType) {
        if (!data || data.length < 2) {
            throw new Error('Нужно минимум 2 точки');
        }

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
    }

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
            const avgY = sumY / n;
            return {
                coefficients: [0, avgY],
                formula: `y = ${avgY.toFixed(4)}`,
                rSquared: 0,
                functionType: 'linear'
            };
        }

        const a = (n * sumXY - sumX * sumY) / denominator;
        const b = (sumY * sumX2 - sumX * sumXY) / denominator;

        const formula = `y = ${a.toFixed(4)}x ${b >= 0 ? '+' : ''} ${b.toFixed(4)}`;
        const rSquared = this.calculateRSquared(data, (x) => a * x + b);

        return {
            coefficients: [a, b],
            formula: formula,
            rSquared: rSquared,
            functionType: 'linear'
        };
    }

    quadraticApproximation(data) {
        if (data.length < 3) {
            throw new Error('Нужно минимум 3 точки');
        }

        let sumX = 0, sumY = 0, sumX2 = 0, sumX3 = 0, sumX4 = 0, sumXY = 0, sumX2Y = 0;

        data.forEach(point => {
            const x = point.x;
            sumX += x;
            sumY += point.y;
            sumX2 += x * x;
            sumX3 += x * x * x;
            sumX4 += x * x * x * x;
            sumXY += x * point.y;
            sumX2Y += x * x * point.y;
        });

        const n = data.length;
        const matrix = [
            [n, sumX, sumX2],
            [sumX, sumX2, sumX3],
            [sumX2, sumX3, sumX4]
        ];
        const vector = [sumY, sumXY, sumX2Y];

        try {
            const solution = math.lusolve(matrix, vector);
            const c = solution[0][0];
            const b = solution[1][0];
            const a = solution[2][0];

            const formula = `y = ${a.toFixed(4)}x² ${b >= 0 ? '+' : ''} ${b.toFixed(4)}x ${c >= 0 ? '+' : ''} ${c.toFixed(4)}`;
            const rSquared = this.calculateRSquared(data, (x) => a * x * x + b * x + c);

            return {
                coefficients: [a, b, c],
                formula: formula,
                rSquared: rSquared,
                functionType: 'quadratic'
            };
        } catch (error) {
            throw new Error('Не удалось вычислить коэффициенты');
        }
    }

    cubicApproximation(data) {
        if (data.length < 4) {
            throw new Error('Нужно минимум 4 точки');
        }

        let sumX = 0, sumY = 0, sumX2 = 0, sumX3 = 0, sumX4 = 0, sumX5 = 0, sumX6 = 0;
        let sumXY = 0, sumX2Y = 0, sumX3Y = 0;

        data.forEach(point => {
            const x = point.x;
            sumX += x;
            sumY += point.y;
            sumX2 += x * x;
            sumX3 += x * x * x;
            sumX4 += x * x * x * x;
            sumX5 += x * x * x * x * x;
            sumX6 += x * x * x * x * x * x;
            sumXY += x * point.y;
            sumX2Y += x * x * point.y;
            sumX3Y += x * x * x * point.y;
        });

        const matrix = [
            [data.length, sumX, sumX2, sumX3],
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

            const formula = `y = ${a.toFixed(4)}x³ ${b >= 0 ? '+' : ''} ${b.toFixed(4)}x² ${c >= 0 ? '+' : ''} ${c.toFixed(4)}x ${d >= 0 ? '+' : ''} ${d.toFixed(4)}`;
            const rSquared = this.calculateRSquared(data, (x) => a * x * x * x + b * x * x + c * x + d);

            return {
                coefficients: [a, b, c, d],
                formula: formula,
                rSquared: rSquared,
                functionType: 'cubic'
            };
        } catch (error) {
            throw new Error('Не удалось вычислить коэффициенты');
        }
    }

    exponentialApproximation(data) {
        if (data.some(point => point.y <= 0)) {
            throw new Error('Все Y должны быть > 0');
        }

        const linearizedData = data.map(point => ({
            x: point.x,
            y: Math.log(point.y)
        }));

        const linearResult = this.linearApproximation(linearizedData);
        const b = linearResult.coefficients[0];
        const a = Math.exp(linearResult.coefficients[1]);

        const formula = `y = ${a.toFixed(4)}e^(${b.toFixed(4)}x)`;
        const rSquared = this.calculateRSquared(data, (x) => a * Math.exp(b * x));

        return {
            coefficients: [a, b],
            formula: formula,
            rSquared: rSquared,
            functionType: 'exponential'
        };
    }

    calculateRSquared(data, regressionFunction) {
        const yMean = data.reduce((sum, point) => sum + point.y, 0) / data.length;
        
        let totalSum = 0;
        let residualSum = 0;

        data.forEach(point => {
            const predictedY = regressionFunction(point.x);
            totalSum += Math.pow(point.y - yMean, 2);
            residualSum += Math.pow(point.y - predictedY, 2);
        });

        return 1 - (residualSum / totalSum);
    }
}
