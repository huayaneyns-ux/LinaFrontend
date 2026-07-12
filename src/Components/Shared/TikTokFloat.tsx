import { useState } from 'react';
import { FiX, FiExternalLink } from 'react-icons/fi';
import { REDES_SOCIALES, extractTikTokVideoId } from '../../Constantes/RedesSociales';
import '../../Styles/Components/TikTokFloat.css';

const TikTokFloat = () => {
  const videoId = extractTikTokVideoId(REDES_SOCIALES.tiktok.video);
  const [expanded, setExpanded] = useState(false);

  if (!videoId) return null;

  const embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`;

  return (
    <div className={`tiktok-float${expanded ? ' expanded' : ''}`}>
      {expanded ? (
        <div className="tiktok-float-panel">
          <div className="tiktok-float-header">
            <span className="tiktok-float-title">TikTok</span>
            <button
              type="button"
              className="tiktok-float-close"
              onClick={() => setExpanded(false)}
              aria-label="Cerrar video"
            >
              <FiX size={18} />
            </button>
          </div>
          <div className="tiktok-float-phone">
            <div className="tiktok-float-notch" />
            <div className="tiktok-float-screen">
              <iframe
                src={embedUrl}
                title="Video TikTok"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
              />
            </div>
            <div className="tiktok-float-bar" />
          </div>
          <a
            href={REDES_SOCIALES.tiktok.perfil}
            target="_blank"
            rel="noopener noreferrer"
            className="tiktok-float-profile"
          >
            <FiExternalLink size={13} />
            Ver perfil
          </a>
        </div>
      ) : (
        <button
          type="button"
          className="tiktok-float-trigger"
          onClick={() => setExpanded(true)}
          aria-label="Ver video de TikTok"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.77 1.52V6.76a4.85 4.85 0 01-1-.07z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default TikTokFloat;
