
import React from 'react';
import type { VideoMetadata } from '../types';

interface VideoInfoProps {
  metadata: VideoMetadata;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDuration = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return "00:00:00";
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};


const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex flex-col">
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        <span className="text-lg font-medium text-gray-800 dark:text-gray-200 truncate">{value}</span>
    </div>
);


const VideoInfo: React.FC<VideoInfoProps> = ({ metadata }) => {
  return (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-lg">
      <h3 className="text-2xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 text-gray-900 dark:text-white">
        Video Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
            <InfoItem label="File Name" value={metadata.name} />
        </div>
        <InfoItem label="Duration" value={formatDuration(metadata.duration)} />
        <InfoItem label="Resolution" value={metadata.resolution || 'N/A'} />
        <InfoItem label="File Size" value={formatFileSize(metadata.size)} />
      </div>
    </div>
  );
};

export default VideoInfo;
