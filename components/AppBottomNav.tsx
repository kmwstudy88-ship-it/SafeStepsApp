import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Link, type Href, usePathname } from "expo-router";

import { globalStyles } from "../lib/styles";

const NAV_ITEMS = [
  { label: "Home", href: "/dashboard" },
  { label: "Programs", href: "/programs" },
  { label: "Lessons", href: "/lessons" },
  { label: "Library", href: "/library" },
  { label: "Resources", href: "/resources" },
  { label: "Tasks", href: "/tasks" },
  { label: "Check-in", href: "/check-in" },
  { label: "Daily evidence", href: "/daily-evidence" },
  { label: "Evidence", href: "/evidence" },
  { label: "Bulk setup", href: "/bulk-setup" },
  { label: "Timeline", href: "/timeline" },
  { label: "Facilitator", href: "/facilitator" },
  { label: "Reports", href: "/reports" },
] as const;

export function AppBottomNav() {
  const pathname = usePathname();

  return (
    <View style={globalStyles.bottomNav}>
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link key={item.href} href={item.href as Href} asChild>
            <TouchableOpacity style={active ? globalStyles.bottomNavItemActive : globalStyles.bottomNavItem}>
              <Text style={active ? globalStyles.bottomNavTextActive : globalStyles.bottomNavText}>
                {item.label}
              </Text>
            </TouchableOpacity>
          </Link>
        );
      })}
    </View>
  );
}
