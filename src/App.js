import axios from "axios";
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [phongHopList, setPhongHopList] = useState([]);
  const [bookingList, setBookingList] = useState([]);
  const [selectedPhongHopId, setSelectedPhongHopId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // CRUD States
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', or 'view'
  const [editingBooking, setEditingBooking] = useState(null);
  const [viewingBooking, setViewingBooking] = useState(null);
  
  const [formData, setFormData] = useState({
    ten_dat_phong: "",
    phong_hop_id: "",
    nhan_vien_id: 3,
    thoi_gian_bat_dau: "",
    thoi_gian_ket_thuc: "",
    muc_dich: ""
  });
  const [formLoading, setFormLoading] = useState(false);

  // Fetch danh sách phòng họp
  useEffect(() => {
    fetchPhongHopList();
  }, []);

  // Fetch danh sách đặt phòng khi chọn phòng
  useEffect(() => {
    if (selectedPhongHopId) {
      fetchBookingList();
    }
  }, [selectedPhongHopId]);

  const fetchPhongHopList = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/list_phong_hop/admin1");
      const list = res.data.data;
      setPhongHopList(list);
      
      if (list.length > 0 && !selectedPhongHopId) {
        setSelectedPhongHopId(list[0].id);
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách phòng họp");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingList = async () => {
    try {
      // Giả sử API trả về danh sách đặt phòng theo phòng họp
      // Nếu không có API này, bạn cần tạo endpoint mới
      const res = await axios.get(`/api/dat_phong/phong/${selectedPhongHopId}`);
      setBookingList(res.data.data || []);
    } catch (err) {
      console.error(err);
      // Nếu API không tồn tại, set empty array
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
      phong_hop_id: booking.phong_hop_id,
      nhan_vien_id: booking.nhan_vien_id,
      thoi_gian_bat_dau: formatDateTimeLocal(booking.thoi_gian_bat_dau),
      thoi_gian_ket_thuc: formatDateTimeLocal(booking.thoi_gian_ket_thuc),
      muc_dich: booking.muc_dich
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
      await axios.delete(`/api/dat_phong/${bookingId}`);
      alert("✅ Xóa đặt phòng thành công");
      fetchBookingList();
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi xóa: " + (err.response?.data?.message || err.message));
    }
  };

  // SUBMIT FORM (Create hoặc Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.ten_dat_phong || !formData.thoi_gian_bat_dau || 
        !formData.thoi_gian_ket_thuc || !formData.muc_dich) {
      alert("⚠️ Vui lòng điền đầy đủ thông tin");
      return;
    }

    setFormLoading(true);

    try {
      if (modalMode === 'create') {
        // CREATE
        await axios.post("/api/dat_phong", formData);
        alert("✅ Tạo đặt phòng thành công");
      } else {
        // UPDATE
        await axios.put(`/api/dat_phong/${editingBooking.id}`, formData);
        alert("✅ Cập nhật đặt phòng thành công");
      }
      
      setShowModal(false);
      fetchBookingList();
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi: " + (err.response?.data?.message || err.message));
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
                {selectedPhongHopId && (
                  <span className="card-subtitle">
                    {phongHopList.find(p => p.id === selectedPhongHopId)?.ten_phong_hop}
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
                        <th>ID</th>
                        <th>Tên Cuộc Họp</th>
                        <th>Thời Gian Bắt Đầu</th>
                        <th>Thời Gian Kết Thúc</th>
                        <th>Mục Đích</th>
                        <th>Nhân Viên</th>
                        <th className="actions-col">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingList.map(booking => (
                        <tr key={booking.id}>
                          <td>{booking.id}</td>
                          <td className="booking-name">{booking.ten_dat_phong}</td>
                          <td>{formatDateTime(booking.thoi_gian_bat_dau)}</td>
                          <td>{formatDateTime(booking.thoi_gian_ket_thuc)}</td>
                          <td className="muc-dich">{booking.muc_dich}</td>
                          <td>{booking.nhan_vien_id}</td>
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
                      <label className="view-label">ID</label>
                      <div className="view-value">{viewingBooking.id}</div>
                    </div>
                    <div className="view-item">
                      <label className="view-label">Tên Cuộc Họp</label>
                      <div className="view-value">{viewingBooking.ten_dat_phong}</div>
                    </div>
                    <div className="view-item">
                      <label className="view-label">Phòng Họp</label>
                      <div className="view-value">
                        {phongHopList.find(p => p.id === viewingBooking.phong_hop_id)?.ten_phong_hop || 'N/A'}
                      </div>
                    </div>
                    <div className="view-item">
                      <label className="view-label">Nhân Viên ID</label>
                      <div className="view-value">{viewingBooking.nhan_vien_id}</div>
                    </div>
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
                  </div>
                </div>

                <div className="view-section">
                  <h3 className="view-section-title">📝 Mục Đích</h3>
                  <div className="view-description">
                    {viewingBooking.muc_dich}
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

export default App;