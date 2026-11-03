import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard.js';
import { CatalogService } from './catalog.service.js';
import { AdminCarsQueryDto, UpsertBrandDto, UpsertCarDto } from './dto.js';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminCatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('brands')
  listBrands() {
    return this.catalog.adminListBrands();
  }

  @Get('brands/:id')
  getBrand(@Param('id', ParseIntPipe) id: number) {
    return this.catalog.adminGetBrand(id);
  }

  @Post('brands')
  createBrand(@Body() dto: UpsertBrandDto) {
    return this.catalog.adminSaveBrand(null, dto);
  }

  @Put('brands/:id')
  updateBrand(@Param('id', ParseIntPipe) id: number, @Body() dto: UpsertBrandDto) {
    return this.catalog.adminSaveBrand(id, dto);
  }

  @Delete('brands/:id')
  deleteBrand(@Param('id', ParseIntPipe) id: number) {
    return this.catalog.adminDeleteBrand(id);
  }

  @Get('cars')
  listCars(@Query() query: AdminCarsQueryDto) {
    return this.catalog.adminListCars(query);
  }

  @Get('cars/:id')
  getCar(@Param('id', ParseIntPipe) id: number) {
    return this.catalog.adminGetCar(id);
  }

  @Post('cars')
  createCar(@Body() dto: UpsertCarDto) {
    return this.catalog.adminSaveCar(null, dto);
  }

  @Put('cars/:id')
  updateCar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpsertCarDto) {
    return this.catalog.adminSaveCar(id, dto);
  }

  @Delete('cars/:id')
  deleteCar(@Param('id', ParseIntPipe) id: number) {
    return this.catalog.adminDeleteCar(id);
  }
}
