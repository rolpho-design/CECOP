import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {markActiveNavigation} from '../src/lib/navigation.mjs';
const header=readFileSync(new URL('../src/templates/header.html',import.meta.url),'utf8');
for(const route of ['/','/programacao/','/a-casa/','/como-chegar/','/estudo/'])test(`menu ativo acompanha ${route} no desktop e mobile`,()=>{
 const marked=markActiveNavigation(header,route);
 const links=[...marked.matchAll(/<a\b[^>]*aria-current="page"[^>]*>/g)].map(m=>m[0]);
 assert.equal(links.length,2);
 for(const link of links)assert.ok(link.includes(`href="${route}"`));
});
test('barra final opcional identifica a mesma página',()=>{
 assert.equal(markActiveNavigation(header,'/programacao'),markActiveNavigation(header,'/programacao/'));
});
