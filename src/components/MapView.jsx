import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// --- Fix for Leaflet Default Marker Icons ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// --- Helper: Recenter map when reports change ---
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 13);
  }, [center]);
  return null;
};

const MapView = ({ reports = [] }) => {
  // Default Center (e.g., Prayagraj/Allahabad)
  const defaultPosition = [25.4358, 81.8463]; 
  let activeCenter = defaultPosition;
  
  // Try to find the first valid report to center the map on
  const validReport = reports.find(r => {
      let loc = r.location;
      if (typeof loc === 'string') {
          try { 
            // Skip non-JSON strings like "GPS Detected"
            if (!loc.includes('{')) return false;
            loc = JSON.parse(loc); 
          } catch(e){ return false; }
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
      
      <TileLayer 
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {reports.map((report) => {
        try {
          let loc = report.location;
          
          // Parse location safely
          if (typeof loc === 'string') {
             try {
                if (!loc.includes('{')) return null;
                loc = JSON.parse(loc);
             } catch(e) { return null; }
          }
          
          // Only render if we have valid coordinates
          if (loc && loc.lat && loc.lng) {
            return (
              <Marker key={report.id} position={[loc.lat, loc.lng]}>
                <Popup>
                  <div className="min-w-[220px]">
                    <div className="flex justify-between items-start mb-2 border-b pb-2">
                        <h3 className="font-bold text-sm m-0 pr-2">{report.issue}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold text-white ${
                            report.severity >= 7 ? 'bg-red-600' : 'bg-yellow-500'
                        }`}>
                            {report.severity}/10
                        </span>
                    </div>

                    {report.imageUrl && (
                        <img 
                            src={report.imageUrl} 
                            className="w-full h-24 object-cover rounded mb-2 border"
                            alt="Evidence"
                        />
                    )}

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
                        {report.description}
                    </p>
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