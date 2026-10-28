import { Bot, Flag, FolderUp, GitBranch, LayoutDashboard, Network, ShieldAlert, Target } from 'lucide-react';

export const NAV = [
  { group: 'Programme', items: [
    { to: '/app', label: 'Overview', icon: LayoutDashboard },
    { to: '/app/roadmap', label: 'Roadmap', icon: GitBranch },
    { to: '/app/functions', label: 'Functions', icon: Network },
    { to: '/app/gates', label: 'Stage gates', icon: Flag },
  ] },
  { group: 'Intelligence', items: [
    { to: '/app/evidence', label: 'Evidence vault', icon: FolderUp },
    { to: '/app/assistant', label: 'Ask Canopy', icon: Bot, tag: 'AI' },
  ] },
  { group: 'Governance', items: [
    { to: '/app/outcomes', label: 'Outcomes & KPIs', icon: Target },
    { to: '/app/risks', label: 'Risks & decisions', icon: ShieldAlert },
  ] },
];

export const NAV_FLAT = NAV.flatMap((g) => g.items);
