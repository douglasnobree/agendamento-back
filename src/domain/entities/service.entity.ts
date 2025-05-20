export type ServiceProps = {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  createdAt?: Date;
};

export class Service {
  private constructor(private props: ServiceProps) {}

  public static create(
    name: string,
    duration: number,
    price: number,
    description?: string,
  ): Service {
    if (!name || !duration || !price) {
      throw new Error('Nome, duração e preço são obrigatórios');
    }
    return new Service({
      id: crypto.randomUUID(),
      name,
      duration,
      price,
      description,
      createdAt: new Date(),
    });
  }

  public static fromPersistence(props: ServiceProps): Service {
    return new Service(props);
  }

  public toPersistence(): ServiceProps {
    return this.props;
  }

  public get id() {
    return this.props.id;
  }
  public get name() {
    return this.props.name;
  }
  public get description() {
    return this.props.description;
  }
  public get duration() {
    return this.props.duration;
  }
  public get price() {
    return this.props.price;
  }
  public get createdAt() {
    return this.props.createdAt;
  }
}
