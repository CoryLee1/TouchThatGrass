import "./Background.css";

export default function MainPageBackground({ className = "", ...props }) {
  return (
    <div
      className={"background " + className}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="bg">
        <img className="vector-219" src="/img/vector-219-4.png" alt="Vector" />
        <img className="frame-1" src="/img/frame-1-4.png" alt="Frame" />
        <img className="image-4" src="/img/image-4-4.png" alt="Image" />
      </div>
    </div>
  );
} 