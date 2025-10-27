import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Stack, router } from 'expo-router';
import { Plus, Trash2, ImageIcon, AlertTriangle } from 'lucide-react-native';

interface PickedImage {
  uri: string;
  size: number; // bytes
  mimeType: string | null;
  fileName: string | null;
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB

function isPng(mimeType: string | null, fileName: string | null, uri: string): boolean {
  const lower = (fileName ?? uri).toLowerCase();
  if (mimeType?.toLowerCase() === 'image/png') return true;
  if (lower.endsWith('.png')) return true;
  return false;
}

async function getWebBlobInfo(uri: string): Promise<{ size: number; mimeType: string | null }> {
  try {
    const res = await fetch(uri);
    const blob = await res.blob();
    return { size: blob.size, mimeType: blob.type || null };
  } catch (e) {
    console.log('[CreateListing] getWebBlobInfo error', e);
    return { size: 0, mimeType: null };
  }
}

async function getNativeFileInfo(uri: string): Promise<{ size: number; mimeType: string | null }>
{
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return { size: (info as FileSystem.FileInfo & { size?: number }).size ?? 0, mimeType: null };
  } catch (e) {
    console.log('[CreateListing] getNativeFileInfo error', e);
    return { size: 0, mimeType: null };
  }
}

export default function CreateListingScreen() {
  const [images, setImages] = useState<PickedImage[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handlePickImages = useCallback(async () => {
    setErrors([]);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
      allowsEditing: false,
      base64: false,
      selectionLimit: 0,
    });

    if (result.canceled) {
      return;
    }

    const next: PickedImage[] = [];
    const newErrors: string[] = [];

    for (const asset of result.assets) {
      const uri = asset.uri;
      const mimeType = (asset as ImagePicker.ImagePickerAsset & { mimeType?: string }).mimeType ?? null;
      const fileName = (asset as ImagePicker.ImagePickerAsset & { fileName?: string }).fileName ?? null;

      let size = 0;
      let detectedMime: string | null = mimeType;

      if (Platform.OS === 'web') {
        const info = await getWebBlobInfo(uri);
        size = info.size;
        detectedMime = info.mimeType;
      } else {
        const info = await getNativeFileInfo(uri);
        size = info.size;
      }

      const png = isPng(detectedMime, fileName, uri);
      if (!png) {
        newErrors.push(`${fileName ?? uri} is not a PNG. Only .png images are allowed.`);
        continue;
      }

      if (size > MAX_IMAGE_BYTES) {
        const mb = (size / (1024 * 1024)).toFixed(2);
        newErrors.push(`${fileName ?? uri} is ${mb}MB. Max size per image is 10MB.`);
        continue;
      }

      next.push({ uri, size, mimeType: detectedMime, fileName });
    }

    setImages((prev) => [...prev, ...next]);
    if (newErrors.length) setErrors(newErrors);
  }, []);

  const removeImage = useCallback((uri: string) => {
    setImages((prev) => prev.filter((i) => i.uri !== uri));
  }, []);

  const totalImages = images.length;

  const canSubmit = useMemo(() => totalImages > 0, [totalImages]);

  const onSubmit = useCallback(() => {
    if (!canSubmit) {
      Alert.alert('Add at least one PNG image');
      return;
    }
    console.log('[CreateListing] submit with images', images);
    Alert.alert('Saved', 'Images validated (PNG, <=10MB each). Continue to details.');
    router.back();
  }, [canSubmit, images]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Create Listing' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerBox}>
          <Text style={styles.title}>Listing Images</Text>
          <Text style={styles.subtitle}>PNG only, max 10MB per image</Text>
        </View>

        {errors.length > 0 && (
          <View style={styles.errorBox} testID="image-errors">
            <AlertTriangle color="#F59E0B" size={20} />
            <View style={styles.errorTextWrap}>
              {errors.map((e, idx) => (
                <Text key={`err-${idx}`} style={styles.errorText}>• {e}</Text>
              ))}
            </View>
          </View>
        )}

        <View style={styles.grid}>
          {images.map((img) => (
            <View key={img.uri} style={styles.imageWrap} testID="picked-image">
              <Image
                source={{ uri: img.uri }}
                style={styles.image}
                contentFit="cover"
                transition={100}
              />
              <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(img.uri)} testID="remove-image">
                <LinearGradient colors={["#EF4444", "#DC2626"]} style={styles.removeBtnInner}>
                  <Trash2 color="#FFF" size={16} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addTile} onPress={handlePickImages} testID="add-images">
            <LinearGradient colors={["#1A1A2E", "#16213E"]} style={styles.addTileInner}>
              <ImageIcon color="#8B5CF6" size={28} />
              <Text style={styles.addText}>Add PNGs</Text>
              <Text style={styles.addHint}>10MB each</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryBtn, !canSubmit && styles.primaryBtnDisabled]}
          onPress={onSubmit}
          disabled={!canSubmit}
          testID="submit-listing"
        >
          <LinearGradient colors={["#8B5CF6", "#6366F1"]} style={styles.primaryBtnInner}>
            <Plus color="#FFF" size={20} />
            <Text style={styles.primaryBtnText}>Save and Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0B' },
  content: { padding: 20, paddingBottom: 140 },
  headerBox: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#FFF' },
  subtitle: { fontSize: 14, color: '#999', marginTop: 4 },
  errorBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#2A1F12', borderColor: '#F59E0B', borderWidth: 1, padding: 12, borderRadius: 12, marginBottom: 16 },
  errorTextWrap: { flex: 1 },
  errorText: { color: '#FBBF24', fontSize: 12, marginBottom: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  imageWrap: { width: '31%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden', position: 'relative', backgroundColor: '#111' },
  image: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', top: 6, right: 6, borderRadius: 14, overflow: 'hidden' },
  removeBtnInner: { paddingHorizontal: 8, paddingVertical: 6, alignItems: 'center', justifyContent: 'center' },
  addTile: { width: '31%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden' },
  addTileInner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  addText: { color: '#DDD', fontSize: 12, fontWeight: '600' },
  addHint: { color: '#666', fontSize: 10 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 28, borderTopColor: '#1A1A2E', borderTopWidth: 1, backgroundColor: '#0A0A0B' },
  primaryBtn: { height: 52, borderRadius: 26, overflow: 'hidden' },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnInner: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryBtnText: { color: '#FFF', fontWeight: '600', fontSize: 16 },
});
