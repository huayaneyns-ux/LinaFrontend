import { useState, useMemo } from 'react';
import type { SunatTransmissionItemDto } from '../../../../../Types/Admin/Comprobantes/Comprobante';
import { FiClock, FiActivity, FiBarChart2, FiTrendingUp } from 'react-icons/fi';

interface SunatResponseTimeChartProps {
  data: SunatTransmissionItemDto[];
  onSelectTransmission?: (item: SunatTransmissionItemDto) => void;
  selectedId?: string | null;
}

type ChartMode = 'line' | 'bar';

export const SunatResponseTimeChart = ({
  data,
  onSelectTransmission,
  selectedId,
}: SunatResponseTimeChartProps) => {
  const [chartMode, setChartMode] = useState<ChartMode>('line');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Ordenar cronológicamente para la gráfica (antiguo a reciente)
  const chartItems = useMemo(() => {
    return [...data]
      .filter((item) => item.createdAt)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [data]);

  // Estadísticas para las líneas de referencia
  const stats = useMemo(() => {
    const validTimes = chartItems
      .map((item) => item.responseTimeMs)
      .filter((time): time is number => time !== null && time > 0);

    if (validTimes.length === 0) {
      return { avg: 0, min: 0, max: 1000, count: 0 };
    }

    const sum = validTimes.reduce((acc, v) => acc + v, 0);
    const avg = Math.round(sum / validTimes.length);
    const min = Math.min(...validTimes);
    const max = Math.max(...validTimes);

    return { avg, min, max, count: validTimes.length };
  }, [chartItems]);

  // Dimensiones del SVG
  const width = 860;
  const height = 240;
  const padding = { top: 25, right: 30, bottom: 40, left: 60 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Escala Y (ms) con techo redondeado
  const yMax = useMemo(() => {
    const rawMax = Math.max(stats.max, 2500);
    return Math.ceil(rawMax / 500) * 500;
  }, [stats.max]);

  const getY = (ms: number | null) => {
    if (ms === null || ms <= 0) return innerHeight;
    const clamped = Math.min(ms, yMax);
    return innerHeight - (clamped / yMax) * innerHeight;
  };

  const getX = (index: number) => {
    if (chartItems.length <= 1) return innerWidth / 2;
    return (index / (chartItems.length - 1)) * innerWidth;
  };

  // Puntos calculados
  const points = useMemo(() => {
    return chartItems.map((item, i) => ({
      x: getX(i),
      y: getY(item.responseTimeMs),
      item,
      index: i,
    }));
  }, [chartItems, yMax]);

  // Path SVG para el área y la línea (smooth curve)
  const { linePath, areaPath } = useMemo(() => {
    if (points.length === 0) return { linePath: '', areaPath: '' };

    if (points.length === 1) {
      const p = points[0];
      return {
        linePath: `M ${p.x} ${p.y}`,
        areaPath: `M ${p.x} ${innerHeight} L ${p.x} ${p.y} L ${p.x} ${innerHeight} Z`,
      };
    }

    // Curva bezier suave
    let dLine = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      dLine += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const dArea = `${dLine} L ${lastX} ${innerHeight} L ${firstX} ${innerHeight} Z`;

    return { linePath: dLine, areaPath: dArea };
  }, [points, innerHeight]);

  // Color de punto o barra según tiempo
  const getColor = (item: SunatTransmissionItemDto) => {
    if (item.transmissionStatus === 'ERROR' || item.sunatStatus === 'RECHAZADO') {
      return '#ef4444'; // Rojo error
    }
    if (item.responseTimeMs === null) {
      return '#94a3b8'; // Gris sin respuesta
    }
    if (item.responseTimeMs < 1000) {
      return '#10b981'; // Verde rápido (< 1s)
    }
    if (item.responseTimeMs <= 2500) {
      return '#f59e0b'; // Ámbar moderado (1s - 2.5s)
    }
    return '#f97316'; // Naranja/rojo lento (> 2.5s)
  };

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      {/* Header de la gráfica */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: '#eef2ff',
            color: '#4f46e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
          }}>
            <FiActivity />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>
              Latencia de Respuesta SUNAT (APISUNAT)
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
              Tiempo transcurrido entre la petición del sistema y la confirmación oficial de SUNAT
            </p>
          </div>
        </div>

        {/* Controles de vista y leyenda rápida */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Leyenda */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '11.5px',
            color: '#475569',
            backgroundColor: '#f8fafc',
            padding: '4px 10px',
            borderRadius: '6px',
            border: '1px solid #f1f5f9',
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              &lt; 1s (Rápido)
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              1s - 2.5s (Normal)
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              &gt; 2.5s / Error
            </span>
          </div>

          {/* Switch de modo: Línea vs Barras */}
          <div style={{
            display: 'inline-flex',
            backgroundColor: '#f1f5f9',
            borderRadius: '6px',
            padding: '2px',
            gap: '2px',
          }}>
            <button
              type="button"
              onClick={() => setChartMode('line')}
              title="Vista de tendencia continua"
              style={{
                background: chartMode === 'line' ? '#ffffff' : 'none',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: chartMode === 'line' ? '600' : '400',
                color: chartMode === 'line' ? '#4f46e5' : '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: chartMode === 'line' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              <FiTrendingUp style={{ fontSize: '13px' }} />
              Tendencia
            </button>
            <button
              type="button"
              onClick={() => setChartMode('bar')}
              title="Vista de barras por transmisión"
              style={{
                background: chartMode === 'bar' ? '#ffffff' : 'none',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: chartMode === 'bar' ? '600' : '400',
                color: chartMode === 'bar' ? '#4f46e5' : '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: chartMode === 'bar' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              <FiBarChart2 style={{ fontSize: '13px' }} />
              Por Envío
            </button>
          </div>
        </div>
      </div>

      {/* Área del Gráfico SVG */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', minWidth: '600px', display: 'block' }}
        >
          <defs>
            {/* Gradiente para área bajo la curva */}
            <linearGradient id="sunatAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.32" />
              <stop offset="80%" stopColor="#6366f1" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>

            {/* Sombra para tooltips */}
            <filter id="chartDropShadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
            </filter>
          </defs>

          <g transform={`translate(${padding.left}, ${padding.top})`}>
            {/* Franjas de fondo horizontales (Guías de nivel) */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const yVal = innerHeight * (1 - ratio);
              const msVal = Math.round(yMax * ratio);
              return (
                <g key={ratio}>
                  <line
                    x1={0}
                    y1={yVal}
                    x2={innerWidth}
                    y2={yVal}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                    strokeDasharray="4 3"
                  />
                  <text
                    x={-10}
                    y={yVal + 3}
                    textAnchor="end"
                    fontSize="10"
                    fill="#94a3b8"
                    fontFamily="inherit"
                  >
                    {msVal >= 1000 ? `${(msVal / 1000).toFixed(1)}s` : `${msVal}ms`}
                  </text>
                </g>
              );
            })}

            {/* Línea de Promedio (Línea punteada ámbar/azul) */}
            {stats.avg > 0 && (
              <g>
                <line
                  x1={0}
                  y1={getY(stats.avg)}
                  x2={innerWidth}
                  y2={getY(stats.avg)}
                  stroke="#6366f1"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  opacity="0.85"
                />
                <rect
                  x={innerWidth - 110}
                  y={getY(stats.avg) - 10}
                  width="110"
                  height="18"
                  rx="4"
                  fill="#4f46e5"
                />
                <text
                  x={innerWidth - 55}
                  y={getY(stats.avg) + 2}
                  textAnchor="middle"
                  fontSize="9.5"
                  fontWeight="600"
                  fill="#ffffff"
                  fontFamily="inherit"
                >
                  Promedio: {stats.avg} ms
                </text>
              </g>
            )}

            {/* MODO 1: GRÁFICA DE LÍNEA / ÁREA */}
            {chartMode === 'line' && (
              <>
                {/* Relleno del área */}
                {areaPath && (
                  <path d={areaPath} fill="url(#sunatAreaGradient)" />
                )}

                {/* Línea principal continua */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Puntos de datos */}
                {points.map((p) => {
                  const isHovered = hoveredIndex === p.index;
                  const isSelected = selectedId === p.item.id;
                  const color = getColor(p.item);

                  return (
                    <g key={p.item.id || p.index}>
                      {/* Círculo exterior interactivo para hover */}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isHovered || isSelected ? 8 : 4.5}
                        fill={color}
                        stroke="#ffffff"
                        strokeWidth={isHovered || isSelected ? 3 : 2}
                        style={{
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          filter: isHovered ? 'drop-shadow(0 0 4px rgba(79,70,229,0.5))' : 'none',
                        }}
                        onMouseEnter={() => setHoveredIndex(p.index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => onSelectTransmission && onSelectTransmission(p.item)}
                      />
                    </g>
                  );
                })}
              </>
            )}

            {/* MODO 2: GRÁFICA DE BARRAS */}
            {chartMode === 'bar' && (
              <>
                {points.map((p) => {
                  const isHovered = hoveredIndex === p.index;
                  const isSelected = selectedId === p.item.id;
                  const color = getColor(p.item);

                  const barWidth = Math.max(8, Math.min(28, (innerWidth / points.length) * 0.7));
                  const barHeight = Math.max(4, innerHeight - p.y);
                  const barX = p.x - barWidth / 2;

                  return (
                    <g key={p.item.id || p.index}>
                      <rect
                        x={barX}
                        y={p.y}
                        width={barWidth}
                        height={barHeight}
                        rx="3"
                        fill={color}
                        opacity={isHovered || isSelected ? 1 : 0.85}
                        stroke={isHovered || isSelected ? '#1e293b' : 'none'}
                        strokeWidth={isHovered ? 1.5 : 0}
                        style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                        onMouseEnter={() => setHoveredIndex(p.index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => onSelectTransmission && onSelectTransmission(p.item)}
                      />
                    </g>
                  );
                })}
              </>
            )}

            {/* Eje X (Etiquetas de fecha/hora) */}
            {points.length > 0 && (
              <g>
                <line x1={0} y1={innerHeight} x2={innerWidth} y2={innerHeight} stroke="#cbd5e1" strokeWidth="1" />
                {points.map((p, idx) => {
                  // Mostrar solo algunas etiquetas en el eje X para evitar sobrecarga
                  const step = Math.max(1, Math.ceil(points.length / 7));
                  if (idx % step !== 0 && idx !== points.length - 1) return null;

                  const date = new Date(p.item.createdAt);
                  const timeLabel = !Number.isNaN(date.getTime())
                    ? date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
                    : `#${idx + 1}`;

                  return (
                    <g key={`x-lbl-${idx}`}>
                      <line x1={p.x} y1={innerHeight} x2={p.x} y2={innerHeight + 5} stroke="#94a3b8" />
                      <text
                        x={p.x}
                        y={innerHeight + 16}
                        textAnchor="middle"
                        fontSize="9.5"
                        fill="#64748b"
                        fontFamily="inherit"
                      >
                        {timeLabel}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* Tooltip flotante SVG */}
            {hoveredPoint && (
              <g
                transform={`translate(${Math.min(innerWidth - 170, Math.max(10, hoveredPoint.x - 85))}, ${Math.max(10, hoveredPoint.y - 85)})`}
                style={{ pointerEvents: 'none' }}
                filter="url(#chartDropShadow)"
              >
                <rect
                  width="170"
                  height="72"
                  rx="6"
                  fill="#1e293b"
                  opacity="0.96"
                />
                {/* Header tooltip: Comprobante */}
                <text x="10" y="18" fill="#94a3b8" fontSize="10" fontFamily="inherit">
                  {hoveredPoint.item.series && hoveredPoint.item.number
                    ? `${hoveredPoint.item.series}-${hoveredPoint.item.number}`
                    : `Transmisión #${hoveredPoint.item.attemptNumber}`}
                  {' '}({hoveredPoint.item.operationType})
                </text>
                {/* Tiempo en ms */}
                <text x="10" y="38" fill="#ffffff" fontSize="15" fontWeight="700" fontFamily="inherit">
                  {hoveredPoint.item.responseTimeMs !== null
                    ? `${hoveredPoint.item.responseTimeMs} ms`
                    : 'Sin respuesta'}
                </text>
                {/* Estado SUNAT y HTTP */}
                <text x="10" y="55" fill={getColor(hoveredPoint.item)} fontSize="11" fontWeight="600" fontFamily="inherit">
                  {hoveredPoint.item.sunatStatus || hoveredPoint.item.transmissionStatus}
                  {hoveredPoint.item.httpStatus ? ` • HTTP ${hoveredPoint.item.httpStatus}` : ''}
                </text>
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* Barra de estado inferior de la gráfica */}
      <div style={{
        marginTop: '10px',
        paddingTop: '8px',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11.5px',
        color: '#64748b',
      }}>
        <span>
          Visualizando <strong>{chartItems.length}</strong> envíos registrados en orden cronológico
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <FiClock style={{ color: '#4f46e5' }} />
          Tiempo promedio: <strong>{stats.avg} ms</strong> ({stats.min} ms min / {stats.max} ms max)
        </span>
      </div>
    </div>
  );
};
