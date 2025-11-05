function runLoadTest() {
    console.log('НАГРУЗОЧНОЕ ТЕСТИРОВАНИЕ');

    const mathProcessor = new MathProcessor();
    
    const sizes = [10, 100, 1000, 10000];
    const functions = ['linear', 'quadratic', 'cubic', 'exponential'];
    
    for (let size of sizes) {
        console.log(size + ' точек:');
        
        let data = [];
        for (let i = 0; i < size; i++) {
            data.push({x: i, y: i * 2 + 1});
        }
        
        for (let funcType of functions) {
            if (funcType === 'exponential' && size < 2) continue;
            if (funcType === 'quadratic' && size < 3) continue;
            if (funcType === 'cubic' && size < 4) continue;
            
            const startTime = performance.now();
            
            try {
                mathProcessor.approximate(data, funcType);
                const time = performance.now() - startTime;
                console.log(funcType + ': ' + time.toFixed(2) + 'ms');
            } catch (error) {
                console.log(funcType + ': ошибка - ' + error.message);
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const btn = document.createElement('button');
    btn.textContent = 'Запустить нагрузочный тест';
    btn.style.marginLeft = '10px';
    btn.style.padding = '5px 10px';
    btn.style.backgroundColor = '#4CAF50';
    btn.style.color = 'white';
    btn.style.border = 'none';
    btn.style.borderRadius = '3px';
    btn.style.cursor = 'pointer';
    btn.onclick = runLoadTest;

    const header = document.querySelector('header');
    if (header) {
        header.appendChild(btn);
    }
});
