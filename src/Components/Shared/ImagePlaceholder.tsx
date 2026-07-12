import type { IconType } from 'react-icons';
import { FiImage } from 'react-icons/fi';

interface ImagePlaceholderProps {
  icon?: IconType;
  size?: number;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

const ImagePlaceholder = ({
  icon: Icon = FiImage,
  size = 28,
  label,
  className = '',
  style,
}: ImagePlaceholderProps) => (
  <div className={`img-placeholder ${className}`.trim()} style={style} aria-hidden="true">
    <Icon size={size} />
    {label && <span className="img-placeholder-label">{label}</span>}
  </div>
);

export default ImagePlaceholder;
