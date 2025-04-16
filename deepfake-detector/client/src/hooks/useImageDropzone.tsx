import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

type UseImageDropzoneReturn = {
  file: File | undefined;
  fileRejectionItems: JSX.Element[];
  onRemove: () => void;
  getRootProps: () => any;
  getInputProps: () => any;
};

// Function to resize image to 256x256

// drawing canvas in cartesian plane 
// then trying to do it
// in this format (x-coordinate, y-coordinate)

//
const resizeImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      ctx.drawImage(img, 0, 0, 256, 256);

      canvas.toBlob((blob) => {
        if (blob) {
          const resizedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(resizedFile);
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, 'image/jpeg', 0.9);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};



export const useImageDropzone = (): UseImageDropzoneReturn => {
  const [file, setFile] = useState<File | undefined>();

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    try {
      const resizedFile = await resizeImage(acceptedFiles[0]);
      setFile(resizedFile);
    } catch (error) {
      console.error('Error resizing image:', error);
    }
  };

  const onRemove = () => {
    setFile(undefined);
  };

  const { fileRejections, getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
    },
    maxSize: 20 * 1024 * 1024, // Increased to 20MB to allow larger images before resizing
    maxFiles: 1,
    onDrop,
  });

  const fileRejectionItems = fileRejections.map(({ file, errors }) => (
    <ul key={file.name}>
      {errors.map((e) => (
        <li key={e.code}>{e.message}</li>
      ))}
    </ul>
  ));

  return {
    file,
    fileRejectionItems,
    onRemove,
    getRootProps,
    getInputProps,
  };
};



// kya hi kr skte hain 
// agr hum canvas ko plot kr denge 
