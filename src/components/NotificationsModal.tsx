import React, { useState } from 'react';
import { AppNotification, ViewTab } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onSelectNotification: (notif: AppNotification) => void;
  onDismissNotification: (id: string) => void;
  onNavigateToTab: (tab: ViewTab) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onSelectNotification,
  onDismissNotification,
  onNavigateToTab,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'match' | 'claim_update' | 'evidence_request' | 'handover'>('all');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIconForType = (type: AppNotification['type']) => {
    switch (type) {
      case 'match':
        return { icon: 'auto_awesome', bg: 'bg-[#ffdbcf]', color: 'text-[#a23e18]' };
      case 'claim_update':
        return { icon: 'assignment', bg: 'bg-[#e0f2e6]', color: 'text-[#012d1d]' };
      case 'evidence_request':
        return { icon: 'contact_support', bg: 'bg-[#ffedd5]', color: 'text-[#c2410c]' };
      case 'handover':
        return { icon: 'verified', bg: 'bg-[#c1ecd4]', color: 'text-[#1b4332]' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#012d1d]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#d5e7da] animate-in fade-in zoom-in-95 flex flex-col gap-4 max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e0f2e6]">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#e6f8eb] text-[#012d1d] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">notifications</span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[19px] font-bold text-[#012d1d]">Campus Notifications</h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#a23e18] text-white">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-[12px] text-[#414844]">
                Alerts on AI matches, claim verifications, and property handovers.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#717973] hover:text-[#101f17] hover:bg-[#e0f2e6]"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Filter Pills & Mark All Read */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-nowrap">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg text-[12px] font-semibold transition-all ${
                filterType === 'all'
                  ? 'bg-[#012d1d] text-white'
                  : 'bg-[#e6f8eb] text-[#012d1d] hover:bg-[#dbede0]'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('match')}
              className={`px-3 py-1 rounded-lg text-[12px] font-semibold transition-all ${
                filterType === 'match'
                  ? 'bg-[#a23e18] text-white'
                  : 'bg-[#e6f8eb] text-[#012d1d] hover:bg-[#dbede0]'
              }`}
            >
              AI Matches
            </button>
            <button
              type="button"
              onClick={() => setFilterType('claim_update')}
              className={`px-3 py-1 rounded-lg text-[12px] font-semibold transition-all ${
                filterType === 'claim_update'
                  ? 'bg-[#012d1d] text-white'
                  : 'bg-[#e6f8eb] text-[#012d1d] hover:bg-[#dbede0]'
              }`}
            >
              Claims
            </button>
            <button
              type="button"
              onClick={() => setFilterType('handover')}
              className={`px-3 py-1 rounded-lg text-[12px] font-semibold transition-all ${
                filterType === 'handover'
                  ? 'bg-[#1b4332] text-white'
                  : 'bg-[#e6f8eb] text-[#012d1d] hover:bg-[#dbede0]'
              }`}
            >
              Handovers
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="text-[12px] font-bold text-[#a23e18] hover:underline shrink-0"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex flex-col gap-2.5 overflow-y-auto pr-1">
          {filteredNotifications.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-4xl text-[#717973]">notifications_off</span>
              <p className="text-[14px] text-[#414844] font-medium">No notifications in this category.</p>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const meta = getIconForType(n.type);
              return (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 relative ${
                    n.read
                      ? 'bg-white border-[#d5e7da]'
                      : 'bg-[#f4fcf6] border-[#c1ecd4] shadow-xs'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg ${meta.bg} ${meta.color} flex items-center justify-center shrink-0 mt-0.5`}
                  >
                    <span className="material-symbols-outlined text-xl">{meta.icon}</span>
                  </div>

                  <div className="flex flex-col flex-1 gap-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[13px] font-bold text-[#101f17] truncate">{n.title}</span>
                        {n.badgeLabel && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#dbede0] text-[#012d1d] shrink-0">
                            {n.badgeLabel}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#717973] shrink-0">{n.timeAgo}</span>
                    </div>

                    <p className="text-[12px] text-[#414844] leading-relaxed">{n.message}</p>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      {n.linkTab && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectNotification(n);
                            onNavigateToTab(n.linkTab!);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded bg-[#012d1d] text-white text-[11px] font-bold hover:bg-[#1b4332] transition-colors flex items-center gap-1"
                        >
                          <span>Open View</span>
                          <span className="material-symbols-outlined text-xs">arrow_forward</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDismissNotification(n.id)}
                        className="text-[11px] text-[#717973] hover:text-[#ba1a1a] font-medium"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#e0f2e6] flex items-center justify-between text-[12px] text-[#717973]">
          <span>Notifications delivered from Caldwell Campus Police &amp; Safety Hub</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-[#e0f2e6] text-[#012d1d] font-semibold hover:bg-[#d5e7da]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
