export interface SubscriptionPlanSettings {
  name: string;
  price: number;
  description: string;
  features: string[];
}

export interface AppSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  /** Share of each booking that stays with UpNext (client still pays the full service price). */
  bookingCommissionPercent: number;
  subscriptions: {
    free: SubscriptionPlanSettings;
    pro: SubscriptionPlanSettings;
    premium: SubscriptionPlanSettings;
  };
}

export const defaultAppSettings: AppSettings = {
  maintenanceMode: false,
  maintenanceMessage:
    "We're doing a bit of maintenance. Creator sign in and registration are temporarily unavailable. Please check back soon.",
  bookingCommissionPercent: 15,
  subscriptions: {
    free: {
      name: "Free",
      price: 0,
      description: "Get listed so clients can find you",
      features: [
        "Your own profile page",
        "Show your services and prices",
        "Clients can chat with you on WhatsApp",
        "Shown after paying creators in search",
      ],
    },
    pro: {
      name: "Pro",
      price: 5000,
      description: "Show up higher so more clients find you",
      features: [
        "Everything in Free",
        "Shown above Free creators when clients search",
        "A \"Pro\" badge on your profile",
        "See new client requests before Free creators",
      ],
    },
    premium: {
      name: "Premium",
      price: 15000,
      description: "Always at the top, so clients see you first",
      features: [
        "Everything in Pro",
        "Shown at the very top, above Pro and Free creators",
        "A \"Top Creator\" badge on your profile",
        "More likely to be picked when clients post a request",
      ],
    },
  },
};

export function mergeAppSettings(partial: unknown): AppSettings {
  const incoming =
    partial && typeof partial === "object"
      ? (partial as Partial<AppSettings>)
      : {};

  const mergePlan = (
    base: SubscriptionPlanSettings,
    patch?: Partial<SubscriptionPlanSettings>
  ): SubscriptionPlanSettings => ({
    ...base,
    ...patch,
    features:
      patch?.features && patch.features.length > 0
        ? patch.features
        : base.features,
  });

  const commission = Number(incoming.bookingCommissionPercent);
  return {
    maintenanceMode:
      typeof incoming.maintenanceMode === "boolean"
        ? incoming.maintenanceMode
        : defaultAppSettings.maintenanceMode,
    maintenanceMessage:
      incoming.maintenanceMessage?.trim() ||
      defaultAppSettings.maintenanceMessage,
    bookingCommissionPercent:
      Number.isFinite(commission)
        ? Math.min(50, Math.max(0, Math.round(commission)))
        : defaultAppSettings.bookingCommissionPercent,
    subscriptions: {
      free: mergePlan(
        defaultAppSettings.subscriptions.free,
        incoming.subscriptions?.free
      ),
      pro: mergePlan(
        defaultAppSettings.subscriptions.pro,
        incoming.subscriptions?.pro
      ),
      premium: mergePlan(
        defaultAppSettings.subscriptions.premium,
        incoming.subscriptions?.premium
      ),
    },
  };
}

export function splitBookingAmount(price: number, percent: number) {
  const commissionPercent = Math.min(50, Math.max(0, Math.round(percent)));
  const commission = Math.round((price * commissionPercent) / 100);
  const creatorPayout = Math.max(0, price - commission);
  return { commissionPercent, commission, creatorPayout };
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
