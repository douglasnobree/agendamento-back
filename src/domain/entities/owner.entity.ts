export type OwnerProps = {
  id: string;
  email: string;
  name: string;
  password?: string;
  oauthType?: string;
  oauthId?: string;
  createdAt?: Date;
};

export class Owner {
  private constructor(private props: OwnerProps) {}

  public static create(email: string, name: string, password?: string): Owner {
    if (!email || !name) {
      throw new Error('Nome e email são obrigatórios');
    }
    return new Owner({
      id: crypto.randomUUID(),
      email,
      name,
      password,
      createdAt: new Date(),
    });
  }

  public static fromPersistence(props: OwnerProps): Owner {
    return new Owner(props);
  }

  public toPersistence(): OwnerProps {
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
  public get password() {
    return this.props.password;
  }
  public get createdAt() {
    return this.props.createdAt;
  }
}
