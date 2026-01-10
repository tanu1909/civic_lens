import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, CheckCircle, Clock, X, ThumbsUp, Share2, AlertTriangle, ChevronDown, ChevronUp, AlertOctagon, Trash2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient'; 
import { auth } from '../services/firebase'; 

const ReportCard = ({ report, onDelete }) => {
    const [showProof, setShowProof] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    
    // --- VOTING STATE ---
    const [voteCount, setVoteCount] = useState(report.votes || 0);
    const [hasVoted, setHasVoted] = useState(false); 
    const [isVoting, setIsVoting] = useState(false);

    // --- 1. CHECK IF USER ALREADY VOTED (On Load) ---
    useEffect(() => {
        const checkVoteStatus = async () => {
            const user = auth.currentUser;
            if (!user) return;

            const { data } = await supabase
                .from('report_votes')
                .select('*')
                .eq('report_id', report.id)
                .eq('user_id', user.uid)
                .single();

            if (data) setHasVoted(true); 
        };
        checkVoteStatus();
    }, [report.id]);

    // --- 2. HANDLE VOTE (TOGGLE LOGIC) ---
    const handleVote = async (e) => {
        e.stopPropagation();
        
        const user = auth.currentUser;
        if (!user) {
            alert("🔒 Please Login to support reports.");
            return;
        }

        setIsVoting(true);

        try {
            if (hasVoted) {
                // UN-VOTE
                const { error: deleteError } = await supabase
                    .from('report_votes')
                    .delete()
                    .eq('report_id', report.id)
                    .eq('user_id', user.uid);

                if (deleteError) throw deleteError;
                await supabase.rpc('decrement_votes', { row_id: report.id });

                setVoteCount(prev => Math.max(0, prev - 1));
                setHasVoted(false);

            } else {
                // UPVOTE
                const { error: insertError } = await supabase
                    .from('report_votes')
                    .insert({ report_id: report.id, user_id: user.uid });

                if (insertError) throw insertError;
                await supabase.rpc('increment_votes', { row_id: report.id });

                setVoteCount(prev => prev + 1);
                setHasVoted(true);
            }

        } catch (error) {
            console.error("Voting failed:", error);
            alert("Something went wrong. Please try again.");
        }
        setIsVoting(false);
    };

    // --- 3. HANDLE SHARE ---
    const handleShare = (e) => {
        e.stopPropagation();
        if (!auth.currentUser) {
            alert("🔒 Please Login to share reports.");
            return;
        }
        if (navigator.share) {
            navigator.share({ title: report.issue, text: report.description, url: window.location.href });
        } else {
            alert("Link copied!");
        }
    };

    // --- HANDLE DISPUTE ---
    const handleDispute = (e) => {
        e.stopPropagation();
        if (!auth.currentUser) return alert("🔒 Login required.");
        if(window.confirm("Has this issue NOT been fixed properly? Flag for admin review?")) {
            alert("Feedback sent! Admins will review this case.");
        }
    };

    // --- HELPERS ---
    let loc = { lat: 0, lng: 0, address: "Location unavailable" };
    try {
        if (report.location) {
            let rawLoc = typeof report.location === 'string' ? JSON.parse(report.location) : report.location;
            loc = { lat: parseFloat(rawLoc.lat)||0, lng: parseFloat(rawLoc.lng)||0, address: rawLoc.address || "Location unavailable" };
        }
    } catch (err) {}
    
    const getStatusStyle = (status) => {
        if(status?.toLowerCase() === 'resolved') return { color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800', icon: <CheckCircle size={14} /> };
        return { color: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800', icon: <Clock size={14} /> };
    };
    const statusStyle = getStatusStyle(report.status);
    const date = new Date(report.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const displayStatus = report.status === 'Rejected' ? 'Pending' : (report.status || 'Pending');

    return (

        <div className='group bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full'>

        <div className='group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full'>

            
            {/* IMAGE SECTION */}
            <div className='h-48 overflow-hidden relative bg-gray-100 dark:bg-slate-800'>
                <img 
                    src={showProof && report.resolutionImage ? report.resolutionImage : (report.imageUrl || "https://placehold.co/400x300?text=No+Image")} 
                    alt={report.issue} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                <div className='absolute top-3 right-3 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1 text-gray-600 dark:text-slate-300'>
                    <Calendar size={12} /> {date}
                </div>

                {report.status === 'Resolved' && report.resolutionImage && (
                    <button onClick={(e) => { e.stopPropagation(); setShowProof(!showProof); }} className={`absolute bottom-3 right-3 text-xs px-3 py-1.5 rounded-full shadow-lg transition-colors z-20 font-bold flex items-center gap-1 border ${showProof ? 'bg-white text-blue-600 border-blue-200' : 'bg-blue-600 text-white border-transparent'}`}>
                        {showProof ? "↩ View Original" : "📷 View Proof"}
                    </button>
                )}

                {/* DELETE BUTTON (Pending Only) */}
                {report.status === 'Pending' && onDelete && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}

                        className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 p-2 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm z-10 opacity-0 group-hover:opacity-100"
                        title="Delete Report"

                    className="absolute top-3 left-3 bg-white/90 p-1.5 rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors shadow-sm z-10"
                    title="Delete Report"

                    >
                        <Trash2 size={14} />
                    </button>
                )}


                <div className='absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1 text-gray-600'>
                    <Calendar size={12} />
                    {date}
                </div>


                {/* Severity Bar */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 ${report.severity > 7 ? 'bg-red-500' : report.severity > 4 ? 'bg-orange-400' : 'bg-green-500'}`}></div>
            </div>

            {/* CONTENT SECTION */}
            <div className='p-5 flex-1 flex flex-col'>
                <div className='flex justify-between items-start gap-3 mb-2'>
                    <h3 className='font-bold text-gray-900 dark:text-white text-lg leading-tight line-clamp-1'>{report.issue}</h3>
                    <div className="flex flex-col items-end gap-1">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border flex items-center gap-1 ${statusStyle.color}`}>
                            {statusStyle.icon} {displayStatus}
                        </span>
                        {report.status === 'Resolved' && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${report.resolutionImage ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                                {report.resolutionImage ? <><CheckCircle size={10} /> Verified</> : <><AlertTriangle size={10} /> Unverified</>}
                            </span>
                        )}
                    </div>
                </div>

                {/* TEXT EXPAND */}
                <div onClick={() => setIsExpanded(!isExpanded)} className="mb-4 cursor-pointer relative">
                    <div className={`text-gray-500 dark:text-slate-400 text-sm leading-relaxed overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[500px]' : 'max-h-[3em]'}`}>
                        <p>{report.description}</p>
                    </div>
                    {report.description.length > 60 && (
                        <span className="text-xs text-blue-500 dark:text-blue-400 font-bold flex items-center gap-0.5 mt-1 opacity-90 hover:opacity-100">
                            {isExpanded ? <>Show Less <ChevronUp size={12} /></> : <>Read More <ChevronDown size={12} /></>}
                        </span>
                    )}
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <button 
                        onClick={handleVote} 
                        disabled={isVoting} 
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all active:scale-95 
                            ${hasVoted 
                                ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30" 
                                : "bg-gray-50 text-gray-600 border-gray-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 dark:hover:text-blue-400" 
                            }`}
                    >
                        <ThumbsUp size={14} className={hasVoted ? "fill-blue-700 dark:fill-blue-500" : ""} /> 
                        {hasVoted ? "Supported" : "Support"} ({voteCount})
                    </button>

                    <button onClick={handleShare} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-blue-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 hover:border-blue-200 active:scale-95 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:text-blue-400 dark:hover:border-slate-600">
                        <Share2 size={14} /> Share
                    </button>

                    {report.status === 'Resolved' && !report.resolutionImage && (
                        <button onClick={handleDispute} className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-100 active:scale-95 ml-auto dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30">
                            <AlertOctagon size={14} /> Not Fixed?
                        </button>
                    )}
                </div>

                {/* FOOTER */}
                <div className='mt-auto pt-4 border-t border-gray-100 dark:border-slate-800'>
                    <div className='flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 mb-2'>
                        <MapPin size={14} className="text-blue-500 shrink-0" />
                        <a href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="truncate hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer font-medium">
                            {loc.address}
                        </a>
                    </div>
                    <div className='w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden'>
                        <div className={`h-full rounded-full ${report.severity > 7 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${report.severity * 10}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportCard;