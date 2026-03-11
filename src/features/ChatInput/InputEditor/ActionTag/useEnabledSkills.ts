import isEqual from 'fast-deep-equal';
import { useMemo } from 'react';

import { useToolStore } from '@/store/tool';
import {
  agentSkillsSelectors,
  builtinToolSelectors,
  klavisStoreSelectors,
  lobehubSkillStoreSelectors,
  pluginSelectors,
} from '@/store/tool/selectors';

import type { ActionTagData } from './types';

/**
 * Collects all available skills/tools and returns them as ActionTagData[] for the slash menu.
 */
export const useEnabledSkills = (): ActionTagData[] => {
  // All data sources
  const builtinList = useToolStore(builtinToolSelectors.metaList, isEqual);
  const builtinSkills = useToolStore(builtinToolSelectors.installedBuiltinSkills, isEqual);
  const installedPlugins = useToolStore(pluginSelectors.installedPluginMetaList, isEqual);
  const klavisServers = useToolStore(klavisStoreSelectors.getServers, isEqual);
  const lobehubSkillServers = useToolStore(lobehubSkillStoreSelectors.getServers, isEqual);
  const marketAgentSkills = useToolStore(agentSkillsSelectors.getMarketAgentSkills, isEqual);
  const userAgentSkills = useToolStore(agentSkillsSelectors.getUserAgentSkills, isEqual);

  return useMemo(() => {
    const skills: ActionTagData[] = [];

    // Build a lookup: identifier → display name
    const nameMap = new Map<string, string>();

    for (const item of builtinList) {
      nameMap.set(item.identifier, item.meta?.title || item.identifier);
    }
    for (const item of builtinSkills) {
      nameMap.set(item.identifier, item.name || item.identifier);
    }
    for (const item of installedPlugins) {
      nameMap.set(item.identifier, item.title || item.identifier);
    }
    for (const item of klavisServers) {
      nameMap.set(item.identifier, item.serverName || item.identifier);
    }
    for (const item of lobehubSkillServers) {
      nameMap.set(item.identifier, item.name || item.identifier);
    }
    for (const item of marketAgentSkills) {
      nameMap.set(item.identifier, item.name || item.identifier);
    }
    for (const item of userAgentSkills) {
      nameMap.set(item.identifier, item.name || item.identifier);
    }

    // Collect all available skills (not just enabled ones)
    for (const [id, label] of nameMap) {
      skills.push({ category: 'skill', label, type: id });
    }

    return skills;
  }, [
    builtinList,
    builtinSkills,
    installedPlugins,
    klavisServers,
    lobehubSkillServers,
    marketAgentSkills,
    userAgentSkills,
  ]);
};
