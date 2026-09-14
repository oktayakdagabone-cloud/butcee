import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

type NotificationType =
  | "success"
  | "error"
  | "warning"
  | "info";

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
};

type NotificationContextType = {
  showNotification: (
    type: NotificationType,
    title: string,
    message?: string
  ) => void;

  success: (
    title: string,
    message?: string
  ) => void;

  error: (
    title: string,
    message?: string
  ) => void;

  warning: (
    title: string,
    message?: string
  ) => void;

  info: (
    title: string,
    message?: string
  ) => void;
};

const NotificationContext =
  createContext<
    NotificationContextType | undefined
  >(undefined);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    notifications,
    setNotifications,
  ] = useState<NotificationItem[]>([]);

  const removeNotification =
    useCallback(
      (id: string) => {
        setNotifications(
          (current) =>
            current.filter(
              (item) =>
                item.id !== id
            )
        );
      },
      []
    );

  const showNotification =
    useCallback(
      (
        type: NotificationType,
        title: string,
        message?: string
      ) => {
        const id =
          `${Date.now()}-${Math.random()}`;

        const item: NotificationItem =
          {
            id,
            type,
            title,
            message,
          };

        setNotifications(
          (current) => [
            ...current,
            item,
          ]
        );

        setTimeout(() => {
          removeNotification(id);
        }, 3000);
      },
      [removeNotification]
    );

  const success =
    useCallback(
      (
        title: string,
        message?: string
      ) => {
        showNotification(
          "success",
          title,
          message
        );
      },
      [showNotification]
    );

  const error =
    useCallback(
      (
        title: string,
        message?: string
      ) => {
        showNotification(
          "error",
          title,
          message
        );
      },
      [showNotification]
    );

  const warning =
    useCallback(
      (
        title: string,
        message?: string
      ) => {
        showNotification(
          "warning",
          title,
          message
        );
      },
      [showNotification]
    );

  const info =
    useCallback(
      (
        title: string,
        message?: string
      ) => {
        showNotification(
          "info",
          title,
          message
        );
      },
      [showNotification]
    );

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}

      <View
        pointerEvents="box-none"
        style={
          styles.overlay
        }
      >
        <View
          style={
            styles.notificationList
          }
        >
          {notifications.map(
            (notification) => {
              const config =
                getConfig(
                  notification.type
                );

              return (
                <View
                  key={
                    notification.id
                  }
                  style={[
                    styles.notification,
                    {
                      borderColor:
                        config.borderColor,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.icon,
                      {
                        backgroundColor:
                          config.backgroundColor,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.iconText,
                        {
                          color:
                            config.color,
                        },
                      ]}
                    >
                      {
                        config.icon
                      }
                    </Text>
                  </View>

                  <View
                    style={
                      styles.textArea
                    }
                  >
                    <Text
                      style={
                        styles.title
                      }
                    >
                      {
                        notification.title
                      }
                    </Text>

                    {notification.message ? (
                      <Text
                        style={
                          styles.message
                        }
                      >
                        {
                          notification.message
                        }
                      </Text>
                    ) : null}
                  </View>

                  <View
                    style={[
                      styles.indicator,
                      {
                        backgroundColor:
                          config.color,
                      },
                    ]}
                  />
                </View>
              );
            }
          )}
        </View>
      </View>
    </NotificationContext.Provider>
  );
}

function getConfig(
  type: NotificationType
) {
  switch (type) {
    case "success":
      return {
        icon: "✓",
        color: "#16A34A",
        backgroundColor:
          "#DCFCE7",
        borderColor:
          "#BBF7D0",
      };

    case "error":
      return {
        icon: "×",
        color: "#DC2626",
        backgroundColor:
          "#FEE2E2",
        borderColor:
          "#FECACA",
      };

    case "warning":
      return {
        icon: "!",
        color: "#EA580C",
        backgroundColor:
          "#FFEDD5",
        borderColor:
          "#FED7AA",
      };

    default:
      return {
        icon: "i",
        color: "#2563EB",
        backgroundColor:
          "#DBEAFE",
        borderColor:
          "#BFDBFE",
      };
  }
}

export function useNotification() {
  const context =
    useContext(
      NotificationContext
    );

  if (!context) {
    throw new Error(
      "useNotification must be used inside NotificationProvider"
    );
  }

  return context;
}

const styles =
  StyleSheet.create({
    overlay: {
      position:
        "absolute",
      top: 18,
      left: 0,
      right: 0,
      alignItems:
        "center",
      zIndex: 99999,
      elevation: 99999,
    },

    notificationList: {
      width: "100%",
      maxWidth: 520,
      paddingHorizontal: 16,
      gap: 10,
    },

    notification: {
      minHeight: 68,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 16,
      borderWidth: 1,
      paddingLeft: 12,
      paddingRight: 16,
      paddingVertical: 10,
      flexDirection:
        "row",
      alignItems:
        "center",
      shadowColor:
        "#000000",
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
      overflow:
        "hidden",
    },

    icon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    iconText: {
      fontSize: 20,
      fontWeight:
        "900",
    },

    textArea: {
      flex: 1,
      marginLeft: 11,
      paddingRight: 8,
    },

    title: {
      fontSize: 14,
      fontWeight:
        "900",
      color:
        "#17202A",
    },

    message: {
      marginTop: 3,
      fontSize: 11,
      lineHeight: 16,
      color:
        "#7A8492",
    },

    indicator: {
      width: 4,
      height: 42,
      borderRadius: 4,
    },
  });