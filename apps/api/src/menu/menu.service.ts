import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.menuItem.findMany({
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  findByCategory(category: string) {
    return this.prisma.menuItem.findMany({
      where: { category },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.menuItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Menu item "${id}" tidak ditemukan`);
    return item;
  }

  async create(dto: CreateMenuItemDto) {
    const existing = await this.prisma.menuItem.findUnique({ where: { id: dto.id } });
    if (existing) {
      throw new ConflictException(`Menu item dengan id "${dto.id}" sudah ada`);
    }

    return this.prisma.menuItem.create({
      data: {
        id: dto.id,
        category: dto.category,
        name: dto.name,
        description: dto.description,
        composition: dto.composition,
        attributes: dto.attributes as unknown as object,
        meters: dto.meters as unknown as object,
        servingDetails: dto.servingDetails,
        price: dto.price,
        availability: dto.availability,
        imageAlt: dto.imageAlt,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdateMenuItemDto) {
    await this.findOne(id); // memastikan item lama ada, lempar 404 kalau tidak

    // BARU — admin ganti Id (slug). Cek dulu id baru belum dipakai item lain.
    if (dto.id && dto.id !== id) {
      const conflict = await this.prisma.menuItem.findUnique({ where: { id: dto.id } });
      if (conflict) {
        throw new ConflictException(`Menu item dengan id "${dto.id}" sudah ada`);
      }
    }

    return this.prisma.menuItem.update({
      where: { id },
      data: {
        ...dto,
        attributes: dto.attributes ? (dto.attributes as unknown as object) : undefined,
        meters: dto.meters ? (dto.meters as unknown as object) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.menuItem.delete({ where: { id } });
    return { deleted: true, id };
  }
}