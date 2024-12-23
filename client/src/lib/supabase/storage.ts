import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

export const uploadPdf = async (file: File, userId: string) => {
    try {
        const filename = `${userId}/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
            .from('pdfs')
            .upload(filename, file);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error uploading PDF:', error);
        throw error;
    }
};

export const getPdfUrl = async (path: string) => {
    try {
        const { data } = await supabase.storage
            .from('pdfs')
            .getPublicUrl(path);
        
        return data.publicUrl;
    } catch (error) {
        console.error('Error getting PDF URL:', error);
        throw error;
    }
};

export const deletePdf = async (path: string) => {
    try {
        const { error } = await supabase.storage
            .from('pdfs')
            .remove([path]);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting PDF:', error);
        throw error;
    }
}; 