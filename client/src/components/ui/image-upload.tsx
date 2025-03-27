"use client";

import { UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./button";

interface ImageUploadProps {
  value: string;
  onChange: (file: File) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [preview, setPreview] = useState(value);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        onChange(file);
        setPreview(URL.createObjectURL(file));
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 1,
    disabled,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null as any);
    setPreview("");
  };

  return (
    <div
      {...getRootProps()}
      className={`
        relative
        border-2
        border-dashed
        rounded-lg
        p-4
        h-64
        cursor-pointer
        transition
        ${isDragActive ? "border-primary" : "border-neutral-200"}
        ${disabled ? "opacity-50 cursor-default" : "hover:border-primary"}
      `}
    >
      <input {...getInputProps()} />

      {preview ? (
        <div className="h-full w-full relative">
          <Image
            src={preview}
            alt="Upload preview"
            className="object-cover rounded-lg"
            fill
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-neutral-500">
          <UploadCloud className="h-10 w-10" />
          <div className="text-center">
            <p className="font-medium">
              {isDragActive ? "Drop the image here" : "Drag & drop image here"}
            </p>
            <p className="text-xs">or click to select</p>
          </div>
          <p className="text-xs text-neutral-400">
            Supported formats: PNG, JPG, JPEG, WEBP
          </p>
        </div>
      )}
    </div>
  );
}
