const { z } = require("zod");

const Roles = z.enum(["pet_owner", "vet", "clinic"]);

const base = z.object({
  email: z.string().email(),
  role: Roles.optional().nullable(),
  petType: z.string().optional().nullable(),
  location: z.string().min(1).optional().nullable(),
  website: z.string().optional().nullable(),
  refSource: z.string().optional().nullable(),
  refCampaign: z.string().optional().nullable(),
});

const waitlistSchema = base.superRefine((data, ctx) => {
  // If role is pet_owner, petType must be provided
  if (data.role === "pet_owner" && (!data.petType || data.petType.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["petType"],
      message: "petType is required for pet owners",
    });
  }
});

module.exports = { waitlistSchema };