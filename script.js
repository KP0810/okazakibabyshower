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
}

function liveSearch() {
    const inputField = document.getElementById('nameInput');
    const inputName = inputField.value.trim().toLowerCase();
    const clearBtn = document.getElementById('clearButton');
    
    clearResults(); 

    if (inputName.length > 0) {
        clearBtn.classList.remove('hidden'); 
    } else {
        clearBtn.classList.add('hidden');
        return; 
    }

    if (inputName.length < 2) {
        document.getElementById('error').innerHTML = '<p>⚠️ **Please enter at least two letters of the name.**</p>';
        document.getElementById('error').classList.remove('hidden');
        return;
    }

    const matchingGuests = seatingChart.filter(guest => 
        guest.name.toLowerCase().includes(inputName)
    );

    const matchesList = document.getElementById('matchesList');

    if (matchingGuests.length === 1 && matchingGuests[0].name.toLowerCase() === inputName) {
        const guestInfo = matchingGuests[0];
        document.getElementById('userName').textContent = guestInfo.name;
        document.getElementById('tableNumber').textContent = guestInfo.table;
        document.getElementById('result').classList.remove('hidden');

    } else if (matchingGuests.length >= 1) {
        let listHTML = '<h3>Did you mean one of these?</h3>';
        
        listHTML += '<ul>';
        matchingGuests.forEach(guest => {
            // ⭐ A11Y FIX: Added tabindex="0" and role="button" for keyboard focus and semantics ⭐
            listHTML += `<li 
                            onclick="selectName('${guest.name}')" 
                            onkeydown="if(event.key === 'Enter' || event.key === ' ') { selectName('${guest.name}'); }"
                            tabindex="0"
                            role="button">
                            ${guest.name}
                         </li>`;
        });
        listHTML += '</ul>';

        matchesList.innerHTML = listHTML;

    } else {
        document.getElementById('error').innerHTML = '<p>❌ **No match found.** Keep typing or check spelling.</p>';
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