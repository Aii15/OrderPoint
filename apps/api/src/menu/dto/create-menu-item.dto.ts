export class MenuAttributeDto {
  label!: string;
  value!: string;
}

export class MenuMeterDto {
  label!: string;
  value!: number;
}

export class CreateMenuItemDto {
  id!: string; // slug, mis. "cappuccino" — dipakai juga sebagai nama file gambar
  category!: string;
  name!: string;
  description!: string;
  composition!: string[];
  attributes!: MenuAttributeDto[];
  meters!: MenuMeterDto[];
  servingDetails!: string[];
  price!: number;
  availability!: string;
  imageAlt!: string;
  sortOrder?: number;
}