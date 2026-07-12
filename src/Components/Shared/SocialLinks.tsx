import { FaTiktok, FaInstagram, FaFacebookF } from 'react-icons/fa';
import { REDES_SOCIALES } from '../../Constantes/RedesSociales';
import '../../Styles/Components/SocialLinks.css';

interface SocialLinksProps {
  variant?: 'header' | 'footer' | 'inline';
  showLabels?: boolean;
}

const SocialLinks = ({ variant = 'inline', showLabels = false }: SocialLinksProps) => {
  const links = [
    {
      href: REDES_SOCIALES.tiktok.perfil,
      label: 'TikTok',
      icon: FaTiktok,
      className: 'social-tiktok',
    },
    {
      href: REDES_SOCIALES.instagram,
      label: 'Instagram',
      icon: FaInstagram,
      className: 'social-instagram',
    },
    {
      href: REDES_SOCIALES.facebook,
      label: 'Facebook',
      icon: FaFacebookF,
      className: 'social-facebook',
    },
  ];

  return (
    <div className={`social-links social-links--${variant}`}>
      {links.map(({ href, label, icon: Icon, className }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`social-link ${className}`}
          title={label}
          aria-label={label}
        >
          <Icon size={variant === 'footer' ? 18 : 16} />
          {showLabels && <span>{label}</span>}
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
