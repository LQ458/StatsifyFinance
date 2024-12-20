import { createSharedPathnamesNavigation } from "next-intl/navigation";
import { locales } from "../middleware";

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales });
