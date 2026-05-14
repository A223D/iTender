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
        <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-[#07070E]">
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
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                  selected
                    ? "border-coral/40 bg-coral/[0.05]"
                    : "border-black/10 bg-white hover:border-black/20"
                }`}
              >
                <div
                  className={`h-4 w-4 shrink-0 rounded-full border-2 transition ${
                    selected ? "border-coral bg-coral" : "border-black/25"
                  }`}
                />
                <div>
                  <p className="text-sm font-semibold text-[#07070E]">{ct.label}</p>
                  <p className="text-xs text-black/45">{ct.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Compensation details */}
      <div>
        <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-[#07070E]">
          Compensation details{" "}
          <span className="font-normal normal-case text-black/35 tracking-normal">· Optional</span>
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
        <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-[#07070E]">
          Creators needed <span className="text-coral">*</span>
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
        <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-[#07070E]">
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
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#07070E]">
          Coupon code{" "}
          <span className="font-normal normal-case text-black/35 tracking-normal">· Optional</span>
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
            className="rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold text-[#07070E] transition hover:border-black/30 hover:bg-black/[0.03] disabled:opacity-40"
          >
            {coupon.status === "validating" ? "Checking…" : "Apply"}
          </button>
        </div>
        {coupon.status === "valid" ? (
          <p className="mt-2 text-sm font-semibold text-coral">
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
