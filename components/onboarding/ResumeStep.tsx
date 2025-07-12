'use client';

import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { fadeInUp, staggerContainer } from '../animations/variants';

interface ResumeStepProps {
  onNext: (resumeUrl: string) => void;
  onBack: () => void;
}

export default function ResumeStep({ onNext, onBack }: ResumeStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.type)) {
      setUploadedFile(file);
    } else {
      alert('Please upload a PDF or Word document');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    try {
      // In a real application, you would upload to a storage service like AWS S3, Cloudinary, etc.
      // For now, we'll simulate an upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock URL - in production, this would be the actual uploaded file URL
      const mockResumeUrl = `https://example.com/resumes/${uploadedFile.name}`;
      onNext(mockResumeUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSkip = () => {
    onNext(''); // Skip with empty URL
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 p-8"
    >
      <div className="w-full max-w-2xl">
        <motion.div variants={fadeInUp} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Upload your resume 📄
          </h1>
          <p className="text-xl text-gray-600">
            Help us understand your experience better
          </p>
        </motion.div>

        <motion.div variants={fadeInUp} className="bg-white rounded-2xl shadow-xl p-8">
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
              isDragging
                ? 'border-purple-500 bg-purple-50'
                : uploadedFile
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            {uploadedFile ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="text-6xl">✅</div>
                <h3 className="text-xl font-semibold text-green-700">
                  File selected!
                </h3>
                <p className="text-green-600">{uploadedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Choose different file
                </button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div className="text-6xl">📁</div>
                <h3 className="text-xl font-semibold text-gray-700">
                  Drop your resume here
                </h3>
                <p className="text-gray-500">
                  or{' '}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    browse to upload
                  </button>
                </p>
                <p className="text-sm text-gray-400">
                  Supports PDF, DOC, DOCX (max 10MB)
                </p>
              </div>
            )}
          </div>

          <motion.div variants={fadeInUp} className="flex justify-between mt-8">
            <button
              onClick={onBack}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              ← Back
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Skip for now
              </button>
              <button
                onClick={handleUpload}
                disabled={!uploadedFile || isUploading}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  'Next →'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
