import {
    useCallback,
    useEffect,
    useState,
} from 'react';

import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
    Linking
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import NewsListItem from '../components/NewsListItem';

import {
    getNewsList,
    LatestNewsApiError,
} from '../services/LatestNews';

import {
    COLORS,
    SPACING,
} from '../constants/theme';

export default function NewsScreen({
    navigation,
}) {

    async function handleOpenMoreNews() {
        const url =
            'https://arquidiocesedeteresina.org.br/category/noticias/';

        try {
            const canOpen =
                await Linking.canOpenURL(url);

            if (canOpen) {
                await Linking.openURL(url);
            }
        } catch (linkError) {
            console.error(
                'Erro ao abrir mais notícias:',
                linkError
            );
        }
    }

    const [news, setNews] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState(null);

    const loadNews = useCallback(
        async ({
            ignoreCache = false,
            signal,
        } = {}) => {
            setError(null);

            try {
                const response =
                    await getNewsList({
                        ignoreCache,
                        signal,
                    });

                setNews(response);
            } catch (requestError) {
                if (
                    requestError?.name ===
                    'AbortError'
                ) {
                    return;
                }

                console.error(
                    'Erro ao carregar notícias:',
                    requestError
                );

                const message =
                    requestError instanceof
                        LatestNewsApiError
                        ? requestError.message
                        : 'Não foi possível carregar as notícias.';

                setError(message);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        []
    );

    useEffect(() => {
        const controller =
            new AbortController();

        loadNews({
            signal: controller.signal,
        });

        return () => {
            controller.abort();
        };
    }, [loadNews]);

    function handleRefresh() {
        setRefreshing(true);

        loadNews({
            ignoreCache: true,
        });
    }

    function handleRetry() {
        setLoading(true);

        loadNews({
            ignoreCache: true,
        });
    }

    function openNews(item) {
        navigation.navigate(
            'NewsDetails',
            {
                newsId: item.id,
                initialNews: item,
            }
        );
    }

    if (loading && news.length === 0) {
        return (
            <View style={styles.stateContainer}>
                <ActivityIndicator
                    size="large"
                    color={COLORS.primary}
                />

                <Text style={styles.stateText}>
                    Carregando notícias...
                </Text>
            </View>
        );
    }

    if (
        error &&
        news.length === 0
    ) {
        return (
            <View style={styles.stateContainer}>
                <Ionicons
                    name="cloud-offline-outline"
                    size={48}
                    color={COLORS.primary}
                />

                <Text style={styles.errorTitle}>
                    Não foi possível carregar
                </Text>

                <Text style={styles.errorText}>
                    {error}
                </Text>

                <Pressable
                    onPress={handleRetry}
                    style={({ pressed }) => [
                        styles.retryButton,
                        pressed &&
                        styles.buttonPressed,
                    ]}
                >
                    <Text
                        style={
                            styles.retryButtonText
                        }
                    >
                        Tentar novamente
                    </Text>
                </Pressable>
            </View>
        );
    }

    return (
        <FlatList
            data={news}
            keyExtractor={(item) =>
                String(item.id)
            }
            renderItem={({ item }) => (
                <NewsListItem
                    news={item}
                    onPress={() =>
                        openNews(item)
                    }
                />
            )}
            contentContainerStyle={
                styles.content
            }
            showsVerticalScrollIndicator={
                false
            }
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={[COLORS.primary]}
                    tintColor={COLORS.primary}
                />
            }
            ListHeaderComponent={
                <View style={styles.header}>
                    <Text style={styles.title}>
                        Notícias
                    </Text>

                    <Text style={styles.subtitle}>
                        Acompanhe as últimas notícias,
                        eventos e atividades da
                        Arquidiocese de Teresina.
                    </Text>
                </View>
            }
            ListFooterComponent={
                news.length > 0 ? (
                    <View style={styles.footer}>
                        <Pressable
                            onPress={handleOpenMoreNews}
                            accessibilityRole="link"
                            accessibilityLabel="Ler mais notícias no site da Arquidiocese de Teresina"
                            style={({ pressed }) => [
                                styles.moreNewsButton,
                                pressed &&
                                styles.buttonPressed,
                            ]}
                        >
                            <Ionicons
                                name="newspaper-outline"
                                size={20}
                                color={COLORS.surface}
                            />

                            <Text
                                style={
                                    styles.moreNewsButtonText
                                }
                            >
                                Ler mais notícias
                            </Text>

                            <Ionicons
                                name="open-outline"
                                size={18}
                                color={COLORS.surface}
                            />
                        </Pressable>

                        <Text style={styles.footerText}>
                            Você será direcionado para o site
                            da Arquidiocese de Teresina.
                        </Text>
                    </View>
                ) : null
            }
            ListEmptyComponent={
                <View
                    style={
                        styles.emptyContainer
                    }
                >
                    <Ionicons
                        name="newspaper-outline"
                        size={42}
                        color={COLORS.textMuted}
                    />

                    <Text style={styles.emptyText}>
                        Nenhuma notícia encontrada.
                    </Text>
                </View>
            }
        />
    );
}

const styles = StyleSheet.create({
    content: {
        flexGrow: 1,
        padding: SPACING.md,
        paddingBottom: SPACING.xl,
        backgroundColor:
            COLORS.background,
    },

    header: {
        marginBottom: SPACING.lg,
    },

    title: {
        color: COLORS.text,
        fontSize: 28,
        fontWeight: '900',
    },

    subtitle: {
        marginTop: SPACING.sm,
        color: COLORS.textMuted,
        fontSize: 14,
        lineHeight: 21,
    },

    stateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
        backgroundColor:
            COLORS.background,
    },

    stateText: {
        marginTop: SPACING.md,
        color: COLORS.textMuted,
    },

    errorTitle: {
        marginTop: SPACING.md,
        color: COLORS.text,
        fontSize: 19,
        fontWeight: '800',
    },

    errorText: {
        marginTop: SPACING.sm,
        color: COLORS.textMuted,
        lineHeight: 21,
        textAlign: 'center',
    },

    retryButton: {
        marginTop: SPACING.lg,
        paddingHorizontal:
            SPACING.lg,
        paddingVertical:
            SPACING.md,
        borderRadius: 12,
        backgroundColor:
            COLORS.primary,
    },

    retryButtonText: {
        color: COLORS.surface,
        fontWeight: '800',
    },

    buttonPressed: {
        opacity: 0.72,
    },

    emptyContainer: {
        alignItems: 'center',
        paddingVertical:
            SPACING.xl * 2,
    },

    emptyText: {
        marginTop: SPACING.md,
        color: COLORS.textMuted,
    },
    footer: {
        alignItems: 'center',
        marginTop: SPACING.md,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.lg,
    },

    moreNewsButton: {
        width: '100%',
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
    },

    moreNewsButtonText: {
        color: COLORS.surface,
        fontSize: 15,
        fontWeight: '800',
    },

    footerText: {
        marginTop: SPACING.sm,
        color: COLORS.textMuted,
        fontSize: 12,
        lineHeight: 18,
        textAlign: 'center',
    },
});