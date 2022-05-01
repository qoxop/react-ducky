import React, { useState, useMemo, useCallback } from "react";

import CheckboxSvg from "./checkbox.svg";
export const Checkbox:React.FC<{
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void
}> = ({checked, defaultChecked, onChange}) => {
  const [_checked, setChecked] = useState(defaultChecked);
  const realChecked = useMemo(() => checked ?? _checked, [checked, _checked]);
  const handleClick = useCallback(() => {
    setChecked((c) => {
      onChange && onChange(!c);
      return !c;
    }, );
  } , [setChecked, onChange]);
  if (realChecked) {
    return (
      <div className="w-4 h-4 my-1 rounded-sm" onClick={handleClick}>
        <img width={16} height={16} src={CheckboxSvg} alt="" />
      </div>
    )
  }
  return (
    <div className="w-4 h-4 my-1 border-2 rounded-sm" onClick={handleClick} />
  );
};