import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { ModelName } from '../../common/constants/model-names';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import type { RequestUser } from '../identity/interfaces/request-user.interface';
import { AcceptPolicyDto } from './dto/accept-policy.dto';
import { ListEnablementRequestsDto } from './dto/list-enablement-requests.dto';
import { OwnershipCheckDto } from './dto/ownership-check.dto';
import { RegisterEnablementDto } from './dto/register-enablement.dto';
import { ReviewStepDto } from './dto/review-step.dto';
import { EnablementStepCode } from './entities/enablement-step.entity';
import { EnablementService } from './enablement.service';

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'enablement');

@ApiTags('enablement')
@Controller('enablement/requests')
export class EnablementController {
  constructor(private readonly enablementService: EnablementService) {}

  @Public()
  @Post()
  register(@Body() dto: RegisterEnablementDto) {
    return this.enablementService.register(dto);
  }

  @Public()
  @Post('policy-acceptance')
  async acceptPolicy(@Body() dto: AcceptPolicyDto, @Req() req: Request) {
    await this.enablementService.acceptPolicy(dto, req.ip ?? null);
    return { success: true };
  }

  @Public()
  @Get(':id')
  async getMine(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: OwnershipCheckDto,
  ) {
    const [request, steps] = await Promise.all([
      this.enablementService.getByIdForOwner(id, query.rif),
      this.enablementService.getSteps(id),
    ]);
    return { ...request, steps };
  }

  @Public()
  @Post(':id/documents')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          if (!existsSync(UPLOAD_DIR))
            mkdirSync(UPLOAD_DIR, { recursive: true });
          callback(null, UPLOAD_DIR);
        },
        filename: (_req, file, callback) => {
          callback(null, `${randomUUID()}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadDocument(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: OwnershipCheckDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new NotFoundException('Archivo no recibido');
    return this.enablementService.uploadDocument(id, dto.rif, file);
  }

  @RequirePermission(ModelName.ENABLEMENT_REQUEST, 'read')
  @Get()
  list(@Query() query: ListEnablementRequestsDto) {
    return this.enablementService.listForAdmin(query, query.status);
  }

  @RequirePermission(ModelName.ENABLEMENT_REQUEST, 'read')
  @Get(':id/admin')
  async getForAdmin(@Param('id', ParseIntPipe) id: number) {
    const [request, steps] = await Promise.all([
      this.enablementService.getByIdForAdmin(id),
      this.enablementService.getSteps(id),
    ]);
    return { ...request, steps };
  }

  @RequirePermission(ModelName.ENABLEMENT_REQUEST, 'write')
  @Patch(':id/steps/:stepCode')
  reviewStep(
    @Param('id', ParseIntPipe) id: number,
    @Param('stepCode') stepCode: EnablementStepCode,
    @Body() dto: ReviewStepDto,
    @CurrentUser() actor: RequestUser,
  ) {
    return this.enablementService.reviewStep(id, stepCode, dto, actor);
  }

  @Post('training/accept')
  acceptTraining(@CurrentUser() user: RequestUser) {
    return this.enablementService.acceptTraining(user);
  }
}
