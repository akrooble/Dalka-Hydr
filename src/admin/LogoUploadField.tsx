import { ImagePlus, Trash2, Upload } from 'lucide-react';
import { ChangeEvent, DragEvent, useId, useRef, useState } from 'react';
import { OrgLogo } from '../components/OrgLogo';
import { SafeImage } from '../components/SafeImage';

export interface LogoPreset {
  label: string;
  url: string;
}

interface LogoUploadFieldProps {
  label: string;
  orgName: string;
  value: string;
  onChange: (value: string) => void;
  presets: LogoPreset[];
  variant?: 'square' | 'banner';
  maxDataUriLength?: number;
  dimensionSteps?: number[];
  removeLabel?: string;
  urlPlaceholder?: string;
  darkPreview?: boolean;
}

const DEFAULT_MAX_LOGO_STRING_LEN = 60000;
const DEFAULT_DIMENSION_STEPS = [220, 168, 128, 96];

async function compressImageFileToDataUrl(
  file: File,
  maxDataUriLength: number,
  dimensionSteps: number[],
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose a valid image file (PNG, JPG, WebP, SVG, or ICO).');
  }

  // Handle crisp vector SVG directly if within size budget
  if (file.type === 'image/svg+xml') {
    const svgText = await file.text();
    const encoded = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
    if (encoded.length <= maxDataUriLength) {
      return encoded;
    }
    throw new Error('SVG file is too large. Please upload a lighter SVG or a PNG/JPG image.');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Could not decode this image file.'));
      image.src = objectUrl;
    });

    const qualitySteps = [0.88, 0.76, 0.62, 0.5];

    for (const maxDim of dimensionSteps) {
      const scale = Math.min(1, maxDim / Math.max(img.width || maxDim, img.height || maxDim));
      const width = Math.max(1, Math.round((img.width || maxDim) * scale));
      const height = Math.max(1, Math.round((img.height || maxDim) * scale));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas image processing is not supported in this browser.');
      }
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      for (const quality of qualitySteps) {
        const webpData = canvas.toDataURL('image/webp', quality);
        if (webpData.startsWith('data:image/webp') && webpData.length <= maxDataUriLength) {
          return webpData;
        }
        if (maxDataUriLength > 100000) {
          const jpegData = canvas.toDataURL('image/jpeg', quality);
          if (jpegData.startsWith('data:image/jpeg') && jpegData.length <= maxDataUriLength) {
            return jpegData;
          }
        } else {
          const pngData = canvas.toDataURL('image/png');
          if (pngData.length <= maxDataUriLength) {
            return pngData;
          }
        }
      }
    }

    throw new Error('Image could not be compressed small enough. Please choose a smaller image file.');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function LogoUploadField({
  label,
  orgName,
  value,
  onChange,
  presets,
  variant = 'square',
  maxDataUriLength = DEFAULT_MAX_LOGO_STRING_LEN,
  dimensionSteps = DEFAULT_DIMENSION_STEPS,
  removeLabel = 'Remove Logo',
  urlPlaceholder,
  darkPreview = false,
}: LogoUploadFieldProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function processFile(file: File | undefined) {
    if (!file) return;
    setUploadError(null);
    setProcessing(true);
    try {
      const dataUrl = await compressImageFileToDataUrl(file, maxDataUriLength, dimensionSteps);
      onChange(dataUrl);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Unable to process image.');
    } finally {
      setProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    processFile(e.target.files?.[0]);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  }

  const isUploadedDataUri = value.startsWith('data:image/');

  return (
    <div className="pt-2 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setUploadError(null);
            }}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#64748B] dark:text-slate-400 hover:text-[#BA1A1A] dark:hover:text-red-400"
          >
            <Trash2 className="h-3 w-3" />
            <span>{removeLabel}</span>
          </button>
        )}
      </div>

      {/* Upload Dropzone + Live Preview */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`rounded-xl border border-dashed p-3.5 transition-colors flex flex-col sm:flex-row items-start sm:items-center gap-3.5 ${
          dragging
            ? 'border-[#4648D4] bg-[#EFF4FF] dark:border-[#6366F1] dark:bg-[#1E2430]'
            : 'border-slate-300 dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#0D1117]'
        }`}
      >
        {variant === 'banner' ? (
          <div className="w-full sm:w-40 aspect-[16/10] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-[#EFF4FF] dark:bg-[#161B22] shrink-0">
            <SafeImage
              src={value}
              alt={orgName}
              className="w-full h-full object-cover"
              fallbackIcon={<ImagePlus className="h-6 w-6" />}
            />
          </div>
        ) : darkPreview ? (
          <div className="h-14 w-14 rounded-lg border border-slate-700 bg-[#0B1C30] flex items-center justify-center overflow-hidden p-1.5 shrink-0">
            <SafeImage
              src={value}
              alt={orgName}
              className="w-full h-full object-contain"
              fallbackIcon={<ImagePlus className="h-5 w-5" />}
            />
          </div>
        ) : (
          <OrgLogo
            name={orgName}
            logoUrl={value}
            sizeClass="h-14 w-14"
          />
        )}

        <div className="flex-1 min-w-0 w-full space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              id={inputId}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon"
              onChange={handleFileChange}
              className="sr-only"
            />
            <button
              type="button"
              disabled={processing}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[#4648D4] dark:bg-[#6366F1] text-white text-xs font-semibold hover:bg-[#4F46E5] dark:hover:bg-[#818CF8] disabled:opacity-60 transition-colors"
            >
              {processing ? (
                <span>Optimizing...</span>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  <span>{isUploadedDataUri ? 'Replace Image' : 'Upload Image'}</span>
                </>
              )}
            </button>
            <span className="text-[11px] text-[#64748B] dark:text-slate-400 inline-flex items-center gap-1">
              <ImagePlus className="h-3.5 w-3.5 shrink-0" />
              <span>PNG, JPG, WebP, or SVG</span>
            </span>
          </div>

          <input
            type="text"
            maxLength={65000}
            value={isUploadedDataUri ? '' : value}
            onChange={(e) => {
              setUploadError(null);
              onChange(e.target.value);
            }}
            placeholder={
              isUploadedDataUri
                ? 'Uploaded image attached (or paste a URL to replace)'
                : urlPlaceholder || 'Or paste image URL (https://...)'
            }
            className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161B22] text-xs text-[#0B1C30] dark:text-[#F1F5F9] placeholder:text-[#64748B] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4648D4]/30 focus:border-[#4648D4]"
          />
        </div>
      </div>

      {uploadError && (
        <p className="text-xs text-[#BA1A1A] dark:text-red-400">{uploadError}</p>
      )}

      {presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-[#64748B] dark:text-slate-400 mr-1">Quick presets:</span>
          {presets.map((preset) => (
            <button
              key={preset.url}
              type="button"
              onClick={() => {
                setUploadError(null);
                onChange(preset.url);
              }}
              className="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-[#F8F9FF] dark:bg-[#1E2430] text-[11px] font-medium text-[#464554] dark:text-slate-300 hover:text-[#0B1C30] dark:hover:text-[#F8FAFC]"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
