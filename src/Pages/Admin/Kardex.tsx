import './AdminStyles.css';

const Kardex = () => {
  return (
    <div className="admin-container fade-in">
      <div className="admin-header">
        <h1>Kardex Valorizado</h1>
        <button className="btn btn-outline">Exportar a Excel</button>
      </div>

      <div className="admin-card">
        <div style={{display: 'flex', gap: '15px', marginBottom: '20px'}}>
          <input type="text" placeholder="Código de producto" style={{padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '200px'}} />
          <button className="btn btn-primary">Generar Kardex</button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th rowSpan={2}>Fecha</th>
                <th rowSpan={2}>Detalle</th>
                <th colSpan={3} style={{textAlign: 'center', backgroundColor: '#e9ecef'}}>Entradas</th>
                <th colSpan={3} style={{textAlign: 'center', backgroundColor: '#f8d7da'}}>Salidas</th>
                <th colSpan={3} style={{textAlign: 'center', backgroundColor: '#d4edda'}}>Saldos</th>
              </tr>
              <tr>
                <th>Cant</th>
                <th>V.U.</th>
                <th>V.T.</th>
                <th>Cant</th>
                <th>V.U.</th>
                <th>V.T.</th>
                <th>Cant</th>
                <th>V.U.</th>
                <th>V.T.</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={11} style={{textAlign: 'center', padding: '30px', color: 'var(--text-muted)'}}>
                  Ingrese un código de producto para generar el Kardex
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Kardex;
