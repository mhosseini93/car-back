import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard.js';
import { FooterSettingsDto } from './footer-settings.dto.js';
import { SettingsService } from './settings.service.js';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  // Public: the site footer reads this
  @Get('footer')
  getFooter() {
    return this.settings.getFooter();
  }

  @Put('footer')
  @UseGuards(AdminGuard)
  updateFooter(@Body() dto: FooterSettingsDto) {
    return this.settings.updateFooter(dto);
  }
}
