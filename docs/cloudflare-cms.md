# Publicação e login do CMS

O Astro continua estático. O Worker atende /api/auth e /api/callback e entrega os arquivos de dist pelo binding ASSETS. O serviço usa OAuth com state e PKCE, cookie HttpOnly por 10 minutos, origem fixa no postMessage e verificação de escrita no repositório antes de entregar o token ao Decap. O escopo public_repo serve ao repositório público atual; esse escopo do GitHub abrange outros repositórios públicos acessíveis pelo usuário, não é restrito apenas ao CECOP. O token é usado pelo Decap no navegador; não é uma sessão exclusivamente no servidor.

## 1. GitHub OAuth App

Em https://github.com/settings/developers → OAuth Apps → New OAuth App:

- Application name: CECOP CMS
- Homepage URL: https://cecop.r-augusto.workers.dev
- Authorization callback URL: https://cecop.r-augusto.workers.dev/api/callback

Anote o Client ID e gere o Client Secret. Nunca inclua credenciais no repositório, no config.yml ou em mensagens.

## 2. Cloudflare Worker cecop

Em Settings → Variables and Secrets, adicione como Secret:

- GITHUB_CLIENT_ID
- GITHUB_CLIENT_SECRET

A variável pública SITE_ORIGIN está em wrangler.jsonc. Confira em Settings → Builds:

- Build command: npm run build
- Deploy command: npx wrangler deploy
- Branch: main

Remova argumentos antigos como `--assets dist` do deploy command; o arquivo wrangler.jsonc já define assets e o script do Worker. Não adicione configuração SPA: as páginas são HTML estático com rotas próprias.

Faça novo deploy depois de configurar as credenciais. O PR precisa estar na branch publicada antes do teste.

## 3. Validar

1. Abra /admin/ e entre com GitHub usando uma conta com escrita em rolpho-design/CECOP.
2. Autorize o aplicativo e confirme que as coleções carregam.
3. Publique uma pequena alteração real e confira o commit na main e o deploy automático na Cloudflare.
4. Uma conta sem escrita deve receber recusa de acesso.

Cada editor precisa da própria conta GitHub e permissão de escrita. Essa solução não implementa login por e-mail/senha independente do GitHub.

O endpoint retorna 503 enquanto faltarem credenciais. Os testes automatizados simulam GitHub; o fluxo real precisa dessa validação após configurar o aplicativo.

Ao migrar para cecop.org.br, atualize SITE_ORIGIN, base_url/site_url/display_url e o callback do aplicativo juntos. O domínio atual permanece sem alteração nesta etapa.

Referências: https://decapcms.org/docs/backends-overview/ ; https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps ; https://developers.cloudflare.com/workers/static-assets/binding/
