import { useState } from "react";
import "./App.css";
import DatPhongManagement from "./components/DatPhongManagement";
import PhongHopManagement from "./components/PhongHopManagement";
import TaiSanManagement from "./components/TaiSanManagement";

function App() {
  const [activeTab, setActiveTab] = useState('dat-phong'); // 'dat-phong', 'phong-hop', hoặc 'tai-san'
  const DB_NAME = "admin1";

  return (
    <div className="app-container">
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'dat-phong' ? 'active' : ''}`}
          onClick={() => setActiveTab('dat-phong')}
        >
          📅 Quản Lý Đặt Phòng
        </button>
        <button 
          className={`tab-button ${activeTab === 'phong-hop' ? 'active' : ''}`}
          onClick={() => setActiveTab('phong-hop')}
        >
          🏢 Quản Lý Phòng Họp
        </button>
        <button 
          className={`tab-button ${activeTab === 'tai-san' ? 'active' : ''}`}
          onClick={() => setActiveTab('tai-san')}
        >
          💼 Quản Lý Tài Sản
        </button>
      </div>

      {/* Content */}
      {activeTab === 'phong-hop' ? (
        <PhongHopManagement dbname={DB_NAME} />
      ) : activeTab === 'tai-san' ? (
        <TaiSanManagement dbname={DB_NAME} />
      ) : (
        <DatPhongManagement dbname={DB_NAME} />
      )}
    </div>
  );
}

export default App;