import React, { useEffect, useState } from "react";
import "./Quest.css";

const questText = "你好\n今天您出门摸草了吗";

export default function MainPageQuest({ onTypingEnd, className = "", ...props }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayed(questText.slice(0, i + 1));
      i++;
      if (i === questText.length) {
        clearInterval(timer);
        setTimeout(() => onTypingEnd && onTypingEnd(), 400);
      }
    }, 80);
    return () => clearInterval(timer);
  }, [onTypingEnd]);
  return (
    <div className={"quest " + className}>
      <div className="chat-quest">
        <img className="union" src="/img/union-4.png" alt="Union" />
        <div className="div" style={{ whiteSpace: "pre-line" }}>
          {displayed}
          <span className="blinking-cursor">|</span>
        </div>
        <img
          className="c-7-c-03-bbdacb-4-f-0-fb-132-ee-492-f-9-e-3-f-82-1"
          src="/img/c7c03bbdacb4f0fb132ee492f9e3f82-1-5.png"
          alt="装饰1"
        />
        <img
          className="_4-ef-78646-aca-4-df-3978-ebaf-697-ba-55-ac-1"
          src="/img/4ef78646aca4df3978ebaf697ba55ac-1-5.png"
          alt="装饰2"
        />
      </div>
      <style>{`
        .blinking-cursor {
          display: inline-block;
          width: 1ch;
          animation: blink 1s steps(1) infinite;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
} 