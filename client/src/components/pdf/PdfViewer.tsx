'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PdfViewerProps {
    url: string;
}

export const PdfViewer = ({ url }: PdfViewerProps) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    const changePage = (offset: number) => {
        setPageNumber(prevPageNumber => {
            const newPageNumber = prevPageNumber + offset;
            return Math.min(Math.max(1, newPageNumber), numPages || 1);
        });
    };

    const previousPage = () => changePage(-1);
    const nextPage = () => changePage(1);

    const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2.0));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));

    return (
        <div className="flex flex-col items-center">
            <div className="mb-4 flex gap-4 items-center">
                <button
                    onClick={previousPage}
                    disabled={pageNumber <= 1}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                    Previous
                </button>
                <span>
                    Page {pageNumber} of {numPages}
                </span>
                <button
                    onClick={nextPage}
                    disabled={pageNumber >= (numPages || 1)}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                    Next
                </button>
                <button
                    onClick={zoomOut}
                    className="px-4 py-2 bg-gray-200 rounded"
                >
                    Zoom Out
                </button>
                <button
                    onClick={zoomIn}
                    className="px-4 py-2 bg-gray-200 rounded"
                >
                    Zoom In
                </button>
            </div>

            <div className="border rounded-lg p-4 bg-white shadow-lg">
                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<div>Loading PDF...</div>}
                    error={<div>Failed to load PDF</div>}
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                    />
                </Document>
            </div>
        </div>
    );
}; 