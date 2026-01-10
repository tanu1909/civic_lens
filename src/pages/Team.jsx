import React from 'react';
import { Linkedin, User } from 'lucide-react';

const Team = () => {
  const teammates = [
    { name: "Tanu Choudhary", linkedin: "https://www.linkedin.com/in/tanu-choudhary-6a0974331" },
    { name: "Anshika Yadav", linkedin: "https://www.linkedin.com/in/anshika-yadav-65051431b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
    { name: "Apoorva Gupta", linkedin: "https://www.linkedin.com/in/apoorva-gupta-55463a331?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
    { name: "Shivangi Singh", linkedin: "https://www.linkedin.com/in/shivangi-singh-574b89331?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
  ];

  return (
    <div className="min-h-[80vh] py-12 px-4 bg-slate-50">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-slate-900 mb-4">Meet Our Team</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-12">The minds behind Civic Lens</p>
        
        {/* Changed grid-cols to 2 for the 2x2 layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {teammates.map((member, index) => (
            <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-100 hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={40} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{member.name}</h3>
              <a 
                href={member.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#0077B5] hover:opacity-80 font-medium transition-opacity"
              >
                {/* Custom styling to make the Lucide icon look like the official LinkedIn logo */}
                <div className="bg-[#0077B5] p-0.5 rounded-[2px]">
                  <Linkedin size={16} className="text-white fill-white" />
                </div>
                LinkedIn
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Team;