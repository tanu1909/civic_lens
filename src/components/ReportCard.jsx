import React, { useState } from 'react';
import { MapPin, Calendar, AlertTriangle, CheckCircle, Clock, Check, X } from 'lucide-react';

const ReportCard = ({ report, onDelete }) => {
    const [showProof, setShowProof] = useState(false);

   
    let loc = { lat: 0, lng: 0, address: "Location unavailable" };
    let hasValidGPS = false;
    
    try {
      
        if (report.location) {
          
            let rawLoc = report.location;
            if (typeof rawLoc === 'string') {
                try {
                    rawLoc = JSON.parse(rawLoc);
                } catch(e) {
                   
                    rawLoc = { address: report.location, lat: 0, lng: 0 };
                }
            }

            
            const safeLat = parseFloat(rawLoc.lat);
            const safeLng = parseFloat(rawLoc.lng);

            
            loc = {
                lat: isNaN(safeLat) ? 0 : safeLat,
                lng: isNaN(safeLng) ? 0 : safeLng,
                address: rawLoc.address || "Location unavailable"
            };

            
            hasValidGPS = loc.lat !== 0 && loc.lng !== 0;
        }
    } catch (err) {
        console.error("Location parsing error:", err);
    }
    

    const getStatusStyle = (status) => {
        switch(status?.toLowerCase()){
            case 'resolved': return { color: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle size={14} /> };
            case 'in progress': return { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Clock size={14} /> };
            case 'rejected': return { color: 'bg-red-100 text-red-800 border-red-200', icon: <X size={14} /> };
            default: return { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: <AlertTriangle size={14} /> };
        }
    };

    const statusStyle = getStatusStyle(report.status);
    
    
    const dateObj = report.timestamp ? new Date(report.timestamp) : new Date(report.created_at);
    const date = isNaN(dateObj.getTime()) ? "Date N/A" : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div className='group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full'>
            
            {/* IMAGE SECTION */}
            <div className='h-48 overflow-hidden relative bg-gray-100'>
                <img 
                    src={showProof && report.resolution_image_url ? report.resolution_image_url : (report.imageUrl || "https://placehold.co/400x300?text=No+Image")} 
                    alt={report.issue} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { e.target.src = "https://placehold.co/400x300?text=No+Image"; }}
                />

                {/* Delete Button (Hover Only) */}
                {report.status === 'Pending' && onDelete && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="absolute top-3 left-3 bg-white/90 p-2 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm z-10 opacity-0 group-hover:opacity-100"
                        title="Delete Report"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                    </button>
                )}

                <div className='absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1 text-gray-600'>
                    <Calendar size={12} />
                    {date}
                </div>

                {report.status === 'Resolved' && report.resolution_image_url && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); setShowProof(!showProof); }}
                        className="absolute bottom-3 right-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-20"
                    >
                        {showProof ? "See Original Issue" : "See Resolution Proof"}
                    </button>
                )}

                <div className={`absolute bottom-0 left-0 right-0 h-1 ${report.severity > 7 ? 'bg-red-500' : report.severity > 4 ? 'bg-orange-400' : 'bg-green-500'}`}></div>
            </div>

            {/* CONTENT SECTION */}
            <div className='p-5 flex-1 flex flex-col'>
                
                <div className='flex justify-between items-start gap-3 mb-3'>
                    <h3 className='font-bold text-gray-900 text-lg leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors' title={report.issue}>
                        {report.issue || "Reported Issue"}
                    </h3>
                    
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border flex items-center gap-1 ${statusStyle.color}`}>
                        {statusStyle.icon}
                        {report.status || 'Pending'}
                    </span>
                </div>

                <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
                    {showProof && report.resolution_notes 
                        ? <span className="text-green-700 font-medium">Admin Note: {report.resolution_notes}</span>
                        : report.description || "No description provided."}
                </p>

                {/* FOOTER */}
                <div className='mt-auto pt-4 border-t border-gray-100'>
                    <div className='flex items-center justify-between mb-3'>
                        <div className='flex items-center gap-1.5 text-xs text-gray-500'>
                            <MapPin size={14} className="text-blue-500" />
                            
                            {hasValidGPS ? (
                                <a 
                                    href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:text-blue-600 hover:underline truncate max-w-[150px]"
                                    onClick={(e) => e.stopPropagation()}
                                    title={loc.address}
                                >
                                    {loc.address.length > 25 ? loc.address.substring(0, 22) + "..." : loc.address}
                                </a>
                            ) : (
                                <span className="truncate max-w-[150px]" title={loc.address}>
                                    {loc.address}
                                </span>
                            )}
                        </div>

                        {report.status === 'Resolved' && (
                            <div className={`text-[10px] font-bold px-2 py-0.5 rounded border ${report.location_verified ? 'bg-green-50 text-green-600 border-green-200' : 'bg-yellow-50 text-yellow-600 border-yellow-200'}`}>
                                {report.location_verified ? "✅ Verified" : "⚠️ Unverified"}
                            </div>
                        )}
                    </div>

                    <div className='flex items-center justify-between text-xs font-semibold text-gray-700 mb-1.5'>
                        <span>Severity Level</span>
                        <span className={report.severity > 7 ? 'text-red-600' : 'text-gray-900'}>{report.severity}/10</span>
                    </div>
                    <div className='w-full bg-gray-100 rounded-full h-2 overflow-hidden'>
                        <div 
                            className={`h-full rounded-full ${report.severity > 7 ? 'bg-red-500' : report.severity > 4 ? 'bg-orange-400' : 'bg-green-500'}`} 
                            style={{ width: `${report.severity * 10}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportCard;