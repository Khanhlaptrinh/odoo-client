import React, { useState, useEffect } from 'react';
import TaiSanService from '../services/taiSanService';
import './TaiSanManagement.css';

const TaiSanManagement = ({ dbname = 'admin1' }) => {
  const [taiSanList, setTaiSanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create, edit, view
  const [selectedTaiSan, setSelectedTaiSan] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Lịch sử cấp phát
  const [showLichSuModal, setShowLichSuModal] = useState(false);
  const [lichSuList, setLichSuList] = useState([]);
  const [lichSuLoading, setLichSuLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    ma_tai_san: '',
    ten_tai_san: '',
    loai_tai_san: '',
    gia_tri: '',
    ngay_mua: '',
    tinh_trang: '',
    vi_tri: '',
    nhan_vien_id: ''
  });

  // Filters
  const [filters, setFilters] = useState({
    loai_tai_san: '',
    tinh_trang: '',
    nhan_vien_id: '',
    ma_tai_san: '',
    ten_tai_san: '',
    vi_tri: '',
    tu_ngay_mua: '',
    den_ngay_mua: '',
    tu_gia_tri: '',
    den_gia_tri: ''
  });

  const taiSanService = new TaiSanService(dbname);

  useEffect(() => {
    fetchTaiSanList();
  }, [filters]);

  const fetchTaiSanList = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await taiSanService.getList(filters);
      
      if (result.status === 'success') {
        setTaiSanList(result.data || []);
      } else {
        setError(result.message || 'Không thể tải danh sách tài sản');
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
    setSelectedTaiSan(null);
    setFormData({
      ma_tai_san: '',
      ten_tai_san: '',
      loai_tai_san: '',
      gia_tri: '',
      ngay_mua: '',
      tinh_trang: '',
      vi_tri: '',
      nhan_vien_id: ''
    });
    setShowModal(true);
  };

  const handleEdit = (taiSan) => {
    setModalMode('edit');
    setSelectedTaiSan(taiSan);
    setFormData({
      ma_tai_san: taiSan.ma_tai_san || '',
      ten_tai_san: taiSan.ten_tai_san || '',
      loai_tai_san: taiSan.loai_tai_san || '',
      gia_tri: taiSan.gia_tri?.toString() || '',
      ngay_mua: taiSan.ngay_mua ? taiSan.ngay_mua.split(' ')[0] : '',
      tinh_trang: taiSan.tinh_trang || '',
      vi_tri: taiSan.vi_tri || '',
      nhan_vien_id: taiSan.nhan_vien_quan_ly?.id || ''
    });
    setShowModal(true);
  };

  const handleView = (taiSan) => {
    setModalMode('view');
    setSelectedTaiSan(taiSan);
    setShowModal(true);
  };

  const handleViewLichSu = async (taiSan) => {
    try {
      setLichSuLoading(true);
      const result = await taiSanService.getLichSuCapPhat({ tai_san_id: taiSan.id });
      if (result.status === 'success') {
        setLichSuList(result.data || []);
        setSelectedTaiSan(taiSan);
        setShowLichSuModal(true);
      } else {
        alert('Không thể tải lịch sử cấp phát');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    } finally {
      setLichSuLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài sản này?')) {
      return;
    }

    try {
      const result = await taiSanService.delete(id);
      if (result.status === 'success') {
        alert('✅ ' + result.message);
        fetchTaiSanList();
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
    if (!formData.ma_tai_san || !formData.ten_tai_san || !formData.loai_tai_san) {
      alert('⚠️ Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setFormLoading(true);

    try {
      const submitData = {
        ma_tai_san: formData.ma_tai_san,
        ten_tai_san: formData.ten_tai_san,
        loai_tai_san: formData.loai_tai_san,
        tinh_trang: formData.tinh_trang,
        vi_tri: formData.vi_tri
      };

      if (formData.gia_tri) {
        submitData.gia_tri = parseFloat(formData.gia_tri);
      }
      if (formData.ngay_mua) {
        submitData.ngay_mua = formData.ngay_mua;
      }
      if (formData.nhan_vien_id) {
        submitData.nhan_vien_id = parseInt(formData.nhan_vien_id);
      }

      let result;
      if (modalMode === 'create') {
        result = await taiSanService.create(submitData);
      } else {
        result = await taiSanService.update(selectedTaiSan.id, submitData);
      }

      if (result.status === 'success') {
        alert('✅ ' + result.message);
        setShowModal(false);
        fetchTaiSanList();
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

  const formatCurrency = (value) => {
    if (!value) return '0';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
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
    <div className="tai-san-management">
      {/* Header */}
      <div className="app-header">
        <h1 className="app-title">💼 Quản Lý Tài Sản Doanh Nghiệp</h1>
        <button className="btn-primary" onClick={handleCreate}>
          ➕ Tạo Tài Sản Mới
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-row">
          {/* Cột trái */}
          <div className="filter-column">
            <div className="filter-group">
              <label>📍 Vị trí:</label>
              <input
                type="text"
                name="vi_tri"
                value={filters.vi_tri}
                onChange={handleFilterChange}
                placeholder="Tìm theo vị trí..."
              />
            </div>
            <div className="filter-group">
              <label>🏷️ Mã tài sản:</label>
              <input
                type="text"
                name="ma_tai_san"
                value={filters.ma_tai_san}
                onChange={handleFilterChange}
                placeholder="Tìm theo mã..."
              />
            </div>
            <div className="filter-group">
              <label>📦 Tên tài sản:</label>
              <input
                type="text"
                name="ten_tai_san"
                value={filters.ten_tai_san}
                onChange={handleFilterChange}
                placeholder="Tìm theo tên..."
              />
            </div>
            <div className="filter-group">
              <label>📋 Loại tài sản:</label>
              <select
                name="loai_tai_san"
                value={filters.loai_tai_san}
                onChange={handleFilterChange}
              >
                <option value="">Tất cả</option>
                <option value="may_tinh">Máy tính</option>
                <option value="may_in">Máy in</option>
                <option value="ban_ghe">Bàn ghế</option>
                <option value="xe">Xe</option>
                <option value="khac">Khác</option>
              </select>
            </div>
            <div className="filter-group">
              <label>⚡ Tình trạng:</label>
              <select
                name="tinh_trang"
                value={filters.tinh_trang}
                onChange={handleFilterChange}
              >
                <option value="">Tất cả</option>
                <option value="moi">Mới</option>
                <option value="tot">Tốt</option>
                <option value="hong">Hỏng</option>
                <option value="can_bao_tri">Cần bảo trì</option>
              </select>
            </div>
          </div>

          {/* Cột phải */}
          <div className="filter-column">
            <div className="filter-group">
              <label>📅 Từ ngày mua:</label>
              <input
                type="date"
                name="tu_ngay_mua"
                value={filters.tu_ngay_mua}
                onChange={handleFilterChange}
              />
            </div>
            <div className="filter-group">
              <label>📅 Đến ngày mua:</label>
              <input
                type="date"
                name="den_ngay_mua"
                value={filters.den_ngay_mua}
                onChange={handleFilterChange}
              />
            </div>
            <div className="filter-group">
              <label>💰 Từ giá trị:</label>
              <div className="input-with-prefix">
                <span className="input-prefix">VNĐ</span>
                <input
                  type="number"
                  name="tu_gia_tri"
                  value={filters.tu_gia_tri}
                  onChange={handleFilterChange}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="filter-group">
              <label>💰 Đến giá trị:</label>
              <div className="input-with-prefix">
                <span className="input-prefix">VNĐ</span>
                <input
                  type="number"
                  name="den_gia_tri"
                  value={filters.den_gia_tri}
                  onChange={handleFilterChange}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Button Xóa bộ lọc */}
        <div className="filter-actions">
          <button className="btn-secondary" onClick={() => setFilters({
            loai_tai_san: '', tinh_trang: '', nhan_vien_id: '', ma_tai_san: '',
            ten_tai_san: '', vi_tri: '', tu_ngay_mua: '', den_ngay_mua: '',
            tu_gia_tri: '', den_gia_tri: ''
          })}>
            🔄 Xóa bộ lọc
          </button>
        </div>
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
            📋 Danh Sách Tài Sản ({taiSanList.length})
          </h2>
        </div>

        <div className="card-body">
          {taiSanList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p className="empty-text">Chưa có tài sản nào</p>
              <button className="btn-primary" onClick={handleCreate}>
                ➕ Tạo tài sản đầu tiên
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="crud-table">
                <thead>
                  <tr>
                    <th>Mã TS</th>
                    <th>Tên Tài Sản</th>
                    <th>Loại</th>
                    <th>Giá Trị</th>
                    <th>Ngày Mua</th>
                    <th>Tình Trạng</th>
                    <th>Vị Trí</th>
                    <th>Người Quản Lý</th>
                    <th className="actions-col">Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {taiSanList.map((ts) => (
                    <tr key={ts.id}>
                      <td className="booking-name">{ts.ma_tai_san}</td>
                      <td>{ts.ten_tai_san}</td>
                      <td>{ts.loai_tai_san_label || ts.loai_tai_san}</td>
                      <td>{formatCurrency(ts.gia_tri)}</td>
                      <td>{formatDate(ts.ngay_mua)}</td>
                      <td>
                        <span className={`status-badge status-${ts.tinh_trang}`}>
                          {ts.tinh_trang_label || ts.tinh_trang || 'N/A'}
                        </span>
                      </td>
                      <td>{ts.vi_tri || 'N/A'}</td>
                      <td>{ts.nhan_vien_quan_ly?.ho_va_ten || 'N/A'}</td>
                      <td className="actions-col">
                        <button
                          className="btn-view"
                          onClick={() => handleView(ts)}
                          title="Xem chi tiết"
                        >
                          👁️
                        </button>
                        <button
                          className="btn-info"
                          onClick={() => handleViewLichSu(ts)}
                          title="Lịch sử cấp phát"
                        >
                          📋
                        </button>
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(ts)}
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(ts.id)}
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

      {/* Modal Tài Sản */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode === 'create' && '➕ Tạo Tài Sản Mới'}
                {modalMode === 'edit' && '✏️ Chỉnh Sửa Tài Sản'}
                {modalMode === 'view' && '👁️ Chi Tiết Tài Sản'}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            {modalMode === 'view' ? (
              <div className="modal-view">
                {selectedTaiSan && (
                  <>
                    <div className="view-section">
                      <h3 className="view-section-title">📋 Thông Tin Tài Sản</h3>
                      <div className="view-grid">
                        <div className="view-item">
                          <label className="view-label">Mã Tài Sản</label>
                          <div className="view-value">{selectedTaiSan.ma_tai_san}</div>
                        </div>
                        <div className="view-item">
                          <label className="view-label">Tên Tài Sản</label>
                          <div className="view-value">{selectedTaiSan.ten_tai_san}</div>
                        </div>
                        <div className="view-item">
                          <label className="view-label">Loại Tài Sản</label>
                          <div className="view-value">
                            {selectedTaiSan.loai_tai_san_label || selectedTaiSan.loai_tai_san}
                          </div>
                        </div>
                        <div className="view-item">
                          <label className="view-label">Giá Trị</label>
                          <div className="view-value">{formatCurrency(selectedTaiSan.gia_tri)}</div>
                        </div>
                        <div className="view-item">
                          <label className="view-label">Ngày Mua</label>
                          <div className="view-value">{formatDate(selectedTaiSan.ngay_mua)}</div>
                        </div>
                        <div className="view-item">
                          <label className="view-label">Tình Trạng</label>
                          <div className="view-value">
                            <span className={`status-badge status-${selectedTaiSan.tinh_trang}`}>
                              {selectedTaiSan.tinh_trang_label || selectedTaiSan.tinh_trang || 'N/A'}
                            </span>
                          </div>
                        </div>
                        <div className="view-item">
                          <label className="view-label">Vị Trí</label>
                          <div className="view-value">{selectedTaiSan.vi_tri || 'N/A'}</div>
                        </div>
                        {selectedTaiSan.nhan_vien_quan_ly && (
                          <div className="view-item">
                            <label className="view-label">Người Quản Lý</label>
                            <div className="view-value">
                              {selectedTaiSan.nhan_vien_quan_ly.ho_va_ten}
                              {selectedTaiSan.nhan_vien_quan_ly.email && ` (${selectedTaiSan.nhan_vien_quan_ly.email})`}
                              {selectedTaiSan.nhan_vien_quan_ly.phong_ban && ` - ${selectedTaiSan.nhan_vien_quan_ly.phong_ban}`}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="view-section">
                      <h3 className="view-section-title">📊 Thống Kê</h3>
                      <div className="view-grid">
                        <div className="view-item">
                          <label className="view-label">Số Lượng Cấp Phát</label>
                          <div className="view-value">{selectedTaiSan.so_luong_cap_phat || 0}</div>
                        </div>
                        <div className="view-item">
                          <label className="view-label">Số Lượng Mượn Trả</label>
                          <div className="view-value">{selectedTaiSan.so_luong_muon_tra || 0}</div>
                        </div>
                        <div className="view-item">
                          <label className="view-label">Số Lượng Bảo Trì</label>
                          <div className="view-value">{selectedTaiSan.so_luong_bao_tri || 0}</div>
                        </div>
                      </div>
                    </div>

                    <div className="view-actions">
                      <button className="btn-secondary" onClick={() => setShowModal(false)}>
                        ❌ Đóng
                      </button>
                      <button className="btn-primary" onClick={() => handleEdit(selectedTaiSan)}>
                        ✏️ Chỉnh Sửa
                      </button>
                      <button className="btn-info" onClick={() => handleViewLichSu(selectedTaiSan)}>
                        📋 Xem Lịch Sử
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label htmlFor="ma_tai_san">Mã Tài Sản *</label>
                  <input
                    type="text"
                    id="ma_tai_san"
                    name="ma_tai_san"
                    value={formData.ma_tai_san}
                    onChange={handleInputChange}
                    placeholder="VD: TS001"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="ten_tai_san">Tên Tài Sản *</label>
                  <input
                    type="text"
                    id="ten_tai_san"
                    name="ten_tai_san"
                    value={formData.ten_tai_san}
                    onChange={handleInputChange}
                    placeholder="VD: Laptop Dell XPS 15"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="loai_tai_san">Loại Tài Sản *</label>
                    <select
                      id="loai_tai_san"
                      name="loai_tai_san"
                      value={formData.loai_tai_san}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">-- Chọn loại --</option>
                      <option value="may_tinh">Máy tính</option>
                      <option value="may_in">Máy in</option>
                      <option value="ban_ghe">Bàn ghế</option>
                      <option value="xe">Xe</option>
                      <option value="khac">Khác</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="tinh_trang">Tình Trạng</label>
                    <select
                      id="tinh_trang"
                      name="tinh_trang"
                      value={formData.tinh_trang}
                      onChange={handleInputChange}
                    >
                      <option value="">-- Chọn tình trạng --</option>
                      <option value="moi">Mới</option>
                      <option value="tot">Tốt</option>
                      <option value="hong">Hỏng</option>
                      <option value="can_bao_tri">Cần bảo trì</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="gia_tri">Giá Trị (VNĐ)</label>
                    <input
                      type="number"
                      id="gia_tri"
                      name="gia_tri"
                      value={formData.gia_tri}
                      onChange={handleInputChange}
                      placeholder="VD: 15000000"
                      min="0"
                      step="1000"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="ngay_mua">Ngày Mua</label>
                    <input
                      type="date"
                      id="ngay_mua"
                      name="ngay_mua"
                      value={formData.ngay_mua}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="vi_tri">Vị Trí</label>
                  <input
                    type="text"
                    id="vi_tri"
                    name="vi_tri"
                    value={formData.vi_tri}
                    onChange={handleInputChange}
                    placeholder="VD: Tầng 2, phòng 201"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="nhan_vien_id">Người Quản Lý ID</label>
                  <input
                    type="number"
                    id="nhan_vien_id"
                    name="nhan_vien_id"
                    value={formData.nhan_vien_id}
                    onChange={handleInputChange}
                    placeholder="VD: 1"
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

      {/* Modal Lịch Sử Cấp Phát */}
      {showLichSuModal && (
        <div className="modal-overlay" onClick={() => setShowLichSuModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                📋 Lịch Sử Cấp Phát - {selectedTaiSan?.ten_tai_san}
              </h2>
              <button className="modal-close" onClick={() => setShowLichSuModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-view">
              {lichSuLoading ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <div className="loading-text">Đang tải...</div>
                </div>
              ) : lichSuList.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <p className="empty-text">Chưa có lịch sử cấp phát</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="crud-table">
                    <thead>
                      <tr>
                        <th>Ngày Cấp</th>
                        <th>Ngày Thu Hồi</th>
                        <th>Trạng Thái</th>
                        <th>Số Ngày</th>
                        <th>Nhân Viên</th>
                        <th>Phòng Ban</th>
                        <th>Chức Vụ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lichSuList.map((ls) => (
                        <tr key={ls.id}>
                          <td>{formatDate(ls.ngay_cap)}</td>
                          <td>{formatDate(ls.ngay_thu_hoi) || 'Chưa thu hồi'}</td>
                          <td>
                            <span className={`status-badge status-${ls.trang_thai}`}>
                              {ls.trang_thai_label}
                            </span>
                          </td>
                          <td>{ls.so_ngay_da_cap !== null ? `${ls.so_ngay_da_cap} ngày` : 'N/A'}</td>
                          <td>{ls.nhan_vien?.ho_va_ten || 'N/A'}</td>
                          <td>{ls.nhan_vien?.phong_ban || 'N/A'}</td>
                          <td>{ls.nhan_vien?.chuc_vu || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="view-actions">
              <button className="btn-secondary" onClick={() => setShowLichSuModal(false)}>
                ❌ Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaiSanManagement;
