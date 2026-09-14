import { useMemo } from "react";

import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { router } from "expo-router";

import {
  useCards,
  type CardNetwork,
} from "./context/CardContext";

import { useTransactions } from "./context/TransactionContext";

const COLORS = {
  bg: "#F7F8FA",
  card: "#FFFFFF",
  text: "#17202A",
  secondary: "#7A8492",
  green: "#22C55E",
  blue: "#3B82F6",
  orange: "#FF8A3D",
  red: "#EF4444",
  purple: "#8B5CF6",
};

const TROY_LOGO =
  "https://commons.wikimedia.org/wiki/Special:Redirect/file/Troy-logo-sloganli.png";

const turkishMonths = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

function formatMoney(value: number) {
  return `${Number(
    value || 0
  ).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ₺`;
}

function formatMoneyShort(value: number) {
  return `${Number(
    value || 0
  ).toLocaleString("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} ₺`;
}

function formatDate(date: Date | null) {
  if (!date) {
    return "-";
  }

  return date.toLocaleDateString(
    "tr-TR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
}

function formatPaymentDate(date: string) {
  const parsed =
    new Date(date);

  if (
    isNaN(
      parsed.getTime()
    )
  ) {
    return "-";
  }

  return parsed.toLocaleDateString(
    "tr-TR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
}

function getNetworkLabel(
  network: CardNetwork
) {
  switch (network) {
    case "visa":
      return "VISA";

    case "mastercard":
      return "MASTERCARD";

    case "troy":
      return "TROY";

    case "amex":
      return "AMEX";

    default:
      return "CARD";
  }
}

function BrandLogo({
  network,
  width = 80,
  height = 38,
}: {
  network: CardNetwork;
  width?: number;
  height?: number;
}) {
  if (
    network === "troy"
  ) {
    return (
      <Image
        source={{
          uri: TROY_LOGO,
        }}
        resizeMode="contain"
        style={{
          width,
          height,
        }}
      />
    );
  }

  if (
    network === "visa"
  ) {
    return (
      <View
        style={[
          styles.brandLogo,
          styles.visaLogo,
          {
            width,
            height,
          },
        ]}
      >
        <Text
          style={
            styles.visaText
          }
        >
          VISA
        </Text>
      </View>
    );
  }

  if (
    network ===
    "mastercard"
  ) {
    return (
      <View
        style={[
          styles.brandLogo,
          styles.mastercardLogo,
          {
            width,
            height,
          },
        ]}
      >
        <View
          style={
            styles.masterCircleLeft
          }
        />

        <View
          style={
            styles.masterCircleRight
          }
        />

        <Text
          style={
            styles.mastercardText
          }
        >
          mastercard
        </Text>
      </View>
    );
  }

  if (
    network === "amex"
  ) {
    return (
      <View
        style={[
          styles.brandLogo,
          styles.amexLogo,
          {
            width,
            height,
          },
        ]}
      >
        <Text
          style={
            styles.amexText
          }
        >
          AMERICAN
        </Text>

        <Text
          style={
            styles.amexText
          }
        >
          EXPRESS
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.brandLogo,
        styles.otherLogo,
        {
          width,
          height,
        },
      ]}
    >
      <Text
        style={
          styles.otherLogoText
        }
      >
        CARD
      </Text>
    </View>
  );
}

function ProgressBar({
  percentage,
  height = 10,
  fillColor = COLORS.blue,
}: {
  percentage: number;
  height?: number;
  fillColor?: string;
}) {
  const safePercentage =
    Math.min(
      100,
      Math.max(
        0,
        percentage
      )
    );

  return (
    <View
      style={[
        styles.progressTrack,
        {
          height,
        },
      ]}
    >
      <View
        style={[
          styles.progressFill,
          {
            width: `${safePercentage}%`,
            height,
            backgroundColor:
              fillColor,
          },
        ]}
      />
    </View>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  backgroundColor,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  backgroundColor: string;
}) {
  return (
    <View
      style={
        styles.statCard
      }
    >
      <View
        style={
          styles.statTopRow
        }
      >
        <View
          style={[
            styles.statIcon,
            {
              backgroundColor,
            },
          ]}
        >
          <Text
            style={
              styles.statIconText
            }
          >
            {icon}
          </Text>
        </View>

        <Text
          style={
            styles.statTitle
          }
        >
          {title}
        </Text>
      </View>

      <Text
        style={
          styles.statValue
        }
      >
        {value}
      </Text>

      {subtitle ? (
        <Text
          style={
            styles.statSubtitle
          }
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

/**
 * Son ödeme tarihine göre durum hesaplar.
 *
 * 0 veya daha az:
 *   Bugün
 *
 * 1 - 3:
 *   Çok yaklaştı
 *
 * 4 - 7:
 *   Yaklaşıyor
 *
 * 8+:
 *   Normal
 */
function getDueStatus(
  dueDate: Date | null,
  hasDebt: boolean
) {
  if (
    !dueDate ||
    !hasDebt
  ) {
    return {
      type: "paid" as const,
      days: 0,
      title:
        hasDebt
          ? "Son ödeme tarihi yok"
          : "Borç yok",
      text:
        hasDebt
          ? "Son ödeme tarihi belirlenmemiş."
          : "Bu kartta açık borç bulunmuyor.",
      color:
        COLORS.green,
      background:
        "#ECFDF5",
      border:
        "#CDEFD9",
    };
  }

  const now =
    new Date();

  const today =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

  const due =
    new Date(
      dueDate.getFullYear(),
      dueDate.getMonth(),
      dueDate.getDate()
    );

  const difference =
    due.getTime() -
    today.getTime();

  const days = Math.ceil(
    difference /
      (1000 *
        60 *
        60 *
        24)
  );

  if (
    days < 0
  ) {
    return {
      type: "overdue" as const,
      days,
      title:
        "Son ödeme tarihi geçti",
      text:
        `${Math.abs(
          days
        )} gün gecikmiş`,
      color:
        COLORS.red,
      background:
        "#FEF2F2",
      border:
        "#FECACA",
    };
  }

  if (
    days === 0
  ) {
    return {
      type: "today" as const,
      days,
      title:
        "Son ödeme bugün",
      text:
        "Bugün ödeme yapılması gerekiyor.",
      color:
        COLORS.red,
      background:
        "#FEF2F2",
      border:
        "#FECACA",
    };
  }

  if (
    days <= 3
  ) {
    return {
      type: "urgent" as const,
      days,
      title:
        `Son ödemeye ${days} gün kaldı`,
      text:
        "Ödeme tarihi çok yaklaştı.",
      color:
        COLORS.orange,
      background:
        "#FFF7ED",
      border:
        "#FED7AA",
    };
  }

  if (
    days <= 7
  ) {
    return {
      type: "soon" as const,
      days,
      title:
        `Son ödemeye ${days} gün kaldı`,
      text:
        "Ödeme tarihi yaklaşıyor.",
      color:
        COLORS.orange,
      background:
        "#FFF7ED",
      border:
        "#FED7AA",
    };
  }

  return {
    type: "normal" as const,
    days,
    title:
      `Son ödemeye ${days} gün kaldı`,
    text:
      "Ödeme tarihi henüz yakın değil.",
    color:
      COLORS.blue,
    background:
      "#EFF6FF",
    border:
      "#D7E5FF",
  };
}

export default function CardsScreen() {
  const { width } =
    useWindowDimensions();

  const isCompact = width < 640;

  const {
    cards,
    payments,
    deleteCard,
    getCardDebtSummary,
    undoCardPayment,
  } = useCards();

  const {
    transactions,
  } = useTransactions();

  const today =
    new Date();

  const currentYear =
    today.getFullYear();

  const currentMonth =
    today.getMonth();

  const creditCards =
    useMemo(
      () =>
        cards.filter(
          (card) =>
            card.type ===
            "credit"
        ),
      [cards]
    );

  const debitCards =
    useMemo(
      () =>
        cards.filter(
          (card) =>
            card.type ===
            "debit"
        ),
      [cards]
    );

  const totals =
    useMemo(() => {
      let limit = 0;

      let used = 0;

      let currentPeriodDebt =
        0;

      let lastStatementDebt =
        0;

      let outstandingDebt =
        0;

      let minimumPayment =
        0;

      creditCards.forEach(
        (card) => {
          const summary =
            getCardDebtSummary(
              card.id,
              transactions,
              today
            );

          limit += Number(
            card.limit || 0
          );

          used += Number(
            card.usedLimit || 0
          );

          currentPeriodDebt +=
            Number(
              summary.currentPeriodDebt ||
                0
            );

          lastStatementDebt +=
            Number(
              summary.lastStatementDebt ||
                0
            );

          outstandingDebt +=
            Number(
              summary.totalOutstandingDebt ||
                0
            );

          minimumPayment +=
            Number(
              summary.minimumPaymentAmount ||
                0
            );
        }
      );

      const available =
        Math.max(
          0,
          limit - used
        );

      const usage =
        limit > 0
          ? (used / limit) *
            100
          : 0;

      return {
        limit,
        used,
        available,
        usage,
        currentPeriodDebt,
        lastStatementDebt,
        outstandingDebt,
        minimumPayment,
      };
    }, [
      creditCards,
      transactions,
      getCardDebtSummary,
      currentYear,
      currentMonth,
    ]);

  const monthlySpendByCard =
    useMemo(() => {
      const result: Record<
        string,
        number
      > = {};

      creditCards.forEach(
        (card) => {
          result[card.id] =
            0;
        }
      );

      transactions.forEach(
        (transaction) => {
          if (
            transaction.paymentSource !==
            "card"
          ) {
            return;
          }

          if (
            transaction.type !==
            "expense"
          ) {
            return;
          }

          if (
            !transaction.cardId
          ) {
            return;
          }

          const date =
            new Date(
              transaction.date
            );

          if (
            date.getFullYear() !==
              currentYear ||
            date.getMonth() !==
              currentMonth
          ) {
            return;
          }

          if (
            result[
              transaction.cardId
            ] === undefined
          ) {
            result[
              transaction.cardId
            ] = 0;
          }

          result[
            transaction.cardId
          ] += Number(
            transaction.amount || 0
          );
        }
      );

      return result;
    }, [
      creditCards,
      transactions,
      currentYear,
      currentMonth,
    ]);

  const monthlyTotalCardSpend =
    useMemo(
      () =>
        Object.values(
          monthlySpendByCard
        ).reduce(
          (
            sum,
            value
          ) =>
            sum + value,
          0
        ),
      [
        monthlySpendByCard,
      ]
    );

  const topCardByUsage =
    useMemo(() => {
      if (
        creditCards.length ===
        0
      ) {
        return null;
      }

      return [...creditCards]
        .map(
          (card) => ({
            card,
            percentage:
              card.limit > 0
                ? (card.usedLimit /
                    card.limit) *
                  100
                : 0,
          })
        )
        .sort(
          (a, b) =>
            b.percentage -
            a.percentage
        )[0];
    }, [
      creditCards,
    ]);

  const paymentList =
    useMemo(() => {
      return payments
        .map(
          (payment) => {
            const card =
              cards.find(
                (item) =>
                  item.id ===
                  payment.cardId
              );

            return {
              payment,
              card,
            };
          }
        )
        .filter(
          (item) =>
            Boolean(
              item.card
            )
        )
        .sort(
          (a, b) =>
            new Date(
              b.payment.date
            ).getTime() -
            new Date(
              a.payment.date
            ).getTime()
        );
    }, [
      payments,
      cards,
    ]);

  /*
   * Ödeme tarihi yaklaşan kartların sayısı.
   */
  const dueWarningCards =
    useMemo(() => {
      return creditCards.filter(
        (card) => {
          const summary =
            getCardDebtSummary(
              card.id,
              transactions,
              today
            );

          if (
            summary.totalOutstandingDebt <=
            0
          ) {
            return false;
          }

          const status =
            getDueStatus(
              summary.nextDueDate,
              true
            );

          return (
            status.type ===
              "overdue" ||
            status.type ===
              "today" ||
            status.type ===
              "urgent"
          );
        }
      );
    }, [
      creditCards,
      transactions,
      getCardDebtSummary,
    ]);

  function handleDelete(
    cardId: string,
    cardName: string
  ) {
    Alert.alert(
      "Kartı sil",
      `"${cardName}" kartını silmek istediğine emin misin?`,
      [
        {
          text: "Vazgeç",
          style: "cancel",
        },
        {
          text: "Sil",
          style: "destructive",
          onPress:
            async () => {
              await deleteCard(
                cardId
              );
            },
        },
      ]
    );
  }

  function handleEdit(
    cardId: string
  ) {
    router.push({
      pathname:
        "/edit-card",
      params: {
        id: cardId,
      },
    });
  }

  function handlePayment(
    cardId: string
  ) {
    router.push({
      pathname:
        "/card-payment",
      params: {
        id: cardId,
      },
    });
  }

  async function handleUndoPayment(
    paymentId: string,
    cardName: string,
    amount: number
  ) {
    try {
      await undoCardPayment(
        paymentId
      );

      Alert.alert(
        "Ödeme geri alındı",
        `${formatMoney(
          amount
        )} ₺ tutarındaki ${cardName} ödemesi geri alındı.`
      );
    } catch (
      error
    ) {
      Alert.alert(
        "Geri alma başarısız",
        error instanceof Error
          ? error.message
          : "Ödeme geri alınamadı."
      );
    }
  }

  const monthName =
    turkishMonths[
      currentMonth
    ];

  return (
    <ScrollView
      style={
        styles.container
      }
      contentContainerStyle={
        styles.content
      }
    >
      {/* BAŞLIK */}

      <View
        style={[
          styles.pageHeader,
          isCompact &&
            styles.pageHeaderCompact,
        ]}
      >
        <View
          style={
            styles.pageHeaderContent
          }
        >
          <Text
            style={
              styles.title
            }
          >
            Kartlar
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Tüm kartlarının kullanımını
            ve borç durumunu tek ekranda
            takip et.
          </Text>
        </View>

        <Pressable
          style={[
            styles.addButton,
            isCompact &&
              styles.addButtonCompact,
          ]}
          onPress={() =>
            router.push(
              "/add-card"
            )
          }
        >
          <Text
            style={
              styles.addButtonText
            }
          >
            ＋ Kart Ekle
          </Text>
        </Pressable>
      </View>

      {/* ACİL ÖDEME UYARISI */}

      {dueWarningCards.length >
        0 && (
        <View
          style={
            styles.globalWarning
          }
        >
          <View
            style={
              styles.globalWarningIcon
            }
          >
            <Text>
              ⚠
            </Text>
          </View>

          <View
            style={
              styles.globalWarningContent
            }
          >
            <Text
              style={
                styles.globalWarningTitle
              }
            >
              {dueWarningCards.length ===
              1
                ? "Yaklaşan kart ödemesi var"
                : `${dueWarningCards.length} kartın ödeme tarihi yaklaşıyor`}
            </Text>

            <Text
              style={
                styles.globalWarningText
              }
            >
              Kart detaylarında son ödeme
              tarihini ve kalan gün sayısını
              görebilirsin.
            </Text>
          </View>
        </View>
      )}

      {cards.length === 0 ? (
        <View
          style={
            styles.emptyCard
          }
        >
          <Text
            style={
              styles.emptyIcon
            }
          >
            💳
          </Text>

          <Text
            style={
              styles.emptyTitle
            }
          >
            Henüz kart eklenmemiş
          </Text>

          <Text
            style={
              styles.emptySubtitle
            }
          >
            Kredi veya banka kartlarını
            ekleyerek bu ekrandan
            takip etmeye başlayabilirsin.
          </Text>

          <Pressable
            style={
              styles.emptyButton
            }
            onPress={() =>
              router.push(
                "/add-card"
              )
            }
          >
            <Text
              style={
                styles.emptyButtonText
              }
            >
              İlk Kartı Ekle
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          {creditCards.length >
            0 && (
            <>
              {/* İSTATİSTİKLER */}

              <View
                style={
                  styles.statsGrid
                }
              >
                <StatCard
                  title="Toplam Limit"
                  value={formatMoneyShort(
                    totals.limit
                  )}
                  subtitle={`${creditCards.length} kredi kartı`}
                  icon="◈"
                  backgroundColor="#EEF2FF"
                />

                <StatCard
                  title="Kullanılan"
                  value={formatMoneyShort(
                    totals.used
                  )}
                  subtitle={`%${totals.usage.toFixed(
                    1
                  )} kullanım`}
                  icon="↗"
                  backgroundColor="#FFF7ED"
                />

                <StatCard
                  title="Kullanılabilir"
                  value={formatMoneyShort(
                    totals.available
                  )}
                  subtitle="Kalan toplam limit"
                  icon="✓"
                  backgroundColor="#ECFDF5"
                />

                <StatCard
                  title="Asgari Ödeme"
                  value={formatMoneyShort(
                    totals.minimumPayment
                  )}
                  subtitle="Toplam tahmini minimum"
                  icon="₺"
                  backgroundColor="#FEF2F2"
                />
              </View>

              {/* GENEL LİMİT */}

              <View
                style={
                  styles.mainDashboardCard
                }
              >
                <View
                  style={
                    styles.dashboardHeader
                  }
                >
                  <View>
                    <Text
                      style={
                        styles.dashboardTitle
                      }
                    >
                      Genel Limit Kullanımı
                    </Text>

                    <Text
                      style={
                        styles.dashboardSubtitle
                      }
                    >
                      Tüm kredi kartlarının toplam
                      kullanım oranı
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.bigPercentage
                    }
                  >
                    %{totals.usage.toFixed(
                      1
                    )}
                  </Text>
                </View>

                <ProgressBar
                  percentage={
                    totals.usage
                  }
                  height={16}
                  fillColor={
                    totals.usage >=
                    80
                      ? COLORS.red
                      : totals.usage >=
                          60
                        ? COLORS.orange
                        : COLORS.blue
                  }
                />

                <View
                  style={
                    styles.summaryRow
                  }
                >
                  <View>
                    <Text
                      style={
                        styles.summaryLabel
                      }
                    >
                      Kullanılan
                    </Text>

                    <Text
                      style={
                        styles.summaryValue
                      }
                    >
                      {formatMoney(
                        totals.used
                      )}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.summaryCenter
                    }
                  >
                    <Text
                      style={
                        styles.summaryLabel
                      }
                    >
                      Limit
                    </Text>

                    <Text
                      style={
                        styles.summaryValue
                      }
                    >
                      {formatMoney(
                        totals.limit
                      )}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.summaryRight
                    }
                  >
                    <Text
                      style={
                        styles.summaryLabel
                      }
                    >
                      Kullanılabilir
                    </Text>

                    <Text
                      style={[
                        styles.summaryValue,
                        {
                          color:
                            COLORS.green,
                        },
                      ]}
                    >
                      {formatMoney(
                        totals.available
                      )}
                    </Text>
                  </View>
                </View>
              </View>

              {/* BORÇ + AYLIK */}

              <View
                style={
                  styles.twoColumn
                }
              >
                <View
                  style={[
                    styles.infoCard,
                    styles.flexCard,
                  ]}
                >
                  <Text
                    style={
                      styles.dashboardTitle
                    }
                  >
                    Borç Özeti
                  </Text>

                  <Text
                    style={
                      styles.dashboardSubtitle
                    }
                  >
                    Kartların toplam açık borcu
                  </Text>

                  <View
                    style={
                      styles.cardGrid
                    }
                  >
                    <View
                      style={
                        styles.cardMetric
                      }
                    >
                      <Text
                        style={
                          styles.metricLabel
                        }
                      >
                        Toplam Borç
                      </Text>

                      <Text
                        style={
                          styles.metricValue
                        }
                      >
                        {formatMoney(
                          totals.outstandingDebt
                        )}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.cardMetric
                      }
                    >
                      <Text
                        style={
                          styles.metricLabel
                        }
                      >
                        Son Ekstre
                      </Text>

                      <Text
                        style={
                          styles.metricValue
                        }
                      >
                        {formatMoney(
                          totals.lastStatementDebt
                        )}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.cardMetric
                      }
                    >
                      <Text
                        style={
                          styles.metricLabel
                        }
                      >
                        Güncel Dönem
                      </Text>

                      <Text
                        style={
                          styles.metricValue
                        }
                      >
                        {formatMoney(
                          totals.currentPeriodDebt
                        )}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.cardMetric
                      }
                    >
                      <Text
                        style={
                          styles.metricLabel
                        }
                      >
                        Asgari
                      </Text>

                      <Text
                        style={[
                          styles.metricValue,
                          {
                            color:
                              COLORS.red,
                          },
                        ]}
                      >
                        {formatMoney(
                          totals.minimumPayment
                        )}
                      </Text>
                    </View>
                  </View>
                </View>

                <View
                  style={[
                    styles.infoCard,
                    styles.flexCard,
                  ]}
                >
                  <Text
                    style={
                      styles.dashboardTitle
                    }
                  >
                    {monthName} Harcaması
                  </Text>

                  <Text
                    style={
                      styles.dashboardSubtitle
                    }
                  >
                    Bu ay kredi kartlarından yapılan
                    harcamalar
                  </Text>

                  <Text
                    style={
                      styles.monthlySpendValue
                    }
                  >
                    {formatMoney(
                      monthlyTotalCardSpend
                    )}
                  </Text>

                  <View
                    style={
                      styles.monthBars
                    }
                  >
                    {creditCards.map(
                      (card) => {
                        const spend =
                          monthlySpendByCard[
                            card.id
                          ] || 0;

                        const percentage =
                          monthlyTotalCardSpend >
                          0
                            ? (spend /
                                monthlyTotalCardSpend) *
                              100
                            : 0;

                        return (
                          <View
                            key={
                              card.id
                            }
                            style={
                              styles.monthBarRow
                            }
                          >
                            <Text
                              numberOfLines={
                                1
                              }
                              style={
                                styles.monthBarName
                              }
                            >
                              {
                                card.name
                              }
                            </Text>

                            <View
                              style={
                                styles.monthBarTrack
                              }
                            >
                              <View
                                style={[
                                  styles.monthBarFill,
                                  {
                                    width: `${Math.min(
                                      100,
                                      percentage
                                    )}%`,
                                  },
                                ]}
                              />
                            </View>

                            <Text
                              style={
                                styles.monthBarValue
                              }
                            >
                              {formatMoneyShort(
                                spend
                              )}
                            </Text>
                          </View>
                        );
                      }
                    )}
                  </View>
                </View>
              </View>

              {/* EN YÜKSEK KULLANIM */}

              {topCardByUsage && (
                <View
                  style={
                    styles.warningCard
                  }
                >
                  <View
                    style={
                      styles.warningIcon
                    }
                  >
                    <Text>
                      ⚠
                    </Text>
                  </View>

                  <View
                    style={
                      styles.warningContent
                    }
                  >
                    <Text
                      style={
                        styles.warningTitle
                      }
                    >
                      En yüksek kullanım
                    </Text>

                    <Text
                      style={
                        styles.warningText
                      }
                    >
                      {
                        topCardByUsage.card
                          .name
                      }{" "}
                      kartında limit kullanım
                      oranı{" "}
                      <Text
                        style={
                          styles.warningStrong
                        }
                      >
                        %
                        {topCardByUsage.percentage.toFixed(
                          1
                        )}
                      </Text>
                      .
                    </Text>
                  </View>
                </View>
              )}

              {/* KREDİ KARTLARI */}

              <View
                style={
                  styles.sectionHeader
                }
              >
                <View>
                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Kredi Kartlarım
                  </Text>

                  <Text
                    style={
                      styles.sectionSubtitle
                    }
                  >
                    Kart bazında detaylı kullanım,
                    borç ve ödeme tarihi
                  </Text>
                </View>

                <Text
                  style={
                    styles.sectionCount
                  }
                >
                  {creditCards.length}
                </Text>
              </View>

              {creditCards.map(
                (card) => {
                  const summary =
                    getCardDebtSummary(
                      card.id,
                      transactions,
                      today
                    );

                  const usage =
                    card.limit > 0
                      ? (card.usedLimit /
                          card.limit) *
                        100
                      : 0;

                  const safeUsage =
                    Math.min(
                      100,
                      Math.max(
                        0,
                        usage
                      )
                    );

                  const monthlySpend =
                    monthlySpendByCard[
                      card.id
                    ] || 0;

                  const usageColor =
                    usage >= 80
                      ? COLORS.red
                      : usage >= 60
                        ? COLORS.orange
                        : COLORS.blue;

                  const dueStatus =
                    getDueStatus(
                      summary.nextDueDate,
                      summary.totalOutstandingDebt >
                        0
                    );

                  return (
                    <View
                      key={
                        card.id
                      }
                      style={
                        styles.cardDashboard
                      }
                    >
                      {/* KART BAŞI */}

                      <View
                        style={
                          styles.cardTop
                        }
                      >
                        <View
                          style={
                            styles.cardIdentity
                          }
                        >
                          <View
                            style={[
                              styles.cardColorIndicator,
                              {
                                backgroundColor:
                                  card.color ||
                                  COLORS.blue,
                              },
                            ]}
                          />

                          <View>
                            <Text
                              style={
                                styles.cardName
                              }
                            >
                              {
                                card.name
                              }
                            </Text>

                            <Text
                              style={
                                styles.cardBank
                              }
                            >
                              {
                                card.bankName
                              }
                            </Text>
                          </View>
                        </View>

                        <View
                          style={
                            styles.cardNetworkArea
                          }
                        >
                          <BrandLogo
                            network={
                              card.network ??
                              "other"
                            }
                            width={80}
                            height={38}
                          />
                        </View>
                      </View>

                      {/* ETİKETLER */}

                      <View
                        style={
                          styles.cardMetaRow
                        }
                      >
                        <View
                          style={
                            styles.networkBadge
                          }
                        >
                          <Text
                            style={
                              styles.networkBadgeText
                            }
                          >
                            {getNetworkLabel(
                              card.network ??
                                "other"
                            )}
                          </Text>
                        </View>

                        <View
                          style={
                            styles.creditBadge
                          }
                        >
                          <Text
                            style={
                              styles.creditBadgeText
                            }
                          >
                            KREDİ KARTI
                          </Text>
                        </View>
                      </View>

                      {/* SON ÖDEME UYARISI */}

                      <View
                        style={[
                          styles.dueStatusBox,
                          {
                            backgroundColor:
                              dueStatus.background,
                            borderColor:
                              dueStatus.border,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.dueStatusIcon,
                            {
                              backgroundColor:
                                dueStatus.color,
                            },
                          ]}
                        >
                          <Text
                            style={
                              styles.dueStatusIconText
                            }
                          >
                            {dueStatus.type ===
                            "overdue"
                              ? "!"
                              : dueStatus.type ===
                                  "today"
                                ? "!"
                                : dueStatus.type ===
                                    "paid"
                                  ? "✓"
                                  : "₺"}
                          </Text>
                        </View>

                        <View
                          style={
                            styles.dueStatusContent
                          }
                        >
                          <Text
                            style={[
                              styles.dueStatusTitle,
                              {
                                color:
                                  dueStatus.color,
                              },
                            ]}
                          >
                            {
                              dueStatus.title
                            }
                          </Text>

                          <Text
                            style={
                              styles.dueStatusText
                            }
                          >
                            {
                              dueStatus.text
                            }
                            {summary.nextDueDate
                              ? ` · ${formatDate(
                                  summary.nextDueDate
                                )}`
                              : ""}
                          </Text>
                        </View>

                        {dueStatus.type !==
                          "paid" &&
                          dueStatus.type !==
                            "normal" && (
                            <View
                              style={
                                styles.dueActionBadge
                              }
                            >
                              <Text
                                style={
                                  styles.dueActionText
                                }
                              >
                                ÖDE
                              </Text>
                            </View>
                          )}
                      </View>

                      {/* LİMİT KULLANIMI */}

                      <View
                        style={
                          styles.cardUsageSection
                        }
                      >
                        <View
                          style={
                            styles.cardUsageHeader
                          }
                        >
                          <Text
                            style={
                              styles.cardUsageTitle
                            }
                          >
                            Limit Kullanımı
                          </Text>

                          <Text
                            style={[
                              styles.cardUsagePercentage,
                              {
                                color:
                                  usageColor,
                              },
                            ]}
                          >
                            %
                            {usage.toFixed(
                              1
                            )}
                          </Text>
                        </View>

                        <ProgressBar
                          percentage={
                            safeUsage
                          }
                          height={12}
                          fillColor={
                            usageColor
                          }
                        />

                        <View
                          style={
                            styles.cardAmountRow
                          }
                        >
                          <View>
                            <Text
                              style={
                                styles.cardAmountLabel
                              }
                            >
                              Kullanılan
                            </Text>

                            <Text
                              style={
                                styles.cardAmountValue
                              }
                            >
                              {formatMoney(
                                card.usedLimit
                              )}
                            </Text>
                          </View>

                          <View
                            style={
                              styles.cardAmountCenter
                            }
                          >
                            <Text
                              style={
                                styles.cardAmountLabel
                              }
                            >
                              Limit
                            </Text>

                            <Text
                              style={
                                styles.cardAmountValue
                              }
                            >
                              {formatMoney(
                                card.limit
                              )}
                            </Text>
                          </View>

                          <View
                            style={
                              styles.cardAmountRight
                            }
                          >
                            <Text
                              style={
                                styles.cardAmountLabel
                              }
                            >
                              Kalan
                            </Text>

                            <Text
                              style={[
                                styles.cardAmountValue,
                                {
                                  color:
                                    COLORS.green,
                                },
                              ]}
                            >
                              {formatMoney(
                                Math.max(
                                  card.limit -
                                    card.usedLimit,
                                  0
                                )
                              )}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* BORÇ DETAYI */}

                      <View
                        style={
                          styles.cardGrid
                        }
                      >
                        <View
                          style={
                            styles.cardMetric
                          }
                        >
                          <Text
                            style={
                              styles.metricLabel
                            }
                          >
                            Son Ekstre
                          </Text>

                          <Text
                            style={
                              styles.metricValue
                            }
                          >
                            {formatMoney(
                              summary.lastStatementDebt
                            )}
                          </Text>
                        </View>

                        <View
                          style={
                            styles.cardMetric
                          }
                        >
                          <Text
                            style={
                              styles.metricLabel
                            }
                          >
                            Güncel Dönem
                          </Text>

                          <Text
                            style={
                              styles.metricValue
                            }
                          >
                            {formatMoney(
                              summary.currentPeriodDebt
                            )}
                          </Text>
                        </View>

                        <View
                          style={
                            styles.cardMetric
                          }
                        >
                          <Text
                            style={
                              styles.metricLabel
                            }
                          >
                            Toplam Borç
                          </Text>

                          <Text
                            style={[
                              styles.metricValue,
                              {
                                color:
                                  COLORS.red,
                              },
                            ]}
                          >
                            {formatMoney(
                              summary.totalOutstandingDebt
                            )}
                          </Text>
                        </View>

                        <View
                          style={
                            styles.cardMetric
                          }
                        >
                          <Text
                            style={
                              styles.metricLabel
                            }
                          >
                            Asgari Ödeme
                          </Text>

                          <Text
                            style={[
                              styles.metricValue,
                              {
                                color:
                                  COLORS.orange,
                              },
                            ]}
                          >
                            {formatMoney(
                              summary.minimumPaymentAmount
                            )}
                          </Text>
                        </View>
                      </View>

                      {/* TARİHLER */}

                      <View
                        style={
                          styles.dateInfoRow
                        }
                      >
                        <View>
                          <Text
                            style={
                              styles.dateLabel
                            }
                          >
                            SON EKSTRE
                          </Text>

                          <Text
                            style={
                              styles.dateValue
                            }
                          >
                            {formatDate(
                              summary.statementDate
                            )}
                          </Text>
                        </View>

                        <View>
                          <Text
                            style={
                              styles.dateLabel
                            }
                          >
                            SONRAKİ EKSTRE
                          </Text>

                          <Text
                            style={
                              styles.dateValue
                            }
                          >
                            {formatDate(
                              summary.nextStatementDate
                            )}
                          </Text>
                        </View>

                        <View>
                          <Text
                            style={
                              styles.dateLabel
                            }
                          >
                            SON ÖDEME
                          </Text>

                          <Text
                            style={[
                              styles.dateValue,
                              {
                                color:
                                  dueStatus.color,
                              },
                            ]}
                          >
                            {formatDate(
                              summary.nextDueDate
                            )}
                          </Text>
                        </View>
                      </View>

                      {/* AYLIK HARCAMA */}

                      <View
                        style={
                          styles.monthlyMiniCard
                        }
                      >
                        <View>
                          <Text
                            style={
                              styles.monthlyMiniLabel
                            }
                          >
                            Bu ay harcama
                          </Text>

                          <Text
                            style={
                              styles.monthlyMiniValue
                            }
                          >
                            {formatMoney(
                              monthlySpend
                            )}
                          </Text>
                        </View>

                        <Text
                          style={
                            styles.monthlyMiniMonth
                          }
                        >
                          {
                            monthName
                          }
                        </Text>
                      </View>

                      {/* AKSİYONLAR */}

                      <View
                        style={
                          styles.cardActions
                        }
                      >
                        <Pressable
                          style={
                            styles.paymentButton
                          }
                          onPress={() =>
                            handlePayment(
                              card.id
                            )
                          }
                        >
                          <Text
                            style={
                              styles.paymentButtonText
                            }
                          >
                            ₺ Ödeme Yap
                          </Text>
                        </Pressable>

                        <Pressable
                          style={
                            styles.editButton
                          }
                          onPress={() =>
                            handleEdit(
                              card.id
                            )
                          }
                        >
                          <Text
                            style={
                              styles.editButtonText
                            }
                          >
                            ✎ Düzenle
                          </Text>
                        </Pressable>

                        <Pressable
                          style={
                            styles.deleteButton
                          }
                          onPress={() =>
                            handleDelete(
                              card.id,
                              card.name
                            )
                          }
                        >
                          <Text
                            style={
                              styles.deleteButtonText
                            }
                          >
                            Sil
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                }
              )}
            </>
          )}

          {/* ÖDEME GEÇMİŞİ */}

          <View
            style={
              styles.sectionHeader
            }
          >
            <View>
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Ödeme Geçmişi
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Kredi kartlarına yaptığın son ödemeler
              </Text>
            </View>

            <Text
              style={
                styles.sectionCount
              }
            >
              {
                paymentList.length
              }
            </Text>
          </View>

          {paymentList.length ===
          0 ? (
            <View
              style={
                styles.paymentEmptyCard
              }
            >
              <Text
                style={
                  styles.paymentEmptyIcon
                }
              >
                ↔
              </Text>

              <Text
                style={
                  styles.paymentEmptyTitle
                }
              >
                Henüz ödeme yapılmamış
              </Text>

              <Text
                style={
                  styles.paymentEmptyText
                }
              >
                Kartlarına yaptığın ödemeler burada
                görünecek.
              </Text>
            </View>
          ) : (
            <View
              style={
                styles.paymentHistoryCard
              }
            >
              {paymentList.map(
                ({
                  payment,
                  card,
                }) => {
                  if (!card) {
                    return null;
                  }

                  return (
                    <View
                      key={
                        payment.id
                      }
                      style={
                        styles.paymentRow
                      }
                    >
                      <View
                        style={
                          styles.paymentMain
                        }
                      >
                        <View
                          style={[
                            styles.paymentCircle,
                            {
                              backgroundColor:
                                card.color ||
                                COLORS.blue,
                            },
                          ]}
                        >
                          <Text
                            style={
                              styles.paymentCircleText
                            }
                          >
                            ₺
                          </Text>
                        </View>

                        <View
                          style={
                            styles.paymentInfo
                          }
                        >
                          <Text
                            style={
                              styles.paymentCardName
                            }
                          >
                            {
                              card.name
                            }
                          </Text>

                          <Text
                            style={
                              styles.paymentDate
                            }
                          >
                            {formatPaymentDate(
                              payment.date
                            )}
                          </Text>

                          <View
                            style={
                              styles.paymentMeta
                            }
                          >
                            <View
                              style={
                                styles.paymentMetaBadge
                              }
                            >
                              <Text
                                style={
                                  styles.paymentMetaText
                                }
                              >
                                {payment.paymentSource ===
                                "account"
                                  ? "HESAPTAN"
                                  : "MANUEL"}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      <View
                        style={
                          styles.paymentRight
                        }
                      >
                        <Text
                          style={
                            styles.paymentAmount
                          }
                        >
                          -{formatMoney(
                            payment.amount
                          )}
                        </Text>

                        <Pressable
                          style={
                            styles.undoButton
                          }
                          onPress={() =>
                            handleUndoPayment(
                              payment.id,
                              card.name,
                              payment.amount
                            )
                          }
                        >
                          <Text
                            style={
                              styles.undoButtonText
                            }
                          >
                            ↶ Geri Al
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                }
              )}
            </View>
          )}

          {/* BANKA KARTLARI */}

          <View
            style={
              styles.sectionHeader
            }
          >
            <View>
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Banka Kartlarım
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Banka kartlarının temel bilgileri
              </Text>
            </View>

            <Text
              style={
                styles.sectionCount
              }
            >
              {
                debitCards.length
              }
            </Text>
          </View>

          {debitCards.length ===
          0 ? (
            <View
              style={
                styles.smallEmptyCard
              }
            >
              <Text
                style={
                  styles.smallEmptyText
                }
              >
                Henüz banka kartı eklenmemiş.
              </Text>
            </View>
          ) : (
            debitCards.map(
              (card) => (
                <View
                  key={
                    card.id
                  }
                  style={
                    styles.debitCard
                  }
                >
                  <View
                    style={
                      styles.debitIdentity
                    }
                  >
                    <View
                      style={[
                        styles.cardColorIndicator,
                        {
                          backgroundColor:
                            card.color ||
                            COLORS.blue,
                        },
                      ]}
                    />

                    <View>
                      <Text
                        style={
                          styles.cardName
                        }
                      >
                        {
                          card.name
                        }
                      </Text>

                      <Text
                        style={
                          styles.cardBank
                        }
                      >
                        {
                          card.bankName
                        }
                      </Text>
                    </View>
                  </View>

                  <View
                    style={
                      styles.debitNetwork
                    }
                  >
                    <BrandLogo
                      network={
                        card.network ??
                        "other"
                      }
                      width={80}
                      height={38}
                    />
                  </View>

                  <View
                    style={
                      styles.debitType
                    }
                  >
                    <Text
                      style={
                        styles.debitTypeText
                      }
                    >
                      BANKA KARTI
                    </Text>
                  </View>

                  <View
                    style={
                      styles.debitActions
                    }
                  >
                    <Pressable
                      style={
                        styles.editButton
                      }
                      onPress={() =>
                        handleEdit(
                          card.id
                        )
                      }
                    >
                      <Text
                        style={
                          styles.editButtonText
                        }
                      >
                        ✎ Düzenle
                      </Text>
                    </Pressable>

                    <Pressable
                      style={
                        styles.deleteButton
                      }
                      onPress={() =>
                        handleDelete(
                          card.id,
                          card.name
                        )
                      }
                    >
                      <Text
                        style={
                          styles.deleteButtonText
                        }
                      >
                        Sil
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )
            )
          )}

          <Pressable
            style={
              styles.bottomAddButton
            }
            onPress={() =>
              router.push(
                "/add-card"
              )
            }
          >
            <Text
              style={
                styles.bottomAddButtonText
              }
            >
              ＋ Yeni Kart Ekle
            </Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        COLORS.bg,
    },

    content: {
      maxWidth: 1200,
      width: "100%",
      alignSelf:
        "center",
      padding: 24,
      paddingBottom: 80,
    },

    pageHeader: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      justifyContent:
        "space-between",
      gap: 20,
      marginBottom: 24,
    },

    pageHeaderCompact: {
      flexDirection: "column",
      gap: 16,
    },

    pageHeaderContent: {
      flex: 1,
      minWidth: 0,
    },

    title: {
      fontSize: 32,
      fontWeight:
        "800",
      color:
        COLORS.text,
    },

    subtitle: {
      marginTop: 6,
      color:
        COLORS.secondary,
      fontSize: 15,
      maxWidth: 700,
      lineHeight: 22,
    },

    addButton: {
      minHeight: 46,
      paddingHorizontal: 18,
      borderRadius: 13,
      backgroundColor:
        COLORS.green,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    addButtonCompact: {
      width: "100%",
    },

    addButtonText: {
      color:
        "#FFFFFF",
      fontWeight:
        "800",
      fontSize: 14,
    },

    /* GENEL UYARI */

    globalWarning: {
      flexDirection:
        "row",
      gap: 12,
      padding: 16,
      marginBottom: 18,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "#FED7AA",
      backgroundColor:
        "#FFF7ED",
    },

    globalWarningIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor:
        "#FFEDD5",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    globalWarningContent: {
      flex: 1,
    },

    globalWarningTitle: {
      fontSize: 14,
      fontWeight:
        "900",
      color:
        "#9A3412",
    },

    globalWarningText: {
      marginTop: 4,
      fontSize: 12,
      color:
        "#9A3412",
      lineHeight: 18,
    },

    statsGrid: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 14,
      marginBottom: 18,
    },

    statCard: {
      flex: 1,
      minWidth: 220,
      backgroundColor:
        COLORS.card,
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
      borderColor:
        "#ECEFF3",
    },

    statTopRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 10,
    },

    statIcon: {
      width: 34,
      height: 34,
      borderRadius: 11,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    statIconText: {
      fontSize: 17,
      color:
        COLORS.text,
      fontWeight:
        "800",
    },

    statTitle: {
      fontSize: 13,
      color:
        COLORS.secondary,
      fontWeight:
        "700",
    },

    statValue: {
      marginTop: 16,
      fontSize: 24,
      fontWeight:
        "800",
      color:
        COLORS.text,
    },

    statSubtitle: {
      marginTop: 6,
      fontSize: 12,
      color:
        COLORS.secondary,
    },

    mainDashboardCard: {
      backgroundColor:
        COLORS.card,
      borderRadius: 20,
      padding: 22,
      borderWidth: 1,
      borderColor:
        "#ECEFF3",
      marginBottom: 18,
    },

    dashboardHeader: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      gap: 20,
      marginBottom: 18,
    },

    dashboardTitle: {
      fontSize: 17,
      fontWeight:
        "800",
      color:
        COLORS.text,
    },

    dashboardSubtitle: {
      marginTop: 5,
      color:
        COLORS.secondary,
      fontSize: 13,
      lineHeight: 19,
    },

    bigPercentage: {
      fontSize: 28,
      fontWeight:
        "900",
      color:
        COLORS.blue,
    },

    progressTrack: {
      width: "100%",
      backgroundColor:
        "#E9EEF3",
      borderRadius: 99,
      overflow:
        "hidden",
    },

    progressFill: {
      borderRadius: 99,
    },

    summaryRow: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      marginTop: 18,
    },

    summaryCenter: {
      alignItems:
        "center",
    },

    summaryRight: {
      alignItems:
        "flex-end",
    },

    summaryLabel: {
      color:
        COLORS.secondary,
      fontSize: 12,
    },

    summaryValue: {
      marginTop: 4,
      color:
        COLORS.text,
      fontSize: 15,
      fontWeight:
        "800",
    },

    twoColumn: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 18,
      marginBottom: 18,
    },

    flexCard: {
      flex: 1,
      minWidth: 350,
    },

    infoCard: {
      backgroundColor:
        COLORS.card,
      borderRadius: 20,
      padding: 22,
      borderWidth: 1,
      borderColor:
        "#ECEFF3",
    },

    cardGrid: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      marginTop: 20,
      borderTopWidth: 1,
      borderTopColor:
        "#EEF1F4",
      borderBottomWidth: 1,
      borderBottomColor:
        "#EEF1F4",
    },

    cardMetric: {
      width: "25%",
      minWidth: 150,
      paddingVertical: 15,
    },

    metricLabel: {
      color:
        COLORS.secondary,
      fontSize: 11,
    },

    metricValue: {
      marginTop: 5,
      color:
        COLORS.text,
      fontSize: 14,
      fontWeight:
        "800",
    },

    monthlySpendValue: {
      marginTop: 15,
      fontSize: 30,
      fontWeight:
        "900",
      color:
        COLORS.text,
    },

    monthBars: {
      marginTop: 18,
      gap: 12,
    },

    monthBarRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 10,
    },

    monthBarName: {
      width: 110,
      fontSize: 12,
      color:
        COLORS.secondary,
      fontWeight:
        "700",
    },

    monthBarTrack: {
      flex: 1,
      height: 10,
      backgroundColor:
        "#E9EEF3",
      borderRadius: 99,
      overflow:
        "hidden",
    },

    monthBarFill: {
      height: "100%",
      backgroundColor:
        COLORS.blue,
      borderRadius: 99,
    },

    monthBarValue: {
      width: 70,
      textAlign:
        "right",
      fontSize: 12,
      color:
        COLORS.text,
      fontWeight:
        "800",
    },

    warningCard: {
      backgroundColor:
        "#FFF7ED",
      borderWidth: 1,
      borderColor:
        "#FED7AA",
      borderRadius: 18,
      padding: 18,
      flexDirection:
        "row",
      gap: 12,
      marginBottom: 25,
    },

    warningIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor:
        "#FFEDD5",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    warningContent: {
      flex: 1,
    },

    warningTitle: {
      fontSize: 14,
      fontWeight:
        "800",
      color:
        "#9A3412",
    },

    warningText: {
      marginTop: 3,
      fontSize: 13,
      color:
        "#9A3412",
      lineHeight: 19,
    },

    warningStrong: {
      fontWeight:
        "900",
    },

    sectionHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      gap: 16,
      marginBottom: 12,
      marginTop: 8,
    },

    sectionTitle: {
      fontSize: 19,
      fontWeight:
        "800",
      color:
        COLORS.text,
    },

    sectionSubtitle: {
      marginTop: 4,
      fontSize: 13,
      color:
        COLORS.secondary,
    },

    sectionCount: {
      minWidth: 34,
      height: 34,
      paddingHorizontal: 10,
      borderRadius: 17,
      backgroundColor:
        "#EEF2FF",
      color:
        COLORS.blue,
      fontSize: 13,
      fontWeight:
        "800",
      textAlign:
        "center",
      textAlignVertical:
        "center",
      paddingTop: 8,
      marginBottom: 4,
    },

    cardDashboard: {
      backgroundColor:
        COLORS.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        "#ECEFF3",
      padding: 22,
      marginBottom: 16,
    },

    cardTop: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      gap: 20,
    },

    cardIdentity: {
      flex: 1,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 12,
    },

    cardColorIndicator: {
      width: 7,
      height: 44,
      borderRadius: 7,
    },

    cardName: {
      fontSize: 17,
      fontWeight:
        "800",
      color:
        COLORS.text,
    },

    cardBank: {
      marginTop: 4,
      fontSize: 13,
      color:
        COLORS.secondary,
    },

    cardNetworkArea: {
      alignItems:
        "flex-end",
      justifyContent:
        "center",
    },

    cardMetaRow: {
      flexDirection:
        "row",
      gap: 8,
      marginTop: 15,
    },

    networkBadge: {
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 7,
      backgroundColor:
        "#F3F4F6",
    },

    networkBadgeText: {
      fontSize: 10,
      fontWeight:
        "800",
      color:
        COLORS.secondary,
    },

    creditBadge: {
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 7,
      backgroundColor:
        "#EEF6FF",
    },

    creditBadgeText: {
      fontSize: 10,
      fontWeight:
        "800",
      color:
        COLORS.blue,
    },

    /* SON ÖDEME */

    dueStatusBox: {
      marginTop: 16,
      minHeight: 64,
      borderRadius: 14,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 10,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 10,
    },

    dueStatusIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    dueStatusIconText: {
      color:
        "#FFFFFF",
      fontSize: 15,
      fontWeight:
        "900",
    },

    dueStatusContent: {
      flex: 1,
    },

    dueStatusTitle: {
      fontSize: 13,
      fontWeight:
        "900",
    },

    dueStatusText: {
      marginTop: 3,
      fontSize: 11,
      color:
        COLORS.secondary,
    },

    dueActionBadge: {
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 7,
      backgroundColor:
        "#FFFFFF",
    },

    dueActionText: {
      fontSize: 10,
      fontWeight:
        "900",
      color:
        COLORS.red,
    },

    cardUsageSection: {
      marginTop: 20,
    },

    cardUsageHeader: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      marginBottom: 10,
    },

    cardUsageTitle: {
      fontSize: 13,
      fontWeight:
        "700",
      color:
        COLORS.secondary,
    },

    cardUsagePercentage: {
      fontSize: 13,
      fontWeight:
        "900",
    },

    cardAmountRow: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      marginTop: 13,
    },

    cardAmountCenter: {
      alignItems:
        "center",
    },

    cardAmountRight: {
      alignItems:
        "flex-end",
    },

    cardAmountLabel: {
      fontSize: 11,
      color:
        COLORS.secondary,
    },

    cardAmountValue: {
      marginTop: 4,
      fontSize: 15,
      fontWeight:
        "800",
      color:
        COLORS.text,
    },

    dateInfoRow: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      gap: 15,
      marginTop: 17,
    },

    dateLabel: {
      fontSize: 10,
      color:
        COLORS.secondary,
    },

    dateValue: {
      marginTop: 4,
      fontSize: 13,
      fontWeight:
        "800",
      color:
        COLORS.text,
    },

    monthlyMiniCard: {
      marginTop: 18,
      padding: 14,
      borderRadius: 14,
      backgroundColor:
        "#F8FAFC",
      borderWidth: 1,
      borderColor:
        "#EDF0F3",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    monthlyMiniLabel: {
      fontSize: 11,
      color:
        COLORS.secondary,
    },

    monthlyMiniValue: {
      marginTop: 4,
      fontSize: 15,
      fontWeight:
        "800",
      color:
        COLORS.text,
    },

    monthlyMiniMonth: {
      fontSize: 12,
      fontWeight:
        "800",
      color:
        COLORS.blue,
    },

    cardActions: {
      flexDirection:
        "row",
      gap: 10,
      marginTop: 18,
    },

    paymentButton: {
      flex: 1.2,
      minHeight: 42,
      borderRadius: 11,
      backgroundColor:
        COLORS.green,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    paymentButtonText: {
      color:
        "#FFFFFF",
      fontSize: 13,
      fontWeight:
        "800",
    },

    editButton: {
      flex: 1,
      minHeight: 42,
      borderRadius: 11,
      backgroundColor:
        "#EEF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    editButtonText: {
      color:
        COLORS.blue,
      fontSize: 13,
      fontWeight:
        "800",
    },

    deleteButton: {
      width: 90,
      minHeight: 42,
      borderRadius: 11,
      backgroundColor:
        "#FEF2F2",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    deleteButtonText: {
      color:
        COLORS.red,
      fontSize: 13,
      fontWeight:
        "800",
    },

    /* ÖDEME GEÇMİŞİ */

    paymentHistoryCard: {
      backgroundColor:
        COLORS.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        "#ECEFF3",
      overflow:
        "hidden",
      marginBottom: 30,
    },

    paymentRow: {
      minHeight: 88,
      paddingHorizontal: 18,
      paddingVertical: 15,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      gap: 18,
      borderBottomWidth: 1,
      borderBottomColor:
        "#EEF1F4",
    },

    paymentMain: {
      flex: 1,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 12,
      minWidth: 250,
    },

    paymentCircle: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    paymentCircleText: {
      color:
        "#FFFFFF",
      fontSize: 17,
      fontWeight:
        "900",
    },

    paymentInfo: {
      flex: 1,
    },

    paymentCardName: {
      fontSize: 14,
      fontWeight:
        "800",
      color:
        COLORS.text,
    },

    paymentDate: {
      marginTop: 3,
      fontSize: 12,
      color:
        COLORS.secondary,
    },

    paymentMeta: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 8,
      marginTop: 7,
    },

    paymentMetaBadge: {
      paddingHorizontal: 7,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor:
        "#EEF6FF",
    },

    paymentMetaText: {
      fontSize: 9,
      fontWeight:
        "900",
      color:
        COLORS.blue,
    },

    paymentRight: {
      alignItems:
        "flex-end",
      gap: 8,
    },

    paymentAmount: {
      fontSize: 15,
      fontWeight:
        "900",
      color:
        COLORS.green,
    },

    undoButton: {
      minHeight: 32,
      paddingHorizontal: 10,
      borderRadius: 8,
      backgroundColor:
        "#FEF2F2",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    undoButtonText: {
      color:
        COLORS.red,
      fontSize: 11,
      fontWeight:
        "800",
    },

    paymentEmptyCard: {
      backgroundColor:
        COLORS.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        "#ECEFF3",
      padding: 25,
      marginBottom: 30,
    },

    paymentEmptyIcon: {
      fontSize: 30,
      color:
        COLORS.secondary,
      marginBottom: 8,
    },

    paymentEmptyTitle: {
      fontSize: 16,
      fontWeight:
        "800",
      color:
        COLORS.text,
    },

    paymentEmptyText: {
      marginTop: 5,
      fontSize: 13,
      color:
        COLORS.secondary,
    },

    debitCard: {
      backgroundColor:
        COLORS.card,
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
      borderColor:
        "#ECEFF3",
      marginBottom: 12,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 18,
      flexWrap:
        "wrap",
    },

    debitIdentity: {
      flex: 1,
      minWidth: 220,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 12,
    },

    debitNetwork: {
      minWidth: 100,
      alignItems:
        "center",
    },

    debitType: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor:
        "#ECFDF5",
      borderRadius: 8,
    },

    debitTypeText: {
      fontSize: 10,
      fontWeight:
        "800",
      color:
        COLORS.green,
    },

    debitActions: {
      minWidth: 190,
      flexDirection:
        "row",
      gap: 8,
    },

    bottomAddButton: {
      marginTop: 12,
      minHeight: 52,
      borderRadius: 14,
      borderWidth: 1,
      borderStyle:
        "dashed",
      borderColor:
        "#B8C4D1",
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#FBFCFD",
    },

    bottomAddButtonText: {
      color:
        COLORS.secondary,
      fontWeight:
        "800",
    },

    emptyCard: {
      backgroundColor:
        COLORS.card,
      borderRadius: 22,
      padding: 45,
      alignItems:
        "center",
      borderWidth: 1,
      borderColor:
        "#ECEFF3",
    },

    emptyIcon: {
      fontSize: 45,
    },

    emptyTitle: {
      marginTop: 12,
      fontSize: 22,
      fontWeight:
        "800",
      color:
        COLORS.text,
    },

    emptySubtitle: {
      maxWidth: 500,
      textAlign:
        "center",
      lineHeight: 21,
      marginTop: 8,
      color:
        COLORS.secondary,
    },

    emptyButton: {
      marginTop: 20,
      minHeight: 46,
      paddingHorizontal: 20,
      borderRadius: 12,
      backgroundColor:
        COLORS.blue,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    emptyButtonText: {
      color:
        "#FFFFFF",
      fontWeight:
        "800",
    },

    smallEmptyCard: {
      backgroundColor:
        COLORS.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "#ECEFF3",
      padding: 20,
      marginBottom: 14,
    },

    smallEmptyText: {
      color:
        COLORS.secondary,
      fontSize: 13,
    },

    brandLogo: {
      borderRadius: 9,
      alignItems:
        "center",
      justifyContent:
        "center",
      overflow:
        "hidden",
    },

    visaLogo: {
      backgroundColor:
        "#1A1F71",
    },

    visaText: {
      color:
        "#FFFFFF",
      fontSize: 17,
      fontWeight:
        "900",
      fontStyle:
        "italic",
    },

    mastercardLogo: {
      backgroundColor:
        "#FFFFFF",
    },

    masterCircleLeft: {
      position:
        "absolute",
      left: 20,
      width: 27,
      height: 27,
      borderRadius: 14,
      backgroundColor:
        "#EB001B",
    },

    masterCircleRight: {
      position:
        "absolute",
      left: 34,
      width: 27,
      height: 27,
      borderRadius: 14,
      backgroundColor:
        "#F79E1B",
      opacity: 0.9,
    },

    mastercardText: {
      marginTop: 27,
      fontSize: 8,
      fontWeight:
        "900",
      color:
        "#111827",
    },

    amexLogo: {
      backgroundColor:
        "#2E77BC",
    },

    amexText: {
      color:
        "#FFFFFF",
      fontSize: 8,
      fontWeight:
        "900",
      lineHeight: 10,
    },

    otherLogo: {
      backgroundColor:
        "#F1F3F5",
    },

    otherLogoText: {
      color:
        COLORS.secondary,
      fontWeight:
        "800",
      fontSize: 9,
    },
  });
