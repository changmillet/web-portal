import "server-only";

import { readBrandConfig } from "@/config/brand";

export const brandConfig = readBrandConfig({
  ...process.env,
  PORTAL_BRAND: process.env.PORTAL_BRAND,
});
