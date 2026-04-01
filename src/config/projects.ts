export interface Project {
  id: string;
  name: string;
  description: string;
  url: string;
  iconName: string;
  gradientColors: [string, string];
}

export const PROJECTS: Project[] = [
  {
    id: 'steam-gems',
    name: 'Steam Gems',
    description: 'Hidden gems on Steam',
    url: 'https://sideprojects.thislou.com/steamgem',
    iconName: 'diamond-stone',
    gradientColors: ['#667eea', '#764ba2'],
  },
  {
    id: 'creative-prompt',
    name: 'Creative Prompt',
    description: 'Writing prompts',
    url: 'https://sideprojects.thislou.com/creative-prompt',
    iconName: 'lightbulb-on-outline',
    gradientColors: ['#f093fb', '#f5576c'],
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Life dashboard',
    url: 'https://dashboard.thislou.com',
    iconName: 'view-dashboard-outline',
    gradientColors: ['#4facfe', '#00f2fe'],
  },
  {
    id: 'queer-cycle',
    name: 'Queer Cycle',
    description: 'Cycle tracking',
    url: 'https://sideprojects.thislou.com/queer-cycle',
    iconName: 'heart-pulse',
    gradientColors: ['#a18cd1', '#fbc2eb'],
  },
];
