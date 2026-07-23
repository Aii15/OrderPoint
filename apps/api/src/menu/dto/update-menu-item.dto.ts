import { MenuAttributeDto, MenuMeterDto } from './create-menu-item.dto';

// Sengaja tidak extends PartialType(CreateMenuItemDto) supaya tidak perlu
// menambah dependency @nestjs/mapped-types hanya untuk satu tempat pakai.
export class UpdateMenuItemDto {
  id?: string; // BARU — kalau diisi dan beda dari id lama, berarti admin mau rename slug
  category?: string;
  name?: string;
  description?: string;
  composition?: string[];
  attributes?: MenuAttributeDto[];
  meters?: MenuMeterDto[];
  servingDetails?: string[];
  price?: number;
  availability?: string;
  imageAlt?: string;
  sortOrder?: number;
}