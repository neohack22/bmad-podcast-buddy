-- Fix security definer view issue by recreating the view properly
DROP VIEW public.analytics_summary;

-- Create view without security definer (default is security invoker)
CREATE VIEW public.analytics_summary AS
SELECT 
  v.user_id,
  v.platform,
  COUNT(DISTINCT v.id) as total_videos,
  COALESCE(SUM(ad.views), 0) as total_views,
  COALESCE(SUM(ad.likes), 0) as total_likes,
  COALESCE(SUM(ad.comments), 0) as total_comments,
  COALESCE(SUM(ad.shares), 0) as total_shares,
  COALESCE(SUM(ad.watch_time_seconds), 0) as total_watch_time_seconds,
  COALESCE(SUM(ad.subscribers_gained), 0) as total_subscribers_gained,
  COALESCE(AVG(ad.views), 0) as avg_views_per_video,
  CASE 
    WHEN COALESCE(SUM(ad.views), 0) > 0 
    THEN ROUND((COALESCE(SUM(ad.likes), 0) + COALESCE(SUM(ad.comments), 0) + COALESCE(SUM(ad.shares), 0))::numeric / SUM(ad.views)::numeric * 100, 2)
    ELSE 0 
  END as engagement_rate
FROM public.videos v
LEFT JOIN public.analytics_data ad ON v.id = ad.video_id
WHERE v.status = 'active'
GROUP BY v.user_id, v.platform;