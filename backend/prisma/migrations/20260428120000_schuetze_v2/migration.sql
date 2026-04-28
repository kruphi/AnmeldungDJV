-- New enums
DO $$ BEGIN CREATE TYPE "Nadel" AS ENUM ('BRONZE', 'SILBER', 'GOLD', 'SONDERGOLD'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "MannschaftTyp" AS ENUM ('A', 'B'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- New columns on Schuetze
ALTER TABLE "Schuetze" ADD COLUMN IF NOT EXISTS "vorname" TEXT;
ALTER TABLE "Schuetze" ADD COLUMN IF NOT EXISTS "nachname" TEXT;
ALTER TABLE "Schuetze" ADD COLUMN IF NOT EXISTS "jahrgang" INTEGER;
ALTER TABLE "Schuetze" ADD COLUMN IF NOT EXISTS "jungjaeger" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Schuetze" ADD COLUMN IF NOT EXISTS "jungjaegerSeit" INTEGER;
ALTER TABLE "Schuetze" ADD COLUMN IF NOT EXISTS "dame" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Schuetze" ADD COLUMN IF NOT EXISTS "nadel" "Nadel";

-- Data migration: split existing "name" into vorname/nachname (only if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Schuetze' AND column_name = 'name'
  ) THEN
    UPDATE "Schuetze"
    SET
      "vorname" = CASE
        WHEN position(' ' in "name") > 0 THEN split_part("name", ' ', 1)
        ELSE "name"
      END,
      "nachname" = CASE
        WHEN position(' ' in "name") > 0 THEN substring("name" from position(' ' in "name") + 1)
        ELSE ''
      END
    WHERE "vorname" IS NULL;
  END IF;
END $$;

-- Ensure no NULLs remain before setting NOT NULL
UPDATE "Schuetze" SET "vorname" = '' WHERE "vorname" IS NULL;
UPDATE "Schuetze" SET "nachname" = '' WHERE "nachname" IS NULL;

ALTER TABLE "Schuetze" ALTER COLUMN "vorname" SET NOT NULL;
ALTER TABLE "Schuetze" ALTER COLUMN "nachname" SET NOT NULL;

-- Drop old name column
ALTER TABLE "Schuetze" DROP COLUMN IF EXISTS "name";

-- Make mitgliedsnummer, disziplin, djvGruppe nullable
ALTER TABLE "Schuetze" ALTER COLUMN "mitgliedsnummer" DROP NOT NULL;
ALTER TABLE "Schuetze" ALTER COLUMN "disziplin" DROP NOT NULL;
ALTER TABLE "Schuetze" ALTER COLUMN "djvGruppe" DROP NOT NULL;

-- Create Mannschaft table
CREATE TABLE IF NOT EXISTS "Mannschaft" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "typ" "MannschaftTyp" NOT NULL,
    "jaegerschaftId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Mannschaft_pkey" PRIMARY KEY ("id")
);

-- Create MannschaftSchuetze join table
CREATE TABLE IF NOT EXISTS "MannschaftSchuetze" (
    "id" SERIAL NOT NULL,
    "mannschaftId" INTEGER NOT NULL,
    "schuetzeId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "MannschaftSchuetze_pkey" PRIMARY KEY ("id")
);

-- Foreign keys (idempotent)
DO $$ BEGIN ALTER TABLE "Mannschaft" ADD CONSTRAINT "Mannschaft_jaegerschaftId_fkey" FOREIGN KEY ("jaegerschaftId") REFERENCES "Jaegerschaft"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "MannschaftSchuetze" ADD CONSTRAINT "MannschaftSchuetze_mannschaftId_fkey" FOREIGN KEY ("mannschaftId") REFERENCES "Mannschaft"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "MannschaftSchuetze" ADD CONSTRAINT "MannschaftSchuetze_schuetzeId_fkey" FOREIGN KEY ("schuetzeId") REFERENCES "Schuetze"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "MannschaftSchuetze" ADD CONSTRAINT "MannschaftSchuetze_mannschaftId_schuetzeId_key" UNIQUE ("mannschaftId", "schuetzeId"); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
