import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MenuService } from './menu.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // --- Endpoint PUBLIK (dipakai apps/kiosk, tanpa auth) ---

  @Get()
  findAll() {
    return this.menuService.findAll();
  }

  @Get('category/:category')
  findByCategory(@Param('category') category: string) {
    return this.menuService.findByCategory(decodeURIComponent(category));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menuService.findOne(id);
  }

  // --- Endpoint TERPROTEKSI (dipakai apps/admin, wajib Bearer token) ---

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateMenuItemDto) {
    return this.menuService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
    return this.menuService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menuService.remove(id);
  }
}