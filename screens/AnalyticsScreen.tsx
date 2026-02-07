import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useAnalytics } from '../context/AnalyticsContext';
import { useAuth } from '../context/AuthContext';

const { width: screenWidth } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { 
    workoutStats, 
    progressData, 
    healthMetrics, 
    aiInsights,
    isLoading,
    refreshData,
    getWorkoutStatsForPeriod,
    getMetricHistory,
    dismissInsight,
    markInsightAsActioned 
  } = useAnalytics();
  
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [refreshing, setRefreshing] = useState(false);
  const [weightData, setWeightData] = useState<any[]>([]);
  const [workoutTrend, setWorkoutTrend] = useState<any[]>([]);

  useEffect(() => {
    loadChartData();
  }, [selectedPeriod]);

  const loadChartData = async () => {
    try {
      // Load weight trend
      const weights = await getMetricHistory('weight', 90);
      setWeightData(weights.slice(-10)); // Last 10 measurements

      // Load workout trend for chart
      const endDate = new Date();
      const startDate = new Date();
      
      switch (selectedPeriod) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Create workout trend data for chart
      const workoutsByDay = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayWorkouts = progressData.filter(p => 
          new Date(p.date).toDateString() === date.toDateString()
        );
        return dayWorkouts.length > 0 ? dayWorkouts[0].workoutsCompleted : 0;
      });
      
      setWorkoutTrend(workoutsByDay);
    } catch (error) {
      console.error('Error loading chart data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    await loadChartData();
    setRefreshing(false);
  };

  const handlePeriodChange = async (period: 'week' | 'month' | 'year') => {
    setSelectedPeriod(period);
    const stats = await getWorkoutStatsForPeriod(period);
    // Update workoutStats if needed (this would require additional context method)
  };

  const StatCard = ({ 
    title, 
    value, 
    unit, 
    icon, 
    trend, 
    color = '#F97316' 
  }: {
    title: string;
    value: number | string;
    unit?: string;
    icon: string;
    trend?: number;
    color?: string;
  }) => (
    <View className="bg-gray-900 rounded-2xl p-4 mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className={`rounded-full p-2 bg-${color.replace('#', '')}/20`}>
            <Ionicons name={icon as any} size={20} color={color} />
          </View>
          <Text className="text-gray-300 ml-3 font-medium">{title}</Text>
        </View>
        {trend !== undefined && (
          <View className={`flex-row items-center ${trend >= 0 ? 'bg-green-900/50' : 'bg-red-900/50'} px-2 py-1 rounded-full`}>
            <Ionicons 
              name={trend >= 0 ? 'trending-up' : 'trending-down'} 
              size={12} 
              color={trend >= 0 ? '#10B981' : '#EF4444'} 
            />
            <Text className={`text-xs ml-1 ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </View>
      
      <View className="flex-row items-baseline">
        <Text className="text-white text-2xl font-bold">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Text>
        {unit && (
          <Text className="text-gray-400 text-sm ml-1">{unit}</Text>
        )}
      </View>
    </View>
  );

  const InsightCard = ({ insight, index }: { insight: any; index: number }) => (
    <View className="bg-gray-900 rounded-2xl p-4 mb-4 border-l-4 border-orange-500">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <View className="flex-row items-center mb-2">
            <View className={`rounded-full p-1 ${
              insight.priority === 'high' ? 'bg-red-500/20' :
              insight.priority === 'medium' ? 'bg-orange-500/20' : 'bg-blue-500/20'
            }`}>
              <Ionicons 
                name={
                  insight.type === 'achievement' ? 'trophy' :
                  insight.type === 'recommendation' ? 'bulb' :
                  insight.type === 'health' ? 'heart' :
                  insight.type === 'progress' ? 'trending-up' : 'information-circle'
                } 
                size={16} 
                color={
                  insight.priority === 'high' ? '#EF4444' :
                  insight.priority === 'medium' ? '#F97316' : '#3B82F6'
                }
              />
            </View>
            <Text className="text-white font-semibold ml-2">{insight.title}</Text>
          </View>
          <Text className="text-gray-300 text-sm leading-5">{insight.content}</Text>
        </View>
        
        <View className="flex-row">
          {insight.actionable && (
            <TouchableOpacity 
              onPress={() => markInsightAsActioned(index)}
              className="bg-orange-600 rounded-lg p-2 mr-2"
            >
              <Ionicons name="checkmark" size={16} color="white" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            onPress={() => dismissInsight(index)}
            className="bg-gray-700 rounded-lg p-2"
          >
            <Ionicons name="close" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const chartConfig = {
    backgroundColor: '#1F2937',
    backgroundGradientFrom: '#374151',
    backgroundGradientTo: '#1F2937',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#F97316',
    },
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView 
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#F97316']}
            tintColor="#F97316"
          />
        }
      >
        {/* Header */}
        <View className="py-6">
          <Text className="text-white text-3xl font-bold">Análisis</Text>
          <Text className="text-gray-400">Tu progreso y estadísticas</Text>
        </View>

        {/* Period Selector */}
        <View className="flex-row bg-gray-900 rounded-2xl p-2 mb-6">
          {(['week', 'month', 'year'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => handlePeriodChange(period)}
              className={`flex-1 py-3 rounded-xl ${
                selectedPeriod === period ? 'bg-orange-600' : ''
              }`}
            >
              <Text className={`text-center font-semibold ${
                selectedPeriod === period ? 'text-white' : 'text-gray-400'
              }`}>
                {period === 'week' ? 'Semana' : period === 'month' ? 'Mes' : 'Año'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Insights */}
        {aiInsights.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center mb-4">
              <Ionicons name="sparkles" size={24} color="#F97316" />
              <Text className="text-white text-xl font-bold ml-2">Insights de IA</Text>
            </View>
            {aiInsights.map((insight, index) => (
              <InsightCard key={index} insight={insight} index={index} />
            ))}
          </View>
        )}

        {/* Key Stats */}
        <View className="mb-6">
          <Text className="text-white text-xl font-bold mb-4">Estadísticas Clave</Text>
          
          <View className="flex-row justify-between mb-4">
            <View className="flex-1 mr-2">
              <StatCard
                title="Entrenamientos"
                value={workoutStats.totalWorkouts}
                icon="barbell-outline"
                trend={12}
              />
            </View>
            <View className="flex-1 ml-2">
              <StatCard
                title="Racha Actual"
                value={workoutStats.currentStreak}
                unit="días"
                icon="flame-outline"
                color="#EF4444"
              />
            </View>
          </View>

          <View className="flex-row justify-between mb-4">
            <View className="flex-1 mr-2">
              <StatCard
                title="Tiempo Total"
                value={Math.round(workoutStats.totalMinutes / 60)}
                unit="horas"
                icon="time-outline"
                color="#10B981"
              />
            </View>
            <View className="flex-1 ml-2">
              <StatCard
                title="Calorías Quemadas"
                value={workoutStats.totalCaloriesBurned}
                unit="kcal"
                icon="flash-outline"
                color="#8B5CF6"
              />
            </View>
          </View>

          <StatCard
            title="Peso Levantado Total"
            value={workoutStats.totalWeightLifted}
            unit="kg"
            icon="fitness-outline"
            trend={8}
          />
        </View>

        {/* Workout Trend Chart */}
        {workoutTrend.length > 0 && (
          <View className="mb-6">
            <Text className="text-white text-xl font-bold mb-4">Tendencia de Entrenamientos</Text>
            <View className="bg-gray-900 rounded-2xl p-4">
              <BarChart
                data={{
                  labels: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
                  datasets: [{
                    data: workoutTrend
                  }]
                }}
                width={screenWidth - 64}
                height={200}
                chartConfig={chartConfig}
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
                showBarTops={false}
                fromZero
              />
            </View>
          </View>
        )}

        {/* Weight Progress Chart */}
        {weightData.length > 0 && (
          <View className="mb-6">
            <Text className="text-white text-xl font-bold mb-4">Progreso de Peso</Text>
            <View className="bg-gray-900 rounded-2xl p-4">
              <LineChart
                data={{
                  labels: weightData.map((_, index) => `${index + 1}`),
                  datasets: [{
                    data: weightData.map(w => w.value),
                    strokeWidth: 3,
                  }]
                }}
                width={screenWidth - 64}
                height={200}
                chartConfig={chartConfig}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
              <Text className="text-gray-400 text-center text-sm mt-2">
                Últimas {weightData.length} mediciones
              </Text>
            </View>
          </View>
        )}

        {/* Health Metrics */}
        <View className="mb-6">
          <Text className="text-white text-xl font-bold mb-4">Métricas de Salud</Text>
          
          {healthMetrics.weight && (
            <StatCard
              title="Peso Actual"
              value={healthMetrics.weight}
              unit="kg"
              icon="body-outline"
              color="#06B6D4"
            />
          )}

          {healthMetrics.restingHeartRate && (
            <StatCard
              title="Frecuencia Cardíaca en Reposo"
              value={healthMetrics.restingHeartRate}
              unit="bpm"
              icon="heart-outline"
              color="#EF4444"
            />
          )}

          {healthMetrics.stepCount && (
            <StatCard
              title="Pasos Hoy"
              value={healthMetrics.stepCount}
              unit="pasos"
              icon="walk-outline"
              color="#10B981"
            />
          )}

          {healthMetrics.sleepHours && (
            <StatCard
              title="Sueño Anoche"
              value={healthMetrics.sleepHours}
              unit="horas"
              icon="moon-outline"
              color="#6366F1"
            />
          )}
        </View>

        {/* Personal Records */}
        <View className="mb-6">
          <Text className="text-white text-xl font-bold mb-4">Records Personales</Text>
          <View className="bg-gray-900 rounded-2xl p-4">
            <View className="flex-row items-center justify-center py-8">
              <Ionicons name="trophy-outline" size={48} color="#F59E0B" />
              <View className="ml-4">
                <Text className="text-white text-lg font-semibold">¡Sigue Entrenando!</Text>
                <Text className="text-gray-400">Establece tu primer record</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Achievement Progress */}
        <View className="mb-6">
          <Text className="text-white text-xl font-bold mb-4">Progreso de Logros</Text>
          <View className="bg-gray-900 rounded-2xl p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-gray-300">Logros Obtenidos</Text>
              <Text className="text-orange-400 font-semibold">{achievements.length}/50</Text>
            </View>
            
            <View className="bg-gray-800 rounded-full h-3 mb-4">
              <LinearGradient
                colors={['#F97316', '#EA580C']}
                className="h-3 rounded-full"
                style={{ width: `${(achievements.length / 50) * 100}%` }}
              />
            </View>

            <View className="flex-row justify-between">
              <View className="items-center">
                <View className="bg-bronze rounded-full p-2 mb-1">
                  <Ionicons name="medal-outline" size={16} color="#CD7F32" />
                </View>
                <Text className="text-xs text-gray-400">Bronce</Text>
                <Text className="text-xs text-white font-semibold">3</Text>
              </View>
              <View className="items-center">
                <View className="bg-gray-400 rounded-full p-2 mb-1">
                  <Ionicons name="medal-outline" size={16} color="#C0C0C0" />
                </View>
                <Text className="text-xs text-gray-400">Plata</Text>
                <Text className="text-xs text-white font-semibold">1</Text>
              </View>
              <View className="items-center">
                <View className="bg-yellow-500 rounded-full p-2 mb-1">
                  <Ionicons name="medal-outline" size={16} color="#FFD700" />
                </View>
                <Text className="text-xs text-gray-400">Oro</Text>
                <Text className="text-xs text-white font-semibold">0</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}