import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { Moon, Globe, Calendar, DollarSign, Bell, Lock, Shield, Smartphone, Users, UserPlus, FileText, Trash2, ChevronRight, LogOut, UserCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { getInitials, getAvatarColor } from '@/data/mockData';
import BottomSheet from '@/components/shared/BottomSheet';

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { addToast } = useUIStore();
  const [showChangePass, setShowChangePass] = useState(false);

  const initials = user ? getInitials(user.name) : 'U';
  const avatarColor = user ? getAvatarColor(user.name) : '#FBBD08';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settingsGroups: any[] = [
    {
      title: 'App Preferences',
      items: [
        { icon: Moon, label: 'Theme', control: 'select', value: 'Light' },
        { icon: Globe, label: 'Language', control: 'select', value: 'English' },
        { icon: Calendar, label: 'Date Format', control: 'select', value: 'DD/MM/YYYY' },
        { icon: DollarSign, label: 'Currency', control: 'select', value: 'INR' },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { icon: Bell, label: 'Push Notifications', control: 'toggle', value: true },
        { icon: Bell, label: 'Email Notifications', control: 'toggle', value: true },
        { icon: Smartphone, label: 'WhatsApp Notifications', control: 'toggle', value: false },
        { icon: Bell, label: 'Sound', control: 'toggle', value: true },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        { icon: Lock, label: 'Change Password', control: 'link', action: () => setShowChangePass(true) },
        { icon: Shield, label: 'Two-Factor Auth', control: 'badge', value: 'Disabled' },
        { icon: Shield, label: 'Login Activity', control: 'link', action: () => addToast({ type: 'info', message: 'Login Activity page coming soon' }) },
      ],
    },
    {
      title: 'Team Management',
      items: [
        { icon: Users, label: 'Manage Users', control: 'link' },
        { icon: UserPlus, label: 'Invite User', control: 'link' },
      ],
    },
    {
      title: 'Data',
      items: [
        { icon: FileText, label: 'Export Data', control: 'button' },
        { icon: Trash2, label: 'Delete Account', control: 'danger' },
      ],
    },
  ];

  return (
    <div className="page-container pt-4 pb-6">
      <h1 className="text-h1-mobile md:text-h1-desktop font-semibold mb-4">Settings</h1>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        onClick={() => navigate('/profile')}
        className="bg-card rounded-xl p-5 mb-5 cursor-pointer hover:bg-neutral-800 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full border-2 border-p13-yellow flex items-center justify-center text-foreground text-lg font-bold flex-shrink-0"
            style={{ backgroundColor: avatarColor }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-foreground text-lg font-semibold">{user?.name}</p>
            <span className="inline-block mt-0.5 px-2 py-0.5 bg-p13-yellow text-p13-black rounded-full text-[10px] font-semibold capitalize">
              {user?.role?.replace('_', ' ')}
            </span>
            <p className="text-muted-foreground text-xs mt-1">{user?.email}</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </div>
      </motion.div>

      {/* My Profile Quick Link */}
      <div className="bg-card rounded-xl shadow-xs border border-neutral-200/50 mb-4">
        <button onClick={() => navigate('/profile')} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-muted/50 transition-colors text-left">
          <div className="w-8 h-8 rounded-full bg-p13-yellow/10 flex items-center justify-center">
            <UserCircle size={16} className="text-p13-yellow" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">My Profile</p>
            <p className="text-[11px] text-muted-foreground">View and manage your profile</p>
          </div>
          <ChevronRight size={14} className="text-muted-foreground" />
        </button>
      </div>

      {/* Settings Groups */}
      {settingsGroups.map((group: any, gi: number) => (
        <motion.div key={group.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.05 }}
          className="bg-card rounded-xl shadow-xs border border-neutral-200/50 mb-4 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border/50">
            <h3 className="text-sm font-semibold">{group.title}</h3>
          </div>
          {group.items.map((item: any, ii: number) => (
            <div key={ii} className={`flex items-center gap-3 px-4 py-3 ${ii < group.items.length - 1 ? 'border-b border-border/50' : ''} hover:bg-muted/50 transition-colors`}>
              <item.icon size={16} className="text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm">{item.label}</p>
              </div>
              {item.control === 'select' && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">{item.value}</span>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </div>
              )}
              {item.control === 'toggle' && (
                <button className={`w-10 h-5 rounded-full transition-colors relative ${item.value ? 'bg-p13-yellow' : 'bg-neutral-300'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-card shadow transition-transform ${item.value ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              )}
              {item.control === 'link' && (
                <button onClick={item.action}><ChevronRight size={16} className="text-muted-foreground" /></button>
              )}
              {item.control === 'badge' && (
                <span className="text-[11px] px-2 py-0.5 bg-neutral-200 text-muted-foreground rounded-full">{item.value}</span>
              )}
              {item.control === 'button' && (
                <span className="text-xs text-blue-600 font-medium cursor-pointer">Export</span>
              )}
              {item.control === 'danger' && (
                <span className="text-xs text-red-500 font-medium cursor-pointer">Delete</span>
              )}
            </div>
          ))}
        </motion.div>
      ))}

      {/* About */}
      <div className="bg-card rounded-xl shadow-xs border border-neutral-200/50 mb-6">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-muted-foreground">Version</span>
            <span className="text-sm">v2.1.0</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-muted-foreground">Build</span>
            <span className="text-sm">2026.01.12</span>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button onClick={logout} className="w-full flex items-center justify-center gap-2 h-12 bg-red-50 text-red-600 rounded-xl text-sm font-medium mb-4">
        <LogOut size={16} /> Logout
      </button>

      {/* Change Password Sheet */}
      <BottomSheet isOpen={showChangePass} onClose={() => setShowChangePass(false)} title="Change Password">
        <div className="space-y-4 py-2">
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Current Password</label>
            <input type="password" className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm" placeholder="Current password" /></div>
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">New Password</label>
            <input type="password" className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm" placeholder="New password" /></div>
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Confirm Password</label>
            <input type="password" className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm" placeholder="Confirm password" /></div>
          <button onClick={() => { addToast({ type: 'success', message: 'Password updated!' }); setShowChangePass(false); }}
            className="w-full h-11 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold">Update Password</button>
        </div>
      </BottomSheet>
    </div>
  );
}
