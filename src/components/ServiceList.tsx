"use client";

import { Plus, Trash2, Tag } from "lucide-react";

export interface ServiceEntry {
  id: string;
  name: string;
  description: string;
  price: string;
  discountPrice: string;
  duration: string;
}

export const emptyService = (): ServiceEntry => ({
  id: `s-${Date.now()}`,
  name: "",
  description: "",
  price: "",
  discountPrice: "",
  duration: "",
});

const inputClass =
  "w-full rounded-lg border border-olive-200 bg-white px-3 py-2 text-sm text-olive-900 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200";

interface ServiceListProps {
  services: ServiceEntry[];
  onChange: (services: ServiceEntry[]) => void;
  maxServices?: number;
}

export function ServiceList({
  services,
  onChange,
  maxServices = 5,
}: ServiceListProps) {
  const addService = () => {
    if (services.length >= maxServices) return;
    onChange([...services, emptyService()]);
  };

  const updateService = (id: string, patch: Partial<ServiceEntry>) => {
    onChange(services.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const removeService = (id: string) => {
    onChange(services.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-olive-600">
          List what you offer and how much you charge (NGN)
        </p>
        {services.length < maxServices && (
          <button
            type="button"
            onClick={addService}
            className="inline-flex items-center gap-1 rounded-lg bg-olive-100 px-3 py-1.5 text-sm font-medium text-olive-700 hover:bg-olive-200"
          >
            <Plus size={14} />
            Add service
          </button>
        )}
      </div>

      {services.length === 0 ? (
        <button
          type="button"
          onClick={addService}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-olive-300 py-8 text-sm font-medium text-olive-600 hover:border-olive-500 hover:bg-olive-50"
        >
          <Tag size={18} />
          Add your first service & price
        </button>
      ) : (
        services.map((service, i) => (
          <div
            key={service.id}
            className="rounded-xl border border-olive-200 bg-white p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-olive-700">
                Service {i + 1}
              </p>
              <button
                type="button"
                onClick={() => removeService(service.id)}
                className="text-red-500 hover:text-red-700"
                aria-label="Remove service"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs text-olive-600">
                  Service name *
                </label>
                <input
                  className={inputClass}
                  value={service.name}
                  onChange={(e) =>
                    updateService(service.id, { name: e.target.value })
                  }
                  placeholder="e.g. Wedding Photography"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs text-olive-600">
                  Description *
                </label>
                <input
                  className={inputClass}
                  value={service.description}
                  onChange={(e) =>
                    updateService(service.id, { description: e.target.value })
                  }
                  placeholder="What's included in this service?"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-olive-600">
                  Price (NGN) *
                </label>
                <input
                  type="number"
                  className={inputClass}
                  value={service.price}
                  onChange={(e) =>
                    updateService(service.id, { price: e.target.value })
                  }
                  placeholder="50000"
                  min={0}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-olive-600">
                  Discount price (optional)
                </label>
                <input
                  type="number"
                  className={inputClass}
                  value={service.discountPrice}
                  onChange={(e) =>
                    updateService(service.id, { discountPrice: e.target.value })
                  }
                  placeholder="40000"
                  min={0}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-olive-600">
                  Duration *
                </label>
                <input
                  className={inputClass}
                  value={service.duration}
                  onChange={(e) =>
                    updateService(service.id, { duration: e.target.value })
                  }
                  placeholder="2 hours"
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export function parseServiceEntries(entries: ServiceEntry[]) {
  return entries
    .filter((s) => s.name.trim() && s.price && s.duration.trim())
    .map((s) => ({
      id: s.id,
      name: s.name.trim(),
      description: s.description.trim() || s.name.trim(),
      price: Number(s.price),
      discountPrice: s.discountPrice ? Number(s.discountPrice) : undefined,
      duration: s.duration.trim(),
    }))
    .filter((s) => s.price > 0);
}

export function serviceToEntry(service: {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  duration: string;
}): ServiceEntry {
  return {
    id: service.id,
    name: service.name,
    description: service.description,
    price: String(service.price),
    discountPrice: service.discountPrice ? String(service.discountPrice) : "",
    duration: service.duration,
  };
}
