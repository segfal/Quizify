'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Loading editor...</p>,
});

interface NoteEditorProps {
    initialContent?: string;
    onSave: (content: string) => void;
    readOnly?: boolean;
}

export const NoteEditor = ({ initialContent = '', onSave, readOnly = false }: NoteEditorProps) => {
    const [content, setContent] = useState(initialContent);

    const modules = {
        toolbar: readOnly ? false : [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['blockquote', 'code-block'],
            ['link'],
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'blockquote', 'code-block',
        'link'
    ];

    const handleChange = (value: string) => {
        setContent(value);
    };

    const handleSave = () => {
        onSave(content);
    };

    return (
        <div className="flex flex-col gap-4">
            <ReactQuill
                theme="snow"
                value={content}
                onChange={handleChange}
                modules={modules}
                formats={formats}
                readOnly={readOnly}
                className="bg-white rounded-lg"
            />
            {!readOnly && (
                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors w-fit"
                >
                    Save Note
                </button>
            )}
        </div>
    );
}; 