import {
  AlertOctagon, BadgeCheck, Bell, BookOpen, Bot, Boxes, Building2, CalendarClock, ChevronRight,
  CircleDot, ClipboardList, Clock, Code, Cog, Database, FileSignature, FileText, Fingerprint,
  FolderKanban, FolderTree, GitBranch, GitCompare, Globe, Inbox, KeyRound, Layers, LayoutTemplate,
  Lightbulb, ListChecks, Lock, Mail, MapPin, Megaphone, MessageSquareQuote, MessagesSquare,
  MonitorDown, MonitorSmartphone, MonitorUp, Network, Package, Palette, Plug, Radar, Radio, RefreshCcw,
  Rocket, Router, Scale, ScanLine, Settings2, Shapes, ShieldAlert, ShieldCheck, ShoppingCart,
  SlidersHorizontal, Sparkles, Ticket, Timer, TriangleAlert, Truck, UserCheck, Users, UsersRound,
  Workflow, Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* Icon registry for the Admin module. adminData.ts stores icons as strings so the IA stays plain
 * data; this resolves them. Anything unmapped falls back to a generic settings glyph rather than
 * rendering nothing. */

const ICONS: Record<string, LucideIcon> = {
  AlertOctagon, BadgeCheck, Bell, BookOpen, Bot, Boxes, Building2, CalendarClock, ChevronRight,
  CircleDot, ClipboardList, Clock, Code, Cog, Database, FileSignature, FileText, Fingerprint,
  FolderKanban, FolderTree, GitBranch, GitCompare, Globe, Inbox, KeyRound, Layers, LayoutTemplate,
  Lightbulb, ListChecks, Lock, Mail, MapPin, Megaphone, MessageSquareQuote, MessagesSquare,
  MonitorDown, MonitorSmartphone, MonitorUp, Network, Package, Palette, Plug, Radar, Radio, RefreshCcw,
  Rocket, Router, Scale, ScanLine, Settings2, Shapes, ShieldAlert, ShieldCheck, ShoppingCart,
  SlidersHorizontal, Sparkles, Ticket, Timer, TriangleAlert, Truck, UserCheck, Users, UsersRound,
  Workflow, Zap,
};

export const adminIcon = (name: string): LucideIcon => ICONS[name] ?? Settings2;
