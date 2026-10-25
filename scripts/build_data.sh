#!/usr/bin/env bash
# Construit les données de la carte à partir d'extraits OpenStreetMap (Geofabrik).
#
#   REGIONS="europe/spain europe/france" bash scripts/build_data.sh
#
# Sortie : site/data/index.json + site/data/c/<lat>_<lon>.json (une cellule de 1° par fichier)
set -euo pipefail

REGIONS="${REGIONS:-europe/spain europe/france}"
WORK="${WORK:-build}"
OUT="${OUT:-site/data}"
UA="sipmap-build (+https://github.com/${GITHUB_REPOSITORY:-local})"

mkdir -p "$WORK"
rm -rf "$OUT"
mkdir -p "$OUT"

for region in $REGIONS; do
  name="$(basename "$region")"
  pbf="$WORK/$name.osm.pbf"

  if [ ! -f "$pbf" ]; then
    echo "→ Téléchargement de $region"
    curl -fL --retry 3 -A "$UA" -o "$pbf" "https://download.geofabrik.de/${region}-latest.osm.pbf"
  fi

  echo "→ Filtrage des points d'eau ($name)"
  osmium tags-filter "$pbf" \
    nwr/amenity=drinking_water,water_point \
    nwr/drinking_water=yes,treated \
    -o "$WORK/$name-eau.osm.pbf" --overwrite

  osmium export "$WORK/$name-eau.osm.pbf" \
    -f geojsonseq --add-unique-id=type_id \
    -o "$WORK/$name-eau.geojsonseq" --overwrite
done

echo "→ Découpage en cellules"
python3 scripts/points.py "$OUT" "$WORK"/*-eau.geojsonseq
