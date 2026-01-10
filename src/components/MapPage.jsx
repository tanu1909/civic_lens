import MapView from "../components/MapView";

const MapPage = () => {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Remove or absolute-position the heading if you want the map to be full-screen */}
      <h1 className="text-xl font-semibold p-4 text-center">Local Issues Map</h1>
      
      <div className="flex-grow w-full">
        <MapView />
      </div>
    </div>
  );
};

export default MapPage;