import React, { useState } from 'react';

interface HTMLPreviewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  htmlContent: string;
}

export default function HTMLPreviewPopup({ isOpen, onClose, title, htmlContent }: HTMLPreviewPopupProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  if (!isOpen) return null;

  const desktopStyles = `
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      .section {
        margin-bottom: 2rem;
        padding: 1.5rem;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        background: white;
      }
      .section h2, .section h3 {
        color: #1f2937;
        margin-bottom: 1rem;
      }
      .section img {
        max-width: 100%;
        height: auto;
        border-radius: 4px;
        margin: 1rem 0;
      }
    </style>
  `;

  const mobileStyles = `
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 375px;
        margin: 0 auto;
        padding: 15px;
        font-size: 16px;
      }
      .section {
        margin-bottom: 1.5rem;
        padding: 1rem;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        background: white;
      }
      .section h2, .section h3 {
        color: #1f2937;
        margin-bottom: 0.75rem;
        font-size: 1.1em;
      }
      .section p {
        margin-bottom: 0.75rem;
        font-size: 0.95em;
      }
      .section img {
        max-width: 100%;
        height: auto;
        border-radius: 4px;
        margin: 0.75rem 0;
      }
    </style>
  `;

  const combinedHTML = `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      ${viewMode === 'desktop' ? desktopStyles : mobileStyles}
    </head>
    <body>
      <h1 style="color: #1f2937; margin-bottom: 2rem; text-align: center;">${title}</h1>
      ${htmlContent}
    </body>
    </html>
  `;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">HTML 미리보기</h2>
          <div className="flex items-center space-x-2">
            {/* 뷰 모드 토글 */}
            <div className="flex rounded-lg border border-neutral-200">
              <button
                onClick={() => setViewMode('desktop')}
                className={`px-3 py-1 text-sm rounded-l-lg transition-colors ${
                  viewMode === 'desktop'
                    ? 'bg-neutral-600 text-white'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                💻 PC
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`px-3 py-1 text-sm rounded-r-lg transition-colors ${
                  viewMode === 'mobile'
                    ? 'bg-neutral-600 text-white'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                📱 모바일
              </button>
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <i className="fa-solid fa-times text-xl"></i>
            </button>
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="flex-1 p-4">
          <div className={`w-full h-full border border-neutral-200 rounded ${
            viewMode === 'mobile' ? 'max-w-sm mx-auto' : ''
          }`}>
            <iframe
              srcDoc={combinedHTML}
              className="w-full h-full rounded"
              title="HTML Preview"
              sandbox="allow-same-origin"
            />
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-between p-4 border-t border-neutral-200 bg-neutral-50">
          <div className="text-sm text-neutral-600">
            {viewMode === 'desktop' ? '데스크톱 뷰 (1200px)' : '모바일 뷰 (375px)'}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                const newWindow = window.open();
                if (newWindow) {
                  newWindow.document.write(combinedHTML);
                }
              }}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              새 창에서 열기
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm bg-neutral-600 text-white rounded hover:bg-neutral-700 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
