import {
  House, ScanLine, Split, WalletCards, History, Users, SlidersHorizontal, Sparkles, Upload, Check, X,
  Plus, Copy, ArrowRight, TriangleAlert, RefreshCw, Menu, Search, Trash2, Pencil, ChevronDown, Info,
  Receipt, Send, CircleCheck, Ellipsis, ExternalLink, LoaderCircle, ImageUp, Bell, RotateCcw, Undo2,
} from 'lucide-react';

const MAP = {
  House, ScanLine, Split, WalletCards, History, Users, SlidersHorizontal, Sparkles, Upload, Check, X,
  Plus, Copy, ArrowRight, TriangleAlert, RefreshCw, Menu, Search, Trash2, Pencil, ChevronDown, Info,
  Receipt, Send, CircleCheck, Ellipsis, ExternalLink, LoaderCircle, ImageUp, Bell, RotateCcw, Undo2,
};

export default function Icon({ name, size = 20, className = '', ...rest }) {
  const C = MAP[name];
  if (!C) return null;
  return <C size={size} strokeWidth={1.75} className={className} aria-hidden="true" focusable="false" {...rest} />;
}
