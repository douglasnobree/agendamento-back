export type ClientProps = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  createdAt?: Date;
};

export class Client {
  private constructor(private props: ClientProps) {}

  public static create(email: string, name: string, phone?: string): Client {
    if (!email || !name) {
      throw new Error('Nome e email são obrigatórios');
    }
    return new Client({
      id: crypto.randomUUID(),
      email,
      name,
      phone,
      createdAt: new Date(),
    });
  }

  public static fromPersistence(props: ClientProps): Client {
    return new Client(props);
  }

  public toPersistence(): ClientProps {
    return this.props;
  }

  public get id() {
    return this.props.id;
  }
  public get email() {
    return this.props.email;
  }
  public get name() {
    return this.props.name;
  }
  public get phone() {
    return this.props.phone;
  }
  public get createdAt() {
    return this.props.createdAt;
  }

  public alterarNome(novoNome: string): void {
    if (!novoNome.trim()) throw new Error('Nome inválido');
    this.props.name = novoNome;
  }
}
