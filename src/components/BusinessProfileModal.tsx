import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Share2,
  Lightbulb,
  ImagePlus,
  PenTool,
  Upload,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const BusinessProfileModal: React.FC = () => {
  const { businessProfile, updateBusinessProfile, isProfileModalOpen, setIsProfileModalOpen } = useApp();

  const [activeTab, setActiveTab] = useState<'BASIC' | 'BUSINESS'>('BASIC');
  const [formData, setFormData] = useState(businessProfile);
  const [isDrawingSignature, setIsDrawingSignature] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isProfileModalOpen) return null;

  // Calculate profile completion percentage
  const fields = [
    formData.name,
    formData.phone1,
    formData.email,
    formData.address,
    formData.pincode,
    formData.description,
    formData.logoUrl,
    formData.signatureUrl,
  ];
  const filledCount = fields.filter((f) => Boolean(f && f.trim())).length;
  const completionPercentage = Math.round((filledCount / fields.length) * 100);

  const handleSave = () => {
    updateBusinessProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsProfileModalOpen(false);
    }, 800);
  };

  const handleShareCard = () => {
    const cardText = `📇 Business Visiting Card\n*${formData.name}*\n📞 Phone: ${formData.phone1}\n✉️ Email: ${formData.email}\n📍 Address: ${formData.address}\n\nGenerated with Billora Billing App`;
    if (navigator.share) {
      navigator.share({ title: formData.name, text: cardText }).catch(() => {});
    } else {
      navigator.clipboard.writeText(cardText);
      alert('Business Visiting Card details copied to clipboard!');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Simple canvas signature drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#1e3a8a';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setFormData((prev) => ({ ...prev, signatureUrl: canvas.toDataURL() }));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setFormData((prev) => ({ ...prev, signatureUrl: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl flex flex-col max-h-screen sm:max-h-[92vh] overflow-hidden">
        {/* Header (Screenshot 5 exact match) */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <button
              id="btn-close-profile-back"
              onClick={() => setIsProfileModalOpen(false)}
              className="p-1 text-gray-700 hover:text-gray-900 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
            <h2 className="text-base font-bold text-gray-900">Business Profile</h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-200">
              <Sparkles className="w-3 h-3 text-rose-500 fill-rose-500" /> Mobile Freemium
            </span>
            <label className="cursor-pointer p-1 text-sky-600 hover:bg-sky-50 rounded-lg">
              <ImagePlus className="w-5 h-5" />
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Visiting Card Preview (Screenshots 5 & 6 exact match) */}
          <div className="bg-gradient-to-br from-white to-rose-50/40 rounded-2xl border border-gray-200 p-4 shadow-sm relative overflow-hidden">
            {/* Background design accents */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-rose-100/30 -rotate-45 translate-x-12 -translate-y-12 pointer-events-none"></div>

            <div className="flex items-start justify-between">
              <div className="space-y-1.5 max-w-[70%]">
                <h3 className="text-lg font-black text-[#e52b44] tracking-tight">
                  {formData.name || 'My Company'}
                </h3>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sky-600 font-semibold">📞</span>
                    <span className="font-medium text-gray-700">{formData.phone1 || '3256181588'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sky-600 font-semibold">✉️</span>
                    <span>{formData.email || 'Email ID'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sky-600 font-semibold">📍</span>
                    <span className="truncate">{formData.address || 'Business Address'}</span>
                  </div>
                </div>
              </div>

              {/* Logo Box */}
              <label className="w-16 h-16 border-2 border-dashed border-sky-400 rounded-xl bg-sky-50/50 flex flex-col items-center justify-center cursor-pointer hover:bg-sky-100 transition-colors shrink-0 overflow-hidden">
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt="Logo"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <>
                    <span className="text-sky-600 font-bold text-xs">+</span>
                    <span className="text-sky-600 font-bold text-[10px]">Logo</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>

            {/* Red Pill Share Card Button */}
            <div className="mt-4 flex justify-center">
              <button
                id="btn-share-visiting-card"
                onClick={handleShareCard}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#e52b44] hover:bg-[#d0243b] text-white rounded-full font-bold text-xs shadow-md active:scale-95 transition-all"
              >
                <Share2 className="w-4 h-4 stroke-[2.2]" />
                <span>Share Card</span>
              </button>
            </div>
          </div>

          {/* Tip Banner (Screenshot 5 exact match) */}
          <div className="bg-sky-50/80 border border-sky-100 rounded-xl p-3 flex items-start gap-2.5">
            <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-700 leading-snug">
              67% businessmen saw their business increase after sharing their visiting card
            </p>
          </div>

          {/* Profile Progress (Screenshot 5 exact match) */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1.5">
              <span>Profile {completionPercentage}% complete.</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(10, completionPercentage)}%` }}
              ></div>
            </div>
          </div>

          {/* Form Tabs: Basic Details | Business Details (Screenshot 5 & 6) */}
          <div className="flex border-b border-gray-200 pt-2">
            <button
              onClick={() => setActiveTab('BASIC')}
              className={`flex-1 pb-2.5 text-xs font-bold transition-all relative ${
                activeTab === 'BASIC' ? 'text-[#e52b44]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Basic Details
              {activeTab === 'BASIC' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e52b44]"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('BUSINESS')}
              className={`flex-1 pb-2.5 text-xs font-bold transition-all relative ${
                activeTab === 'BUSINESS' ? 'text-[#e52b44]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Business Details
              {activeTab === 'BUSINESS' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e52b44]"></span>
              )}
            </button>
          </div>

          {/* Form Content */}
          {activeTab === 'BASIC' ? (
            <div className="space-y-4 pt-1">
              {/* Business Name */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Business Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Company"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Phone Number 1 */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Phone Number 1</label>
                <input
                  type="text"
                  value={formData.phone1}
                  onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
                  placeholder="3256181588"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Phone Number 2 */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Phone Number 2</label>
                <input
                  type="text"
                  value={formData.phone2 || ''}
                  onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                  placeholder="Secondary phone number"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          ) : (
            /* Business Details (Screenshots 6 & 7) */
            <div className="space-y-4 pt-1">
              {/* Email ID */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Email ID</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email ID"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Business Address */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Business Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Business Address"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Pincode */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="Pincode"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Business Description */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Business Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Business Description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Signature Section (Screenshot 7 exact replication) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-800">Signature</label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[140px] bg-gray-50/50 relative">
                  {formData.signatureUrl && !isDrawingSignature ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={formData.signatureUrl}
                        alt="Signature"
                        className="max-h-20 object-contain"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={clearSignature}
                        className="text-[11px] text-red-600 font-semibold mt-2 hover:underline"
                      >
                        Remove Signature
                      </button>
                    </div>
                  ) : isDrawingSignature ? (
                    <div className="w-full flex flex-col items-center">
                      <canvas
                        ref={canvasRef}
                        width={320}
                        height={120}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="bg-white border rounded-xl shadow-inner w-full cursor-crosshair"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={clearSignature}
                          className="text-[11px] text-gray-500 px-2 py-1 bg-gray-200 rounded-md"
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsDrawingSignature(false)}
                          className="text-[11px] text-sky-700 px-3 py-1 bg-sky-100 rounded-md font-bold"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-gray-200 flex items-center justify-center text-sky-600 mb-2">
                        <PenTool className="w-5 h-5 stroke-[2]" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">Create your signature here</span>
                    </>
                  )}
                </div>

                {/* Create & Upload pill buttons (Screenshot 7) */}
                <div className="flex items-center justify-center gap-4 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsDrawingSignature(true)}
                    className="px-6 py-2 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-full text-xs font-bold transition-all"
                  >
                    Create
                  </button>
                  <label className="px-6 py-2 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setFormData((prev) => ({ ...prev, signatureUrl: reader.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons: Cancel | Save (Screenshots 5, 6, 7 exact match) */}
        <div className="border-t border-gray-200 p-3 bg-white flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(false)}
            className="flex-1 py-2.5 text-center text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            id="btn-save-profile"
            onClick={handleSave}
            className="flex-1 py-2.5 text-center text-sm font-bold text-white bg-[#e52b44] hover:bg-[#d0243b] rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Saved!
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
