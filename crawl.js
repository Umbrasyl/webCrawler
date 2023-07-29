
function findDomain(url) {
    // Remove the protocol from the url
    url = url.replace(/^https?:\/\//, "");

    // Remove www from the url
    url = url.replace(/^www\./, "");

    // Remove everything after the first forward slash
    url = url.replace(/\/.*$/, "");

    // Return the domain
    return url;
}

export function normalizeUrl(baseUrl="", url) {
    if (url === undefined) {
        return baseUrl;
    }

    url = url.toLowerCase();

    // If the url starts with a forward slash, add the base url to the beginning of the url
    if (url[0] === "/") {
        url = baseUrl + url;
    }

    if (url[url.length - 1] === "/") {
        url = url.slice(0, url.length - 1);
    }

    url = url.replace(/^https?:\/\//, "");
    url = url.replace(/^www\./, "");

    return `http://${url}`;
}

function extractLinksFromHtml(html) {
    const linkRegex = /<a[^>]+href=([\'"])(.*?)\1[^>]*>/g;
    const links = [];
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
        const [_, __, url] = match;
        links.push(url);
    }
    return links;
}

function getUrlsFromHtml(htmlBody, baseUrl) {
    // Get the links from the html body
    const links = extractLinksFromHtml(htmlBody);

    // Create a set to store the urls
    const urls = new Set();

    // Add the base url to the set of urls
    urls.add(baseUrl);

    // Loop through the links
    for (const link of links) {
        // Normalize the link
        const url = normalizeUrl(baseUrl, link);

        // Check if the url is on the same domain as the base url
        if (findDomain(url) !== findDomain(baseUrl)) {
            continue;
        }

        // Add the url to the set of urls
        urls.add(url);
    }

    // Return the list of urls
    return [...urls];
}

function fetchHtmlBody(url) {

    // Fetch the html body from the url
    return fetch(url)
        .then(response => {
            // Check if the url is valid
            if (!response.ok) {
                throw new Error("Invalid url");
            }
            // Check if the response is html
            const contentType = response.headers.get("content-type");
            if (!contentType.includes("text/html")) {
                throw new Error("Not html");
            }
            return response.text();
        });
}

export function crawl(url) {
    // Create a map to store the urls and their counts.
    const urls = new Map();

    // Create a set to store the urls that have been crawled
    const crawledUrls = new Set();

    // Create a function to crawl a url
    function crawlUrl(url) {
        // Check if the url has already been crawled
        if (crawledUrls.has(url)) {
            return;
        }

        // Add the url to the set of crawled urls
        crawledUrls.add(url);

        // Fetch the html body from the url
        return fetchHtmlBody(url)
            .then(htmlBody => {
                // Get the urls from the html body
                const urlsFromHtml = getUrlsFromHtml(htmlBody, url);

                // Add the urls to the map
                for (const url of urlsFromHtml) {
                    if (urls.has(url)) {
                        urls.set(url, urls.get(url) + 1);
                    } else {
                        urls.set(url, 1);
                    }
                }

                // Create an array of promises to crawl the urls
                const promises = [];
                for (const url of urlsFromHtml) {
                    promises.push(crawlUrl(url));
                }

                // Return a promise that resolves when all the urls have been crawled
                return Promise.all(promises);
            });
    }

    return crawlUrl(url)
        .then(() => {
            // Return the map of urls
            return urls;
        }
    );
}

