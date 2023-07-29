import { crawl, normalizeUrl } from "./crawl.js";

function main() {

    if (process.argv.length !== 3) {
        console.error("Usage: node main.js <url>");
        process.exit(1);
    }

    const url = process.argv[2];

    console.log("Starting crawl of ", url);

    crawl(normalizeUrl(url))
        .then(urls => {
            urls = new Map([...urls.entries()].sort((a, b) => b[1] - a[1]));

            for (const [url, count] of urls) {
                console.log(`Found ${count} internal links to ${url}`)
            }

        }).catch(error => {
            console.error(error.message);
        });

}

main();