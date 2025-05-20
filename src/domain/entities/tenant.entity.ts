export type TenantProps = {
  id: string;
  name: string;
  ownerEmail: string;
  planId: string;
  schema: string;
  createdAt?: Date;
};

export class Tenant {
  private constructor(private props: TenantProps) {}

  public static create(
    name: string,
    ownerEmail: string,
    planId: string,
    schema: string,
  ): Tenant {
    if (!name || !ownerEmail || !planId || !schema) {
      throw new Error('Todos os campos são obrigatórios');
    }
    return new Tenant({
      id: crypto.randomUUID(),
      name,
      ownerEmail,
      planId,
      schema,
      createdAt: new Date(),
    });
  }

  public static fromPersistence(props: TenantProps): Tenant {
    return new Tenant(props);
  }

  public toPersistence(): TenantProps {
    return this.props;
  }

  public get id() {
    return this.props.id;
  }
  public get name() {
    return this.props.name;
  }
  public get ownerEmail() {
    return this.props.ownerEmail;
  }
  public get planId() {
    return this.props.planId;
  }
  public get schema() {
    return this.props.schema;
  }
  public get createdAt() {
    return this.props.createdAt;
  }
}
