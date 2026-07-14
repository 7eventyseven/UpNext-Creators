"use client";

import { useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";

interface ImageUploadProps {
  label: string;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  onError: (message: string) => void;
  processFile: (file: File) => Promise<string>;
  hint?: string;
}

export function ImageUpload({
  label,
  value,
  onChange,
  onError,
  processFile,
  hint,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setLoading(true);
    try {
      const dataUrl = await processFile(file);
      onChange(dataUrl);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-olive-700">{label}</p>
      {value ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Upload preview"
            className="h-32 w-32 rounded-2xl object-cover border border-olive-200"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="flex h-32 w-full max-w-xs flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-olive-300 bg-olive-50/50 text-olive-600 hover:border-olive-500 hover:bg-olive-50 transition-colors"
        >
          {loading ? (
            <span className="text-sm">Uploading...</span>
          ) : (
            <>
              <ImageIcon size={28} className="text-olive-400" />
              <span className="text-sm font-medium">Click to upload photo</span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {hint && <p className="mt-1.5 text-xs text-olive-500">{hint}</p>}
    </div>
  );
}

interface VideoEntry {
  id: string;
  title: string;
  earnings: string;
  url: string | null;
  fileName?: string;
}

interface VideoUploadListProps {
  videos: VideoEntry[];
  onChange: (videos: VideoEntry[]) => void;
  onError: (message: string) => void;
  maxVideos: number;
  processFile: (file: File) => Promise<string>;
}

export function VideoUploadList({
  videos,
  onChange,
  onError,
  maxVideos,
  processFile,
}: VideoUploadListProps) {
  const addVideo = () => {
    if (videos.length >= maxVideos) return;
    onChange([
      ...videos,
      { id: `v-${Date.now()}`, title: "", earnings: "", url: null },
    ]);
  };

  const updateVideo = (id: string, patch: Partial<VideoEntry>) => {
    onChange(videos.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  };

  const removeVideo = (id: string) => {
    onChange(videos.filter((v) => v.id !== id));
  };

  const handleVideoFile = async (id: string, file: File | undefined) => {
    if (!file) return;
    try {
      const url = await processFile(file);
      updateVideo(id, { url, fileName: file.name });
    } catch (err) {
      onError(err instanceof Error ? err.message : "Video upload failed.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-olive-700">
          Top Grossing Videos <span className="text-olive-400">(up to {maxVideos})</span>
        </p>
        {videos.length < maxVideos && (
          <button
            type="button"
            onClick={addVideo}
            className="text-sm font-medium text-olive-600 hover:text-olive-800"
          >
            + Add video
          </button>
        )}
      </div>

      {videos.length === 0 && (
        <button
          type="button"
          onClick={addVideo}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-olive-300 py-8 text-sm font-medium text-olive-600 hover:border-olive-500 hover:bg-olive-50"
        >
          <Upload size={18} />
          Upload your highest grossing videos
        </button>
      )}

      {videos.map((video, i) => (
        <div
          key={video.id}
          className="rounded-xl border border-olive-200 bg-milky-50 p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-olive-700">Video {i + 1}</p>
            <button
              type="button"
              onClick={() => removeVideo(video.id)}
              className="text-red-500 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-olive-600">Title</label>
              <input
                value={video.title}
                onChange={(e) => updateVideo(video.id, { title: e.target.value })}
                placeholder="e.g. Wedding highlight reel"
                className="w-full rounded-lg border border-olive-200 px-3 py-2 text-sm text-olive-900 focus:border-olive-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-olive-600">
                Earnings (NGN)
              </label>
              <input
                type="number"
                value={video.earnings}
                onChange={(e) =>
                  updateVideo(video.id, { earnings: e.target.value })
                }
                placeholder="150000"
                min={0}
                className="w-full rounded-lg border border-olive-200 px-3 py-2 text-sm text-olive-900 focus:border-olive-500 focus:outline-none"
              />
            </div>
          </div>
          {video.url ? (
            <div className="space-y-2">
              <video
                src={video.url}
                controls
                className="w-full max-h-48 rounded-lg bg-black"
              />
              <p className="text-xs text-olive-500">{video.fileName}</p>
              <button
                type="button"
                onClick={() => updateVideo(video.id, { url: null, fileName: undefined })}
                className="text-xs text-red-500 hover:underline"
              >
                Remove video
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-olive-300 py-6 text-sm text-olive-600 hover:bg-olive-50">
              <Upload size={16} />
              Choose video file
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => handleVideoFile(video.id, e.target.files?.[0])}
              />
            </label>
          )}
        </div>
      ))}
    </div>
  );
}

export type { VideoEntry };
