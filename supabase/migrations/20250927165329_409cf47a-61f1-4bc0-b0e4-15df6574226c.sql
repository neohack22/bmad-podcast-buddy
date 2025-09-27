-- Create table to store YouTube OAuth tokens
CREATE TABLE public.youtube_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  channel_id TEXT,
  channel_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id) -- Un seul token par utilisateur
);

-- Enable Row Level Security
ALTER TABLE public.youtube_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for youtube_tokens
CREATE POLICY "Users can view their own YouTube tokens" 
ON public.youtube_tokens 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own YouTube tokens" 
ON public.youtube_tokens 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own YouTube tokens" 
ON public.youtube_tokens 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own YouTube tokens" 
ON public.youtube_tokens 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_youtube_tokens_updated_at
BEFORE UPDATE ON public.youtube_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add YouTube connection status to videos table
ALTER TABLE public.videos 
ADD COLUMN IF NOT EXISTS youtube_channel_id TEXT,
ADD COLUMN IF NOT EXISTS sync_enabled BOOLEAN DEFAULT true;