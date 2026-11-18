import { useState, useEffect } from 'react';

function App() {
  const [message, setMessage] = useState('Đang kết nối tới Backend...');

  useEffect(() => {
    fetch('http://localhost:5000/api/test')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage('❌ Lỗi: Không gọi được API từ Backend!'));
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>MovieTickets - Kiểm tra hệ thống</h1>
      <p style={{ fontSize: '20px', color: 'green', fontWeight: 'bold' }}>{message}</p>
    </div>
  );
}

export default App;