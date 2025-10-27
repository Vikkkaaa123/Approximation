class DataManager {
    constructor() {
        this.dataPoints = [];
        this.tableBody = document.getElementById('dataTableBody');
        this.validationMessage = document.getElementById('dataValidationMessage');
        this.initEventListeners();
        this.addInitialRows();
    }

    initEventListeners() {
        document.getElementById('addRowBtn').addEventListener('click', () => this.addRow());
        document.getElementById('clearDataBtn').addEventListener('click', () => this.clearData());
        document.getElementById('importCsvBtn').addEventListener('click', () => this.triggerCsvImport());
        document.getElementById('csvFile').addEventListener('change', (e) => this.handleCsvImport(e));
    }

    addInitialRows() {
        // Добавляем 5 начальных строк для удобства
        for (let i = 0; i < 5; i++) {
            this.addRow();
        }
    }

    addRow() {
        const rowIndex = this.tableBody.children.length;
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${rowIndex + 1}</td>
            <td><input type="number" step="any" class="x-input" placeholder="Введите X"></td>
            <td><input type="number" step="any" class="y-input" placeholder="Введите Y"></td>
            <td><button type="button" class="remove-row-btn">Удалить</button></td>
        `;

        row.querySelector('.remove-row-btn').addEventListener('click', () => {
            row.remove();
            this.updateRowNumbers();
            this.collectData();
        });

        // Добавляем обработчики изменения данных
        const inputs = row.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.collectData());
        });

        this.tableBody.appendChild(row);
    }

    updateRowNumbers() {
        const rows = this.tableBody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            row.cells[0].textContent = index + 1;
        });
    }

    clearData() {
        if (confirm('Вы уверены, что хотите очистить все данные?')) {
            this.tableBody.innerHTML = '';
            this.dataPoints = [];
            this.addInitialRows();
            this.clearValidationMessage();
        }
    }

    triggerCsvImport() {
        document.getElementById('csvFile').click();
    }

    handleCsvImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const csvData = e.target.result;
            this.parseCsvData(csvData);
        };
        reader.readAsText(file);
        
        // Сбрасываем значение input для возможности повторной загрузки того же файла
        event.target.value = '';
    }

    parseCsvData(csvData) {
        try {
            const lines = csvData.split('\n').filter(line => line.trim());
            const newData = [];

            for (let i = 0; i < lines.length; i++) {
                const cells = lines[i].split(',').map(cell => cell.trim());
                
                if (cells.length >= 2) {
                    const x = parseFloat(cells[0]);
                    const y = parseFloat(cells[1]);
                    
                    if (!isNaN(x) && !isNaN(y)) {
                        newData.push({ x, y });
                    }
                }
            }

            if (newData.length > 0) {
                this.loadData(newData);
                this.showValidationMessage(`Успешно загружено ${newData.length} точек данных`, 'success');
            } else {
                this.showValidationMessage('Не удалось найти корректные данные в CSV файле', 'error');
            }
        } catch (error) {
            this.showValidationMessage('Ошибка при чтении CSV файла', 'error');
            console.error('CSV parsing error:', error);
        }
    }

    loadData(data) {
        this.tableBody.innerHTML = '';
        data.forEach((point, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><input type="number" step="any" class="x-input" value="${point.x}"></td>
                <td><input type="number" step="any" class="y-input" value="${point.y}"></td>
                <td><button type="button" class="remove-row-btn">Удалить</button></td>
            `;

            row.querySelector('.remove-row-btn').addEventListener('click', () => {
                row.remove();
                this.updateRowNumbers();
                this.collectData();
            });

            const inputs = row.querySelectorAll('input');
            inputs.forEach(input => {
                input.addEventListener('input', () => this.collectData());
            });

            this.tableBody.appendChild(row);
        });

        this.collectData();
    }

    collectData() {
        const rows = this.tableBody.querySelectorAll('tr');
        const newData = [];
        let hasErrors = false;
        const errorRows = [];

        rows.forEach((row, index) => {
            const xInput = row.querySelector('.x-input');
            const yInput = row.querySelector('.y-input');
            
            const x = parseFloat(xInput.value);
            const y = parseFloat(yInput.value);

            // Сбрасываем стили ошибок
            xInput.style.borderColor = '';
            yInput.style.borderColor = '';

            if (xInput.value !== '' && yInput.value !== '') {
                if (!isNaN(x) && !isNaN(y)) {
                    newData.push({ x, y });
                } else {
                    hasErrors = true;
                    errorRows.push(index + 1);
                    xInput.style.borderColor = '#e74c3c';
                    yInput.style.borderColor = '#e74c3c';
                }
            }
        });

        this.dataPoints = newData;

        if (hasErrors) {
            this.showValidationMessage(`Обнаружены ошибки в строках: ${errorRows.join(', ')}. Проверьте введенные данные.`, 'error');
        } else if (newData.length === 0) {
            this.showValidationMessage('Введите данные для анализа', 'error');
        } else if (newData.length < 2) {
            this.showValidationMessage('Необходимо как минимум 2 точки данных', 'error');
        } else {
            this.clearValidationMessage();
        }

        return newData;
    }

    showValidationMessage(message, type) {
        this.validationMessage.textContent = message;
        this.validationMessage.className = `validation-message ${type}`;
    }

    clearValidationMessage() {
        this.validationMessage.textContent = '';
        this.validationMessage.className = 'validation-message';
    }

    getData() {
        return this.dataPoints;
    }

    isValid() {
        const data = this.collectData();
        return data.length >= 2;
    }
}
