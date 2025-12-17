import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface MilestoneOption {
  value: string;
  label: string;
}

interface RowColors {
  planned: string;
  actual: string;
  plannedOpacity: number;
  actualOpacity: number;
  subSubtaskOpacity: number;
}

interface CategoryColors {
  dev: string;
  test: string;
  infra: string;
  support: string;
}

interface CategoryOpacity {
  dev: number;
  test: number;
  infra: number;
  support: number;
}

export const useConfig = () => {
  const [milestoneOptions, setMilestoneOptions] = useState<MilestoneOption[]>([
    { value: 'planned', label: 'PLANNED' },
    { value: 'closed', label: 'CLOSED' },
    { value: 'dev-complete', label: 'Dev Complete' },
    { value: 'dev-merge-done', label: 'Dev Merge Done' },
    { value: 'staging-merge-done', label: 'Staging Merge Done' },
    { value: 'prod-merge-done', label: 'Prod Merge Done' },
    { value: 'in-progress', label: 'In progress' }
  ]);

  const [rowColors, setRowColors] = useState<RowColors>({
    planned: '#6366f1',
    actual: '#eab308',
    plannedOpacity: 0.3,
    actualOpacity: 0.3,
    subSubtaskOpacity: 0.2
  });

  const [categoryColors, setCategoryColors] = useState<CategoryColors>({
    dev: '#3b82f6',
    test: '#10b981',
    infra: '#8b5cf6',
    support: '#f97316'
  });

  const [categoryOpacity, setCategoryOpacity] = useState<CategoryOpacity>({
    dev: 0.6,
    test: 0.6,
    infra: 0.6,
    support: 0.6
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data: milestoneData, error: milestoneError } = await supabase
        .from('app_config')
        .select('config_value')
        .eq('config_key', 'milestone_options')
        .maybeSingle();

      const { data: colorData, error: colorError } = await supabase
        .from('app_config')
        .select('config_value')
        .eq('config_key', 'row_colors')
        .maybeSingle();

      const { data: categoryColorData, error: categoryColorError } = await supabase
        .from('app_config')
        .select('config_value')
        .eq('config_key', 'category_colors')
        .maybeSingle();

      const { data: categoryOpacityData, error: categoryOpacityError } = await supabase
        .from('app_config')
        .select('config_value')
        .eq('config_key', 'category_opacity')
        .maybeSingle();

      if (milestoneError || colorError || categoryColorError || categoryOpacityError) {
        console.warn('Unable to load config from database, using defaults:', {
          milestoneError,
          colorError,
          categoryColorError,
          categoryOpacityError
        });
      }

      if (milestoneData) {
        setMilestoneOptions(milestoneData.config_value as MilestoneOption[]);
      }

      if (colorData) {
        setRowColors(colorData.config_value as RowColors);
      }

      if (categoryColorData) {
        setCategoryColors(categoryColorData.config_value as CategoryColors);
      }

      if (categoryOpacityData) {
        setCategoryOpacity(categoryOpacityData.config_value as CategoryOpacity);
      }

      setLoading(false);
    } catch (err) {
      console.warn('Error loading config, using defaults:', err);
      setLoading(false);
    }
  };

  return {
    milestoneOptions,
    rowColors,
    categoryColors,
    categoryOpacity,
    loading,
    refetch: loadConfig
  };
};
