-- Create Notes table
CREATE TABLE IF NOT EXISTS public.notes (
    note_id BIGSERIAL PRIMARY KEY,
    room_id BIGINT REFERENCES public.room(room_id) ON DELETE CASCADE,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Allow read access to room members
CREATE POLICY "Allow read access to room members" ON public.notes
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.room_members
            WHERE room_members.room_id = notes.room_id
            AND room_members.user_id = auth.uid()
        )
    );

-- Allow write access to room members
CREATE POLICY "Allow write access to room members" ON public.notes
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.room_members
            WHERE room_members.room_id = notes.room_id
            AND room_members.user_id = auth.uid()
        )
    );

-- Allow update access to room members
CREATE POLICY "Allow update access to room members" ON public.notes
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.room_members
            WHERE room_members.room_id = notes.room_id
            AND room_members.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.room_members
            WHERE room_members.room_id = notes.room_id
            AND room_members.user_id = auth.uid()
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 