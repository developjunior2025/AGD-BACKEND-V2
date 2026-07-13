import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ResourceCalendar } from './resource-calendar.entity';

/** resource_calendar_attendance — franja horaria semanal de un calendario. */
@Entity('resource_calendar_attendance')
export class ResourceCalendarAttendance extends BaseEntity {
  @ManyToOne(() => ResourceCalendar, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'calendar_id' })
  calendar: ResourceCalendar;

  @Column({ name: 'calendar_id' })
  calendarId: number;

  /** 0 = lunes ... 6 = domingo. */
  @Column({ name: 'day_of_week', type: 'int' })
  dayOfWeek: number;

  @Column({ name: 'hour_from', type: 'decimal', precision: 4, scale: 2 })
  hourFrom: string;

  @Column({ name: 'hour_to', type: 'decimal', precision: 4, scale: 2 })
  hourTo: string;
}
