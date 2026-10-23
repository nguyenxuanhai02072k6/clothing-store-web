/**
 * Staff Server Actions (Aggregator & Re-export)
 * 
 * Domain-driven modular decomposition:
 * - attendanceActions: Daily attendance logs & check-in/out
 * - leaveSalaryActions: Leave requests & salary adjustment workflows
 * - shiftScheduleActions: Shift schedules, direct assignments, and shift swaps
 * - dailyReportAnnouncementActions: Daily manager reports & internal broadcasts
 * - workspaceCollabActions: Desk/room reservations, Kanban tasks, and social feed
 * - wikiAuditActions: Internal operations wiki & compliance audit logs
 */

export * from './staff/attendanceActions';
export * from './staff/leaveSalaryActions';
export * from './staff/shiftScheduleActions';
export * from './staff/dailyReportAnnouncementActions';
export * from './staff/workspaceCollabActions';
export * from './staff/wikiAuditActions';
