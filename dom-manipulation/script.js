// Array to hold quote objects
let quotes = [];

// Server endpoint simulation
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Mock API for quotes

// Load quotes from local storage
function loadQuotes() {
    const storedQuotes = localStorage.getItem("quotes");
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
}

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Fetch quotes from the server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(SERVER_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        const serverQuotes = await response.json();
        handleServerQuotes(serverQuotes);
    } catch (error) {
        console.error('Error fetching quotes:', error);
    }
}

// Handle incoming quotes from the server
function handleServerQuotes(serverQuotes) {
    const formattedServerQuotes = serverQuotes.map(q => ({
        id: q.id,
        text: q.title, // Using title as the quote text
        category: 'General' // Assign a default category
    }));

    const serverQuoteIds = new Set(formattedServerQuotes.map(q => q.id));

    formattedServerQuotes.forEach(serverQuote => {
        const localQuoteIndex = quotes.findIndex(q => q.id === serverQuote.id);
        if (localQuoteIndex >= 0) {
            quotes[localQuoteIndex] = serverQuote;
        } else {
            quotes.push(serverQuote);
        }
    });

    quotes = quotes.filter(q => serverQuoteIds.has(q.id));
    saveQuotes();
    alert("Quotes have been synced with the server."); // Notification
}

// Sync local data with the server periodically
function syncWithServer() {
    setInterval(fetchQuotesFromServer, 10000); // Fetch every 10 seconds
}

// Function to sync local quotes to the server
async function syncQuotes() {
    for (const quote of quotes) {
        try {
            await fetch(SERVER_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(quote)
            });
        } catch (error) {
            console.error('Error syncing quote:', error);
        }
    }
    alert("Quotes synced with server!"); // Notification
}

// Populate categories in the dropdown
function populateCategories() {
    const categoryFilter = document.getElementById("categoryFilter");
    const categories = new Set(quotes.map(quote => quote.category));
    
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category; // Use textContent for safety
        categoryFilter.appendChild(option);
    });

    const lastSelectedCategory = localStorage.getItem("lastSelectedCategory") || "all";
    categoryFilter.value = lastSelectedCategory;
}

// Function to show quotes based on the selected category
function filterQuotes() {
    const selectedCategory = document.getElementById("categoryFilter").value;
    const quoteDisplay = document.getElementById("quoteDisplay");

    const filteredQuotes = selectedCategory === "all" ? quotes : quotes.filter(quote => quote.category === selectedCategory);
    
    if (filteredQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        quoteDisplay.textContent = `"${filteredQuotes[randomIndex].text}" - ${filteredQuotes[randomIndex].category}`; // Use textContent
    } else {
        quoteDisplay.textContent = "No quotes available for this category."; // Use textContent
    }

    localStorage.setItem("lastSelectedCategory", selectedCategory);
}

// Function to show a random quote
function showRandomQuote() {
    const quoteDisplay = document.getElementById("quoteDisplay");
    if (quotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        quoteDisplay.textContent = `"${quotes[randomIndex].text}" - ${quotes[randomIndex].category}`; // Use textContent
    } else {
        quoteDisplay.textContent = "No quotes available. Please add some!"; // Use textContent
    }
}

// Event listener for the button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Function to add a new quote
async function addQuote() {
    const newQuoteText = document.getElementById("newQuoteText").value;
    const newQuoteCategory = document.getElementById("newQuoteCategory").value;

    if (newQuoteText && newQuoteCategory) {
        const newQuote = {
            id: Date.now(), // Generate a unique ID
            title: newQuoteText, // Use title for the mock API
            body: newQuoteText, // Use body for the mock API
            category: newQuoteCategory
        };

        try {
            const response = await fetch(SERVER_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newQuote)
            });

            if (!response.ok) throw new Error('Failed to add quote to server');

            // If successfully added to server, add to local storage
            quotes.push({ id: newQuote.id, text: newQuote.title, category: newQuoteCategory });
            saveQuotes();
            populateCategories(); // Update categories dropdown
            document.getElementById("newQuoteText").value = "";
            document.getElementById("newQuoteCategory").value = "";
            alert("Quote added successfully!");

            // Sync the added quote with the server
            await syncQuotes();
        } catch (error) {
            console.error('Error adding quote:', error);
            alert("Failed to add quote.");
        }
    } else {
        alert("Please enter both quote and category.");
    }
}

// Initialize the application
loadQuotes(); // Load quotes when the page loads
populateCategories(); // Populate categories when the page loads
syncWithServer(); // Start syncing with the server
