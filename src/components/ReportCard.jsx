import React from 'react';
import { MapPin, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const ReportCard = ({ report ,onDelete}) => {

    const getStatusStyle = (status) => {
        switch(status?.toLowerCase()){
            case 'resolved': return { color: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle size={14} /> };
            case 'in progress': return { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Clock size={14} /> };
            default: return { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: <AlertTriangle size={14} /> };
        }
    };

    const statusStyle = getStatusStyle(report.status);
    const date = new Date(report.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div className='group bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300  flex flex-col h-full'>
            
            {/* Image Header */}
            <div className='h-48 overflow-hidden relative bg-gray-100'>
                <img 
                    src={report.imageUrl || "https://placehold.co/400x300?text=No+Image"} 
                    alt={report.issue} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { e.target.src = "https://placehold.co/400x300?text=No+Image"; }}
                />
                
                {/* Only showing Delete button if status is 'Pending' */}
                {report.status === 'Pending' && onDelete && (
                    <button 
                        onClick={(e) => {
                        e.stopPropagation(); // Preventing clicking the card itself
                        onDelete();
                        }}
                    className="absolute top-3 left-3 bg-white dark:bg-slate-900/90 p-1.5 rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors shadow-sm z-10"
                    title="Delete Report"
                    >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                    </button>
                )}
                <div className='absolute top-3 right-3 bg-white dark:bg-slate-900/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1 text-gray-600'>
                    <Calendar size={12} />
                    {date}
                </div>

                {/* Severity Bar */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 ${report.severity > 7 ? 'bg-red-500' : report.severity > 4 ? 'bg-orange-400' : 'bg-green-500'}`}></div>
            </div>

            {/* Content Body */}
            <div className='p-5 flex-1 flex flex-col'>
                
                <div className='flex justify-between items-start gap-3 mb-3'>
                    <h3 className='font-bold text-gray-900 text-lg leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors'
                    title={report.issue}
                    >
                        {report.issue || "Reported Issue"}
                    </h3>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border flex items-center gap-1 ${statusStyle.color}`}>
                        {statusStyle.icon}
                        {report.status || 'Pending'}
                    </span>
                </div>

                <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
                    {report.description || "No description provided."}
                </p>

                <div className='mt-auto pt-4 border-t border-gray-100'>
                    <div className='flex items-center gap-1.5 text-xs text-gray-500 mb-3'>
                        <MapPin size={14} className="text-blue-500" />
                        <span className="truncate">
                            {/* Checking if location has an address string, otherwise showing coords or default */}
                            {report.location?.address 
                                ? report.location.address 
                                : report.location 
                                    ? "GPS Location Captured" 
                                    : "No Location Data"}
                        </span>
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