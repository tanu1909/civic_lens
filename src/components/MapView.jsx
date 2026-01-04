import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 13);
  }, [center]);
  return null;
};

const MapView = ({ reports = [] }) => {
  const defaultPosition = [25.4358, 81.8463]; 
  let activeCenter = defaultPosition;
  
  const validReport = reports.find(r => {
      let loc = r.location;
      if (typeof loc === 'string') {
          try { loc = JSON.parse(loc); } catch(e){ return false; }
      }
      return loc && loc.lat && loc.lat !== 0; 
  });

  if (validReport) {
      let loc = validReport.location;
      if (typeof loc === 'string') loc = JSON.parse(loc);
      activeCenter = [loc.lat, loc.lng];
  }

  return (
    <MapContainer
      center={activeCenter}
      zoom={12}
      style={{ height: "400px", width: "100%", borderRadius: "10px", zIndex: 0 }}
    >
      <RecenterMap center={activeCenter} />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {reports.map((report) => {
        try {
          let loc = report.location;
          if (typeof loc === 'string') loc = JSON.parse(loc);
          
          if (loc && loc.lat && loc.lat !== 0) {
            return (
              <Marker key={report.id} position={[loc.lat, loc.lng]}>
                <Popup>
                  {/* --- CUSTOM POPUP WITH DESCRIPTION --- */}
                  <div className="min-w-[220px] max-w-[260px]">
                    
                    {/* 1. Header: Title & Severity */}
                    <div className="flex justify-between items-start mb-2 border-b pb-2">
                        <h3 className="font-bold text-slate-900 text-sm m-0 pr-2 leading-tight">
                            {report.issue}
                        </h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold text-white whitespace-nowrap ${
                            report.severity >= 7 ? 'bg-red-600' : 'bg-yellow-500'
                        }`}>
                            {report.severity}/10
                        </span>
                    </div>

                    {/* 2. Image */}
                    {report.imageUrl && (
                        <img 
                            src={report.imageUrl} 
                            className="w-full h-28 object-cover rounded mb-2 border border-slate-200"
                            alt="Evidence"
                        />
                    )}

                    {/* 3. NEW: AI Description (Truncated to keep popup clean) */}
                    <div className="bg-slate-50 p-2 rounded border border-slate-100 mb-2">
                        <p className="text-[11px] text-slate-700 leading-snug line-clamp-3">
                            {report.description || "No description provided."}
                        </p>
                    </div>

                    {/* 4. Footer: GPS Location */}
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 italic">
                        <span>📍</span>
                        <span className="font-mono">
                           {parseFloat(loc.lat).toFixed(5)}, {parseFloat(loc.lng).toFixed(5)}
                        </span>
                    </div>

                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        } catch(e) { return null; }
      })}
    </MapContainer>
  );
};

export default MapView;