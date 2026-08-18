import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ImageGenerator = () => {
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [overlayText, setOverlayText] = useState('');
  const [bannerColor, setBannerColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(40);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setGeneratedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Real-time preview when inputs change
  useEffect(() => {
    if (uploadedImage) {
      generateImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlayText, bannerColor, fontSize]);

  const generateImage = () => {
    if (!uploadedImage || !canvasRef.current) return;

    setIsGenerating(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the uploaded image
      ctx.drawImage(img, 0, 0);

      // Add logo (assuming logo is at /HAWA LOGO.jpg)
      const logo = new Image();
      logo.onload = () => {
        // Draw logo at top-right corner with some padding
        const logoSize = Math.min(canvas.width, canvas.height) * 0.15;
        const logoPadding = 20;
        ctx.drawImage(
          logo,
          canvas.width - logoSize - logoPadding,
          logoPadding,
          logoSize,
          logoSize
        );

        // Add text overlay at bottom with color banner
        if (overlayText) {
          ctx.font = `bold ${fontSize}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';

          const textX = canvas.width / 2;
          const textY = canvas.height - 20;
          const textMetrics = ctx.measureText(overlayText);
          const textWidth = textMetrics.width;
          const textHeight = fontSize * 1.5;
          const bannerPadding = 20;

          // Draw color banner behind text
          ctx.fillStyle = bannerColor;
          ctx.fillRect(
            textX - textWidth / 2 - bannerPadding,
            textY - textHeight,
            textWidth + bannerPadding * 2,
            textHeight + 10
          );

          // Draw text
          ctx.fillStyle = 'white';
          ctx.fillText(overlayText, textX, textY);
        }

        // Convert canvas to image
        const dataUrl = canvas.toDataURL('image/png');
        setGeneratedImage(dataUrl);
        setIsGenerating(false);
      };

      logo.onerror = () => {
        // If logo fails to load, still generate image with text only
        if (overlayText) {
          ctx.font = `bold ${fontSize}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';

          const textX = canvas.width / 2;
          const textY = canvas.height - 20;
          const textMetrics = ctx.measureText(overlayText);
          const textWidth = textMetrics.width;
          const textHeight = fontSize * 1.5;
          const bannerPadding = 20;

          // Draw color banner behind text
          ctx.fillStyle = bannerColor;
          ctx.fillRect(
            textX - textWidth / 2 - bannerPadding,
            textY - textHeight,
            textWidth + bannerPadding * 2,
            textHeight + 10
          );

          // Draw text
          ctx.fillStyle = 'white';
          ctx.fillText(overlayText, textX, textY);
        }

        const dataUrl = canvas.toDataURL('image/png');
        setGeneratedImage(dataUrl);
        setIsGenerating(false);
      };

      logo.src = '/HAWA LOGO.jpg';
    };

    img.src = uploadedImage;
  };

  const downloadImage = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">އިމޭޖް ޖެނެރޭޓަރ</h1>
          <button
            onClick={() => navigate('/admin')}
            className="rounded-lg bg-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-300"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="space-y-6">
          {/* Upload Section */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">އިމޭޖް އަޕްލޯޑް ކުރުން</h2>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full rounded-lg border border-slate-300 p-3"
            />
          </div>

          {/* Text Input Section */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">ޓެކްސްޓް އިންޕުޓް</h2>
            <input
              type="text"
              value={overlayText}
              onChange={(e) => setOverlayText(e.target.value)}
              placeholder="އެއްވެސް ޓެކްސްޓެއް ލިޔުން..."
              className="w-full rounded-lg border border-slate-300 p-3"
            />
          </div>

          {/* Color Picker Section */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">ބެނަރ ކަލަރ</h2>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={bannerColor}
                onChange={(e) => setBannerColor(e.target.value)}
                className="h-12 w-20 rounded-lg border border-slate-300 cursor-pointer"
              />
              <span className="text-sm text-slate-600">{bannerColor}</span>
            </div>
          </div>

          {/* Font Size Section */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">ފޮންޓް ސައިޒް</h2>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="20"
                max="100"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="flex-1 h-2 rounded-lg bg-slate-200 appearance-none cursor-pointer"
              />
              <span className="text-sm text-slate-600 w-16 text-right">{fontSize}px</span>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateImage}
            disabled={!uploadedImage || isGenerating}
            className="w-full rounded-lg bg-sky-500 px-6 py-3 font-semibold text-white hover:bg-sky-600 disabled:bg-slate-300 disabled:text-slate-500"
          >
            {isGenerating ? 'ޖެނެރޭޓް ކުރަމުން...' : 'އިމޭޖް ޖެނެރޭޓް ކުރުން'}
          </button>

          {/* Preview Section */}
          {uploadedImage && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">ޕްރިވިއު</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-medium text-slate-700">އޮރިޖިނަލް އިމޭޖް</h3>
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="h-auto w-full rounded-lg border border-slate-200"
                  />
                </div>
                {generatedImage && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-slate-700">ޖެނެރޭޓް ކުރެވުނު އިމޭޖް</h3>
                    <img
                      src={generatedImage}
                      alt="Generated"
                      className="h-auto w-full rounded-lg border border-slate-200"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Download Button */}
          {generatedImage && (
            <button
              onClick={downloadImage}
              className="w-full rounded-lg bg-green-500 px-6 py-3 font-semibold text-white hover:bg-green-600"
            >
              އިމޭޖް ޑައުންލޯޑް ކުރުން
            </button>
          )}

          {/* Hidden Canvas */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
