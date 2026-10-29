import { Link, type Href, usePathname } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const NAV_ITEMS: readonly { label: string; href: Href }[] = [
  { label: "Hub", href: "/" as Href },
  { label: "Daily", href: "/daily-challenges" as Href },
  { label: "Challenges", href: "/challenges" as Href },
  { label: "Family", href: "/family" as Href },
  { label: "Evidence", href: "/evidence" as Href },
  { label: "Reports", href: "/reports" as Href },
];

export function AppBottomNav() {
  const pathname = usePathname() || "/";

  return (
    <View style={styles.bottomNav}>
      {NAV_ITEMS.map((item) => {
        const hrefStr = String(item.href);
        const active =
          hrefStr === "/"
            ? pathname === "/"
            : pathname === hrefStr || pathname.startsWith(`${hrefStr}/`);

        return (
          <Link key={hrefStr} href={item.href} asChild>
            <TouchableOpacity
              style={[styles.navItem, active && styles.navItemActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.navText, active && styles.navTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          </Link>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
    paddingTop: 14,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: "#D5E6E2",
    marginTop: 12,
  },
  navItem: {
    flex: 1,
    minWidth: 72,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D5E6E2",
    alignItems: "center",
  },
  navItemActive: {
    backgroundColor: "#007C7A",
    borderColor: "#007C7A",
  },
  navText: {
    color: "#113C3D",
    fontSize: 12,
    fontWeight: "800",
  },
  navTextActive: {
    color: "#FFFFFF",
  },
});
