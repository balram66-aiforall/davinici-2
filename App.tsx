import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateProfessionalHeadshot } from './services/geminiService';
import { fileToDataUrl, parseDataUrl } from './utils/fileUtils';
import { PlusIcon, MagicWandIcon, StylesIcon, CloseIcon, EditIcon, DownloadIcon, GoogleIcon } from './components/icons';
import Spinner from './components/Spinner';
import { styles, PhotoStyle } from './styles';

// This is required for the `window.aistudio` property.
// FIX: The original declaration caused a conflict with a global `AIStudio` type.
// This updated declaration defines the `AIStudio` interface and applies it to `window.aistudio`
// to resolve the type mismatch error.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    // FIX: Made `aistudio` optional to resolve "All declarations of 'aistudio' must have identical modifiers" error.
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [activeStyle, setActiveStyle] = useState<PhotoStyle>(styles[0]);
  const [prompt, setPrompt] = useState<string>(styles[0].prompt);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ mimeType: string; base64Data: string } | null>(null);
  const [isStylePanelOpen, setIsStylePanelOpen] = useState(false);
  const [isPromptEditorOpen, setIsPromptEditorOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCheckingKey, setIsCheckingKey] = useState<boolean>(true);
  const [isKeyReady, setIsKeyReady] = useState<boolean>(false);

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        // If running in AI Studio, use its authentication check.
        if (window.aistudio) {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setIsKeyReady(!!hasKey);
        } else {
          // If running on Vercel/Standalone, assume the API key is provided via env vars.
          // This bypasses the specific AI Studio sign-in screen.
          setIsKeyReady(true);
        }
      } catch (e) {
        console.error("Error checking for API key:", e);
        // On error (or standalone), allow access to the app so user can try to generate.
        setIsKeyReady(true);
      } finally {
        setIsCheckingKey(false);
      }
    };
    checkApiKey();
  }, []);

  const handleSignIn = async () => {
    // This function is only relevant if window.aistudio exists.
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // Assume success and update UI immediately to avoid race conditions.
        setIsKeyReady(true);
      } catch (e) {
        console.error("Failed to open select key dialog", e);
        setError("Could not open the sign-in dialog. Please try again.");
      }
    }
  };


  const handleImageChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const supportedMimeTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'];
      if (!supportedMimeTypes.includes(file.type)) {
        setError(`Unsupported file type. Please upload a PNG, JPEG, WEBP, HEIC, or HEIF file.`);
        return;
      }

      try {
        setError(null);
        setGeneratedImage(null);
        const dataUrl = await fileToDataUrl(file);
        setImage(dataUrl);
        const { mimeType, base64Data } = parseDataUrl(dataUrl);
        setFileInfo({ mimeType, base64Data });
      } catch (err) {
        setError('Failed to read the image file. Please try another one.');
        console.error(err);
      }
    }
  }, []);

  const handleGenerate = async () => {
    if (!fileInfo || !prompt) {
      setError('Please upload an image and select a style.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    try {
      const result = await generateProfessionalHeadshot(fileInfo.base64Data, fileInfo.mimeType, prompt);
      setGeneratedImage(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
       if (errorMessage.includes('Requested entity was not found')) {
            setError('Your session has expired or the API key is invalid. Please sign in again.');
            // Only force re-auth if in AI Studio environment
            if (window.aistudio) {
                setIsKeyReady(false); 
            }
        } else {
            setError(`Generation failed: ${errorMessage}`);
        }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectStyle = (style: PhotoStyle) => {
    setActiveStyle(style);
    setPrompt(style.prompt);
    setIsStylePanelOpen(false);
  };
  
  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'davinci-canvas-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isCheckingKey) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isKeyReady) {
    return (
       <div className="min-h-screen bg-black text-gray-100 font-sans flex flex-col items-center justify-center p-4 text-center">
         <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl opacity-50"></div>
        
        <header className="z-10">
            <p className="text-lg text-white/70 mb-1">AI FOR ALL</p>
            <h1 className="text-4xl sm:text-5xl font-bold">
            Da Vinci Canvas
            </h1>
        </header>

        <main className="z-10 mt-8">
            <p className="max-w-md mx-auto text-white/70 mb-8">
                To get started, please sign in with your Google account. This allows the app to use the Gemini API securely on your behalf.
            </p>
             <button
              onClick={handleSignIn}
              className="flex items-center justify-center gap-3 bg-white text-black font-semibold py-3 px-8 rounded-full transition-transform hover:scale-105"
            >
              <GoogleIcon className="w-6 h-6" />
              Sign In with Google
            </button>
             {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mt-8 max-w-md text-center" role="alert">
                    {error}
                </div>
            )}
        </main>
       </div>
    );
  }

  const currentImage = generatedImage || image;

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans flex flex-col justify-between overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl opacity-50"></div>
      
      <input id="file-upload" ref={fileInputRef} type="file" className="hidden" accept="image/png, image/jpeg, image/webp, image/heic, image/heif" onChange={handleImageChange} />

      <header className="text-center p-6 z-10">
        <p className="text-lg text-white/70 mb-1">AI FOR ALL</p>
        <h1 className="text-4xl sm:text-5xl font-bold">
          Da Vinci Canvas
        </h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 z-10">
        {!image ? (
          <div className="w-full max-w-md flex flex-col items-center">
            <label htmlFor="file-upload" className="w-48 h-48 sm:w-64 sm:h-64 bg-white/5 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/10 hover:border-white/40 transition-all duration-300">
              <PlusIcon className="w-16 h-16 text-white/40" />
            </label>
             <p className="text-white/60 mt-6">Upload a photo to start</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative w-[280px] h-[360px] sm:w-[320px] sm:h-[420px]">
              {isLoading && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20 rounded-3xl">
                  <Spinner />
                  <p className="text-gray-300 mt-4 text-lg">Generating...</p>
                </div>
              )}
              {currentImage && <img src={currentImage} alt="User photo" className="object-cover w-full h-full rounded-3xl shadow-2xl" />}
              {/* Face Frame */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-white/80 rounded-tl-2xl"></div>
                <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-white/80 rounded-tr-2xl"></div>
                <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-white/80 rounded-bl-2xl"></div>
                <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-white/80 rounded-br-2xl"></div>
              </div>
            </div>
            <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 text-indigo-400 hover:text-indigo-300 transition-colors font-semibold"
            >
                Change Photo
            </button>
          </div>
        )}
        {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mt-4 max-w-md text-center" role="alert">
                {error}
            </div>
        )}
      </main>

      <footer className="w-full p-4 z-20">
        <div className="max-w-md mx-auto">
          {image && (
             <div className="flex justify-center items-center gap-2 mb-4">
               <button
                  onClick={() => setIsPromptEditorOpen(true)}
                  className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 hover:bg-white/20 transition-colors"
                >
                  Editing Style: <strong>{activeStyle.name}</strong>
                  <EditIcon className="w-4 h-4"/>
                </button>
                {generatedImage && (
                  <button
                    onClick={handleDownload}
                    className="bg-white/10 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/20 transition-colors"
                    aria-label="Download generated image"
                  >
                    <DownloadIcon className="w-5 h-5"/>
                  </button>
                )}
            </div>
          )}

          <div className="flex justify-center mb-4">
            <button
              onClick={handleGenerate}
              disabled={isLoading || !image}
              className="w-full max-w-xs flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-full transition-all text-lg"
            >
              <MagicWandIcon className="w-6 h-6 mr-2" />
              {isLoading ? 'Generating...' : 'Generate photo'}
            </button>
          </div>

          <nav className="bg-black/30 backdrop-blur-md rounded-full p-2 flex justify-center items-center">
            <button onClick={() => setIsStylePanelOpen(true)} className="text-white flex flex-col items-center gap-1 px-3 py-1 rounded-full">
                <StylesIcon className="w-6 h-6"/>
                <span className="text-xs">Styles</span>
            </button>
          </nav>
        </div>
      </footer>
      
      {/* Style Panel */}
      <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300 ${isStylePanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsStylePanelOpen(false)}>
        <div className={`absolute bottom-0 left-0 right-0 bg-[#1c162b] p-6 rounded-t-3xl transition-transform duration-300 ${isStylePanelOpen ? 'translate-y-0' : 'translate-y-full'}`} onClick={(e) => e.stopPropagation()}>
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold">Select a Style</h2>
             <button onClick={() => setIsStylePanelOpen(false)} className="p-2 rounded-full hover:bg-white/10"><CloseIcon className="w-6 h-6"/></button>
           </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {styles.map((style) => (
              <button
                key={style.id}
                onClick={() => handleSelectStyle(style)}
                className={`p-4 text-center font-semibold rounded-lg transition-colors border-2 ${
                  activeStyle.id === style.id
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
                }`}
              >
                {style.name}
              </button>
            ))}
          </div>
        </div>
      </div>

       {/* Prompt Editor Panel */}
      <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isPromptEditorOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsPromptEditorOpen(false)}>
        <div className={`absolute bottom-0 left-0 right-0 bg-[#1c162b] p-6 rounded-t-3xl transition-transform duration-300 ${isPromptEditorOpen ? 'translate-y-0' : 'translate-y-full'}`} onClick={(e) => e.stopPropagation()}>
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold">Customize Prompt</h2>
             <button onClick={() => setIsPromptEditorOpen(false)} className="p-2 rounded-full hover:bg-white/10"><CloseIcon className="w-6 h-6"/></button>
           </div>
           <textarea
              id="prompt"
              rows={8}
              className="w-full bg-black/30 border border-white/20 rounded-lg p-3 text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button onClick={() => setIsPromptEditorOpen(false)} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
              Save and Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default App;