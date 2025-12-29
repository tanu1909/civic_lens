import React,{useState} from 'react';
import {ImageAnalysis} from '../services/gemini';//importing function from gemini.js
import { uploadImageToStorage, saveReport } from '../services/reportService';
import {auth} from '../services/firebase';
import { useNavigate } from 'react-router-dom'; // For navigation


const CameraCapture = ()=>{//hook set up
    const navigate=useNavigate();//Hook to move between pages

    const[image,setImage]=useState(null);// Stores the Preview URL (for showing on screen)
    const [imageFile, setImageFile] = useState(null); // Stores actual file (for uploading)
    const[loading,setLoading]=useState(false);
    const[report,setReport]=useState(null);
    const[isSubmitting,setIsSubmitting]=useState(false);
    const [manualSeverity, setManualSeverity] = useState(0);

    const handleUpload=async(e)=>{//function to handel uploads
        const file=e.target.files[0];
        if(!file) return;

        setImage(URL.createObjectURL(file));
        setImageFile(file);

        setLoading(true);
        setReport(null);
        
        try {
            const data = await ImageAnalysis(file); 
            console.log("data = ", data);
            setReport(data);
            setManualSeverity(data.severity !== undefined ? data.severity : 5);
        } catch (error) {
            console.error(error);
            alert("AI Analysis Failed");
        }
        setLoading(false);
    };


    const handleSubmit=async()=>{//function to handle submission of report
    
      if(!auth.currentUser) return alert("Login first! ");
      if (!imageFile) return alert("No image to upload!");
      setIsSubmitting(true);

      try{
        const imageUrl=await uploadImageToStorage(imageFile);

        if ("geolocation" in navigator) {
            
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    const finalReport = {
                        ...report,
                        aiSeverity: report.severity, // Original AI guess
                        userSeverity: manualSeverity // Final Human choice
                    };

                    await saveReport(auth.currentUser.uid, imageUrl, finalReport, location);
                    alert("Report Submitted Successfully!");
                    setIsSubmitting(false);
                    navigate('/'); 
                },
                    (error) => {
                        console.error("Location Error:", error);
                        
                        //  error messages
                        if (error.code === error.PERMISSION_DENIED) {
                            alert("Location access denied! We need your location to tell the government where the problem is. Please enable location in your browser settings.");
                        } else {
                            alert("Could not fetch location. Please try again.");
                        }
                        
                        setIsSubmitting(false); 
                    }
                );
            } else {
                alert("Geolocation not supported");
                setIsSubmitting(false);
            }
      }
      catch(e){
        console.error("error ",e);
        alert("Something went wrong");
        setIsSubmitting(false);
      }
    };

    return(//ui of ai scanner part

    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      
      
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-fade-in-up">
        
        
          <button 
              onClick={() => navigate('/')} // Navigate Home
              className="absolute top-3 right-3 p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition z-10"
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
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
             </label>
             
             {loading && <p className="text-center mt-4 text-blue-600 font-bold animate-pulse">AI Analyzing...</p>}
          </div>

            {report && (
                <div className="space-y-4">
                    <div className={`p-4 rounded-lg border-l-4 ${report.isSafetyHazard ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-50'}`}>
                        <h3 className="font-bold text-lg">{report.issue}</h3>
                        <p className="text-sm text-gray-700 mt-1">{report.description}</p>
                        {/* <--- SLIDER UI START ---> */}
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <label className="text-xs font-bold uppercase text-gray-700 tracking-wider">
                                        Severity Score
                                    </label>
                                    <div className="flex items-center gap-3 mt-1">
                                       <span className="text-xs text-gray-500">Low</span>
                                       <input 
                                          type="range" 
                                          min="1" max="10" 
                                          value={manualSeverity} 
                                          onChange={(e) => setManualSeverity(parseInt(e.target.value))}
                                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                       />
                                       <span className={`text-lg font-bold ${manualSeverity > 7 ? 'text-red-600' : 'text-blue-600'}`}>
                                           {manualSeverity}
                                       </span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1">
                                       AI suggested {report.severity}. Adjust if incorrect.
                                    </p>
                                </div>
                                {/* <--- SLIDER UI END ---> */}

                            </div>

                            {/*Submit button */}
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-95
                                    ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                                `}
                            >
                                {isSubmitting ? 'Uploading Report...' : '📍 Submit Report'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CameraCapture;