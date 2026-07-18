import {
    useCallback,
    useEffect,
    useState,
} from 'react';

import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';

import SectionTitle from './SectionTitle';
import ChurchCardMini from './ChurchCardMini';

import {
    useFavorites,
} from '../contexts/FavoritesContext';

import {
    ChurchApiError,
    getNearbyChurches,
} from '../services/ChurchApi';

import {
    COLORS,
    SPACING,
} from '../constants/theme';

export default function NearbyChurchesSection({
    onOpenChurch,
    onSeeAll,
}) {

    const {
        isFavorite,
        toggleFavorite,
    } = useFavorites();

    const [churches, setChurches] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState(null);

    const [
        permissionDenied,
        setPermissionDenied,
    ] = useState(false);

    const loadChurches = useCallback(
        async ({
            signal,
            ignoreCache = false,
        } = {}) => {
            setLoading(true);
            setError(null);
            setPermissionDenied(false);

            try {
                const permission =
                    await Location
                        .requestForegroundPermissionsAsync();

                if (
                    permission.status !== 'granted'
                ) {
                    setPermissionDenied(true);
                    return;
                }

                let position =
                    await Location
                        .getLastKnownPositionAsync({
                            maxAge: 60 * 1000,
                            requiredAccuracy: 1000,
                        });

                if (!position) {
                    position =
                        await Location
                            .getCurrentPositionAsync({
                                accuracy:
                                    Location.Accuracy
                                        .Balanced,
                            });
                }

                const response =
                    await getNearbyChurches({
                        latitude:
                            position.coords.latitude,

                        longitude:
                            position.coords.longitude,

                        ignoreCache,
                        signal,
                    });

                setChurches(
                    response.igrejas
                );
            } catch (requestError) {
                if (
                    requestError?.name ===
                    'AbortError'
                ) {
                    return;
                }

                console.error(
                    'Erro ao carregar igrejas próximas:',
                    requestError
                );

                setError(
                    requestError instanceof
                        ChurchApiError
                        ? requestError.message
                        : 'Não foi possível carregar as igrejas próximas.'
                );
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        const controller =
            new AbortController();

        loadChurches({
            signal: controller.signal,
        });

        return () => {
            controller.abort();
        };
    }, [loadChurches]);

    return (
        <View style={styles.section}>
            <SectionTitle
                title="Igrejas próximas"
                actionLabel="Ver todas"
                onActionPress={onSeeAll}
            />

            {loading ? (
                <View style={styles.stateContainer}>
                    <ActivityIndicator
                        color={COLORS.primary}
                    />

                    <Text style={styles.stateText}>
                        Buscando igrejas próximas...
                    </Text>
                </View>
            ) : null}

            {!loading &&
                permissionDenied ? (
                <View style={styles.notice}>
                    <Ionicons
                        name="location-outline"
                        size={28}
                        color={COLORS.primary}
                    />

                    <View style={styles.noticeContent}>
                        <Text style={styles.noticeTitle}>
                            Localização necessária
                        </Text>

                        <Text style={styles.noticeText}>
                            Permita o acesso à sua
                            localização para encontrar
                            as igrejas mais próximas.
                        </Text>

                        <Pressable
                            onPress={() =>
                                loadChurches({
                                    ignoreCache: true,
                                })
                            }
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
                                Permitir localização
                            </Text>
                        </Pressable>
                    </View>
                </View>
            ) : null}

            {!loading &&
                error &&
                !permissionDenied ? (
                <View style={styles.notice}>
                    <Ionicons
                        name="alert-circle-outline"
                        size={28}
                        color={COLORS.primary}
                    />

                    <View style={styles.noticeContent}>
                        <Text style={styles.noticeTitle}>
                            Não foi possível carregar
                        </Text>

                        <Text style={styles.noticeText}>
                            {error}
                        </Text>

                        <Pressable
                            onPress={() =>
                                loadChurches({
                                    ignoreCache: true,
                                })
                            }
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
                </View>
            ) : null}

            {!loading &&
                !error &&
                !permissionDenied &&
                churches.length > 0 ? (
                <FlatList
                    horizontal
                    data={churches}
                    keyExtractor={(item) =>
                        String(item.id)
                    }
                    renderItem={({ item }) => (
                        <ChurchCardMini
                            church={item}
                            isFavorite={isFavorite(item.id)}
                            onFavoritePress={() =>
                                toggleFavorite(item)
                            }
                            onPress={() =>
                                onOpenChurch?.(item)
                            }
                        />
                    )}
                    showsHorizontalScrollIndicator={
                        false
                    }
                />
            ) : null}

            {!loading &&
                !error &&
                !permissionDenied &&
                churches.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.stateText}>
                        Nenhuma igreja próxima foi
                        encontrada.
                    </Text>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        marginTop: SPACING.lg,
    },

    stateContainer: {
        minHeight: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
    },

    stateText: {
        color: COLORS.textMuted,
        fontSize: 13,
        lineHeight: 19,
        textAlign: 'center',
    },

    notice: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: SPACING.md,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 14,
        backgroundColor: COLORS.surface,
    },

    noticeContent: {
        flex: 1,
    },

    noticeTitle: {
        color: COLORS.text,
        fontSize: 15,
        fontWeight: '800',
    },

    noticeText: {
        marginTop: SPACING.xs,
        color: COLORS.textMuted,
        fontSize: 13,
        lineHeight: 19,
    },

    retryButton: {
        alignSelf: 'flex-start',
        marginTop: SPACING.sm,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: 10,
        backgroundColor: COLORS.primary,
    },

    retryButtonText: {
        color: COLORS.surface,
        fontSize: 12,
        fontWeight: '800',
    },

    buttonPressed: {
        opacity: 0.7,
    },

    empty: {
        padding: SPACING.lg,
        borderRadius: 14,
        backgroundColor: COLORS.surface,
    },
});