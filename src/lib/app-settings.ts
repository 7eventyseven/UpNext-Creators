export interface SubscriptionPlanSettings {
  name: string;
  price: number;
  description: string;
  features: string[];
}

export interface AppSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
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
  subscriptions: {
    free: {
      name: "Free",
      price: 0,
      description: "Get listed on UpNext Creators",
      features: [
        "Basic profile listing",
        "Service pricing on profile",
        "WhatsApp contact link",
        "Standard ranking position",
      ],
    },
    pro: {
      name: "Pro",
      price: 5000,
      description: "Boost your visibility and get discovered",
      features: [
        "Everything in Free",
        "Pro badge on profile",
        "Higher ranking priority",
        "Integrated chat access",
        "Featured in category lists",
        "Monthly analytics summary",
      ],
    },
    premium: {
      name: "Premium",
      price: 15000,
      description: "Top of the list, maximum exposure",
      features: [
        "Everything in Pro",
        "Top Creator badge",
        "#1 priority ranking",
        "Homepage featured spot",
        "Discount price highlighting",
        "Priority customer support",
        "Verified creator status",
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

  return {
    maintenanceMode:
      typeof incoming.maintenanceMode === "boolean"
        ? incoming.maintenanceMode
        : defaultAppSettings.maintenanceMode,
    maintenanceMessage:
      incoming.maintenanceMessage?.trim() ||
      defaultAppSettings.maintenanceMessage,
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

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
