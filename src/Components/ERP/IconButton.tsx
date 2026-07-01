import type { ReactNode, ButtonHTMLAttributes } from 'react';
import '../../Styles/ERP/erp-toolbar.css';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  tooltip: string;
  variant?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
}

const VARIANT_STYLES: Record<string, string> = {
  default: 'erp-icon-btn-default',
  primary: 'erp-icon-btn-primary',
  danger:  'erp-icon-btn-danger',
  success: 'erp-icon-btn-success',
  warning: 'erp-icon-btn-warning',
};

const IconButton = ({ icon, tooltip, variant = 'default', className = '', ...props }: IconButtonProps) => {
  return (
    <button
      type="button"
      title={tooltip}
      aria-label={tooltip}
      className={`erp-icon-btn ${VARIANT_STYLES[variant]} ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
};

export default IconButton;
