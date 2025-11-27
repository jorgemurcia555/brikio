import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TradeSpecialtyId, ResourceTemplate } from '../../types/trade.types';
import { RESOURCE_TEMPLATES } from '../../constants/trade.constants';
import { Sparkles, HelpCircle } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../../stores/authStore';
import api from '../../../../services/api';
import { useTranslation } from 'react-i18next';

interface ResourceBarProps {
  selectedTrade: TradeSpecialtyId | null;
  onAddResource: (resource: ResourceTemplate) => void;
}

// Map icon names to actual icon components
const iconMap: Record<string, React.ComponentType<any>> = {
  // Roofing
  Trash2: Icons.Trash2,
  Layers: Icons.Layers,
  FileStack: Icons.FileStack,
  Shield: Icons.Shield,
  Fan: Icons.Fan,
  Sparkles: Icons.Sparkles,
  // Electrical
  Cable: Icons.Cable,
  Power: Icons.Power,
  Settings: Icons.Settings,
  Lightbulb: Icons.Lightbulb,
  PanelTop: Icons.PanelTop,
  Gauge: Icons.Gauge,
  // Plumbing
  Droplets: Icons.Droplets,
  Droplet: Icons.Droplet,
  Toilet: Icons.Droplet, // Using Droplet as alternative
  Faucet: Icons.Droplet, // Using Droplet as alternative
  Flame: Icons.Flame,
  TestTube: Icons.TestTube,
  // Drywall
  SquareStack: Icons.SquareStack,
  Scissors: Icons.Scissors,
  Spray: Icons.Paintbrush, // Using Paintbrush as alternative
  Ceiling: Icons.SquareStack, // Using SquareStack as alternative
  WrenchIcon: Icons.Wrench,
  // Masonry
  Building2: Icons.Building2,
  BrickWall: Icons.BrickWall,
  Package: Icons.Package,
  HardHat: Icons.HardHat,
  // Carpentry
  Home: Icons.Home,
  DoorOpen: Icons.DoorOpen,
  Box: Icons.Box,
  // Painting
  Paintbrush: Icons.Paintbrush,
  // Flooring
  TreePine: Icons.TreePine,
  GaugeIcon: Icons.Gauge,
  // Landscaping
  Sprout: Icons.Sprout,
  Trees: Icons.Trees,
  Road: Icons.SquareStack, // Using SquareStack as alternative
  Fence: Icons.Fence,
  // HVAC
  Snowflake: Icons.Snowflake,
  Wind: Icons.Wind,
  Thermometer: Icons.Thermometer,
  Wrench: Icons.Wrench,
  // Interiors
  UtensilsCrossed: Icons.UtensilsCrossed,
  Container: Icons.Container,
  Sofa: Icons.Sofa,
  WrenchIcon2: Icons.Wrench,
  // Fallback
  Zap: Icons.Zap,
  Hammer: Icons.Hammer,
};

export function ResourceBar({ selectedTrade, onAddResource }: ResourceBarProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  
  // Fetch user's custom materials/resources
  const { data: customMaterials } = useQuery({
    queryKey: ['materials', 'custom'],
    queryFn: () => api.get('/materials'),
    enabled: isAuthenticated,
  });
  
  const filteredResources = useMemo(() => {
    if (!selectedTrade) return [];
    const defaultResources = RESOURCE_TEMPLATES.filter((r) => r.tradeId === selectedTrade);
    
    // Add custom materials as resources if user is authenticated
    if (isAuthenticated && customMaterials?.data) {
      const customResources: ResourceTemplate[] = customMaterials.data
        .filter((m: any) => m.user) // Only user's custom materials
        .map((m: any) => ({
          id: `custom-${m.id}`,
          label: m.name,
          description: m.description || m.name,
          icon: 'Box', // Default icon
          tradeId: selectedTrade,
          category: m.category?.name || 'Custom',
          defaultQuantity: 1,
          defaultUnit: m.unit?.name || 'pcs',
          defaultPrice: parseFloat(m.basePrice) || 0,
        }));
      
      return [...defaultResources, ...customResources];
    }
    
    return defaultResources;
  }, [selectedTrade, isAuthenticated, customMaterials]);

  if (!selectedTrade || filteredResources.length === 0) {
    return null;
  }

  return (
    <div className="relative group rounded-xl bg-white shadow-sm sm:p-4 bg-white border-2 border-[#F4C197] rounded-2xl sm:rounded-3xl bg-white shadow-lg w-full max-w-4xl mt-[-2rem] bg-white border border-[#F4C197] rounded-lg p-2 mb-2 shadow-sm">
      {/* Tooltip for Quick Resources - Desktop */}
      <div className="hidden sm:block absolute left-0 top-full mt-2 bg-[#8A3B12] text-white text-sm px-4 py-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
        {t('templateEditor.resources.tooltip')}
      </div>
      {/* Tooltip for Quick Resources - Mobile */}
      <div className="sm:hidden absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-[#8A3B12] text-white text-xs px-3 py-2 rounded-lg opacity-0 group-active:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg max-w-[200px] text-center">
        {t('templateEditor.resources.tooltipMobile')}
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {filteredResources.map((resource) => {
          const IconComponent = iconMap[resource.icon || 'Box'] || Icons.Box;
          return (
            <motion.div
              key={resource.id}
              className="relative group/item"
            >
              <motion.button
                onClick={() => onAddResource(resource)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-0.5 p-1.5 bg-[#FFF7EA] border border-[#F4C197] rounded-lg hover:border-[#F15A24] transition-colors min-w-[70px] flex-shrink-0"
              >
                <IconComponent className="w-4 h-4 text-[#F15A24]" />
                <span className="text-[10px] font-medium text-[#8A3B12] text-center leading-tight">
                  {resource.label}
                </span>
              </motion.button>
              {/* Tooltip for individual resource */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-[#8A3B12] text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                {resource.description}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Simple Tooltip component
function Tooltip({ content }: { content: string }) {
  return (
    <div className="group relative">
      <HelpCircle className="w-4 h-4 text-[#C05A2B] cursor-help" />
      <div className="absolute left-0 top-6 w-64 p-3 bg-[#8A3B12] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
        {content}
      </div>
    </div>
  );
}

