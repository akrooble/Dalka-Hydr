import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { submitVisitorLead } from '../lib/firebase';
import { LeadSource } from '../types/dalka';

interface LeadFormProps {
  source: LeadSource;
  itemId?: string;
  itemTitle?: string;
  submitLabel?: string;
  heading?: string;
  subheading?: string;
  onSuccess?: () => void;
}

const EDUCATION_OPTIONS = [
  '',
  'High School / Secondary',
  'Diploma / Certificate',
  "Bachelor's Degree",
  "Master's Degree",
  'PhD / Doctorate',
  'Other',
];

const INPUT_CLASS =
  'w-full h-11 lg:h-[38px] px-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20';

export function LeadForm({
  source,
  itemId,
  itemTitle,
  submitLabel = 'Submit Details',
  heading,
  subheading,
  onSuccess,
}: LeadFormProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [higherEducation, setHigherEducation] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();

    if (trimmedName.length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }
    if (trimmedPhone.length < 5) {
      setError('Please enter a valid phone number.');
      return;
    }
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address or leave the email field blank.');
      return;
    }

    setSubmitting(true);
    try {
      const leadId = await submitVisitorLead({
        fullName: trimmedName,
        phone: trimmedPhone,
        location,
        email: trimmedEmail,
        higherEducation,
        source,
        itemId,
        itemTitle,
        message,
      });
      setSubmittedId(leadId);
      setFullName('');
      setPhone('');
      setLocation('');
      setEmail('');
      setHigherEducation('');
      setMessage('');
      onSuccess?.();
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : 'Unable to save your submission.';
      try {
        const parsed = JSON.parse(rawMessage) as { error?: string };
        setError(parsed.error || 'Unable to submit right now. Please try again.');
      } catch {
        setError(rawMessage);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (submittedId) {
    return (
      <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-[#006C49] dark:text-[#34D399] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
              Thank you — your information has been received
            </h3>
            <p className="mt-1 text-sm text-[#464554] dark:text-slate-300">
              {itemTitle
                ? `Our team received your request for "${itemTitle}" and will reach out by phone shortly.`
                : 'Our team saved your contact details and will reach out to you shortly.'}
            </p>
            <button
              type="button"
              onClick={() => setSubmittedId(null)}
              className="mt-4 min-h-[44px] lg:min-h-[38px] lg:h-[38px] px-4 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E2430] text-sm font-medium text-[#0B1C30] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#262E3D] transition-colors"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {heading && (
        <div>
          <h3 className="text-lg font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">{heading}</h3>
          {subheading && <p className="mt-1 text-sm text-[#464554] dark:text-slate-300">{subheading}</p>}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-3.5 py-2.5 text-sm text-[#93000A] dark:text-red-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor={`lead-name-${source}`}
            className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F1F5F9] mb-1.5"
          >
            Full Name <span className="text-[#BA1A1A] dark:text-red-400">*</span>
          </label>
          <input
            id={`lead-name-${source}`}
            type="text"
            required
            maxLength={120}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Halima Mohamed"
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label
            htmlFor={`lead-phone-${source}`}
            className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F1F5F9] mb-1.5"
          >
            Phone Number <span className="text-[#BA1A1A] dark:text-red-400">*</span>
          </label>
          <input
            id={`lead-phone-${source}`}
            type="tel"
            required
            maxLength={32}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +252 61 555 0142"
            className={`${INPUT_CLASS} tabular-nums`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor={`lead-location-${source}`}
            className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F1F5F9] mb-1.5"
          >
            Location <span className="font-normal text-[#64748B] dark:text-slate-400">(Optional)</span>
          </label>
          <input
            id={`lead-location-${source}`}
            type="text"
            maxLength={120}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City or district"
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label
            htmlFor={`lead-email-${source}`}
            className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F1F5F9] mb-1.5"
          >
            Email <span className="font-normal text-[#64748B] dark:text-slate-400">(Optional)</span>
          </label>
          <input
            id={`lead-email-${source}`}
            type="email"
            maxLength={160}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor={`lead-education-${source}`}
          className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F1F5F9] mb-1.5"
        >
          Higher Education <span className="font-normal text-[#64748B] dark:text-slate-400">(Optional)</span>
        </label>
        <select
          id={`lead-education-${source}`}
          value={higherEducation}
          onChange={(e) => setHigherEducation(e.target.value)}
          className={INPUT_CLASS}
        >
          <option value="">Select education level (optional)</option>
          {EDUCATION_OPTIONS.filter(Boolean).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor={`lead-message-${source}`}
          className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F1F5F9] mb-1.5"
        >
          Message or Order Notes <span className="font-normal text-[#64748B] dark:text-slate-400">(Optional)</span>
        </label>
        <textarea
          id={`lead-message-${source}`}
          rows={3}
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            itemTitle
              ? `Preferred delivery method or questions about ${itemTitle}...`
              : 'Tell us how Dalka Jobs can help you...'
          }
          className="w-full px-3 py-2.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto min-h-[44px] lg:min-h-[38px] lg:h-[38px] px-5 rounded bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] active:bg-[#4338CA] disabled:opacity-60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#161B22]"
      >
        {submitting ? 'Submitting...' : submitLabel}
      </button>
    </form>
  );
}
