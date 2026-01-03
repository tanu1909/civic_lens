import React,{useState} from 'react';
import {ImageAnalysis} from '../services/gemini';//importing function from gemini.js
import { uploadImageToStorage, saveReport } from '../services/reportService';
import {auth} from '../services/firebase';
import { useNavigate } from 'react-router-dom'; // For navigation
import imageCompression from 'browser-image-compression';


const CameraCapture = ()=>{//hook set up
    const navigate=useNavigate();//Hook to move between pages

    const[image,setImage]=useState(null);// Stores the Preview URL (for showing on screen)
    const [imageFile, setImageFile] = useState(null); // Stores actual file (for uploading)

    const[loading,setLoading]=useState(false);
    const [loadingText, setLoadingText] = useState("");
    const[isSubmitting,setIsSubmitting]=useState(false);
    const [showToast,setShowToast]=useState(false);

    const[report,setReport]=useState(null);
    const [manualSeverity, setManualSeverity] = useState(0);
    
    const handleUpload=async(e)=>{//function to handel uploads
        const file=e.target.files[0];
        if(!file) return;

        const options = {
        maxSizeMB: 0.5,          // Limit to 0.5MB (500KB)
        maxWidthOrHeight: 1280,  // Resize large images
        useWebWorker: true,      // Run faster
        };

        setLoadingText("Compressing Image...");
        setLoading(true);
        const compressedFile = await imageCompression(file, options);

        setImage(URL.createObjectURL(compressedFile));
        setImageFile(compressedFile);

        setLoading(true);
        setLoadingText("AI is Analyzing...");
        setReport(null);
        
        try {
            const data = await ImageAnalysis(compressedFile); 
            console.log("data = ", data);

            if (!data || !data.issue || data.issue === "Unclear" || data.issue === "Unable to identify") {
            alert("⚠️ Image Unclear: The AI could not detect any specific civic issue.\n\nPlease take a closer, clearer photo and try again.");
            setLoading(false);
            return; // <--- STOP HERE. Do not set the report.
            }

            setReport(data);

            setManualSeverity(data.severity !== undefined ? data.severity : 5);
        } catch (error) {
            console.error(error);
            alert("AI Analysis Failed.Please try a clearer image.");
        }
        setLoading(false);
    };


    const handleSubmit=async()=>{//function to handle submission of report
    
      if(!auth.currentUser) return alert("Login first! ");
      if (!imageFile) return alert("No image to upload!");
      if (manualSeverity < 4) {
        alert("⚠️ Report Rejected: The severity score is too low.\n\nOnly issues with a severity of 4 or higher can be submitted to keep the system efficient.");
        return; // Stops the function here. Nothing gets uploaded.
    }

      setIsSubmitting(true);

      try{
        setLoadingText("Uploading Evidence...");
        console.log("Uploading image");
        const imageUrl=await uploadImageToStorage(imageFile);
        console.log("image uploaded:",imageUrl);

        if ("geolocation" in navigator) {

            setLoadingText("📍 Acquiring Location...");
            
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                        const aiScore = report?.severity || 0;
                        const userScore = manualSeverity;
                        const mismatch = Math.abs(aiScore - userScore);
                        const isSuspicious = mismatch > 4;
                        setLoadingText(" Saving .....");

                        if (isSuspicious) {
                            const confirmSubmit = window.confirm(
                                `⚠️ SPAM DETECTION WARNING ⚠️\n\nAI rated this: ${aiScore}/10\nYou rated this: ${userScore}/10\n\nThis huge difference flags your report as "Suspicious". Admins will review it manually.\n\nDo you still want to submit?`
                            );
    
                            // If user clicks "Cancel", stop everything
                            if (!confirmSubmit) {
                                setIsSubmitting(false);
                                return; 
                            }
                        }

                        await saveReport({
                            userId: auth.currentUser.uid,
                            imageUrl: imageUrl,
                            issue: report?.issue || "General Issue",
                            description: report?.description || "No details", // User description or AI description
                            aiAnalysis: JSON.stringify(report), // Save raw AI data just in case
                            severity: userScore,
                            location: location,
                            isSuspicious: isSuspicious,
                            isSafetyHazard: report?.isSafetyHazard || false
                        });
                    setLoadingText("✅ Done!");
                    setShowToast(true);
                    setIsSubmitting(false);
                    setTimeout(() => {
                    setShowToast(false); // Hide toast
                    navigate('/');       // THEN go home
                    }, 2000);

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
        console.error("Submission error ",e);
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
             
             {loading && <p className="text-center mt-4 text-blue-600 font-bold animate-pulse">{loadingText}</p>}
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

                    {isSubmitting && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-2xl">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
                        <p className="text-blue-600 font-bold text-lg animate-pulse">
                        {loadingText}
                        </p>
                        </div>
                    )}

                    {showToast && (
                        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 animate-bounce z-50">
                            ✅ Report Submitted Successfully!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CameraCapture;