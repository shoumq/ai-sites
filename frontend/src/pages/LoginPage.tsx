import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useLoginMutation } from "../app/api";
import { useAppDispatch } from "../app/hooks";
import { CheckIcon } from "../components/icons";
import { setToken } from "../features/auth/authSlice";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setToken(result.access_token));
      navigate("/");
    } catch {
      // ошибка отображается через RTK Query `error` ниже
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Вход в AI-Конструктор</h1>
        <div className="field">
          <label className="label">Email</label>
          <div className="field-control-wrap">
            <input
              className={`input${EMAIL_RE.test(email) ? " valid" : ""}`}
              type="email"
              required
              placeholder="you@example.ru"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {EMAIL_RE.test(email) && (
              <span className="valid-check">
                <CheckIcon />
              </span>
            )}
          </div>
        </div>
        <div className="field">
          <label className="label">Пароль</label>
          <input className="input" type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <div className="error-text">Неверный email или пароль.</div>}
        <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
          {isLoading ? "Входим…" : "Войти"}
        </button>
        <div className="auth-switch">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </div>
      </form>
    </div>
  );
}
