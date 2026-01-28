import axios from "axios";
import { useEffect, useState } from "react";
import "../App.css";
import DatPhongService from "../services/datPhongService";
import PhongHopService from "../services/phongHopService";

function DatPhongManagement({ dbname = "admin1" }) {
  const [phongHopList, setPhongHopList] = useState([]);
  const [bookingList, setBookingList] = useState([]);
  const [selectedPhongHopId, setSelectedPhongHopId] = useState(null);
  const [selectedPhongHopDetail, setSelectedPhongHopDetail] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // CRUD States
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingBooking, setEditingBooking] = useState(null);
  const [viewingBooking, setViewingBooking] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    trang_thai: '',
    tu_ngay: '',
    den_ngay: '',
    ten_dat_phong: ''
  });
  
  const [formData, setFormData] = useState({
    ten_dat_phong: "",
    phong_hop_id: "",
    nhan_vien_id: 3,
    thoi_gian_bat_dau: "",
    thoi_gian_ket_thuc: "",
    muc_dich: ""
  });
  const [formLoading, setFormLoading] = useState(false);

  const datPhongService = new DatPhongService(dbname);
  const phongHopService = new PhongHopService(dbname);

  // Fetch danh sách phòng họp
  useEffect(() => {
    fetchPhongHopList();
  }, []);

  // Fetch chi tiết phòng họp và danh sách đặt phòng khi chọn phòng
  useEffect(() => {
    if (selectedPhongHopId) {
      fetchPhongHopDetail();
      fetchBookingList();
    }
  }, [selectedPhongHopId, filters]);

  const fetchPhongHopList = async () => {
    try {
      setLoading(true);
      const result = await phongHopService.getList();
      
      if (result.status === 'success') {
        setPhongHopList(result.data || []);
        
        if (result.data && result.data.length > 0 && !selectedPhongHopId) {
          setSelectedPhongHopId(result.data[0].id);
        }
        setError(null);
      } else {
        setError(result.message || 'Không thể tải danh sách phòng họp');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Không thể tải danh sách phòng họp");
    } finally {
      setLoading(false);
    }
  };

  const fetchPhongHopDetail = async () => {
    try {
      const result = await phongHopService.getById(selectedPhongHopId);
      
      if (result.status === 'success') {
        setSelectedPhongHopDetail(result.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookingList = async () => {
    try {
      const filterParams = {
        phong_hop_id: selectedPhongHopId,
        ...filters
      };
      
      const result = await datPhongService.getList(filterParams);
      
      if (result.status === 'success') {
        setBookingList(result.data || []);
      } else {
        setBookingList([]);
      }
    } catch (err) {
      console.error(err);
      setBookingList([]);
    }
  };

  // CREATE - Mở modal tạo mới
  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      ten_dat_phong: "",
      phong_hop_id: selectedPhongHopId,
      nhan_vien_id: 3,
      thoi_gian_bat_dau: "",
      thoi_gian_ket_thuc: "",
      muc_dich: ""
    });
    setShowModal(true);
  };

  // UPDATE - Mở modal chỉnh sửa
  const handleEdit = (booking) => {
    setModalMode('edit');
    setEditingBooking(booking);
    setFormData({
      ten_dat_phong: booking.ten_dat_phong,
      phong_hop_id: booking.phong_hop?.id || booking.phong_hop_id || selectedPhongHopId,
      nhan_vien_id: booking.nhan_vien?.id || booking.nhan_vien_id || 3,
      thoi_gian_bat_dau: formatDateTimeLocal(booking.thoi_gian_bat_dau),
      thoi_gian_ket_thuc: formatDateTimeLocal(booking.thoi_gian_ket_thuc),
      muc_dich: booking.muc_dich || ''
    });
    setShowModal(true);
  };

  // VIEW - Mở modal xem chi tiết
  const handleView = (booking) => {
    setModalMode('view');
    setViewingBooking(booking);
    setShowModal(true);
  };

  // DELETE
  const handleDelete = async (bookingId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đặt phòng này?")) {
      return;
    }

    try {
      const result = await datPhongService.delete(bookingId);
      if (result.status === 'success') {
        alert("✅ " + result.message);
        fetchBookingList(); // Reload lại danh sách
      } else {
        alert("❌ " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi xóa: " + err.message);
    }
  };

  // SUBMIT FORM (Create hoặc Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.ten_dat_phong || !formData.thoi_gian_bat_dau || 
        !formData.thoi_gian_ket_thuc || !formData.phong_hop_id) {
      alert("⚠️ Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setFormLoading(true);

    try {
      const submitData = {
        ten_dat_phong: formData.ten_dat_phong,
        phong_hop_id: parseInt(formData.phong_hop_id),
        thoi_gian_bat_dau: formData.thoi_gian_bat_dau,
        thoi_gian_ket_thuc: formData.thoi_gian_ket_thuc,
        muc_dich: formData.muc_dich || ''
      };

      if (formData.nhan_vien_id) {
        submitData.nhan_vien_id = parseInt(formData.nhan_vien_id);
      }

      let result;
      if (modalMode === 'create') {
        // CREATE
        result = await datPhongService.create(submitData);
      } else {
        // UPDATE
        result = await datPhongService.update(editingBooking.id, submitData);
      }

      if (result.status === 'success') {
        alert("✅ " + result.message);
        setShowModal(false);
        fetchBookingList(); // Reload lại danh sách
      } else {
        alert("❌ " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi: " + err.message);
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

  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <div className="loading-text">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-box">{error}</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <div className="app-header">
        <h1 className="app-title">🏢 Quản Lý Đặt Phòng Họp</h1>
        <button className="btn-primary" onClick={handleCreate}>
          ➕ Tạo Đặt Phòng Mới
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Tên đặt phòng:</label>
          <input
            type="text"
            name="ten_dat_phong"
            value={filters.ten_dat_phong}
            onChange={handleFilterChange}
            placeholder="Tìm kiếm theo tên..."
          />
        </div>
        <div className="filter-group">
          <label>Trạng thái:</label>
          <select
            name="trang_thai"
            value={filters.trang_thai}
            onChange={handleFilterChange}
          >
            <option value="">Tất cả</option>
            <option value="draft">Draft</option>
            <option value="confirmed">Confirmed</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Từ ngày:</label>
          <input
            type="date"
            name="tu_ngay"
            value={filters.tu_ngay}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-group">
          <label>Đến ngày:</label>
          <input
            type="date"
            name="den_ngay"
            value={filters.den_ngay}
            onChange={handleFilterChange}
          />
        </div>
        <button className="btn-secondary" onClick={() => setFilters({ trang_thai: '', tu_ngay: '', den_ngay: '', ten_dat_phong: '' })}>
          🔄 Xóa bộ lọc
        </button>
      </div>

      {/* Main Layout */}
      <div className="main-layout">
        {/* Sidebar - Danh sách phòng họp */}
        <div className="sidebar">
          <h2 className="sidebar-title">📋 Danh Sách Phòng Họp</h2>
          <div className="phong-hop-list">
            {phongHopList.map(ph => (
              <div
                key={ph.id}
                className={`phong-hop-item ${selectedPhongHopId === ph.id ? 'active' : ''}`}
                onClick={() => setSelectedPhongHopId(ph.id)}
              >
                <div className="phong-hop-name">{ph.ten_phong_hop}</div>
                <div className="phong-hop-info">
                  <span>📍 {ph.vi_tri}</span>
                  <span>👥 {ph.suc_chua}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content - CRUD Table */}
        <div className="main-content">
          <div className="content-card">
            <div className="card-header">
              <h2 className="card-title">
                📅 Danh Sách Đặt Phòng
                {selectedPhongHopDetail && (
                  <span className="card-subtitle">
                    {selectedPhongHopDetail.ten_phong_hop}
                  </span>
                )}
              </h2>
            </div>

            <div className="card-body">
              {bookingList.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <p className="empty-text">Chưa có đặt phòng nào</p>
                  <button className="btn-primary" onClick={handleCreate}>
                    ➕ Tạo đặt phòng đầu tiên
                  </button>
                </div>
              ) : (
                <div className="table-container">
                  <table className="crud-table">
                    <thead>
                      <tr>
                        <th>Tên Cuộc Họp</th>
                        <th>Thời Gian Bắt Đầu</th>
                        <th>Thời Gian Kết Thúc</th>
                        <th>Mục Đích</th>
                        <th>Trạng Thái</th>
                        <th className="actions-col">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingList.map((booking, index) => (
                        <tr key={index}>
                          <td className="booking-name">{booking.ten_dat_phong}</td>
                          <td>{formatDateTime(booking.thoi_gian_bat_dau)}</td>
                          <td>{formatDateTime(booking.thoi_gian_ket_thuc)}</td>
                          <td className="muc-dich">{booking.muc_dich || 'N/A'}</td>
                          <td>
                            <span className={`status-badge status-${booking.trang_thai}`}>
                              {booking.trang_thai_label || booking.trang_thai || 'N/A'}
                            </span>
                            {booking.thoi_gian_dat && (
                              <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                                ⏱️ {booking.thoi_gian_dat} giờ
                              </div>
                            )}
                          </td>
                          <td className="actions-col">
                            <button 
                              className="btn-view"
                              onClick={() => handleView(booking)}
                              title="Xem chi tiết"
                            >
                              👁️
                            </button>
                            <button 
                              className="btn-edit"
                              onClick={() => handleEdit(booking)}
                              title="Chỉnh sửa"
                            >
                              ✏️
                            </button>
                            <button 
                              className="btn-delete"
                              onClick={() => handleDelete(booking.id)}
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
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode === 'create' && '➕ Tạo Đặt Phòng Mới'}
                {modalMode === 'edit' && '✏️ Chỉnh Sửa Đặt Phòng'}
                {modalMode === 'view' && '👁️ Chi Tiết Đặt Phòng'}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            {modalMode === 'view' ? (
              /* View Mode - Display Only */
              <div className="modal-view">
                <div className="view-section">
                  <h3 className="view-section-title">📋 Thông Tin Cuộc Họp</h3>
                  <div className="view-grid">
                    <div className="view-item">
                      <label className="view-label">Tên Cuộc Họp</label>
                      <div className="view-value">{viewingBooking.ten_dat_phong}</div>
                    </div>
                    <div className="view-item">
                      <label className="view-label">Trạng Thái</label>
                      <div className="view-value">
                        <span className={`status-badge status-${viewingBooking.trang_thai}`}>
                          {viewingBooking.trang_thai_label || viewingBooking.trang_thai || 'N/A'}
                        </span>
                      </div>
                    </div>
                    {viewingBooking.phong_hop && (
                      <div className="view-item">
                        <label className="view-label">Phòng Họp</label>
                        <div className="view-value">
                          {viewingBooking.phong_hop.ten_phong_hop} - {viewingBooking.phong_hop.vi_tri}
                        </div>
                      </div>
                    )}
                    {viewingBooking.nhan_vien && (
                      <div className="view-item">
                        <label className="view-label">Nhân Viên</label>
                        <div className="view-value">
                          {viewingBooking.nhan_vien.ho_va_ten}
                          {viewingBooking.nhan_vien.email && ` (${viewingBooking.nhan_vien.email})`}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="view-section">
                  <h3 className="view-section-title">🕐 Thời Gian</h3>
                  <div className="view-grid">
                    <div className="view-item">
                      <label className="view-label">Thời Gian Bắt Đầu</label>
                      <div className="view-value">{formatDateTime(viewingBooking.thoi_gian_bat_dau)}</div>
                    </div>
                    <div className="view-item">
                      <label className="view-label">Thời Gian Kết Thúc</label>
                      <div className="view-value">{formatDateTime(viewingBooking.thoi_gian_ket_thuc)}</div>
                    </div>
                    {viewingBooking.thoi_gian_dat && (
                      <div className="view-item">
                        <label className="view-label">Thời Gian Đặt</label>
                        <div className="view-value">{viewingBooking.thoi_gian_dat} giờ</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="view-section">
                  <h3 className="view-section-title">📝 Mục Đích</h3>
                  <div className="view-description">
                    {viewingBooking.muc_dich || 'Không có mô tả'}
                  </div>
                </div>

                <div className="view-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    ❌ Đóng
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={() => handleEdit(viewingBooking)}
                  >
                    ✏️ Chỉnh Sửa
                  </button>
                </div>
              </div>
            ) : (
              /* Create/Edit Mode - Form */
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label htmlFor="ten_dat_phong">Tên Cuộc Họp *</label>
                  <input
                    type="text"
                    id="ten_dat_phong"
                    name="ten_dat_phong"
                    value={formData.ten_dat_phong}
                    onChange={handleInputChange}
                    placeholder="VD: Họp kế hoạch Q1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phong_hop_id">Phòng Họp *</label>
                  <select
                    id="phong_hop_id"
                    name="phong_hop_id"
                    value={formData.phong_hop_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">-- Chọn phòng họp --</option>
                    {phongHopList.map(ph => (
                      <option key={ph.id} value={ph.id}>
                        {ph.ten_phong_hop} - {ph.vi_tri}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="thoi_gian_bat_dau">Thời Gian Bắt Đầu *</label>
                    <input
                      type="datetime-local"
                      id="thoi_gian_bat_dau"
                      name="thoi_gian_bat_dau"
                      value={formData.thoi_gian_bat_dau}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="thoi_gian_ket_thuc">Thời Gian Kết Thúc *</label>
                    <input
                      type="datetime-local"
                      id="thoi_gian_ket_thuc"
                      name="thoi_gian_ket_thuc"
                      value={formData.thoi_gian_ket_thuc}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="muc_dich">Mục Đích *</label>
                  <textarea
                    id="muc_dich"
                    name="muc_dich"
                    value={formData.muc_dich}
                    onChange={handleInputChange}
                    placeholder="Mô tả mục đích cuộc họp..."
                    rows="4"
                    required
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
}

export default DatPhongManagement;
