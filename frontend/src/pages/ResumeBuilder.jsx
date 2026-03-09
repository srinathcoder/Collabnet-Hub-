import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const STEPS = [
  { id: 'personal', title: 'Personal Info', icon: '👤', desc: 'Your name, email, phone, and location' },
  { id: 'summary', title: 'Summary', icon: '📝', desc: 'A short professional summary about yourself' },
  { id: 'education', title: 'Education', icon: '🎓', desc: 'Your academic background' },
  { id: 'experience', title: 'Experience', icon: '💼', desc: 'Your work experience' },
  { id: 'skills', title: 'Skills', icon: '⚡', desc: 'Technical and soft skills' },
  { id: 'projects', title: 'Projects', icon: '🚀', desc: 'Notable projects you have built' },
  { id: 'certifications', title: 'Certifications', icon: '🏆', desc: 'Certifications and achievements' },
  { id: 'preview', title: 'Preview & Download', icon: '📄', desc: 'Review and download your resume' },
];

function ResumeBuilder() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const resumeRef = useRef(null);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    summary: '',
    education: [{ degree: '', institution: '', year: '', grade: '' }],
    experience: [{ title: '', company: '', duration: '', description: '' }],
    skills: '',
    projects: [{ name: '', description: '', tech: '', link: '' }],
    certifications: [{ name: '', issuer: '', year: '' }],
  });

  const set = (field, value) => setFormData({ ...formData, [field]: value });
  const setArrayItem = (field, index, key, value) => {
    const arr = [...formData[field]];
    arr[index] = { ...arr[index], [key]: value };
    setFormData({ ...formData, [field]: arr });
  };
  const addArrayItem = (field, template) => setFormData({ ...formData, [field]: [...formData[field], template] });
  const removeArrayItem = (field, index) => {
    if (formData[field].length <= 1) return;
    setFormData({ ...formData, [field]: formData[field].filter((_, i) => i !== index) });
  };

  const next = () => setStep(Math.min(step + 1, STEPS.length - 1));
  const prev = () => setStep(Math.max(step - 1, 0));

  const handleDownload = () => {
    const content = resumeRef.current;
    if (!content) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
      <head>
        <title>${formData.fullName} - Resume</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a2e; padding: 40px 50px; line-height: 1.5; }
          h1 { font-size: 28px; color: #1a1a2e; margin-bottom: 4px; }
          h2 { font-size: 14px; color: #4338ca; text-transform: uppercase; letter-spacing: 2px; border-bottom: 2px solid #4338ca; padding-bottom: 4px; margin: 22px 0 10px 0; }
          h3 { font-size: 15px; color: #1e1e3f; }
          p, li, span { font-size: 13px; color: #333; }
          .contact { font-size: 12px; color: #555; margin-bottom: 16px; }
          .contact a { color: #4338ca; text-decoration: none; }
          .summary { font-style: italic; color: #444; margin-bottom: 6px; font-size: 13px; }
          .entry { margin-bottom: 12px; }
          .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
          .entry-header .right { font-size: 12px; color: #666; text-align: right; }
          .entry-sub { font-size: 12px; color: #555; margin-top: 1px; }
          .entry-desc { font-size: 13px; color: #444; margin-top: 4px; white-space: pre-line; }
          .skills-list { display: flex; flex-wrap: wrap; gap: 6px; }
          .skill-tag { background: #eef2ff; color: #4338ca; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; }
          .proj-tech { font-size: 11px; color: #666; margin-top: 2px; }
          .proj-link { font-size: 11px; color: #4338ca; }
          @media print { body { padding: 30px 40px; } }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 400);
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition";
  const labelClass = "block text-sm font-medium text-gray-400 mb-1.5";

  const renderStep = () => {
    switch (STEPS[step].id) {
      case 'personal':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>Full Name *</label><input value={formData.fullName} onChange={e => set('fullName', e.target.value)} placeholder="John Doe" className={inputClass} /></div>
              <div><label className={labelClass}>Email *</label><input value={formData.email} onChange={e => set('email', e.target.value)} placeholder="john@example.com" className={inputClass} /></div>
              <div><label className={labelClass}>Phone</label><input value={formData.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" className={inputClass} /></div>
              <div><label className={labelClass}>Location</label><input value={formData.location} onChange={e => set('location', e.target.value)} placeholder="City, Country" className={inputClass} /></div>
              <div><label className={labelClass}>LinkedIn URL</label><input value={formData.linkedin} onChange={e => set('linkedin', e.target.value)} placeholder="linkedin.com/in/username" className={inputClass} /></div>
              <div><label className={labelClass}>GitHub URL</label><input value={formData.github} onChange={e => set('github', e.target.value)} placeholder="github.com/username" className={inputClass} /></div>
            </div>
            <div><label className={labelClass}>Portfolio Website</label><input value={formData.portfolio} onChange={e => set('portfolio', e.target.value)} placeholder="yourportfolio.com" className={inputClass} /></div>
          </div>
        );
      case 'summary':
        return (
          <div>
            <label className={labelClass}>Professional Summary</label>
            <p className="text-xs text-gray-500 mb-3">Write 2-3 sentences about yourself, your experience, and career goals.</p>
            <textarea value={formData.summary} onChange={e => set('summary', e.target.value)} rows="5" placeholder="Passionate software developer with 2+ years of experience in React and Node.js..." className={`${inputClass} resize-none`} />
          </div>
        );
      case 'education':
        return (
          <div className="space-y-4">
            {formData.education.map((edu, i) => (
              <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-300">Education #{i + 1}</span>
                  {formData.education.length > 1 && <button onClick={() => removeArrayItem('education', i)} className="text-xs text-red-400 hover:text-red-300">Remove</button>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input value={edu.degree} onChange={e => setArrayItem('education', i, 'degree', e.target.value)} placeholder="B.Tech in Computer Science" className={inputClass} />
                  <input value={edu.institution} onChange={e => setArrayItem('education', i, 'institution', e.target.value)} placeholder="University Name" className={inputClass} />
                  <input value={edu.year} onChange={e => setArrayItem('education', i, 'year', e.target.value)} placeholder="2020 - 2024" className={inputClass} />
                  <input value={edu.grade} onChange={e => setArrayItem('education', i, 'grade', e.target.value)} placeholder="CGPA: 8.5 / 10" className={inputClass} />
                </div>
              </div>
            ))}
            <button onClick={() => addArrayItem('education', { degree: '', institution: '', year: '', grade: '' })}
              className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">+ Add Education</button>
          </div>
        );
      case 'experience':
        return (
          <div className="space-y-4">
            {formData.experience.map((exp, i) => (
              <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-300">Experience #{i + 1}</span>
                  {formData.experience.length > 1 && <button onClick={() => removeArrayItem('experience', i)} className="text-xs text-red-400 hover:text-red-300">Remove</button>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input value={exp.title} onChange={e => setArrayItem('experience', i, 'title', e.target.value)} placeholder="Software Developer" className={inputClass} />
                  <input value={exp.company} onChange={e => setArrayItem('experience', i, 'company', e.target.value)} placeholder="Company Name" className={inputClass} />
                  <input value={exp.duration} onChange={e => setArrayItem('experience', i, 'duration', e.target.value)} placeholder="Jan 2023 - Present" className={inputClass} />
                </div>
                <textarea value={exp.description} onChange={e => setArrayItem('experience', i, 'description', e.target.value)} placeholder="• Built RESTful APIs&#10;• Led a team of 5 developers&#10;• Improved performance by 40%" rows="3" className={`${inputClass} resize-none`} />
              </div>
            ))}
            <button onClick={() => addArrayItem('experience', { title: '', company: '', duration: '', description: '' })}
              className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">+ Add Experience</button>
          </div>
        );
      case 'skills':
        return (
          <div>
            <label className={labelClass}>Skills</label>
            <p className="text-xs text-gray-500 mb-3">Separate skills with commas. e.g. React, Node.js, Python, SQL</p>
            <textarea value={formData.skills} onChange={e => set('skills', e.target.value)} rows="4" placeholder="React, Node.js, Python, PostgreSQL, Docker, Git, REST APIs, TypeScript, Tailwind CSS" className={`${inputClass} resize-none`} />
            {formData.skills && (
              <div className="flex flex-wrap gap-2 mt-4">
                {formData.skills.split(',').map(s => s.trim()).filter(s => s).map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-lg text-xs font-bold border border-indigo-500/20">{s}</span>
                ))}
              </div>
            )}
          </div>
        );
      case 'projects':
        return (
          <div className="space-y-4">
            {formData.projects.map((proj, i) => (
              <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-300">Project #{i + 1}</span>
                  {formData.projects.length > 1 && <button onClick={() => removeArrayItem('projects', i)} className="text-xs text-red-400 hover:text-red-300">Remove</button>}
                </div>
                <input value={proj.name} onChange={e => setArrayItem('projects', i, 'name', e.target.value)} placeholder="Project Name" className={inputClass} />
                <textarea value={proj.description} onChange={e => setArrayItem('projects', i, 'description', e.target.value)} placeholder="A web app that does X using Y..." rows="2" className={`${inputClass} resize-none`} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input value={proj.tech} onChange={e => setArrayItem('projects', i, 'tech', e.target.value)} placeholder="React, Node.js, MongoDB" className={inputClass} />
                  <input value={proj.link} onChange={e => setArrayItem('projects', i, 'link', e.target.value)} placeholder="github.com/user/project" className={inputClass} />
                </div>
              </div>
            ))}
            <button onClick={() => addArrayItem('projects', { name: '', description: '', tech: '', link: '' })}
              className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">+ Add Project</button>
          </div>
        );
      case 'certifications':
        return (
          <div className="space-y-4">
            {formData.certifications.map((cert, i) => (
              <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-300">Certification #{i + 1}</span>
                  {formData.certifications.length > 1 && <button onClick={() => removeArrayItem('certifications', i)} className="text-xs text-red-400 hover:text-red-300">Remove</button>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input value={cert.name} onChange={e => setArrayItem('certifications', i, 'name', e.target.value)} placeholder="AWS Cloud Practitioner" className={inputClass} />
                  <input value={cert.issuer} onChange={e => setArrayItem('certifications', i, 'issuer', e.target.value)} placeholder="Amazon Web Services" className={inputClass} />
                  <input value={cert.year} onChange={e => setArrayItem('certifications', i, 'year', e.target.value)} placeholder="2024" className={inputClass} />
                </div>
              </div>
            ))}
            <button onClick={() => addArrayItem('certifications', { name: '', issuer: '', year: '' })}
              className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">+ Add Certification</button>
          </div>
        );
      case 'preview':
        return renderPreview();
      default:
        return null;
    }
  };

  const skillsList = formData.skills.split(',').map(s => s.trim()).filter(s => s);
  const contactParts = [formData.email, formData.phone, formData.location].filter(Boolean);
  const linkParts = [
    formData.linkedin ? { label: 'LinkedIn', url: formData.linkedin } : null,
    formData.github ? { label: 'GitHub', url: formData.github } : null,
    formData.portfolio ? { label: 'Portfolio', url: formData.portfolio } : null,
  ].filter(Boolean);

  const renderPreview = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Resume Preview</h3>
        <button onClick={handleDownload} className="btn-primary flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Download PDF
        </button>
      </div>

      {/* Resume render area */}
      <div ref={resumeRef} className="bg-white rounded-xl p-8 md:p-10 text-gray-900 shadow-xl max-w-[800px] mx-auto" style={{ fontFamily: "'Segoe UI', Tahoma, sans-serif" }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1a1a2e', marginBottom: '2px' }}>{formData.fullName || 'Your Name'}</h1>
        <div className="contact" style={{ fontSize: '12px', color: '#555', marginBottom: '14px' }}>
          {contactParts.join(' | ')}
          {linkParts.length > 0 && <> | {linkParts.map((l, i) => <span key={i}>{i > 0 && ' | '}<a href={l.url.startsWith('http') ? l.url : `https://${l.url}`} style={{ color: '#4338ca' }}>{l.label}</a></span>)}</>}
        </div>

        {formData.summary && (<><h2 style={{ fontSize: '13px', color: '#4338ca', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '2px solid #4338ca', paddingBottom: '3px', margin: '18px 0 8px 0', fontWeight: 700 }}>Professional Summary</h2><p style={{ fontSize: '13px', color: '#444', fontStyle: 'italic', lineHeight: 1.6 }}>{formData.summary}</p></>)}

        {formData.education.some(e => e.degree || e.institution) && (
          <><h2 style={{ fontSize: '13px', color: '#4338ca', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '2px solid #4338ca', paddingBottom: '3px', margin: '18px 0 8px 0', fontWeight: 700 }}>Education</h2>
          {formData.education.filter(e => e.degree || e.institution).map((edu, i) => (
            <div key={i} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e1e3f' }}>{edu.degree}</h3><span style={{ fontSize: '12px', color: '#666' }}>{edu.year}</span></div>
              <p style={{ fontSize: '12px', color: '#555' }}>{edu.institution}{edu.grade ? ` — ${edu.grade}` : ''}</p>
            </div>
          ))}</>
        )}

        {formData.experience.some(e => e.title || e.company) && (
          <><h2 style={{ fontSize: '13px', color: '#4338ca', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '2px solid #4338ca', paddingBottom: '3px', margin: '18px 0 8px 0', fontWeight: 700 }}>Experience</h2>
          {formData.experience.filter(e => e.title || e.company).map((exp, i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e1e3f' }}>{exp.title}</h3><span style={{ fontSize: '12px', color: '#666' }}>{exp.duration}</span></div>
              <p style={{ fontSize: '12px', color: '#555' }}>{exp.company}</p>
              {exp.description && <p style={{ fontSize: '13px', color: '#444', marginTop: '4px', whiteSpace: 'pre-line', lineHeight: 1.5 }}>{exp.description}</p>}
            </div>
          ))}</>
        )}

        {skillsList.length > 0 && (
          <><h2 style={{ fontSize: '13px', color: '#4338ca', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '2px solid #4338ca', paddingBottom: '3px', margin: '18px 0 8px 0', fontWeight: 700 }}>Skills</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {skillsList.map((s, i) => <span key={i} style={{ background: '#eef2ff', color: '#4338ca', padding: '3px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>{s}</span>)}
          </div></>
        )}

        {formData.projects.some(p => p.name) && (
          <><h2 style={{ fontSize: '13px', color: '#4338ca', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '2px solid #4338ca', paddingBottom: '3px', margin: '18px 0 8px 0', fontWeight: 700 }}>Projects</h2>
          {formData.projects.filter(p => p.name).map((proj, i) => (
            <div key={i} style={{ marginBottom: '10px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e1e3f' }}>{proj.name}</h3>
              {proj.description && <p style={{ fontSize: '13px', color: '#444', marginTop: '2px', lineHeight: 1.5 }}>{proj.description}</p>}
              {proj.tech && <p style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>Tech: {proj.tech}</p>}
              {proj.link && <p style={{ fontSize: '11px', marginTop: '1px' }}><a href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} style={{ color: '#4338ca' }}>{proj.link}</a></p>}
            </div>
          ))}</>
        )}

        {formData.certifications.some(c => c.name) && (
          <><h2 style={{ fontSize: '13px', color: '#4338ca', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '2px solid #4338ca', paddingBottom: '3px', margin: '18px 0 8px 0', fontWeight: 700 }}>Certifications</h2>
          {formData.certifications.filter(c => c.name).map((cert, i) => (
            <div key={i} style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: '#333' }}><strong>{cert.name}</strong>{cert.issuer ? ` — ${cert.issuer}` : ''}</span>
              <span style={{ fontSize: '12px', color: '#666' }}>{cert.year}</span>
            </div>
          ))}</>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Resume <span className="text-gradient">Builder</span></h1>
            <p className="text-gray-500 mt-1">Build a professional resume in minutes</p>
          </div>
          <button onClick={() => navigate('/candidate/dashboard')}
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Dashboard
          </button>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <button key={s.id} onClick={() => setStep(i)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                i === step ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' :
                i < step ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                'bg-white/5 text-gray-500 border border-white/10'
              }`}>
              <span>{s.icon}</span> {s.title}
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="card-dark mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">{STEPS[step].icon}</span> {STEPS[step].title}
            </h2>
            <p className="text-gray-500 text-sm mt-1">{STEPS[step].desc}</p>
          </div>
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button onClick={prev} disabled={step === 0}
            className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${step === 0 ? 'opacity-30 cursor-not-allowed bg-white/5 text-gray-400' : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'}`}>
            ← Previous
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={next} className="btn-primary text-sm">Next →</button>
          ) : (
            <button onClick={handleDownload} className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Download Resume PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResumeBuilder;
