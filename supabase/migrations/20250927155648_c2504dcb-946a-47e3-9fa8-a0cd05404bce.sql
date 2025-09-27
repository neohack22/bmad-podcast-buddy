-- Create analytics tables for real data tracking

-- Videos/Content table
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  platform TEXT NOT NULL, -- 'youtube', 'internal', etc.
  platform_video_id TEXT, -- external platform ID
  thumbnail_url TEXT,
  duration INTEGER, -- in seconds
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'deleted', 'private'
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Analytics data table
CREATE TABLE public.analytics_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  watch_time_seconds INTEGER NOT NULL DEFAULT 0, -- total watch time for that day
  subscribers_gained INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(video_id, date) -- One record per video per day
);

-- Enable Row Level Security
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for videos
CREATE POLICY "Users can view their own videos" 
ON public.videos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own videos" 
ON public.videos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos" 
ON public.videos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos" 
ON public.videos 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for analytics_data
CREATE POLICY "Users can view analytics for their videos" 
ON public.analytics_data 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.videos 
    WHERE videos.id = analytics_data.video_id 
    AND videos.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert analytics for their videos" 
ON public.analytics_data 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.videos 
    WHERE videos.id = analytics_data.video_id 
    AND videos.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update analytics for their videos" 
ON public.analytics_data 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.videos 
    WHERE videos.id = analytics_data.video_id 
    AND videos.user_id = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_videos_updated_at
BEFORE UPDATE ON public.videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_videos_user_id ON public.videos(user_id);
CREATE INDEX idx_videos_platform ON public.videos(platform);
CREATE INDEX idx_videos_published_at ON public.videos(published_at);
CREATE INDEX idx_analytics_video_id ON public.analytics_data(video_id);
CREATE INDEX idx_analytics_date ON public.analytics_data(date);

-- Create view for aggregated analytics
CREATE VIEW public.analytics_summary AS
SELECT 
  v.user_id,
  v.platform,
  COUNT(DISTINCT v.id) as total_videos,
  SUM(ad.views) as total_views,
  SUM(ad.likes) as total_likes,
  SUM(ad.comments) as total_comments,
  SUM(ad.shares) as total_shares,
  SUM(ad.watch_time_seconds) as total_watch_time_seconds,
  SUM(ad.subscribers_gained) as total_subscribers_gained,
  AVG(ad.views) as avg_views_per_video,
  CASE 
    WHEN SUM(ad.views) > 0 
    THEN ROUND((SUM(ad.likes) + SUM(ad.comments) + SUM(ad.shares))::numeric / SUM(ad.views)::numeric * 100, 2)
    ELSE 0 
  END as engagement_rate
FROM public.videos v
LEFT JOIN public.analytics_data ad ON v.id = ad.video_id
WHERE v.status = 'active'
GROUP BY v.user_id, v.platform;