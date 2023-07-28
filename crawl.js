
export function normalizeUrl(url) {
    // This function will take a url and return a normalized url
    // For example, http://www.example.com/ will be normalized to http://example.com

    // Remove the protocol
    const protocolRegex = /^https?:\/\//;
    const withoutProtocol = url.replace(protocolRegex, "");

    // Remove the www
    const wwwRegex = /^www\./;
    const withoutWww = withoutProtocol.replace(wwwRegex, "");

    // Remove the trailing slash
    const withoutTrailingSlash = withoutWww.replace(/\/$/, "");

    // Add the protocol back
    const normalized = "http://" + withoutTrailingSlash;
    return normalized;
}

export function extractLinksFromHtml(html) {
    const linkRegex = /<a[^>]+href=([\'"])(.*?)\1[^>]*>/g;
    const links = [];
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
        const [_, __, url] = match;
        links.push(url);
    }
    return links;
}

export function getUrlsFromHtml(htmlBody, baseUrl) {
    // This function will take an html body and a base url and return a list of urls
    // that are found in the html body and are on the same domain as the base url
    // The function should also transform relative urls to absolute urls

    // Get the domain from the base url
    const domainRegex = /^https?:\/\/([^\/]+)/;
    const [_, domain] = normalizeUrl(baseUrl).match(domainRegex);

    // Get all the links from the html body
    const links = extractLinksFromHtml(htmlBody);

    // Filter out the links that are not on the same domain as the base url
    const sameDomainLinks = links.filter(link => {
        const normalizedLink = normalizeUrl(link);
        const regexMatch = normalizedLink.match(domainRegex);
        if (regexMatch === null) {
            return true;
        }
        const [_, linkDomain] = normalizedLink.match(domainRegex);
        return linkDomain === domain;
    });

    // Transform the relative urls to absolute urls
    const absoluteLinks = sameDomainLinks.map(link => {
        if (link.slice(0, 4) === "http") {
            return link;
        } else {
            return baseUrl + link;
        }
    });
    return absoluteLinks;
}
