import { CheckCircle2, ImageIcon, UploadIcon } from 'lucide-react';
import React, {useState} from 'react'
import { useOutletContext } from 'react-router';
import { PROGRESS_INCREMENT, PROGRESS_INTERVAL_MS, REDIRECT_DELAY_MS } from '../lib/constants';

interface UploadProps {
  onComplete?: (base64: string) => void;
}

const Upload = ({ onComplete }: UploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  const { isSignedIn } = useOutletContext<any>();

  const processFile = (selectedFile: File) => {
    if (!isSignedIn) return;
    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += PROGRESS_INCREMENT;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);
          setTimeout(() => {
            if (onComplete) {
              onComplete(base64String);
            }
          }, REDIRECT_DELAY_MS);
        }
        setProgress(currentProgress);
      }, PROGRESS_INTERVAL_MS);
    };
    reader.readAsDataURL(selectedFile);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isSignedIn) return;
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isSignedIn) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSignedIn) return;
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className='upload'>
      {!file ? (
        <div 
          className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <input 
            type='file'
            className='drop-input' 
            accept='.jpg,.jpeg,.png' 
            disabled={!isSignedIn}
            onChange={onChange}
          />
          <div className='drop-content'>
            <div className='drop-icon'>
              <UploadIcon size={20}/>
            </div>
            <p>
              {isSignedIn ? ('Click to upload or drage and drop') : ('Please sign in or sign up to upload' )}
            </p>
            <p className='help'>Maximum Size is 50MB</p>
          </div>
        </div>
      ) : (
        <div className='upload-status'>
          <div className='status-content'>
            <div className='status-icon'>
              {progress === 100 ? (
                <CheckCircle2 className='check'/>
              ) : (
                <ImageIcon className='image'/>
              )}
            </div>
            <h3>{file.name}</h3>

            <div className='progress'>
              <div className='bar' style={{width: `${progress}%`}}/>

              <p className='status-text'>
                {progress < 100 ? 'Uploading...' : 'Redirecting...'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Upload