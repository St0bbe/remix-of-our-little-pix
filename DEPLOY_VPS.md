# Deploy em VPS com Nginx

Este projeto e um app Vite/React/TypeScript com PWA gerado no build.

## 1. Instalar dependencias

```bash
npm install
```

## 2. Gerar build de producao

```bash
npm run build
```

Ao terminar, a pasta `dist` deve conter o app, `manifest.webmanifest`, `sw.js` e os arquivos do Workbox.

## 3. Enviar para a VPS

Envie a pasta `dist` para:

```bash
/var/www/remix-of-our-little-pix/dist
```

Exemplo com `rsync`:

```bash
rsync -avz --delete dist/ usuario@SEU_IP:/var/www/remix-of-our-little-pix/dist/
```

## 4. Configurar Nginx

Copie `nginx.conf.example` para um arquivo em `/etc/nginx/sites-available/`, ajustando `server_name` para o seu dominio real.

Exemplo:

```bash
sudo cp nginx.conf.example /etc/nginx/sites-available/remix-of-our-little-pix
sudo ln -s /etc/nginx/sites-available/remix-of-our-little-pix /etc/nginx/sites-enabled/remix-of-our-little-pix
```

O bloco `location /` usa fallback para `index.html`, entao rotas internas do React continuam funcionando ao atualizar a pagina.

## 5. Testar e recarregar Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 6. Instalar HTTPS com Certbot

PWAs instalaveis em Chrome, Android e Desktop precisam de HTTPS em producao.

Em Ubuntu/Debian:

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d dominio.com -d www.dominio.com
```

Depois confirme a renovacao automatica:

```bash
sudo certbot renew --dry-run
```

## Arquivos de icone do PWA

O projeto deve manter estes arquivos em `public`:

- `public/pwa-192x192.png`
- `public/pwa-512x512.png`
- `public/apple-touch-icon.png`
- `public/favicon.ico`

Eles sao copiados para `dist` pelo Vite durante `npm run build`.
