export class Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: any;

  constructor(
    id: string,
    name: string,
    description: string,
    price: number,
    features: any,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.features = features;
  }
}
