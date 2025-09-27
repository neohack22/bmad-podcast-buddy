-- Activer l'extension pg_cron pour les tâches planifiées
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Créer une tâche cron pour synchroniser les analytics YouTube toutes les heures
SELECT cron.schedule(
  'sync-youtube-analytics',
  '0 * * * *', -- Toutes les heures à 0 minutes
  $$
  SELECT
    net.http_post(
        url:='https://nijagdmfvadmpzwshvll.supabase.co/functions/v1/sync-analytics',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pamFnZG1mdmFkbXB6d3NodmxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODQ3NDcsImV4cCI6MjA3NDU2MDc0N30.0CZj3esm9oQVuw-eIhv-VbYN125HOJC5S8ucPYFp0s4"}'::jsonb,
        body:='{"automated": true}'::jsonb
    ) as request_id;
  $$
);