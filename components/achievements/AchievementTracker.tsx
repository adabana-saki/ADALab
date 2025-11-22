'use client';

import { useEffect } from 'react';
import { unlockAchievement, updateAchievementProgress, type Achievement } from '@/lib/achievements';

interface AchievementTrackerProps {
  onUnlock: (achievement: Achievement) => void;
}

export function AchievementTracker({ onUnlock }: AchievementTrackerProps) {
  // First visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      localStorage.setItem('hasVisited', 'true');
      const achievement = unlockAchievement('first-visit');
      if (achievement) onUnlock(achievement);
    }
  }, [onUnlock]);

  // Night owl (2AM - 5AM)
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 2 && hour < 5) {
      const achievement = unlockAchievement('night-owl');
      if (achievement) onUnlock(achievement);
    }
  }, [onUnlock]);

  // Konami code listener
  useEffect(() => {
    const handleKonamiUnlock = () => {
      const achievement = unlockAchievement('konami-master');
      if (achievement) onUnlock(achievement);
    };

    window.addEventListener('konami-unlocked', handleKonamiUnlock);
    return () => window.removeEventListener('konami-unlocked', handleKonamiUnlock);
  }, [onUnlock]);

  // Click counter
  useEffect(() => {
    let clickCount = 0;

    const handleClick = () => {
      clickCount++;
      const achievement = updateAchievementProgress('particle-clicker', clickCount);
      if (achievement) onUnlock(achievement);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [onUnlock]);

  // Scroll tracker
  useEffect(() => {
    let totalScrolled = 0;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      totalScrolled += Math.abs(currentScrollY - lastScrollY);
      lastScrollY = currentScrollY;

      const achievement = updateAchievementProgress('scroll-champion', Math.floor(totalScrolled));
      if (achievement) onUnlock(achievement);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [onUnlock]);

  // Section visitor tracker
  useEffect(() => {
    const visitedSections = new Set<string>();
    const sections = ['home', 'about', 'services', 'technologies', 'projects', 'process', 'testimonials', 'faq', 'contact'];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            if (sections.includes(sectionId)) {
              visitedSections.add(sectionId);
              const achievement = updateAchievementProgress('explorer', visitedSections.size);
              if (achievement) onUnlock(achievement);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [onUnlock]);

  // Speed demon (visit all sections within 10 seconds)
  useEffect(() => {
    const startTime = Date.now();
    const visitedSections = new Set<string>();
    const sections = ['home', 'about', 'services', 'technologies', 'projects', 'process', 'testimonials', 'faq', 'contact'];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            if (sections.includes(sectionId)) {
              visitedSections.add(sectionId);

              if (visitedSections.size === sections.length) {
                const elapsed = Date.now() - startTime;
                if (elapsed <= 10000) {
                  const achievement = unlockAchievement('speed-demon');
                  if (achievement) onUnlock(achievement);
                }
              }
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [onUnlock]);

  // Metrics watcher
  useEffect(() => {
    const handleMetricsOpen = () => {
      const achievement = unlockAchievement('metrics-watcher');
      if (achievement) onUnlock(achievement);
    };

    window.addEventListener('metrics-opened', handleMetricsOpen);
    return () => window.removeEventListener('metrics-opened', handleMetricsOpen);
  }, [onUnlock]);

  // Sound master
  useEffect(() => {
    let toggleCount = 0;

    const handleSoundToggle = () => {
      toggleCount++;
      const achievement = updateAchievementProgress('sound-master', toggleCount);
      if (achievement) onUnlock(achievement);
    };

    window.addEventListener('sound-toggled', handleSoundToggle);
    return () => window.removeEventListener('sound-toggled', handleSoundToggle);
  }, [onUnlock]);

  // Tech stack fan
  useEffect(() => {
    const hoveredTech = new Set<string>();
    const techElements = document.querySelectorAll('[data-tech-stack]');

    const handleMouseEnter = (e: Event) => {
      const techName = (e.target as HTMLElement).getAttribute('data-tech-stack');
      if (techName) {
        hoveredTech.add(techName);
        const achievement = updateAchievementProgress('tech-stack-fan', hoveredTech.size);
        if (achievement) onUnlock(achievement);
      }
    };

    techElements.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter);
    });

    return () => {
      techElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter);
      });
    };
  }, [onUnlock]);

  // Social butterfly
  useEffect(() => {
    const clickedSocial = new Set<string>();

    const handleSocialClick = (e: Event) => {
      const socialLink = (e.target as HTMLElement).closest('[data-social]');
      if (socialLink) {
        const platform = socialLink.getAttribute('data-social');
        if (platform) {
          clickedSocial.add(platform);
          const achievement = updateAchievementProgress('social-butterfly', clickedSocial.size);
          if (achievement) onUnlock(achievement);
        }
      }
    };

    document.addEventListener('click', handleSocialClick);
    return () => document.removeEventListener('click', handleSocialClick);
  }, [onUnlock]);

  // Form filler
  useEffect(() => {
    const handleFormSubmit = () => {
      const achievement = unlockAchievement('form-filler');
      if (achievement) onUnlock(achievement);
    };

    window.addEventListener('contact-form-submitted', handleFormSubmit);
    return () => window.removeEventListener('contact-form-submitted', handleFormSubmit);
  }, [onUnlock]);

  // Easter hunter (triple-click on logo)
  useEffect(() => {
    let clickCount = 0;
    let clickTimeout: NodeJS.Timeout;

    const handleLogoClick = (e: Event) => {
      const logo = (e.target as HTMLElement).closest('[data-easter-egg]');
      if (logo) {
        clickCount++;
        clearTimeout(clickTimeout);

        if (clickCount === 3) {
          const achievement = unlockAchievement('easter-hunter');
          if (achievement) onUnlock(achievement);
          clickCount = 0;
        } else {
          clickTimeout = setTimeout(() => {
            clickCount = 0;
          }, 500);
        }
      }
    };

    document.addEventListener('click', handleLogoClick);
    return () => {
      document.removeEventListener('click', handleLogoClick);
      clearTimeout(clickTimeout);
    };
  }, [onUnlock]);

  return null;
}
