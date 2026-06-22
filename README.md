# Rocket Club Tycoon

Prototype web local d'un manager Rocket League inspire par la boucle de progression de *Game Dev Tycoon*.

## Ce qu'il y a deja

- boucle semaine -> preparation -> match -> recompenses
- roster 3v3 avec stats lisibles
- marche avec vrais gros noms + prospects fictifs
- commentaires dynamiques pendant les matchs
- ambience audio tres legere via Web Audio API
- classement saisonnier et progression de phase

## Lancer

Ouvre simplement `index.html` dans le navigateur.

Si tu veux un mini serveur local :

```bash
cd rocket-club-tycoon
python3 -m http.server 4173
```

Puis visite `http://localhost:4173`.

## Suite logique

- vraies fiches joueurs externes en JSON
- contrats, salaires hebdo, remplaçant, coach
- format tournoi plus propre
- vrai systeme de highlights avec cartes d'actions
- sauvegarde locale
