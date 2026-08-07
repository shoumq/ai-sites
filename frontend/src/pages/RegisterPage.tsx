import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useLoginMutation, useRegisterMutation } from "../app/api";
import { useAppDispatch } from "../app/hooks";
import { CheckIcon } from "../components/icons";
import { setToken } from "../features/auth/authSlice";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [register, { isLoading, error }] = useRegisterMutation();
  const [login] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await register({ email, password }).unwrap();
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
        <h1>Регистрация</h1>
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
          <input
            className="input"
            type="password"
            required
            minLength={6}
            placeholder="Минимум 6 символов"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <div className="error-text">Не удалось зарегистрироваться. Возможно, email уже занят.</div>}
        <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
          {isLoading ? "Создаём аккаунт…" : "Зарегистрироваться"}
        </button>
        <div className="auth-switch">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </div>
      </form>
    </div>
  );
}
