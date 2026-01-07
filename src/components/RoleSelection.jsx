import { useNavigate } from 'react-router-dom';

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleChoice = (role) => {
    //  redirects the user and carries the 'role' data with them
    navigate('/auth', { state: { selectedRole: role } });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <h2 className="text-3xl font-bold italic font-['Merriweather'] text-gray-800 mb-2 text-center">
        Welcome to CivicLens
      </h2>
      <p className="text-gray-500 mb-10 text-center">Please select your portal to continue</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <button 
          onClick={() => handleRoleChoice('citizen')}
          className="flex flex-col items-center p-8 border-2 border-blue-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
        >
          <span className="text-4xl mb-4 text-blue-600 group-hover:scale-110 transition-transform">🏘️</span>
          <span className="text-xl font-semibold">Citizen</span>
          <p className="text-sm text-gray-500 mt-2 text-center">Report issues and track community progress.</p>
        </button>
        
        <button 
          onClick={() => handleRoleChoice('official')}
          className="flex flex-col items-center p-8 border-2 border-emerald-100 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
        >
          <span className="text-4xl mb-4 text-emerald-600 group-hover:scale-110 transition-transform">🏛️</span>
          <span className="text-xl font-semibold">Government Official</span>
          <p className="text-sm text-gray-500 mt-2 text-center">Manage reports and update resolution status.</p>
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;