import {
    useEffect,
    useState,
} from 'react';

import {
    ActivityIndicator,
    Image,
    Linking,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import RenderHtml from 'react-native-render-html';

import {
    getNewsById,
    LatestNewsApiError,
} from '../services/LatestNews';

import {
    COLORS,
    SPACING,
} from '../constants/theme';

function formatNewsDate(dateString) {
    if (!dateString) {
        return '';
    }

    const date = new Date(dateString);

    if (
        Number.isNaN(date.getTime())
    ) {
        return '';
    }

    return new Intl.DateTimeFormat(
        'pt-BR',
        {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }
    ).format(date);
}

export default function NewsDetailsScreen({
    route,
}) {
    const { width } =
        useWindowDimensions();

    const {
        newsId,
        initialNews,
    } = route.params || {};

    const [news, setNews] =
        useState(initialNews || null);

    const [loading, setLoading] =
        useState(!initialNews);

    const [imageAspectRatio, setImageAspectRatio] =
        useState(16 / 9);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState(null);

    async function loadNews({
        ignoreCache = false,
        signal,
    } = {}) {
        if (!newsId) {
            setError(
                'A notícia selecionada é inválida.'
            );

            setLoading(false);
            setRefreshing(false);
            return;
        }

        try {
            setError(null);

            const response =
                await getNewsById(
                    newsId,
                    {
                        ignoreCache,
                        signal,
                    }
                );

            setNews(response);
        } catch (requestError) {
            if (
                requestError?.name ===
                'AbortError'
            ) {
                return;
            }

            console.error(
                'Erro ao carregar notícia:',
                requestError
            );

            const message =
                requestError instanceof
                    LatestNewsApiError
                    ? requestError.message
                    : 'Não foi possível carregar esta notícia.';

            if (!news) {
                setError(message);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        const controller =
            new AbortController();

        loadNews({
            signal: controller.signal,
        });

        return () => {
            controller.abort();
        };
    }, [newsId]);

    function handleRefresh() {
        setRefreshing(true);

        loadNews({
            ignoreCache: true,
        });
    }

    async function openOriginalNews() {
        if (!news?.link) {
            return;
        }

        try {
            const canOpen =
                await Linking.canOpenURL(
                    news.link
                );

            if (canOpen) {
                await Linking.openURL(
                    news.link
                );
            }
        } catch (linkError) {
            console.error(
                'Erro ao abrir notícia:',
                linkError
            );
        }
    }

    function handleContentLink(
        _event,
        href
    ) {
        if (!href) {
            return;
        }

        Linking.openURL(href).catch(
            (linkError) => {
                console.error(
                    'Erro ao abrir link:',
                    linkError
                );
            }
        );
    }

    if (loading && !news) {
        return (
            <View style={styles.stateContainer}>
                <ActivityIndicator
                    size="large"
                    color={COLORS.primary}
                />

                <Text style={styles.stateText}>
                    Carregando notícia...
                </Text>
            </View>
        );
    }

    if (error && !news) {
        return (
            <View style={styles.stateContainer}>
                <Ionicons
                    name="alert-circle-outline"
                    size={48}
                    color={COLORS.primary}
                />

                <Text style={styles.errorTitle}>
                    Notícia indisponível
                </Text>

                <Text style={styles.errorText}>
                    {error}
                </Text>

                <Pressable
                    onPress={() => {
                        setLoading(true);

                        loadNews({
                            ignoreCache: true,
                        });
                    }}
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

    if (!news) {
        return null;
    }

    return (
        <ScrollView
            style={styles.container}
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
        >
            {news.imageUrl ? (
                <Image
                    source={{
                        uri: news.imageUrl,
                    }}
                    resizeMode="contain"
                    accessibilityLabel={
                        news.imageAlt
                    }
                    onLoad={({ nativeEvent }) => {
                        const imageWidth =
                            nativeEvent?.source?.width;

                        const imageHeight =
                            nativeEvent?.source?.height;

                        if (
                            imageWidth > 0 &&
                            imageHeight > 0
                        ) {
                            setImageAspectRatio(
                                imageWidth / imageHeight
                            );
                        }
                    }}
                    style={[
                        styles.coverImage,
                        {
                            aspectRatio:
                                imageAspectRatio,
                        },
                    ]}
                />
            ) : (
                <View
                    style={
                        styles.coverFallback
                    }
                >
                    <Ionicons
                        name="newspaper-outline"
                        size={54}
                        color={COLORS.primary}
                    />
                </View>
            )}

            <View style={styles.articleHeader}>
                {news.categories?.[0] ? (
                    <Text style={styles.category}>
                        {news.categories[0].name}
                    </Text>
                ) : null}

                <Text style={styles.title}>
                    {news.title}
                </Text>

                <View style={styles.metadata}>
                    <View style={styles.metadataItem}>
                        <Ionicons
                            name="calendar-outline"
                            size={15}
                            color={COLORS.textMuted}
                        />

                        <Text
                            style={styles.metadataText}
                        >
                            {formatNewsDate(news.date)}
                        </Text>
                    </View>

                    <View style={styles.metadataItem}>
                        <Ionicons
                            name="person-outline"
                            size={15}
                            color={COLORS.textMuted}
                        />

                        <Text
                            style={styles.metadataText}
                        >
                            {news.author}
                        </Text>
                    </View>
                </View>


            </View>

            <View style={styles.article}>
                <RenderHtml
                    contentWidth={Math.max(
                        width - SPACING.md * 4,
                        0
                    )}
                    source={{
                        html:
                            news.contentHtml ||
                            '<p>Conteúdo não disponível.</p>',
                    }}
                    baseStyle={styles.htmlBase}
                    tagsStyles={htmlTagStyles}
                    defaultTextProps={{
                        selectable: true,
                    }}
                    renderersProps={{
                        a: {
                            onPress:
                                handleContentLink,
                        },
                    }}
                />
            </View>

            {news.link ? (
                <Pressable
                    onPress={openOriginalNews}
                    style={({ pressed }) => [
                        styles.originalButton,
                        pressed &&
                        styles.buttonPressed,
                    ]}
                >
                    <Ionicons
                        name="open-outline"
                        size={19}
                        color={COLORS.primary}
                    />

                    <Text
                        style={
                            styles.originalButtonText
                        }
                    >
                        Ver notícia original
                    </Text>
                </Pressable>
            ) : null}
        </ScrollView>
    );
}

const htmlTagStyles = {
    body: {
        color: COLORS.text,
        fontSize: 16,
        lineHeight: 26,
    },

    p: {
        marginTop: 0,
        marginBottom: 16,
        color: COLORS.text,
        fontSize: 16,
        lineHeight: 26,
    },

    h1: {
        marginTop: 20,
        marginBottom: 12,
        color: COLORS.text,
        fontSize: 25,
        lineHeight: 32,
    },

    h2: {
        marginTop: 20,
        marginBottom: 10,
        color: COLORS.primary,
        fontSize: 22,
        lineHeight: 29,
    },

    h3: {
        marginTop: 18,
        marginBottom: 8,
        color: COLORS.text,
        fontSize: 19,
        lineHeight: 26,
    },

    a: {
        color: COLORS.primary,
        textDecorationLine: 'underline',
    },

    blockquote: {
        marginVertical: 16,
        paddingLeft: 14,
        borderLeftWidth: 3,
        borderLeftColor:
            COLORS.primary,
        color: COLORS.textMuted,
    },

    li: {
        marginBottom: 8,
        color: COLORS.text,
        fontSize: 16,
        lineHeight: 25,
    },

    figure: {
        marginVertical: 16,
    },

    figcaption: {
        marginTop: 6,
        color: COLORS.textMuted,
        fontSize: 12,
        textAlign: 'center',
    },

    strong: {
        fontWeight: '800',
    },
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:
            COLORS.background,
    },

    content: {
        padding: SPACING.md,
        paddingBottom:
            SPACING.xl * 2,
    },

    coverImage: {
        width: '100%',
        borderRadius: 18,
        backgroundColor:
            COLORS.border,
    },

    coverFallback: {
        width: '100%',
        height: 210,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 18,
        backgroundColor:
            COLORS.surface,
    },

    articleHeader: {
        marginTop: SPACING.lg,
    },

    category: {
        alignSelf: 'flex-start',
        marginBottom: SPACING.sm,
        paddingHorizontal:
            SPACING.sm,
        paddingVertical:
            SPACING.xs,
        borderRadius: 999,
        backgroundColor:
            `${COLORS.primary}12`,
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '800',
    },

    title: {
        color: COLORS.text,
        fontSize: 27,
        fontWeight: '900',
        lineHeight: 35,
    },

    metadata: {
        gap: SPACING.sm,
        marginTop: SPACING.md,
    },

    metadataItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },

    metadataText: {
        flex: 1,
        color: COLORS.textMuted,
        fontSize: 13,
        
    },

    excerpt: {
        marginTop: SPACING.md,
        color: COLORS.textMuted,
        fontSize: 16,
        fontStyle: 'italic',
        lineHeight: 25,
    },

    article: {
        marginTop: SPACING.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 18,
        backgroundColor:
            COLORS.surface,
    },

    htmlBase: {
        color: COLORS.text,
        fontSize: 16,
        lineHeight: 26,
    },

    originalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        marginTop: SPACING.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor:
            COLORS.primary,
        borderRadius: 12,
    },

    originalButtonText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '800',
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
});