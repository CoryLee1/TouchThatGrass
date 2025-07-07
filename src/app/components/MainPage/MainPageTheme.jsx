import "./Theme.css";

export default function MainPageTheme({ onStart, className = "", ...props }) {
  return (
    <div className={"theme " + className}>
      <div className="frame-427318908">
        <div className="heading">
          <img className="stroke" src="/img/stroke-4.png" alt="Stroke" />
          <div className="div">全球摸草计划</div>
          <div className="ai-chatbot">
            小红书AI CHATBOT自动规划
            <br />
            种草地图
          </div>
          <img className="location-emoji" src="/img/location-emoji-4.png" alt="Location" />
          <div className="touch-that-grass">TOUCH THAT GRASS！</div>
        </div>
      </div>
      <div className="button">
        <div className="btn-start" onClick={onStart} style={{ cursor: 'pointer', position: 'relative', zIndex: 30 }}>
          <div className="rectangle-18"></div>
          <div className="start">START</div>
        </div>
      </div>
    </div>
  );
} 