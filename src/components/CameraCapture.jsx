import React,{useState} from 'react';
import {ImageAnalysis} from '../services/gemini';

const CameraCapture = ({ onClose })=>{
    const[image,setImage]=useState(null);
    const[loading,setLoading]=useState(false);
    const[report,setReport]=useState(null);

    const handleUpload=async(e)=>{
        const file=e.target.files[0];
        if(!file) return;

        setImage(URL.createObjectURL(file));
        setLoading(true);
        setReport(null);
        
        const data=await ImageAnalysis(file);
        console.log("data = ",data);
        setReport(data);
        setLoading(false);
    };

    return(

    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      
      
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-fade-in-up">
        
        
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
        >
          ✕
        </button>

        
        <div className="bg-blue-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            📸 Report Issue
          </h2>
          <p className="text-blue-100 text-xs">AI Safety Scanner</p>
        </div>

     
        <div className="p-6">

          <div className="mb-6">
            
             <label className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex flex-col justify-center items-center cursor-pointer hover:bg-gray-50">
                {image ? (
                   <img src={image} className="h-full w-full object-contain rounded-lg"/>
                ) : (
                   <span className="text-gray-500">Click to Scan Image</span>
                )}
                <input type="file" className="hidden" onChange={handleUpload} />
             </label>
             
             {loading && <p className="text-center mt-4 text-blue-600 font-bold animate-pulse">AI Analyzing...</p>}
          </div>

          {report && (
            <div className={`p-4 rounded-lg border-l-4 ${report.isSafetyHazard ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-50'}`}>
               <h3 className="font-bold">{report.issue}</h3>
               <p className="text-sm">{report.description}</p>
               {report.isSafetyHazard && (
                 <div className="text-red-600 font-bold text-xs mt-2">Severity: {report.severity}/10</div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
