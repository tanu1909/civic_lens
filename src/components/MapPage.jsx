import MapView from "../components/MapView";

const MapPage = () => {
  return (
    <div className="w-full h-full flex flex-col">
      
      <h1 className="text-xl font-serif  p-4 text-center">" Your Neighborhood at a Glance "</h1>
      
      <div className="flex-grow w-full">
        <MapView />
      </div>
    </div>
  );
};

export default MapPage;


