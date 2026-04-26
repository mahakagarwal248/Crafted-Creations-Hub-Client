import Form from 'react-bootstrap/Form';
import './PasswordField.css';

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" aria-hidden>
      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
      <path d="M8 5.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM4.5 8a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0z" />
    </svg>
  );
}

function EyeSlashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78 3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
    </svg>
  );
}

/**
 * Password input with trailing eye toggle.
 * @param {{ variant?: 'light' | 'dark' }} props — use "dark" only if the control itself is on a dark strip; default "light" is for standard white inputs.
 */
function PasswordField({
  id,
  label,
  value,
  onChange,
  showPassword,
  onToggleShow,
  variant = 'light',
  className = '',
  ...controlProps
}) {
  const dark = variant === 'dark';

  return (
    <Form.Group className={`password-field mb-3 ${dark ? 'password-field--dark' : ''} ${className}`.trim()}>
      {label ? <Form.Label>{label}</Form.Label> : null}
      <div className="password-field-inner">
        <Form.Control
          id={id}
          {...controlProps}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
        />
        <button
          type="button"
          className="password-field-toggle"
          onClick={onToggleShow}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          aria-pressed={showPassword}
        >
          {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
        </button>
      </div>
    </Form.Group>
  );
}

export default PasswordField;
