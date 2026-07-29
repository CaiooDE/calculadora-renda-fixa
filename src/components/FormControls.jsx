import { Info } from "lucide-react";

export function Field({ label, hint, suffix, children, className = "" }) {
  return (
    <div className={`field ${className}`}>
      <div className="field-label-row">
        <label>{label}</label>
        {hint && (
          <span className="info-hint" title={hint} aria-label={hint}>
            <Info size={14} />
          </span>
        )}
      </div>
      <div className={suffix ? "input-wrap" : undefined}>
        {children}
        {suffix && <span className="input-suffix">{suffix}</span>}
      </div>
    </div>
  );
}

export function Segmented({ value, onChange, options, ariaLabel }) {
  return (
    <div className="segmented" role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={value === option.value ? "active" : ""}
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="toggle-row">
      <span>
        <strong>{label}</strong>
        {description && <small>{description}</small>}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="toggle-track" aria-hidden="true">
        <span />
      </span>
    </label>
  );
}
