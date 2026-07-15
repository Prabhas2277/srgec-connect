import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Calendar,
  Bell,
  Briefcase,
  BookOpen,
  Users,
  Award,
  Sparkles,
  ChevronRight,
  Maximize2,
  Cpu,
  RotateCw,
  Compass,
  Trophy,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Inbox
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, apiFetch } = useAuth();
  const navigate = useNavigate();
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Dashboard states
  const [events, setEvents] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 3D/2D View Toggle
  const [show3D, setShow3D] = useState(true);
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);

  // Notification Dispatch States
  const [showCreateNotif, setShowCreateNotif] = useState(false);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifContent, setNotifContent] = useState('');
  const [notifType, setNotifType] = useState('general');
  const [notifTargetRole, setNotifTargetRole] = useState('all');
  const [selectedDepts, setSelectedDepts] = useState<string[]>(['all']);
  const [urgency, setUrgency] = useState('low');
  const [notifSuccess, setNotifSuccess] = useState('');
  const [notifError, setNotifError] = useState('');
  const [sendingNotif, setSendingNotif] = useState(false);

  const handleDeptToggle = (dept: string) => {
    if (dept === 'all') {
      setSelectedDepts(['all']);
    } else {
      let updated = selectedDepts.filter(d => d !== 'all');
      if (updated.includes(dept)) {
        updated = updated.filter(d => d !== dept);
        if (updated.length === 0) updated = ['all'];
      } else {
        updated.push(dept);
      }
      setSelectedDepts(updated);
    }
  };

  const handleNotifSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingNotif(true);
    setNotifSuccess('');
    setNotifError('');
    try {
      await apiFetch('/notifications/create', {
        method: 'POST',
        body: JSON.stringify({
          title: notifTitle,
          content: `[URGENCY: ${urgency.toUpperCase()}] ${notifContent}`,
          type: notifType,
          target_role: notifTargetRole,
          target_department: selectedDepts.join(',')
        })
      });
      setNotifSuccess('Campus notification successfully dispatched!');
      setNotifTitle('');
      setNotifContent('');
      setSelectedDepts(['all']);
      setUrgency('low');
      setShowCreateNotif(false);
      // Reload notices
      const updatedNotices = await apiFetch('/notices/list');
      setNotices(updatedNotices);
    } catch (err: any) {
      setNotifError(err.message || 'Failed to dispatch notification');
    } finally {
      setSendingNotif(false);
    }
  };

  // Load backend data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [eventData, noticeData, jobData, leaderboardData] = await Promise.all([
          apiFetch('/events/list'),
          apiFetch('/notices/list'),
          apiFetch('/placements/jobs'),
          apiFetch('/auth/leaderboard')
        ]);
        setEvents(eventData);
        setNotices(noticeData);
        setJobs(jobData);
        setLeaderboard(leaderboardData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  // Three.js Campus Setup
  useEffect(() => {
    if (!show3D || loading || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.6, 7.5);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent camera going below ground
    controls.minDistance = 3.5;
    controls.maxDistance = 12;

    // Texture Loader for SRGEC Building
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('/campus-main.jpg');
    texture.colorSpace = THREE.SRGBColorSpace;

    // Create 3D building sheet geometry
    const geometry = new THREE.BoxGeometry(4.8, 1.8, 0.08);
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.4,
      metalness: 0.15,
      side: THREE.DoubleSide
    });
    const buildingMesh = new THREE.Mesh(geometry, material);
    buildingMesh.position.set(0, 0.5, 0);
    scene.add(buildingMesh);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(10, 20, '#3B82F6', '#1E293B');
    gridHelper.position.set(0, -0.6, 0);
    scene.add(gridHelper);

    // Dynamic glowing Hotspot nodes
    const hotspotsGroup = new THREE.Group();
    scene.add(hotspotsGroup);

    // Coordinates overlay matching Gudlavalleru image features
    const hotspotsData = [
      { id: 'lib', name: 'Library Hub', color: '#8B5CF6', coords: { x: -1.7, y: 0.3, z: 0.1 } },
      { id: 'place', name: 'Placement Cell', color: '#10B981', coords: { x: 1.7, y: -0.1, z: 0.1 } },
      { id: 'aud', name: 'Auditorium', color: '#06B6D4', coords: { x: -2.1, y: -0.4, z: 0.1 } },
      { id: 'stud', name: 'Student Center', color: '#D946EF', coords: { x: 1.3, y: -0.4, z: 0.1 } },
      { id: 'lab', name: 'Innovation Lab', color: '#F59E0B', coords: { x: 2.1, y: 0.2, z: 0.1 } },
      { id: 'admin', name: 'Admin Block', color: '#EF4444', coords: { x: -0.2, y: 0.9, z: 0.1 } } // Center Dome
    ];

    hotspotsData.forEach(h => {
      // Glow sphere
      const sphereGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: h.color,
        transparent: true,
        opacity: 0.85
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(h.coords.x, h.coords.y, h.coords.z);
      sphere.userData = { id: h.id };
      hotspotsGroup.add(sphere);

      // Outer ring
      const ringGeo = new THREE.RingGeometry(0.12, 0.16, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: h.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(h.coords.x, h.coords.y, h.coords.z);
      ring.userData = { isRing: true };
      hotspotsGroup.add(ring);
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(4, 4, 4);
    scene.add(dirLight);

    // Dust particles
    const particleCount = 80;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 8; // x
      positions[i + 1] = (Math.random() - 0.5) * 4; // y
      positions[i + 2] = (Math.random() - 0.5) * 4; // z
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({
      color: '#3B82F6',
      size: 0.03,
      transparent: true,
      opacity: 0.5
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    // Raycasting for interactions
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(hotspotsGroup.children);
      
      const sphereIntersects = intersects.filter(i => !i.object.userData.isRing);

      if (sphereIntersects.length > 0) {
        renderer.domElement.style.cursor = 'pointer';
        setHoveredBuilding(sphereIntersects[0].object.userData.id);
      } else {
        renderer.domElement.style.cursor = 'default';
        setHoveredBuilding(null);
      }
    };

    const handleCanvasClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(hotspotsGroup.children);
      const sphereIntersects = intersects.filter(i => !i.object.userData.isRing);

      if (sphereIntersects.length > 0) {
        const clickedId = sphereIntersects[0].object.userData.id;
        const b = buildings.find(item => item.id === clickedId);
        if (b) {
          navigate(b.path);
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('click', handleCanvasClick);

    // Animation loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Pulsing rings
      hotspotsGroup.children.forEach(child => {
        if (child.userData.isRing) {
          const s = 1 + Math.sin(elapsedTime * 4.5) * 0.2;
          child.scale.set(s, s, 1);
          ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.45 - Math.sin(elapsedTime * 4.5) * 0.15;
        }
      });

      // Auto rotation when idle
      if ((controls as any).state === -1) {
        scene.rotation.y = Math.sin(elapsedTime * 0.1) * 0.1;
      }

      // Floating particles
      const posArr = particlesGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        posArr[i] += Math.sin(elapsedTime + i) * 0.0006;
      }
      particlesGeo.attributes.position.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize listener
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [show3D, loading]);

  const buildings = [
    { id: 'lib', name: 'Library Hub', desc: 'Academic manuals, syllabus references & PDF notes.', path: '/resources', hoverColor: 'text-violet-400', label: 'Academic Resources' },
    { id: 'place', name: 'Placement Cell', desc: 'Active corporate recruitment drives and ATS checkers.', path: '/placements', hoverColor: 'text-emerald-400', label: 'Career Hub' },
    { id: 'aud', name: 'Auditorium Block', desc: 'Seminar halls, guest lectures, fests, and hackathons.', path: '/events', hoverColor: 'text-cyan-400', label: 'Events' },
    { id: 'stud', name: 'Student Center', desc: 'Club registrations, coordinators list, and campus feeds.', path: '/events', hoverColor: 'text-fuchsia-400', label: 'Clubs' },
    { id: 'lab', name: 'Innovation Lab', desc: 'Project collaborators, research groups, and workspace parameters.', path: '/profile', hoverColor: 'text-amber-400', label: 'Projects' },
    { id: 'admin', name: 'Admin Block', desc: 'Campus announcements, official notices, and scheduling details.', path: '/notices', hoverColor: 'text-rose-400', label: 'Notices' },
  ];

  const handleNoticeClick = (notice: any) => {
    // Scroll or trigger focus to targeted building
    const title = notice.title.toLowerCase();
    const content = notice.content.toLowerCase();
    let bId = 'admin';
    if (title.includes('placement') || title.includes('job') || content.includes('placement')) bId = 'place';
    else if (title.includes('hackathon') || title.includes('seminar') || title.includes('event')) bId = 'aud';
    else if (title.includes('club') || title.includes('student')) bId = 'stud';
    else if (title.includes('library') || title.includes('study') || title.includes('notes')) bId = 'lib';
    else if (title.includes('lab') || title.includes('innovation')) bId = 'lab';

    setHoveredBuilding(bId);
    setTimeout(() => setHoveredBuilding(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="uiverse-loader"></div>
        <span className="text-xs text-[var(--text-secondary)] font-medium animate-pulse tracking-wider">Syncing Campus Data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative pb-12 text-left">
      
      {/* 1. TOP SUMMARY STATS STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#1E293B] bg-[#0F172A] p-4 flex items-center justify-between shadow-md">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#3B82F6] tracking-wider block">Placement Drives</span>
            <span className="text-xl font-extrabold text-[#F3F4F6] mt-1 block">{jobs.length} Active</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Briefcase className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="rounded-xl border border-[#1E293B] bg-[#0F172A] p-4 flex items-center justify-between shadow-md">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8B5CF6] tracking-wider block">Official Notices</span>
            <span className="text-xl font-extrabold text-[#F3F4F6] mt-1 block">{notices.length} Dispatched</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
            <Bell className="w-5 h-5 text-rose-400" />
          </div>
        </div>

        <div className="rounded-xl border border-[#1E293B] bg-[#0F172A] p-4 flex items-center justify-between shadow-md">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#06B6D4] tracking-wider block">Campus Seminars</span>
            <span className="text-xl font-extrabold text-[#F3F4F6] mt-1 block">{events.length} Upcoming</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
            <Calendar className="w-5 h-5 text-cyan-400" />
          </div>
        </div>

        <div className="rounded-xl border border-[#1E293B] bg-[#0F172A] p-4 flex items-center justify-between shadow-md">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#F59E0B] tracking-wider block">Account standing</span>
            <span className="text-xl font-extrabold text-[#F3F4F6] mt-1 block">Level {user?.level || 1}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
        </div>
      </div>

      {/* 2. THREE.JS INTERACTIVE CAMPUS MAP WINDOW */}
      <div className="rounded-xl border border-[#1E293B] bg-[#0F172A] p-6 shadow-2xl relative overflow-hidden">
        {/* Banner header controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E293B] pb-4 mb-4">
          <div>
            <span className="text-[10px] text-[#3B82F6] font-extrabold uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
              Three.js spatial animation
            </span>
            <h2 className="text-lg font-black text-[#F3F4F6]">SRGEC Campus Layout</h2>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Click glowing department nodes on the 3D main building facade to launch portals.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* 3D view toggle */}
            <div className="flex items-center gap-2 bg-[#020617] px-3 py-1.5 border border-[#1E293B] rounded-lg">
              <span className="text-xs text-[#9CA3AF] font-bold">3D Render</span>
              <label className="uiverse-switch">
                <input 
                  type="checkbox" 
                  checked={show3D} 
                  onChange={(e) => setShow3D(e.target.checked)} 
                />
                <span className="uiverse-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* 3D Canvas / 2D Directory view container */}
        <div className="relative w-full h-[360px] rounded-lg bg-[#020617]/40 border border-[#1E293B]/40 overflow-hidden">
          {show3D ? (
            <>
              {/* Three.js DOM Mount Ref */}
              <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing"></div>

              {/* Floating detail badge on node hover */}
              {buildings.map((b) => {
                const isHovered = hoveredBuilding === b.id;
                return (
                  <div
                    key={b.id}
                    className={`absolute bottom-4 left-4 right-4 md:right-auto md:w-80 bg-[#0F172A]/95 border border-[#1E293B] p-4 rounded-xl shadow-2xl transition-all duration-300 pointer-events-none z-20 ${
                      isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    }`}
                  >
                    <span className="text-[9px] uppercase font-bold text-blue-400 tracking-wider block mb-1">
                      {b.label}
                    </span>
                    <h4 className="text-sm font-extrabold text-[#F3F4F6]">{b.name}</h4>
                    <p className="text-xs text-[#9CA3AF] mt-1 leading-snug">{b.desc}</p>
                    <div className="border-t border-[#1E293B] pt-2 mt-2 flex items-center justify-between text-[10px]">
                      <span className="text-[#3B82F6] font-bold">Click node to access portal</span>
                      <ChevronRight className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                    </div>
                  </div>
                );
              })}

              {/* Legend checklist */}
              <div className="absolute top-4 right-4 bg-[#0F172A]/95 border border-[#1E293B] p-3 rounded-xl hidden md:block text-[10px] space-y-1.5 pointer-events-none z-10 w-44">
                <span className="text-[9px] font-bold text-[#9CA3AF] uppercase block mb-1">Interactive Nodes</span>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#EF4444]"></span> Admin Block</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#8B5CF6]"></span> Library Hub</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#10B981]"></span> Placement Cell</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span> Innovation Lab</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#06B6D4]"></span> Auditorium</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#D946EF]"></span> Student Center</div>
              </div>
            </>
          ) : (
            /* 2D Directory View */
            <div className="w-full h-full overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
              {buildings.map((b) => (
                <div 
                  key={b.id} 
                  className="rounded-xl border border-[#1E293B] bg-[#0F172A] p-4 cursor-pointer hover:border-blue-500/20 transition-all flex flex-col justify-between h-28"
                  onClick={() => navigate(b.path)}
                >
                  <div>
                    <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">{b.label}</span>
                    <h3 className="text-sm font-extrabold text-[#F3F4F6] mt-0.5">{b.name}</h3>
                    <p className="text-[11px] text-[#9CA3AF] mt-1 line-clamp-2 leading-relaxed">{b.desc}</p>
                  </div>
                  <div className="text-[10px] text-blue-400 font-bold flex items-center gap-0.5 mt-2">
                    Access Portal <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. FACULTY CONTROLS */}
      {user && (user.role === 'faculty' || user.role === 'admin') && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#1E293B] bg-[#0F172A] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-[#8B5CF6] font-bold uppercase tracking-widest block mb-1">Mentor Action Board</span>
              <h3 className="text-base font-extrabold text-[#F3F4F6]">Quick Publisher Controls</h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Disseminate notices, update placement drives, or upload study material sheets.</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => setShowCreateNotif(!showCreateNotif)}
                className="glass-button text-xs py-2 px-4 shadow-none cursor-pointer"
              >
                Send Custom Notification
              </button>
              <Link to="/notices?create=true" className="glass-button-secondary text-xs py-2 px-4">
                Post Notice
              </Link>
              <Link to="/resources?create=true" className="glass-button-secondary text-xs py-2 px-4">
                Upload Materials
              </Link>
              <Link to="/placements?create=true" className="glass-button-secondary text-xs py-2 px-4">
                Host Placement
              </Link>
            </div>
          </div>

          {showCreateNotif && (
            <div className="rounded-xl border border-pink-500/20 bg-[#0F172A] p-6 text-left">
              <h3 className="text-sm font-bold text-[#F3F4F6] mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 text-pink-400" />
                Dispatch Custom Notification (Earn +20 XP)
              </h3>
              
              {notifError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                  {notifError}
                </div>
              )}

              <form onSubmit={handleNotifSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1.5">Notification Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Lab Records Submission"
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      className="w-full glass-input px-3 py-2 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1.5">Target Role</label>
                    <select
                      value={notifTargetRole}
                      onChange={(e) => setNotifTargetRole(e.target.value)}
                      className="w-full glass-input px-3 py-2 text-sm"
                    >
                      <option value="all" className="bg-[#0F172A]">All Roles</option>
                      <option value="student" className="bg-[#0F172A]">Students Only</option>
                      <option value="faculty" className="bg-[#0F172A]">Faculty Only</option>
                      <option value="club_coordinator" className="bg-[#0F172A]">Coordinators Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1.5">Notification Type</label>
                    <select
                      value={notifType}
                      onChange={(e) => setNotifType(e.target.value)}
                      className="w-full glass-input px-3 py-2 text-sm"
                    >
                      <option value="general" className="bg-[#0F172A]">General Broadcast</option>
                      <option value="notice" className="bg-[#0F172A]">Official Announcement</option>
                      <option value="placement" className="bg-[#0F172A]">Placement Info</option>
                      <option value="event" className="bg-[#0F172A]">Campus Event</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-2">Urgency Level</label>
                    <div className="uiverse-radio-group">
                      <label className="uiverse-radio-label">
                        <input 
                          type="radio" 
                          name="urgency" 
                          value="low" 
                          checked={urgency === 'low'}
                          onChange={(e) => setUrgency(e.target.value)} 
                        />
                        <span className="uiverse-radio-circle"></span>
                        Low
                      </label>
                      <label className="uiverse-radio-label">
                        <input 
                          type="radio" 
                          name="urgency" 
                          value="medium" 
                          checked={urgency === 'medium'}
                          onChange={(e) => setUrgency(e.target.value)} 
                        />
                        <span className="uiverse-radio-circle"></span>
                        Medium
                      </label>
                      <label className="uiverse-radio-label">
                        <input 
                          type="radio" 
                          name="urgency" 
                          value="high" 
                          checked={urgency === 'high'}
                          onChange={(e) => setUrgency(e.target.value)} 
                        />
                        <span className="uiverse-radio-circle"></span>
                        High
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-2">Target Departments</label>
                    <div className="flex flex-wrap gap-2.5 bg-[#020617] p-2 rounded-lg border border-[#1E293B]">
                      {['all', 'CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE'].map((dept) => (
                        <label key={dept} className="uiverse-checkbox-container">
                          <input
                            type="checkbox"
                            checked={selectedDepts.includes(dept)}
                            onChange={() => handleDeptToggle(dept)}
                          />
                          <span className="uiverse-checkmark"></span>
                          {dept === 'all' ? 'All' : dept}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1.5">Short Message Content</label>
                  <input
                    type="text"
                    placeholder="Brief details about this notification..."
                    value={notifContent}
                    onChange={(e) => setNotifContent(e.target.value)}
                    className="w-full glass-input px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateNotif(false)}
                    className="glass-button-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={sendingNotif} className="glass-button text-xs">
                    {sendingNotif ? 'Dispatching...' : 'Dispatch Notification'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {notifSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              {notifSuccess}
            </div>
          )}
        </div>
      )}

      {/* 4. DYNAMIC BENTO GRID SYSTEM */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* WIDGET 1: LARGE HERO - AI ASSISTANT ORB OR CHAT ENTRY */}
        <div className="md:col-span-2 rounded-xl border border-[#1E293B] bg-[#0F172A] p-6 flex flex-col md:flex-row items-center gap-6 justify-between relative overflow-hidden">
          <div className="space-y-4 z-10 max-w-sm text-left">
            <span className="text-[9px] text-[#3B82F6] font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              AI Assistant Orb
            </span>
            <h3 className="text-lg font-bold text-[#F3F4F6]">Ready to examine your curriculum?</h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Ask questions in Exam, Expert, or Socratic teacher modes. Upload notes to trigger automatic flashcards and quizzes.
            </p>
            <Link to="/ai-assistant" className="uiverse-btn-slide text-xs py-2 px-4 shadow-none">
              Launch Dialogue
              <ArrowRight className="w-3.5 h-3.5 arrow-icon" />
            </Link>
          </div>

          {/* AI Orb animation container */}
          <div className="relative w-36 h-36 flex items-center justify-center z-10 flex-shrink-0">
            <div className="absolute inset-0 border-2 border-blue-500/15 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
            <div className="absolute inset-4 border border-blue-500/15 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
            <div
              className="w-24 h-24 ai-orb-hologram cursor-pointer flex items-center justify-center shadow-2xl"
              onClick={() => navigate('/ai-assistant')}
            >
              <Cpu className="w-6 h-6 text-white/80 animate-pulse" />
            </div>
          </div>
        </div>

        {/* WIDGET 2: PLACEMENTS - 3D FLIP CARD */}
        <div className="flip-card cursor-pointer">
          <div className="flip-card-inner">
            <div className="flip-card-front p-6 flex flex-col justify-between text-left">
              <div>
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mb-3">
                  <Briefcase className="w-3.5 h-3.5" />
                  Career Drive Analyzer
                </span>
                <h3 className="text-sm font-bold text-[#F3F4F6]">Cognizant Recruitment Drive</h3>
                <p className="text-[10px] text-[#9CA3AF] mt-1.5 leading-relaxed">
                  Programmer Analyst Trainee hiring. Package: 4.5 LPA. Branches: CSE, IT, ECE.
                </p>
              </div>
              <div className="border-t border-[#1E293B] pt-4 mt-3 flex justify-between items-center text-[10px] text-[#9CA3AF] font-semibold">
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Eligibility Match
                </span>
                <span className="text-[#3B82F6] flex items-center gap-0.5">Hover to flip <ChevronRight className="w-3 h-3" /></span>
              </div>
            </div>
            <div className="flip-card-back p-6 flex flex-col justify-between text-left">
              <div>
                <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest block mb-2">ATS Eligibility Check</span>
                <h4 className="text-xs font-bold text-[#F3F4F6]">Job Criteria Match</h4>
                <ul className="text-[9px] text-[#9CA3AF] space-y-1.5 mt-2.5 list-disc pl-4 text-left">
                  <li>Minimum CGPA: 7.0</li>
                  <li>No active backlogs</li>
                  <li>Coding Skill Assessment score &gt; 65%</li>
                </ul>
              </div>
              <Link to="/placements" className="uiverse-btn-slide text-[10px] py-1.5 px-3 justify-center shadow-none">
                Launch ATS Scanner
                <ArrowRight className="w-3.5 h-3.5 arrow-icon" />
              </Link>
            </div>
          </div>
        </div>

        {/* WIDGET 3: LEADERBOARD - 3D FLIP CARD */}
        <div className="flip-card cursor-pointer">
          <div className="flip-card-inner">
            <div className="flip-card-front p-6 flex items-center justify-between text-left">
              <div className="space-y-2">
                <span className="text-[9px] text-amber-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" />
                  Leaderboard Stats
                </span>
                <h3 className="text-base font-extrabold text-[#F3F4F6]">Level {user?.level || 1} Rank</h3>
                <p className="text-[10px] text-[#9CA3AF]">Earn XP by uploading notes and logging event attendances.</p>
              </div>
              <div className="w-14 h-14 rounded-full border-2 border-violet-500/30 flex items-center justify-center font-extrabold text-violet-400 text-base bg-violet-500/5 shadow-inner flex-shrink-0 ml-2">
                #{user?.id || 1}
              </div>
            </div>
            <div className="flip-card-back p-5 flex flex-col justify-between text-left">
              <div>
                <span className="text-[9px] text-amber-400 font-bold uppercase tracking-widest block mb-2">Campus Top Ranks</span>
                <div className="space-y-1.5 mt-2">
                  {leaderboard.slice(0, 3).map((peer, idx) => (
                    <div key={peer.id || idx} className="flex justify-between items-center text-[10px] border-b border-[#1E293B] pb-1">
                      <span className="text-[#F3F4F6] truncate max-w-[120px]">{idx + 1}. {peer.username}</span>
                      <span className="text-violet-400 font-bold">{peer.xp} XP</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link to="/profile" className="text-[9px] font-bold text-cyan-400 hover:underline flex items-center justify-center gap-0.5">
                My Profile Ledger <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* WIDGET 4: CAMPUS NOTICES */}
        <div className="rounded-xl border border-[#1E293B] bg-[#0F172A] p-6 space-y-4 text-left">
          <div className="flex justify-between items-center">
            <span className="text-[9px] text-rose-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" />
              Campus Notices
            </span>
            <div className="uiverse-tooltip-container">
              <Link to="/notices" className="text-[10px] text-violet-400 font-semibold hover:underline">View Ticker</Link>
              <span className="uiverse-tooltip">Open notice board</span>
            </div>
          </div>

          <div className="space-y-3">
            {notices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-[#9CA3AF]">
                <Inbox className="w-8 h-8 opacity-25" />
                <span className="text-[10px] mt-1">No announcements posted</span>
              </div>
            ) : (
              notices.slice(0, 2).map((n) => (
                <div
                  key={n.id}
                  className="p-3 bg-[#020617]/50 border border-[#1E293B] rounded-xl cursor-pointer hover:border-blue-500/20 hover:bg-[#020617]/80 transition-all duration-300"
                  onClick={() => handleNoticeClick(n)}
                >
                  <h4 className="text-xs font-bold truncate text-[#F3F4F6]">{n.title}</h4>
                  <p className="text-[10px] text-[#9CA3AF] mt-1.5 line-clamp-1">{n.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* WIDGET 5: SEMINARS GRID */}
        <div className="rounded-xl border border-[#1E293B] bg-[#0F172A] p-6 space-y-4 text-left">
          <div className="flex justify-between items-center">
            <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Seminars Grid
            </span>
            <div className="uiverse-tooltip-container">
              <Link to="/events" className="text-[10px] text-cyan-400 font-semibold hover:underline">Calendar</Link>
              <span className="uiverse-tooltip">View full schedule</span>
            </div>
          </div>

          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-[#9CA3AF]">
                <Inbox className="w-8 h-8 opacity-25" />
                <span className="text-[10px] mt-1">No upcoming seminars</span>
              </div>
            ) : (
              events.slice(0, 2).map((e) => (
                <div key={e.id} className="p-3 bg-[#020617]/50 border border-[#1E293B] rounded-xl">
                  <h4 className="text-xs font-bold truncate text-[#F3F4F6]">{e.title}</h4>
                  <div className="flex items-center justify-between mt-2 text-[9px] text-[#9CA3AF]">
                    <span>{e.location}</span>
                    <span className="text-cyan-400 font-semibold">RSVP: {e.rsvp_count}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
