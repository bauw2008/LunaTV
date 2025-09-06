/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { Box, Cat, Clover, Film, Home, Radio, Search, Star, Tv } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface MobileBottomNavProps {
  /**
   * 主动指定当前激活的路径。当未提供时，自动使用 usePathname() 获取的路径。
   */
  activePath?: string;
}

const MobileBottomNav = ({ activePath }: MobileBottomNavProps) => {
  const pathname = usePathname();
  const router = useRouter();
  // 当前激活路径：优先使用传入的 activePath，否则回退到浏览器地址
  const currentActive = activePath ?? pathname;

  // 获取菜单配置
  const [menuConfig, setMenuConfig] = useState({
    showMovies: true,
    showTVShows: true,
    showAnime: true,
    showVariety: true,
    showLive: false,
    showTvbox: false,
  });

  useEffect(() => {
    const runtimeConfig = (window as any).RUNTIME_CONFIG;
    if (runtimeConfig?.MenuSettings) {
      setMenuConfig({
        showMovies: runtimeConfig.MenuSettings.showMovies ?? true,
        showTVShows: runtimeConfig.MenuSettings.showTVShows ?? true,
        showAnime: runtimeConfig.MenuSettings.showAnime ?? true,
        showVariety: runtimeConfig.MenuSettings.showVariety ?? true,
        showLive: runtimeConfig.MenuSettings.showLive ?? false,
        showTvbox: runtimeConfig.MenuSettings.showTvbox ?? false,
      });
    }
  }, []);

  // 导航项状态
  const [navItems, setNavItems] = useState<Array<{
    icon: any;
    label: string;
    href: string;
  }>>([
    { icon: Home, label: '首页', href: '/' },
    { icon: Search, label: '搜索', href: '/search' }
  ]);

  // 根据配置动态构建导航项
  useEffect(() => {
    const items: typeof navItems = [];

    if (menuConfig.showMovies) {
      items.push({
        icon: Film,
        label: '电影',
        href: '/douban?type=movie',
      });
    }

    if (menuConfig.showTVShows) {
      items.push({
        icon: Tv,
        label: '剧集',
        href: '/douban?type=tv',
      });
    }

    if (menuConfig.showAnime) {
      items.push({
        icon: Cat,
        label: '动漫',
        href: '/douban?type=anime',
      });
    }

    if (menuConfig.showVariety) {
      items.push({
        icon: Clover,
        label: '综艺',
        href: '/douban?type=show',
      });
    }

    if (menuConfig.showLive) {
      items.push({
        icon: Radio,
        label: '直播',
        href: '/live',
      });
    }

    if (menuConfig.showTvbox) {
      items.push({
        icon: Box,
        label: 'tvbox',
        href: '/tvbox',
      });
    }

    // 保留固定项（首页/搜索），动态项拼接在后
    setNavItems((prev) => {
      const fixed = prev.filter(
        (item) => item.href === '/' || item.href === '/search'
      );
      return [...fixed, ...items];
    });
  }, [menuConfig]);

  // 添加自定义分类（独立逻辑）
  useEffect(() => {
    const runtimeConfig = (window as any).RUNTIME_CONFIG;
    if (runtimeConfig?.CUSTOM_CATEGORIES?.length > 0) {
      setNavItems((prevItems) => {
        const exists = prevItems.some((i) => i.href === '/douban?type=custom');
        if (exists) return prevItems;
        return [
          ...prevItems,
          {
            icon: Star,
            label: '自定义',
            href: '/douban?type=custom',
          },
        ];
      });
    }
  }, []);

  const isActive = (href: string) => {
    const typeMatch = href.match(/type=([^&]+)/)?.[1];

    // 解码URL以进行正确的比较
    const decodedActive = decodeURIComponent(currentActive);
    const decodedItemHref = decodeURIComponent(href);

    return (
      decodedActive === decodedItemHref ||
      (decodedActive.startsWith('/douban') &&
        decodedActive.includes(`type=${typeMatch}`))
    );
  };

  return (
    <nav
      className='md:hidden fixed left-0 right-0 z-[600] bg-white/90 backdrop-blur-xl border-t border-gray-200/50 overflow-hidden dark:bg-gray-900/80 dark:border-gray-700/50'
      style={{
        /* 紧贴视口底部，同时在内部留出安全区高度 */
        bottom: 0,
        paddingBottom: 'env(safe-area-inset-bottom)',
        minHeight: 'calc(3.5rem + env(safe-area-inset-bottom))',
      }}
    >
      <ul className='flex items-center overflow-x-auto scrollbar-hide'>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <li
              key={item.href}
              className='flex-shrink-0'
              style={{ width: '20vw', minWidth: '20vw' }}
            >
              <Link
                href={item.href}
                className='flex flex-col items-center justify-center w-full h-14 gap-1 text-xs'
              >
                <item.icon
                  className={`h-6 w-6 ${active
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-400'
                    }`}
                />
                <span
                  className={
                    active
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-300'
                  }
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileBottomNav;

