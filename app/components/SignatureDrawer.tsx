import { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignatureDrawerProps {
  signature: string | undefined;
  onSignatureSave: (signature: string | undefined) => void;
}

export default function SignatureDrawer({ signature, onSignatureSave }: SignatureDrawerProps) {
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const sigCanvasRef = useRef<SignatureCanvas>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBegin = () => {
    setHasSignature(true);
  };

  const clearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
      setHasSignature(false);
    }
  };

  const saveSignature = () => {
    if (hasSignature && sigCanvasRef.current) {
      const signatureData = sigCanvasRef.current.toDataURL();
      onSignatureSave(signatureData);
      setShowSignaturePad(false);
    }
  };

  const cancelSignature = () => {
    setShowSignaturePad(false);
    clearSignature();
  };

  const removeSignature = () => {
    onSignatureSave(undefined);
    clearSignature();
  };

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onSignatureSave(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFilePicker = () => fileInputRef.current?.click();

  return (
    <div className="space-y-4">
      <input type="hidden" name="signature" value={signature || ''} />
      <div className="flex items-center space-x-2">
        <span className="text-lg font-semibold text-gray-900">Signature</span>
        <button
          type="button"
          onClick={() => setShowSignaturePad(true)}
          className="w-8 h-8 bg-gray-700 text-white rounded flex items-center justify-center hover:bg-gray-900"
        >
          ✎
        </button>
        <button
          type="button"
          onClick={triggerFilePicker}
          className="w-8 h-8 bg-gray-700 text-white rounded flex items-center justify-center hover:bg-blue-900"
          title="Upload signature image"
        >
          📁
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleSignatureUpload}
        className="hidden"
      />

      {signature && (
        <div className="space-y-2">
          <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
            <img
              src={signature}
              alt="Saved signature"
              className="max-w-full h-auto max-h-16 mx-auto"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={removeSignature}
              className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Remove Signature
            </button>
          </div>
        </div>
      )}

      {showSignaturePad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Draw Your Signature</h3>
              <button
                onClick={cancelSignature}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="border-2 border-gray-300 rounded-lg bg-white mb-4">
              <SignatureCanvas
                ref={sigCanvasRef}
                penColor="black"
                canvasProps={{
                  width: 600,
                  height: 200,
                  className: 'w-full h-48 cursor-crosshair'
                }}
                onBegin={handleBegin}
              />
            </div>

            <div className="text-sm text-gray-500 mb-4 text-center">
              Draw your signature above using your mouse or finger
            </div>

            <div className="flex justify-between space-x-3">
              <button
                onClick={clearSignature}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Clear
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={cancelSignature}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSignature}
                  disabled={!hasSignature}
                  className={`px-4 py-2 rounded-md ${hasSignature
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  Save Signature
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}