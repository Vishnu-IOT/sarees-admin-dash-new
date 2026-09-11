const TONE_MAP = {
  active: "success",
  inactive: "neutral",
  discontinued: "danger",

  Pending: "warning",
  Confirmed: "info",
  Packed: "info",
  Shipped: "gold",
  Delivered: "success",
  Cancelled: "danger",
  Returned: "danger",

  Paid: "success",
  Failed: "danger",
  Refunded: "neutral",
};

export default function Badge({ value, label }) {
  const tone = TONE_MAP[value] || "neutral";

  return <span className={`badge badge-${tone}`}>{label || value}</span>;
}
