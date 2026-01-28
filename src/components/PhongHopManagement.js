import React, { useState, useEffect } from 'react';
import PhongHopService from '../services/phongHopService';
import './PhongHopManagement.css';

const PhongHopManagement = ({ dbname = 'admin1' }) => {
  const [phongHopList, setPhongHopList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create, edit, view
  const [selectedPhongHop, setSelectedPhongHop] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    ten_phong_hop: '',
    vi_tri: '',
    suc_chua: '',
    mo_ta: '',
    thoi_gian_toi_da: '4',
    don_vi_id: '',
    tai_san_ids: []
  });

  // Filters
  const [filters, setFilters] = useState({
    don_vi_id: '',
    ten_phong_hop: ''
  });

  const phongHopService = new PhongHopService(dbname);

  useEffect(() => {
    fetchPhongHopList();
  }, [filters]);

  const fetchPhongHopList = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await phongHopService.getList(filters);
      
      if (result.status === 'success') {
        setPhongHopList(result.data || []);
      } else {
        setError(result.message || 'Không thể tải danh sách phòng họp');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải danh sách');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedPhongHop(null);
    setFormData({
      ten_phong_hop: '',
      vi_tri: '',
      suc_chua: '',
      mo_ta: '',
      thoi_gian_toi_da: '4',
      don_vi_id: '',
      tai_san_ids: []
    });
    setShowModal(true);
  };

  const handleEdit = (phongHop) => {
    setModalMode('edit');
    setSelectedPhongHop(phongHop);
    setFormData({
      ten_phong_hop: phongHop.ten_phong_hop || '',
      vi_tri: phongHop.vi_tri || '',
      suc_chua: phongHop.suc_chua || '',
      mo_ta: phongHop.mo_ta || '',
      thoi_gian_toi_da: phongHop.thoi_gian_toi_da?.toString() || '4',
      don_vi_id: phongHop.don_vi?.id || '',
      tai_san_ids: phongHop.tai_san_list?.map(ts => ts.id) || []
    });
    setShowModal(true);
  };

  const handleView = async (phongHop) => {
    try {
      setFormLoading(true);
      const result = await phongHopService.getById(phongHop.id);
      if (result.status === 'success') {
        setModalMode('view');
        setSelectedPhongHop(result.data);
        setShowModal(true);
      } else {
        alert('Không thể tải chi tiết phòng họp');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phòng họp này?')) {
      return;
    }

    try {
      const result = await phongHopService.delete(id);
      if (result.status === 'success') {
        alert('✅ ' + result.message);
        fetchPhongHopList();
      } else {
        alert('❌ ' + result.message);
      }
    } catch (err) {
      alert('❌ Lỗi: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.ten_phong_hop || !formData.vi_tri || !formData.suc_chua || 
        !formData.mo_ta || !formData.don_vi_id) {
      alert('⚠️ Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setFormLoading(true);

    try {
      const submitData = {
        ten_phong_hop: formData.ten_phong_hop,
        vi_tri: formData.vi_tri,
        suc_chua: parseInt(formData.suc_chua),
        mo_ta: formData.mo_ta,
        thoi_gian_toi_da: parseFloat(formData.thoi_gian_toi_da),
        don_vi_id: parseInt(formData.don_vi_id)
      };

      if (formData.tai_san_ids && formData.tai_san_ids.length > 0) {
        submitData.tai_san_ids = formData.tai_san_ids.map(id => parseInt(id));
      }

      let result;
      if (modalMode === 'create') {
        result = await phongHopService.create(submitData);
      } else {
        result = await phongHopService.update(selectedPhongHop.id, submitData);
      }

      if (result.status === 'success') {
        alert('✅ ' + result.message);
        setShowModal(false);
        fetchPhongHopList();
      } else {
        alert('❌ ' + result.message);
      }
    } catch (err) {
      alert('❌ Lỗi: ' + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <div className="loading-text">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="phong-hop-management">
      {/* Header */}
      <div className="app-header">
        <h1 className="app-title">🏢 Quản Lý Phòng Họp</h1>
        <button className="btn-primary" onClick={handleCreate}>
          ➕ Tạo Phòng Họp Mới
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Tên phòng họp:</label>
          <input
            type="text"
            name="ten_phong_hop"
            value={filters.ten_phong_hop}
            onChange={handleFilterChange}
            placeholder="Tìm kiếm theo tên..."
          />
        </div>
        <div className="filter-group">
          <label>Đơn vị ID:</label>
          <input
            type="number"
            name="don_vi_id"
            value={filters.don_vi_id}
            onChange={handleFilterChange}
            placeholder="Lọc theo đơn vị..."
          />
        </div>
        <button className="btn-secondary" onClick={() => setFilters({ don_vi_id: '', ten_phong_hop: '' })}>
          🔄 Xóa bộ lọc
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Table */}
      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">
            📋 Danh Sách Phòng Họp ({phongHopList.length})
          </h2>
        </div>

        <div className="card-body">
          {phongHopList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p className="empty-text">Chưa có phòng họp nào</p>
              <button className="btn-primary" onClick={handleCreate}>
                ➕ Tạo phòng họp đầu tiên
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="crud-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên Phòng Họp</th>
                    <th>Vị Trí</th>
                    <th>Sức Chứa</th>
                    <th>Thời Gian Tối Đa</th>
                    <th>Đơn Vị</th>
                    <th>Số Đặt Phòng</th>
                    <th>Số Tài Sản</th>
                    <th className="actions-col">Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {phongHopList.map((ph) => (
                    <tr key={ph.id}>
                      <td>{ph.id}</td>
                      <td className="booking-name">{ph.ten_phong_hop}</td>
                      <td>{ph.vi_tri}</td>
                      <td>{ph.suc_chua}</td>
                      <td>{ph.thoi_gian_toi_da} giờ</td>
                      <td>{ph.don_vi?.ten || 'N/A'}</td>
                      <td>{ph.so_luong_dat_phong || 0}</td>
                      <td>{ph.so_luong_tai_san || 0}</td>
                      <td className="actions-col">
                        <button
                          className="btn-view"
                          onClick={() => handleView(ph)}
                          title="Xem chi tiết"
                        >
                          👁️
                        </button>
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(ph)}
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(ph.id)}
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode === 'create' && '➕ Tạo Phòng Họp Mới'}
                {modalMode === 'edit' && '✏️ Chỉnh Sửa Phòng Họp'}
                {modalMode === 'view' && '👁️ Chi Tiết Phòng Họp'}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            {modalMode === 'view' ? (
              <div className="modal-view">
                {selectedPhongHop && (
                  <>
                    <div className="view-section">
                      <h3 className="view-section-title">📋 Thông Tin Phòng Họp</h3>
                      <div className="view-grid">
                        <div className="view-item">
                          <label className="view-label">Tên Phòng Họp</label>
                          <div className="view-value">{selectedPhongHop.ten_phong_hop}</div>
                        </div>
                        <div className="view-item">
                          <label className="view-label">Vị Trí</label>
                          <div className="view-value">{selectedPhongHop.vi_tri}</div>
                        </div>
                        <div className="view-item">
                          <label className="view-label">Sức Chứa</label>
                          <div className="view-value">{selectedPhongHop.suc_chua} người</div>
                        </div>
                        <div className="view-item">
                          <label className="view-label">Thời Gian Tối Đa</label>
                          <div className="view-value">{selectedPhongHop.thoi_gian_toi_da} giờ</div>
                        </div>
                        <div className="view-item">
                          <label className="view-label">Đơn Vị</label>
                          <div className="view-value">
                            {selectedPhongHop.don_vi?.ten || 'N/A'}
                            {selectedPhongHop.don_vi?.ma_don_vi && ` (${selectedPhongHop.don_vi.ma_don_vi})`}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="view-section">
                      <h3 className="view-section-title">📝 Mô Tả</h3>
                      <div className="view-description">
                        {selectedPhongHop.mo_ta || 'Không có mô tả'}
                      </div>
                    </div>

                    {selectedPhongHop.dat_phong_list && selectedPhongHop.dat_phong_list.length > 0 && (
                      <div className="view-section">
                        <h3 className="view-section-title">📅 Danh Sách Đặt Phòng ({selectedPhongHop.dat_phong_list.length})</h3>
                        <div className="view-list">
                          {selectedPhongHop.dat_phong_list.map((dp) => (
                            <div key={dp.id} className="view-list-item">
                              <strong>{dp.ten_dat_phong}</strong>
                              <span>{dp.trang_thai}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedPhongHop.tai_san_list && selectedPhongHop.tai_san_list.length > 0 && (
                      <div className="view-section">
                        <h3 className="view-section-title">💼 Danh Sách Tài Sản ({selectedPhongHop.tai_san_list.length})</h3>
                        <div className="view-list">
                          {selectedPhongHop.tai_san_list.map((ts) => (
                            <div key={ts.id} className="view-list-item">
                              <strong>{ts.ten_tai_san}</strong>
                              <span>{ts.loai_tai_san} - {ts.tinh_trang}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="view-actions">
                      <button className="btn-secondary" onClick={() => setShowModal(false)}>
                        ❌ Đóng
                      </button>
                      <button className="btn-primary" onClick={() => handleEdit(selectedPhongHop)}>
                        ✏️ Chỉnh Sửa
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label htmlFor="ten_phong_hop">Tên Phòng Họp *</label>
                  <input
                    type="text"
                    id="ten_phong_hop"
                    name="ten_phong_hop"
                    value={formData.ten_phong_hop}
                    onChange={handleInputChange}
                    placeholder="VD: Phòng họp A1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="vi_tri">Vị Trí *</label>
                  <input
                    type="text"
                    id="vi_tri"
                    name="vi_tri"
                    value={formData.vi_tri}
                    onChange={handleInputChange}
                    placeholder="VD: Tầng 2, phòng 201"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="suc_chua">Sức Chứa *</label>
                    <input
                      type="number"
                      id="suc_chua"
                      name="suc_chua"
                      value={formData.suc_chua}
                      onChange={handleInputChange}
                      placeholder="VD: 20"
                      min="1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="thoi_gian_toi_da">Thời Gian Tối Đa (giờ)</label>
                    <input
                      type="number"
                      id="thoi_gian_toi_da"
                      name="thoi_gian_toi_da"
                      value={formData.thoi_gian_toi_da}
                      onChange={handleInputChange}
                      placeholder="VD: 4"
                      min="0.5"
                      step="0.5"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="don_vi_id">Đơn Vị ID *</label>
                  <input
                    type="number"
                    id="don_vi_id"
                    name="don_vi_id"
                    value={formData.don_vi_id}
                    onChange={handleInputChange}
                    placeholder="VD: 1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="mo_ta">Mô Tả *</label>
                  <textarea
                    id="mo_ta"
                    name="mo_ta"
                    value={formData.mo_ta}
                    onChange={handleInputChange}
                    placeholder="Mô tả về phòng họp..."
                    rows="4"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tai_san_ids">Tài Sản IDs (cách nhau bởi dấu phẩy)</label>
                  <input
                    type="text"
                    id="tai_san_ids"
                    name="tai_san_ids"
                    value={formData.tai_san_ids.join(', ')}
                    onChange={(e) => {
                      const value = e.target.value;
                      const ids = value ? value.split(',').map(id => id.trim()).filter(id => id) : [];
                      setFormData(prev => ({ ...prev, tai_san_ids: ids }));
                    }}
                    placeholder="VD: 1, 2, 3"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    ❌ Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={formLoading}
                  >
                    {formLoading ? '⏳ Đang xử lý...' : (modalMode === 'create' ? '✅ Tạo Mới' : '✅ Cập Nhật')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhongHopManagement;
