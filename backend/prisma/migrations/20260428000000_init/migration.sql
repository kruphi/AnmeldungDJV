-- CreateEnum (idempotent)
DO $$ BEGIN CREATE TYPE "Role" AS ENUM ('ADMIN', 'OBMANN'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "VeranstaltungStatus" AS ENUM ('PLANUNG', 'ANMELDUNG', 'AKTIV', 'ABGESCHLOSSEN'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "Disziplin" AS ENUM ('BUECHSE', 'FLINTE', 'PISTOLE', 'KOMBINATION'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "DjvGruppe" AS ENUM ('GRUPPE_A', 'GRUPPE_B', 'GRUPPE_C'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "HelferAufgabe" AS ENUM ('STANDAUFSICHT', 'SCHEIBENSETZER', 'ZEITNAHME_PROTOKOLL'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "HelferStatus" AS ENUM ('AUSSTEHEND', 'BESTAETIGT', 'ABGESAGT'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'OBMANN',
    "jaegerschaftId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Veranstaltung" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "datum" TIMESTAMP(3) NOT NULL,
    "ort" TEXT NOT NULL,
    "beschreibung" TEXT,
    "status" "VeranstaltungStatus" NOT NULL DEFAULT 'PLANUNG',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Veranstaltung_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Gruppe" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "stand" TEXT NOT NULL,
    "startzeit" TIMESTAMP(3) NOT NULL,
    "endzeit" TIMESTAMP(3) NOT NULL,
    "veranstaltungId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Gruppe_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Jaegerschaft" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "veranstaltungId" INTEGER NOT NULL,
    "gruppeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Jaegerschaft_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Schuetze" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "mitgliedsnummer" TEXT NOT NULL,
    "disziplin" "Disziplin" NOT NULL,
    "djvGruppe" "DjvGruppe" NOT NULL,
    "jaegerschaftId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Schuetze_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Helfer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "aufgabe" "HelferAufgabe" NOT NULL,
    "status" "HelferStatus" NOT NULL DEFAULT 'AUSSTEHEND',
    "jaegerschaftId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Helfer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Ergebnis" (
    "id" SERIAL NOT NULL,
    "schuetzeId" INTEGER NOT NULL,
    "punkte" INTEGER NOT NULL,
    "disziplin" "Disziplin" NOT NULL,
    "notizen" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Ergebnis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- AddForeignKey (idempotent)
DO $$ BEGIN ALTER TABLE "User" ADD CONSTRAINT "User_jaegerschaftId_fkey" FOREIGN KEY ("jaegerschaftId") REFERENCES "Jaegerschaft"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "Gruppe" ADD CONSTRAINT "Gruppe_veranstaltungId_fkey" FOREIGN KEY ("veranstaltungId") REFERENCES "Veranstaltung"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "Jaegerschaft" ADD CONSTRAINT "Jaegerschaft_veranstaltungId_fkey" FOREIGN KEY ("veranstaltungId") REFERENCES "Veranstaltung"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "Jaegerschaft" ADD CONSTRAINT "Jaegerschaft_gruppeId_fkey" FOREIGN KEY ("gruppeId") REFERENCES "Gruppe"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "Schuetze" ADD CONSTRAINT "Schuetze_jaegerschaftId_fkey" FOREIGN KEY ("jaegerschaftId") REFERENCES "Jaegerschaft"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "Helfer" ADD CONSTRAINT "Helfer_jaegerschaftId_fkey" FOREIGN KEY ("jaegerschaftId") REFERENCES "Jaegerschaft"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "Ergebnis" ADD CONSTRAINT "Ergebnis_schuetzeId_fkey" FOREIGN KEY ("schuetzeId") REFERENCES "Schuetze"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
