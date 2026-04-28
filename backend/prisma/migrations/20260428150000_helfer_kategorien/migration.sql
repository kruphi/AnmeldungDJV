-- Create HelferKategorie table
CREATE TABLE IF NOT EXISTS "HelferKategorie" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "HelferKategorie_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "HelferKategorie_name_key" ON "HelferKategorie"("name");

-- Insert defaults matching existing enum values
INSERT INTO "HelferKategorie" ("name") SELECT 'Standaufsicht'       WHERE NOT EXISTS (SELECT 1 FROM "HelferKategorie" WHERE "name" = 'Standaufsicht');
INSERT INTO "HelferKategorie" ("name") SELECT 'Scheibensetzer'      WHERE NOT EXISTS (SELECT 1 FROM "HelferKategorie" WHERE "name" = 'Scheibensetzer');
INSERT INTO "HelferKategorie" ("name") SELECT 'Zeitnahme & Protokoll' WHERE NOT EXISTS (SELECT 1 FROM "HelferKategorie" WHERE "name" = 'Zeitnahme & Protokoll');

-- Add kategorieId to Helfer
ALTER TABLE "Helfer" ADD COLUMN IF NOT EXISTS "kategorieId" INTEGER;

-- Migrate existing aufgabe enum values → kategorieId
UPDATE "Helfer" h
SET "kategorieId" = hk.id
FROM "HelferKategorie" hk
WHERE h."kategorieId" IS NULL
  AND (
    (h."aufgabe"::text = 'STANDAUFSICHT'       AND hk."name" = 'Standaufsicht') OR
    (h."aufgabe"::text = 'SCHEIBENSETZER'       AND hk."name" = 'Scheibensetzer') OR
    (h."aufgabe"::text = 'ZEITNAHME_PROTOKOLL'  AND hk."name" = 'Zeitnahme & Protokoll')
  );

-- Any remaining NULLs (unknown enum values) → first kategorie
UPDATE "Helfer"
SET "kategorieId" = (SELECT id FROM "HelferKategorie" ORDER BY id LIMIT 1)
WHERE "kategorieId" IS NULL;

ALTER TABLE "Helfer" ALTER COLUMN "kategorieId" SET NOT NULL;

-- Add FK
DO $$ BEGIN
  ALTER TABLE "Helfer" ADD CONSTRAINT "Helfer_kategorieId_fkey"
    FOREIGN KEY ("kategorieId") REFERENCES "HelferKategorie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Drop old aufgabe column
ALTER TABLE "Helfer" DROP COLUMN IF EXISTS "aufgabe";

-- Drop HelferAufgabe enum
DROP TYPE IF EXISTS "HelferAufgabe";
