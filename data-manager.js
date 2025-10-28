class DataManager {
    constructor() {
        this.dataPoints = [];
        this.tableBody = document.getElementById('dataTableBody');
        this.validationMessage = document.getElementById('dataValidationMessage');
        
        this.setupEvents();
        this.addInitialRows();
    }

    setupEvents() {
        document.getElementById('addRowBtn').addEventListener('click', () => this.addRow());
        document.getElementById('clearDataBtn').addEventListener('click', () => this.clearData());
        document.getElementById('importCsvBtn').addEventListener('click', () => this.triggerCsvImport());
        document.getElementById('csvFile').addEventListener('change', (e) => this.handleCsvImport(e));
    }

    addInitialRows() {
        for (let i = 0; i < 3; i++) {
            this.addRow();
        }
    }

    addRow() {
        const rowIndex = this.tableBody.children.length;
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${rowIndex + 1}</td>
            <td><input type="number" step="any" class="x-input"></td>
            <td><input type="number" step="any" class="y-input"></td>
            <td><button type="button" class="remove-row-btn">Удалить</button></td>
        `;

        row.querySelector('.remove-row-btn').addEventListener('click', () => {
            row.remove();
            this.updateRowNumbers();
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
    if (confirm('Очистить все данные?')) {
        this.addInitialRows();
        this.dataPoints = [];
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
            this.parseCsvData(e.target.result);
        };
        reader.readAsText(file);
    }

    parseCsvData(csvData) {
        const lines = csvData.split('\n');
        const newData = [];

        for (let i = 0; i < lines.length; i++) {
            const cells = lines[i].split(',');
            
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
            alert(`Загружено ${newData.length} точек`);
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
            });

            this.tableBody.appendChild(row);
        });

        this.collectData();
    }

    collectData() {
        const rows = this.tableBody.querySelectorAll('tr');
        const newData = [];

        rows.forEach((row) => {
            const xInput = row.querySelector('.x-input');
            const yInput = row.querySelector('.y-input');
            
            const x = parseFloat(xInput.value);
            const y = parseFloat(yInput.value);

            if (xInput.value !== '' && yInput.value !== '' && !isNaN(x) && !isNaN(y)) {
                newData.push({ x, y });
            }
        });

        this.dataPoints = newData;
        return newData;
    }

    getData() {
        return this.dataPoints;
    }

    isValid() {
        const data = this.collectData();
        return data.length >= 2;
    }
}
