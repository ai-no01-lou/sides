import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { PROJECTS, Project } from '../config/projects';

interface Props {
  onProjectPress?: (project: Project) => void;
}

const ProjectCard = ({
  project,
  onPress,
}: {
  project: Project;
  onPress: (p: Project) => void;
}) => (
  <TouchableOpacity
    style={styles.card}
    onPress={() => onPress(project)}
    activeOpacity={0.7}
  >
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{project.name}</Text>
      <Text style={styles.cardDescription}>{project.description}</Text>
      <Text style={styles.cardUrl} numberOfLines={1}>
        {project.url}
      </Text>
    </View>
    <Text style={styles.cardArrow}>›</Text>
  </TouchableOpacity>
);

export const HomeScreen: React.FC<Props> = ({ onProjectPress }) => {
  const handlePress = (project: Project) => {
    onProjectPress?.(project);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Side Projects</Text>
        <Text style={styles.headerSubtitle}>Lou's collection of tools & experiments</Text>
      </View>
      <FlatList
        data={PROJECTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProjectCard project={item} onPress={handlePress} />
        )}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  cardUrl: {
    fontSize: 12,
    color: '#0066CC',
  },
  cardArrow: {
    fontSize: 22,
    color: '#CCC',
    marginLeft: 8,
  },
  separator: {
    height: 10,
  },
});

export default HomeScreen;
