"use client";
import React, { useState } from 'react';
import { HelpCircle, X, Keyboard } from 'lucide-react';

const HelpTooltip: React.FC = () => {
  const [showHelp, setShowHelp] = useState(false);

  const shortcuts = [
    { category: 'Tools', items: [
      { key: 'S', description: 'Select Tool' },
      { key: 'H', description: 'Pan Tool' },
      { key: 'R', description: 'Rectangle Tool' },
      { key: 'C', description: 'Circle Tool' },
      { key: 'L', description: 'Line/Wall Tool' },
      { key: 'D', description: 'Door Tool' },
      { key: 'W', description: 'Window Tool' },
      { key: 'O', description: 'Room Tool' },
      { key: 'T', description: 'Text Tool' },
      { key: 'F', description: 'Roof Tool' },
      { key: 'A', description: 'Auto Room Detection' },
      { key: 'M', description: 'Move Tool' },
    ]},
    { category: 'Actions', items: [
      { key: 'Ctrl+Z', description: 'Undo' },
      { key: 'Ctrl+Y', description: 'Redo' },
      { key: 'Ctrl+D', description: 'Duplicate' },
      { key: 'Ctrl+S', description: 'Save' },
      { key: 'Ctrl+O', description: 'Open' },
      { key: 'Delete', description: 'Delete Selected' },
      { key: 'Escape', description: 'Clear Selection' },
    ]},
    { category: 'View', items: [
      { key: 'G', description: 'Toggle Grid' },
      { key: 'Shift+G', description: 'Toggle Snap' },
      { key: 'Ctrl+G', description: 'Grid Settings' },
      { key: 'Ctrl+L', description: 'Toggle Layers' },
      { key: 'Ctrl+Shift+S', description: 'Toggle Shapes' },
      { key: 'Ctrl+B', description: 'Background Images' },
    ]},
  ];

  return (
    <>
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors z-40 flex items-center justify-center"
        title="Keyboard Shortcuts (F1)"
      >
        <Keyboard size={20} />
      </button>

      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900">Keyboard Shortcuts</h3>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {shortcuts.map((section) => (
                  <div key={section.category}>
                    <h4 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">
                      {section.category}
                    </h4>
                    <div className="space-y-2">
                      {section.items.map((item) => (
                        <div key={item.key} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{item.description}</span>
                          <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                            {item.key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Tips:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Hold Ctrl/Cmd while clicking to select multiple objects</li>
                  <li>• Drag to create area selection with the Select tool</li>
                  <li>• Right-click to finish room definition</li>
                  <li>• Use mouse wheel to zoom in/out</li>
                  <li>• Hold and drag to pan when using Pan tool</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end p-4 border-t border-gray-200">
              <button
                onClick={() => setShowHelp(false)}
                className="btn-primary"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpTooltip;