import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { EnablementRequestStatus } from '../entities/enablement-request.entity';

export class ListEnablementRequestsDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(EnablementRequestStatus)
  status?: EnablementRequestStatus;
}
