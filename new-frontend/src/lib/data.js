export const USERS_DEFAULT = [
  { u: "gaurav", p: "ceo123", name: "Gaurav Mathur", role: "COO", color: "#0e2a47" },
  { u: "nadia", p: "coo123", name: "Nadia", role: "CEO", color: "#7c3aed" },
  { u: "ruhith", p: "dig123", name: "Ruhith Pasha", role: "Developer", color: "#2e75b6" },
  { u: "nikhil", p: "mkt123", name: "Nikhil", role: "Marketing Manager", color: "#f59e0b" },
  { u: "fatima", p: "lab123", name: "Fatima", role: "SEO/Social Media Head", color: "#ef4444" },
  { u: "abhishek", p: "soc123", name: "Abhishek", role: "Social Media Creator", color: "#10b981" },
  { u: "maryam", p: "ops123", name: "Maryam", role: "GHL Expert", color: "#16a34a" },
  { u: "sona", p: "sdr123", name: "Sona", role: "SDR", color: "#3b82f6" },
  { u: "veena", p: "sdr123", name: "Veena", role: "SDR", color: "#5b9f61" },
  { u: "contractor1", p: "con123", name: "Contractor One", role: "General Outsourcer", color: "#94a3b8" },
];

export const BUSINESSES = [
  { name: "Ashford", emoji: "🦷", slug: "ashford", revenue: 125583, leads: 29, bookings: 8, adSpend: 1617, trend: 14.4, type: "practice" },
  { name: "Rochester", emoji: "🏛️", slug: "rochester", revenue: 58958, leads: 12, bookings: 5, adSpend: 2038, trend: -14.4, type: "practice" },
  { name: "Barnet", emoji: "🏗️", slug: "barnet", revenue: 110595, leads: 22, bookings: 11, adSpend: 2168, trend: -1.3, type: "practice" },
  { name: "Bexleyheath", emoji: "😊", slug: "bexleyheath", revenue: 118748, leads: 38, bookings: 8, adSpend: 1756, trend: -2.7, type: "practice" },
  { name: "Warwick Lodge", emoji: "🏡", slug: "warwick-lodge", revenue: 102785, leads: 35, bookings: 11, adSpend: 2439, trend: -13.8, type: "practice" },
  { name: "Rye Dental", emoji: "🐳", slug: "rye-dental", revenue: 94232, leads: 36, bookings: 6, adSpend: 2115, trend: -19.9, type: "practice" },
  { name: "Academy", emoji: "🐢", slug: "academy", revenue: 82025, leads: 35, bookings: 10, adSpend: 3434, trend: -9.2, type: "academy" },
  { name: "Lab", emoji: "🧪", slug: "lab", revenue: 73822, leads: 21, bookings: 8, adSpend: 2784, trend: -16.8, type: "lab" },
  { name: "Accounts", emoji: "📊", slug: "accounts", revenue: 118385, leads: 13, bookings: 8, adSpend: 2021, trend: -8.3, type: "service" },
];

export const DASHBOARD_KPIS = {
  revenue: { label: "Monthly Revenue", value: 889489, icon: "$", delta: 12.5, target: 1000000, borderColor: "#10b981" },
  leads: { label: "Leads Today", value: 20, icon: "people", delta: 8.3, subtitle: "117 this week", borderColor: "#14b8a6" },
  bookings: { label: "Bookings Today", value: 12, icon: "calendar", delta: null, subtitle: "38.5% conv.", extra: "47 this week", borderColor: "#14b8a6" },
  adSpend: { label: "Monthly Ad Spend", value: 18310, icon: "sparkle", delta: null, subtitle: "9.2x ROI", extra: "£598/day", borderColor: "#14b8a6" },
  tasks: { label: "Tasks Completed", value: "20/48", icon: "check", delta: null, subtitle: "2 overdue", borderColor: "#10b981" },
};

export const CRITICAL_ALERTS = [
  { title: "Low Leads Today", description: "Only 0 leads received. Target: 20+", business: "All Practices", time: "Now", severity: "danger" },
  { title: "Low Ad ROI", description: "Current ROI is 0.0x. Target: 8x+", business: "Marketing", time: "1h ago", severity: "warning" },
];

export const STORAGE_KEY = "gm_commandos_v1";
