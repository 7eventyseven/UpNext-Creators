import type { Creator } from "@/types";

export function sortCreators(list: Creator[]): Creator[] {
  return [...list].sort((a, b) => {
    if (a.isSubscribed !== b.isSubscribed) return a.isSubscribed ? -1 : 1;
    if (a.subscriptionTier !== b.subscriptionTier) {
      const tierOrder = { premium: 0, pro: 1, free: 2 };
      return tierOrder[a.subscriptionTier] - tierOrder[b.subscriptionTier];
    }
    return a.rank - b.rank;
  });
}
