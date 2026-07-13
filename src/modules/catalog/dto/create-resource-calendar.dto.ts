import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateResourceCalendarDto {
  @IsString()
  @MaxLength(128)
  name: string;

  @IsOptional()
  @IsInt()
  serviceId?: number;
}

export class CreateResourceCalendarAttendanceDto {
  @IsInt()
  calendarId: number;

  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @IsInt()
  @Min(0)
  @Max(24)
  hourFrom: number;

  @IsInt()
  @Min(0)
  @Max(24)
  hourTo: number;
}
