import { useState } from "react";
import type { FormEvent } from "react";

import { useChatCommandMutation } from "../../app/api";
import type { SiteSchema } from "../../types/site";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  failed?: boolean;
  applied?: boolean;
}

// Вкладка «ИИ-Чат» (ТЗ п.4): команды правят JSON без перегенерации сайта.
export default function ChatPanel({ projectId, onApplied }: { projectId: string; onApplied: (site: SiteSchema) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sendCommand, { isLoading }] = useChatCommandMutation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");

    try {
      const result = await sendCommand({ projectId, message: text }).unwrap();
      setMessages((prev) => [...prev, { role: "assistant", text: result.reply, failed: !result.applied, applied: result.applied }]);
      if (result.applied) onApplied(result.site_data);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Не удалось выполнить команду. Попробуйте ещё раз.", failed: true }]);
    }
  };

  return (
    <div className="chat-tab">
      <p className="chat-examples">
        Опишите любую правку своими словами — например: «Сделай шапку липкой», «Поменяй местами блоки Отзывы и
        Цены», «Добавь блок с отзывами перед ценами», «Сделай акцентный цвет бирюзовым».
      </p>
      <div className="chat-log">
        {messages.length === 0 && (
          <div className="chat-empty">
            <span className="chat-empty-icon">💬</span>
            Понимаю свободные формулировки — переставить, добавить, удалить блок, поменять текст, цвет, вариант
            оформления. Просто опишите, что нужно.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role}${m.failed ? " failed" : ""}${m.applied ? " applied" : ""}`}>
            {m.text}
          </div>
        ))}
      </div>
      <form className="chat-input-row" onSubmit={handleSubmit}>
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Например: «Сделай шапку липкой»…"
          disabled={isLoading}
        />
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? "…" : "Отправить"}
        </button>
      </form>
    </div>
  );
}
