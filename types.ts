export enum MessageRole {
  User = 'user',
  Model = 'model',
  System = 'system'
}

export interface ChartDataPoint {
  name: string;
  [key: string]: number | string;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'area';
  title: string;
  xAxisKey: string;
  data: ChartDataPoint[];
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: Date;
  imageUrl?: string; // For user uploaded images
  chartConfig?: ChartConfig; // For model generated charts
}

export enum EcoMode {
  Home = 'home',
  Chat = 'chat'
}

export interface EcoBranch {
  id: string;
  label: string;
  description: string;
  promptPrefix: string;
  iconPath: string; // SVG path d
}