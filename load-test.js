function runLoadTest() {
    console.clear();
    console.log('НАГРУЗОЧНОЕ ТЕСТИРОВАНИЕ');
    console.log('------------------------');
    
    const sizes = [10, 100, 1000, 10000];
    const functions = ['linear', 'quadratic', 'cubic', 'exponential'];
    
    for (let size of sizes) {
        let data = [];
        for (let i = 0; i < size; i++) {
            data.push({x: i, y: i * 2 + 1});
        }
        
        console.log(size + ' точек:');
        
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
                console.log(funcType + ': ошибка');
            }
        }
        console.log('---');
    }
}

const btn = document.createElement('button');
btn.textContent = 'Тест скорости';
btn.onclick = runLoadTest;

let header = document.querySelector('header');
if (!header) {
    header = document.createElement('header');
    document.body.insertBefore(header, document.body.firstChild);
}
header.appendChild(btn);
