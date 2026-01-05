import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase.js';
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { MessageSquare, Clock, User as UserIcon } from 'lucide-react';

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const q = query(collection(db, "feedback"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFeedbacks(data);
      } catch (error) {
        console.error("Error fetching feedback:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading feedback...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-2">
          <MessageSquare className="text-blue-600" />
          User Feedback Management
        </h1>

        <div className="grid gap-6">
          {feedbacks.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-800">{item.subject}</h3>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock size={14} />
                  {item.createdAt?.toDate().toLocaleString() || 'Just now'}
                </span>
              </div>
              
              <p className="text-slate-600 mb-4 bg-slate-50 p-4 rounded-lg italic">
                "{item.message}"
              </p>

              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <UserIcon size={14} />
                  {item.userEmail}
                </span>
              </div>
            </div>
          ))}

          {feedbacks.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-400">No feedback received yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFeedback;