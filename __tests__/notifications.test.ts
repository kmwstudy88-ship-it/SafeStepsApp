import { unreadNotifications, type NotificationRecord } from "../lib/platform/notifications";

const notification: NotificationRecord = {
  id: "notification-1",
  user_id: "user-1",
  title: "Reminder",
  body: "Complete SafeSteps",
  notification_type: "reminder",
  due_at: null,
  read_at: null,
  related_table: null,
  related_id: null,
  created_at: "2026-06-30T00:00:00.000Z",
};

describe("notification helpers", () => {
  test("returns only unread notifications", () => {
    expect(
      unreadNotifications([
        notification,
        { ...notification, id: "notification-2", read_at: "2026-06-30T01:00:00.000Z" },
      ]),
    ).toEqual([notification]);
  });
});
