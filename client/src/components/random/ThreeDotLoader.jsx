const ThreeDotLoader = () => {
  return (
    <div className="flex items-center justify-center">
      <style>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .dot {
          animation: pulse 1.5s ease-in-out infinite;
        }
        .dot:nth-child(2) {
          animation-delay: 0.3s;
        }
        .dot:nth-child(3) {
          animation-delay: 0.6s;
        }
      `}</style>
      <div className="flex space-x-2">
        <div className="dot w-2 h-2 bg-green-500 rounded-full"></div>
        <div className="dot w-2 h-2 bg-green-500 rounded-full"></div>
        <div className="dot w-2 h-2 bg-green-500 rounded-full"></div>
      </div>
    </div>
  );
};

export default ThreeDotLoader;
