
import React, { ReactNode } from "react";
import {
  ConfigProvider,
  Dropdown,
  theme as themeMode,
  Button,
} from "antd";
import { Moon, Sun, LaptopMinimal } from "lucide-react";
import type { MenuProps } from "antd";
import { Theme, useTheme } from "../context/ThemeContext";

interface ThemeSelectorProps {
  children: ReactNode;
}

const items: MenuProps["items"] = [
  {
    label: "Light",
    key: "light",
    icon: (
      <Sun className="h-[1.2rem] w-[1.2rem] " />
    ),
  },
  {
    label: "Dark",
    key: "dark",
    icon: (
      <Moon className="h-[1.2rem] w-[1.2rem]" />
    ),
  },
  {
    label: "System",
    key: "system",
    icon: (
      <LaptopMinimal className="h-[1.2rem] w-[1.2rem]" />
    ),
  },
];

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ children }) => {
  const { theme, setTheme } = useTheme();

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    setTheme(key as Theme);
  };

  const getLabel = () => {
    const item = items.find((i) => i?.key === theme);
    // @ts-ignore
    return item?.label;
  };
  const menuProps = {
    items,
    onClick: handleMenuClick,
  };
  const getIcon = () => {
    switch (theme) {
      case "dark":
        return (
          <Moon className="h-[1.2rem] w-[1.2rem]" />
        );

      case "light":
        return (
          <Sun className="h-[1.2rem] w-[1.2rem]" />
        );

      default:
        return (
          <LaptopMinimal className="h-[1.2rem] w-[1.2rem]" />
        );
    }
  };
  return (
    <ConfigProvider
      theme={{
        algorithm:
          theme === "dark"
            ? themeMode.darkAlgorithm
            : themeMode.compactAlgorithm,
      }}
    >
      <div className="flex justify-between items-center py-3 border-b-2">
        <h1 className="text-2xl font-bold">Website Assistant</h1>
        <Dropdown menu={menuProps}>
          <Button
            style={{ width: 120 }}
            className="inline-flex items-center justify-center space-x-4"
          >
            <div>{getLabel()}</div>
            <div>{getIcon()}</div>
          </Button>
        </Dropdown>
      </div>
      {children}
    </ConfigProvider>
  );
};

export default ThemeSelector;
