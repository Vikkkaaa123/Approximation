function runUnitTests() {
    console.log('МОДУЛЬНОЕ ТЕСТИРОВАНИЕ');
    const mathProcessor = new MathProcessor();
    
    // Тест 1: Проверка минимального количества точек
    try {
        mathProcessor.approximate([{x: 1, y: 1}], 'linear');
        console.log('Тест 1 не пройден: должна быть ошибка при 1 точке');
    } catch (error) {
        console.log('Тест 1 пройден: ' + error.message);
    }
    
    // Тест 2: Проверка экспоненциальной функции с отрицательными Y
    try {
        mathProcessor.approximate([{x: 1, y: -1}, {x: 2, y: -2}], 'exponential');
        console.log('Тест 2 не пройден: должна быть ошибка при отрицательных Y');
    } catch (error) {
        console.log('Тест 2 пройден: ' + error.message);
    }
    
    // Тест 3: Проверка квадратичной функции с 2 точками
    try {
        mathProcessor.approximate([{x: 1, y: 1}, {x: 2, y: 4}], 'quadratic');
        console.log('Тест 3 не пройден: должна быть ошибка при 2 точках');
    } catch (error) {
        console.log('Тест 3 пройден: ' + error.message);
    }
    
    // Тест 4: Проверка корректности линейной аппроксимации
    try {
        const result = mathProcessor.approximate([{x: 1, y: 2}, {x: 2, y: 3}], 'linear');
        console.log('Тест 4 пройден: формула ' + result.formula);
    } catch (error) {
        console.log('Тест 4 не пройден: ' + error.message);
    }
}
