const normalize = path => path.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
export function markActiveNavigation(markup, pathname) {
 const current=normalize(pathname);
 return markup.replace(/<nav\b([^>]*)>([\s\S]*?)<\/nav>/g,(_,attributes,links)=>`<nav${attributes}>${links.replace(/<a\b([^>]*)>/g,(_,attrs)=>{
  attrs=attrs.replace(/\saria-current="[^"]*"/g,'');
  const href=attrs.match(/\bhref="([^"]+)"/)?.[1];
  return `<a${attrs}${href && normalize(href)===current?' aria-current="page"':''}>`;
 })}</nav>`);
}
