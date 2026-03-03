BEGIN;

UPDATE assistants
SET name = 'Raizen',
    avatar = COALESCE(NULLIF(avatar, ''), 'raizen_avatar.png'),
    greeting = REPLACE(COALESCE(greeting, ''), 'Quim', 'Raizen')
WHERE LOWER(name) = 'quim';

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'quim_training_data'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'raizen_training_data'
    ) THEN
        ALTER TABLE quim_training_data RENAME TO raizen_training_data;
    END IF;
END
$$;

COMMIT;
