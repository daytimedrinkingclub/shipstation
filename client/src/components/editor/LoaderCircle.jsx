import { Loader } from "lucide-react";

const LoaderCircle = () => {
  return (
    <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
      <Loader className="animate-spin text-black" size={48} />
    </div>
  );
};

export default LoaderCircle;
