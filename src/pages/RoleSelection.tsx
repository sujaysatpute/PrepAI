import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Code, Cloud, Database, Terminal, Shield, Cpu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RoleCard from '../components/RoleCard';
import { Role } from '../utils/types';
import { setStoredRole } from '../utils/storage';

export const AVAILABLE_ROLES = [
  { id: 'software', title: 'Software Developer', desc: 'Practice software developer interviews across frontend, backend, full stack, and mobile', icon: Code, color: 'bg-blue-500', shadow: 'shadow-blue-200', subRoles: ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile App Developer'] },
  { id: 'cloud', title: 'Cloud Engineer', desc: 'Practice cloud engineer interviews covering AWS, Azure, GCP, and cloud security architectures', icon: Cloud, color: 'bg-orange-500', shadow: 'shadow-orange-200', subRoles: ['AWS Solutions Architect', 'Azure Cloud Engineer', 'GCP Cloud Engineer', 'Cloud Security Engineer'] },
  { id: 'data', title: 'Data Scientist', desc: 'Practice data scientist interviews including machine learning, analysis, and data engineering', icon: Database, color: 'bg-pink-500', shadow: 'shadow-pink-200', subRoles: ['Data Analyst', 'Machine Learning Engineer', 'Data Engineer', 'Business Intelligence Analyst'] },
  { id: 'devops', title: 'DevOps Engineer', desc: 'Practice DevOps interviews focusing on SRE, CI/CD, Kubernetes, and platform reliability', icon: Terminal, color: 'bg-emerald-500', shadow: 'shadow-emerald-200', subRoles: ['Site Reliability Engineer (SRE)', 'Release Engineer', 'Platform Engineer', 'Build Engineer'] },
  { id: 'cyber', title: 'Cybersecurity Analyst', desc: 'Practice security interviews covering SOC, pentesting, incident response, and info security', icon: Shield, color: 'bg-red-500', shadow: 'shadow-red-200', subRoles: ['Penetration Tester', 'Security Operations Center (SOC) Analyst', 'Information Security Engineer', 'Incident Responder'] },
  { id: 'ai', title: 'AI/ML Engineer', desc: 'Practice AI/ML interviews covering LLMs, NLP, Computer Vision, and deep learning systems', icon: Cpu, color: 'bg-purple-500', shadow: 'shadow-purple-200', subRoles: ['NLP Engineer', 'Computer Vision Engineer', 'Deep Learning Engineer', 'AI Research Scientist'] },
];

export default function RoleSelection({ setSelectedRole }: { setSelectedRole: (r: Role) => void }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [activeRole, setActiveRole] = useState<any>(null);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    if (showModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  const handleRoleClick = (role: any) => {
    setActiveRole(role);
    setShowModal(true);
  };

  const handleSubRoleSelect = (subRole: string) => {
    const roleObj: Role = { main: activeRole.title, sub: subRole };
    setSelectedRole(roleObj);
    setStoredRole(roleObj);
    setShowModal(false);
    navigate('/setup');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8 sm:mb-10">
        <h1 className="text-3xl font-display font-bold text-slate-900">Select Your Target Role</h1>
        <p className="text-slate-600 mt-2">Choose the engineering discipline and specialization you want to practice for</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AVAILABLE_ROLES.map((r) => (
          <RoleCard 
            key={r.id} 
            role={r} 
            onClick={() => handleRoleClick(r)} 
          />
        ))}
      </div>

      <AnimatePresence>
        {showModal && activeRole && (
          <div 
            onClick={() => setShowModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div 
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100"
            >
              <div className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 id="modal-title" className="text-lg font-bold text-slate-900">Select Specialization</h3>
                  <p className="text-xs text-indigo-600 font-medium">{activeRole.title}</p>
                </div>
                <button 
                  onClick={() => setShowModal(false)} 
                  aria-label="Close specialization selector"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                {activeRole.subRoles.map((sub: string) => (
                  <button 
                    key={sub}
                    onClick={() => handleSubRoleSelect(sub)}
                    className="w-full text-left px-4 py-3.5 rounded-xl border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-all font-medium text-slate-700 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
