export type AppointmentProps = {
  id: string;
  clientId: string;
  serviceId: string;
  staffId: string;
  scheduledAt: Date;
  status: string;
  createdAt?: Date;
};

export class Appointment {
  private constructor(private props: AppointmentProps) {}

  public static create(
    clientId: string,
    serviceId: string,
    staffId: string,
    scheduledAt: Date,
    status: string,
  ): Appointment {
    if (!clientId || !serviceId || !staffId || !scheduledAt || !status) {
      throw new Error('Todos os campos são obrigatórios');
    }
    return new Appointment({
      id: crypto.randomUUID(),
      clientId,
      serviceId,
      staffId,
      scheduledAt,
      status,
      createdAt: new Date(),
    });
  }

  public static fromPersistence(props: AppointmentProps): Appointment {
    return new Appointment(props);
  }

  public toPersistence(): AppointmentProps {
    return this.props;
  }

  public get id() {
    return this.props.id;
  }
  public get clientId() {
    return this.props.clientId;
  }
  public get serviceId() {
    return this.props.serviceId;
  }
  public get staffId() {
    return this.props.staffId;
  }
  public get scheduledAt() {
    return this.props.scheduledAt;
  }
  public get status() {
    return this.props.status;
  }
  public get createdAt() {
    return this.props.createdAt;
  }
}
