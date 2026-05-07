"use client";

import { DatePicker } from "@/components/ui/date-picker";
import { COMPENSATION_TYPES } from "@/lib/campaign-constants";
import { addDays } from "@/lib/dates";

export type CouponState =
  | { status: "idle" }
  | { status: "validating" }
  | { status: "valid"; discount: number }
  | { status: "invalid"; message: string };

export function Step3Fields({
  compensationType,
  compensationDetails,
  creatorsNeeded,
  deadline,
  couponInput,
  coupon,
  setField,
  onCouponInputChange,
  onApplyCoupon,
  onCreatorsNeededKeyDown,
}: {
  compensationType: string;
  compensationDetails: string;
  creatorsNeeded: string;
  deadline: string;
  couponInput: string;
  coupon: CouponState;
  setField: (key: "compensationType" | "compensationDetails" | "creatorsNeeded" | "deadline", value: string) => void;
  onCouponInputChange: (v: string) => void;
  onApplyCoupon: () => void;
  onCreatorsNeededKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Compensation type */}
      <div>
        <p className="mb-3 text-sm font-semibold text-ink">
          Compensation type <span className="text-coral">*</span>
        </p>
        <div className="space-y-2">
          {COMPENSATION_TYPES.map((ct) => {
            const selected = compensationType === ct.value;
            return (
              <button
                key={ct.value}
                type="button"
                onClick={() => setField("compensationType", ct.value)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                  selected ? "border-moss bg-moss/[0.04]" : "border-black/10 bg-white hover:border-black/20"
                }`}
              >
                <div className={`h-4 w-4 shrink-0 rounded-full border-2 transition ${selected ? "border-moss bg-moss" : "border-black/25"}`} />
                <div>
                  <p className="text-sm font-semibold text-ink">{ct.label}</p>
                  <p className="text-xs text-ink/45">{ct.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Compensation details */}
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-ink">
          Compensation details <span className="font-normal text-ink/35">· Optional</span>
        </span>
        <input
          type="text"
          value={compensationDetails}
          onChange={(e) => setField("compensationDetails", e.target.value)}
          placeholder="e.g. Free dinner for 2 + $100 cash"
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-moss"
        />
      </label>

      {/* Creators needed */}
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-ink">
          Creators needed <span className="text-coral">*</span>
        </span>
        <input
          type="number"
          min={1}
          value={creatorsNeeded}
          onChange={(e) => setField("creatorsNeeded", e.target.value)}
          onKeyDown={onCreatorsNeededKeyDown}
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-moss"
        />
      </label>

      {/* Deadline */}
      <div>
        <span className="mb-2 block text-sm font-semibold text-ink">
          Application deadline <span className="text-coral">*</span>
        </span>
        <DatePicker
          value={deadline}
          onChange={(v) => setField("deadline", v)}
          min={addDays(1)}
          max={addDays(180)}
          placeholder="Select a deadline"
        />
      </div>

      {/* Coupon code */}
      <div>
        <p className="mb-2 text-sm font-semibold text-ink">
          Coupon code <span className="font-normal text-ink/35">· Optional</span>
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={couponInput}
            onChange={(e) => onCouponInputChange(e.target.value)}
            placeholder="e.g. LAUNCH100"
            className="flex-1 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm uppercase tracking-wider text-ink outline-none transition placeholder:normal-case placeholder:tracking-normal placeholder:text-ink/35 focus:border-moss"
          />
          <button
            type="button"
            onClick={onApplyCoupon}
            disabled={coupon.status === "validating" || !couponInput.trim()}
            className="rounded-2xl border border-black/10 px-4 py-3 text-sm font-semibold text-ink transition hover:border-black/20 hover:bg-black/[0.03] disabled:opacity-40"
          >
            {coupon.status === "validating" ? "Checking…" : "Apply"}
          </button>
        </div>
        {coupon.status === "valid" ? (
          <p className="mt-2 text-sm font-semibold text-moss">
            {coupon.discount === 100
              ? "100% off — campaign will go live for free"
              : `${coupon.discount}% off — discount applied at checkout`}
          </p>
        ) : null}
        {coupon.status === "invalid" ? (
          <p className="mt-2 text-sm text-coral">{coupon.message}</p>
        ) : null}
      </div>
    </div>
  );
}
