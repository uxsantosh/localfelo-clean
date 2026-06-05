/**
 * Helper utility to dynamically update high-fidelity SEO meta tags, canonical links,
 * and Schema.org structured data (JSON-LD) for flawless indexing by Googlebot.
 */
export function updatePageSEO(options: {
  title: string;
  description: string;
  path: string;
  schema?: Record<string, any>;
}) {
  const { title, description, path, schema } = options;

  // 1. Update Document Title
  document.title = title;

  // 2. Helper to set or create meta tags
  const setMetaTag = (nameOrProperty: string, content: string, isProperty = false) => {
    const attribute = isProperty ? "property" : "name";
    let element = document.querySelector(`meta[${attribute}="${nameOrProperty}"]`);
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute(attribute, nameOrProperty);
      document.head.appendChild(element);
    }
    element.setAttribute("content", content);
  };

  // 3. Update standard tags
  setMetaTag("description", description);
  setMetaTag("keywords", "hyperlocal task marketplace, local helpers, earn money, LocalFelo, local community, find chore assistant");
  setMetaTag("robots", "index, follow");

  // 4. Update Open Graph tags
  const absoluteUrl = `https://localfelo.com${path}`;
  setMetaTag("og:title", title, true);
  setMetaTag("og:description", description, true);
  setMetaTag("og:url", absoluteUrl, true);
  setMetaTag("og:type", "website", true);

  // 5. Update Twitter tags
  setMetaTag("twitter:title", title);
  setMetaTag("twitter:description", description);

  // 6. Update Canonical Link tag
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement("link");
    canonicalLink.setAttribute("rel", "canonical");
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute("href", absoluteUrl);

  // 7. Inject/Update Schema.org JSON-LD script block
  const schemaId = "localfelo-schema-seo-ld";
  let schemaScript = document.getElementById(schemaId);
  if (schemaScript) {
    schemaScript.remove();
  }

  if (schema) {
    schemaScript = document.createElement("script");
    schemaScript.setAttribute("id", schemaId);
    schemaScript.setAttribute("type", "application/ld+json");
    schemaScript.textContent = JSON.stringify(schema);
    document.head.appendChild(schemaScript);
  }
}
