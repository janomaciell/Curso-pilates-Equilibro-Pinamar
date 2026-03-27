import { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import './AuthForms.css';

const LoginForm = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {error && (
        <div className="error-alert">{error}</div>
      )}

      <Input
        type="email"
        label="Email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="tu@email.com"
        required
      />

      <Input
        type="password"
        label="Contraseña"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="••••••••"
        required
      />

      <Button type="submit" fullWidth disabled={loading}>
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </Button>
    </form>
  );
};

export default LoginForm;