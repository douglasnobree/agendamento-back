export type StaffProps = {
  id: string;
  name: string;
  role: string;
  email: string;
  password?: string;
  createdAt?: Date;
};

export class Staff {
  private constructor(private props: StaffProps) {}

  public static create(
    name: string,
    role: string,
    email: string,
    password?: string,
  ): Staff {
    if (!name || !role || !email) {
      throw new Error('Nome, cargo e email são obrigatórios');
    }
    return new Staff({
      id: crypto.randomUUID(),
      name,
      role,
      email,
      password,
      createdAt: new Date(),
    });
  }

  public static fromPersistence(props: StaffProps): Staff {
    return new Staff(props);
  }

  public toPersistence(): StaffProps {
    return this.props;
  }

  public get id() {
    return this.props.id;
  }
  public get name() {
    return this.props.name;
  }
  public get role() {
    return this.props.role;
  }
  public get email() {
    return this.props.email;
  }
  public get password() {
    return this.props.password;
  }
  public get createdAt() {
    return this.props.createdAt;
  }
}
