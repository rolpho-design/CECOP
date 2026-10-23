# CECOP — site e administração de conteúdo

Primeira integração das cinco telas do Stitch com Astro e Decap CMS. Código e conteúdo ficam neste repositório; o site público é gerado em HTML estático.

## Estado desta entrega

- Rotas: `/`, `/programacao/`, `/a-casa/`, `/contato-e-localizacao/`, `/estudo/`.
- Layout original preservado em templates, com cabeçalho e rodapé compartilhados.
- Tailwind compilado no build; sem o script de desenvolvimento do CDN.
- Textos/imagens em `src/data/pages/*.json`. Conteúdo do editor é escapado; não há editor de HTML.
- Programação, exceções, avisos, informações da casa e PDFs em arquivos JSON próprios.
- Horários públicos da Home/Programação/rodapé têm uma única fonte. Cancelamento por data e horário especial são calculados no fuso `America/Sao_Paulo`.
- Avisos e próximas ocorrências são atualizados no navegador a cada minuto, sem depender de rebuild para a passagem do tempo. Novas edições ainda exigem um deploy.
- Painel `/admin/` pronto para teste local. **OAuth em produção ainda não configurado.**
- Dados e afirmações importados dos layouts **não foram confirmados pela instituição**. Revisar CEP, endereço, CNPJ, horários, capacidade, transporte, acessibilidade física e orientações antes da publicação.
- Cinco PDFs migrados do site atual e ligados aos cards de Estudos e materiais. Os caminhos antigos em `/wp-content/uploads/2016/01/` foram preservados. Os PDFs originais foram preservados, incluindo as 416 páginas de A Gênese. Consulte `docs/books-sources.json`.
- A configuração de domínio aponta para `cecop.org.br`, mas nenhum DNS ou serviço de hospedagem foi alterado.

## Executar e validar

Node 22.12+ (recomendado Node 24).

```sh
npm ci
npm run dev
```

Em outro terminal, na mesma pasta:

```sh
npm run cms:local
```

Abra `http://localhost:4321/admin/`. O backend local grava os arquivos neste checkout. Faça o teste numa branch; nenhuma credencial GitHub é necessária neste modo. Depois da edição, faça commit normalmente.

```sh
npm test
npm run build
npm run preview
```

## Modelo de conteúdo

| Arquivo | Uso |
| --- | --- |
| `src/data/site.json` | Endereço, contato e identidade institucional |
| `src/data/schedule.json` | Atendimentos recorrentes e exceções por data |
| `src/data/notices.json` | Avisos com início/fim de exibição |
| `src/data/materials.json` | PDFs reais para download |
| `src/data/pages/*.json` | Textos e imagens das cinco telas e elementos globais |
| `src/templates/*.html` | Estrutura visual; edição técnica |
| `tokens.json` | Tokens compartilhados da identidade |

Os campos de texto das telas são referenciados pelo trecho original. São uma primeira extração fiel do HTML; uma próxima rodada pode agrupá-los por seção com rótulos mais curtos após teste com o voluntário. A estrutura e os identificadores ficam fora da edição cotidiana.

## Publicação e autenticação

1. Mesclar o PR após revisão.
2. Conectar este repositório a um host estático: build `npm run build`, saída `dist`, Node 24.
3. Publicar primeiro em endereço de homologação. Configure ali `site_url`, `display_url` e callback OAuth.
4. Definir a experiência de login com a instituição. O backend `github` requer conta GitHub e acesso de escrita dos editores. Não há login independente por e-mail/senha nesta entrega.
5. Provisionar um proxy OAuth compatível com Decap (ou escolher um serviço de autenticação gerenciado). O `base_url`/`auth_endpoint` em `public/admin/config.yml` é o destino planejado; **nenhum endpoint `/api/auth` foi implementado neste projeto estático**.
6. Manter o client secret do OAuth somente no ambiente do serviço de autenticação. Não salvar tokens, chaves ou senhas no repositório.
7. Testar o fluxo editor → commit → build → deploy e o procedimento de falha. O aviso “salvo” do CMS não comprova que a build foi publicada.
8. Só então migrar DNS, preservar e-mails existentes e cadastrar redirecionamentos do WordPress.

Não usa Netlify Git Gateway. GitHub é armazenamento/versionamento; não implica hospedagem GitHub Pages. Nenhum plano pago ou gratuito foi contratado ou presumido elegível.

## Teste de aceite em homologação

- Alterar um texto e verificar a mesma versão publicada.
- Alterar endereço e conferir página, rodapé, copiar endereço e rota externa.
- Cancelar uma quinta-feira e conferir Home e Programação; a semana seguinte volta ao normal.
- Cadastrar horário especial posterior ao habitual e verificar a data correta.
- Cadastrar aviso com validade e conferir passagem da meia-noite brasileira.
- Enviar um PDF e abrir seu download.
- Navegar por teclado, abrir/fechar menu móvel e FAQ; verificar mobile, zoom e leitor de tela.
- Simular conteúdo inválido e falha de build; confirmar que o deploy anterior permanece acessível e que o responsável recebe o alerta do host.

As imagens extraídas estão em `public/uploads`; eventuais URLs externas restantes devem ser revisadas. Fontes e ícones ainda são carregados do Google Fonts. A conformidade WCAG e a fidelidade visual final dependem de revisão manual em homologação.

## Conteúdo confirmado em 22/10/2026

- Quinta-feira: distribuição de fichas das 15h45 às 19h45.
- Próxima Tarde do Pastel: 09/11/2026. O evento é periódico e contribui para a manutenção da casa. Horário e preço da nova edição ficaram opcionais, sem reaproveitar os valores da edição passada.
- A casa não possui telefone nem filiais; os dois avisos aparecem na Home, no contato e no rodapé.
- Menu: Início, Programação, A Casa, Estudos e materiais, Contato e localização.
- `/como-chegar/` redireciona para `/contato-e-localizacao/`. A chave de conteúdo e o script `como-chegar` foram preservados internamente para manter compatibilidade com o CMS.

### Atualizar a Tarde do Pastel

No CMS: Programação e informações → Tarde do Pastel — próxima edição. Edite data, descrição e, quando confirmados, horário/preço. Não há frequência automática presumida. Após a data, a Home mantém o bloco de apoio à casa, mas troca a edição passada por “A próxima data será divulgada em breve”.
