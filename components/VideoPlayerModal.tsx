import React, { useEffect } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale } from 'react-native-size-matters';

interface VideoPlayerModalProps {
    visible: boolean;
    videoUrl: string | null;
    onClose: () => void;
}

const { width } = Dimensions.get('window');

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
    visible,
    videoUrl,
    onClose,
}) => {
    const player = useVideoPlayer(videoUrl || '', (player) => {
        player.loop = false;
        if (visible) {
            player.play();
        }
    });

    useEffect(() => {
        if (visible && videoUrl) {
            player.replaceAsync(videoUrl);
            player.play();
        } else {
            player.pause();
        }
    }, [visible, videoUrl, player]);

    if (!videoUrl) return null;

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close-circle" size={scale(32)} color="#fff" />
                    </TouchableOpacity>

                    <VideoView
                        style={styles.video}
                        player={player}
                        fullscreenOptions={{ enable: true }}
                        allowsPictureInPicture
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)', // Dark transparent background
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: verticalScale(50),
        right: scale(20),
        zIndex: 10,
        padding: scale(10),
    },
    video: {
        width: width,
        height: width * (9 / 16), // 16:9 Aspect ratio
        backgroundColor: 'black',
    },
});
