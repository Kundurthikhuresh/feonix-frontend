export function sanitizeHTML(html) {
  if (typeof window === 'undefined') return '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Remove tags known to execute scripts or modify styles/metadata
    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'style', 'link', 'meta', 'base'];
    dangerousTags.forEach((tag) => {
      const elements = doc.getElementsByTagName(tag);
      while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
      }
    });

    // Remove inline event handlers (onerror, onload, onclick, etc) and javascript: hrefs
    const allElements = doc.getElementsByTagName('*');
    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i];
      const attributes = Array.from(el.attributes);
      attributes.forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = attr.value.toLowerCase();
        
        if (name.startsWith('on') || value.includes('javascript:')) {
          el.removeAttribute(attr.name);
        }
      });
    }

    return doc.body.innerHTML;
  } catch (err) {
    console.error('HTML Sanitization error:', err);
    return '';
  }
}
