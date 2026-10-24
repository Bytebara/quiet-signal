// Rewrites root-relative links in Markdown ("/soc-lab/") to include the site base
// ("/quiet-signal/soc-lab/"), so content files can use simple paths.
// External links get rel="noopener noreferrer" so no referrer leaves the site.

export function rehypeBaseLinks(base = '/') {
  const prefix = base.replace(/\/$/, '');
  return () => (tree) => {
    const walk = (node) => {
      if (node.type === 'element' && node.tagName === 'a' && node.properties) {
        const href = node.properties.href;
        if (typeof href === 'string') {
          if (href.startsWith('/') && !href.startsWith('//')) {
            node.properties.href = `${prefix}${href}`;
          } else if (/^https?:\/\//i.test(href)) {
            node.properties.rel = ['noopener', 'noreferrer'];
          }
        }
      }
      if (Array.isArray(node.children)) node.children.forEach(walk);
    };
    walk(tree);
  };
}
