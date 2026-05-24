import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type WorkMode = 'KÖRNING' | 'RAST' | 'ARBETE' | 'REDO';

type SyncStatus = 'SYNCED' | 'PENDING' | 'OFFLINE';

type TripPurpose = 'TJÄNST' | 'PRIVAT';

interface RestTank {
  requiredMinutes: number;
  accumulatedMinutes: number;
  isComplete: boolean;
}

interface TripData {
  id: string;
  startTime: Date;
  endTime: Date | null;
  startLocation: string;
  endLocation: string | null;
  distanceKm: number;
  purpose: TripPurpose;
  isLocked: boolean;
}

interface DashboardState {
  workMode: WorkMode;
  syncStatus: SyncStatus;
  currentTripStart: Date | null;
  currentTripDistance: number;
  startLocation: string;
  restTank1: RestTank; // 3h minimum
  restTank2: RestTank; // 8h minimum
  totalRestMinutes: number;
  todayTrips: number;
  todayDistanceKm: number;
  todayWorkMinutes: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEYS = {
  DASHBOARD_STATE: '@korjournal/dashboard_state',
  PENDING_TRIPS: '@korjournal/pending_trips',
} as const;

const REST_REQUIREMENTS = {
  TANK_1_MINUTES: 180, // 3 hours
  TANK_2_MINUTES: 480, // 8 hours
  TOTAL_REQUIRED: 660, // 11 hours total
} as const;

const HOLD_DURATION_MS = 2000; // 2 seconds to stop trip

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function formatMinutesToHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function calculateRestTanks(totalRestMinutes: number): {
  tank1: RestTank;
  tank2: RestTank;
} {
  // Tank 1 fills first (up to 3h), then Tank 2 fills (up to 8h)
  const tank1Minutes = Math.min(totalRestMinutes, REST_REQUIREMENTS.TANK_1_MINUTES);
  const remainingForTank2 = Math.max(0, totalRestMinutes - REST_REQUIREMENTS.TANK_1_MINUTES);
  const tank2Minutes = Math.min(remainingForTank2, REST_REQUIREMENTS.TANK_2_MINUTES);

  return {
    tank1: {
      requiredMinutes: REST_REQUIREMENTS.TANK_1_MINUTES,
      accumulatedMinutes: tank1Minutes,
      isComplete: tank1Minutes >= REST_REQUIREMENTS.TANK_1_MINUTES,
    },
    tank2: {
      requiredMinutes: REST_REQUIREMENTS.TANK_2_MINUTES,
      accumulatedMinutes: tank2Minutes,
      isComplete: tank2Minutes >= REST_REQUIREMENTS.TANK_2_MINUTES,
    },
  };
}

function getComplianceStatus(tank1: RestTank, tank2: RestTank): {
  status: 'OK' | 'WARNING' | 'VIOLATION';
  message: string;
  remainingMinutes: number;
} {
  const tank1Remaining = Math.max(0, tank1.requiredMinutes - tank1.accumulatedMinutes);
  const tank2Remaining = Math.max(0, tank2.requiredMinutes - tank2.accumulatedMinutes);
  const totalRemaining = tank1Remaining + tank2Remaining;

  if (tank1.isComplete && tank2.isComplete) {
    return {
      status: 'OK',
      message: 'COMPLIANT — Du har vilat tillräckligt',
      remainingMinutes: 0,
    };
  }

  if (totalRemaining <= 60) {
    return {
      status: 'WARNING',
      message: `VARNING: Vila ${totalRemaining} min till`,
      remainingMinutes: totalRemaining,
    };
  }

  return {
    status: 'VIOLATION',
    message: `Vila ${formatMinutesToHours(totalRemaining)} till innan körning`,
    remainingMinutes: totalRemaining,
  };
}

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

function usePersistedState(): {
  state: DashboardState;
  updateState: (updates: Partial<DashboardState>) => Promise<void>;
  isLoading: boolean;
} {
  const [state, setState] = useState<DashboardState>({
    workMode: 'REDO',
    syncStatus: 'SYNCED',
    currentTripStart: null,
    currentTripDistance: 0,
    startLocation: '',
    restTank1: {
      requiredMinutes: REST_REQUIREMENTS.TANK_1_MINUTES,
      accumulatedMinutes: 180,
      isComplete: true,
    },
    restTank2: {
      requiredMinutes: REST_REQUIREMENTS.TANK_2_MINUTES,
      accumulatedMinutes: 480,
      isComplete: true,
    },
    totalRestMinutes: 660,
    todayTrips: 3,
    todayDistanceKm: 127.4,
    todayWorkMinutes: 245,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPersistedState();
  }, []);

  const loadPersistedState = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.DASHBOARD_STATE);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState((prev) => ({
          ...prev,
          ...parsed,
          currentTripStart: parsed.currentTripStart
            ? new Date(parsed.currentTripStart)
            : null,
        }));
      }
    } catch (error) {
      console.error('[Körjournal] Failed to load state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateState = async (updates: Partial<DashboardState>) => {
    const newState = { ...state, ...updates };
    setState(newState);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.DASHBOARD_STATE,
        JSON.stringify(newState)
      );
    } catch (error) {
      console.error('[Körjournal] Failed to persist state:', error);
    }
  };

  return { state, updateState, isLoading };
}

function useTripTimer(startTime: Date | null): number {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) {
      setElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsed(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return elapsed;
}

function useLongPress(
  onComplete: () => void,
  duration: number = HOLD_DURATION_MS
): {
  progress: Animated.Value;
  isHolding: boolean;
  handlers: {
    onPressIn: () => void;
    onPressOut: () => void;
  };
} {
  const progress = useRef(new Animated.Value(0)).current;
  const [isHolding, setIsHolding] = useState(false);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const completedRef = useRef(false);

  const onPressIn = useCallback(() => {
    setIsHolding(true);
    completedRef.current = false;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    animationRef.current = Animated.timing(progress, {
      toValue: 1,
      duration,
      useNativeDriver: false,
    });

    animationRef.current.start(({ finished }) => {
      if (finished && !completedRef.current) {
        completedRef.current = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onComplete();
      }
    });
  }, [duration, onComplete, progress]);

  const onPressOut = useCallback(() => {
    setIsHolding(false);
    if (animationRef.current) {
      animationRef.current.stop();
    }
    Animated.timing(progress, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return {
    progress,
    isHolding,
    handlers: { onPressIn, onPressOut },
  };
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface SyncStatusBadgeProps {
  status: SyncStatus;
}

function SyncStatusBadge({ status }: SyncStatusBadgeProps) {
  const configs = {
    SYNCED: {
      bg: 'bg-emerald-500/20',
      text: 'text-emerald-400',
      icon: 'checkmark-circle' as const,
      label: 'SYNKAD',
    },
    PENDING: {
      bg: 'bg-amber-500/20',
      text: 'text-amber-400',
      icon: 'cloud-upload' as const,
      label: 'SYNKAR...',
    },
    OFFLINE: {
      bg: 'bg-amber-500/20',
      text: 'text-amber-400',
      icon: 'cloud-offline' as const,
      label: 'OFFLINE — Data sparas lokalt',
    },
  };

  const config = configs[status];

  return (
    <View className={`flex-row items-center px-3 py-2 rounded-lg ${config.bg}`}>
      <Ionicons name={config.icon} size={16} color={config.text.includes('emerald') ? '#34d399' : '#fbbf24'} />
      <Text className={`ml-2 text-sm font-medium ${config.text}`}>
        {config.label}
      </Text>
    </View>
  );
}

interface ActiveTripCardProps {
  elapsedSeconds: number;
  startLocation: string;
  distanceKm: number;
}

function ActiveTripCard({ elapsedSeconds, startLocation, distanceKm }: ActiveTripCardProps) {
  return (
    <View className="bg-emerald-500/10 border-2 border-emerald-500 rounded-2xl p-6 items-center">
      <View className="flex-row items-center mb-2">
        <Ionicons name="car" size={28} color="#34d399" />
        <Text className="ml-3 text-emerald-400 text-xl font-bold">
          KÖRNING AKTIV
        </Text>
      </View>
      <Text className="text-white text-4xl font-mono font-bold tracking-wider">
        {formatDuration(elapsedSeconds)}
      </Text>

      <View className="mt-4 w-full">
        <View className="flex-row items-center mb-2">
          <Ionicons name="location" size={16} color="#9ca3af" />
          <Text className="ml-2 text-gray-400 text-sm">
            Från: {startLocation || 'Hämtar position...'}
          </Text>
        </View>
        <View className="flex-row items-center mb-2">
          <Ionicons name="navigate" size={16} color="#9ca3af" />
          <Text className="ml-2 text-gray-400 text-sm">Till: — (pågående)</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="speedometer" size={16} color="#9ca3af" />
          <Text className="ml-2 text-gray-400 text-sm">
            Distans: {distanceKm.toFixed(1)} km
          </Text>
        </View>
      </View>
    </View>
  );
}

interface RestTankVisualizerProps {
  tank1: RestTank;
  tank2: RestTank;
  totalRestMinutes: number;
}

function RestTankVisualizer({ tank1, tank2, totalRestMinutes }: RestTankVisualizerProps) {
  const compliance = getComplianceStatus(tank1, tank2);

  const tank1Percentage = Math.min(
    100,
    (tank1.accumulatedMinutes / tank1.requiredMinutes) * 100
  );
  const tank2Percentage = Math.min(
    100,
    (tank2.accumulatedMinutes / tank2.requiredMinutes) * 100
  );

  const getStatusColor = (status: 'OK' | 'WARNING' | 'VIOLATION') => {
    switch (status) {
      case 'OK':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: 'checkmark-circle' as const };
      case 'WARNING':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: 'warning' as const };
      case 'VIOLATION':
        return { bg: 'bg-red-500/20', text: 'text-red-400', icon: 'close-circle' as const };
    }
  };

  const statusConfig = getStatusColor(compliance.status);

  return (
    <View className="bg-slate-800/50 rounded-2xl p-5">
      <Text className="text-white text-lg font-semibold mb-4">
        VILA-STATUS (24 timmar)
      </Text>

      {/* Total Rest Progress Bar */}
      <View className="mb-4">
        <View className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <View
            className="h-full bg-emerald-500 rounded-full"
            style={{
              width: `${Math.min(100, (totalRestMinutes / REST_REQUIREMENTS.TOTAL_REQUIRED) * 100)}%`,
            }}
          />
        </View>
        <Text className="text-gray-400 text-sm mt-1">
          {formatMinutesToHours(totalRestMinutes)} vilat av {formatMinutesToHours(REST_REQUIREMENTS.TOTAL_REQUIRED)} krav
        </Text>
      </View>

      {/* Two Tank Display */}
      <View className="flex-row justify-between gap-4 mb-4">
        {/* Tank 1: 3h */}
        <View className="flex-1 bg-slate-700/50 rounded-xl p-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-300 font-medium">DEL 1: 3h</Text>
            {tank1.isComplete && (
              <Ionicons name="checkmark-circle" size={18} color="#34d399" />
            )}
          </View>
          <View className="h-24 bg-slate-800 rounded-lg overflow-hidden flex-col-reverse">
            <View
              className={`w-full ${tank1.isComplete ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ height: `${tank1Percentage}%` }}
            />
          </View>
          <Text className="text-gray-400 text-xs mt-2 text-center">
            {formatMinutesToHours(tank1.accumulatedMinutes)} / {formatMinutesToHours(tank1.requiredMinutes)}
          </Text>
          {!tank1.isComplete && (
            <Text className="text-amber-400 text-xs mt-1 text-center">
              {formatMinutesToHours(tank1.requiredMinutes - tank1.accumulatedMinutes)} kvar
            </Text>
          )}
        </View>

        {/* Tank 2: 8h */}
        <View className="flex-1 bg-slate-700/50 rounded-xl p-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-300 font-medium">DEL 2: 8h</Text>
            {tank2.isComplete && (
              <Ionicons name="checkmark-circle" size={18} color="#34d399" />
            )}
          </View>
          <View className="h-24 bg-slate-800 rounded-lg overflow-hidden flex-col-reverse">
            <View
              className={`w-full ${tank2.isComplete ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ height: `${tank2Percentage}%` }}
            />
          </View>
          <Text className="text-gray-400 text-xs mt-2 text-center">
            {formatMinutesToHours(tank2.accumulatedMinutes)} / {formatMinutesToHours(tank2.requiredMinutes)}
          </Text>
          {!tank2.isComplete && (
            <Text className="text-amber-400 text-xs mt-1 text-center">
              {formatMinutesToHours(tank2.requiredMinutes - tank2.accumulatedMinutes)} kvar
            </Text>
          )}
        </View>
      </View>

      {/* Compliance Status Banner */}
      <View className={`flex-row items-center p-3 rounded-xl ${statusConfig.bg}`}>
        <Ionicons
          name={statusConfig.icon}
          size={20}
          color={statusConfig.text.includes('emerald') ? '#34d399' : statusConfig.text.includes('amber') ? '#fbbf24' : '#f87171'}
        />
        <Text className={`ml-2 font-medium ${statusConfig.text}`}>
          {compliance.message}
        </Text>
      </View>
    </View>
  );
}

interface TodaySummaryProps {
  trips: number;
  distanceKm: number;
  workMinutes: number;
}

function TodaySummary({ trips, distanceKm, workMinutes }: TodaySummaryProps) {
  return (
    <View className="bg-slate-800/50 rounded-2xl p-5">
      <Text className="text-white text-lg font-semibold mb-4">
        DAGENS SAMMANFATTNING
      </Text>
      <View className="flex-row justify-between">
        <View className="items-center flex-1">
          <Text className="text-3xl font-bold text-white">{trips}</Text>
          <Text className="text-gray-400 text-sm">Resor</Text>
        </View>
        <View className="w-px bg-slate-700" />
        <View className="items-center flex-1">
          <Text className="text-3xl font-bold text-white">
            {distanceKm.toFixed(0)}
          </Text>
          <Text className="text-gray-400 text-sm">Kilometer</Text>
        </View>
        <View className="w-px bg-slate-700" />
        <View className="items-center flex-1">
          <Text className="text-3xl font-bold text-white">
            {formatMinutesToHours(workMinutes)}
          </Text>
          <Text className="text-gray-400 text-sm">Arbetstid</Text>
        </View>
      </View>
    </View>
  );
}

interface PurposeSelectorProps {
  selected: TripPurpose;
  onSelect: (purpose: TripPurpose) => void;
}

function PurposeSelector({ selected, onSelect }: PurposeSelectorProps) {
  const handleSelect = (purpose: TripPurpose) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(purpose);
  };

  return (
    <View className="flex-row gap-4">
      <Pressable
        onPress={() => handleSelect('TJÄNST')}
        className={`flex-1 p-4 rounded-xl border-2 ${
          selected === 'TJÄNST'
            ? 'bg-blue-500/20 border-blue-500'
            : 'bg-slate-800/50 border-slate-700'
        }`}
      >
        <View className="items-center">
          <Ionicons
            name="briefcase"
            size={24}
            color={selected === 'TJÄNST' ? '#3b82f6' : '#9ca3af'}
          />
          <Text
            className={`mt-2 font-semibold ${
              selected === 'TJÄNST' ? 'text-blue-400' : 'text-gray-400'
            }`}
          >
            Tjänsteresa
          </Text>
        </View>
      </Pressable>

      <Pressable
        onPress={() => handleSelect('PRIVAT')}
        className={`flex-1 p-4 rounded-xl border-2 ${
          selected === 'PRIVAT'
            ? 'bg-purple-500/20 border-purple-500'
            : 'bg-slate-800/50 border-slate-700'
        }`}
      >
        <View className="items-center">
          <Ionicons
            name="home"
            size={24}
            color={selected === 'PRIVAT' ? '#a855f7' : '#9ca3af'}
          />
          <Text
            className={`mt-2 font-semibold ${
              selected === 'PRIVAT' ? 'text-purple-400' : 'text-gray-400'
            }`}
          >
            Privat
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

interface HoldToStopButtonProps {
  onComplete: () => void;
  disabled?: boolean;
}

function HoldToStopButton({ onComplete, disabled = false }: HoldToStopButtonProps) {
  const { progress, isHolding, handlers } = useLongPress(onComplete, HOLD_DURATION_MS);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Pressable
      {...handlers}
      disabled={disabled}
      className={`h-16 rounded-2xl overflow-hidden ${
        disabled ? 'bg-slate-700' : 'bg-red-600'
      }`}
    >
      <Animated.View
        className="absolute left-0 top-0 bottom-0 bg-red-400"
        style={{ width: progressWidth }}
      />
      <View className="flex-1 flex-row items-center justify-center">
        <Ionicons
          name={isHolding ? 'stop-circle' : 'stop'}
          size={24}
          color="white"
        />
        <Text className="ml-3 text-white text-lg font-bold">
          {isHolding ? 'HÅLL KVAR...' : 'HÅLL FÖR ATT AVSLUTA'}
        </Text>
      </View>
    </Pressable>
  );
}

interface StartTripButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

function StartTripButton({ onPress, disabled = false }: StartTripButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className={`h-20 rounded-2xl items-center justify-center flex-row ${
        disabled ? 'bg-slate-700' : 'bg-emerald-600'
      }`}
    >
      <Ionicons name="play" size={28} color="white" />
      <Text className="ml-3 text-white text-xl font-bold">STARTA KÖRNING</Text>
    </Pressable>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DashboardScreen() {
  const { state, updateState, isLoading } = usePersistedState();
  const [selectedPurpose, setSelectedPurpose] = useState<TripPurpose>('TJÄNST');

  const elapsedSeconds = useTripTimer(state.currentTripStart);

  // Simulate distance accumulation during active trip
  useEffect(() => {
    if (state.workMode === 'KÖRNING' && state.currentTripStart) {
      const interval = setInterval(() => {
        // Simulate ~50 km/h average speed
        const newDistance = state.currentTripDistance + 0.014; // ~50km/h in km/s
        updateState({ currentTripDistance: newDistance });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [state.workMode, state.currentTripStart]);

  // Simulate sync status based on network (in real app, use NetInfo)
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly toggle between synced/pending for demo
      // In production, this would be driven by actual network state
      const statuses: SyncStatus[] = ['SYNCED', 'SYNCED', 'SYNCED', 'PENDING'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      updateState({ syncStatus: randomStatus });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStartTrip = async () => {
    const compliance = getComplianceStatus(state.restTank1, state.restTank2);

    if (compliance.status === 'VIOLATION') {
      // In production, show a modal warning
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    await updateState({
      workMode: 'KÖRNING',
      currentTripStart: new Date(),
      currentTripDistance: 0,
      startLocation: 'Göteborg, Hisingen', // In production, use expo-location
    });
  };

  const handleStopTrip = async () => {
    const tripDuration = elapsedSeconds;
    const tripDistance = state.currentTripDistance;

    // Update today's summary
    await updateState({
      workMode: 'REDO',
      currentTripStart: null,
      currentTripDistance: 0,
      startLocation: '',
      todayTrips: state.todayTrips + 1,
      todayDistanceKm: state.todayDistanceKm + tripDistance,
      todayWorkMinutes: state.todayWorkMinutes + Math.floor(tripDuration / 60),
    });

    // In production: Save trip to AsyncStorage pending queue
    // and attempt to sync with backend
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 items-center justify-center">
        <Text className="text-white text-lg">Laddar...</Text>
      </SafeAreaView>
    );
  }

  const isActiveDriving = state.workMode === 'KÖRNING';
  const compliance = getComplianceStatus(state.restTank1, state.restTank2);
  const canStartTrip = compliance.status !== 'VIOLATION';

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-24">
        {/* Header with Sync Status */}
        <View className="flex-row items-center justify-between mb-6">
          <SyncStatusBadge status={state.syncStatus} />
          <Text className="text-gray-400 text-lg font-medium">
            {getCurrentTime()}
          </Text>
        </View>

        {/* Active Trip Card or Ready State */}
        {isActiveDriving ? (
          <View className="mb-6">
            <ActiveTripCard
              elapsedSeconds={elapsedSeconds}
              startLocation={state.startLocation}
              distanceKm={state.currentTripDistance}
            />
          </View>
        ) : (
          <View className="mb-6">
            <View className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 items-center">
              <Ionicons name="checkmark-circle" size={48} color="#34d399" />
              <Text className="text-white text-xl font-semibold mt-3">
                REDO ATT KÖRA
              </Text>
              <Text className="text-gray-400 mt-1">
                Tryck på knappen nedan för att starta
              </Text>
            </View>
          </View>
        )}

        {/* Rest Tank Visualizer */}
        <View className="mb-6">
          <RestTankVisualizer
            tank1={state.restTank1}
            tank2={state.restTank2}
            totalRestMinutes={state.totalRestMinutes}
          />
        </View>

        {/* Today's Summary */}
        <View className="mb-6">
          <TodaySummary
            trips={state.todayTrips}
            distanceKm={state.todayDistanceKm}
            workMinutes={state.todayWorkMinutes}
          />
        </View>

        {/* Purpose Selector (shown when not driving) */}
        {!isActiveDriving && (
          <View className="mb-6">
            <Text className="text-gray-400 text-sm mb-3 ml-1">
              RESANS SYFTE
            </Text>
            <PurposeSelector
              selected={selectedPurpose}
              onSelect={setSelectedPurpose}
            />
          </View>
        )}

        {/* Primary Action Button */}
        <View className="mb-6">
          {isActiveDriving ? (
            <HoldToStopButton onComplete={handleStopTrip} />
          ) : (
            <StartTripButton onPress={handleStartTrip} disabled={!canStartTrip} />
          )}
        </View>

        {/* Compliance Warning Banner (if applicable) */}
        {!canStartTrip && !isActiveDriving && (
          <View className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex-row items-center">
            <Ionicons name="warning" size={24} color="#f87171" />
            <View className="ml-3 flex-1">
              <Text className="text-red-400 font-semibold">
                Körning ej tillåten
              </Text>
              <Text className="text-red-300/70 text-sm mt-1">
                Du måste vila {formatMinutesToHours(compliance.remainingMinutes)} till
                innan nästa körning.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700">
        <SafeAreaView edges={['bottom']}>
          <View className="flex-row justify-around py-3">
            <Pressable
              className="items-center px-4 py-2"
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Ionicons name="home" size={24} color="#3b82f6" />
              <Text className="text-blue-400 text-xs mt-1">Hem</Text>
            </Pressable>
            <Pressable
              className="items-center px-4 py-2"
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Ionicons name="list" size={24} color="#9ca3af" />
              <Text className="text-gray-400 text-xs mt-1">Resor</Text>
            </Pressable>
            <Pressable
              className="items-center px-4 py-2"
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Ionicons name="time" size={24} color="#9ca3af" />
              <Text className="text-gray-400 text-xs mt-1">Vila</Text>
            </Pressable>
            <Pressable
              className="items-center px-4 py-2"
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Ionicons name="settings" size={24} color="#9ca3af" />
              <Text className="text-gray-400 text-xs mt-1">Inst.</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </SafeAreaView>
  );
}
