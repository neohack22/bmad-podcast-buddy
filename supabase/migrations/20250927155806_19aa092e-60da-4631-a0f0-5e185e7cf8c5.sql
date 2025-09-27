-- Remove the view completely since it's causing security issues
-- Instead, we'll use direct queries in the application code
DROP VIEW IF EXISTS public.analytics_summary;

-- Add some sample data for testing purposes
INSERT INTO public.videos (user_id, title, description, platform, duration, published_at) VALUES 
('00000000-0000-0000-0000-000000000000', 'Test Video YouTube', 'Description du test', 'youtube', 300, NOW() - INTERVAL '7 days'),
('00000000-0000-0000-0000-000000000000', 'Test Video Interne', 'Description du test interne', 'internal', 450, NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- Add sample analytics data for the test videos  
WITH video_ids AS (
  SELECT id, platform FROM public.videos WHERE title LIKE 'Test Video%'
)
INSERT INTO public.analytics_data (video_id, date, views, likes, comments, shares, watch_time_seconds, subscribers_gained)
SELECT 
  v.id,
  current_date - generate_series(0, 6),
  (random() * 1000)::integer + 100,
  (random() * 50)::integer + 5,
  (random() * 20)::integer + 1,
  (random() * 10)::integer,
  (random() * 500)::integer + 50,
  CASE WHEN v.platform = 'youtube' THEN (random() * 5)::integer ELSE 0 END
FROM video_ids v
CROSS JOIN generate_series(0, 6)
ON CONFLICT (video_id, date) DO NOTHING;