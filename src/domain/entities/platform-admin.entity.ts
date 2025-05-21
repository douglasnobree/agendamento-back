export type PlatformAdminProps = {
  id: string;
  email: string;
  name: string;
  password?: string;
  createdAt?: Date;
};

export class PlatformAdmin {
  private constructor(private props: PlatformAdminProps) {}

  public static create(
    email: string,
    name: string,
    password?: string,
  ): PlatformAdmin {
    if (!email || !name) {
      throw new Error('Nome e email são obrigatórios');
    }
    return new PlatformAdmin({
      id: crypto.randomUUID(),
      email,
      name,
      password,
      createdAt: new Date(),
    });
  }

  public static fromPersistence(props: PlatformAdminProps): PlatformAdmin {
    return new PlatformAdmin(props);
  }

  public toPersistence(): PlatformAdminProps {
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
