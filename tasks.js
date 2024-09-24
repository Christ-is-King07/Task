console.log("Script loaded");

// Load existing data from Local Storage when the page loads
document.addEventListener("DOMContentLoaded", loadTableData);

// Add Tab Functionality
document.getElementById("addTabButton").addEventListener("click", function() {
    const tabName = document.getElementById("tabNameInput").value;
    if (tabName) {
        addTab(tabName);
        document.getElementById("tabNameInput").value = "";
    }
});

// Handle form submission
document.getElementById("dataForm").addEventListener("submit", function(event) {
    event.preventDefault();

    // Get the input values
    const name = document.getElementById("nameInput").value;
    const infoInput = document.getElementById("infoInput").value;

    // Convert infoInput to an integer
    const info = parseInt(infoInput, 10);

    // Debug: Log the input values
    console.log("Name: ", name);
    console.log("Info: ", info);

    // Get the currently selected tab name
    const currentTab = document.getElementById("dataForm").getAttribute("data-tab");

    // Validate that info is a number and is not NaN
    if (name && !isNaN(info)) {
        // Add a new row to the table of the current tab
        addRow(currentTab, name, info);

        // Store the new entry in Local Storage
        storeInLocalStorage(currentTab, name, info);

        // Clear the input fields
        document.getElementById("nameInput").value = "";
        document.getElementById("infoInput").value = "";
    } else {
        console.log("Invalid input. Please enter a valid integer for Info.");
    }
});

function loadTableData() {
    const storedData = JSON.parse(localStorage.getItem("tableData")) || [];
    storedData.forEach(item => {
        addRow(item.tab, item.name, item.info);
    });
}

function addRow(tabName, name, info) {
    const table = document.getElementById(tabName + "Table").getElementsByTagName("tbody")[0];

    // Create a new row
    const newRow = table.insertRow();

    // Insert cells
    const nameCell = newRow.insertCell(0);
    const infoCell = newRow.insertCell(1);
    const actionCell = newRow.insertCell(2);

    // Add text to cells
    nameCell.textContent = name;
    infoCell.textContent = info;

    // Color-code the row based on the info value
    newRow.style.backgroundColor = getColorByBand(info);

    // Add event listeners to enable editing
    nameCell.ondblclick = () => editCell(nameCell);
    infoCell.ondblclick = () => editCell(infoCell);

    // Add delete button to the action cell
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = function() {
        deleteRow(this);
    };
    actionCell.appendChild(deleteButton);
}

function storeInLocalStorage(tab, name, info) {
    const storedData = JSON.parse(localStorage.getItem("tableData")) || [];
    storedData.push({ tab, name, info });
    localStorage.setItem("tableData", JSON.stringify(storedData));
}

function getColorByBand(info) {
    if (info >= 90) {
        return "lightgreen";  // Band 6
    } else if (info >= 80) {
        return "yellow";  // Band 5
    } else if (info >= 70) {
        return "orange";  // Band 4
    } else if (info >= 60) {
        return "lightcoral";  // Band 3
    } else if (info >= 50) {
        return "salmon";  // Band 2
    } else {
        return "lightpink";  // Band 1
    }
}

function deleteRow(button) {
    // Find the row of the button and delete it
    const row = button.parentNode.parentNode;
    const name = row.cells[0].textContent;
    const info = parseInt(row.cells[1].textContent, 10);
    const currentTab = document.getElementById("dataForm").getAttribute("data-tab");

    // Remove the row from the DOM
    row.parentNode.removeChild(row);

    // Remove the deleted entry from Local Storage
    removeFromLocalStorage(currentTab, name, info);

    // Debug: Log after deleting row
    console.log("Row deleted");
}

function removeFromLocalStorage(tab, name, info) {
    let storedData = JSON.parse(localStorage.getItem("tableData")) || [];
    storedData = storedData.filter(item => !(item.tab === tab && item.name === name && item.info === info));
    localStorage.setItem("tableData", JSON.stringify(storedData));
}

// Function to edit a cell
function editCell(cell) {
    const currentValue = cell.textContent;
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentValue;

    cell.innerHTML = ""; // Clear the cell
    cell.appendChild(input);

    input.addEventListener("blur", () => {
        const newValue = input.value;
        cell.textContent = newValue;

        // Update Local Storage if the edited cell is for 'info'
        if (cell === cell.parentNode.cells[1]) { // Info cell
            const name = cell.parentNode.cells[0].textContent;
            const info = parseInt(newValue, 10);
            if (!isNaN(info)) {
                updateLocalStorage(cell.parentNode.parentNode, name, info); // Pass the tab name
                cell.parentNode.style.backgroundColor = getColorByBand(info);
            }
        }
    });

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            input.blur(); // Trigger blur event to save changes
        }
    });

    input.focus();
}

// Update Local Storage for edited entry
function updateLocalStorage(tabName, name, info) {
    let storedData = JSON.parse(localStorage.getItem("tableData")) || [];
    const index = storedData.findIndex(item => item.tab === tabName && item.name === name);
    if (index !== -1) {
        storedData[index].info = info; // Update the info
        localStorage.setItem("tableData", JSON.stringify(storedData));
    }
}

// Add Tab Functionality
function addTab(tabName) {
    const tabList = document.getElementById("tabs");
    const tab = document.createElement("li");
    tab.textContent = tabName;
    tab.classList.add("tab");
    tab.onclick = () => selectTab(tabName);
    tabList.appendChild(tab);

    // Create a new table for the tab
    const newTable = createTable(tabName);
    document.getElementById("tablesContainer").appendChild(newTable);
}

// Create a new table for a specific tab
function createTable(tabName) {
    const tableContainer = document.createElement("div");
    tableContainer.id = tabName + "Table";
    tableContainer.className = "table-container";

    const table = document.createElement("table");
    table.id = "infoTable";

    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th>Name</th>
            <th>Info</th>
            <th>Action</th>
        </tr>`;
    const tbody = document.createElement("tbody");

    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);

    return tableContainer;
}

// Function to select a tab
function selectTab(tabName) {
    const tables = document.querySelectorAll(".table-container");
    tables.forEach(table => {
        table.style.display = "none"; // Hide all tables
    });

    const activeTable = document.getElementById(tabName + "Table");
    if (activeTable) {
        activeTable.style.display = "block"; // Show the selected table
    }

    // Update the form's data-tab attribute
    document.getElementById("dataForm").setAttribute("data-tab", tabName);
}