export type AvailableSlotProps = {
  id: string;
  staffId: string;
  dayOfWeek: number;
  startTime: Date; 
  endTime: Date;
  isRecurring: boolean;
  specificDate?: Date; 
  createdAt?: Date;
};

export class AvailableSlot {
  private constructor(private props: AvailableSlotProps) {}

  public static create(
    staffId: string,
    dayOfWeek: number,
    startTime: Date,
    endTime: Date,
    isRecurring: boolean = true,
    specificDate?: Date,
  ): AvailableSlot {
    if (!staffId) {
      throw new Error('ID do funcionário é obrigatório');
    }

    if (dayOfWeek < 0 || dayOfWeek > 6) {
      throw new Error(
        'Dia da semana deve estar entre 0 (domingo) e 6 (sábado)',
      );
    }

    if (startTime >= endTime) {
      throw new Error('Horário de início deve ser anterior ao horário de fim');
    }

    // Se não for recorrente, uma data específica é obrigatória
    if (!isRecurring && !specificDate) {
      throw new Error(
        'Data específica é obrigatória para horários não recorrentes',
      );
    }

    return new AvailableSlot({
      id: crypto.randomUUID(),
      staffId,
      dayOfWeek,
      startTime,
      endTime,
      isRecurring,
      specificDate,
      createdAt: new Date(),
    });
  }

  public static fromPersistence(props: AvailableSlotProps): AvailableSlot {
    return new AvailableSlot(props);
  }

  public toPersistence(): AvailableSlotProps {
    return this.props;
  }

  public get id() {
    return this.props.id;
  }

  public get staffId() {
    return this.props.staffId;
  }

  public get dayOfWeek() {
    return this.props.dayOfWeek;
  }

  public get startTime() {
    return this.props.startTime;
  }

  public get endTime() {
    return this.props.endTime;
  }

  public get isRecurring() {
    return this.props.isRecurring;
  }

  public get specificDate() {
    return this.props.specificDate;
  }

  public get createdAt() {
    return this.props.createdAt;
  }
}
