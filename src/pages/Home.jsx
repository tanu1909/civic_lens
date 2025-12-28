import React from 'react'


const Home = () => {
  return (
    <div className="flex w-full h-screen">
      
      {/* Left Div - Blue */}
      <div className="flex-1 bg-blue-600 flex items-center justify-center text-white">
        <h2 className="text-3xl font-bold">Civic Data</h2>
      </div>

      {/* Right Div - Green */}
      <div className="flex-1 bg-emerald-600 flex items-center justify-center text-white">
        <h2 className="text-3xl font-bold">Map</h2>
      </div>

    </div>
  )
}

export default Home