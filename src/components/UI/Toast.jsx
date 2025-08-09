// src/components/UI/Toast.jsx
import { memo } from 'react'
import './Toast.css';

const Toast = memo(({ message }) => (
  <div className={`toast ${message ? 'visible' : ''}`}>{message}</div>
));

export default Toast;