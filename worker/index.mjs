const cookieName = '__Host-cecop-oauth';
const cookieOptions = '; Path=/; HttpOnly; Secure; SameSite=Lax';
const clearCookie = cookieName + '=; Max-Age=0' + cookieOptions;
const encode = bytes => btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
const random = () => encode(crypto.getRandomValues(new Uint8Array(32)));
const headers = { 'Cache-Control':'no-store', 'Referrer-Policy':'no-referrer', 'X-Content-Type-Options':'nosniff' };
const fail = (message,status=400) => new Response(message,{status,headers:{...headers,'Set-Cookie':clearCookie}});
export default {
 async fetch(request,env) {
  const url=new URL(request.url);
  if(!['/api/auth','/api/callback'].includes(url.pathname))return env.ASSETS.fetch(request);
  if(request.method!=='GET')return fail('Método não permitido.',405);
  if(!env.GITHUB_CLIENT_ID||!env.GITHUB_CLIENT_SECRET||!env.SITE_ORIGIN)return fail('Autenticação ainda não configurada.',503);
  const origin=env.SITE_ORIGIN;
  if(url.origin!==origin)return fail('Origem não permitida.',403);
  const redirect=origin+'/api/callback';
  if(url.pathname==='/api/auth') {
   if(url.searchParams.has('provider')&&url.searchParams.get('provider')!=='github')return fail('Provedor não permitido.');
   const state=random(),verifier=random();
   const challenge=encode(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))));
   const target=new URL('https://github.com/login/oauth/authorize');
   target.search=new URLSearchParams({client_id:env.GITHUB_CLIENT_ID,redirect_uri:redirect,scope:'public_repo',state,code_challenge:challenge,code_challenge_method:'S256'}).toString();
   return new Response(null,{status:302,headers:{...headers,Location:target.href,'Set-Cookie':`${cookieName}=${state}.${verifier}; Max-Age=600${cookieOptions}`}});
  }
  const session=(request.headers.get('Cookie')||'').split(';').map(c=>c.trim()).find(c=>c.startsWith(cookieName+'='))?.slice(cookieName.length+1);
  const [state,verifier]=session?.split('.')||[];
  if(!state||!verifier||state!==url.searchParams.get('state'))return fail('Sessão inválida ou expirada. Inicie o login novamente.');
  if(url.searchParams.has('error')||!url.searchParams.get('code'))return fail('Autorização não concluída. Inicie o login novamente.');
  try {
   const response=await fetch('https://github.com/login/oauth/access_token',{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify({client_id:env.GITHUB_CLIENT_ID,client_secret:env.GITHUB_CLIENT_SECRET,code:url.searchParams.get('code'),redirect_uri:redirect,code_verifier:verifier})});
   const data=await response.json();
   if(!response.ok||!data.access_token)return fail('Não foi possível concluir a autenticação.',502);
   const permission=await fetch('https://api.github.com/repos/rolpho-design/CECOP',{headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${data.access_token}`,'User-Agent':'CECOP-CMS','X-GitHub-Api-Version':'2022-11-28'}});
   if(!permission.ok||!(await permission.json()).permissions?.push)return fail('Sua conta precisa de permissão de escrita no repositório CECOP.',403);
   const nonce=random();
   const payload=JSON.stringify('authorization:github:success:'+JSON.stringify({token:data.access_token,provider:'github'})).replaceAll('<','\\u003c');
   const body=`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Login CECOP</title><p>Concluindo login…</p><script nonce="${nonce}">const origin=${JSON.stringify(origin)};const receive=(event)=>{if(event.origin!==origin||event.source!==window.opener||event.data!=='authorizing:github')return;window.removeEventListener('message',receive);window.opener.postMessage(${payload},origin);window.close();};window.addEventListener('message',receive);if(window.opener)window.opener.postMessage('authorizing:github',origin);</script></html>`;
   return new Response(body,{headers:{...headers,'Content-Type':'text/html; charset=utf-8','Set-Cookie':clearCookie,'Content-Security-Policy':`default-src 'none'; script-src 'nonce-${nonce}'; base-uri 'none'; frame-ancestors 'none'`}});
  } catch {return fail('Serviço de autenticação indisponível. Tente novamente.',502);}
 }
};
