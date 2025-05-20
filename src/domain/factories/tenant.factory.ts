import { Tenant } from '../entities/tenant.entity';

export class TenantFactory {
  static create(props: {
    name: string;
    ownerEmail: string;
    planId: string;
    schema: string;
  }): Tenant {
    return Tenant.create(
      props.name,
      props.ownerEmail,
      props.planId,
      props.schema,
    );
  }
}
