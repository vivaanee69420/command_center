import { useState, useMemo } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import { cn, getInitials } from "@/lib/utils";
import {
  Plus, X, Search, Camera, Briefcase, Mail, FileText,
  Video, ThumbsUp, MessageCircle, Share2, Eye, Calendar, TrendingUp
} from "lucide-react";

const TABS = ["All Content", "Social Media", "Blog Posts", "Email Campaigns", "Videos"];

const PLATFORMS = ["Instagram", "Facebook", "LinkedIn", "Blog", "Email", "YouTube"];
const STATUSES = ["Draft", "In Review", "Approved", "Scheduled", "Published"];
const PRACTICES = ["All Practices", "GM Dental - Luton", "GM Dental - Watford", "GM Dental - Harrow", "GM Dental - Wembley"];

const PLATFORM_ICON = {
  Instagram: { icon: Camera, color: "#e1306c", bg: "bg-pink-50 text-pink-600" },
  Facebook: { icon: FileText, color: "#1877F2", bg: "bg-blue-50 text-blue-600" },
  LinkedIn: { icon: Briefcase, color: "#0A66C2", bg: "bg-blue-50 text-blue-600" },
  Blog: { icon: FileText, color: "#7c3aed", bg: "bg-purple-50 text-purple-600" },
  Email: { icon: Mail, color: "#10b981", bg: "bg-green-50 text-green-600" },
  YouTube: { icon: Video, color: "#FF0000", bg: "bg-red-50 text-red-600" },
};

const STATUS_STYLE = {
  Draft: "bg-slate-100 text-slate-500",
  "In Review": "bg-amber-50 text-amber-600",
  Approved: "bg-blue-50 text-blue-600",
  Scheduled: "bg-purple-50 text-purple-600",
  Published: "bg-green-50 text-green-600",
};

const CONTENT_ITEMS = [
  {
    id: 1, title: "5 Signs You Need a Dental Implant", type: "Blog Posts", platform: "Blog",
    status: "Published", author: "Priya Kapoor", practice: "GM Dental - Luton",
    createdDate: "24 Apr 2026", likes: 142, comments: 28, shares: 56, views: 3840,
  },
  {
    id: 2, title: "Before & After: Invisalign 6-Month Transformation", type: "Social Media", platform: "Instagram",
    status: "Published", author: "Riya Shah", practice: "GM Dental - Harrow",
    createdDate: "22 Apr 2026", likes: 389, comments: 47, shares: 91, views: 12400,
  },
  {
    id: 3, title: "April Newsletter — Spring Smile Offers", type: "Email Campaigns", platform: "Email",
    status: "Published", author: "Tom Brennan", practice: "GM Dental - Watford",
    createdDate: "21 Apr 2026", likes: 0, comments: 0, shares: 0, views: 4201,
  },
  {
    id: 4, title: "What is All-on-4? A Complete Guide", type: "Videos", platform: "YouTube",
    status: "Scheduled", author: "Priya Kapoor", practice: "GM Dental - Luton",
    createdDate: "20 Apr 2026", likes: 0, comments: 0, shares: 0, views: 0,
    scheduledFor: "30 Apr 2026",
  },
  {
    id: 5, title: "Why Choose a BACD-Accredited Practice", type: "Blog Posts", platform: "Blog",
    status: "In Review", author: "Riya Shah", practice: "GM Dental - Harrow",
    createdDate: "19 Apr 2026", likes: 0, comments: 0, shares: 0, views: 0,
  },
  {
    id: 6, title: "Dental Anxiety: Our Gentle Approach", type: "Social Media", platform: "Facebook",
    status: "Published", author: "Tom Brennan", practice: "GM Dental - Wembley",
    createdDate: "18 Apr 2026", likes: 214, comments: 33, shares: 42, views: 7120,
  },
  {
    id: 7, title: "How to Finance Your Implant Treatment", type: "Blog Posts", platform: "Blog",
    status: "Approved", author: "Priya Kapoor", practice: "GM Dental - Luton",
    createdDate: "17 Apr 2026", likes: 0, comments: 0, shares: 0, views: 0,
  },
  {
    id: 8, title: "Patient Testimonial: Emma's Implant Journey", type: "Videos", platform: "YouTube",
    status: "Published", author: "Riya Shah", practice: "GM Dental - Luton",
    createdDate: "15 Apr 2026", likes: 312, comments: 61, shares: 88, views: 18900,
  },
  {
    id: 9, title: "Teeth Whitening: In-Chair vs Take-Home", type: "Social Media", platform: "Instagram",
    status: "Draft", author: "Tom Brennan", practice: "GM Dental - Watford",
    createdDate: "14 Apr 2026", likes: 0, comments: 0, shares: 0, views: 0,
  },
  {
    id: 10, title: "Meet the Team: Dr Patel at Harrow", type: "Social Media", platform: "LinkedIn",
    status: "Published", author: "Priya Kapoor", practice: "GM Dental - Harrow",
    createdDate: "12 Apr 2026", likes: 98, comments: 15, shares: 22, views: 2890,
  },
  {
    id: 11, title: "May Newsletter — Implant Month", type: "Email Campaigns", platform: "Email",
    status: "Draft", author: "Tom Brennan", practice: "GM Dental - Luton",
    createdDate: "28 Apr 2026", likes: 0, comments: 0, shares: 0, views: 0,
  },
  {
    id: 12, title: "Composite Bonding — No Drill, No Needles", type: "Social Media", platform: "Instagram",
    status: "Scheduled", author: "Riya Shah", practice: "GM Dental - Wembley",
    createdDate: "27 Apr 2026", scheduledFor: "5 May 2026", likes: 0, comments: 0, shares: 0, views: 0,
  },
  {
    id: 13, title: "Practice Tour: New Luton Clinic Walkthrough", type: "Videos", platform: "YouTube",
    status: "Published", author: "Tom Brennan", practice: "GM Dental - Luton",
    createdDate: "10 Apr 2026", likes: 187, comments: 29, shares: 41, views: 9640,
  },
  {
    id: 14, title: "5 Questions to Ask Your Implant Dentist", type: "Blog Posts", platform: "Blog",
    status: "Published", author: "Priya Kapoor", practice: "GM Dental - Watford",
    createdDate: "8 Apr 2026", likes: 76, comments: 12, shares: 19, views: 2140,
  },
  {
    id: 15, title: "Instagram Reel: Smile Transformation Loop", type: "Social Media", platform: "Instagram",
    status: "In Review", author: "Riya Shah", practice: "GM Dental - Harrow",
    createdDate: "27 Apr 2026", likes: 0, comments: 0, shares: 0, views: 0,
  },
];

const TYPE_MAP = {
  "Social Media": ["Instagram", "Facebook", "LinkedIn"],
  "Blog Posts": ["Blog"],
  "Email Campaigns": ["Email"],
  "Videos": ["YouTube"],
};

const EMPTY_FORM = {
  title: "", type: "Social Media", platform: "Instagram",
  body: "", practice: "GM Dental - Luton", scheduleDate: "",
};

export default function ContentFactoryPage() {
  const [activeTab, setActiveTab] = useState("All Content");
  const [search, setSearch] = useState("");
  const [practiceFilter, setPracticeFilter] = useState("All Practices");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const KPI = useMemo(() => {
    const thisMonth = CONTENT_ITEMS;
    return [
      { label: "This Month", value: thisMonth.length, color: "#7c3aed" },
      { label: "Published", value: thisMonth.filter(c => c.status === "Published").length, color: "#10b981" },
      { label: "In Review", value: thisMonth.filter(c => c.status === "In Review").length, color: "#f59e0b" },
      { label: "Scheduled", value: thisMonth.filter(c => c.status === "Scheduled").length, color: "#3b82f6" },
    ];
  }, []);

  const filtered = useMemo(() => CONTENT_ITEMS.filter((c) => {
    const matchTab = activeTab === "All Content" || c.type === activeTab;
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
    const matchPractice = practiceFilter === "All Practices" || c.practice === practiceFilter;
    return matchTab && matchSearch && matchPractice;
  }), [activeTab, search, practiceFilter]);

  const topPerforming = useMemo(() =>
    CONTENT_ITEMS
      .filter((c) => c.status === "Published" && c.views > 0)
      .sort((a, b) => b.views - a.views)
      .slice(0, 5),
    []);

  const PlatformIcon = ({ platform, size = 12 }) => {
    const cfg = PLATFORM_ICON[platform];
    if (!cfg) return null;
    const Icon = cfg.icon;
    return <Icon size={size} />;
  };

  return (
    <>
      <Topbar title="Content Factory" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <PageHeader
          icon="🎬"
          title="Content Factory"
          subtitle="Manage all marketing content — social, blog, email, video"
          actions={[
            { label: "+ Create Content", variant: "primary", onClick: () => setShowModal(true) },
          ]}
        />

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {KPI.map((k) => (
            <div key={k.label} className="bg-white border border-line rounded-xl p-4" style={{ borderLeftWidth: 3, borderLeftColor: k.color }}>
              <div className="text-2xl font-bold text-ink mb-0.5">{k.value}</div>
              <div className="text-[11px] font-medium text-muted">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs + Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-1 bg-bg-shell rounded-lg p-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-semibold transition whitespace-nowrap",
                  activeTab === tab ? "bg-primary text-white" : "text-muted hover:text-ink"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border border-line rounded-lg px-3 py-1.5 bg-white w-48">
              <Search size={13} className="text-muted shrink-0" />
              <input
                type="text"
                placeholder="Search content..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 border-0 bg-transparent text-xs outline-none placeholder:text-muted"
              />
            </div>
            <select value={practiceFilter} onChange={(e) => setPracticeFilter(e.target.value)}
              className="border border-line rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-primary bg-white">
              {PRACTICES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {filtered.length === 0 && (
            <div className="col-span-2 bg-white border border-line rounded-xl p-10 text-center text-sm text-muted">
              No content matches your filters.
            </div>
          )}
          {filtered.map((item) => {
            const platformCfg = PLATFORM_ICON[item.platform] || {};
            const PIcon = platformCfg.icon || FileText;
            return (
              <div key={item.id} className="bg-white border border-line rounded-xl overflow-hidden hover:shadow-sm transition">
                <div className="flex items-start gap-3 p-4">
                  {/* Platform icon */}
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", platformCfg.bg || "bg-bg-soft text-muted")}>
                    <PIcon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-sm font-semibold text-ink leading-snug">{item.title}</span>
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap", STATUS_STYLE[item.status])}>
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap text-[10px] text-muted">
                      <span className={cn("px-2 py-0.5 rounded-full font-semibold", platformCfg.bg || "bg-bg-soft text-muted")}>
                        {item.platform}
                      </span>
                      <span>{item.practice.replace("GM Dental - ", "")}</span>
                      <span>·</span>
                      <span>{item.createdDate}</span>
                      {item.scheduledFor && (
                        <span className="flex items-center gap-1 text-purple-600">
                          <Calendar size={9} /> Scheduled: {item.scheduledFor}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Engagement row */}
                <div className="flex items-center gap-4 px-4 py-2.5 border-t border-line bg-bg-soft">
                  {/* Author */}
                  <div className="flex items-center gap-1.5 mr-auto">
                    <div className="w-5 h-5 rounded-full bg-primary-soft text-primary text-[9px] font-bold flex items-center justify-center">
                      {getInitials(item.author)}
                    </div>
                    <span className="text-[10px] text-muted">{item.author}</span>
                  </div>
                  {item.status === "Published" && (
                    <>
                      <span className="flex items-center gap-1 text-[10px] text-muted">
                        <Eye size={11} /> {item.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-muted">
                        <ThumbsUp size={11} /> {item.likes}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-muted">
                        <MessageCircle size={11} /> {item.comments}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-muted">
                        <Share2 size={11} /> {item.shares}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Top Performing Content */}
        <div className="bg-white border border-line rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-line">
            <TrendingUp size={15} className="text-primary" />
            <h3 className="text-sm font-bold text-ink">Top Performing Content</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-bg-soft border-b border-line">
                <tr>
                  {["Content", "Platform", "Views", "Likes", "Comments", "Shares"].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold text-muted whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {topPerforming.map((item) => {
                  const cfg = PLATFORM_ICON[item.platform] || {};
                  const Icon = cfg.icon || FileText;
                  return (
                    <tr key={item.id} className="hover:bg-bg-soft transition">
                      <td className="px-4 py-3 font-semibold text-ink max-w-[240px]">
                        <div className="truncate">{item.title}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit", cfg.bg || "bg-bg-soft text-muted")}>
                          <Icon size={10} /> {item.platform}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-ink">{item.views.toLocaleString()}</td>
                      <td className="px-4 py-3 text-muted">{item.likes}</td>
                      <td className="px-4 py-3 text-muted">{item.comments}</td>
                      <td className="px-4 py-3 text-muted">{item.shares}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Content Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-line">
                <h2 className="text-sm font-bold text-ink">Create New Content</h2>
                <button onClick={() => setShowModal(false)} className="text-muted hover:text-ink"><X size={16} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1.5 block">Title</label>
                  <input type="text" placeholder="Content title..."
                    value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1.5 block">Type</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, platform: TYPE_MAP[e.target.value]?.[0] || "Blog" })}
                      className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary bg-white">
                      {["Social Media", "Blog Posts", "Email Campaigns", "Videos"].map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1.5 block">Platform</label>
                    <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}
                      className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary bg-white">
                      {(TYPE_MAP[form.type] || PLATFORMS).map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1.5 block">Body / Caption</label>
                  <textarea rows={4} placeholder="Write your content here..."
                    value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
                    className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1.5 block">Target Practice</label>
                    <select value={form.practice} onChange={(e) => setForm({ ...form, practice: e.target.value })}
                      className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary bg-white">
                      {PRACTICES.filter(p => p !== "All Practices").map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1.5 block">Schedule Date</label>
                    <input type="date" value={form.scheduleDate} onChange={(e) => setForm({ ...form, scheduleDate: e.target.value })}
                      className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 px-6 pb-6">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold border border-line text-muted hover:text-ink transition">
                  Cancel
                </button>
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition">
                  Save as Draft
                </button>
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-green-600 hover:bg-green-700 transition">
                  Submit for Review
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
