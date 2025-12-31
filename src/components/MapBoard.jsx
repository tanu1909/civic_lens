import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEffect, useState } from 'react';

const MapBoard = () => {
  const [position, setPosition] = useState([25.4920, 81.8639]); // fallback

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          console.log("Location access denied, using default");
        }
      );
    }
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer center={position} zoom={15} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={position}>
          <Popup>You are here 📍</Popup>
        </Marker>

      </MapContainer>
    </div>
  );
};

export default MapBoard;
