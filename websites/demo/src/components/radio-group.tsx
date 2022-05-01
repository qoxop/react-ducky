import React, { useCallback, useState, useMemo } from "react";


export const RadioGroup: React.FC<{
  value?: string;
  defaultValue?: string;
  options: { label: string; value: string }[];
  onChange?: (value: string) => void;
}> = ({ options, value, defaultValue, onChange  }) => {
  const [_value, setValue] = useState(defaultValue);
  const realValue = useMemo(() => value ?? _value, [value, _value]);
  const handleClick = useCallback((v) => {
    setValue(v);
    onChange && onChange(v);
  }, [setValue, onChange]);
  return (
    <div className="flex flex-row flex-wrap justify-start">
      <div className="flex flex-row" style={{borderRightWidth: 1}}>
        {options.map(option => (
          <div
            key={option.value}
            style={{borderWidth: 1, borderRightWidth: realValue === option.value ? 1 : 0 }}
            className={`py-1 px-2 cursor-pointer ${realValue === option.value ? 'text-primary border-primary' : ''}`}
            onClick={() => handleClick(option.value)}
          >
            <span>{option.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};