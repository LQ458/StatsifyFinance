import { DBconnect } from "@/libs/mongodb";
import { ProductEvent, type ProductEventName } from "@/models/product-event";

export async function recordProductEvent(
  event: ProductEventName,
  authenticated: boolean,
): Promise<boolean> {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    return false;
  }

  try {
    await DBconnect();
    await ProductEvent.create({ event, authenticated });
    return true;
  } catch {
    return false;
  }
}
