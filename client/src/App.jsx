
import { useState, useEffect } from 'react';
import api from './api/axios';

function App() {
    const [message, setMessage] = useState('Đang kết nối tới Backend...');

    useEffect(() => {
        api.get('/')
            .then((response) => {
                setMessage(response.data.message);
            })
            .catch((error) => {
                console.error('Lỗi kết nối API:', error);
                setMessage('❌ Lỗi: Không gọi được API từ Backend!');
            });
    }, []);

    return (
        <div style={{
            padding: '40px',
            fontFamily: 'sans-serif',
            textAlign: 'center'
        }}>
            <h1>MovieTickets - Kiểm tra hệ thống</h1>

            <p style={{
                fontSize: '20px',
                color: 'green',
                fontWeight: 'bold'
            }}>
                {message}
            </p>
        </div>
    );
}

export default App;