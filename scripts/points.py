#!/usr/bin/env python3
"""Transforme l'export GeoJSON d'osmium en petits fichiers lus par la carte.

Usage : python3 scripts/points.py <dossier_sortie> <fichier.geojsonseq> [...]

Règle : afficher fidèlement ce qu'OSM déclare comme eau potable.
  - inclus  : amenity=drinking_water, amenity=water_point, drinking_water=yes|treated sur tout objet
  - exclus  : drinking_water=no, access=private|no

Chaque point devient [lon, lat, type, id_osm, {tags utiles}] et est rangé dans
une cellule de 1° × 1° (fichier c/<lat>_<lon>.json). index.json liste les cellules.
"""
import json
import math
import os
import sys
from datetime import datetime, timezone

KEPT_TAGS = ("name", "seasonal", "fee", "bottle", "opening_hours", "access", "description")


def is_drinking_water(tags):
    dw = tags.get("drinking_water")
    if dw == "no":
        return False
    if tags.get("access") in ("private", "no"):
        return False
    if tags.get("amenity") in ("drinking_water", "water_point"):
        return True
    return dw in ("yes", "treated")


def kind(tags):
    amenity = tags.get("amenity")
    man_made = tags.get("man_made")
    if tags.get("natural") == "spring":
        return "source"
    if man_made == "water_well":
        return "puits"
    if amenity == "toilets":
        return "toilettes"
    if amenity == "water_point" or tags.get("waterway") == "water_point":
        return "remplissage"
    if man_made == "water_tap":
        return "robinet"
    if amenity in ("drinking_water", "fountain") or "fountain" in tags or man_made == "drinking_fountain":
        return "fontaine"
    return "autre"


def coords_of(geometry):
    """Liste aplatie des coordonnées [lon, lat] d'une géométrie GeoJSON."""
    out = []

    def walk(c):
        if c and isinstance(c[0], (int, float)):
            out.append(c)
        else:
            for sub in c:
                walk(sub)

    walk(geometry.get("coordinates", []))
    return out


def representative_point(geometry):
    if geometry.get("type") == "Point":
        return geometry["coordinates"]
    pts = coords_of(geometry)
    if not pts:
        return None
    return [sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts)]


def read_features(path):
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip().lstrip("\x1e").strip()
            if line:
                yield json.loads(line)


def main(out_dir, inputs):
    cells = {}
    seen = set()
    for path in inputs:
        for feat in read_features(path):
            osm_id = feat.get("id")
            if not osm_id or osm_id in seen:
                continue  # les extraits voisins se recouvrent aux frontières
            tags = feat.get("properties") or {}
            if not is_drinking_water(tags):
                continue
            pt = representative_point(feat.get("geometry") or {})
            if not pt:
                continue
            seen.add(osm_id)
            lon, lat = round(pt[0], 6), round(pt[1], 6)
            extra = {k: tags[k] for k in KEPT_TAGS if k in tags}
            key = f"{math.floor(lat)}_{math.floor(lon)}"
            cells.setdefault(key, []).append([lon, lat, kind(tags), osm_id, extra])

    os.makedirs(os.path.join(out_dir, "c"), exist_ok=True)
    for key, points in cells.items():
        with open(os.path.join(out_dir, "c", f"{key}.json"), "w", encoding="utf-8") as f:
            json.dump(points, f, ensure_ascii=False, separators=(",", ":"))

    index = {
        "generated": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "count": len(seen),
        "cells": {k: len(v) for k, v in sorted(cells.items())},
    }
    with open(os.path.join(out_dir, "index.json"), "w", encoding="utf-8") as f:
        json.dump(index, f, separators=(",", ":"))
    print(f"{len(seen)} points d'eau dans {len(cells)} cellules")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2:])
