# SipMap

A simple, beautiful map of drinking water points around you, straight from OpenStreetMap. Built for hikers, trail runners, runners and cyclists. No account, no tracking, no clutter.

Une carte simple et belle des points d'eau potable OpenStreetMap autour de soi, pour les randonneurs, traileurs, coureurs et cyclistes. Pas de compte, pas d'itinéraire : la carte, ta position, les points les plus proches.

## Comment ça marche

1. Chaque lundi (et à chaque push), l'Action GitHub télécharge les extraits OpenStreetMap de [Geofabrik](https://download.geofabrik.de) listés dans `REGIONS`.
2. `osmium` ne garde que les points d'eau potable ; `scripts/points.py` les range en petites cellules de 1° × 1° (`site/data/c/<lat>_<lon>.json`).
3. Le site statique (`site/`) est publié sur GitHub Pages. Le navigateur ne charge que les cellules visibles.

Points affichés, tels qu'OSM les déclare :

- `amenity=drinking_water`, `amenity=water_point`
- tout objet avec `drinking_water=yes` ou `treated` (fontaine, robinet, source, toilettes…)
- exclus : `drinking_water=no`, `access=private` ou `no`

## Mise en route

1. Dans **Settings → Pages**, choisir **Source : GitHub Actions**.
2. Lancer l'Action **Construire et publier la carte** (onglet Actions → Run workflow), ou pousser sur `main`.
3. La carte est en ligne sur `https://<compte>.github.io/<repo>/`.

Pour couvrir d'autres pays, ajouter leurs chemins Geofabrik dans `REGIONS` (`.github/workflows/deploy.yml`), par exemple `europe/italy`. Le monde entier demandera de traiter le fichier planète sur une machine plus grosse qu'un runner GitHub gratuit.

## En local

```bash
sudo apt-get install osmium-tool
REGIONS=europe/spain bash scripts/build_data.sh
python3 -m http.server -d site 8000
# puis http://localhost:8000
```

## Crédits et licence des données

- Données © [contributeurs OpenStreetMap](https://www.openstreetmap.org/copyright), licence ODbL. Les fichiers `site/data/` sont une base dérivée, sous ODbL.
- Fond de carte [OpenFreeMap](https://openfreemap.org), rendu avec [MapLibre GL JS](https://maplibre.org).
