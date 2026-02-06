const { z } = require("zod");

const waitlistSchema = z.object({
  email: z.string().email().max(254),

  // Optional fields for segmentation (nice for traction evidence)
  role: z.string().max(30).optional(),     // pet_owner | vet | clinic
  petType: z.string().max(30).optional(),  // dog | cat | other
  location: z.string().max(120).optional(),

  // Optional tracking
  refSource: z.string().max(80).optional(),
  refCampaign: z.string().max(80).optional(),

  // Honeypot field: should always be empty
  website: z.string().max(0).optional(),
});

module.exports = { waitlistSchema };