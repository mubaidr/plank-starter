"use client";
import React, { useState, useRef, useEffect } from 'react';

interface TextToolProps {
  x: number;
  y: number;
  onTextComplete: (text: string, fontSize: number, fontFamily: string) => void;
  onCancel: () => void;
}

const TextTool: React.FC<TextToolProps> = ({ x, y, onTextComplete, onCancel }) => {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Arial');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = () => {
    if (text.trim()) {
      onTextComplete(text.trim(), fontSize, fontFamily);
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div
      className="absolute bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50"
      style={{ left: x, top: y }}
    >
      <div className="space-y-2">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter text..."
          className="w-48 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <div className="flex space-x-2">
          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded text-xs"
          >
            <option value={12}>12px</option>
            <option value={14}>14px</option>
            <option value={16}>16px</option>
            <option value={18}>18px</option>
            <option value={20}>20px</option>
            <option value={24}>24px</option>
          </select>
          
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-xs"
          >
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Georgia">Georgia</option>
          </select>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleSubmit}
            className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
          >
            Add
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextTool;