// final-scraper-multiple.js
// Scrapes key statistics for a list of BoardGameGeek game IDs.

const puppeteer = require("puppeteer");

/**
 * Cleans a string to extract a numerical value.
 * @param {string} text - The text to clean.
 * @returns {string} The cleaned number as a string.
 */
const cleanNumber = (text) => {
  if (!text) return "Not found";
  return text.replace(/,/g, "").trim();
};

/**
 * Scrapes the data for a single board game ID.
 * @param {import('puppeteer').Browser} browser - The shared Puppeteer browser instance.
 * @param {string} gameId - The BoardGameGeek ID of the game.
 * @returns {Promise<object>} A promise that resolves to an object with the scraped data.
 */
async function scrapeGameData(browser, gameId) {
  const baseIdUrl = `https://boardgamegeek.com/boardgame/${gameId}`;
  let page; // Define page here to access it in the finally block

  console.log(`\nProcessing ID: ${gameId}...`);

  try {
    page = await browser.newPage();
    await page.setDefaultTimeout(60000);

    await page.goto(baseIdUrl, { waitUntil: "networkidle0" });
    const finalUrl = page.url();
    console.log(`  - Found URL: ${finalUrl}`);

    const gameTitle = await page.$eval("h1 > a", (el) => el.innerText.trim());

    const forumUrl = `${finalUrl}/forums/0`;
    const statsUrl = `${finalUrl}/stats`;

    await page.goto(forumUrl, { waitUntil: "networkidle0" });
    const forumSelector = "div.panel-body-toolbar-count strong.ng-binding";
    await page.waitForSelector(forumSelector, { visible: true });
    const forumPostsText = await page.evaluate((selector) => {
      const elements = document.querySelectorAll(selector);
      return elements.length ? elements[elements.length - 1].innerText : null;
    }, forumSelector);

    await page.goto(statsUrl, { waitUntil: "networkidle0" });
    const statsContainerSelector = ".game-stats";
    await page.waitForSelector(statsContainerSelector, { visible: true });
    const statsData = await page.evaluate(() => {
      const stats = {};
      // This function reliably finds a stat value by its title text.
      const findStatByTitle = (title) => {
        const allTitles = document.querySelectorAll(".outline-item-title");
        for (const titleElement of allTitles) {
          if (titleElement.innerText.trim() === title) {
            return titleElement.nextElementSibling.innerText.trim();
          }
        }
        return null;
      };

      stats.allTimePlays = findStatByTitle("All Time Plays");
      stats.prevOwned = findStatByTitle("Prev. Owned");
      return stats;
    });

    return {
      id: gameId,
      title: gameTitle,
      forumPosts: cleanNumber(forumPostsText),
      allTimePlays: cleanNumber(statsData.allTimePlays),
      prevOwned: cleanNumber(statsData.prevOwned),
    };
  } catch (error) {
    console.error(`  - ❌ Error processing ID ${gameId}: ${error.message}`);
    return { id: gameId, error: error.message };
  } finally {
    // Ensure the page is closed to free up resources, even if an error occurred.
    if (page) await page.close();
  }
}

/**
 * Main function to orchestrate the scraping process.
 */
async function main() {
  // --- INPUT: Add any game IDs you want to scrape to this array ---
  const gameIds = ["359871", "174430"]; // Example: Arcs and Gloomhaven

  console.log("🚀 Launching browser...");
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
    ],
  });

  const results = [];
  // Process IDs sequentially to avoid overwhelming the site or running out of memory.
  for (const id of gameIds) {
    const data = await scrapeGameData(browser, id);
    results.push(data);
  }

  await browser.close();

  console.log("\n--- ✅ FINAL RESULTS ---");
  console.log(JSON.stringify(results, null, 2));
  console.log("------------------------\n");
}

main();
