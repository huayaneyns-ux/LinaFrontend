import type { ReactNode } from 'react';
import '../../Styles/ERP/erp-form.css';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
  colSpan?: 1 | 2;
}

const FormField = ({ label, required = false, error, children, className = '', colSpan }: FormFieldProps) => {
  const spanClass = colSpan === 2 ? ' col-span-2' : '';
  return (
    <div className={`erp-form-field erp-form-group${spanClass}${className ? ` ${className}` : ''}`}>
      <label className="erp-form-label">
        {label}
        {required && <span className="required-star">*</span>}
      </label>
      {children}
      {error && (
        <span className="erp-form-error">
          {error}
        </span>
      )}
    </div>
  );
};

export default FormField;
