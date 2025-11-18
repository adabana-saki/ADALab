'use client';

import { useEffect } from 'react';
import { trackEvent, trackCustomEvent } from '@/components/analytics/GoogleAnalytics';

export function useAnalytics() {
  // Track button clicks
  const trackButtonClick = (buttonName: string, section?: string) => {
    trackEvent('click', 'Button', `${section ? section + ' - ' : ''}${buttonName}`);
  };

  // Track form submissions
  const trackFormSubmit = (formName: string, success: boolean = true) => {
    trackEvent('submit', 'Form', formName, success ? 1 : 0);
  };

  // Track scroll depth
  const trackScrollDepth = (depth: number) => {
    trackEvent('scroll', 'Engagement', `${depth}%`, depth);
  };

  // Track section views
  const trackSectionView = (sectionName: string) => {
    trackCustomEvent('section_view', {
      section_name: sectionName,
    });
  };

  // Track achievement unlocks
  const trackAchievement = (achievementName: string) => {
    trackCustomEvent('achievement_unlock', {
      achievement_name: achievementName,
    });
  };

  // Track voice commands
  const trackVoiceCommand = (command: string) => {
    trackCustomEvent('voice_command', {
      command: command,
    });
  };

  // Track theme changes
  const trackThemeChange = (theme: string, colorScheme?: string) => {
    const eventParams: Record<string, string | number | boolean> = {
      theme: theme,
    };
    if (colorScheme) {
      eventParams.color_scheme = colorScheme;
    }
    trackCustomEvent('theme_change', eventParams);
  };

  // Track PWA install
  const trackPWAInstall = (method: string) => {
    trackCustomEvent('pwa_install', {
      method: method,
    });
  };

  // Track chatbot interactions
  const trackChatbotMessage = (userMessage: string) => {
    trackCustomEvent('chatbot_interaction', {
      message_length: userMessage.length,
    });
  };

  // Track time on page
  useEffect(() => {
    const startTime = Date.now();

    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      trackCustomEvent('time_on_page', {
        duration_seconds: timeSpent,
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Track scroll depth automatically
  useEffect(() => {
    const depths = [25, 50, 75, 100];
    const trackedDepths = new Set<number>();

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      for (const depth of depths) {
        if (scrollPercent >= depth && !trackedDepths.has(depth)) {
          trackedDepths.add(depth);
          trackScrollDepth(depth);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    trackButtonClick,
    trackFormSubmit,
    trackScrollDepth,
    trackSectionView,
    trackAchievement,
    trackVoiceCommand,
    trackThemeChange,
    trackPWAInstall,
    trackChatbotMessage,
  };
}
