import { useState } from 'react';
import { FitProfile } from '../store/app-store';

interface FitProfileFormProps {
  onSubmit: (profile: Omit<FitProfile, 'createdAt'>) => void;
  onCancel?: () => void;
  existingProfile?: Omit<FitProfile, 'createdAt'> | null;
  userId: string;
}

export function FitProfileForm({ onSubmit, onCancel, existingProfile, userId }: FitProfileFormProps) {
  const [formData, setFormData] = useState({
    height: existingProfile?.height || '',
    weight: existingProfile?.weight || '',
    chest: existingProfile?.chest || '',
    waist: existingProfile?.waist || '',
    hips: existingProfile?.hips || '',
    preferredFit: (existingProfile?.preferredFit || 'regular') as 'slim' | 'regular' | 'relaxed',
    preferredSize: existingProfile?.preferredSize || 'M',
    notes: existingProfile?.notes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.height.trim()) newErrors.height = 'Height is required';
    if (!formData.weight.trim()) newErrors.weight = 'Weight is required';
    if (!formData.chest.trim()) newErrors.chest = 'Chest measurement is required';
    if (!formData.waist.trim()) newErrors.waist = 'Waist measurement is required';
    if (!formData.preferredFit) newErrors.preferredFit = 'Preferred fit is required';
    if (!formData.preferredSize) newErrors.preferredSize = 'Preferred size is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onSubmit({
      userId,
      height: formData.height,
      weight: formData.weight,
      chest: formData.chest,
      waist: formData.waist,
      hips: formData.hips,
      preferredFit: formData.preferredFit,
      preferredSize: formData.preferredSize,
      notes: formData.notes
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[var(--font-serif)] text-2xl mb-4 text-[var(--charcoal)]">
          {existingProfile ? 'Update Fit Profile' : 'Create Your Fit Profile'}
        </h2>
        <p className="text-[14px] text-[var(--light-gray)] mb-6">
          Help us find the perfect fit by providing your measurements
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Height */}
          <div>
            <label className="block text-[13px] font-medium text-[var(--charcoal)] mb-2">
              Height (cm)
            </label>
            <input
              type="text"
              placeholder="e.g., 180"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              className={`w-full px-3 py-2 border rounded text-[14px] focus:outline-none ${
                errors.height
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[var(--border)] focus:border-[var(--crimson)]'
              }`}
            />
            {errors.height && <p className="text-red-500 text-[12px] mt-1">{errors.height}</p>}
          </div>

          {/* Weight */}
          <div>
            <label className="block text-[13px] font-medium text-[var(--charcoal)] mb-2">
              Weight (kg)
            </label>
            <input
              type="text"
              placeholder="e.g., 75"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className={`w-full px-3 py-2 border rounded text-[14px] focus:outline-none ${
                errors.weight
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[var(--border)] focus:border-[var(--crimson)]'
              }`}
            />
            {errors.weight && <p className="text-red-500 text-[12px] mt-1">{errors.weight}</p>}
          </div>

          {/* Chest */}
          <div>
            <label className="block text-[13px] font-medium text-[var(--charcoal)] mb-2">
              Chest (cm)
            </label>
            <input
              type="text"
              placeholder="e.g., 100"
              value={formData.chest}
              onChange={(e) => setFormData({ ...formData, chest: e.target.value })}
              className={`w-full px-3 py-2 border rounded text-[14px] focus:outline-none ${
                errors.chest
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[var(--border)] focus:border-[var(--crimson)]'
              }`}
            />
            {errors.chest && <p className="text-red-500 text-[12px] mt-1">{errors.chest}</p>}
          </div>

          {/* Waist */}
          <div>
            <label className="block text-[13px] font-medium text-[var(--charcoal)] mb-2">
              Waist (cm)
            </label>
            <input
              type="text"
              placeholder="e.g., 85"
              value={formData.waist}
              onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
              className={`w-full px-3 py-2 border rounded text-[14px] focus:outline-none ${
                errors.waist
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[var(--border)] focus:border-[var(--crimson)]'
              }`}
            />
            {errors.waist && <p className="text-red-500 text-[12px] mt-1">{errors.waist}</p>}
          </div>

          {/* Hips */}
          <div>
            <label className="block text-[13px] font-medium text-[var(--charcoal)] mb-2">
              Hips (cm)
            </label>
            <input
              type="text"
              placeholder="e.g., 95"
              value={formData.hips}
              onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border)] rounded text-[14px] focus:outline-none focus:border-[var(--crimson)]"
            />
          </div>

          {/* Preferred Fit */}
          <div>
            <label className="block text-[13px] font-medium text-[var(--charcoal)] mb-2">
              Preferred Fit
            </label>
            <select
              value={formData.preferredFit}
              onChange={(e) => setFormData({ ...formData, preferredFit: e.target.value as 'slim' | 'regular' | 'relaxed' })}
              className={`w-full px-3 py-2 border rounded text-[14px] focus:outline-none ${
                errors.preferredFit
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[var(--border)] focus:border-[var(--crimson)]'
              }`}
            >
              <option value="slim">Slim Fit</option>
              <option value="regular">Regular Fit</option>
              <option value="relaxed">Relaxed Fit</option>
            </select>
            {errors.preferredFit && <p className="text-red-500 text-[12px] mt-1">{errors.preferredFit}</p>}
          </div>

          {/* Preferred Size */}
          <div>
            <label className="block text-[13px] font-medium text-[var(--charcoal)] mb-2">
              Preferred Size
            </label>
            <select
              value={formData.preferredSize}
              onChange={(e) => setFormData({ ...formData, preferredSize: e.target.value })}
              className={`w-full px-3 py-2 border rounded text-[14px] focus:outline-none ${
                errors.preferredSize
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[var(--border)] focus:border-[var(--crimson)]'
              }`}
            >
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </select>
            {errors.preferredSize && <p className="text-red-500 text-[12px] mt-1">{errors.preferredSize}</p>}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[13px] font-medium text-[var(--charcoal)] mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            placeholder="e.g., Prefer loose arms, shorter sleeves..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-[var(--border)] rounded text-[14px] focus:outline-none focus:border-[var(--crimson)] resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 h-12 bg-[var(--crimson)] text-white text-[14px] font-medium hover:opacity-90 transition-opacity"
          >
            {existingProfile ? 'Update Profile' : 'Create Profile'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 h-12 border border-[var(--border)] text-[var(--charcoal)] text-[14px] font-medium hover:bg-[var(--cream)] transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
