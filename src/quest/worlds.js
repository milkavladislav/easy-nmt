import { Castle, Pyramid, Sailboat, Search, Church, Rocket, TrainFront, CloudSun, Gem } from 'lucide-react';

// Дев'ять світів курсу 150+: один блок — один світ. Артефакт світу відчиняє портал до наступного.
export const WORLDS = [
  { block: 1, name: 'Школа чарів', artifact: 'Кристал Числа', icon: Castle, color: '#f5c86b' },
  { block: 2, name: 'Долина Пірамід', artifact: 'Мотузка Землеміра', icon: Pyramid, color: '#f0a35e' },
  { block: 3, name: 'Корабель-обсерваторія', artifact: 'Секстант', icon: Sailboat, color: '#7fb8ff' },
  { block: 4, name: 'Детективне бюро', artifact: 'Закрита справа', icon: Search, color: '#e0b07a' },
  { block: 5, name: 'Вітражна майстерня', artifact: 'Вітраж-троянда', icon: Church, color: '#ff7a9c' },
  { block: 6, name: 'Космічна місія', artifact: 'Карта траєкторій', icon: Rocket, color: '#6ef0ff' },
  { block: 7, name: 'Майстерня винахідниці', artifact: 'Паровий хронометр', icon: TrainFront, color: '#e89a62' },
  { block: 8, name: 'Метеостанція в Карпатах', artifact: 'Барометр', icon: CloudSun, color: '#8fe0a8' },
  { block: 9, name: 'Кришталеві печери', artifact: 'Серце Кристала', icon: Gem, color: '#c59bff' },
];
