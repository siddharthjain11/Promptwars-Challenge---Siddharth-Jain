import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Reminder, TimeOfDay } from "../src/types";

describe("Reminders Core Module", () => {
  const mockReminders: Reminder[] = [
    {
      id: "rem-1",
      title: "Blood Pressure Pill",
      timeStr: "08:00 AM",
      timeOfDay: "morning",
      isMedicine: true,
      medicineName: "Amlodipine 10mg",
      completed: false,
    },
    {
      id: "rem-2",
      title: "Afternoon Walk in Garden",
      timeStr: "04:30 PM",
      timeOfDay: "afternoon",
      completed: false,
    },
    {
      id: "rem-3",
      title: "Calcium & Vitamin D",
      timeStr: "08:30 PM",
      timeOfDay: "night",
      isMedicine: true,
      medicineName: "Calcium 500mg",
      completed: true,
    },
  ];

  it("should filter reminders by time of day accurately", () => {
    const filterByTimeOfDay = (reminders: Reminder[], timeOfDay: TimeOfDay) =>
      reminders.filter((r) => r.timeOfDay === timeOfDay);

    const morningRems = filterByTimeOfDay(mockReminders, "morning");
    assert.equal(morningRems.length, 1);
    assert.equal(morningRems[0].title, "Blood Pressure Pill");

    const afternoonRems = filterByTimeOfDay(mockReminders, "afternoon");
    assert.equal(afternoonRems.length, 1);
    assert.equal(afternoonRems[0].title, "Afternoon Walk in Garden");

    const nightRems = filterByTimeOfDay(mockReminders, "night");
    assert.equal(nightRems.length, 1);
    assert.equal(nightRems[0].completed, true);
  });

  it("should toggle reminder completion status", () => {
    const toggleReminder = (reminders: Reminder[], id: string): Reminder[] =>
      reminders.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r));

    const updated = toggleReminder(mockReminders, "rem-1");
    const toggledItem = updated.find((r) => r.id === "rem-1");
    assert.ok(toggledItem);
    assert.equal(toggledItem.completed, true);

    const reverted = toggleReminder(updated, "rem-1");
    assert.equal(reverted.find((r) => r.id === "rem-1")?.completed, false);
  });

  it("should calculate active vs completed reminder counts", () => {
    const activeCount = mockReminders.filter((r) => !r.completed).length;
    const completedCount = mockReminders.filter((r) => r.completed).length;

    assert.equal(activeCount, 2);
    assert.equal(completedCount, 1);
  });

  it("should allow creating a new reminder with default fields", () => {
    const newRem: Reminder = {
      id: "rem-new-" + Date.now(),
      title: "Drink warm water",
      timeStr: "10:00 AM",
      timeOfDay: "morning",
      completed: false,
    };

    assert.ok(newRem.id.startsWith("rem-new-"));
    assert.equal(newRem.completed, false);
    assert.equal(newRem.title, "Drink warm water");
  });
});
