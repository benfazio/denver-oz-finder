"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DENVER_OZ_TRACTS, type OZTract } from "../data/denver-oz-tracts";

interface OZMapProps {
  onTractSelect?: (tract: OZTract) => void;
  selectedTract?: OZTract | null;
  searchMarker?: { lat: number; lng: number; label: string } | null;
}

// Meyers Roman palette
const COUNTY_COLORS: Record<string, { color: string; fill: string }> = {
  Denver: { color: "#1F223F", fill: "#26328C" },
  Adams: { color: "#2F335F", fill: "#3452FF" },
  Arapahoe: { color: "#059669", fill: "#2AC4EA" },
  Jefferson: { color: "#d97706", fill: "#FF1053" },
};

export default function OZMap({ onTractSelect, selectedTract, searchMarker }: OZMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<L.GeoJSON[]>([]);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [39.7392, -104.9903],
      zoom: 11,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    DENVER_OZ_TRACTS.forEach((tract) => {
      const colors = COUNTY_COLORS[tract.county] || { color: "#6b7280", fill: "#9ca3af" };

      const geoJsonLayer = L.geoJSON(tract.geometry as GeoJSON.GeoJsonObject, {
        style: {
          color: colors.color,
          fillColor: colors.fill,
          fillOpacity: 0.25,
          weight: 2,
        },
      }).addTo(map);

      geoJsonLayer.bindPopup(`
        <div style="font-family: system-ui; min-width: 220px;">
          <h3 style="margin: 0 0 8px; font-size: 14px; font-weight: 600;">${tract.name}</h3>
          <p style="margin: 3px 0; font-size: 12px; color: #374151;"><b>Census Tract:</b> ${tract.tractId}</p>
          <p style="margin: 3px 0; font-size: 12px; color: #374151;"><b>County:</b> ${tract.county}</p>
          <p style="margin: 3px 0; font-size: 12px; color: #374151;"><b>Status:</b> ${tract.designation}</p>
          <p style="margin: 8px 0 0; font-size: 11px; color: #6b7280;">Source: US Treasury CDFI Fund</p>
        </div>
      `);

      geoJsonLayer.on("click", () => onTractSelect?.(tract));
      layersRef.current.push(geoJsonLayer);
    });

    // Legend
    const legend = new L.Control({ position: "bottomright" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "");
      div.style.cssText = "background:white;padding:12px 14px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.12);font-size:12px;line-height:1.6;";
      div.innerHTML = `
        <p style="margin:0 0 6px;font-weight:700;font-size:13px;">Opportunity Zones</p>
        <p style="margin:2px 0;"><span style="display:inline-block;width:14px;height:14px;background:${COUNTY_COLORS.Denver.fill};border:2px solid ${COUNTY_COLORS.Denver.color};vertical-align:middle;margin-right:6px;border-radius:3px;"></span>Denver (10)</p>
        <p style="margin:2px 0;"><span style="display:inline-block;width:14px;height:14px;background:${COUNTY_COLORS.Adams.fill};border:2px solid ${COUNTY_COLORS.Adams.color};vertical-align:middle;margin-right:6px;border-radius:3px;"></span>Adams (9)</p>
        <p style="margin:2px 0;"><span style="display:inline-block;width:14px;height:14px;background:${COUNTY_COLORS.Arapahoe.fill};border:2px solid ${COUNTY_COLORS.Arapahoe.color};vertical-align:middle;margin-right:6px;border-radius:3px;"></span>Arapahoe (9)</p>
        <p style="margin:2px 0;"><span style="display:inline-block;width:14px;height:14px;background:${COUNTY_COLORS.Jefferson.fill};border:2px solid ${COUNTY_COLORS.Jefferson.color};vertical-align:middle;margin-right:6px;border-radius:3px;"></span>Jefferson (5)</p>
        <p style="margin:6px 0 0;font-size:10px;color:#9ca3af;">Source: US Treasury CDFI Fund</p>
      `;
      return div;
    };
    legend.addTo(map);

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      layersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    if (searchMarker) {
      const icon = L.divIcon({
        html: `<div style="background:#ef4444;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        className: "",
      });
      markerRef.current = L.marker([searchMarker.lat, searchMarker.lng], { icon })
        .addTo(mapRef.current)
        .bindPopup(searchMarker.label)
        .openPopup();
      mapRef.current.setView([searchMarker.lat, searchMarker.lng], 14);
    }
  }, [searchMarker]);

  useEffect(() => {
    layersRef.current.forEach((layer, index) => {
      const tract = DENVER_OZ_TRACTS[index];
      const isSelected = selectedTract?.tractId === tract.tractId;
      const colors = COUNTY_COLORS[tract.county] || { color: "#6b7280", fill: "#9ca3af" };
      layer.setStyle({
        weight: isSelected ? 4 : 2,
        fillOpacity: isSelected ? 0.45 : 0.25,
        color: isSelected ? "#1e40af" : colors.color,
      });
      if (isSelected) layer.bringToFront();
    });
  }, [selectedTract]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full rounded-xl overflow-hidden shadow-sm border border-gray-200"
      style={{ minHeight: "400px" }}
    />
  );
}
