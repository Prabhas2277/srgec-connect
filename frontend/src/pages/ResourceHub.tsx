import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  Download,
  ThumbsUp,
  Bookmark,
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle,
  Plus
} from 'lucide-react';

export const ResourceHub: React.FC = () => {
  const { user, apiFetch } = useAuth();
  const [resources, setResources] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [semFilter, setSemFilter] = useState('');
  
  // Upload Form State
  const [showUpload, setShowUpload] = useState(() => {
    return new URLSearchParams(window.location.search).get('create') === 'true';
  });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dept, setDept] = useState('CSE');
  const [year, setYear] = useState('3');
  const [sem, setSem] = useState('1');
  const [subject, setSubject] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchResources = async () => {
    try {
      const q = `/resources/list?${deptFilter ? `department=${deptFilter}&` : ''}${yearFilter ? `year=${yearFilter}&` : ''}${semFilter ? `semester=${semFilter}&` : ''}${search ? `search=${search}&` : ''}`;
      const data = await apiFetch(q);
      setResources(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [deptFilter, yearFilter, semFilter, search]);

  const handleLike = async (id: number) => {
    try {
      const data = await apiFetch(`/resources/${id}/like`, { method: 'POST' });
      setResources((prev) =>
        prev.map((r) => (r.id === id ? { ...r, likes_count: data.likes_count } : r))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('department', dept);
      formData.append('year', year);
      formData.append('semester', sem);
      formData.append('subject', subject);
      formData.append('file', file);

      await apiFetch('/resources/upload', {
        method: 'POST',
        body: formData
      });

      setSuccess('Resource uploaded successfully! +50 XP Awarded.');
      setTitle('');
      setDescription('');
      setSubject('');
      setFile(null);
      setShowUpload(false);
      fetchResources();
    } catch (err: any) {
      setError(err.message || 'Failed to upload resource');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Academic Resource Hub</h2>
          <p className="text-sm text-[var(--text-secondary)]">Search and share notes, syllabus papers, and manuals.</p>
        </div>

        {user && (user.role === 'faculty' || user.role === 'admin' || user.role === 'club_coordinator') && (
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="glass-button text-sm flex items-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            Upload Study Material
          </button>
        )}
      </div>

      {/* UPLOAD FORM PANEL */}
      {showUpload && (
        <div className="glass-vision p-6 border-violet-500/30">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-violet-400" />
            Upload New Resource (Earn +50 XP!)
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Operating Systems Unit-I Notes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full glass-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Operating Systems"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full glass-input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Description</label>
              <textarea
                placeholder="Brief summary of document content..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full glass-input min-h-20 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Department</label>
                <select value={dept} onChange={(e) => setDept(e.target.value)} className="w-full glass-input">
                  <option value="CSE" className="bg-[var(--bg-secondary)]">CSE</option>
                  <option value="IT" className="bg-[var(--bg-secondary)]">IT</option>
                  <option value="ECE" className="bg-[var(--bg-secondary)]">ECE</option>
                  <option value="EEE" className="bg-[var(--bg-secondary)]">EEE</option>
                  <option value="ME" className="bg-[var(--bg-secondary)]">ME</option>
                  <option value="CE" className="bg-[var(--bg-secondary)]">CE</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Target Year</label>
                <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full glass-input">
                  <option value="1" className="bg-[var(--bg-secondary)]">1st Year</option>
                  <option value="2" className="bg-[var(--bg-secondary)]">2nd Year</option>
                  <option value="3" className="bg-[var(--bg-secondary)]">3rd Year</option>
                  <option value="4" className="bg-[var(--bg-secondary)]">4th Year</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Semester</label>
                <select value={sem} onChange={(e) => setSem(e.target.value)} className="w-full glass-input">
                  <option value="1" className="bg-[var(--bg-secondary)]">1st Semester</option>
                  <option value="2" className="bg-[var(--bg-secondary)]">2nd Semester</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Select File (PDF, ZIP, PPTX)</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-xs text-[var(--text-secondary)]"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowUpload(false)}
                className="glass-button-secondary text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="glass-button text-sm flex items-center gap-2 cursor-pointer"
              >
                {uploading ? 'Uploading...' : 'Publish Resource'}
              </button>
            </div>
          </form>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="glass-vision p-4 flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search by topic or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap md:flex-nowrap gap-3 items-center w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <Filter className="w-3.5 h-3.5" />
            Filters:
          </div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="glass-input text-xs py-1.5 px-3"
          >
            <option value="" className="bg-[var(--bg-secondary)]">All Depts</option>
            <option value="CSE" className="bg-[var(--bg-secondary)]">CSE</option>
            <option value="IT" className="bg-[var(--bg-secondary)]">IT</option>
            <option value="ECE" className="bg-[var(--bg-secondary)]">ECE</option>
            <option value="EEE" className="bg-[var(--bg-secondary)]">EEE</option>
            <option value="ME" className="bg-[var(--bg-secondary)]">ME</option>
            <option value="CE" className="bg-[var(--bg-secondary)]">CE</option>
          </select>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="glass-input text-xs py-1.5 px-3"
          >
            <option value="" className="bg-[var(--bg-secondary)]">All Years</option>
            <option value="1" className="bg-[var(--bg-secondary)]">1st Year</option>
            <option value="2" className="bg-[var(--bg-secondary)]">2nd Year</option>
            <option value="3" className="bg-[var(--bg-secondary)]">3rd Year</option>
            <option value="4" className="bg-[var(--bg-secondary)]">4th Year</option>
          </select>

          <select
            value={semFilter}
            onChange={(e) => setSemFilter(e.target.value)}
            className="glass-input text-xs py-1.5 px-3"
          >
            <option value="" className="bg-[var(--bg-secondary)]">All Sems</option>
            <option value="1" className="bg-[var(--bg-secondary)]">1st Sem</option>
            <option value="2" className="bg-[var(--bg-secondary)]">2nd Sem</option>
          </select>
        </div>
      </div>

      {/* RESOURCES LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((res) => (
          <div key={res.id} className="glass-vision-interactive p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider bg-violet-500/10 px-2.5 py-1 rounded-full">
                  {res.subject}
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] font-medium">
                  {res.department} • Year {res.year} (Sem {res.semester})
                </span>
              </div>

              <h3 className="text-base font-bold text-[var(--text-primary)] mb-1 flex items-start gap-2">
                <FileText className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
                {res.title}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mb-4">{res.description}</p>
            </div>

            <div className="border-t border-[var(--border-glass)] pt-4 mt-2 flex items-center justify-between">
              <span className="text-[10px] text-[var(--text-secondary)]">
                Uploaded by: <strong className="text-[var(--text-primary)]">{res.uploader.full_name}</strong>
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleLike(res.id)}
                  className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-violet-400 transition-colors cursor-pointer"
                >
                  <ThumbsUp className="w-4 h-4" />
                  {res.likes_count}
                </button>
                
                <a
                  href={`http://localhost:8000${res.file_url}`}
                  download
                  className="glass-button-secondary text-xs py-1 px-3 flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
