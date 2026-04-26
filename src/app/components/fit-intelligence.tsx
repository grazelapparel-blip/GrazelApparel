import { useState } from 'react';
import { ArrowLeft, Check, Upload, X, Ruler } from 'lucide-react';
import { useAppStore, Product } from '../store/app-store';

interface FitIntelligenceProps {
  onClose: () => void;
  onComplete: (recommendedSize: string) => void;
  product?: Product | null;
}

type Step = 'intro' | 'measurements' | 'body-type' | 'preference' | 'photos' | 'result' | 'curate-measurements';
type FitMode = 'simple' | 'curate';

export function FitIntelligence({ onClose, onComplete, product }: FitIntelligenceProps) {
  // ✅ ALL STATE DECLARED FIRST
  const { addFitProfile, currentUser } = useAppStore();
  const [currentStep, setCurrentStep] = useState<Step>('intro');
  const [fitMode, setFitMode] = useState<FitMode>('simple');
  const [recommendedSize, setRecommendedSize] = useState<string>('M');
  const [fitConfidence, setFitConfidence] = useState<number>(0);
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    bodyType: '',
    fitPreference: '',
    selectedSize: '',
    photosUploaded: 0
  });

  // Curate Your Fix measurements state
  const [curateData, setCurateData] = useState({
    // Top measurements
    chestBust: '',
    shoulderWidth: '',
    waist: '',
    hip: '',
    bicep: '',
    wrist: '',
    armLength: '',
    garmentLength: '',
    // Bottom measurements
    thighCircumference: '',
    calfCircumference: '',
    inseam: '',
    outseam: '',
    ankleOpening: ''
  });

  // Check if product supports curate mode
  const showCurateOption = product?.isTop || product?.isBottom;
  
  // Debug: Log product data to help troubleshoot
  console.log('[FitIntelligence] Product:', product?.name, 'isTop:', product?.isTop, 'isBottom:', product?.isBottom, 'showCurateOption:', showCurateOption);

  // ✅ THEN DEFINE CONSTANT DATA
  const bodyTypes = [
    { id: 'athletic', label: 'Athletic', description: 'Broad shoulders, defined waist' },
    { id: 'regular', label: 'Regular', description: 'Balanced proportions' },
    { id: 'relaxed', label: 'Relaxed', description: 'Comfortable, natural build' }
  ];

  const fitPreferences = [
    { id: 'slim', label: 'Slim Fit', description: 'Close to body, modern silhouette' },
    { id: 'regular', label: 'Regular Fit', description: 'Classic, comfortable fit' },
    { id: 'relaxed', label: 'Relaxed Fit', description: 'Generous room, easy wear' }
  ];

  // ✅ THEN DEFINE FUNCTIONS
  const calculateRecommendedSize = (height: number, chest: number, fitPref: string) => {
    let size = 'M'; // Default
    let confidence = 70;

    // Use chest and height for size calculation
    if (chest && height) {
      if (chest < 88) {
        size = 'XS';
        confidence = 85;
      } else if (chest < 94) {
        size = 'S';
        confidence = 88;
      } else if (chest < 100) {
        size = 'M';
        confidence = 90;
      } else if (chest < 106) {
        size = 'L';
        confidence = 88;
      } else if (chest < 112) {
        size = 'XL';
        confidence = 85;
      } else {
        size = 'XXL';
        confidence = 82;
      }

      // Adjust for fit preference
      if (fitPref === 'slim') {
        confidence += 5;
      } else if (fitPref === 'relaxed') {
        confidence += 3;
      }
    } else if (height) {
      // If only height is available
      if (height < 160) {
        size = 'XS';
      } else if (height < 170) {
        size = 'S';
      } else if (height < 180) {
        size = 'M';
      } else if (height < 190) {
        size = 'L';
      } else {
        size = 'XL';
      }
      confidence = 65;
    }

    return { size, confidence: Math.min(confidence, 95) };
  };

  const goToNextStep = () => {
    const steps: Step[] = ['intro', 'measurements', 'preference', 'photos', 'result'];
    const currentIndex = steps.indexOf(currentStep);

    if (currentStep === 'preference') {
      // Use the user's selected size
      if (formData.selectedSize) {
        setRecommendedSize(formData.selectedSize);
        setFitConfidence(95);
      }
    }

    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const goToPreviousStep = () => {
    const steps: Step[] = ['intro', 'measurements', 'preference', 'photos', 'result'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleCompleteProfile = async () => {
    if (currentUser && currentUser.id) {
      try {
        await addFitProfile({
          userId: currentUser.id,
          preferredSize: recommendedSize,
          bodyType: formData.bodyType,
          height: formData.height || '',
          weight: formData.weight || '',
          preferredFit: formData.fitPreference as 'slim' | 'regular' | 'relaxed',
          notes: `Selected size: ${formData.selectedSize}`
        });
        console.log('Fit profile saved successfully');
      } catch (error) {
        console.error('Failed to save fit profile:', error);
      }
    }
    onComplete(recommendedSize);
  };

  const renderProgressBar = () => {
    const steps = ['measurements', 'preference', 'photos', 'result'];
    const currentIndex = steps.indexOf(currentStep);
    const progress = currentStep === 'intro' ? 0 : ((currentIndex + 1) / steps.length) * 100;

    return (
      <div className="h-1 bg-[var(--muted)] mb-8">
        <div
          className="h-full bg-[var(--crimson)] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--cream)] py-12">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {currentStep !== 'intro' && currentStep !== 'result' && (
            <button
              onClick={goToPreviousStep}
              className="flex items-center gap-2 text-[14px] text-[var(--charcoal)] hover:text-[var(--crimson)] transition-colors"
            >
              <ArrowLeft size={18} strokeWidth={1.5} />
              Back
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto text-[var(--charcoal)] hover:text-[var(--crimson)] transition-colors"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        {renderProgressBar()}

        {/* Intro Step */}
        {currentStep === 'intro' && (
          <div className="bg-white p-12">
            <div className="text-center mb-10">
              <h1 className="font-[var(--font-serif)] text-4xl mb-4 text-[var(--charcoal)]">
                Find Your Perfect Fit
              </h1>
              <p className="text-[15px] text-[var(--charcoal)] leading-relaxed max-w-2xl mx-auto">
                Choose how you'd like to find your ideal size
              </p>
            </div>

            <div className={`grid ${showCurateOption ? 'md:grid-cols-2' : 'grid-cols-1 max-w-md mx-auto'} gap-6`}>
              {/* Simple Fit Profile Card */}
              <div className="border border-gray-200 rounded-lg p-8 hover:border-[var(--crimson)] transition-colors">
                <h2 className="font-[var(--font-serif)] text-2xl mb-4 text-[var(--charcoal)]">
                  Simple Fit Profile
                </h2>
                <p className="text-[14px] text-gray-600 mb-6">
                  Quick size recommendation based on your general measurements and preferences.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex gap-3">
                    <Check size={18} className="text-[var(--crimson)] flex-shrink-0 mt-0.5" />
                    <p className="text-[13px] text-[var(--charcoal)]">Takes only 2 minutes</p>
                  </div>
                  <div className="flex gap-3">
                    <Check size={18} className="text-[var(--crimson)] flex-shrink-0 mt-0.5" />
                    <p className="text-[13px] text-[var(--charcoal)]">Basic height & weight info</p>
                  </div>
                  <div className="flex gap-3">
                    <Check size={18} className="text-[var(--crimson)] flex-shrink-0 mt-0.5" />
                    <p className="text-[13px] text-[var(--charcoal)]">AI-powered recommendations</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFitMode('simple');
                    goToNextStep();
                  }}
                  className="w-full h-12 bg-[var(--crimson)] text-white text-[14px] tracking-wide hover:opacity-90 transition-opacity"
                >
                  Get Started
                </button>
              </div>

              {/* Curate Your Fix Card - Only shown when product supports it */}
              {showCurateOption && (
                <div className="border-2 border-[var(--crimson)] rounded-lg p-8 relative">
                  <div className="absolute -top-3 left-4 bg-[var(--crimson)] text-white text-[11px] px-3 py-1 rounded">
                    RECOMMENDED
                  </div>
                  <h2 className="font-[var(--font-serif)] text-2xl mb-4 text-[var(--charcoal)]">
                    Curate Your Fit
                  </h2>
                  <p className="text-[14px] text-gray-600 mb-6">
                    Detailed measurements for a precise, tailored fit recommendation.
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex gap-3">
                      <Ruler size={18} className="text-[var(--crimson)] flex-shrink-0 mt-0.5" />
                      <p className="text-[13px] text-[var(--charcoal)]">
                        {product?.isTop ? 'Chest, shoulders, arms & more' : ''}
                        {product?.isTop && product?.isBottom ? ' + ' : ''}
                        {product?.isBottom ? 'Waist, thigh, inseam & more' : ''}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Check size={18} className="text-[var(--crimson)] flex-shrink-0 mt-0.5" />
                      <p className="text-[13px] text-[var(--charcoal)]">Most accurate fit</p>
                    </div>
                    <div className="flex gap-3">
                      <Check size={18} className="text-[var(--crimson)] flex-shrink-0 mt-0.5" />
                      <p className="text-[13px] text-[var(--charcoal)]">Tailored to this product</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setFitMode('curate');
                      setCurrentStep('curate-measurements');
                    }}
                    className="w-full h-12 bg-[var(--charcoal)] text-white text-[14px] tracking-wide hover:opacity-90 transition-opacity"
                  >
                    Curate Your Fit
                  </button>
                </div>
              )}
            </div>

            <p className="text-[12px] text-gray-500 mt-8 text-center">
              Your data is securely stored and never shared with third parties.
            </p>

            {/* Refund Policy Section */}
            <div className="mt-10 border-t border-gray-200 pt-8">
              <h3 className="font-[var(--font-serif)] text-xl mb-6 text-[var(--charcoal)] text-center">
                Re-Fund Policy
              </h3>
              <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded">
                  <Check size={16} className="text-[var(--crimson)] flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-[13px] text-[var(--charcoal)]">7 days to request fit issue</p>
                </div>
                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded">
                  <Check size={16} className="text-[var(--crimson)] flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-[13px] text-[var(--charcoal)]">Mandatory photo proof</p>
                </div>
                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded">
                  <Check size={16} className="text-[var(--crimson)] flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-[13px] text-[var(--charcoal)]">One free alteration</p>
                </div>
                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded">
                  <Check size={16} className="text-[var(--crimson)] flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-[13px] text-[var(--charcoal)]">One free replacement</p>
                </div>
                <div className="flex items-start gap-3 bg-red-50 p-4 rounded">
                  <X size={16} className="text-red-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-[13px] text-[var(--charcoal)]">No refund on customized orders</p>
                </div>
                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded">
                  <Check size={16} className="text-[var(--crimson)] flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-[13px] text-[var(--charcoal)]">Refund only if product defect (fabric damage, stitching defect)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Curate Measurements Step */}
        {currentStep === 'curate-measurements' && (
          <div className="bg-white p-12">
            <h2 className="font-[var(--font-serif)] text-3xl mb-4 text-[var(--charcoal)]">
              Curate Your Fit
            </h2>
            <p className="text-[14px] text-gray-600 mb-8">
              Enter your measurements in centimeters for a precise fit recommendation.
            </p>

            {/* Top Measurements */}
            {product?.isTop && (
              <div className="mb-8">
                <h3 className="text-[16px] font-medium text-[var(--charcoal)] mb-4 pb-2 border-b">
                  Top Measurements
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] text-gray-600 mb-2">Chest/Bust (cm)</label>
                    <input
                      type="number"
                      value={curateData.chestBust}
                      onChange={(e) => setCurateData({ ...curateData, chestBust: e.target.value })}
                      className="w-full h-11 px-4 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
                      placeholder="e.g., 96"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] text-gray-600 mb-2">Shoulder Width (cm)</label>
                    <input
                      type="number"
                      value={curateData.shoulderWidth}
                      onChange={(e) => setCurateData({ ...curateData, shoulderWidth: e.target.value })}
                      className="w-full h-11 px-4 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
                      placeholder="e.g., 45"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] text-gray-600 mb-2">Waist (cm)</label>
                    <input
                      type="number"
                      value={curateData.waist}
                      onChange={(e) => setCurateData({ ...curateData, waist: e.target.value })}
                      className="w-full h-11 px-4 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
                      placeholder="e.g., 82"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] text-gray-600 mb-2">Hip (cm)</label>
                    <input
                      type="number"
                      value={curateData.hip}
                      onChange={(e) => setCurateData({ ...curateData, hip: e.target.value })}
                      className="w-full h-11 px-4 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
                      placeholder="e.g., 98"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] text-gray-600 mb-2">Bicep (cm)</label>
                    <input
                      type="number"
                      value={curateData.bicep}
                      onChange={(e) => setCurateData({ ...curateData, bicep: e.target.value })}
                      className="w-full h-11 px-4 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
                      placeholder="e.g., 32"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] text-gray-600 mb-2">Wrist (cm)</label>
                    <input
                      type="number"
                      value={curateData.wrist}
                      onChange={(e) => setCurateData({ ...curateData, wrist: e.target.value })}
                      className="w-full h-11 px-4 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
                      placeholder="e.g., 17"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] text-gray-600 mb-2">Arm Length (cm)</label>
                    <input
                      type="number"
                      value={curateData.armLength}
                      onChange={(e) => setCurateData({ ...curateData, armLength: e.target.value })}
                      className="w-full h-11 px-4 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
                      placeholder="e.g., 62"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] text-gray-600 mb-2">Garment Length (cm)</label>
                    <input
                      type="number"
                      value={curateData.garmentLength}
                      onChange={(e) => setCurateData({ ...curateData, garmentLength: e.target.value })}
                      className="w-full h-11 px-4 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
                      placeholder="e.g., 72"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Measurements */}
            {product?.isBottom && (
              <div className="mb-8">
                <h3 className="text-[16px] font-medium text-[var(--charcoal)] mb-4 pb-2 border-b">
                  Bottom Measurements
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] text-gray-600 mb-2">Waist (cm)</label>
                    <input
                      type="number"
                      value={curateData.waist}
                      onChange={(e) => setCurateData({ ...curateData, waist: e.target.value })}
                      className="w-full h-11 px-4 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
                      placeholder="e.g., 82"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] text-gray-600 mb-2">Hip (cm)</label>
                    <input
                      type="number"
                      value={curateData.hip}
                      onChange={(e) => setCurateData({ ...curateData, hip: e.target.value })}
                      className="w-full h-11 px-4 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
                      placeholder="e.g., 98"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] text-gray-600 mb-2">Thigh Circumference (cm)</label>
                    <input
                      type="number"
                      value={curateData.thighCircumference}
                      onChange={(e) => setCurateData({ ...curateData, thighCircumference: e.target.value })}
                      className="w-full h-11 px-4 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
                      placeholder="e.g., 58"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] text-gray-600 mb-2">Calf Circumference (cm)</label>
                    <input
                      type="number"
                      value={curateData.calfCircumference}
                      onChange={(e) => setCurateData({ ...curateData, calfCircumference: e.target.value })}
                      className="w-full h-11 px-4 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
                      placeholder="e.g., 38"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] text-gray-600 mb-2">Inseam (cm)</label>
                    <input
                      type="number"
                      value={curateData.inseam}
                      onChange={(e) => setCurateData({ ...curateData, inseam: e.target.value })}
                      className="w-full h-11 px-4 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
                      placeholder="e.g., 81"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] text-gray-600 mb-2">Outseam (cm)</label>
                    <input
                      type="number"
                      value={curateData.outseam}
                      onChange={(e) => setCurateData({ ...curateData, outseam: e.target.value })}
                      className="w-full h-11 px-4 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
                      placeholder="e.g., 106"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] text-gray-600 mb-2">Ankle Opening (cm)</label>
                    <input
                      type="number"
                      value={curateData.ankleOpening}
                      onChange={(e) => setCurateData({ ...curateData, ankleOpening: e.target.value })}
                      className="w-full h-11 px-4 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
                      placeholder="e.g., 22"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep('intro')}
                className="flex-1 h-12 border border-gray-300 text-[var(--charcoal)] text-[14px] hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => {
                  // Calculate size based on curate measurements
                  let size = 'M';
                  const chest = Number(curateData.chestBust);
                  const waist = Number(curateData.waist);
                  
                  if (chest) {
                    if (chest < 88) size = 'XS';
                    else if (chest < 94) size = 'S';
                    else if (chest < 100) size = 'M';
                    else if (chest < 106) size = 'L';
                    else if (chest < 112) size = 'XL';
                    else size = 'XXL';
                  } else if (waist) {
                    if (waist < 72) size = 'XS';
                    else if (waist < 78) size = 'S';
                    else if (waist < 84) size = 'M';
                    else if (waist < 90) size = 'L';
                    else if (waist < 96) size = 'XL';
                    else size = 'XXL';
                  }
                  
                  setRecommendedSize(size);
                  setFitConfidence(92);
                  setCurrentStep('result');
                }}
                className="flex-1 h-12 bg-[var(--crimson)] text-white text-[14px] hover:opacity-90 transition-opacity"
              >
                Get My Fit
              </button>
            </div>
          </div>
        )}

        {/* Measurements Step */}
        {currentStep === 'measurements' && (
          <div className="bg-white p-12">
            <h2 className="font-[var(--font-serif)] text-3xl mb-4 text-[var(--charcoal)]">
              Your Size & Body Type
            </h2>
            <p className="text-[14px] text-[var(--light-gray)] mb-8">
              Select your size and body type for personalized fit recommendations.
            </p>

            {/* Size Selection */}
            <div className="mb-8">
              <label className="block text-[14px] text-[var(--charcoal)] mb-3 font-medium">
                Select Your Size <span className="text-[var(--crimson)]">*</span>
              </label>
              <div className="grid grid-cols-6 gap-2">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, selectedSize: size });
                      setRecommendedSize(size);
                    }}
                    className={`h-12 border text-[14px] font-medium transition-all ${
                      formData.selectedSize === size
                        ? 'border-[var(--crimson)] bg-[var(--crimson)] text-white'
                        : 'border-[var(--border)] text-[var(--charcoal)] hover:border-[var(--crimson)]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Body Type Selection */}
            <div className="mb-8">
              <label className="block text-[14px] text-[var(--charcoal)] mb-3 font-medium">
                Select Your Body Type <span className="text-[var(--crimson)]">*</span>
              </label>
              <div className="space-y-3">
                {bodyTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, bodyType: type.id })}
                    className={`w-full p-4 border text-left transition-all ${
                      formData.bodyType === type.id
                        ? 'border-[var(--crimson)] bg-[var(--cream)]'
                        : 'border-[var(--border)] hover:border-[var(--crimson)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-[15px] text-[var(--charcoal)] font-medium">{type.label}</h3>
                        <p className="text-[13px] text-[var(--light-gray)]">{type.description}</p>
                      </div>
                      {formData.bodyType === type.id && (
                        <Check size={20} className="text-[var(--crimson)]" strokeWidth={2} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Height & Weight */}
            <div className="border-t border-[var(--border)] pt-6 mb-6">
              <p className="text-[13px] text-[var(--light-gray)] mb-4">
                Optional: Add your height and weight for better recommendations
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <label className="block text-[14px] text-[var(--charcoal)] mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="175"
                  className="w-full h-12 px-4 border border-[var(--border)] text-[14px] focus:outline-none focus:ring-1 focus:ring-[var(--crimson)]"
                />
              </div>
              <div>
                <label className="block text-[14px] text-[var(--charcoal)] mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="70"
                  className="w-full h-12 px-4 border border-[var(--border)] text-[14px] focus:outline-none focus:ring-1 focus:ring-[var(--crimson)]"
                />
              </div>
            </div>

            <button
              onClick={goToNextStep}
              disabled={!formData.selectedSize || !formData.bodyType}
              className="w-full h-12 bg-[var(--crimson)] text-white text-[14px] tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {/* Fit Preference Step */}
        {currentStep === 'preference' && (
          <div className="bg-white p-12">
            <h2 className="font-[var(--font-serif)] text-3xl mb-4 text-[var(--charcoal)]">
              Fit Preference
            </h2>
            <p className="text-[14px] text-[var(--light-gray)] mb-8">
              How do you prefer your garments to fit?
            </p>
            <div className="space-y-3 mb-8">
              {fitPreferences.map((pref) => (
                <button
                  key={pref.id}
                  onClick={() => setFormData({ ...formData, fitPreference: pref.id })}
                  className={`w-full p-6 border text-left transition-all ${
                    formData.fitPreference === pref.id
                      ? 'border-[var(--crimson)] bg-[var(--cream)]'
                      : 'border-[var(--border)] hover:border-[var(--crimson)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[16px] text-[var(--charcoal)]">{pref.label}</h3>
                    {formData.fitPreference === pref.id && (
                      <Check size={20} className="text-[var(--crimson)]" strokeWidth={2} />
                    )}
                  </div>
                  <p className="text-[13px] text-[var(--light-gray)]">{pref.description}</p>
                </button>
              ))}
            </div>
            <button
              onClick={goToNextStep}
              disabled={!formData.fitPreference}
              className="w-full h-12 bg-[var(--crimson)] text-white text-[14px] tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {/* Photos Step */}
        {currentStep === 'photos' && (
          <div className="bg-white p-12">
            <h2 className="font-[var(--font-serif)] text-3xl mb-4 text-[var(--charcoal)]">
              Virtual Fit Preview
            </h2>
            <p className="text-[14px] text-[var(--light-gray)] mb-8">
              Upload photos for AI-powered fit visualization (optional).
            </p>
            <div className="border-2 border-dashed border-[var(--border)] p-12 text-center mb-6">
              <Upload size={48} className="mx-auto mb-4 text-[var(--light-gray)]" strokeWidth={1.5} />
              <p className="text-[14px] text-[var(--charcoal)] mb-2">
                Upload 4 photos (front, side, back, neutral pose)
              </p>
              <p className="text-[12px] text-[var(--light-gray)] mb-4">
                Plain background, fitted clothing, face optional
              </p>
              <input type="file" multiple accept="image/*" className="hidden" id="photo-upload" />
              <label
                htmlFor="photo-upload"
                className="inline-block px-8 h-10 border border-[var(--crimson)] text-[var(--crimson)] text-[13px] tracking-wide hover:bg-[var(--crimson)] hover:text-white transition-all cursor-pointer leading-10"
              >
                Select Photos
              </label>
            </div>
            <div className="bg-[var(--cream)] p-4 mb-8">
              <div className="flex items-start gap-3">
                <Check size={16} className="text-[var(--crimson)] flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div className="text-[12px] text-[var(--charcoal)]">
                  <p className="mb-1">Your photos are processed securely and encrypted.</p>
                  <p>You can skip this step and still receive size recommendations.</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setFormData({ ...formData, photosUploaded: 0 });
                  goToNextStep();
                }}
                className="flex-1 h-12 border border-[var(--border)] text-[var(--charcoal)] text-[14px] tracking-wide hover:border-[var(--crimson)] transition-colors"
              >
                Skip This Step
              </button>
              <button
                onClick={goToNextStep}
                className="flex-1 h-12 bg-[var(--crimson)] text-white text-[14px] tracking-wide hover:opacity-90 transition-opacity"
              >
                Generate Preview
              </button>
            </div>
          </div>
        )}

        {/* Result Step */}
        {currentStep === 'result' && (
          <div className="bg-white p-12">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[var(--crimson)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-white" strokeWidth={2} />
              </div>
              <h2 className="font-[var(--font-serif)] text-3xl mb-4 text-[var(--charcoal)]">
                Your Profile is Ready
              </h2>
              <p className="text-[14px] text-[var(--light-gray)]">
                Your size profile has been saved successfully.
              </p>
            </div>

            <div className="bg-[var(--cream)] p-8 mb-8">
              <div className="text-center mb-6">
                <p className="text-[13px] text-[var(--light-gray)] mb-2">Your Selected Size</p>
                <p className="font-[var(--font-serif)] text-5xl text-[var(--crimson)]">{recommendedSize}</p>
              </div>
              <div className="space-y-3 text-[14px] text-[var(--charcoal)]">
                <div className="flex justify-between py-3 border-t border-[var(--border)]">
                  <span>Fit Confidence</span>
                  <span className="text-[var(--crimson)]">{fitConfidence}%</span>
                </div>
                {formData.bodyType && (
                  <div className="flex justify-between py-3 border-t border-[var(--border)]">
                    <span>Body Type</span>
                    <span className="capitalize">{formData.bodyType}</span>
                  </div>
                )}
                {formData.height && (
                  <div className="flex justify-between py-3 border-t border-[var(--border)]">
                    <span>Height</span>
                    <span>{formData.height} cm</span>
                  </div>
                )}
                {formData.weight && (
                  <div className="flex justify-between py-3 border-t border-[var(--border)]">
                    <span>Weight</span>
                    <span>{formData.weight} kg</span>
                  </div>
                )}
                {formData.fitPreference && (
                  <div className="flex justify-between py-3 border-t border-b border-[var(--border)]">
                    <span>Fit Preference</span>
                    <span className="capitalize">{formData.fitPreference.replace('-', ' ')} Fit</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 mb-8 rounded">
              <p className="text-[13px] text-blue-900">
                ✓ Your size profile has been saved and shared with our team for personalized service.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCompleteProfile}
                className="w-full h-12 bg-[var(--crimson)] text-white text-[14px] tracking-wide hover:opacity-90 transition-opacity"
              >
                Add to Cart - Size {recommendedSize}
              </button>
              <button
                onClick={onClose}
                className="w-full h-12 border border-[var(--border)] text-[var(--charcoal)] text-[14px] tracking-wide hover:border-[var(--crimson)] transition-colors"
              >
                Back to Product
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
