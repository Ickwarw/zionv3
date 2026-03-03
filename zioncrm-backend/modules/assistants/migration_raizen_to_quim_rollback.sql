BEGIN;

UPDATE assistants
SET name = 'Quim',
    avatar = COALESCE(NULLIF(avatar, ''), 'quim_avatar.png'),
    greeting = REPLACE(COALESCE(greeting, ''), 'Raizen', 'Quim')
WHERE LOWER(name) = 'raizen';

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'raizen_training_data'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'quim_training_data'
    ) THEN
        ALTER TABLE raizen_training_data RENAME TO quim_training_data;
    END IF;
END
$$;

COMMIT;
