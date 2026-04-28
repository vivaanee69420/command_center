import { useState, useMemo } from "react";
import Topbar from "@/components/layout/topbar";
import PageHeader from "@/components/shared/page-header";
import { cn, getInitials } from "@/lib/utils";
import {
  Search, Send, Archive, CheckCheck, Star, Clock,
  Bot, FileText, Mail, MailOpen, ChevronDown, ChevronUp, X
} from "lucide-react";

const PRACTICES = ["All Practices", "GM Dental - Luton", "GM Dental - Watford", "GM Dental - Harrow", "GM Dental - Wembley"];
const STATUS_FILTERS = ["All", "Unread", "Read", "Replied"];

const MESSAGES = [
  {
    id: 1, sender: "Emma Thompson", subject: "Enquiry about dental implants", practice: "GM Dental - Luton",
    preview: "Hi, I saw your advert online and I'm interested in getting dental implants...",
    body: "Hi, I saw your advert online and I'm interested in getting dental implants. I have a missing tooth on my upper left side and was wondering how much it would cost and what the process involves. Could someone call me back at a convenient time? My number is 07712 345678. Many thanks, Emma.",
    time: "9:14 AM", status: "Unread", priority: true,
  },
  {
    id: 2, sender: "John Kaur", subject: "Appointment request — Wednesday", practice: "GM Dental - Watford",
    preview: "Could I book an appointment for a check-up and clean this Wednesday...",
    body: "Hello, could I please book an appointment for a check-up and scale and polish this Wednesday afternoon? I'm a returning patient — my last visit was about 8 months ago. Anytime after 2pm would work for me. Please let me know if that's possible. Thanks, John.",
    time: "8:52 AM", status: "Unread", priority: false,
  },
  {
    id: 3, sender: "Maria Santos", subject: "Invisalign quote — how much?", practice: "GM Dental - Harrow",
    preview: "I've been thinking about getting Invisalign for about a year now...",
    body: "I've been thinking about getting Invisalign for about a year now. I have mild crowding on my bottom teeth and some spacing issues at the top. I'd love to know your pricing and whether a payment plan is available. I've had a quote elsewhere for £4,200 — would you be able to match that? Thanks, Maria.",
    time: "Yesterday", status: "Read", priority: true,
  },
  {
    id: 4, sender: "Daniel Obi", subject: "Complaint — waiting room experience", practice: "GM Dental - Luton",
    preview: "I visited your practice on Monday and I was quite disappointed...",
    body: "I visited your practice on Monday and I was quite disappointed with the experience. I waited over 45 minutes past my appointment time with no communication from staff. While the dentist was lovely, the front desk experience left a lot to be desired. I'd appreciate a response and perhaps a gesture of goodwill given the inconvenience. Regards, Daniel Obi.",
    time: "Yesterday", status: "Replied", priority: true,
  },
  {
    id: 5, sender: "Aisha Nwosu", subject: "New patient — family of 4", practice: "GM Dental - Wembley",
    preview: "We have recently moved to the area and are looking for a new dental practice...",
    body: "We have recently moved to the area and are looking for a new dental practice for our family of four — two adults and two children aged 6 and 9. Could you let me know if you are taking on new NHS patients, or alternatively what the private charges are? We would ideally like appointments on a Saturday if possible. Kind regards, Aisha.",
    time: "Yesterday", status: "Unread", priority: false,
  },
  {
    id: 6, sender: "Robert Chen", subject: "Teeth whitening — interested", practice: "GM Dental - Harrow",
    preview: "I'm looking to get my teeth whitened before my wedding in June...",
    body: "I'm looking to get my teeth whitened before my wedding in June. I've seen you offer both in-clinic and take-home options. Could you advise which would be better given I have about 8 weeks? Also, is there a difference in longevity between the two? I'd prefer a natural-looking result rather than very bright white. Cheers, Rob.",
    time: "Mon", status: "Read", priority: false,
  },
  {
    id: 7, sender: "Yasmin Hossain", subject: "Veneers consultation request", practice: "GM Dental - Luton",
    preview: "I'm interested in getting composite veneers on my front 4 teeth...",
    body: "I'm interested in getting composite veneers on my front 4 teeth. I have a chipped incisor from an old injury and would love to improve the overall appearance. I've been told I may need to replace them every 5–7 years — is that accurate? What's the approximate cost for 4 teeth? Thank you, Yasmin.",
    time: "Mon", status: "Replied", priority: false,
  },
  {
    id: 8, sender: "George Palmer", subject: "Emergency appointment needed", practice: "GM Dental - Watford",
    preview: "I'm in a lot of pain with a cracked tooth and need to be seen urgently...",
    body: "I'm in a lot of pain with what I think is a cracked tooth. It's been hurting on and off for two days but today it's become severe, especially with hot and cold. I'm not a registered patient but I'm desperately looking for an emergency slot. Can you see me today or tomorrow? My number is 07823 567890. Thank you, George.",
    time: "Mon", status: "Unread", priority: true,
  },
  {
    id: 9, sender: "Priya Malhotra", subject: "Finance options for implants?", practice: "GM Dental - Harrow",
    preview: "I was quoted £3,200 for a single implant — do you offer 0% finance?",
    body: "I was quoted £3,200 for a single implant at my consultation. I'd love to proceed but I can't pay in full upfront. Do you offer 0% or low-interest finance plans? How many months can I spread the cost over? I've heard some practices do 12 or even 24 months. Please advise. Kind regards, Priya.",
    time: "Sun", status: "Replied", priority: false,
  },
  {
    id: 10, sender: "Tim Ashford", subject: "Is your Watford branch still open Saturdays?", practice: "GM Dental - Watford",
    preview: "I used to come to your Watford branch and they had Saturday appointments...",
    body: "I used to come to your Watford branch and they had Saturday appointments available. I've since moved back to the area and would like to register again. Are Saturday appointments still available? If so, how do I register as a returning patient? Thanks, Tim.",
    time: "Sun", status: "Read", priority: false,
  },
  {
    id: 11, sender: "Chloe Barrett", subject: "Review of my recent treatment", practice: "GM Dental - Wembley",
    preview: "I wanted to share some positive feedback about my recent Invisalign journey...",
    body: "I wanted to share some positive feedback about my recent Invisalign journey at your Wembley practice. Dr Patel was fantastic throughout and the results are amazing. I'm so glad I went ahead with treatment. I've already recommended you to three friends! Is there a Google or Trustpilot page I can leave a review on? Best, Chloe.",
    time: "Sat", status: "Replied", priority: false,
  },
  {
    id: 12, sender: "Hassan Ali", subject: "All-on-4 consultation — travelling from Birmingham", practice: "GM Dental - Luton",
    preview: "I've been researching All-on-4 implants extensively and your practice came highly recommended...",
    body: "I've been researching All-on-4 implants extensively and your practice came highly recommended on a dental forum. I'm based in Birmingham but willing to travel for the right team. I currently have very few remaining upper teeth and have been struggling with dentures for years. Could I arrange a consultation? I'm free most Fridays. My budget is approximately £15,000–£18,000. Warm regards, Hassan Ali.",
    time: "Sat", status: "Unread", priority: true,
  },
];

const AUTO_REPLIES = [
  {
    id: 1, originalSender: "Emma Thompson", subject: "Re: Enquiry about dental implants",
    original: "Hi, I saw your advert online and I'm interested in getting dental implants...",
    aiReply: "Hi Emma, thank you so much for reaching out to GM Dental! We'd love to help you explore your implant options. A single dental implant at our Luton practice starts from £2,999, which includes your consultation, CT scan, and 10-year guarantee. We have availability this week for a free consultation — would Thursday or Friday work for you? Our team will give you a full breakdown of the process and answer all your questions. Please reply or call us on 01582 000000. Looking forward to hearing from you! Warm regards, GM Dental Team.",
    sentAt: "9:15 AM", confidence: 92,
  },
  {
    id: 2, originalSender: "John Kaur", subject: "Re: Appointment request — Wednesday",
    original: "Could I book an appointment for a check-up and clean this Wednesday...",
    aiReply: "Hi John, great to hear from you! We have availability on Wednesday at 2:30pm and 4:00pm for a check-up and scale and polish at our Watford practice. Both slots are with Dr Ahmed. Could you please confirm which time works best, and we'll get you booked in right away? If neither works, let us know your preferred times and we'll do our best to accommodate. See you soon! GM Dental Watford.",
    sentAt: "8:53 AM", confidence: 97,
  },
  {
    id: 3, originalSender: "Aisha Nwosu", subject: "Re: New patient — family of 4",
    original: "We have recently moved to the area and are looking for a new dental practice...",
    aiReply: "Hi Aisha, welcome to the area! We'd be delighted to register your whole family at GM Dental Wembley. We currently have limited NHS spaces but do have availability for private patients. For a family of four, our Family Check-Up Bundle is great value at £249 for two adults and up to two children under 12 — this covers full examinations and X-rays for everyone. We do offer Saturday appointments — currently every other Saturday. Shall I check availability for a family appointment? Just reply with your preferred dates. Warm regards, GM Dental.",
    sentAt: "Yesterday 3:22 PM", confidence: 88,
  },
];

const TEMPLATES = [
  {
    id: 1, name: "Appointment Confirmation",
    body: "Hi [Name], this is a confirmation of your appointment at [Practice] on [Date] at [Time] with [Dentist]. Please arrive 5 minutes early and bring your ID and any referral letters. If you need to reschedule, please call us at least 24 hours in advance. See you soon! GM Dental Team.",
  },
  {
    id: 2, name: "Price Inquiry Response",
    body: "Hi [Name], thank you for your enquiry about [Treatment]! At GM Dental, [Treatment] starts from [Price]. This includes [Inclusions]. We offer 0% finance over 12 months and payment plans available. Would you like to book a free consultation so we can give you an accurate quote tailored to your needs? Please reply or call [Phone]. Kind regards, GM Dental.",
  },
  {
    id: 3, name: "New Patient Welcome",
    body: "Hi [Name], welcome to GM Dental! We're thrilled to have you join our practice family. Your first appointment is on [Date] at [Time] at our [Location] practice. Please complete your new patient registration form here: [Link]. If you have any questions before your visit, don't hesitate to get in touch. We look forward to meeting you! Warm regards, GM Dental Team.",
  },
  {
    id: 4, name: "Follow-Up After Consultation",
    body: "Hi [Name], it was great meeting you at your consultation on [Date]! I just wanted to follow up to see if you had any further questions about the [Treatment] we discussed. We have a few appointment slots opening up next week if you'd like to proceed. Remember, our finance options mean you can spread the cost over [X] months with no interest. Looking forward to helping you achieve your smile goals! GM Dental.",
  },
  {
    id: 5, name: "Review Request",
    body: "Hi [Name], we hope you're loving your new smile! We'd be incredibly grateful if you could spare two minutes to leave us a review — it really helps other patients find us. You can leave a Google review here: [Google Link] or on Trustpilot here: [Trustpilot Link]. As a thank you, we'll add a complimentary tooth polish to your next visit. Thank you so much! GM Dental Team.",
  },
];

export default function ManusInboxPage() {
  const [activeTab, setActiveTab] = useState("inbox");
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [expandedMsg, setExpandedMsg] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [search, setSearch] = useState("");
  const [practiceFilter, setPracticeFilter] = useState("All Practices");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateEdits, setTemplateEdits] = useState({});

  const unread = MESSAGES.filter((m) => m.status === "Unread").length;
  const repliedToday = MESSAGES.filter((m) => m.status === "Replied" && (m.time.includes("AM") || m.time.includes("PM"))).length;

  const KPI = [
    { label: "Unread Messages", value: unread, color: "#ef4444" },
    { label: "Replied Today", value: repliedToday, color: "#10b981" },
    { label: "Avg Response Time", value: "4m 12s", color: "#7c3aed" },
    { label: "Auto-Replies Sent", value: AUTO_REPLIES.length, color: "#3b82f6" },
  ];

  const filtered = useMemo(() => MESSAGES.filter((m) => {
    const matchSearch = !search || m.sender.toLowerCase().includes(search.toLowerCase()) || m.subject.toLowerCase().includes(search.toLowerCase());
    const matchPractice = practiceFilter === "All Practices" || m.practice === practiceFilter;
    const matchStatus = statusFilter === "All" || m.status === statusFilter;
    return matchSearch && matchPractice && matchStatus;
  }), [search, practiceFilter, statusFilter]);

  const TABS = [
    { key: "inbox", label: "Inbox", count: MESSAGES.length },
    { key: "sent", label: "Sent", count: MESSAGES.filter(m => m.status === "Replied").length },
    { key: "auto", label: "Auto-Replies", count: AUTO_REPLIES.length },
    { key: "templates", label: "Templates", count: TEMPLATES.length },
  ];

  const STATUS_STYLE = {
    Unread: "bg-red-50 text-red-600",
    Read: "bg-slate-100 text-slate-500",
    Replied: "bg-green-50 text-green-600",
  };

  return (
    <>
      <Topbar title="Manus Inbox" />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <PageHeader
          icon="📬"
          title="Manus Inbox"
          subtitle="AI-powered message centre — patient enquiries, replies, templates"
        />

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {KPI.map((k) => (
            <div key={k.label} className="bg-white border border-line rounded-xl p-4" style={{ borderTopWidth: 3, borderTopColor: k.color }}>
              <div className="text-2xl font-bold text-ink mb-0.5">{k.value}</div>
              <div className="text-[11px] font-medium text-muted">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-bg-shell rounded-lg p-1 mb-4 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5",
                activeTab === tab.key ? "bg-primary text-white" : "text-muted hover:text-ink"
              )}
            >
              {tab.label}
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                activeTab === tab.key ? "bg-white/20 text-white" : "bg-line text-muted")}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Inbox Tab */}
        {(activeTab === "inbox" || activeTab === "sent") && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="flex items-center gap-2 border border-line rounded-lg px-3 py-1.5 bg-white w-56">
                <Search size={13} className="text-muted shrink-0" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 border-0 bg-transparent text-xs outline-none placeholder:text-muted"
                />
              </div>
              <select value={practiceFilter} onChange={(e) => setPracticeFilter(e.target.value)}
                className="border border-line rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-primary bg-white">
                {PRACTICES.map((p) => <option key={p}>{p}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-line rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-primary bg-white">
                {STATUS_FILTERS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              {filtered
                .filter((m) => activeTab === "sent" ? m.status === "Replied" : true)
                .map((msg) => {
                  const isExpanded = expandedMsg === msg.id;
                  return (
                    <div key={msg.id} className={cn("bg-white border rounded-xl overflow-hidden transition",
                      msg.status === "Unread" ? "border-primary/30" : "border-line",
                      isExpanded ? "shadow-sm" : "hover:shadow-sm cursor-pointer"
                    )}>
                      {/* Row */}
                      <div className="flex items-start gap-3 p-4" onClick={() => setExpandedMsg(isExpanded ? null : msg.id)}>
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-primary-soft text-primary text-xs font-bold flex items-center justify-center shrink-0">
                          {getInitials(msg.sender)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className={cn("text-sm font-semibold text-ink", msg.status === "Unread" && "font-bold")}>
                              {msg.sender}
                            </span>
                            {msg.priority && <Star size={11} className="text-amber-400 fill-amber-400" />}
                            <span className="text-[10px] bg-bg-shell text-muted px-2 py-0.5 rounded-full">{msg.practice}</span>
                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto", STATUS_STYLE[msg.status])}>
                              {msg.status}
                            </span>
                          </div>
                          <div className={cn("text-xs text-ink mb-0.5", msg.status === "Unread" && "font-semibold")}>{msg.subject}</div>
                          <div className="text-xs text-muted truncate">{msg.preview}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-[10px] text-muted whitespace-nowrap">{msg.time}</span>
                          {isExpanded ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
                        </div>
                      </div>

                      {/* Expanded */}
                      {isExpanded && (
                        <div className="border-t border-line px-4 pb-4 pt-3">
                          <p className="text-xs text-ink leading-relaxed mb-4 bg-bg-soft rounded-lg p-3">{msg.body}</p>
                          <div className="flex gap-2 mb-3">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-bg-soft text-muted hover:text-ink border border-line transition">
                              <CheckCheck size={12} /> Mark as Read
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-bg-soft text-muted hover:text-ink border border-line transition">
                              <Archive size={12} /> Archive
                            </button>
                          </div>
                          <div className="border border-line rounded-lg overflow-hidden">
                            <textarea
                              rows={3}
                              placeholder="Type your reply..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs outline-none resize-none text-ink placeholder:text-muted"
                            />
                            <div className="flex items-center justify-between px-3 py-2 border-t border-line bg-bg-soft">
                              <span className="text-[10px] text-muted">Replying to {msg.sender}</span>
                              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition">
                                <Send size={11} /> Send Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Auto-Replies Tab */}
        {activeTab === "auto" && (
          <div className="space-y-4">
            {AUTO_REPLIES.map((ar) => (
              <div key={ar.id} className="bg-white border border-line rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-line bg-bg-soft">
                  <div className="flex items-center gap-2">
                    <Bot size={14} className="text-primary" />
                    <span className="text-xs font-bold text-ink">{ar.subject}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] bg-green-50 text-green-600 font-bold px-2 py-0.5 rounded-full">
                      {ar.confidence}% confidence
                    </span>
                    <span className="text-[10px] text-muted">{ar.sentAt}</span>
                  </div>
                </div>
                <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Mail size={11} /> Original from {ar.originalSender}
                    </p>
                    <p className="text-xs text-muted bg-bg-soft rounded-lg p-3 leading-relaxed">{ar.original}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Bot size={11} /> AI Auto-Reply Sent
                    </p>
                    <p className="text-xs text-ink bg-primary-soft rounded-lg p-3 leading-relaxed">{ar.aiReply}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === "templates" && (
          <div className="space-y-3">
            {TEMPLATES.map((tpl) => {
              const isEditing = editingTemplate === tpl.id;
              const currentBody = templateEdits[tpl.id] ?? tpl.body;
              return (
                <div key={tpl.id} className="bg-white border border-line rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-line">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-muted" />
                      <span className="text-sm font-bold text-ink">{tpl.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (isEditing) setEditingTemplate(null);
                          else setEditingTemplate(tpl.id);
                        }}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        {isEditing ? "Done" : "Edit"}
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    {isEditing ? (
                      <textarea
                        rows={5}
                        value={currentBody}
                        onChange={(e) => setTemplateEdits((prev) => ({ ...prev, [tpl.id]: e.target.value }))}
                        className="w-full border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-primary transition resize-none"
                      />
                    ) : (
                      <p className="text-xs text-muted leading-relaxed">{currentBody}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
