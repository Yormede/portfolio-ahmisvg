# Déploiement portfolio-ahmisvg (homelab yormede)
État : repo public OK, image à lancer dès que le LXC Docker est redémarré.
Preuve réseau du 20/10 : Proxmox https://100.67.218.83:8006 = 200 en 39ms, Tailscale direct. LXC `docker` et `docker-perso` offline 46-51j.
1. Sur yormede : `docker compose up -d --build` (port 8091)
2. NPM : host `portfolio.yormede.fr` -> `http://<LXC_IP>:8091`, cache assets, forcer SSL
3. Test : `curl -I https://portfolio.yormede.fr` doit donner 200
Secours CT104 (SSH 22 + 8080 ouverts) possible si besoin.
