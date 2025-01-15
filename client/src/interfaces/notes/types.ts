export interface NotesProps {
    roomId: string;
    initialContent?: string;
    onUpdate: (content: string) => void;
}

export interface NoteFile {
    note_id: number;
    filename: string;
    url: string;
    filetype: string;
    upload_date: string;
    users: {
        username: string;
    };
}