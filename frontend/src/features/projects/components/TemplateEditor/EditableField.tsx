import { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';

interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  type?: 'text' | 'textarea' | 'date' | 'number';
  rows?: number;
  displayClassName?: string;
  min?: number;
  step?: number;
  onEditStart?: () => void;
  onEditEnd?: () => void;
}

export function EditableField({
  value,
  onChange,
  placeholder,
  className = '',
  type = 'text',
  rows = 3,
  displayClassName = '',
  min,
  step,
  onEditStart,
  onEditEnd,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement || inputRef.current instanceof HTMLTextAreaElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleStartEdit = () => {
    setIsEditing(true);
    onEditStart?.();
  };

  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
    onEditEnd?.();
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    onEditEnd?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && type !== 'textarea') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="relative">
        {type === 'textarea' ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            rows={rows}
            className={`w-full p-2 border border-[#F4C197] rounded-lg focus:outline-none focus:border-[#F15A24] bg-white ${className}`}
            placeholder={placeholder}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className={`w-full p-2 border border-[#F4C197] rounded-lg focus:outline-none focus:border-[#F15A24] bg-white ${className}`}
            placeholder={placeholder}
            min={min}
            step={step}
          />
        )}
      </div>
    );
  }

  return (
    <div
      onClick={handleStartEdit}
      className={`group cursor-pointer hover:bg-[#FFF7EA]/50 rounded-lg p-2 -m-2 transition-colors relative ${displayClassName}`}
    >
      {value || placeholder ? (
        <span className={value ? '' : 'text-[#C05A2B] italic'}>
          {value || placeholder}
        </span>
      ) : (
        <span className="text-[#C05A2B] italic">Click to edit</span>
      )}
      <Pencil className="w-3 h-3 text-[#C05A2B] opacity-0 group-hover:opacity-100 absolute top-1 right-1 transition-opacity" />
    </div>
  );
}

