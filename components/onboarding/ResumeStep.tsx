'use client';

import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { fadeInUp, staggerContainer } from '../animations/variants';
import axios from 'axios';

interface ResumeStepProps {
  onNext: (resumeUrl: string, extractedSkills?: string[]) => void;
  onBack: () => void;
}

export default function ResumeStep({ onNext, onBack }: ResumeStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
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

  // Extract text from different file types
  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === 'application/pdf') {
      // For PDF files, you'll need a PDF parsing library like pdf-parse or pdf2pic
      // For now, return a placeholder
      return 'PDF text extraction requires additional libraries like pdf-parse';
    } else if (file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // For Word documents, you'll need mammoth.js or similar
      return 'Word document text extraction requires libraries like mammoth.js';
    } else {
      // For plain text files
      return await file.text();
    }
  };

  async function extractSkillsWithGroq(file: File): Promise<string[]> {
    try {
      const text = await extractTextFromFile(file);
      
      const groqApiUrl = 'https://api.groq.com/openai/v1/chat/completions';
      const groqApiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;

      if (!groqApiKey) {
        throw new Error('GROQ API key not found');
      }

      const systemPrompt = `You are a resume parser. Extract only the technical skills, programming languages, tools, and technologies from the following resume text. Return them as a JSON array of strings. Focus on concrete skills like programming languages, frameworks, tools, certifications, etc. Do not include soft skills or general descriptions.

      Example response format:
      ["JavaScript", "React", "Node.js", "Python", "AWS", "Docker", "Git"]`;

      const response = await axios.post(
        groqApiUrl,
        {
          model: 'meta-llama/llama-4-maverick-17b-128e-instruct', // Use a text generation model, not whisper
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
          ],
          temperature: 0.2,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Parse skills from the model's response
      const content = response.data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from API');
      }

      try {
        // Try to parse as JSON first
        const skills = JSON.parse(content);
        return Array.isArray(skills) ? skills : [];
      } catch {
        // If JSON parsing fails, try to extract array-like content
        const arrayMatch = content.match(/\[([^\]]+)\]/);
        if (arrayMatch) {
          const skillsString = arrayMatch[1];
          const skills = skillsString.split(',').map((skill: string) => skill.trim().replace(/["']/g, ''));
          return skills;
        }
        return [];
      }
    } catch (error) {
      console.error('Error extracting skills:', error);
      return [];
    }
  }

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    try {
      // Extract skills using Groq API
      const skills = await extractSkillsWithGroq(uploadedFile);
      setExtractedSkills(skills);

      // Simulate upload - in real app, upload to your server/cloud storage
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockResumeUrl = `https://example.com/resumes/${uploadedFile.name}`;
      onNext(mockResumeUrl, skills); // Pass extracted skills
    } catch (error) {
      console.error('Upload or skill extraction failed:', error);
      alert('Upload or skill extraction failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSkip = () => {
    onNext('', []); // Skip with empty URL and no skills
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen flex items-center justify-center bg-surface-primary p-8"
    >
      <div className="w-full max-w-2xl">
        {/* Warning Message */}
        <motion.div 
          variants={fadeInUp} 
          className="mb-6 text-center"
        >
          <div className="inline-flex items-center px-4 py-2 bg-orange-100 border border-orange-300 rounded-lg text-orange-700 text-sm">
            Don't add something you don't know you will be banned
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Upload your resume
          </h1>
        </motion.div>

        <motion.div variants={fadeInUp} className="bg-white rounded-2xl shadow-xl p-8">
          <div
            className={`border-2 border-dashed rounded-xl p-16 text-center transition-all duration-200 ${
              isDragging
                ? 'border-[#ff88b0] bg-[#fff0f5]'
              : uploadedFile
                ? 'border-[#22c55e] bg-[#f0fdf4]'
                : 'border-[#e5e7eb] hover:border-[#d1d5db]'
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
                className="space-y-6"
              >
                <div className="bg-gray-100 rounded-lg px-4 py-2 inline-flex items-center">
                  <span className="text-gray-700 font-medium">{uploadedFile.name}</span>
                  <button 
                    onClick={() => setUploadedFile(null)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-8 py-3 bg-[#ff88b0] text-white rounded-lg hover:bg-[#ff6ba0] transition-colors font-medium"
                  >
                    Select another Files
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <p className="text-gray-500 text-lg">
                  Drag and Drop or upload
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-3 bg-[#ff88b0] text-white rounded-lg hover:bg-[#ff6ba0] transition-colors font-medium"
                >
                  Select from Files
                </button>
              </div>
            )}
          </div>

          {extractedSkills.length > 0 && (
            <motion.div 
              variants={fadeInUp} 
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h4 className="text-lg font-semibold text-[#ff88b0] mb-3">
                Extracted Skills:
              </h4>
              <div className="flex flex-wrap gap-2">
                {extractedSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[#ff88b0] text-white rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div variants={fadeInUp} className="flex justify-center mt-8">
            <button
              onClick={handleUpload}
              disabled={!uploadedFile || isUploading}
              className="px-12 py-3 bg-[#ff88b0] text-white rounded-lg hover:bg-[#ff6ba0] disabled:bg-[#d1d5db] disabled:cursor-not-allowed transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                'Next'
              )}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}