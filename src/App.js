import axios from "axios";
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [phongHop, setPhongHop] = useState(null);
  const [phongHopList, setPhongHopList] = useState([]);
  const [selectedId, setSelectedId] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false); // Loading riêng cho detail

  // Fetch danh sách phòng một lần duy nhất
  useEffect(() => {
    const fetchList = async () => {
      try {
        const listRes = await axios.get("/api/list_phong_hop/admin1");
        const list = listRes.data.data;

        setPhongHopList(list);

        if (list.length > 0) {
          setSelectedId(list[0].id); // 👈 auto chọn phòng đầu tiên
        }
      } catch (err) {
        console.error(err);
        setError("Không lấy được danh sách phòng họp");
      }
    };


    fetchList();
  }, []);

  // Fetch chi tiết phòng khi selectedId thay đổi
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setDetailLoading(true);
        const detailRes = await axios.get(`/api/phong_hop/admin1/${selectedId}`);
        console.log("DETAIL:", detailRes.data);
        setPhongHop(detailRes.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Không lấy được thông tin phòng họp");
      } finally {
        setDetailLoading(false);
        setLoading(false); // Lần đầu tiên load xong
      }
    };

    if (selectedId) {
      fetchDetail();
    }
  }, [selectedId]);

  const handleSelectPhongHop = (id) => {
    setSelectedId(id);
  };

  if (error && loading) {
    return (
      <div className="error-container">
        <div className="error-box">{error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="main-layout">
        {/* Sidebar - Danh sách phòng họp */}
        <div className="sidebar">
          <h2 className="sidebar-title">📋 Danh sách phòng họp</h2>
          <div className="phong-hop-list">
            {phongHopList.map(ph => (
              <div
                key={ph.id}
                className={`phong-hop-list-item ${selectedId === ph.id ? 'active' : ''}`}
                onClick={() => handleSelectPhongHop(ph.id)}
              >
                <div className="list-item-name">{ph.ten_phong_hop}</div>
                <div className="list-item-info">
                  <span className="list-item-location">📍 {ph.vi_tri}</span>
                  <span className="list-item-capacity">👥 {ph.suc_chua}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content - Chi tiết phòng họp */}
        <div className="main-content">
          {detailLoading ? (
            <div className="phong-hop-card">
              <div className="detail-loading">
                <div className="spinner"></div>
                <p>Đang tải thông tin phòng...</p>
              </div>
            </div>
          ) : phongHop ? (
            <div className="phong-hop-card">
              {/* Header */}
              <div className="phong-hop-header">
                <h1 className="phong-hop-title">{phongHop.ten_phong_hop}</h1>
              </div>

              {/* Content */}
              <div className="phong-hop-content">
                {/* Thông tin cơ bản */}
                <div className="info-grid">
                  <div className="info-box">
                    <div className="info-label">📍 Vị trí</div>
                    <div className="info-value">{phongHop.vi_tri}</div>
                  </div>

                  <div className="info-box">
                    <div className="info-label">👥 Sức chứa</div>
                    <div className="info-value">{phongHop.suc_chua} người</div>
                  </div>
                </div>

                {/* Danh sách tài sản */}
                <div className="tai-san-section">
                  <h3 className="tai-san-title">🛠️ Tài sản phòng họp</h3>

                  {phongHop.tai_san_list && phongHop.tai_san_list.length > 0 ? (
                    <div className="tai-san-grid">
                      {phongHop.tai_san_list.map(ts => (
                        <div key={ts.id} className="tai-san-item">
                          ✓ {ts.ten_tai_san}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="tai-san-empty">Chưa có tài sản nào</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="phong-hop-card">
              <div className="detail-loading">
                <p>Không có thông tin phòng họp</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;