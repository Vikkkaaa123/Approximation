class LoadTester {
    constructor() {
        this.results = [];
    }

    createTestData(count) {
        let data = [];
        for (let i = 0; i < count; i++) {
            data.push({
                x: i,
                y: 2 * i + 1 + Math.random() * 0.1
            });
        }
        return data;
    }
  
    testSpeed(data, functionType) {
        const start = performance.now();
        
        try {
            const result = mathProcessor.approximate(data, functionType);
            const end = performance.now();
            return {
                time: end - start,
                success: true
            };
        } catch (error) {
            const end = performance.now();
            return {
                time: end - start,
                success: false,
                error: error.message
            };
        }
    }
    
    runAllTests() {
        console.log('Нагрузочное тестирование начато');
        
        const sizes = [10, 100, 1000, 10000];
        
        for (let size of sizes) {
            console.log(`Тестируем ${size} точек...`);
            
            const testData = this.createTestData(size);
            
            const linearTest = this.testSpeed(testData, 'linear');
            
            let quadraticTest = { time: 0, success: false };
            if (size >= 3) {
                quadraticTest = this.testSpeed(testData, 'quadratic');
            }
            
            this.results.push({
                size: size,
                linearTime: linearTest.time,
                quadraticTime: quadraticTest.time,
                linearSuccess: linearTest.success,
                quadraticSuccess: quadraticTest.success
            });
            console.log(`Размер: ${size} | Линейная: ${linearTest.time.toFixed(2)}ms | Квадратичная: ${quadraticTest.time.toFixed(2)}ms`);
        }
        
        this.showResults();
    }
    
    showResults() {
        console.log('\n=== РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ ===');
        console.log('Точек | Линейная (мс) | Квадратичная (мс)');
        console.log('------|---------------|-------------------');
        
        for (let result of this.results) {
            console.log(
                result.size.toString().padEnd(6) + ' | ' +
                result.linearTime.toFixed(2).padEnd(14) + ' | ' +
                result.quadraticTime.toFixed(2)
            );
        }
        return this.results;
    }
}

function startLoadTest() {
    const tester = new SimpleLoadTester();
    return tester.runAllTests();
}

function addTestButton() {
    const button = document.createElement('button');
    button.textContent = 'Запустить тест скорости';
    button.style.margin = '10px';
    button.style.padding = '10px';
    
    button.onclick = function() {
        startLoadTest();
    };
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(button, container.firstChild);
    }
}

document.addEventListener('DOMContentLoaded', addTestButton);
