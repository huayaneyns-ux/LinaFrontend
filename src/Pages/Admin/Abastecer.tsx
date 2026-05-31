import './AdminStyles.css';

const Abastecer = () => {
  return (
    <div className="admin-container fade-in">
      <div className="admin-header">
        <h1>Abastecer Inventario</h1>
      </div>

      <div className="admin-grid-3">
        <div className="admin-card" style={{gridColumn: '1 / span 2'}}>
          <h2>Búsqueda de Proveedor</h2>
          <div style={{display: 'flex', gap: '15px', marginTop: '15px'}}>
            <input type="text" placeholder="Ingresar RUC del proveedor" style={{flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc'}} />
            <button className="btn btn-primary">Buscar SUNAT</button>
          </div>
          
          <div style={{marginTop: '30px'}}>
            <h3>Agregar Productos</h3>
            <div style={{display: 'flex', gap: '15px', marginTop: '15px'}}>
              <input type="text" placeholder="Buscar producto por código o nombre" style={{flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc'}} />
              <input type="number" placeholder="Cantidad" style={{width: '100px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc'}} />
              <button className="btn btn-outline">Añadir a lista</button>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h2>Resumen de Ingreso</h2>
          <p style={{marginTop: '15px', color: 'var(--text-muted)'}}>No hay productos en la lista.</p>
          <div style={{marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #eee'}}>
            <button className="btn btn-primary" style={{width: '100%'}} disabled>Confirmar Abastecimiento</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Abastecer;
