"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Upload, ArrowLeft, CheckCircle2, Star,
    Info, Briefcase, User, DollarSign, MapPin, Calendar, FileText
} from 'lucide-react';
import Link from 'next/link';

export default function AddProject() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const categories = [
        'Residential', 'Commercial', 'Industrial', 'Healthcare',
        'Infrastructure', 'Premium', 'Recently Completed', 'Award Winning'
    ];

    // 1. FORM STATE
    const [formData, setFormData] = useState({
        name: '',
        category: 'Residential',
        description: '',
        location: '',
        client_name: '',
        completion_date: '',
        project_manager: '',
        project_value: '',
        partner: '',
        is_featured: false
    });

    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleFiles = (files) => {
        const arr = Array.from(files || [])
            .filter(file => file.type.startsWith("image/"))
            .map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }));

        setSelectedFiles(arr);
    };

    useEffect(() => {
        return () => {
            selectedFiles.forEach(item => {
                URL.revokeObjectURL(item.preview);
            });
        };
    }, [selectedFiles]);

    // 2. SUBMIT LOGIC
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // STEP 1: Save Project Text Data
            const res = await fetch('http://localhost:5000/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.id) {
                // STEP 2: Upload Images using the new Project ID
                if (selectedFiles.length > 0) {
                    const imageFormData = new FormData();
                    for (let i = 0; i < selectedFiles.length; i++) {
                        imageFormData.append('images', selectedFiles[i]);
                    }

                    await fetch(`http://localhost:5000/api/projects/${data.id}/upload`, {
                        method: 'POST',
                        body: imageFormData
                    });
                }

                setSuccess(true);
                setTimeout(() => router.push('/'), 2000);
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("Something went wrong with the upload!");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white text-slate-900">
                <CheckCircle2 className="w-20 h-20 text-green-500 mb-4 animate-bounce" />
                <h1 className="text-4xl font-black tracking-tighter">Project Published</h1>
                <p className="text-slate-500 mt-2 text-lg">Returning to repository...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12 text-slate-900">
            <div className="max-w-4xl mx-auto">

                {/* HEADER */}
                <header className="mb-10">
                    <Link href="/" className="flex items-center text-blue-600 mb-4 hover:underline font-bold text-xs uppercase tracking-widest">
                        <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create New Project</h1>
                    <p className="text-slate-500 mt-1 text-base">Register project specifications and media assets.</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* SECTION 1: IDENTITY */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Info size={16} className="text-blue-500" /> Project Identity
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormGroup label="Project Name">
                                <input required type="text" placeholder="e.g. Grand Central Station" className="form-input"
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </FormGroup>

                            <FormGroup label="Category">
                                <select value={formData.category} className="form-input appearance-none bg-white"
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </FormGroup>
                        </div>
                    </div>

                    {/* SECTION 2: STAKEHOLDERS */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Briefcase size={16} className="text-blue-500" /> Stakeholders & Value
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormGroup label="Project Manager" icon={<User size={14} />}>
                                <input type="text" placeholder="Manager Name" className="form-input"
                                    onChange={(e) => setFormData({ ...formData, project_manager: e.target.value })} />
                            </FormGroup>

                            <FormGroup label="Project Value" icon={<DollarSign size={14} />}>
                                <input type="text" placeholder="e.g. $10M" className="form-input"
                                    onChange={(e) => setFormData({ ...formData, project_value: e.target.value })} />
                            </FormGroup>

                            <FormGroup label="Client Name">
                                <input required type="text" placeholder="Organization Name" className="form-input"
                                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })} />
                            </FormGroup>

                            <FormGroup label="Partner">
                                <input type="text" placeholder="Key Contact" className="form-input"
                                    onChange={(e) => setFormData({ ...formData, partner: e.target.value })} />
                            </FormGroup>
                        </div>
                    </div>

                    {/* SECTION 3: LOGISTICS */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <MapPin size={16} className="text-blue-500" /> Location & Schedule
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <FormGroup label="Site Location">
                                <input type="text" placeholder="City, State" className="form-input"
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                            </FormGroup>

                            <FormGroup label="Completion Date">
                                <input type="date" className="form-input"
                                    onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })} />
                            </FormGroup>
                        </div>

                        <FormGroup label="Detailed Description">
                            <textarea rows="3" placeholder="Overview of architectural scope..." className="form-input resize-none"
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
                        </FormGroup>
                    </div>

                    {/* SECTION 4: MEDIA */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Upload size={16} className="text-blue-500" /> Media & Visibility
                        </h3>
                        <div
                            className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all hover:bg-slate-50 group mb-8
    ${isDragging ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-300"}
  `}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                handleFiles(e.dataTransfer.files);
                            }}
                        >
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                id="file-upload"
                                onChange={(e) => handleFiles(e.target.files)}
                            />
                            <label htmlFor="file-upload" className="cursor-pointer">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <Upload className="text-blue-600" />
                                </div>
                                <p className="text-lg font-bold text-slate-700">Select Visual Assets</p>
                                <p className="text-sm text-slate-400 mt-1">{selectedFiles?.length > 0 ? `${selectedFiles.length} files staged` : 'Drag or click to browse'}</p>
                            </label>
                        </div>
                        {selectedFiles.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                {selectedFiles.map((item, index) => (
                                    <div key={index} className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">

                                        <img
                                            src={item.preview}
                                            className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedFiles(prev =>
                                                    prev.filter((_, i) => i !== index)
                                                )
                                            }
                                            className="absolute top-2 right-2 bg-red-500 text-white text-xs p-1 rounded-full opacity-0 group-hover:opacity-100"
                                        >
                                            ✕
                                        </button>

                                    </div>
                                ))}
                            </div>
                        )}

                        <div
                            onClick={() =>
                                setFormData(prev => ({
                                    ...prev,
                                    is_featured: !prev.is_featured
                                }))
                            }
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer select-none active:scale-[0.99] flex justify-between items-center ${formData?.is_featured
                                    ? "bg-amber-50 border-amber-500"
                                    : "bg-slate-50 border-transparent"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Star
                                    size={20}
                                    fill={formData?.is_featured ? "#f59e0b" : "none"}
                                    className={
                                        formData?.is_featured ? "text-amber-500" : "text-slate-400"
                                    }
                                />

                                <span className="text-sm font-bold text-amber-900">
                                    Featured Status
                                </span>
                            </div>

                            {/* toggle switch */}
                            <div
                                className={`w-10 h-5 rounded-full relative transition-colors ${formData?.is_featured ? "bg-amber-500" : "bg-slate-300"
                                    }`}
                            >
                                <div
                                    className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData?.is_featured ? "right-1" : "left-1"
                                        }`}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:bg-slate-300">
                        {loading ? "Publishing to Hub..." : "Publish Project to Repository"}
                    </button>
                </form>
            </div>

            <style jsx>{`
        .form-input {
          width: 100%;
          padding: 1rem;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          font-weight: 600;
          outline: none;
          transition: all 0.2s;
        }
        .form-input:focus {
          background-color: #fff;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
      `}</style>
        </div>
    );
}

function FormGroup({ label, children, icon }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                {label}
            </label>
            {children}
        </div>
    );
}