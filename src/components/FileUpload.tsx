import { useState, useCallback } from 'react';
import { FileUploadProps } from '../types';

const FileUpload = ({ onFileUpload, isAnalyzing }: FileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = (files: File[]): string | null => {
    if (files.length === 0) {
      return 'Please select at least one file';
    }

    const allowedTypes = ['.js', '.json', '.map'];
    const invalidFiles = files.filter((file) => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return !allowedTypes.includes(extension);
    });

    if (invalidFiles.length > 0) {
      return `Invalid file type(s): ${invalidFiles
        .map((f) => f.name)
        .join(', ')}. Only .js, .json, and .map files are supported.`;
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (totalSize > maxSize) {
      return 'Total file size exceeds 50MB limit';
    }

    return null;
  };

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validationError = validateFiles(fileArray);

    if (validationError) {
      setError(validationError);
      setSelectedFiles([]);
      return;
    }

    setError(null);
    setSelectedFiles(fileArray);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) return;

    try {
      await onFileUpload(selectedFiles);
    } catch (error) {
      setError('Failed to process files. Please try again.');
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='text-center mb-8'>
        <h2 className='text-3xl font-bold text-white mb-4'>
          Analyze Your Bundle
        </h2>
        <p className='text-gray-400 text-lg max-w-2xl mx-auto'>
          Upload your JavaScript source maps, bundle files, or webpack bundle
          analyzer JSON files to get detailed insights and optimization
          recommendations.
        </p>
      </div>

      <div className='card mb-6'>
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors duration-200 ${
            isDragOver
              ? 'border-accent bg-accent/10'
              : 'border-gray-600 hover:border-gray-500'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className='w-16 h-16 mx-auto mb-4 text-gray-400'>
            <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
              />
            </svg>
          </div>

          <h3 className='text-xl font-semibold text-white mb-2'>
            Drop your bundle files here
          </h3>
          <p className='text-gray-400 mb-6'>or click to browse files</p>

          <input
            type='file'
            multiple
            accept='.js,.json,.map'
            onChange={(e) => handleFileSelect(e.target.files)}
            className='hidden'
            id='file-input'
          />
          <label
            htmlFor='file-input'
            className='btn-primary cursor-pointer inline-block'
          >
            Choose Files
          </label>

          <div className='mt-4 text-sm text-gray-500'>
            Supports: .js, .json, .map files (max 50MB total)
          </div>
        </div>
      </div>

      {error && (
        <div className='card mb-6 border-red-500/50 bg-red-500/10'>
          <div className='flex items-center space-x-3'>
            <svg
              className='w-5 h-5 text-red-400'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                clipRule='evenodd'
              />
            </svg>
            <span className='text-red-400'>{error}</span>
          </div>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className='card mb-6'>
          <h3 className='text-lg font-semibold text-white mb-4'>
            Selected Files ({selectedFiles.length})
          </h3>

          <div className='space-y-3 mb-6'>
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className='flex items-center justify-between p-3 bg-gray-800/50 rounded-lg'
              >
                <div className='flex items-center space-x-3'>
                  <svg
                    className='w-5 h-5 text-accent'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <div>
                    <div className='text-white font-medium'>{file.name}</div>
                    <div className='text-gray-400 text-sm'>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeFile(index)}
                  className='text-gray-400 hover:text-red-400 transition-colors duration-200'
                >
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isAnalyzing}
            className='btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isAnalyzing ? (
              <div className='flex items-center justify-center space-x-2'>
                <div className='w-4 h-4 border-2 border-dark-bg border-t-transparent rounded-full animate-spin'></div>
                <span>Analyzing...</span>
              </div>
            ) : (
              'Analyze Bundle'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
