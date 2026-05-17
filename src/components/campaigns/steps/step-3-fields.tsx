"use client";

import { DatePicker } from "@/components/ui/date-picker";
import { COMPENSATION_TYPES } from "@/lib/campaign-constants";
import { addDays } from "@/lib/dates";
import { Input } from "@/components/ui/input";

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
    <div className="space-y-7">
      {/* Compensation type */}
      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-[var(--color-text)]">
          Compensation type <span className="text-[var(--color-text-muted)]">*</span>
        </p>
        <div className="space-y-2">
          {COMPENSATION_TYPES.map((ct) => {
            const selected = compensationType === ct.value;
            return (
              <button
                key={ct.value}
                type="button"
                onClick={() => setField("compensationType", ct.value)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                  selected
                    ? "border-white/20 bg-white/[0.08]"
                    : "border-white/10 bg-white/[0.04] hover:border-white/20"
                }`}
              >
                <div
                  className={`h-4 w-4 shrink-0 rounded-full border-2 transition ${
                    selected ? "border-white bg-[var(--color-text)]" : "border-white/25"
                  }`}
                />
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">{ct.label}</p>
                  <p className="text-xs text-[var(--color-text-hint)]">{ct.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Compensation details */}
      <div>
        <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-[var(--color-text)]">
          Compensation details{" "}
          <span className="font-normal normal-case text-[var(--color-text-hint)] tracking-normal">Â· Optional</span>
        </span>
        <Input
          type="text"
          value={compensationDetails}
          onChange={(e) => setField("compensationDetails", e.target.value)}
          placeholder="e.g. Free dinner for 2 + $100 cash"
          className="py-3.5"
        />
      </div>

      {/* Creators needed */}
      <div>
        <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-[var(--color-text)]">
          Creators needed <span className="text-[var(--color-text-muted)]">*</span>
        </span>
        <Input
          type="number"
          min={1}
          value={creatorsNeeded}
          onChange={(e) => setField("creatorsNeeded", e.target.value)}
          onKeyDown={onCreatorsNeededKeyDown}
          className="py-3.5"
        />
      </div>

      {/* Deadline */}
      <div>
        <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-[var(--color-text)]">
          Application deadline <span className="text-[var(--color-text-muted)]">*</span>
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
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[var(--color-text)]">
          Coupon code{" "}
          <span className="font-normal normal-case text-[var(--color-text-hint)] tracking-normal">Â· Optional</span>
        </p>
        <div className="flex gap-2">
          <Input
            type="text"
            value={couponInput}
            onChange={(e) => onCouponInputChange(e.target.value)}
            placeholder="e.g. LAUNCH100"
            className="flex-1 py-3.5 uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal"
          />
          <button
            type="button"
            onClick={onApplyCoupon}
            disabled={coupon.status === "validating" || !couponInput.trim()}
            className="glass rounded-xl px-4 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:opacity-80 disabled:opacity-40"
          >
            {coupon.status === "validating" ? "Checkingâ€¦" : "Apply"}
          </button>
        </div>
        {coupon.status === "valid" ? (
          <p className="mt-2 text-sm font-semibold text-[var(--color-text-muted)]">
            {coupon.discount === 100
              ? "100% off â€” campaign will go live for free"
              : `${coupon.discount}% off â€” discount applied at checkout`}
          </p>
        ) : null}
        {coupon.status === "invalid" ? (
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">{coupon.message}</p>
        ) : null}
      </div>
    </div>
  );
}

