import { useState } from 'react';

type PasswordFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

export function PasswordField({ label, value, placeholder, onChange }: PasswordFieldProps) {
  const [visivel, setVisivel] = useState(false);
  const id = `senha-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <label className="field" htmlFor={id}>
      {label}
      <span className="password-control">
        <input
          id={id}
          className="input"
          placeholder={placeholder}
          type={visivel ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={label.toLowerCase().includes('confirmar') ? 'new-password' : undefined}
        />
        <button
          className="password-toggle"
          type="button"
          aria-label={visivel ? `Ocultar ${label.toLowerCase()}` : `Exibir ${label.toLowerCase()}`}
          aria-pressed={visivel}
          onClick={() => setVisivel((atual) => !atual)}
        >
          {visivel ? (
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <path d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7" />
              <path d="M9.9 5.2A10.8 10.8 0 0112 5c5.2 0 8.8 4.8 9.5 6-.3.5-1.3 1.8-3.1 3.2M6.2 6.2C3.9 7.7 2.7 9.8 2.5 11c.7 1.2 4.3 6 9.5 6 1 0 2-.2 2.8-.5" />
            </svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6z" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
          )}
        </button>
      </span>
    </label>
  );
}
