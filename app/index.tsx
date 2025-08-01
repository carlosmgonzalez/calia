import { AnalyzedResponse } from "@/types/response-analyze";
import * as ImagePicker from "expo-image-picker";
import { Activity, TrendingUp, Upload, Zap } from "lucide-react-native";
import { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [nutritionData, setNutritionData] = useState<AnalyzedResponse | null>(
        null,
    );
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 1,
            base64: true,
        });

        if (!result.canceled) {
            setImageBase64(result.assets[0].base64!);
            setSelectedImage(result.assets[0].uri);
        }
    };

    const handleAnalyzeImage = async () => {
        setIsAnalyzing(true);
        try {
            const response = await fetch("/api/image-analyze", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inlineData: {
                        mimeType: "image/jpeg",
                        data: imageBase64,
                    },
                }),
            });

            const data: { ok: boolean; analysis: AnalyzedResponse } =
                await response.json();

            if (data.ok) {
                setNutritionData(data.analysis);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const NutrientCard = ({
        label,
        value,
        unit,
        color,
    }: {
        label: string;
        value: string;
        unit?: string;
        color: string;
    }) => (
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <Text className="text-gray-600 text-sm font-medium mb-1">
                {label}
            </Text>
            <Text className={`text-2xl font-bold ${color}`}>
                {value}
                {unit && (
                    <Text className="text-base text-gray-500">{unit}</Text>
                )}
            </Text>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <Animated.View
                    entering={FadeInDown.delay(100).springify()}
                    className="px-6 pt-6 pb-4"
                >
                    <Text className="text-3xl font-bold text-gray-900 mb-2">
                        Calia
                    </Text>
                    <Text className="text-gray-600 text-base">
                        Analiza tu comida y obtén información nutricional
                        detallada
                    </Text>
                </Animated.View>

                {/* Image Selection Section */}
                <Animated.View
                    entering={FadeInDown.delay(200).springify()}
                    className="px-6 mb-6"
                >
                    <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        {selectedImage ? (
                            <View className="items-center">
                                <Image
                                    source={{ uri: selectedImage }}
                                    className="w-64 h-64 rounded-2xl mb-4"
                                    resizeMode="cover"
                                />
                                <TouchableOpacity
                                    onPress={pickImage}
                                    className="bg-gray-100 px-6 py-3 rounded-full mb-4"
                                >
                                    <Text className="text-gray-700 font-semibold">
                                        Cambiar imagen
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleAnalyzeImage}
                                    disabled={isAnalyzing}
                                    className={`${
                                        isAnalyzing
                                            ? "bg-gray-300"
                                            : "bg-primary-500"
                                    } px-8 py-4 rounded-2xl flex-row items-center`}
                                >
                                    {isAnalyzing ? (
                                        <Activity
                                            size={20}
                                            color="white"
                                            className="mr-2"
                                        />
                                    ) : (
                                        <Zap
                                            size={20}
                                            color="white"
                                            className="mr-2"
                                        />
                                    )}
                                    <Text className="text-white font-bold text-lg ml-2">
                                        {isAnalyzing
                                            ? "Analizando..."
                                            : "Analizar comida"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={pickImage}
                                className="border-2 border-dashed border-gray-300 rounded-2xl p-12 items-center"
                            >
                                <View className="bg-primary-100 p-4 rounded-full mb-4">
                                    <Upload size={32} color="#0ea5e9" />
                                </View>
                                <Text className="text-gray-900 font-bold text-lg mb-2">
                                    Selecciona una imagen
                                </Text>
                                <Text className="text-gray-600 text-center">
                                    Toca aquí para seleccionar una foto de tu
                                    comida desde la galería
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>

                {/* Nutrition Results */}
                {nutritionData && (
                    <Animated.View
                        entering={FadeInUp.delay(300).springify()}
                        className="px-6 mb-6"
                    >
                        {/* Food Identification */}
                        <View className="bg-white rounded-3xl p-6 mb-4 shadow-sm border border-gray-100">
                            <View className="flex-row items-center mb-3">
                                <View className="bg-success-100 p-2 rounded-full mr-3">
                                    <TrendingUp size={20} color="#22c55e" />
                                </View>
                                <Text className="text-xl font-bold text-gray-900">
                                    Alimento Identificado
                                </Text>
                            </View>
                            <Text className="text-gray-700 text-base mb-3">
                                {nutritionData.foodAnalysis.identifiedFood}
                            </Text>
                            <View className="flex-row justify-between bg-gray-50 rounded-xl p-3">
                                <View>
                                    <Text className="text-gray-600 text-sm">
                                        Porción
                                    </Text>
                                    <Text className="font-bold text-gray-900">
                                        {nutritionData.foodAnalysis.portionSize}
                                        gr
                                    </Text>
                                </View>
                                <View>
                                    <Text className="text-gray-600 text-sm">
                                        Ración
                                    </Text>
                                    <Text className="font-bold text-gray-900">
                                        {
                                            nutritionData.foodAnalysis
                                                .recognizedServingSize
                                        }
                                        gr
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Nutrition Facts - Per Portion */}
                        <View className="bg-white rounded-3xl p-6 mb-4 shadow-sm border border-gray-100">
                            <Text className="text-xl font-bold text-gray-900 mb-4">
                                Información Nutricional (Por Porción)
                            </Text>

                            {/* Calories Highlight */}
                            <View className="bg-emerald-400 rounded-2xl p-4 mb-4">
                                <Text className="text-black text-sm font-medium">
                                    Calorías Totales
                                </Text>
                                <Text className="text-black text-4xl font-bold">
                                    {
                                        nutritionData.foodAnalysis
                                            .nutritionFactsPerPortion.calories
                                    }
                                    <Text className="text-xl">kcal</Text>
                                </Text>
                            </View>

                            {/* Macronutrients Grid */}
                            <View className="flex-row flex-wrap justify-between gap-3">
                                <View className="w-[48%]">
                                    <NutrientCard
                                        label="Proteínas"
                                        value={
                                            nutritionData.foodAnalysis
                                                .nutritionFactsPerPortion
                                                .protein
                                        }
                                        color="text-success-600"
                                        unit="gr"
                                    />
                                </View>
                                <View className="w-[48%]">
                                    <NutrientCard
                                        label="Carbohidratos"
                                        value={
                                            nutritionData.foodAnalysis
                                                .nutritionFactsPerPortion.carbs
                                        }
                                        color="text-warning-600"
                                        unit="gr"
                                    />
                                </View>
                                <View className="w-[48%]">
                                    <NutrientCard
                                        label="Grasas"
                                        value={
                                            nutritionData.foodAnalysis
                                                .nutritionFactsPerPortion.fat
                                        }
                                        color="text-error-600"
                                        unit="gr"
                                    />
                                </View>
                                <View className="w-[48%]">
                                    <NutrientCard
                                        label="Fibra"
                                        value={
                                            nutritionData.foodAnalysis
                                                .nutritionFactsPerPortion.fiber
                                        }
                                        color="text-primary-600"
                                        unit="gr"
                                    />
                                </View>
                                <View className="w-[48%]">
                                    <NutrientCard
                                        label="Azúcar"
                                        value={
                                            nutritionData.foodAnalysis
                                                .nutritionFactsPerPortion.sugar
                                        }
                                        color="text-purple-600"
                                        unit="gr"
                                    />
                                </View>
                                <View className="w-[48%]">
                                    <NutrientCard
                                        label="Sodio"
                                        value={
                                            nutritionData.foodAnalysis
                                                .nutritionFactsPerPortion.sodium
                                        }
                                        color="text-gray-600"
                                        unit="mg"
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Nutrition Facts - Per 100g */}
                        <View className="bg-white rounded-3xl p-6 mb-4 shadow-sm border border-gray-100">
                            <Text className="text-xl font-bold text-gray-900 mb-4">
                                Por 100g
                            </Text>
                            <View className="flex-row flex-wrap justify-between gap-3">
                                <View className="w-[48%]">
                                    <NutrientCard
                                        label="Cal"
                                        value={
                                            nutritionData.foodAnalysis
                                                .nutritionFactsPer100g.calories
                                        }
                                        color="text-primary-600"
                                        unit="kcal"
                                    />
                                </View>
                                <View className="w-[48%]">
                                    <NutrientCard
                                        label="Prot"
                                        value={
                                            nutritionData.foodAnalysis
                                                .nutritionFactsPer100g.protein
                                        }
                                        color="text-success-600"
                                        unit="gr"
                                    />
                                </View>
                                <View className="w-[48%]">
                                    <NutrientCard
                                        label="Carb"
                                        value={
                                            nutritionData.foodAnalysis
                                                .nutritionFactsPer100g.carbs
                                        }
                                        color="text-warning-600"
                                        unit="gr"
                                    />
                                </View>
                                <View className="w-[48%]">
                                    <NutrientCard
                                        label="Grasa"
                                        value={
                                            nutritionData.foodAnalysis
                                                .nutritionFactsPer100g.fat
                                        }
                                        color="text-error-600"
                                        unit="gr"
                                    />
                                </View>
                                <View className="w-[48%]">
                                    <NutrientCard
                                        label="Fibra"
                                        value={
                                            nutritionData.foodAnalysis
                                                .nutritionFactsPer100g.fiber
                                        }
                                        color="text-primary-600"
                                        unit="gr"
                                    />
                                </View>
                                <View className="w-[48%]">
                                    <NutrientCard
                                        label="Sodio"
                                        value={
                                            nutritionData.foodAnalysis
                                                .nutritionFactsPer100g.sodium
                                        }
                                        color="text-gray-600"
                                        unit="mg"
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Additional Notes */}
                        <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <Text className="text-xl font-bold text-gray-900 mb-4">
                                Notas Adicionales
                            </Text>
                            {nutritionData.foodAnalysis.additionalNotes.map(
                                (note, index) => (
                                    <View
                                        key={index}
                                        className="flex-row items-center mb-2"
                                    >
                                        <View className="w-2 h-2 bg-primary-500 rounded-full mr-3" />
                                        <Text className="text-gray-700 flex-1">
                                            {note}
                                        </Text>
                                    </View>
                                ),
                            )}
                        </View>
                    </Animated.View>
                )}

                <View className="h-8" />
            </ScrollView>
        </SafeAreaView>
    );
}
