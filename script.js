// --- 1. THE SEATING DATA (UNCHANGED) ---
const seatingChart = [
    { name: "John Doe", table: "1" },
    { name: "Jane Smith", table: "5" },
    { name: "Alice Johnson", table: "2" },
    { name: "Bob Williams", table: "5" },
    { name: "Charlie Brown", table: "3" },
    { name: "Eve Davis", table: "1" },
    { name: "Jon Doh", table: "4" },
    { name: "Johnny Doe", table: "1" },
    { name: "Kearne Permalino", table: "16" }
];

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