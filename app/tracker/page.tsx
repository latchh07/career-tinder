'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, ExternalLink } from 'lucide-react';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  status: 'upskilling' | 'inProgress' | 'accepted' | 'rejected';
  matchPercentage: number;
  missingSkills: string[];
  dateAdded: string;
  url: string;
  notes: string;
}

const TrackerPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load jobs from localStorage on mount and when tab becomes visible
  useEffect(() => {
    const loadJobs = () => {
      const savedJobs = localStorage.getItem('trackedJobs');
      console.log('Loading jobs from localStorage:', savedJobs);
      if (savedJobs) {
        try {
          const parsed = JSON.parse(savedJobs);
          console.log('Parsed jobs:', parsed);
          setJobs(parsed);
        } catch (e) {
          console.error('Error loading jobs:', e);
        }
      }
    };

    // Load immediately
    loadJobs();
    setIsInitialLoad(false);

    // Set up interval to check for updates every 500ms
    const interval = setInterval(loadJobs, 500);

    // Listen for storage changes
    window.addEventListener('storage', loadJobs);
    
    // Listen for focus events
    window.addEventListener('focus', loadJobs);

    // Custom event for same-page updates
    const handleTrackerUpdate = () => {
      console.log('trackerUpdate event received');
      loadJobs();
    };
    window.addEventListener('trackerUpdate', handleTrackerUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', loadJobs);
      window.removeEventListener('focus', loadJobs);
      window.removeEventListener('trackerUpdate', handleTrackerUpdate);
    };
  }, []);

  // Save jobs to localStorage only when user makes changes (not on initial load)
  useEffect(() => {
    if (!isInitialLoad && jobs.length >= 0) {
      console.log('Saving jobs to localStorage:', jobs);
      localStorage.setItem('trackedJobs', JSON.stringify(jobs));
    }
  }, [jobs, isInitialLoad]);

  const statusOptions = [
    { value: 'upskilling', label: 'Upskilling', color: 'bg-yellow-900 text-yellow-300 border-yellow-700' },
    { value: 'inProgress', label: 'In Progress', color: 'bg-blue-900 text-blue-300 border-blue-700' },
    { value: 'accepted', label: 'Accepted', color: 'bg-green-900 text-green-300 border-green-700' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-900 text-red-300 border-red-700' }
  ];

  const handleDeleteJob = (jobId: number) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
  };

  const handleStatusChange = (jobId: number, newStatus: Job['status']) => {
    setJobs(prev => prev.map(j => 
      j.id === jobId ? { ...j, status: newStatus } : j
    ));
  };

  const getStatusColor = (status: Job['status']) => {
    return statusOptions.find(opt => opt.value === status)?.color || '';
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Job Tracker</h1>
          <p className="text-gray-400">Track jobs you've applied to from the Swipe tab</p>
        </div>
        <button
          onClick={() => {
            const savedJobs = localStorage.getItem('trackedJobs');
            if (savedJobs) {
              setJobs(JSON.parse(savedJobs));
            }
          }}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Excel-style Table */}
      <div className="border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-800">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border-r border-gray-800">Job Title</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border-r border-gray-800">Company</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border-r border-gray-800">Location</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border-r border-gray-800">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border-r border-gray-800">Match %</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border-r border-gray-800">Missing Skills</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border-r border-gray-800">Date Added</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border-r border-gray-800">Link</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    No jobs tracked yet. Go to Swipe tab and click "Save" or "Apply" to add jobs here.
                  </td>
                </tr>
              ) : (
                jobs.map((job, index) => (
                  <tr 
                    key={job.id} 
                    className={`border-b border-gray-800 hover:bg-gray-900 transition-colors ${
                      index % 2 === 0 ? 'bg-black' : 'bg-gray-950'
                    }`}
                  >
                    <td className="px-4 py-3 border-r border-gray-800">
                      <div className="font-medium">{job.title}</div>
                      {job.notes && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">{job.notes}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 border-r border-gray-800">{job.company}</td>
                    <td className="px-4 py-3 border-r border-gray-800">{job.location}</td>
                    <td className="px-4 py-3 border-r border-gray-800">
                      <select
                        value={job.status}
                        onChange={(e) => handleStatusChange(job.id, e.target.value as Job['status'])}
                        className={`px-3 py-1 rounded text-sm border ${getStatusColor(job.status)} focus:outline-none focus:ring-2 focus:ring-white cursor-pointer`}
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-800">
                      <span className="font-bold text-yellow-500">{job.matchPercentage}%</span>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-800">
                      <div className="flex flex-wrap gap-1">
                        {job.missingSkills.map((skill, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-800 border border-gray-700 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-800 text-sm text-gray-400">
                      {job.dateAdded}
                    </td>
                    <td className="px-4 py-3 border-r border-gray-800">
                      {job.url && (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-1.5 hover:bg-gray-800 rounded transition-colors text-red-500"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        {statusOptions.map(opt => {
          const count = jobs.filter(j => j.status === opt.value).length;
          return (
            <div key={opt.value} className="border border-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">{opt.label}</div>
              <div className="text-2xl font-bold">{count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackerPage;