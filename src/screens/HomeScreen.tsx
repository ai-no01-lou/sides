import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import {PROJECTS, Project} from '../config/projects';
import {useAuth} from '../auth/AuthContext';

const COLUMNS = 4;
const GRID_PADDING = 16;
const TILE_GAP = 12;
const SCREEN_WIDTH = Dimensions.get('window').width;
const TILE_SIZE =
  (SCREEN_WIDTH - GRID_PADDING * 2 - TILE_GAP * (COLUMNS - 1)) / COLUMNS;
const ICON_SIZE = TILE_SIZE * 0.42;

interface Props {
  onProjectPress?: (project: Project) => void;
}

function ProjectTile({
  project,
  onPress,
}: {
  project: Project;
  onPress: (p: Project) => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(project)}
      style={styles.tileWrapper}>
      <LinearGradient
        colors={project.gradientColors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.tile}>
        <MaterialDesignIcons
          name={project.iconName}
          size={ICON_SIZE}
          color="rgba(255,255,255,0.95)"
        />
      </LinearGradient>
      <Text style={styles.tileLabel} numberOfLines={1}>
        {project.name}
      </Text>
    </TouchableOpacity>
  );
}

export function HomeScreen({onProjectPress}: Props) {
  const {logout} = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Projects</Text>
        <TouchableOpacity onPress={logout} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={PROJECTS}
        keyExtractor={item => item.id}
        numColumns={COLUMNS}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({item}) => (
          <ProjectTile
            project={item}
            onPress={p => onProjectPress?.(p)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: GRID_PADDING,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4B4B4B',
    letterSpacing: -0.5,
  },
  logoutText: {
    fontSize: 14,
    color: '#7A687F',
  },
  grid: {
    paddingHorizontal: GRID_PADDING,
    paddingTop: 8,
  },
  row: {
    gap: TILE_GAP,
    marginBottom: TILE_GAP,
  },
  tileWrapper: {
    width: TILE_SIZE,
    alignItems: 'center',
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: TILE_SIZE * 0.22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  tileLabel: {
    marginTop: 6,
    fontSize: 11,
    color: '#555',
    textAlign: 'center',
  },
});
