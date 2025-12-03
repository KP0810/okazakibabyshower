let seatingChart = [];

// Function to convert CSV text into a usable array of objects
function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(header => header.trim()); // Get headers (Name, Table)
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length === headers.length) {
            data.push({
                name: values[0].trim(), // Assuming name is the first column
                table: values[1].trim() // Assuming table is the second column
            });
        }
    }
    return data;
}

// Function to fetch the CSV file
function loadSeatingChart() {
    fetch('guests.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(csvText => {
            seatingChart = parseCSV(csvText);
            console.log("Seating Chart loaded successfully:", seatingChart.length, "guests.");
        })
        .catch(error => {
            console.error("Could not load CSV file:", error);
            // Fallback: Display an error message to the user if the data doesn't load
            document.getElementById('error').innerHTML = `<p>❌ **Error loading seating data.** Please refresh the page.</p>`;
            document.getElementById('error').classList.remove('hidden');
        });
}

// Call the loading function immediately
loadSeatingChart();

function clearResults() {
    document.getElementById('result').classList.add('hidden');
    document.getElementById('error').classList.add('hidden');
    document.getElementById('matchesList').innerHTML = '';
}

function clearSearch() {
    document.getElementById('nameInput').value = '';
    clearResults();
    document.getElementById('clearButton').classList.add('hidden');
    document.getElementById('instructions').classList.remove('hidden');
    document.getElementById('nameInput').classList.remove('hidden');
}

function liveSearch() {
    const inputField = document.getElementById('nameInput');
    const inputName = inputField.value.trim().toLowerCase();
    const clearBtn = document.getElementById('clearButton');
    
    // Clear results *before* running search
    clearResults(); 

    // --- Button Visibility Logic ---
    if (inputName.length > 0) {
        clearBtn.classList.remove('hidden'); 
    } else {
        clearBtn.classList.add('hidden');
        return; 
    }

    // --- Search Threshold ---
    if (inputName.length < 2) {
        document.getElementById('error').innerHTML = '<p>⚠️</br><b>Please enter at least two letters of the name.</b></p>';
        document.getElementById('error').classList.remove('hidden');
        return;
    }

    // --- FORGIVING SEARCH & FILTER LOGIC (SMARTER FILTERING) ---
    // 1. Try to find guests whose names START with the input
    let matchingGuests = seatingChart.filter(guest => 
        guest.name.toLowerCase().startsWith(inputName)
    ).sort((a, b) => a.name.localeCompare(b.name));

    // 2. If no starting matches found, fall back to includes()
    if (matchingGuests.length === 0) {
         matchingGuests = seatingChart.filter(guest => 
            guest.name.toLowerCase().includes(inputName)
        ).sort((a, b) => a.name.localeCompare(b.name));
    }
    
    // --- DISPLAY RESULTS ---
    const matchesList = document.getElementById('matchesList');
    const resultDiv = document.getElementById('result');
    const tableNumberSpan = document.getElementById('tableNumber'); // Get the span element

    if (matchingGuests.length === 1 && matchingGuests[0].name.toLowerCase() === inputName) {
        // Case 1A: Exact Match Found (Show the table and mates)
        document.getElementById('instructions').classList.add('hidden');
        document.getElementById('nameInput').classList.add('hidden');
        const foundGuest = matchingGuests[0];
        const tableNum = foundGuest.table;
        
        // Find ALL guests at this table
        const tableMates = seatingChart
            .filter(guest => guest.table === tableNum)
            .map(guest => guest.name)
            .sort()
            .filter(name => name !== foundGuest.name);

        // Reset and apply animation classes
        resultDiv.classList.remove('animate-result'); 
        tableNumberSpan.classList.remove('animate-number');

        // Force reflow/repaint to ensure animation restarts (essential trick for JS animations)
        void resultDiv.offsetWidth; 
        void tableNumberSpan.offsetWidth;

        // Add classes back immediately
        resultDiv.classList.add('animate-result');
        tableNumberSpan.classList.add('animate-number');

        // Update the main result display
        document.getElementById('userName').textContent = foundGuest.name;
        tableNumberSpan.textContent = tableNum;
        
        // Update the tablemates list
        const matesListElement = document.getElementById('tableMatesList');
        if (tableMates.length > 0) {
            matesListElement.innerHTML = 
                `<h4>Your Tablemates:</h4>
                 <ul>
                    ${tableMates.map(name => `<li>${name}</li>`).join('')}
                 </ul>`;
            matesListElement.classList.remove('hidden');
        } else {
            matesListElement.innerHTML = `<p>You are the first one found at Table ${tableNum}!</p>`;
            matesListElement.classList.remove('hidden');
        }

        resultDiv.classList.remove('hidden');

    } else if (matchingGuests.length >= 1) {
        // Case 2: One or more partial matches (Show list of suggestions)
        let listHTML = '<h3>Did you mean one of these?</h3>';
        
        listHTML += '<ul>';
        matchingGuests.forEach(guest => {
            listHTML += `<li onclick="selectName('${guest.name}')">
                            ${guest.name}
                         </li>`;
        });
        listHTML += '</ul>';

        matchesList.innerHTML = listHTML;

    } else {
        // Case 3: NO matches found
        document.getElementById('error').innerHTML = '<p>❌</br><b>No match found.</b></br>Keep typing or check spelling.</p>';
        document.getElementById('error').classList.remove('hidden');
    }
}

function selectName(name) {
    document.getElementById('nameInput').value = name;
    liveSearch();
}

document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('nameInput');
    inputField.addEventListener('input', liveSearch);
});