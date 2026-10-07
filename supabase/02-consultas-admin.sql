-- PORTAL MSA — consultas de acompanhamento
-- Execute no SQL Editor do Supabase quando quiser analisar os registros.

-- Participantes anônimos e último acesso
select
  participant_id,
  recovery_code,
  created_at,
  last_seen_at
from public.portal_participants
order by last_seen_at desc;

-- Progresso infantil atual
select
  participant_id,
  record_key,
  payload,
  updated_at
from public.portal_records
where module = 'kids'
  and record_type in ('state','activity','phase_result','challenge_answer')
order by participant_id, updated_at desc;

-- Resultados finais dos simulados
select
  participant_id,
  record_key as attempt_id,
  payload->>'examName' as simulado,
  payload->>'candidate' as candidato,
  payload->>'instrument' as instrumento,
  payload->>'common' as comum,
  (payload->>'pct')::int as percentual,
  (payload->>'correct')::int as acertos,
  (payload->>'wrong')::int as erros,
  (payload->>'blank')::int as brancos,
  updated_at
from public.portal_records
where module = 'simulado'
  and record_type = 'result'
order by updated_at desc;

-- Quantidade de simulados por modalidade
select
  payload->>'examName' as simulado,
  count(*) as tentativas,
  round(avg((payload->>'pct')::numeric),1) as media_percentual
from public.portal_records
where module='simulado'
  and record_type='result'
group by 1
order by 2 desc;

-- Eventos mais recentes
select participant_id,module,event_type,payload,created_at
from public.portal_events
order by created_at desc
limit 200;
