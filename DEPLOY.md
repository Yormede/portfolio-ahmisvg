# Deploiement portfolio-ahmisvg - ETAT FINAL (2026-10-20)

## Cible (verifiee en direct)
- **CT104** (192.168.68.110 / Tailscale 100.70.154.84) : pas de Narbonne Conciergerie ici.
- Ecartes : CT100 docker-perso (heberge Narbonne Conciergerie/Immeuble), CT102/103 (Time Manager ecole, intouchables).

## Installe sur CT104
- /opt/portfolio/index.html + /opt/portfolio/docker-compose.yml
- docker compose up -d -> portfolio-ahmisvg (nginx:alpine, unless-stopped)
- Verifie : curl http://127.0.0.1:8091/ -> **200**

## Reste : 1 regle ingress Cloudflare (tableau de bord, 30 s)
- Tunnel existant Nginx, connecteur OK. Ajouter :
- portfolio.yormede.fr -> http://192.168.68.110:8091
- DNS portfolio.yormede.fr existe deja (proxied). Sans cette regle : 404 Cloudflare.
- Verification : curl -I https://portfolio.yormede.fr/ doit donner **200**.

## Acces serveurs (valide ce jour)
- Proxmox : ssh -p 1234 root@100.67.218.83 (cle ~/.ssh/id_ed25519)
- CT104 : ssh root@100.70.154.84 (meme cle)
- docker-perso (.204) : SSH direct depuis Windows KO, OK via CT104 en rebond. pct exec 100 depuis Proxmox sinon.
