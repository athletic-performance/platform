-- Минимальная техническая миграция engineering foundation.
-- Продуктовые таблицы на этом этапе не создаются.

CREATE TABLE "_tech_foundation" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "_tech_foundation_pkey" PRIMARY KEY ("id")
);
