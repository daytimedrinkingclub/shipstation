import { useState } from "react";

const Dice = ({ animationType = "in-place", onRoll = () => {} }) => {
  const [rolling, setRolling] = useState(false);
  const [number, setNumber] = useState(Math.floor(Math.random() * 6) + 1);

  const getDots = (num) => {
    const dots = [];
    for (let i = 0; i < num; i++) {
      dots.push(<span key={i} className="dot"></span>);
    }
    return dots;
  };

  const rollDice = () => {
    if (!rolling) {
      setRolling(true);
      const newNumber = Math.floor(Math.random() * 6) + 1;
      setTimeout(() => {
        setNumber(newNumber);
        setRolling(false);
        onRoll();
      }, 2000);
    }
  };

  const containerClassName = `dice-container ${
    rolling ? (animationType === "chaotic" ? "jumping" : "") : ""
  }`;

  return (
    <div className={containerClassName} onClick={rollDice}>
      <div className={`dice ${rolling ? "rolling" : ""}`}>
        <div className={`face front face-${number}`}>{getDots(number)}</div>
        <div className="face back face-6">{getDots(6)}</div>
        <div className="face right face-4">{getDots(4)}</div>
        <div className="face left face-3">{getDots(3)}</div>
        <div className="face top face-2">{getDots(2)}</div>
        <div className="face bottom face-5">{getDots(5)}</div>
      </div>
    </div>
  );
};

export default Dice;
