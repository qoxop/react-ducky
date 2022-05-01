import React from "react";
import LoadingSvg from "./loading.svg";

export const Loading: React.FC<{size?: number}> = ({ size = 40 }) => {
  return (
    <div className="h-full flex justify-center items-center">
      <div className="loading-animation"><img width={size} height={size} src={LoadingSvg} alt="" /></div>
    </div>
  );
};