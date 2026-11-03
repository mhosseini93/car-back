import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service.js';
import { PopularQueryDto } from './dto.js';

// Public car catalog used by the site
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('brands')
  listBrands() {
    return this.catalog.listBrands();
  }

  @Get('brands/:slug')
  getBrand(@Param('slug') slug: string) {
    return this.catalog.getBrand(slug);
  }

  @Get('cars/popular')
  popularCars(@Query() query: PopularQueryDto) {
    return this.catalog.popularCars(query.limit);
  }

  @Get('sitemap')
  sitemap() {
    return this.catalog.sitemapBrands();
  }
}
