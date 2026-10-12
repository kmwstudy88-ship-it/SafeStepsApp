import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Link, type Href, usePathname } from "expo-router";

import { launchRouteIsActive, PARENT_MOBILE_NAV_ITEMS } from "../lib/navigation/launchRoutes";
import { globalStyles } from "../lib/styles";

export function AppBottomNav() {
  const pathname = usePathname();

  return (
    <View style={globalStyles.bottomNav}>
      {PARENT_MOBILE_NAV_ITEMS.map((item) => {
        const active = launchRouteIsActive(pathname, item.href);

        return (
          <Link key={String(item.href)} href={item.href as Href} asChild>
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
