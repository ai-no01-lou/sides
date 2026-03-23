export interface Project {
  id: string;
  name: string;
  description: string;
  url: string;
}

export const PROJECTS: Project[] = [
  {
    id: 'steam-gems',
    name: 'Steam Gems',
    description: 'Discover hidden gems on Steam',
    url: 'https://steamgem.sideprojects.thislou.com',
  },
  {
    id: 'creative-prompt',
    name: 'Creative Prompt',
    description: 'Generate creative writing prompts',
    url: 'https://creativeprompt.thislou.com',
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Personal life dashboard',
    url: 'https://dashboard.thislou.com',
  },
];
