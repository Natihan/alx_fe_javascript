// Array to hold quote objects
let quotes = [];

// Server endpoint simulation
const SERVER_URL = "https://example.com/api/quotes"; // Replace with actual mock API if needed

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
    // Simple conflict resolution: server data takes precedence
    const serverQuoteIds = new Set(serverQuotes.map(q => q.id));
    const localQuoteIds = new Set(quotes.map(q => q.id));

    // Update local quotes with server quotes
    serverQuotes.forEach(serverQuote => {
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

// Sync local data with the server periodically
function syncWithServer() {
    setInterval(fetchQuotesFromServer, 10000); // Fetch every 10 seconds
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

// Other functions remain unchanged...

// Initialize the application
loadQuotes(); // Load quotes when the page loads
populateCategories(); // Populate categories when the page loads
syncWithServer(); // Start syncing with the server
