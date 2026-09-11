export type PaystackCheckoutInput = {
  publicKey: string;
  email: string;
  amountKobo: number;
  reference: string;
  accessCode?: string;
  authorizationUrl: string;
  channels?: string[];
};

type PaystackHandler = {
  openIframe: () => void;
};

type PaystackPopApi = {
  setup: (options: {
    key: string;
    email: string;
    amount: number;
    ref: string;
    channels?: string[];
    callback: (response: { reference: string }) => void;
    onClose: () => void;
  }) => PaystackHandler;
};

declare global {
  interface Window {
    PaystackPop?: PaystackPopApi;
  }
}

function loadPaystackScript(): Promise<PaystackPopApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Paystack can only run in the browser"));
  }
  if (window.PaystackPop) return Promise.resolve(window.PaystackPop);

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-paystack="inline"]'
    );
    if (existing) {
      existing.addEventListener("load", () => {
        if (window.PaystackPop) resolve(window.PaystackPop);
        else reject(new Error("Paystack did not load"));
      });
      existing.addEventListener("error", () =>
        reject(new Error("Could not load Paystack"))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.dataset.paystack = "inline";
    script.onload = () => {
      if (window.PaystackPop) resolve(window.PaystackPop);
      else reject(new Error("Paystack did not load"));
    };
    script.onerror = () => reject(new Error("Could not load Paystack"));
    document.body.appendChild(script);
  });
}

export async function openPaystackCheckout(
  input: PaystackCheckoutInput
): Promise<{ reference: string }> {
  if (!input.publicKey) {
    window.location.href = input.authorizationUrl;
    return new Promise(() => undefined);
  }

  try {
    const PaystackPop = await loadPaystackScript();
    return await new Promise((resolve, reject) => {
      const handler = PaystackPop.setup({
        key: input.publicKey,
        email: input.email,
        amount: input.amountKobo,
        ref: input.reference,
        channels: input.channels,
        callback: (response) => resolve({ reference: response.reference }),
        onClose: () => reject(new Error("Checkout closed")),
      });
      handler.openIframe();
    });
  } catch (err) {
    if (err instanceof Error && err.message === "Checkout closed") throw err;
    window.location.href = input.authorizationUrl;
    return new Promise(() => undefined);
  }
}
