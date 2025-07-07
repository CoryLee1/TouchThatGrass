import "./Header.css";

export default function MainPageHeader({ className = "", ...props }) {
  return (
    <div className={"header " + className}>
      <div className="logo">
        <div className="logo-text">
          TOUCH
          <br />
          THAT
          <br />
          GRASS
        </div>
        <img className="vector-223" src="/img/vector-223-4.png" alt="Vector" />
        <img className="logo-icon" src="/img/logoicon-4.png" alt="Logo" />
      </div>
    </div>
  );
} 