import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface MinutesSelectProps {
  value: number;
  onChange: (minutes: number) => void;
  className?: string;
}

const PRESET_MINUTES = [1, 3, 5, 10, 15, 20, 30];

const MinutesSelect = ({ value, onChange, className }: MinutesSelectProps) => {
  const isPreset = PRESET_MINUTES.includes(value);
  const [isCustom, setIsCustom] = useState(!isPreset);
  const [customValue, setCustomValue] = useState(value.toString());

  useEffect(() => {
    if (PRESET_MINUTES.includes(value)) {
      setIsCustom(false);
    }
  }, [value]);

  const handleSelectChange = (val: string) => {
    if (val === "custom") {
      setIsCustom(true);
      setCustomValue(value.toString());
    } else {
      setIsCustom(false);
      onChange(parseInt(val));
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    setCustomValue(inputVal);
    const num = parseInt(inputVal);
    if (!isNaN(num) && num >= 1) {
      onChange(num);
    }
  };

  const handleCustomBlur = () => {
    const num = parseInt(customValue);
    if (isNaN(num) || num < 1) {
      setCustomValue("1");
      onChange(1);
    }
  };

  if (isCustom) {
    return (
      <div className="flex items-center gap-1">
        <Input
          type="number"
          value={customValue}
          onChange={handleCustomChange}
          onBlur={handleCustomBlur}
          className={className || "w-16 h-8 text-center"}
          min={1}
          autoFocus
        />
        <button
          type="button"
          onClick={() => {
            const nearestPreset = PRESET_MINUTES.reduce((prev, curr) =>
              Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
            );
            setIsCustom(false);
            onChange(nearestPreset);
          }}
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >
          選択に戻る
        </button>
      </div>
    );
  }

  return (
    <Select
      value={isPreset ? value.toString() : "custom"}
      onValueChange={handleSelectChange}
    >
      <SelectTrigger className={className || "w-20 h-8"}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-popover">
        {PRESET_MINUTES.map((min) => (
          <SelectItem key={min} value={min.toString()}>
            {min}分
          </SelectItem>
        ))}
        <SelectItem value="custom">その他</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default MinutesSelect;
