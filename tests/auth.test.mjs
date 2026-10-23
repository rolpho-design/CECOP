import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.mjs';
const origin='https://cecop.r-augusto.workers.dev';
const env={SITE_ORIGIN:origin,GITHUB_CLIENT_ID:'test-id',GITHUB_CLIENT_SECRET:'test-secret',ASSETS:{fetch:()=>new Response('static')}};
const request=(path,headers)=>new Request(origin+path,{headers});
test('arquivos estáticos continuam disponíveis sem credenciais',async()=>{
 assert.equal(await (await worker.fetch(request('/admin/'),{ASSETS:env.ASSETS})).text(),'static');
 assert.equal((await worker.fetch(request('/api/auth'),{})).status,503);
});
test('login usa state, PKCE e cookie seguro sem expor secret',async()=>{
 const r=await worker.fetch(request('/api/auth?provider=github'),env);assert.equal(r.status,302);
 const u=new URL(r.headers.get('location'));assert.equal(u.searchParams.get('scope'),'public_repo');assert.equal(u.searchParams.get('code_challenge_method'),'S256');assert.ok(u.searchParams.get('state'));assert.ok(u.searchParams.get('code_challenge'));
 assert.match(r.headers.get('set-cookie'),/HttpOnly; Secure; SameSite=Lax/);assert.ok(!r.headers.get('location').includes('test-secret'));
});
test('callback recusa state incorreto e origem diferente',async()=>{
 assert.equal((await worker.fetch(request('/api/callback?code=x&state=wrong',{Cookie:'__Host-cecop-oauth=correct.verifier'}),env)).status,400);
 assert.equal((await worker.fetch(new Request('https://other.example/api/auth'),env)).status,403);
});
test('callback entrega token somente à janela da origem autorizada e exige escrita',async()=>{
 const old=globalThis.fetch;
 try {
  for(const push of [false,true]) {
   globalThis.fetch=async(url,options)=>{
    if(url.includes('access_token')){assert.equal(JSON.parse(options.body).code_verifier,'verifier');return Response.json({access_token:'fake-token'});}
    return Response.json({permissions:{push}});
   };
   const r=await worker.fetch(request('/api/callback?code=code&state=state',{Cookie:'__Host-cecop-oauth=state.verifier'}),env);
   assert.equal(r.status,push?200:403);const s=await r.text();
   if(push){assert.match(s,/authorization:github:success/);assert.match(s,/event.source!==window.opener/);assert.match(s,/event.origin!==origin/);assert.ok(!s.includes('test-secret'));assert.match(r.headers.get('Content-Security-Policy'),/default-src 'none'/);}
   else assert.ok(!s.includes('fake-token'));
   assert.match(r.headers.get('set-cookie'),/Max-Age=0/);
  }
 }finally{globalThis.fetch=old;}
});
