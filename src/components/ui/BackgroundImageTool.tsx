"use client";
import React, { useState } from 'react';
import { Image, Upload, X, RotateCw, ZoomIn } from 'lucide-react';

interface BackgroundImage {
  id: string;
  src: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  rotation: number;
  locked: boolean;
}

interface BackgroundImageToolProps {
  backgroundImages: BackgroundImage[];
  onBackgroundImagesChange: (images: BackgroundImage[]) => void;
  onClose: () => void;
}

const BackgroundImageTool: React.FC<BackgroundImageToolProps> = ({
  backgroundImages,
  onBackgroundImagesChange,
  onClose
}) => {
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      
      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage: BackgroundImage = {
            id: `bg_${Date.now()}_${index}`,
            src: e.target?.result as string,
            name: file.name,
            x: 50 + (index * 20),
            y: 50 + (index * 20),
            width: 400,
            height: 300,
            opacity: 0.5,
            rotation: 0,
            locked: false
          };
          
          onBackgroundImagesChange([...backgroundImages, newImage]);
        };
        reader.readAsDataURL(file);
      });
    };
    input.click();
  };

  const updateImage = (id: string, updates: Partial<BackgroundImage>) => {
    onBackgroundImagesChange(
      backgroundImages.map(img => 
        img.id === id ? { ...img, ...updates } : img
      )
    );
  };

  const deleteImage = (id: string) => {
    onBackgroundImagesChange(backgroundImages.filter(img => img.id !== id));
    if (selectedImageId === id) {
      setSelectedImageId(null);
    }
  };

  const selectedImage = backgroundImages.find(img => img.id === selectedImageId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Image className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Background Images</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex h-96">
          {/* Image List */}
          <div className="w-1/3 border-r border-gray-200 p-4 overflow-y-auto">
            <button
              onClick={handleImageUpload}
              className="w-full mb-4 flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <Upload size={20} />
              <span>Upload Images</span>
            </button>

            <div className="space-y-2">
              {backgroundImages.map(image => (
                <div
                  key={image.id}
                  onClick={() => setSelectedImageId(image.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedImageId === image.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={image.src}
                      alt={image.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {image.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.round(image.width)} × {Math.round(image.height)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Opacity: {Math.round(image.opacity * 100)}%
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteImage(image.id);
                      }}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {backgroundImages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Image className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No background images</p>
                <p className="text-xs">Upload images to get started</p>
              </div>
            )}
          </div>

          {/* Properties Panel */}
          <div className="flex-1 p-4">
            {selectedImage ? (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Image Properties</h4>
                
                {/* Preview */}
                <div className="bg-gray-100 rounded-lg p-4">
                  <img
                    src={selectedImage.src}
                    alt={selectedImage.name}
                    className="max-w-full max-h-32 object-contain mx-auto rounded"
                    style={{ opacity: selectedImage.opacity }}
                  />
                </div>

                {/* Position */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      X Position
                    </label>
                    <input
                      type="number"
                      value={Math.round(selectedImage.x)}
                      onChange={(e) => updateImage(selectedImage.id, { x: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Y Position
                    </label>
                    <input
                      type="number"
                      value={Math.round(selectedImage.y)}
                      onChange={(e) => updateImage(selectedImage.id, { y: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Size */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Width
                    </label>
                    <input
                      type="number"
                      value={Math.round(selectedImage.width)}
                      onChange={(e) => updateImage(selectedImage.id, { width: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Height
                    </label>
                    <input
                      type="number"
                      value={Math.round(selectedImage.height)}
                      onChange={(e) => updateImage(selectedImage.id, { height: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="10"
                    />
                  </div>
                </div>

                {/* Opacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opacity: {Math.round(selectedImage.opacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={selectedImage.opacity}
                    onChange={(e) => updateImage(selectedImage.id, { opacity: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Rotation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rotation: {selectedImage.rotation}°
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={selectedImage.rotation}
                    onChange={(e) => updateImage(selectedImage.id, { rotation: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Lock */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="lock-image"
                    checked={selectedImage.locked}
                    onChange={(e) => updateImage(selectedImage.id, { locked: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="lock-image" className="text-sm text-gray-700">
                    Lock image (prevent accidental changes)
                  </label>
                </div>

                {/* Quick Actions */}
                <div className="flex space-x-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => updateImage(selectedImage.id, { rotation: (selectedImage.rotation + 90) % 360 })}
                    className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    <RotateCw size={16} />
                    <span>Rotate 90°</span>
                  </button>
                  <button
                    onClick={() => updateImage(selectedImage.id, { opacity: selectedImage.opacity === 1 ? 0.5 : 1 })}
                    className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    <ZoomIn size={16} />
                    <span>Toggle Opacity</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Image className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Select an image to edit</p>
                <p className="text-sm">Choose an image from the list to modify its properties</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center p-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {backgroundImages.length} background image{backgroundImages.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={onClose}
            className="btn-primary"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackgroundImageTool;