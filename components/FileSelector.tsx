
import React, { useRef, useState, useCallback } from 'react';
import { UploadIcon, LoaderIcon } from './icons/Icons';

interface FileSelectorProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

const FileSelector: React.FC<FileSelectorProps> = ({ onFileSelect, isLoading, error }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onFileSelect(event.target.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);


  return (
    <div 
        className={`relative flex flex-col items-center justify-center text-center p-10 md:p-20 border-4 border-dashed rounded-2xl transition-all duration-300 ease-in-out
            ${isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
    >
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="video/*"
        />
        <div className="space-y-4">
            <UploadIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500"/>
            <h2 className="text-2xl font-semibold">Drag & Drop or Select a Video File</h2>
            <p className="text-gray-500 dark:text-gray-400">Your video stays on your device. No uploads, ever.</p>
            <button
                onClick={handleClick}
                disabled={isLoading}
                className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <LoaderIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                        Loading...
                    </>
                ) : (
                    'Select Video File'
                )}
            </button>
            {error && <p className="mt-4 text-red-500 dark:text-red-400">{error}</p>}
        </div>
    </div>
  );
};

export default FileSelector;
