'use client';

import { Info, Lightbulb, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

export type CalloutType = 'info' | 'tip' | 'warn' | 'warning' | 'alert' | 'danger' | 'success';

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

const calloutConfig: Record<
  CalloutType,
  {
    icon: typeof Info;
    bgColor: string;
    borderColor: string;
    iconColor: string;
    titleColor: string;
    defaultTitle: string;
  }
> = {
  info: {
    icon: Info,
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/50',
    iconColor: 'text-blue-400',
    titleColor: 'text-blue-300',
    defaultTitle: 'Info',
  },
  tip: {
    icon: Lightbulb,
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/50',
    iconColor: 'text-green-400',
    titleColor: 'text-green-300',
    defaultTitle: 'Tip',
  },
  warn: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/50',
    iconColor: 'text-yellow-400',
    titleColor: 'text-yellow-300',
    defaultTitle: 'Warning',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/50',
    iconColor: 'text-yellow-400',
    titleColor: 'text-yellow-300',
    defaultTitle: 'Warning',
  },
  alert: {
    icon: XCircle,
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/50',
    iconColor: 'text-red-400',
    titleColor: 'text-red-300',
    defaultTitle: 'Alert',
  },
  danger: {
    icon: XCircle,
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/50',
    iconColor: 'text-red-400',
    titleColor: 'text-red-300',
    defaultTitle: 'Danger',
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/50',
    iconColor: 'text-emerald-400',
    titleColor: 'text-emerald-300',
    defaultTitle: 'Success',
  },
};

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;
  const displayTitle = title || config.defaultTitle;

  return (
    <div
      className={`my-6 rounded-lg border-l-4 ${config.borderColor} ${config.bgColor} overflow-hidden`}
      role="note"
      aria-label={displayTitle}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Icon size={20} className={`${config.iconColor} flex-shrink-0 mt-0.5`} />
          <div className="flex-1 min-w-0">
            {title && (
              <p className={`font-semibold mb-2 ${config.titleColor}`}>
                {displayTitle}
              </p>
            )}
            <div className="text-gray-300 text-sm leading-relaxed prose-p:my-2 first:prose-p:mt-0 last:prose-p:mb-0">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// マークダウンからCalloutタイプを抽出するヘルパー
export function parseCalloutType(text: string): { type: CalloutType; title?: string } {
  // :::note info のパターン
  const match = text.match(/^(info|tip|warn|warning|alert|danger|success)(?:\s+(.+))?$/i);
  if (match) {
    return {
      type: match[1].toLowerCase() as CalloutType,
      title: match[2]?.trim(),
    };
  }
  // デフォルトはinfo
  return { type: 'info', title: text.trim() || undefined };
}
