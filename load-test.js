function runLoadTest() {
    console.clear();
    console.log('Тестирование');
    
    const sizes = [10, 100, 1000, 10000];
    
    for (let size of sizes) {
        let data = [];
        for (let i = 0; i < size; i++) {
            data.push({x: i, y: i * 2 + 1});
        }
        
        const startLinear = performance.now();
        mathProcessor.approximate(data, 'linear');
        const timeLinear = performance.now() - startLinear;
        
        const startQuadratic = performance.now();
        mathProcessor.approximate(data, 'quadratic');
        const timeQuadratic = performance.now() - startQuadratic;
        
        console.log(size + ' точек:');
        console.log('Линейная: ' + timeLinear.toFixed(2) + 'ms');
        console.log('Квадратичная: ' + timeQuadratic.toFixed(2) + 'ms');
    }
}

const btn = document.createElement('button');
btn.textContent = 'Тест скорости';
btn.onclick = runLoadTest;
document.querySelector('header').appendChild(btn);
