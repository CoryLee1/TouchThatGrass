import React, { useState } from "react";
import ChatBox from "../ChatBox";
import "./style.css";
import MainPageHeader from './MainPageHeader';
import MainPageQuest from './MainPageQuest';
import MainPageTheme from './MainPageTheme';
import MainPageBackground from './MainPageBackground';
import DoodleCanvas from './DoodleCanvas';

export const MainPage = ({ onStart }) => {
  const [started, setStarted] = useState(false);
  const [showRest, setShowRest] = useState(false);

  if (started) return <ChatBox />;
  return (
    <div className="h-[100dvh] flex flex-col items-center bg-gray-100">
      <div
        className="w-full max-w-md h-[100dvh] bg-white mx-auto flex flex-col relative"
        style={{
          backgroundImage: "url('/img/paper-texture-4.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <DoodleCanvas />
        <div className="shrink-0">
          <MainPageHeader className={showRest ? "fade-in" : "fade-in fade-in-hide"} />
          <MainPageQuest onTypingEnd={() => setShowRest(true)} />
          <MainPageTheme onStart={onStart} className={showRest ? "fade-in" : "fade-in fade-in-hide"} />
        </div>
        <div className="flex-1 flex flex-col justify-end">
          <MainPageBackground />
        </div>
      </div>
      <style>{`
        .fade-in {
          transition: opacity 0.8s cubic-bezier(0.4,0,0.2,1);
        }
        .fade-in-hide {
          opacity: 0;
          pointer-events: none;
        }
        .fade-in:not(.fade-in-hide) {
          opacity: 1;
          pointer-events: auto;
        }
      `}</style>
    </div>
  );
};
