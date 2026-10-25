import React, { useState } from 'react';

/**
 * STORENT 3D Cartoon Illustrations Map
 * Hand-crafted 3D isometric cartoon illustrations matching STORENT's signature
 * Yellow (#FCC837), Dark Grey (#34373C, #222428) and White brand colors.
 */
export const ILLUSTRATION_MAP = {
  'jcb-excavators': '/images/illustrations/jcb-excavator.svg',
  'jcb': '/images/illustrations/jcb-excavator.svg',
  'excavator': '/images/illustrations/jcb-excavator.svg',
  'cranes-lifting': '/images/illustrations/crane.svg',
  'crane': '/images/illustrations/crane.svg',
  'dump-trucks': '/images/illustrations/dump-truck.svg',
  'dump-truck': '/images/illustrations/dump-truck.svg',
  'truck': '/images/illustrations/dump-truck.svg',
  'generators-power': '/images/illustrations/generator.svg',
  'generator': '/images/illustrations/generator.svg',
  'concrete-mixers': '/images/illustrations/concrete-mixer.svg',
  'concrete-mixer': '/images/illustrations/concrete-mixer.svg',
  'forklifts-handling': '/images/illustrations/forklift.svg',
  'forklift': '/images/illustrations/forklift.svg',
  'tractors-farm': '/images/illustrations/tractor.svg',
  'tractor': '/images/illustrations/tractor.svg',
  'tools-compaction': '/images/illustrations/road-roller.svg',
  'road-roller': '/images/illustrations/road-roller.svg',
};

/**
 * Intelligent matcher that analyzes equipment name, brand, model, or category slug
 * and returns the precise matching 3D cartoon illustration URL.
 */
export const getIllustrationForEquipment = (itemOrName, categorySlug = '') => {
  let text = '';
  if (typeof itemOrName === 'string') {
    text = itemOrName;
  } else if (itemOrName && typeof itemOrName === 'object') {
    text = `${itemOrName.name || ''} ${itemOrName.brand || ''} ${itemOrName.model || ''} ${
      itemOrName.categoryId?.name || itemOrName.categoryId?.slug || itemOrName.categorySlug || ''
    }`;
  }
  if (categorySlug) {
    text = `${text} ${categorySlug}`;
  }

  const s = text.toLowerCase();

  // 1. Excavators & JCBs
  if (
    s.includes('jcb') ||
    s.includes('excavat') ||
    s.includes('backhoe') ||
    s.includes('caterpillar 320') ||
    s.includes('cat 320') ||
    s.includes('earthmov') ||
    s.includes('digging') ||
    s.includes('shovel')
  ) {
    return '/images/illustrations/jcb-excavator.svg';
  }

  // 2. Cranes & Lifting
  if (
    s.includes('crane') ||
    s.includes('telescopic') ||
    s.includes('ace 25x') ||
    s.includes('boom') ||
    s.includes('lifting') ||
    s.includes('aerial') ||
    s.includes('hoist')
  ) {
    return '/images/illustrations/crane.svg';
  }

  // 3. Haulage & Dump Trucks
  if (
    s.includes('tipper') ||
    s.includes('dump') ||
    s.includes('haulage') ||
    s.includes('bharatbenz') ||
    s.includes('truck') ||
    s.includes('dumper')
  ) {
    return '/images/illustrations/dump-truck.svg';
  }

  // 4. Silent Diesel Generators
  if (
    s.includes('generator') ||
    s.includes('kirloskar') ||
    s.includes('genset') ||
    s.includes('power') ||
    s.includes('kva') ||
    s.includes('silent')
  ) {
    return '/images/illustrations/generator.svg';
  }

  // 5. Transit Concrete Mixers
  if (
    s.includes('concrete') ||
    s.includes('mixer') ||
    s.includes('cement') ||
    s.includes('transit') ||
    s.includes('schwing') ||
    s.includes('stetter')
  ) {
    return '/images/illustrations/concrete-mixer.svg';
  }

  // 6. Forklifts & Material Handling
  if (
    s.includes('forklift') ||
    s.includes('pallet') ||
    s.includes('stacker') ||
    s.includes('toyota 3-ton') ||
    s.includes('handling')
  ) {
    return '/images/illustrations/forklift.svg';
  }

  // 7. Tractors & Agricultural Machinery
  if (
    s.includes('tractor') ||
    s.includes('mahindra 575') ||
    s.includes('farm') ||
    s.includes('trolley') ||
    s.includes('plow') ||
    s.includes('rotavator')
  ) {
    return '/images/illustrations/tractor.svg';
  }

  // 8. Road Rollers & Compaction Tools
  if (
    s.includes('roller') ||
    s.includes('compaction') ||
    s.includes('compactor') ||
    s.includes('asphalt') ||
    s.includes('drum') ||
    s.includes('jackhammer')
  ) {
    return '/images/illustrations/road-roller.svg';
  }

  // Default to JCB Excavator
  return '/images/illustrations/jcb-excavator.svg';
};

/**
 * Reusable 3D Cartoon Illustration Component with automatic fallback
 */
const EquipmentIllustration = ({
  item,
  name,
  category,
  className = 'w-full h-full object-contain',
  alt = 'STORENT 3D Cartoon Equipment Illustration',
}) => {
  const illustrationSrc = getIllustrationForEquipment(item || name, category);
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-2 select-none overflow-hidden">
      <img
        src={error ? '/images/illustrations/jcb-excavator.svg' : illustrationSrc}
        alt={alt}
        className={`${className} transition-transform duration-500 hover:scale-105`}
        onError={() => setError(true)}
        loading="lazy"
      />
    </div>
  );
};

export default EquipmentIllustration;

