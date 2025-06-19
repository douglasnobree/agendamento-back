-- CreateTable
CREATE TABLE "tenant"."AvailableSlot" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT true,
    "specificDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvailableSlot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tenant"."AvailableSlot" ADD CONSTRAINT "AvailableSlot_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "tenant"."Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
