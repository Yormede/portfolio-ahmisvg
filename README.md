# portfolio-ahmisvg — Dive to the Thesis
Ile-these immersive : Three.js, exploration a pied (ZQSD/WASD + tactile), 6 pavillons doctorat-ready, 3 serrures, jardin cache (code SHADOW), porte finale, SFX WebAudio sans musique.

## Projets mis en avant
Hackathon Mobilite, Time Manager T-DEV-700, france-student-bridge, ai-service-gateway, deep-researcher, homelab yormede.

## Dev local
Servir en HTTP (modules ES) : `python -m http.server 8092` puis ouvrir http://127.0.0.1:8092.
Captures : `npx playwright screenshot --channel chrome --wait-for-timeout 9000 "http://127.0.0.1:8092/?shot=spawn" shots/spawn.png` (shots : spawn, overview, mobility, time, bridge, gateway, research, homelab, shadow, door + `&locks=N`).

## Prod homelab (CT104)
Voir DEPLOY.md. Image nginx:alpine sur le port 8091. Regle ingress Cloudflare restante : portfolio.yormede.fr -> http://192.168.68.110:8091.
