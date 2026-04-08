"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DENVER_OZ_TRACTS, type OZTract } from "../data/denver-oz-tracts";

interface OZMapProps {
  onTractSelect?: (tract: OZTract) => void;
  selectedTract?: OZTract | null;
  searchMarker?: { lat: number; lng: number; label: string } | null;
}

export default function OZMap({ onTractSelect, selectedTract, searchMarker }: OZMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const polygonsRef = useRef<L.Polygon[]>([]);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map centered on Denver
    const map = L.map(mapContainerRef.current, {
      center: [39.7392, -104.9903],
      zoom: 11,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Draw OZ tract polygons
    DENVER_OZ_TRACTS.forEach((tract) => {
      const polygon = L.polygon(
        tract.coordinates.map(([lat, lng]) => [lat, lng] as L.LatLngExpression),
        {
          color: tract.designation === "Contiguous Tract" ? "#f59e0b" : "#3b82f6",
          fillColor: tract.designation === "Contiguous Tract" ? "#fbbf24" : "#60a5fa",
          fillOpacity: 0.35,
          weight: 2,
        }
      ).addTo(map);

      polygon.bindPopup(`
        <div style="font-family: system-ui; min-width: 200px;">
          <h3 style="margin: 0 0 8px; font-size: 14px; font-weight: 600;">${tract.name}</h3>
          <p style="margin: 2px 0; font-size: 12px;"><b>Tract:</b> ${tract.tractId}</p>
          <p style="margin: 2px 0; font-size: 12px;"><b>County:</b> ${tract.county}</p>
          <p style="margin: 2px 0; font-size: 12px;"><b>Type:</b> ${tract.designation}</p>
          ${tract.medianIncome ? `<p style="margin: 2px 0; font-size: 12px;"><b>Median Income:</b> $${tract.medianIncome.toLocaleString()}</p>` : ""}
          ${tract.povertyRate ? `<p style="margin: 2px 0; font-size: 12px;"><b>Poverty Rate:</b> ${tract.povertyRate}%</p>` : ""}
        </div>
      `);

      polygon.on("click", () => {
        onTractSelect?.(tract);
      });

      polygonsRef.current.push(polygon);
    });

    // Add legend
    const legend = new L.Control({ position: "bottomright" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "");
      div.style.cssText = "background: white; padding: 10px; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.15); font-size: 12px;";
      div.innerHTML = `
        <p style="margin: 0 0 6px; font-weight: 600;">Opportunity Zones</p>
        <p style="margin: 2px 0;"><span style="display: inline-block; width: 14px; height: 14px; background: #60a5fa; vertical-align: middle; margin-right: 6px; border-radius: 2px;"></span>Low-Income Community</p>
        <p style="margin: 2px 0;"><span style="display: inline-block; width: 14px; height: 14px; background: #fbbf24; vertical-align: middle; margin-right: 6px; border-radius: 2px;"></span>Contiguous Tract</p>
      `;
      return div;
    };
    legend.addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      polygonsRef.current = [];
    };
  }, []);

  // Handle search marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    if (searchMarker) {
      const icon = L.divIcon({
        html: `<div style="background: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        className: "",
      });

      markerRef.current = L.marker([searchMarker.lat, searchMarker.lng], { icon })
        .addTo(mapRef.current)
        .bindPopup(searchMarker.label)
        .openPopup();

      mapRef.current.setView([searchMarker.lat, searchMarker.lng], 14);
    }
  }, [searchMarker]);

  // Highlight selected tract
  useEffect(() => {
    polygonsRef.current.forEach((polygon, index) => {
      const tract = DENVER_OZ_TRACTS[index];
      const isSelected = selectedTract?.tractId === tract.tractId;
      polygon.setStyle({
        weight: isSelected ? 4 : 2,
        fillOpacity: isSelected ? 0.55 : 0.35,
        color: isSelected
          ? "#1d4ed8"
          : tract.designation === "Contiguous Tract"
            ? "#f59e0b"
            : "#3b82f6",
      });
    });
  }, [selectedTract]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full rounded-lg overflow-hidden"
      style={{ minHeight: "400px" }}
    />
  );
}
