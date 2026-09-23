import type { FormEvent } from 'react';

interface Props {
  productName: string;
  bestPrice: number;
  currentPrice: number;
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

const money = (value: number) => `S/ ${value.toFixed(2)}`;

const ScrapingPriceDialog = ({ productName, bestPrice, currentPrice, value, loading, onChange, onClose, onSave }: Props) => {
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSave();
  };

  return <div className="scraping-modal-backdrop" role="presentation" onClick={onClose}>
    <form className="scraping-modal" role="dialog" aria-modal="true" aria-labelledby="price-dialog-title" onClick={event => event.stopPropagation()} onSubmit={submit}>
      <h3 id="price-dialog-title">Actualizar precio</h3>
      <p>{productName}</p>
      <div className="scraping-price-summary"><span>Precio actual: <strong>{money(currentPrice)}</strong></span><span>Mejor sugerencia: <strong>{money(bestPrice)}</strong></span></div>
      <label htmlFor="custom-product-price">Nuevo precio sin IGV</label>
      <input id="custom-product-price" className="erp-input" type="number" min="0" step="0.01" value={value} onChange={event => onChange(event.target.value)} autoFocus />
      <div className="scraping-modal-actions"><button type="button" className="scraping-secondary-button" onClick={onClose} disabled={loading}>Cancelar</button><button type="submit" className="scraping-confirm" disabled={loading || value.trim() === '' || !Number.isFinite(Number(value)) || Number(value) < 0}>{loading ? 'Actualizando…' : 'Guardar precio'}</button></div>
    </form>
  </div>;
};

export default ScrapingPriceDialog;
