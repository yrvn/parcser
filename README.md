## Features

-   **Dynamic URL Resolution**: Starts with just the base game ID (e.g., `359871`) and automatically discovers the full canonical URL (e.g., `.../359871/arcs`).
-   **Batch Processing**: Accepts an array of game IDs to scrape multiple games in a single run.
-   **Structured Output**: Outputs the collected data in a clean, easy-to-use JSON format.
-   **Responsible Scraping**: Processes games sequentially to avoid sending too many concurrent requests to the BGG server.

## Prerequisites

Before you begin, ensure you have the following installed on your system:
-   [Node.js](https://nodejs.org/) (v18.x or later recommended)
-   npm (comes bundled with Node.js)

## Installation

1.  **Clone the repository** or download the files into a new project folder.
    ```bash
    git clone <your-repository-url>
    cd parcser
    ```    (If you downloaded the file directly, just navigate to that folder).

2.  **Install the dependencies.** The only required dependency is Puppeteer.
    ```bash
    npm install
    ```
    *Note: This command will download a compatible version of the Chromium browser, so the initial installation may take a few moments.*

## Usage

1.  **Edit the Game List**: Open the `scraper.js` file and modify the `gameIds` array to include the BGG IDs of the games you wish to scrape.

    ```javascript
    // --- INPUT: Add game IDs to this array ---
    const gameIds = ['359871', '174430', '161936']; 
    ```

2.  **Run the script** from your terminal:
    ```bash
    node scraper.js
    ```

The script will launch a headless browser, navigate to each game's page, extract the data, and print the final results to the console.
