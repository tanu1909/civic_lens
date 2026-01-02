import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">About CivicLens</h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Empowering communities through transparent data and local engagement.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">Our Mission</h2>
            <p className="text-slate-600 mb-4">
              CivicLens was founded on the belief that informed citizens build stronger neighborhoods. 
              We provide a platform to visualize local data and bridge the gap between residents 
              and community leaders.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">Transparency First</h2>
            <p className="text-slate-600 mb-4">
              Every data point and issue shared on this platform is part of a collective effort 
              to make "Transparent Communities" a reality for 2026 and beyond.
            </p>
          </div>
        </div>

        {/* Placeholder for Team or Core Values */}
        <div className="mt-16 p-8 bg-blue-50 rounded-2xl border border-blue-100">
          <h3 className="text-xl font-bold text-blue-900 mb-2 text-center">Join the Movement</h3>
          <p className="text-blue-800 text-center max-w-lg mx-auto">
            Whether you're looking at "Explore Data" or sharing "Local Issues," 
            your contribution helps make our city more accountable.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;