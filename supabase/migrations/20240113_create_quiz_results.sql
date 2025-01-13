-- Create Quiz Results table
CREATE TABLE IF NOT EXISTS public.quiz_results (
    result_id BIGSERIAL PRIMARY KEY,
    room_id BIGINT REFERENCES public.room(room_id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES public.users(user_id) ON DELETE CASCADE,
    quiz_id BIGINT REFERENCES public.quiz(quiz_id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    time_taken INTEGER, -- in seconds
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Allow read access to room members
CREATE POLICY "Allow read access to room members" ON public.quiz_results
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.room_members
            WHERE room_members.room_id = quiz_results.room_id
            AND room_members.user_id = auth.uid()
        )
    );

-- Allow insert access to quiz participants
CREATE POLICY "Allow insert access to quiz participants" ON public.quiz_results
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.room_members
            WHERE room_members.room_id = quiz_results.room_id
            AND room_members.user_id = auth.uid()
        )
        AND
        auth.uid() = user_id
    );

-- Create index for faster queries
CREATE INDEX idx_quiz_results_room_id ON public.quiz_results(room_id);
CREATE INDEX idx_quiz_results_user_id ON public.quiz_results(user_id);
CREATE INDEX idx_quiz_results_completed_at ON public.quiz_results(completed_at); 