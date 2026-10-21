import { InputPauseFlags } from '@box/schema/input/input-schema';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { InputPause, useInputPause } from 'src/views/components/input-lock';

interface EditableNumberProps {
  value: number;
  onChange: (value: number) => void;
  warningThreshold?: number;
  width?: string;
  min?: number; // Add min prop
  max?: number; // Add max prop
}

export const SizeNumber: React.FC<EditableNumberProps> = ({
  value,
  onChange,
  warningThreshold,
  width = '30px',
  min = 1, // Default min to 1
  max,
}) => {
  const inputPauseContext = useInputPause();
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString()); // Add inputValue state

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const applyChange = () => {
    const newValue = parseInt(inputValue, 10);
    let isValid = !isNaN(newValue);
    if (isValid && min !== undefined) {
      isValid = newValue >= min;
    }
    if (isValid && max !== undefined) {
      isValid = newValue <= max;
    }

    if (isValid) {
      onChange(newValue);
    } else {
      // Reset to original value if invalid
      setInputValue(value.toString());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applyChange();
    } else if (e.key === 'Escape') {
      setInputValue(value.toString()); // Reset on Escape
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    applyChange();
  };

  const toggleEdit = () => {
    if (!isEditing) {
      setInputValue(value.toString()); // Ensure input starts with current value
    }
    setIsEditing(!isEditing);
  };

  const showWarning =
    warningThreshold !== undefined && value > warningThreshold;

  return (
    <div
      onClick={!isEditing ? toggleEdit : undefined}
      style={{ cursor: isEditing ? 'default' : 'pointer' }}
    >
      {isEditing && (
        <InputPause
          flags={InputPauseFlags.ALL}
          change={inputPauseContext.inputPauseChange}
        />
      )}
      {isEditing ? (
        <input
          type="text"
          value={inputValue} // Use controlled input
          autoFocus
          onBlur={handleBlur} // Apply change on blur
          onKeyDown={handleKeyDown}
          onChange={handleInputChange} // Update inputValue
          style={{ width }}
        />
      ) : (
        <span style={showWarning ? { color: '#ff9900' } : undefined}>
          {value}x
        </span>
      )}
    </div>
  );
};
