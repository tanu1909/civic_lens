import MapPage from '../components/MapPage';

const Home = () => {
  return (
    <div className="flex flex-col h-screen"> {/* h-screen ensures the page fills the viewport */}
      {/* First Div */}
      <div className="p-4 bg-white">
        <h2 className="text-3xl font-bold font-serif text-center text-blue-600">Welcome to Civic Lens!</h2>
      </div>

      {/* Second Div - The Map Container */}
      <div className="flex-grow w-full overflow-hidden">
        <MapPage />
      </div>
    </div>
  );
};

export default Home;