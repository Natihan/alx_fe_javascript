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
    // Map server quotes to match local structure
    const formattedServerQuotes = serverQuotes.map(q => ({
        id: q.id, // Assuming ID from the server
        text: q.title, // Using title as the quote text
        category: 'General' // Assign a default category
    }));

    // Simple conflict resolution: server data takes precedence
    const serverQuoteIds = new Set(formattedServerQuotes.map(q => q.id));

    // Update local quotes with server quotes
    formattedServerQuotes.forEach(serverQuote => {
        const localQuoteIndex = quotes.findIndex(q => q.id === serverQuote.id);
        if (localQuoteIndex >= 0) {
            // If it exists locally, replace it
            quotes[localQuoteIndex] = serverQuote;
        } else {
            // If it's new, add it
            quotes.push(serverQuote);
        }
    });

    // Remove local quotes that are not present on the server
    quotes = quotes.filter(q => serverQuoteIds.has(q.id));

    // Save updated quotes to local storage
    saveQuotes();
    alert("Quotes have been synced with the server.");
}

// Sync 
