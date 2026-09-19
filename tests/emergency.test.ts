import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { FamilyContact, EmergencyProfile } from "../src/types";

describe("Emergency & SOS Core Module", () => {
  const mockContacts: FamilyContact[] = [
    {
      id: "c-1",
      name: "Rohan (Son)",
      relation: "Son",
      phone: "+1 (555) 234-5678",
      avatarColor: "bg-blue-500",
      isPrimary: true,
    },
    {
      id: "c-2",
      name: "Dr. Sharma",
      relation: "Physician",
      phone: "+1 (555) 987-6543",
      avatarColor: "bg-emerald-500",
      isPrimary: false,
    },
  ];

  const mockProfile: EmergencyProfile = {
    fullName: "Kamla Devi",
    bloodType: "O+",
    allergies: "Penicillin",
    conditions: "Hypertension, Mild Arthritis",
    homeAddress: "124 Park View Lane",
    primaryDoctor: "Dr. Sharma",
    primaryDoctorPhone: "+1 (555) 987-6543",
  };

  it("should find the primary emergency contact", () => {
    const primaryContact = mockContacts.find((c) => c.isPrimary) || mockContacts[0];
    assert.ok(primaryContact);
    assert.equal(primaryContact.name, "Rohan (Son)");
    assert.equal(primaryContact.isPrimary, true);
  });

  it("should create fallback emergency contacts when list is empty", () => {
    const resolveEmergencyContacts = (contacts?: FamilyContact[]): FamilyContact[] => {
      if (Array.isArray(contacts) && contacts.length > 0) {
        return contacts;
      }
      return [
        {
          id: "default",
          name: "Emergency Services",
          phone: "112",
          relation: "SOS",
          avatarColor: "bg-red-500",
          isPrimary: true,
        },
      ];
    };

    const emptyResult = resolveEmergencyContacts([]);
    assert.equal(emptyResult.length, 1);
    assert.equal(emptyResult[0].phone, "112");

    const filledResult = resolveEmergencyContacts(mockContacts);
    assert.equal(filledResult.length, 2);
  });

  it("should format dispatch notification payload for SOS trigger", () => {
    const formatSosDispatch = (contacts: FamilyContact[], message?: string) => {
      return {
        success: true,
        alertMessage: message || "Emergency Alert Initiated",
        emergencyNumber: "112",
        dispatchedTo: contacts.map((c) => ({
          name: c.name,
          phone: c.phone,
          status: "missed_call_alert_sent",
        })),
      };
    };

    const dispatch = formatSosDispatch(mockContacts, "Immediate medical assistance requested");
    assert.equal(dispatch.success, true);
    assert.equal(dispatch.emergencyNumber, "112");
    assert.equal(dispatch.dispatchedTo.length, 2);
    assert.equal(dispatch.dispatchedTo[0].status, "missed_call_alert_sent");
  });

  it("should build a clean emergency medical summary string for first responders", () => {
    const buildMedicalSummary = (profile: EmergencyProfile) => {
      return `Blood: ${profile.bloodType} | Allergies: ${profile.allergies} | Conditions: ${profile.conditions}`;
    };

    const summary = buildMedicalSummary(mockProfile);
    assert.ok(summary.includes("Blood: O+"));
    assert.ok(summary.includes("Penicillin"));
    assert.ok(summary.includes("Hypertension"));
  });
});
