-- Remove mitgliedsnummer and disziplin from Schuetze
ALTER TABLE "Schuetze" DROP COLUMN IF EXISTS "mitgliedsnummer";
ALTER TABLE "Schuetze" DROP COLUMN IF EXISTS "disziplin";
ALTER TABLE "Schuetze" DROP COLUMN IF EXISTS "djvGruppe";

-- Create MannschaftKategorie table
CREATE TABLE IF NOT EXISTS "MannschaftKategorie" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nurBSchuetzen" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "MannschaftKategorie_pkey" PRIMARY KEY ("id")
);

-- Unique index on name
CREATE UNIQUE INDEX IF NOT EXISTS "MannschaftKategorie_name_key" ON "MannschaftKategorie"("name");

-- Insert default categories from existing data
INSERT INTO "MannschaftKategorie" ("name", "nurBSchuetzen")
SELECT 'A-Mannschaft', false
WHERE NOT EXISTS (SELECT 1 FROM "MannschaftKategorie" WHERE "name" = 'A-Mannschaft');

INSERT INTO "MannschaftKategorie" ("name", "nurBSchuetzen")
SELECT 'B-Mannschaft', true
WHERE NOT EXISTS (SELECT 1 FROM "MannschaftKategorie" WHERE "name" = 'B-Mannschaft');

-- Add kategorieId column to Mannschaft
ALTER TABLE "Mannschaft" ADD COLUMN IF NOT EXISTS "kategorieId" INTEGER;

-- Migrate existing typ values (enum 'A'/'B') to kategorieId
UPDATE "Mannschaft" m
SET "kategorieId" = mk.id
FROM "MannschaftKategorie" mk
WHERE m."kategorieId" IS NULL
  AND (
    (m."typ"::text = 'A' AND mk."name" = 'A-Mannschaft') OR
    (m."typ"::text = 'B' AND mk."name" = 'B-Mannschaft')
  );

-- Any remaining NULLs → first category
UPDATE "Mannschaft"
SET "kategorieId" = (SELECT id FROM "MannschaftKategorie" ORDER BY id LIMIT 1)
WHERE "kategorieId" IS NULL;

-- Make kategorieId NOT NULL
ALTER TABLE "Mannschaft" ALTER COLUMN "kategorieId" SET NOT NULL;

-- Add foreign key
DO $$ BEGIN
  ALTER TABLE "Mannschaft" ADD CONSTRAINT "Mannschaft_kategorieId_fkey"
    FOREIGN KEY ("kategorieId") REFERENCES "MannschaftKategorie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Drop old typ column
ALTER TABLE "Mannschaft" DROP COLUMN IF EXISTS "typ";

-- Drop MannschaftTyp enum
DROP TYPE IF EXISTS "MannschaftTyp";

-- Update MannschaftSchuetze: one Mannschaft per Schütze
-- Remove duplicates first (keep entry with smallest id per schuetzeId)
DELETE FROM "MannschaftSchuetze"
WHERE id NOT IN (
  SELECT MIN(id) FROM "MannschaftSchuetze" GROUP BY "schuetzeId"
);

-- Drop old composite unique constraint
DO $$ BEGIN
  ALTER TABLE "MannschaftSchuetze" DROP CONSTRAINT "MannschaftSchuetze_mannschaftId_schuetzeId_key";
EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- Add new unique constraint on schuetzeId alone
DO $$ BEGIN
  ALTER TABLE "MannschaftSchuetze" ADD CONSTRAINT "MannschaftSchuetze_schuetzeId_key" UNIQUE ("schuetzeId");
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Remove DjvGruppe enum (no longer used)
DROP TYPE IF EXISTS "DjvGruppe";
