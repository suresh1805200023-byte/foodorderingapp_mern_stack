import { useState } from "react";

export function couponHeadline(c) {
  if (c.type === "percent") {
    return `GET ${c.value}% OFF`;
  }
  return `GET FLAT ₹${c.value} OFF`;
}

export function couponDetailLine(c) {
  const parts = [];
  if (Number(c.minOrder) > 0) {
    parts.push(`Min. order value ₹${c.minOrder}`);
  }
  if (c.expiresAt) {
    parts.push(`Valid until ${new Date(c.expiresAt).toLocaleDateString()}`);
  }
  return parts.length ? parts.join(" · ") : "Use at checkout";
}

const CouponCard = ({ coupon, compact }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className={`flex flex-col rounded-2xl border border-gray-200 bg-white shadow-md shrink-0 ${
        compact ? "w-[260px] md:w-[280px]" : "w-full max-w-md"
      }`}
    >
      <div
        className={`rounded-t-2xl bg-gradient-to-br from-red-500 to-red-700 text-white flex items-center justify-center ${
          compact ? "h-28 text-lg font-bold px-3 text-center" : "h-36 text-xl font-bold px-4 text-center"
        }`}
      >
        {couponHeadline(coupon)}
      </div>
      <div className={`flex flex-col flex-1 ${compact ? "p-3" : "p-4"}`}>
        <p className={`text-gray-600 ${compact ? "text-sm" : "text-base"}`}>{couponDetailLine(coupon)}</p>
        <p className="mt-2 font-mono font-semibold text-gray-900">
          Code: <span className="text-red-600">{coupon.code}</span>
        </p>
        <div className="mt-auto pt-3">
          <button
            type="button"
            onClick={copyCode}
            className="w-full rounded-full bg-gray-900 text-white font-semibold py-2.5 hover:bg-gray-800 transition text-sm"
          >
            {copied ? "Copied!" : "Copy code"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CouponCard;
