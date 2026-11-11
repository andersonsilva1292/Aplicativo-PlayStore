# Guia Completo: Publicando o Anderson Academy na Google Play Store

Este aplicativo já foi preparado com todos os padrões modernos de **PWA (Progressive Web App)** e **TWA (Trusted Web Activity)** exigidos pelo Google.

Existem duas formas recomendadas pelo Google para empacotar este site como aplicativo Android (`.aab` / `.apk`) para a Play Store:

---

## Método 1: PWABuilder (Recomendado pelo Google e Mais Fácil)

O **PWABuilder** (criado pela Microsoft em parceria com o Google) converte o seu PWA em um pacote Android oficial (`.aab` - Android App Bundle) sem necessidade de instalar o Android Studio.

### Vantagens do método TWA / PWABuilder:
- **Atualizações automáticas**: Sempre que você fizer alterações no site, o aplicativo dos usuários se atualiza automaticamente sem precisar passar por nova revisão na Play Store.
- **Tamanho ultra leve**: O app pesa menos de 3 MB.
- **Visual nativo**: Executa em tela cheia, sem barra de navegação de navegador.
- **Totalmente compatível**: Aceito oficialmente na Google Play Store.

### Passo a Passo:

1. **Publique o site na internet**:
   - Garanta que seu domínio (ex: `https://estudosimuladorctfl.lovable.app` ou seu domínio próprio) esteja ativo e com HTTPS.

2. **Acesse o PWABuilder**:
   - Entre em [pwabuilder.com](https://www.pwabuilder.com).
   - Digite a URL do seu site e clique em **Start**.
   - O PWABuilder vai validar o `manifest.webmanifest`, os ícones (`192x192` e `512x512`) e o Service Worker (`sw.js`) que já configuramos. A pontuação será verde (PWA Store Ready).

3. **Gerar o Pacote Android**:
   - Clique em **Package For Stores** → escolha **Google Play**.
   - Preencha as informações:
     - **Package ID**: `com.andersonacademy.ctfl` (ou outro identificador reverso da sua preferência).
     - **App Name**: `Anderson Academy`
     - **Launcher Name**: `Anderson QA`
     - **Version Code**: `1` (a cada atualização futura na loja, aumente para 2, 3...)
     - **Signing Key**: Escolha gerar uma nova chave ("Generate New Key") ou use uma existente. **Guarde o arquivo `.keystore` e as senhas geradas em local seguro!**

4. **Baixe o pacote**:
   - Baixe o arquivo `.zip` gerado. Dentro dele você terá o arquivo `app-release.aab` pronto para envio à Google Play Console.

5. **Configurar o Digital Asset Links (Remover a barra de URL)**:
   - No pacote baixado do PWABuilder, haverá o seu hash `SHA-256 Fingerprint`.
   - Abra o arquivo `public/.well-known/assetlinks.json` neste projeto e substitua o campo `sha256_cert_fingerprints` pelo hash real gerado.
   - Isso garante que o Android reconheça que o app é dono do domínio e oculte 100% da barra do navegador.

---

## Método 2: Capacitor (Ionic)

Caso prefira compilar nativamente via Android Studio:

1. Instale o Capacitor:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap init "Anderson Academy" "com.andersonacademy.ctfl" --web-dir dist
   ```
2. Adicione a plataforma Android:
   ```bash
   npx cap add android
   ```
3. Construa os arquivos estáticos e sincronize:
   ```bash
   npm run build
   npx cap sync
   ```
4. Abra no Android Studio para gerar o bundle assinado:
   ```bash
   npx cap open android
   ```
   No Android Studio: **Build** → **Generate Signed Bundle / APK** → **Android App Bundle (.aab)**.

---

## Publicando no Google Play Console

1. **Conta de Desenvolvedor Google Play**:
   - Crie ou acesse sua conta no [Google Play Console](https://play.google.com/console) (taxa única do Google de US$ 25).
2. **Criar Novo App**:
   - Nome: *Anderson Academy — Simulador CTFL & Automação*
   - Idioma padrão: Português (Brasil)
   - Tipo: Aplicativo gratuito ou pago
3. **Ficha da Loja (Store Listing)**:
   - Descrição breve e completa.
   - Ícone da loja (512x512 PNG).
   - Imagem de recurso (1024x500 PNG).
   - Capturas de tela (pelo menos 2 para celular e tablet).
4. **Questionário de Conteúdo e Privacidade**:
   - Categoria: Educação.
   - URL da política de privacidade (o app já possui a modal e termos).
5. **Lançamento**:
   - Vá em **Produção** (ou Teste Aberto/Fechado) → Criar nova versão.
   - Faça upload do arquivo `.aab`.
   - Envie para revisão da equipe da Google Play!
