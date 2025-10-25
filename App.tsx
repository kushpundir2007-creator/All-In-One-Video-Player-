
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import FileSelector from './components/FileSelector';
import VideoPlayer from './components/VideoPlayer';
import VideoInfo from './components/VideoInfo';
import useTheme from './hooks/useTheme';
import type { VideoMetadata } from './types';

const App: React.FC = () => {
  const [theme, toggleTheme] = useTheme();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('video/')) {
      setIsLoading(true);
      setError(null);
      setVideoFile(file);
      setVideoMetadata({
        name: file.name,
        size: file.size,
        format: file.name.split('.').pop()?.toUpperCase() ?? 'N/A',
        duration: 0,
        resolution: '',
      });
    } else {
      setError('Unsupported file type. Please select a video file.');
    }
  }, []);

  const handleMetadataLoad = useCallback((metadata: Partial<VideoMetadata>) => {
    setVideoMetadata(prev => prev ? { ...prev, ...metadata } : null);
    setIsLoading(false);
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setVideoFile(null);
    setVideoMetadata(null);
    setIsLoading(false);
  }, []);
  
  const resetPlayer = useCallback(() => {
    setVideoFile(null);
    setVideoMetadata(null);
    setError(null);
    setIsLoading(false);
  }, []);


  return (
    <div className={`flex flex-col min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 flex-grow">
        <Header theme={theme} toggleTheme={toggleTheme} />
        <main className="flex flex-col items-center justify-center p-4 md:p-8 flex-grow">
          <div className="w-full max-w-6xl mx-auto">
            {videoFile ? (
              <div className="space-y-6">
                <VideoPlayer
                  file={videoFile}
                  onMetadataLoad={handleMetadataLoad}
                  onError={handleError}
                />
                {videoMetadata && <VideoInfo metadata={videoMetadata} />}
                 <div className="text-center">
                    <button
                        onClick={resetPlayer}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105"
                    >
                        Select Another Video
                    </button>
                </div>
              </div>
            ) : (
              <FileSelector onFileSelect={handleFileSelect} isLoading={isLoading} error={error} />
            )}
          </div>
        </main>
        <footer className="text-center p-4 text-gray-500 dark:text-gray-400 text-sm">
          © {new Date().getFullYear()} UniView Player | A local-first video player
        </footer>
      </div>
    </div>
  );
};

export default App;
