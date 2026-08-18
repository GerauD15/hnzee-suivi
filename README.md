# HZNEE Suivi Livraison

Site animé de suivi fictif, prêt pour GitHub et Render.

## Mettre le code sur GitHub

1. Créez un dépôt vide nommé `hznee-suivi`.
2. Décompressez le ZIP.
3. Sur GitHub, choisissez **Add file → Upload files**.
4. Déposez tout le contenu du dossier, y compris `.github`.
5. Validez avec **Commit changes**.

## Activer GitHub Pages

Dans **Settings → Pages → Build and deployment**, sélectionnez **GitHub Actions**.
Le workflow inclus publiera automatiquement le site à chaque modification de la branche `main`.

## Tester sur votre ordinateur

```bash
npm install
npm run dev
```

## Déployer sur Render

- Type : Static Site
- Build Command : `npm install && npm run build`
- Publish Directory : `dist`

La progression est locale à chaque navigateur et commence lors de la première visite.
